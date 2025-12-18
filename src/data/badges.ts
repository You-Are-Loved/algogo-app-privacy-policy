import { Badge } from '../types';

export const badges: Badge[] = [
  // Learning Badges
  {
    id: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first learn section',
    icon: 'Footprints',
    type: 'learn',
    requirement: { action: 'complete_learn', value: 1 }
  },
  {
    id: 'pattern-master',
    name: 'Pattern Master',
    description: 'Complete all algorithm pattern learn sections',
    icon: 'Brain',
    type: 'learn',
    requirement: { action: 'complete_learn', value: 14 }
  },
  {
    id: 'full-stack-learner',
    name: 'Full Stack Learner',
    description: 'Complete all learn sections including web, iOS, and Android',
    icon: 'GraduationCap',
    type: 'learn',
    requirement: { action: 'all_categories' }
  },

  // Flashcard Badges
  {
    id: 'card-starter',
    name: 'Card Starter',
    description: 'Review 10 flashcards',
    icon: 'Layers',
    type: 'cards',
    requirement: { action: 'complete_cards', value: 10 }
  },
  {
    id: 'card-enthusiast',
    name: 'Card Enthusiast',
    description: 'Review 50 flashcards',
    icon: 'Layers',
    type: 'cards',
    requirement: { action: 'complete_cards', value: 50 }
  },
  {
    id: 'card-master',
    name: 'Card Master',
    description: 'Review 200 flashcards',
    icon: 'Crown',
    type: 'cards',
    requirement: { action: 'complete_cards', value: 200 }
  },

  // Quiz Badges
  {
    id: 'quiz-beginner',
    name: 'Quiz Taker',
    description: 'Complete your first quiz',
    icon: 'ClipboardCheck',
    type: 'quiz',
    requirement: { action: 'quiz_pass', value: 1 }
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: 'Star',
    type: 'quiz',
    requirement: { action: 'quiz_perfect', value: 1 }
  },
  {
    id: 'quiz-champion',
    name: 'Quiz Champion',
    description: 'Get 100% on 5 different quizzes',
    icon: 'Trophy',
    type: 'quiz',
    requirement: { action: 'quiz_perfect', value: 5 }
  },

  // Streak Badges
  {
    id: 'streak-3',
    name: 'On Fire',
    description: 'Study for 3 days in a row',
    icon: 'Flame',
    type: 'special',
    requirement: { action: 'streak', value: 3 }
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: 'Zap',
    type: 'special',
    requirement: { action: 'streak', value: 7 }
  },
  {
    id: 'streak-30',
    name: 'Unstoppable',
    description: 'Study for 30 days in a row',
    icon: 'Rocket',
    type: 'special',
    requirement: { action: 'streak', value: 30 }
  },

  // Category-specific badges
  {
    id: 'sliding-window-master',
    name: 'Window Slider',
    description: 'Master the Sliding Window pattern',
    icon: 'Layers',
    type: 'special',
    requirement: { categoryId: 'sliding-window', action: 'quiz_perfect' }
  },
  {
    id: 'two-pointers-master',
    name: 'Pointer Pro',
    description: 'Master the Two Pointers pattern',
    icon: 'GitCompare',
    type: 'special',
    requirement: { categoryId: 'two-pointers', action: 'quiz_perfect' }
  },
  {
    id: 'tree-master',
    name: 'Tree Hugger',
    description: 'Master both Tree BFS and DFS',
    icon: 'TreeDeciduous',
    type: 'special',
    requirement: { categoryId: 'tree-bfs', action: 'quiz_perfect' }
  },
  {
    id: 'system-design-master',
    name: 'Architect',
    description: 'Master System Design concepts',
    icon: 'Building2',
    type: 'special',
    requirement: { categoryId: 'system-design', action: 'quiz_perfect' }
  }
];

export const getBadgeById = (id: string): Badge | undefined => {
  return badges.find(badge => badge.id === id);
};
