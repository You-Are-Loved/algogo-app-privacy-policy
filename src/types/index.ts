export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LearnSection {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  colorDark: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  learnContent: LearnSection[];
  premium?: boolean; // Requires subscription to access
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'learn' | 'cards' | 'quiz' | 'special';
  requirement: {
    categoryId?: string;
    action: 'complete_learn' | 'complete_cards' | 'quiz_perfect' | 'quiz_pass' | 'streak' | 'all_categories';
    value?: number;
  };
}

export interface CategoryProgress {
  learnCompleted: boolean;
  reviewedCardIds: string[];
  viewedLearnSectionIds: string[];
  totalCards: number;
  quizHighScore: number;
  quizAttempts: number;
  lastStudied: string | null;
}

export interface UserProgress {
  oduid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  categories: {
    [categoryId: string]: CategoryProgress;
  };
  badges: string[];
  totalXP: number;
  streak: number;
  lastStudyDate: string | null;
}
