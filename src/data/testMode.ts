// Test mode — "build your own mock interview".
//
// Users compose a timed interview out of four section kinds (Algorithms,
// System Design, Bug Fix, Behavioral), choosing how many questions, the
// difficulty/topic mix, and a per-question time budget. The structure is saved
// as a reusable Template; at run time `buildSession` samples concrete problems
// from the live content data so a replay stays fresh.
//
// Timing model: per-question countdown (each TestItem carries its own budget).
// Access: Pro-only (gated at the Test tab).
// Selection: filters auto-pick (count + difficulty + topics, reshuffled).
// Navigation: linear + skip (no going back).
//
// Scoring (see scoreSession): every item resolves to a 0..1 score —
//   • algorithms / bug-fix : passed / total test cases
//   • system-design        : matched / required (components + connections)
//   • behavioral           : 1 if answered, 0 if not
// Skipped or timed-out items score 0 and are tallied separately, so skipping
// directly lowers the final percentage.

import { blind75, Blind75Problem, Difficulty, getProblem } from './blind75';
import {
  systemDesignProblems,
  SystemDesignProblem,
  getSystemDesignProblem,
} from './systemDesign';
import {
  bugFixProblems,
  BugFixProblem,
  BugFixLanguage,
  getBugFixProblem,
} from './bugFixes';
import {
  behavioralQuestions,
  BehavioralQuestion,
  getBehavioralQuestion,
} from './behavioral';

export type { Difficulty } from './blind75';
export type { BugFixLanguage } from './bugFixes';

export type SectionKind =
  | 'algorithms'
  | 'system-design'
  | 'bug-fix'
  | 'behavioral';

export const SECTION_KINDS: SectionKind[] = [
  'algorithms',
  'system-design',
  'bug-fix',
  'behavioral',
];

export interface SectionMetaInfo {
  label: string;
  short: string;
  icon: string; // Ionicons name
  color: string;
  /** Difficulty filter applies (algorithms, bug-fix). */
  hasDifficulty: boolean;
  /** Topic filter applies (everything except behavioral). */
  hasTopics: boolean;
  /** Language filter applies (bug-fix only). */
  hasLanguages: boolean;
  /** Total problems available in this section's pool. */
  poolTotal: number;
}

export const SECTION_META: Record<SectionKind, SectionMetaInfo> = {
  algorithms: {
    label: 'Algorithms',
    short: 'LeetCode',
    icon: 'code-slash-outline',
    color: '#8B5CF6',
    hasDifficulty: true,
    hasTopics: true,
    hasLanguages: false,
    poolTotal: blind75.length,
  },
  'system-design': {
    label: 'System Design',
    short: 'System',
    icon: 'git-network-outline',
    color: '#636E72',
    hasDifficulty: false,
    hasTopics: true,
    hasLanguages: false,
    poolTotal: systemDesignProblems.length,
  },
  'bug-fix': {
    label: 'Bug Fix',
    short: 'Bug Fix',
    icon: 'bug-outline',
    color: '#EF4444',
    hasDifficulty: true,
    hasTopics: true,
    hasLanguages: true,
    poolTotal: bugFixProblems.length,
  },
  behavioral: {
    label: 'Behavioral',
    short: 'Behavioral',
    icon: 'chatbubbles-outline',
    color: '#1CB0F6',
    hasDifficulty: false,
    hasTopics: false,
    hasLanguages: false,
    poolTotal: behavioralQuestions.length,
  },
};

// ---------------------------------------------------------------------------
// Filter option sets (derived live from the content so they never drift)
// ---------------------------------------------------------------------------

const distinctSorted = (xs: string[]): string[] =>
  Array.from(new Set(xs)).sort((a, b) => a.localeCompare(b));

export const ALGO_TOPICS = distinctSorted(blind75.map((p) => p.topic));
export const SD_TOPICS = distinctSorted(systemDesignProblems.map((p) => p.topic));
export const BUGFIX_TOPICS = distinctSorted(bugFixProblems.map((p) => p.topic));

export const ALL_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
export const ALL_LANGUAGES: BugFixLanguage[] = ['python', 'javascript', 'java'];

export const LANGUAGE_LABELS: Record<BugFixLanguage, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  java: 'Java',
};

/** Topic options for a section's topic multi-select ([] when N/A). */
export function topicsForKind(kind: SectionKind): string[] {
  switch (kind) {
    case 'algorithms':
      return ALGO_TOPICS;
    case 'system-design':
      return SD_TOPICS;
    case 'bug-fix':
      return BUGFIX_TOPICS;
    default:
      return [];
  }
}

// Default per-question time budgets (seconds), tuned per kind.
export const DEFAULT_SECONDS: Record<SectionKind, number> = {
  algorithms: 1200, // 20 min
  'system-design': 1500, // 25 min
  'bug-fix': 600, // 10 min
  behavioral: 300, // 5 min
};

