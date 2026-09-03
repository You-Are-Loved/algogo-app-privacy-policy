// Live counts derived from the content data files so the paywall copy
// stays accurate without anyone remembering to update strings.

import type { Ionicons } from '@expo/vector-icons';
import { blind75 } from './blind75';
import { systemDesignProblems } from './systemDesign';
import { behavioralQuestions } from './behavioral';
import { bugFixProblems } from './bugFixes';
import { sqlProblems } from './sqlProblems';
import { categories as algorithmCategoryList } from './categories';
import { getAllCategories } from './allCategories';

const allCategories = getAllCategories();

export const contentStats = {
  categories: allCategories.length,
  algorithmPatterns: algorithmCategoryList.length,
  flashcards: allCategories.reduce(
    (n, c) => n + (c.flashcards?.length ?? 0),
    0,
  ),
  quizQuestions: allCategories.reduce(
    (n, c) => n + (c.quizQuestions?.length ?? 0),
    0,
  ),
  algorithmProblems: blind75.length,
  systemDesignProblems: systemDesignProblems.length,
  behavioralPrompts: behavioralQuestions.length,
  bugFixProblems: bugFixProblems.length,
  sqlProblems: sqlProblems.length,
  /** Everything you can type code into and run: debugging + SQL. */
  codingProblems: bugFixProblems.length + sqlProblems.length,
  codingLanguages: ['Python', 'JavaScript', 'Java', 'SQL'],
  // Content groups surfaced as top-level tabs (Algorithms, System Design,
  // iOS, Android, Web, Backend, SQL, C++, CS Fundamentals). Hardcoded because
  // they're hand-curated.
  tracks: 9,
};

export interface PaywallFeature {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

/**
 * Round `value` down to a multiple of `step` and append a `+`, e.g.
 * `54 → "50+"`, `1448 → "1,400+"`. Keeps marketing copy honest without
 * undersell-by-one when content grows.
 */
export function roundedPlus(value: number, step: number): string {
  return `${(Math.floor(value / step) * step).toLocaleString('en-US')}+`;
}

/**
 * Single feature list used by both the onboarding paywall and the
 * tap-a-locked-category UpgradeModal so the two surfaces always agree.
 */
export function getPaywallFeatures(): PaywallFeature[] {
  const s = contentStats;
  return [
    {
      icon: 'lock-open-outline',
      text: `Unlock all ${roundedPlus(s.categories, 10)} categories`,
    },
    {
      icon: 'copy-outline',
      text: `${roundedPlus(s.flashcards, 100)} flashcards across ${s.tracks} tracks`,
    },
    {
      icon: 'code-slash-outline',
      text: `${s.algorithmProblems} algorithm problems — real Python runtime + live visualizations`,
    },
    {
      icon: 'git-network-outline',
      text: `${s.systemDesignProblems} self-grading system-design problems`,
    },
    {
      icon: 'chatbubbles-outline',
      text: `${s.behavioralPrompts} behavioral prompts with notes that save`,
    },
    {
      icon: 'terminal-outline',
      text: `${s.codingProblems} coding challenges in ${s.codingLanguages.join(', ').replace(/, ([^,]*)$/, ' & $1')}`,
    },
    {
      icon: 'timer-outline',
      text: 'Build custom timed mock interviews',
    },
    {
      icon: 'cloud-offline-outline',
      text: 'Everything works fully offline',
    },
  ];
}
