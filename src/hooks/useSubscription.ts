import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// App Store product IDs.
const MONTHLY_PRODUCT_ID = 'removeads12';
const ANNUAL_PRODUCT_ID = 'annualsub';
const PRO_PRODUCT_IDS = [MONTHLY_PRODUCT_ID, ANNUAL_PRODUCT_ID];

const SUBSCRIPTION_KEY = '@algogo_subscription';
const SUBSCRIPTION_START_KEY = '@algogo_subscription_start';
const GRACE_NOTICE_KEY = '@algogo_grace_notice';

// Apple's page for fixing a failed payment method.
const APPLE_BILLING_URL = 'https://apps.apple.com/account/billing';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export type Plan = 'monthly' | 'annual';

export type IntroOfferMode = 'free-trial' | 'pay-as-you-go' | 'pay-up-front';
export type PeriodUnit = 'day' | 'week' | 'month' | 'year';

export interface IntroOffer {
  mode: IntroOfferMode;
  periodCount: number;       // e.g. 1 (one week)
  periodUnit: PeriodUnit;    // "week", "month", etc.
  display: string;           // "$0.00" for free trial, "$0.99" for discounted intro
  amount: number;
}

export interface ProductInfo {
  id: string;
  display: string;     // Locale-formatted price string e.g. "$2.99"
  amount: number;      // Raw numeric price for math, rounded to cents
  currency: string;
  title: string;
  description: string;
  introOffer: IntroOffer | null;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  products: {
    monthly: ProductInfo | null;
    annual: ProductInfo | null;
  };
  error: string | null;
  connected: boolean;
  /**
   * Non-null while the subscription is in Apple's billing grace period:
   * the last renewal charge failed, Apple is retrying, and the user keeps
   * Pro access until this timestamp (ms epoch). Null when billing is fine.
   */
  gracePeriodEndsAt: number | null;
}

/**
 * expo-iap 3.x returns subscription products with `displayPrice` (locale-formatted)
 * and `price` (raw Number, sometimes "1.9999999998" due to float artifacts). We round
 * price to cents for any math (e.g. discount calc) and prefer displayPrice for UI.
 */
function parseIntroOffer(p: any): IntroOffer | null {
  // expo-iap surfaces the App Store Connect intro offer config as flat
  // `introductoryPrice*IOS` fields. When no offer is configured the
  // paymentMode comes back as "empty".
  const mode = p.introductoryPricePaymentModeIOS;
  if (!mode || mode === 'empty') return null;

  const periodCount = Number.parseInt(p.introductoryPriceNumberOfPeriodsIOS ?? '', 10);
  const periodUnit = p.introductoryPriceSubscriptionPeriodIOS as PeriodUnit;
  if (!periodCount || !periodUnit) return null;

  const amount = Number.parseFloat(p.introductoryPriceAsAmountIOS ?? '0') || 0;
  const display = p.introductoryPriceIOS || `$${amount.toFixed(2)}`;

  if (mode !== 'free-trial' && mode !== 'pay-as-you-go' && mode !== 'pay-up-front') {
    return null;
  }

  return { mode, periodCount, periodUnit, display, amount };
}

