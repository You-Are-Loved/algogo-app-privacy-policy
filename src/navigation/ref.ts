import { createNavigationContainerRef } from '@react-navigation/native';

// Shared so non-screen code (dev demo runner) can navigate.
export const navigationRef = createNavigationContainerRef<any>();
