// Flat index of every practice problem, used by search and completion badges.
import { Ionicons } from '@expo/vector-icons';
import { blind75, Difficulty } from './blind75';
import { systemDesignProblems } from './systemDesign';
import { codeProblemsForTrack, CodeTrack } from './bugFixes';
import { sqlProblems } from './sqlProblems';
import { reactProblems } from './reactProblems';

/** Screen a problem opens in; also namespaces completion keys so ids can't collide across tracks. */
export type ProblemRoute = 'Problem' | 'SystemDesign' | 'BugFix' | 'SqlProblem' | 'ReactProblem';

export type PracticeCategoryKey =
  | 'algorithms'
  | 'system-design'
  | 'react'
  | 'javascript'
  | 'swift'
  | 'kotlin'
  | 'node'
  | 'python'
  | 'java'
  | 'sql';

export interface PracticeCategoryMeta {
  key: PracticeCategoryKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const PRACTICE_CATEGORIES: PracticeCategoryMeta[] = [
  { key: 'algorithms', label: 'Algorithms', icon: 'code-slash-outline', color: '#8B5CF6' },
  { key: 'system-design', label: 'System Design', icon: 'server-outline', color: '#636E72' },
  { key: 'react', label: 'React', icon: 'logo-react', color: '#0EA5E9' },
  { key: 'javascript', label: 'JavaScript', icon: 'logo-javascript', color: '#C9A800' },
  { key: 'swift', label: 'Swift', icon: 'phone-portrait-outline', color: '#F05138' },
  { key: 'kotlin', label: 'Kotlin', icon: 'tablet-portrait-outline', color: '#7F52FF' },
  { key: 'node', label: 'Node.js', icon: 'logo-nodejs', color: '#3C873A' },
  { key: 'python', label: 'Python', icon: 'logo-python', color: '#3776AB' },
  { key: 'java', label: 'Java', icon: 'cafe-outline', color: '#ED8B00' },
  { key: 'sql', label: 'SQL', icon: 'grid-outline', color: '#336791' },
];

export const categoryMeta = (key: PracticeCategoryKey): PracticeCategoryMeta =>
  PRACTICE_CATEGORIES.find((c) => c.key === key)!;

export interface PracticeItem {
  key: string; // completion key
  id: string;
  number: number;
  title: string;
  topic: string;
  difficulty?: Difficulty;
  category: PracticeCategoryKey;
  route: ProblemRoute;
  /** Lower-cased haystack for search. */
  haystack: string;
}

export const problemKey = (route: ProblemRoute, id: string) => `${route}:${id}`;

const CODE_TRACKS: (PracticeCategoryKey & CodeTrack)[] = ['javascript', 'swift', 'kotlin', 'node', 'python', 'java'];

function build(): PracticeItem[] {
  const out: PracticeItem[] = [];
  const push = (
    route: ProblemRoute,
    category: PracticeCategoryKey,
    p: { id: string; number: number; title: string; topic: string; difficulty?: Difficulty },
  ) => {
    const label = categoryMeta(category).label;
    out.push({
      key: problemKey(route, p.id),
      id: p.id,
      number: p.number,
      title: p.title,
      topic: p.topic,
      difficulty: p.difficulty,
      category,
      route,
      haystack: `${p.title} ${p.topic} ${label} ${p.difficulty ?? ''} ${p.number}`.toLowerCase(),
    });
  };
  blind75.forEach((p) => push('Problem', 'algorithms', p));
  systemDesignProblems.forEach((p) => push('SystemDesign', 'system-design', p));
  reactProblems.forEach((p) => push('ReactProblem', 'react', p));
  CODE_TRACKS.forEach((t) => codeProblemsForTrack(t).forEach((p) => push('BugFix', t, p)));
  sqlProblems.forEach((p) => push('SqlProblem', 'sql', p));
  return out;
}

export const practiceIndex: PracticeItem[] = build();

const CATEGORY_ORDER = PRACTICE_CATEGORIES.map((c) => c.key);

/** Ranked search: title prefix > title word > title substring > topic/category match. */
export function searchPractice(query: string, limit = 80): PracticeItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { item: PracticeItem; score: number }[] = [];
  for (const item of practiceIndex) {
    if (!terms.every((t) => item.haystack.includes(t))) continue;
    const title = item.title.toLowerCase();
    let score = 0;
    if (title.startsWith(q)) score = 4;
    else if (title.split(/\W+/).some((w) => w.startsWith(q))) score = 3;
    else if (title.includes(q)) score = 2;
    else score = 1;
    scored.push({ item, score });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      CATEGORY_ORDER.indexOf(a.item.category) - CATEGORY_ORDER.indexOf(b.item.category) ||
      a.item.number - b.item.number,
  );
  return scored.slice(0, limit).map((s) => s.item);
}
