import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your App Store product ID
const PRODUCT_ID = 'removeads12';
const SUBSCRIPTION_KEY = '@algogo_subscription';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export interface SubscriptionState {
  isSubscribed: boolean;
  isLoading: boolean;
  product: any | null;
  error: string | null;
  connected: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    isLoading: true,
    product: null,
    error: null,
    connected: false,
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

  // Save subscription status
  const saveSubscription = async (subscribed: boolean) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_KEY, subscribed ? 'true' : 'false');
    } catch (e) {
      // Ignore
    }
  };

  // Use the useIAP hook from expo-iap
  useEffect(() => {
    // In Expo Go or non-iOS, skip initialization
    if (isExpoGo || Platform.OS !== 'ios') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let iapHook: any = null;
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
          if (purchase.productId === PRODUCT_ID) {
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
            skus: [PRODUCT_ID],
            type: 'subs',
          });

          console.log('Fetched products:', products);

          if (products && products.length > 0) {
            const p = products[0];
            setState(prev => ({
              ...prev,
              product: {
                price: p.localizedPrice || p.price || '$0.99/year',
                title: p.title || 'Remove Ads',
                description: p.description || 'Ad-free experience',
              },
              isLoading: false,
            }));
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

            // If it's our product, grant access
            if (purchase.productId === PRODUCT_ID) {
              setState(prev => ({ ...prev, isSubscribed: true }));
              saveSubscription(true);
            }
          }
        } catch (e) {
          console.log('Clear pending purchases error:', e);
        }

        // Check for existing purchases
        try {
          const purchases = await ExpoIAP.getAvailablePurchases();
          console.log('Available purchases:', purchases);

          const hasRemoveAds = purchases?.some(
            (purchase: any) => purchase.productId === PRODUCT_ID
          );
          if (hasRemoveAds) {
            setState(prev => ({ ...prev, isSubscribed: true }));
            saveSubscription(true);
          }
        } catch (e) {
          console.log('Get purchases error:', e);
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

  // Purchase subscription
  const purchase = useCallback(async () => {
    // If IAP not available, show error
    if (isExpoGo || Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'In-app purchases are only available on iOS devices.');
      return { success: false, error: 'IAP not available' };
    }

    try {
      const ExpoIAP = require('expo-iap');

      setState(prev => ({ ...prev, isLoading: true }));

      // Request purchase using the correct format from docs
      await ExpoIAP.requestPurchase({
        request: {
          apple: { sku: PRODUCT_ID },
          google: { skus: [PRODUCT_ID] },
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

      const hasRemoveAds = purchases?.some(
        (purchase: any) => purchase.productId === PRODUCT_ID
      );

      setState(prev => ({
        ...prev,
        isSubscribed: hasRemoveAds,
        isLoading: false,
      }));

      saveSubscription(hasRemoveAds);

      if (hasRemoveAds) {
        Alert.alert('Restored!', 'Your purchase has been restored.');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }

      return { success: true, isSubscribed: hasRemoveAds };
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
    productId: PRODUCT_ID,
  };
}
