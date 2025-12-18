import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import { useStore } from './src/store/useStore';
import { colors } from './src/theme';
import { SubscriptionProvider } from './src/context/SubscriptionContext';

function AppContent() {
  const { user, isLoading, initGuestUser, setLoading } = useStore();

  useEffect(() => {
    if (!user) {
      initGuestUser();
    } else {
      setLoading(false);
    }
  }, []);

  if (isLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Text style={styles.loadingEmoji}>🧠</Text>
        </View>
        <Text style={styles.loadingText}>Loading Algogo...</Text>
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return <Navigation />;
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
