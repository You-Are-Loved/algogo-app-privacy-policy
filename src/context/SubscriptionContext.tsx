import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription, SubscriptionState } from '../hooks/useSubscription';

interface SubscriptionContextType extends SubscriptionState {
  purchase: () => Promise<{ success: boolean; error?: string; mock?: boolean }>;
  restore: () => Promise<{ success: boolean; error?: string; isSubscribed?: boolean }>;
  toggleDevSubscription: () => void;
  productId: string;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscription = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within SubscriptionProvider');
  }
  return context;
}
