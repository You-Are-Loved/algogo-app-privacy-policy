import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import AnimatedTabBar from '../components/AnimatedTabBar';
import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TermsScreen from '../screens/TermsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProblemScreen from '../screens/ProblemScreen';
import SystemDesignScreen from '../screens/SystemDesignScreen';
import BugFixScreen from '../screens/BugFixScreen';
import TestHomeScreen from '../screens/TestHomeScreen';
import TestBuilderScreen from '../screens/TestBuilderScreen';
import TestSessionScreen from '../screens/TestSessionScreen';
import TestResultsScreen from '../screens/TestResultsScreen';

import { useStore, CURRENT_TERMS_VERSION } from '../store/useStore';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import { ContentType } from '../data/allCategories';
import { ItemOutcome } from '../data/testMode';

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

export type TestStackParamList = {
  TestHome: undefined;
  TestBuilder: { templateId?: string; duplicateFrom?: string } | undefined;
  TestSession: { templateId: string };
  TestResults: { outcomes: ItemOutcome[]; templateName: string };
};

export type RootStackParamList = {
  Terms: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  StudyTab: undefined;
  PracticeTab: undefined;
  TestTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const StudyStack = createNativeStackNavigator<TabStackParamList>();
const PracticeStackNav = createNativeStackNavigator<PracticeStackParamList>();
const TestStackNav = createNativeStackNavigator<TestStackParamList>();

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

function TestStackNavigator() {
  return (
    <TestStackNav.Navigator screenOptions={{ headerShown: false }}>
      <TestStackNav.Screen name="TestHome" component={TestHomeScreen} />
      <TestStackNav.Screen
        name="TestBuilder"
        component={TestBuilderScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <TestStackNav.Screen
        name="TestSession"
        component={TestSessionScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <TestStackNav.Screen
        name="TestResults"
        component={TestResultsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
    </TestStackNav.Navigator>
  );
}

function MainTabs() {
  // Labels, icons, the sliding indicator, and hiding-on-content all live in
  // AnimatedTabBar; the navigator just supplies the routes.
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="StudyTab" component={StudyStackNavigator} />
      <Tab.Screen name="PracticeTab" component={PracticeStackNavigator} />
      <Tab.Screen name="TestTab" component={TestStackNavigator} />
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