// Time choices offered in the builder, in seconds (3,5,10,15,20,25,30,45 min).
export const TIME_CHOICES: number[] = [180, 300, 600, 900, 1200, 1500, 1800, 2700];

export const MAX_PER_SECTION = 8;

// ---------------------------------------------------------------------------
// Template / section config
// ---------------------------------------------------------------------------

export interface SectionConfig {
  kind: SectionKind;
  enabled: boolean;
  count: number;
  secondsPerQuestion: number;
  /** Allowed difficulties — used by algorithms & bug-fix only. */
  difficulties: Difficulty[];
  /** Allowed topics — empty means "all". Ignored for behavioral. */
  topics: string[];
  /** Allowed languages — bug-fix only. Empty means "all". */
  languages: BugFixLanguage[];
}

export interface TestTemplate {
  id: string;
  name: string;
  sections: SectionConfig[];
  createdAt: number;
  updatedAt: number;
  /** True for the bundled starter presets (read-only, not persisted). */
  builtIn?: boolean;
}

/** One concrete question in a running session. */
export interface TestItem {
  uid: string;
  kind: SectionKind;
  problemId: string;
  secondsBudget: number;
}

export function createSectionConfig(kind: SectionKind): SectionConfig {
  return {
    kind,
    enabled: true,
    count: 2,
    secondsPerQuestion: DEFAULT_SECONDS[kind],
    difficulties: [...ALL_DIFFICULTIES],
    topics: [],
    languages: [...ALL_LANGUAGES],
  };
}

export function createDefaultSections(): SectionConfig[] {
  return SECTION_KINDS.map(createSectionConfig);
}