function normalizeProduct(p: any): ProductInfo {
  const rawAmount = typeof p.price === 'number'
    ? Math.round(p.price * 100) / 100
    : Number.parseFloat(p.price ?? '0') || 0;
  const display =
    p.displayPrice ||
    p.localizedPrice ||
    (rawAmount > 0 ? `$${rawAmount.toFixed(2)}` : '$0.00');
  return {
    id: p.id || p.productId || p.sku || '',
    display,
    amount: rawAmount,
    currency: p.currency || p.currencyCode || 'USD',
    title: p.title || 'Algogo Pro',
    description: p.description || 'Unlock all categories',
    introOffer: parseIntroOffer(p),
  };
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isLoading: true,
    products: { monthly: null, annual: null },
    error: null,
    connected: false,
    gracePeriodEndsAt: null,
  });

  // Load saved subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const saved = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
        if (saved === 'true') {
          setState(prev => ({ ...prev, isSubscribed: true }));
        }
      } catch (e) {
        // Ignore
      }
    };
    loadSubscription();
  }, []);

  // Save subscription status. Also stamp the first-subscribed timestamp so
  // downstream UX (e.g. rating prompt) can wait a cool-down period.
  const saveSubscription = async (subscribed: boolean) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, subscribed ? 'true' : 'false');
      if (subscribed) {
        const existing = await AsyncStorage.getItem(SUBSCRIPTION_START_KEY);
        if (!existing) {
          await AsyncStorage.setItem(SUBSCRIPTION_START_KEY, String(Date.now()));
        }
      }
    } catch (e) {
      // Ignore
    }
  };

  // Alert once per grace-period episode (keyed by the episode's end date, so
  // a fresh billing issue months later prompts again) that billing failed and
  // access will lapse unless the payment method is fixed.
  const notifyBillingIssueOnce = async (graceEndsAt: number) => {
    try {
      const seen = await AsyncStorage.getItem(GRACE_NOTICE_KEY);
      if (seen === String(graceEndsAt)) return;
      await AsyncStorage.setItem(GRACE_NOTICE_KEY, String(graceEndsAt));
    } catch (e) {
      // If storage fails, still show the alert — worst case it repeats.
    }
    Alert.alert(
      'Payment Issue',
      "There's a billing problem with your Algogo Pro subscription. You still have full access, but please update your payment method to keep it.",
      [
        {
          text: 'Update Payment',
          onPress: () => {
            Linking.openURL(APPLE_BILLING_URL).catch(() => {});
          },
        },
        { text: 'Later', style: 'cancel' },
      ]
    );
  };

  // Use the useIAP hook from expo-iap
  useEffect(() => {
    // In Expo Go or non-iOS, skip initialization
    if (isExpoGo || Platform.OS !== 'ios') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        // Dynamically import expo-iap
        const ExpoIAP = require('expo-iap');

        // Initialize connection
        await ExpoIAP.initConnection();
        setState(prev => ({ ...prev, connected: true }));

        // Helper to finish a transaction safely
        const finishTransactionSafely = async (purchase: any) => {
          try {
            if (ExpoIAP.finishTransaction) {
              await ExpoIAP.finishTransaction({ purchase, isConsumable: false });
              console.log('Transaction finished successfully:', purchase.transactionId);
            }
          } catch (finishError) {
            console.log('Error finishing transaction:', finishError);
            // Still grant access even if finish fails - the transaction will retry
          }
        };

        // Set up purchase listener
        const purchaseListener = ExpoIAP.purchaseUpdatedListener(async (purchase: any) => {
          console.log('Purchase updated:', purchase);
          if (PRO_PRODUCT_IDS.includes(purchase.productId)) {
            // Always finish the transaction first
            await finishTransactionSafely(purchase);

            // Then update state
            setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
            saveSubscription(true);
          }
        });

        // Set up error listener
        const errorListener = ExpoIAP.purchaseErrorListener((error: any) => {
          console.log('Purchase error:', error);
          setState(prev => ({ ...prev, isLoading: false }));

          // Don't show alert for expected/recoverable errors
          const silentErrors = [
            'user-cancelled',
            'E_USER_CANCELLED',
            'SKErrorPaymentCancelled',
            'E_ALREADY_OWNED',
            'E_ITEM_UNAVAILABLE',
          ];

          const errorCode = error?.code || error?.responseCode?.toString() || '';
          const errorMessage = error?.message || '';

          const shouldSilence = silentErrors.some(code =>
            errorCode.includes(code) || errorMessage.toLowerCase().includes('cancel')
          );

          if (!shouldSilence) {
            Alert.alert('Purchase Error', errorMessage || 'An error occurred. Please try again.');
          }
        });

        cleanup = () => {
          purchaseListener?.remove();
          errorListener?.remove();
          if (ExpoIAP.endConnection) {
            ExpoIAP.endConnection();
          }
        };

        // Fetch subscription products
        try {
          const products = await ExpoIAP.fetchProducts({
            skus: PRO_PRODUCT_IDS,
            type: 'subs',
          });

          console.log('Fetched products:', products);

          if (products && products.length > 0) {
            const next: { monthly: ProductInfo | null; annual: ProductInfo | null } = {
              monthly: null,
              annual: null,
            };
            for (const p of products) {
              const info = normalizeProduct(p);
              if (info.id === MONTHLY_PRODUCT_ID) next.monthly = info;
              else if (info.id === ANNUAL_PRODUCT_ID) next.annual = info;
            }
            setState(prev => ({ ...prev, products: next, isLoading: false }));
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          console.log('Fetch products error:', e);
          setState(prev => ({ ...prev, isLoading: false }));
        }

        // Clear any pending transactions first (important for App Store review)
        try {
          const pendingPurchases = await ExpoIAP.getPendingPurchases?.() || [];
          console.log('Pending purchases to clear:', pendingPurchases.length);

          for (const purchase of pendingPurchases) {
            console.log('Finishing pending transaction:', purchase.transactionId);
            await finishTransactionSafely(purchase);

            // If it's one of our products, grant access
            if (PRO_PRODUCT_IDS.includes(purchase.productId)) {
              setState(prev => ({ ...prev, isSubscribed: true }));
              saveSubscription(true);
            }
          }
        } catch (e) {
          console.log('Clear pending purchases error:', e);
        }

        // Check for existing purchases - this is the source of truth for subscription status
        try {
          const purchases = await ExpoIAP.getAvailablePurchases();
          console.log('Available purchases:', purchases);

          const hasActiveSubscription = purchases?.some(
            (purchase: any) => PRO_PRODUCT_IDS.includes(purchase.productId)
          );

          // In dev, don't downgrade an existing locally-set sub flag to false
          // when Apple returns no products (simulator has no Apple ID signed in).
          if (__DEV__ && !hasActiveSubscription) {
            console.log('[dev] Skipping Apple-side sub override; keeping local flag');
          } else {
            setState(prev => ({ ...prev, isSubscribed: hasActiveSubscription }));
            saveSubscription(hasActiveSubscription);

            if (!hasActiveSubscription) {
              console.log('No active subscription found - trial/subscription may have expired');
            }
          }
        } catch (e) {
          console.log('Get purchases error:', e);
        }

        // Billing grace period: StoreKit keeps grace-period subs in
        // currentEntitlements, so the check above already preserves Pro
        // access. Here we detect that state so we can nudge the user to fix
        // their payment method before the grace period ends and access lapses.
        try {
          const activeSubs = await ExpoIAP.getActiveSubscriptions(PRO_PRODUCT_IDS);
          const graceSub = activeSubs?.find((sub: any) => {
            const end = sub?.renewalInfoIOS?.gracePeriodExpirationDate;
            return typeof end === 'number' && end > Date.now();
          });
          const graceEndsAt =
            graceSub?.renewalInfoIOS?.gracePeriodExpirationDate ?? null;
          setState(prev => ({ ...prev, gracePeriodEndsAt: graceEndsAt }));
          if (graceEndsAt) {
            console.log(
              'Subscription in billing grace period until',
              new Date(graceEndsAt).toISOString()
            );
            notifyBillingIssueOnce(graceEndsAt);
          }
        } catch (e) {
          console.log('Grace period check error:', e);
        }
      } catch (error: any) {
        console.log('IAP init error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error?.message || 'Failed to initialize IAP',
        }));
      }
    };

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // Purchase subscription. Pass 'annual' or 'monthly' to pick a plan.
  const purchase = useCallback(async (plan: Plan = 'annual') => {
    // If IAP not available, show error
    if (isExpoGo || Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'In-app purchases are only available on iOS devices.');
      return { success: false, error: 'IAP not available' };
    }

    const sku = plan === 'annual' ? ANNUAL_PRODUCT_ID : MONTHLY_PRODUCT_ID;

    try {
      const ExpoIAP = require('expo-iap');

      setState(prev => ({ ...prev, isLoading: true }));

      // Request purchase using the correct format from docs
      await ExpoIAP.requestPurchase({
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
        type: 'subs',
      });

      // Purchase result comes through the listener
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));

      const errorCode = error?.code || '';
      const errorMessage = error?.message || '';

      // User cancelled is not an error
      if (
        errorCode === 'user-cancelled' ||
        errorCode === 'E_USER_CANCELLED' ||
        errorMessage.toLowerCase().includes('cancel')
      ) {
        return { success: false, cancelled: true };
      }

      // Already owned - treat as success
      if (errorCode === 'E_ALREADY_OWNED' || errorMessage.includes('already owned')) {
        setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
        saveSubscription(true);
        return { success: true };
      }

      Alert.alert('Purchase Failed', errorMessage || 'Unable to complete purchase. Please try again.');
      return { success: false, error: errorMessage };
    }
  }, []);

  // Restore purchases
  const restore = useCallback(async () => {
    if (isExpoGo || Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Restore is only available on iOS devices.');
      return { success: false, error: 'IAP not available' };
    }

    try {
      const ExpoIAP = require('expo-iap');

      setState(prev => ({ ...prev, isLoading: true }));

      // Try restorePurchases first (recommended method)
      if (ExpoIAP.restorePurchases) {
        await ExpoIAP.restorePurchases();
      }

      // Then get available purchases
      const purchases = await ExpoIAP.getAvailablePurchases();
      console.log('Restored purchases:', purchases);

      const hasPro = purchases?.some(
        (purchase: any) => PRO_PRODUCT_IDS.includes(purchase.productId)
      );

      setState(prev => ({
        ...prev,
        isSubscribed: hasPro,
        isLoading: false,
      }));

      saveSubscription(hasPro);

      if (hasPro) {
        Alert.alert('Restored!', 'Your purchase has been restored.');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }

      return { success: true, isSubscribed: hasPro };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      Alert.alert('Restore Failed', error?.message || 'Unable to restore purchases');
      return { success: false, error: error?.message };
    }
  }, []);

  // Toggle subscription in dev mode (for testing)
  const toggleDevSubscription = useCallback(() => {
    const newValue = !state.isSubscribed;
    setState(prev => ({ ...prev, isSubscribed: newValue }));
    saveSubscription(newValue);
  }, [state.isSubscribed]);

  return {
    ...state,
    purchase,
    restore,
    toggleDevSubscription,
    monthlyProductId: MONTHLY_PRODUCT_ID,
    annualProductId: ANNUAL_PRODUCT_ID,
  };
}

