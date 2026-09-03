// Flattened quiz bank — every quiz question across all study tracks (the same
// questions used by Quiz mode under Learn), addressable by a stable id so the
// mock-interview builder can sample them.

import { getCategoriesByType, ContentType } from './allCategories';
import { QuizQuestion } from '../types';

export interface QuizBankItem extends QuizQuestion {
  /** `${contentType}/${categorySlug}/${question.id}` — stable across builds. */
  bankId: string;
  /** Track display name — used as the topic filter in test mode. */
  track: string;
  categoryName: string;
}

const TRACKS: { type: ContentType; label: string }[] = [
  { type: 'algorithms', label: 'Algorithms' },
  { type: 'system-design', label: 'System Design' },
  { type: 'ios', label: 'iOS' },
  { type: 'android', label: 'Android' },
  { type: 'web', label: 'Web' },
  { type: 'backend', label: 'Backend' },
  { type: 'sql', label: 'SQL' },
  { type: 'cpp', label: 'C++' },
  { type: 'cs', label: 'CS Fundamentals' },
];

export const quizBank: QuizBankItem[] = TRACKS.flatMap(({ type, label }) =>
  getCategoriesByType(type).flatMap((cat) =>
    cat.quizQuestions.map((q) => ({
      ...q,
      bankId: `${type}/${cat.slug}/${q.id}`,
      track: label,
      categoryName: cat.name,
    })),
  ),
);

/** Track labels in display order — the quiz section's "topics". */
export const QUIZ_TRACKS: string[] = TRACKS.map((t) => t.label);

export const getQuizBankItem = (bankId: string): QuizBankItem | undefined =>
  quizBank.find((q) => q.bankId === bankId);
