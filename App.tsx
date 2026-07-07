import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import { useStore } from './src/store/useStore';
import { colors } from './src/theme';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import AnimatedSplash from './src/components/AnimatedSplash';

function AppContent() {
  const { user, isLoading, initGuestUser, setLoading } = useStore();
  const hasSeenSplash = useStore((s) => s.hasSeenSplash);
  const markSplashSeen = useStore((s) => s.markSplashSeen);

  // Wait for the persisted store to rehydrate before deciding whether to play
  // the splash, so returning users (who've already seen it once) never see the
  // animation again — regardless of subscription or onboarding state.
  const [hydrated, setHydrated] = useState(() => useStore.persist.hasHydrated());
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    if (!user) {
      initGuestUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hydrated) return;
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  // Hold a plain white field until hydration resolves — momentary, and it
  // matches both the native launch screen and the splash so there's no flash.
  if (!hydrated) {
    return <View style={styles.preHydrate} />;
  }

  const content =
    isLoading && !user ? (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingEmoji}>🧠</Text>
        </View>
        <Text style={styles.loadingText}>Loading Algogo...</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    ) : (
      <Navigation />
    );

  return (
    <View style={{ flex: 1 }}>
      {content}
      {!hasSeenSplash && !splashGone && (
        <AnimatedSplash
          onDone={() => {
            markSplashSeen();
            setSplashGone(true);
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SubscriptionProvider>
          <StatusBar style="dark" />
          <AppContent />
        </SubscriptionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  preHydrate: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingEmoji: {
    fontSize: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
});
