// Build-time feature flags. Flip here, ship, done.
export const FLAGS = {
  /**
   * New fullscreen swipe onboarding (OnboardingCarouselScreen) instead of the
   * original step-by-step flow (OnboardingScreen). Both stay in the tree so
   * this can be reverted without a code change beyond this line.
   */
  newOnboarding: true,
} as const;
