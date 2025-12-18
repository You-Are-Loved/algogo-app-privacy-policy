import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CategoryScreen from '../screens/CategoryScreen';
import TermsScreen from '../screens/TermsScreen';

import { useStore } from '../store/useStore';

export type RootStackParamList = {
  Terms: undefined;
  Home: undefined;
  Category: { slug: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { hasAcceptedTerms } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!hasAcceptedTerms ? (
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{
              animation: 'fade',
            }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="Category"
              component={CategoryScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
