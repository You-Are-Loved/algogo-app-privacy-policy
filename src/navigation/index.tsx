import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TermsScreen from '../screens/TermsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

import { useStore, CURRENT_TERMS_VERSION } from '../store/useStore';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { colors } from '../theme';
import { ContentType } from '../data/allCategories';

// Stack param lists for each tab
export type TabStackParamList = {
  Home: { contentType: ContentType };
  Category: { slug: string };
};

export type RootStackParamList = {
  Terms: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

// Tab param list
export type TabParamList = {
  AlgorithmsTab: undefined;
  SystemDesignTab: undefined;
  iOSTab: undefined;
  AndroidTab: undefined;
  WebTab: undefined;
  BackendTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const TabStack = createNativeStackNavigator<TabStackParamList>();

// Create stack navigator for each tab
function AlgorithmsStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'algorithms' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function SystemDesignStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'system-design' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function IOSStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'ios' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function AndroidStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'android' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function WebStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'web' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function BackendStack() {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ contentType: 'backend' }}
      />
      <TabStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </TabStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 85,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="AlgorithmsTab"
        component={AlgorithmsStack}
        options={{
          tabBarLabel: 'Algo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-slash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SystemDesignTab"
        component={SystemDesignStack}
        options={{
          tabBarLabel: 'System',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="iOSTab"
        component={IOSStack}
        options={{
          tabBarLabel: 'iOS',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="phone-portrait-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AndroidTab"
        component={AndroidStack}
        options={{
          tabBarLabel: 'Android',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="tablet-portrait-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WebTab"
        component={WebStack}
        options={{
          tabBarLabel: 'Web',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BackendTab"
        component={BackendStack}
        options={{
          tabBarLabel: 'Backend',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="server-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { acceptedTermsVersion, hasSeenOnboarding } = useStore();
  const { isSubscribed } = useSubscriptionContext();
  const needsTermsAcceptance = acceptedTermsVersion < CURRENT_TERMS_VERSION;
  const needsOnboarding = !hasSeenOnboarding && !isSubscribed;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {needsTermsAcceptance ? (
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ animation: 'fade' }}
          />
        ) : needsOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: 'fade' }}
          />
        ) : (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