/**
 * Round-to-percent savings of an annual sub vs paying the monthly price 12×.
 * Returns null only when a price is missing — caller can render the number
 * directly. Clamped to 0 so "annual costs more than monthly×12" doesn't
 * surface a negative discount (happens when the monthly price hasn't caught
 * up to a recently-raised tier).
 */
export function computeAnnualDiscount(
  monthlyAmount?: number,
  annualAmount?: number
): number | null {
  if (!monthlyAmount || !annualAmount) return null;
  if (monthlyAmount <= 0 || annualAmount <= 0) return null;
  const yearlyAtMonthly = monthlyAmount * 12;
  return Math.max(0, Math.round((1 - annualAmount / yearlyAtMonthly) * 100));
}

/**
 * Format a numeric monthly-equivalent of an annual price in the same currency
 * format as the StoreKit display string. Falls back to "$x.xx" if we can't
 * infer the leading symbol.
 */
export function formatMonthlyEquivalent(annual: ProductInfo | null): string | null {
  if (!annual || annual.amount <= 0) return null;
  const monthly = annual.amount / 12;
  // Try to extract leading non-digit symbol(s) from the display string ("$", "€", "£", "CA$").
  const match = annual.display.match(/^([^\d]+)/);
  const symbol = match?.[1] ?? '$';
  return `${symbol}${monthly.toFixed(2)}`;
}

/**
 * Human-readable intro duration, e.g. "7-day", "3-month". Apple lets devs
 * pick a "1 week" intro length — normalize to "7-day" since that's the
 * convention users see in App Store screenshots.
 */
export function formatIntroDuration(offer: IntroOffer): string {
  const { periodCount, periodUnit } = offer;
  if (periodUnit === 'week') {
    return `${periodCount * 7}-day`;
  }
  return `${periodCount}-${periodUnit}`;
}

/**
 * Natural-language length of an intro period, for sentence-style copy:
 * "month", "3 months", "7 days". Used by the paywall for paid intro offers
 * (pay-up-front / pay-as-you-go) where "$0.99 for your first month" reads
 * better than the hyphenated screenshot convention formatIntroDuration uses.
 */
export function formatIntroPeriod(offer: IntroOffer): string {
  const { periodCount, periodUnit } = offer;
  if (periodUnit === 'week') {
    const days = periodCount * 7;
    return days === 1 ? '1 day' : `${days} days`;
  }
  return periodCount === 1 ? periodUnit : `${periodCount} ${periodUnit}s`;
}
