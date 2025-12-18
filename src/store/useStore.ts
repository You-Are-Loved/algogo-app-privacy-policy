import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, CategoryProgress } from '../types';
import { categories } from '../data/categories';

interface AppState {
  user: UserProgress | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAcceptedTerms: boolean;

  setUser: (user: UserProgress | null) => void;
  setLoading: (loading: boolean) => void;
  acceptTerms: () => void;

  completeLearn: (categoryId: string) => void;
  viewLearnSection: (categoryId: string, sectionId: string) => void;
  reviewCard: (categoryId: string, cardId: string) => void;
  completeQuiz: (categoryId: string, score: number, total: number) => void;
  addBadge: (badgeId: string) => void;
  updateStreak: () => void;
  addXP: (amount: number) => void;

  initGuestUser: () => void;

  getCategoryProgress: (categoryId: string) => CategoryProgress;
  getTotalCardsReviewed: () => number;
  getTotalLearnCompleted: () => number;
  getTotalPerfectQuizzes: () => number;
}

const defaultCategoryProgress: CategoryProgress = {
  learnCompleted: false,
  reviewedCardIds: [],
  viewedLearnSectionIds: [],
  totalCards: 0,
  quizHighScore: 0,
  quizAttempts: 0,
  lastStudied: null,
};

const createDefaultProgress = (): { [key: string]: CategoryProgress } => {
  const progress: { [key: string]: CategoryProgress } = {};
  categories.forEach(cat => {
    progress[cat.id] = { ...defaultCategoryProgress, totalCards: cat.flashcards.length };
  });
  return progress;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasAcceptedTerms: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      acceptTerms: () => set({ hasAcceptedTerms: true }),

      initGuestUser: () => {
        const guestUser: UserProgress = {
          oduid: 'guest',
          email: null,
          displayName: 'Guest Learner',
          photoURL: null,
          categories: createDefaultProgress(),
          badges: [],
          totalXP: 0,
          streak: 0,
          lastStudyDate: null,
        };
        set({ user: guestUser, isAuthenticated: true, isLoading: false });
      },

      completeLearn: (categoryId) => {
        const { user } = get();
        if (!user) return;

        const categoryProgress = user.categories[categoryId] || { ...defaultCategoryProgress };
        const wasCompleted = categoryProgress.learnCompleted;

        set({
          user: {
            ...user,
            categories: {
              ...user.categories,
              [categoryId]: {
                ...categoryProgress,
                learnCompleted: true,
                lastStudied: new Date().toISOString(),
              },
            },
            totalXP: user.totalXP + (wasCompleted ? 0 : 50),
          },
        });

        get().updateStreak();
      },

      viewLearnSection: (categoryId, sectionId) => {
        const { user } = get();
        if (!user) return;

        const categoryProgress = user.categories[categoryId] || { ...defaultCategoryProgress };
        const viewedSectionIds = categoryProgress.viewedLearnSectionIds || [];

        // Only add if not already viewed
        if (viewedSectionIds.includes(sectionId)) return;

        set({
          user: {
            ...user,
            categories: {
              ...user.categories,
              [categoryId]: {
                ...categoryProgress,
                viewedLearnSectionIds: [...viewedSectionIds, sectionId],
              },
            },
          },
        });
      },

      reviewCard: (categoryId, cardId) => {
        const { user } = get();
        if (!user) return;

        const categoryProgress = user.categories[categoryId] || { ...defaultCategoryProgress };
        const reviewedCardIds = categoryProgress.reviewedCardIds || [];

        // Only add if not already reviewed
        if (reviewedCardIds.includes(cardId)) return;

        set({
          user: {
            ...user,
            categories: {
              ...user.categories,
              [categoryId]: {
                ...categoryProgress,
                reviewedCardIds: [...reviewedCardIds, cardId],
                lastStudied: new Date().toISOString(),
              },
            },
            totalXP: user.totalXP + 5,
          },
        });

        get().updateStreak();
      },

      completeQuiz: (categoryId, score, total) => {
        const { user } = get();
        if (!user) return;

        const categoryProgress = user.categories[categoryId] || { ...defaultCategoryProgress };
        const percentage = Math.round((score / total) * 100);
        const isPerfect = percentage === 100;
        const isNewHighScore = percentage > categoryProgress.quizHighScore;

        let xpEarned = Math.round(score * 10);
        if (isPerfect) xpEarned += 50;
        if (isNewHighScore) xpEarned += 25;

        set({
          user: {
            ...user,
            categories: {
              ...user.categories,
              [categoryId]: {
                ...categoryProgress,
                quizHighScore: Math.max(categoryProgress.quizHighScore, percentage),
                quizAttempts: categoryProgress.quizAttempts + 1,
                lastStudied: new Date().toISOString(),
              },
            },
            totalXP: user.totalXP + xpEarned,
          },
        });

        get().updateStreak();
      },

      addBadge: (badgeId) => {
        const { user } = get();
        if (!user || user.badges.includes(badgeId)) return;

        set({
          user: {
            ...user,
            badges: [...user.badges, badgeId],
            totalXP: user.totalXP + 100,
          },
        });
      },

      updateStreak: () => {
        const { user } = get();
        if (!user) return;

        const today = new Date().toDateString();
        const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;

        if (lastStudy === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastStudy === yesterday.toDateString();

        set({
          user: {
            ...user,
            streak: isConsecutive ? user.streak + 1 : 1,
            lastStudyDate: new Date().toISOString(),
          },
        });
      },

      addXP: (amount) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            totalXP: user.totalXP + amount,
          },
        });
      },

      getCategoryProgress: (categoryId) => {
        const { user } = get();
        if (!user) return { ...defaultCategoryProgress };
        return user.categories[categoryId] || { ...defaultCategoryProgress };
      },

      getTotalCardsReviewed: () => {
        const { user } = get();
        if (!user) return 0;
        return Object.values(user.categories).reduce((sum, cat) => sum + (cat.reviewedCardIds?.length || 0), 0);
      },

      getTotalLearnCompleted: () => {
        const { user } = get();
        if (!user) return 0;
        return Object.values(user.categories).filter(cat => cat.learnCompleted).length;
      },

      getTotalPerfectQuizzes: () => {
        const { user } = get();
        if (!user) return 0;
        return Object.values(user.categories).filter(cat => cat.quizHighScore === 100).length;
      },
    }),
    {
      name: 'algogo-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, hasAcceptedTerms: state.hasAcceptedTerms }),
    }
  )
);
