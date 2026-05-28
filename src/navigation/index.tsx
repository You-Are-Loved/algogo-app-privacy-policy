import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TermsScreen from '../screens/TermsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProblemScreen from '../screens/ProblemScreen';
import SystemDesignScreen from '../screens/SystemDesignScreen';
import BugFixScreen from '../screens/BugFixScreen';

import { useStore, CURRENT_TERMS_VERSION } from '../store/useStore';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { colors } from '../theme';
import { ContentType } from '../data/allCategories';

// Stack param lists
export type TabStackParamList = {
  Home: { contentType?: ContentType };
  Category: { slug: string };
};

export type PracticeStackParamList = {
  PracticeList: undefined;
  Problem: { problemId: string };
  SystemDesign: { problemId: string };
  BugFix: { problemId: string };
};

export type RootStackParamList = {
  Terms: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  StudyTab: undefined;
  PracticeTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const StudyStack = createNativeStackNavigator<TabStackParamList>();
const PracticeStackNav = createNativeStackNavigator<PracticeStackParamList>();

function StudyStackNavigator() {
  return (
    <StudyStack.Navigator screenOptions={{ headerShown: false }}>
      <StudyStack.Screen name="Home" component={HomeScreen} />
      <StudyStack.Screen
        name="Category"
        component={CategoryScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </StudyStack.Navigator>
  );
}

function PracticeStackNavigator() {
  return (
    <PracticeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <PracticeStackNav.Screen name="PracticeList" component={PracticeScreen} />
      <PracticeStackNav.Screen
        name="Problem"
        component={ProblemScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <PracticeStackNav.Screen
        name="SystemDesign"
        component={SystemDesignScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <PracticeStackNav.Screen
        name="BugFix"
        component={BugFixScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </PracticeStackNav.Navigator>
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
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="StudyTab"
        component={StudyStackNavigator}
        options={{
          tabBarLabel: 'Study',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeStackNavigator}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-slash-outline" size={size} color={color} />
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {needsTermsAcceptance ? (
          <Stack.Screen name="Terms" component={TermsScreen} options={{ animation: 'fade' }} />
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