export function genId(): string {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e9,
  ).toString(36)}`;
}

export function createBlankTemplate(name = 'My mock interview'): TestTemplate {
  const now = Date.now();
  return {
    id: genId(),
    name,
    sections: createDefaultSections(),
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Pool filtering + sampling
// ---------------------------------------------------------------------------

function matchesTopic(topics: string[], topic: string): boolean {
  return topics.length === 0 || topics.includes(topic);
}

/** IDs of all problems matching a section's filters (before sampling). */
export function poolForSection(cfg: SectionConfig): string[] {
  switch (cfg.kind) {
    case 'algorithms':
      return blind75
        .filter(
          (p) =>
            cfg.difficulties.includes(p.difficulty) &&
            matchesTopic(cfg.topics, p.topic),
        )
        .map((p) => p.id);
    case 'system-design':
      return systemDesignProblems
        .filter((p) => matchesTopic(cfg.topics, p.topic))
        .map((p) => p.id);
    case 'bug-fix':
      return bugFixProblems
        .filter(
          (p) =>
            cfg.difficulties.includes(p.difficulty) &&
            (cfg.languages.length === 0 ||
              cfg.languages.includes(p.language)) &&
            matchesTopic(cfg.topics, p.topic),
        )
        .map((p) => p.id);
    case 'behavioral':
      return behavioralQuestions.map((p) => p.id);
  }
}

/** How many questions this section will actually contribute (clamped to pool). */
export function plannedCount(cfg: SectionConfig): number {
  if (!cfg.enabled || cfg.count <= 0) return 0;
  return Math.min(cfg.count, poolForSection(cfg).length);
}

function shuffled<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build an ordered list of concrete questions from a template. Sections appear
 * in their configured order; problems within a section are sampled at random
 * (reshuffled on every call) so replaying a template stays fresh.
 */
export function buildSession(template: TestTemplate): TestItem[] {
  const items: TestItem[] = [];
  let seq = 0;
  for (const cfg of template.sections) {
    if (!cfg.enabled || cfg.count <= 0) continue;
    const pool = poolForSection(cfg);
    const picked = shuffled(pool).slice(0, cfg.count);
    for (const id of picked) {
      items.push({
        uid: `${cfg.kind}-${seq++}`,
        kind: cfg.kind,
        problemId: id,
        secondsBudget: cfg.secondsPerQuestion,
      });
    }
  }
  return items;
}

/** Total seconds a template would run, given clamped counts. */
export function estimateSeconds(template: TestTemplate): number {
  return template.sections.reduce(
    (sum, cfg) => sum + plannedCount(cfg) * cfg.secondsPerQuestion,
    0,
  );
}

/** Total questions a template would produce. */
export function estimateQuestions(template: TestTemplate): number {
  return template.sections.reduce((sum, cfg) => sum + plannedCount(cfg), 0);
}

export function isRunnable(template: TestTemplate): boolean {
  return estimateQuestions(template) > 0;
}

// ---------------------------------------------------------------------------
// Title resolution
// ---------------------------------------------------------------------------

export function itemTitle(kind: SectionKind, problemId: string): string {
  switch (kind) {
    case 'algorithms':
      return getProblem(problemId)?.title ?? 'Problem';
    case 'system-design':
      return getSystemDesignProblem(problemId)?.title ?? 'Problem';
    case 'bug-fix':
      return getBugFixProblem(problemId)?.title ?? 'Problem';
    case 'behavioral':
      return getBehavioralQuestion(problemId)?.prompt ?? 'Question';
  }
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export type ItemStatus =
  | 'passed' // objective: full credit
  | 'partial' // objective: 0 < score < 1
  | 'failed' // objective: attempted, 0 credit
  | 'skipped' // never attempted / skipped / timed out with nothing
  | 'answered' // behavioral: non-empty answer
  | 'unanswered'; // behavioral: empty / skipped

export interface ItemOutcome {
  uid: string;
  kind: SectionKind;
  problemId: string;
  title: string;
  status: ItemStatus;
  score: number; // 0..1
  detail: string; // human-readable, e.g. "3 / 4 tests"
  secondsBudget: number;
  secondsSpent: number;
  timedOut: boolean;
}

export interface SessionScore {
  percent: number; // overall, average of all item scores * 100
  totalItems: number;
  passed: number;
  partial: number;
  failed: number;
  skipped: number;
  answered: number;
  unanswered: number;
  objectiveItems: number; // algorithms + system-design + bug-fix
  objectivePercent: number; // average score over objective items only
}

export function scoreSession(outcomes: ItemOutcome[]): SessionScore {
  const total = outcomes.length;
  let scoreSum = 0;
  let objScoreSum = 0;
  let objCount = 0;
  const tally = {
    passed: 0,
    partial: 0,
    failed: 0,
    skipped: 0,
    answered: 0,
    unanswered: 0,
  };

  for (const o of outcomes) {
    scoreSum += o.score;
    tally[o.status] += 1;
    if (o.kind !== 'behavioral') {
      objScoreSum += o.score;
      objCount += 1;
    }
  }

  return {
    percent: total > 0 ? Math.round((scoreSum / total) * 100) : 0,
    totalItems: total,
    passed: tally.passed,
    partial: tally.partial,
    failed: tally.failed,
    skipped: tally.skipped,
    answered: tally.answered,
    unanswered: tally.unanswered,
    objectiveItems: objCount,
    objectivePercent:
      objCount > 0 ? Math.round((objScoreSum / objCount) * 100) : 0,
  };
}

/** mm:ss for a duration in seconds (clamped at 0). */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/** "20 min" / "45 min" / "1h 0m" for a time-budget chip. */
export function formatMinutesLabel(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

// ---------------------------------------------------------------------------
// Built-in starter presets (read-only; users can run or duplicate-to-edit)
// ---------------------------------------------------------------------------

function preset(
  id: string,
  name: string,
  overrides: Partial<Record<SectionKind, Partial<SectionConfig>>>,
): TestTemplate {
  const sections = SECTION_KINDS.map((kind) => {
    const base = createSectionConfig(kind);
    const ov = overrides[kind];
    if (!ov) return { ...base, enabled: false };
    return { ...base, ...ov, kind };
  });
  return {
    id,
    name,
    sections,
    createdAt: 0,
    updatedAt: 0,
    builtIn: true,
  };
}

export const BUILT_IN_TEMPLATES: TestTemplate[] = [
  preset('preset-balanced', 'Balanced loop', {
    algorithms: { count: 2, secondsPerQuestion: 1200 },
    'system-design': { count: 2, secondsPerQuestion: 1500 },
    'bug-fix': { count: 2, secondsPerQuestion: 600 },
    behavioral: { count: 2, secondsPerQuestion: 300 },
  }),
  preset('preset-phone-screen', 'Phone screen', {
    algorithms: {
      count: 2,
      secondsPerQuestion: 1200,
      difficulties: ['Easy', 'Medium'],
    },
    behavioral: { count: 1, secondsPerQuestion: 300 },
  }),
  preset('preset-coding-sprint', 'Coding sprint', {
    algorithms: { count: 3, secondsPerQuestion: 900 },
    'bug-fix': { count: 3, secondsPerQuestion: 480 },
  }),
  preset('preset-design-deep', 'Design deep-dive', {
    'system-design': { count: 3, secondsPerQuestion: 1500 },
    behavioral: { count: 1, secondsPerQuestion: 360 },
  }),
];

export {
  getProblem,
  getSystemDesignProblem,
  getBugFixProblem,
  getBehavioralQuestion,
};
export type {
  Blind75Problem,
  SystemDesignProblem,
  BugFixProblem,
  BehavioralQuestion,
};
