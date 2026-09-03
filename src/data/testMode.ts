// Test mode — "build your own mock interview".
//
// Users compose a timed interview out of eight section kinds (Algorithms,
// System Design, Python, JavaScript, Java, SQL, Quiz, Behavioral), choosing how many questions, the
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
//   • algorithms / code    : passed / total test cases (datasets for SQL)
//   • system-design        : matched / required (components + connections)
//   • quiz                 : 1 if the correct option was picked, 0 otherwise
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
import { sqlProblems, SqlProblem, getSqlProblem } from './sqlProblems';
import {
  behavioralQuestions,
  BehavioralQuestion,
  getBehavioralQuestion,
} from './behavioral';
import {
  quizBank,
  QuizBankItem,
  QUIZ_TRACKS,
  getQuizBankItem,
} from './quizBank';

export type { Difficulty } from './blind75';
export type { BugFixLanguage } from './bugFixes';

export type SectionKind =
  | 'algorithms'
  | 'system-design'
  | 'python'
  | 'javascript'
  | 'java'
  | 'sql'
  | 'quiz'
  | 'behavioral';

export const SECTION_KINDS: SectionKind[] = [
  'algorithms',
  'system-design',
  'python',
  'javascript',
  'java',
  'sql',
  'quiz',
  'behavioral',
];

/** Kinds backed by the per-language debugging pool in bugFixes.ts. */
export const DEBUG_KINDS = ['python', 'javascript', 'java'] as const;
export type DebugKind = (typeof DEBUG_KINDS)[number];
export const isDebugKind = (k: SectionKind): k is DebugKind =>
  (DEBUG_KINDS as readonly string[]).includes(k);

const countByLanguage = (lang: BugFixLanguage) =>
  bugFixProblems.filter((p) => p.language === lang).length;

export interface SectionMetaInfo {
  label: string;
  short: string;
  icon: string; // Ionicons name
  color: string;
  /** Difficulty filter applies (algorithms + every code kind). */
  hasDifficulty: boolean;
  /** Topic filter applies (everything except behavioral). */
  hasTopics: boolean;
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
    poolTotal: blind75.length,
  },
  'system-design': {
    label: 'System Design',
    short: 'System',
    icon: 'git-network-outline',
    color: '#636E72',
    hasDifficulty: false,
    hasTopics: true,
    poolTotal: systemDesignProblems.length,
  },
  python: {
    label: 'Python',
    short: 'Python',
    icon: 'logo-python',
    color: '#3776AB',
    hasDifficulty: true,
    hasTopics: true,
    poolTotal: countByLanguage('python'),
  },
  javascript: {
    label: 'JavaScript',
    short: 'JS',
    icon: 'logo-javascript',
    color: '#C9A800',
    hasDifficulty: true,
    hasTopics: true,
    poolTotal: countByLanguage('javascript'),
  },
  java: {
    label: 'Java',
    short: 'Java',
    icon: 'cafe-outline',
    color: '#ED8B00',
    hasDifficulty: true,
    hasTopics: true,
    poolTotal: countByLanguage('java'),
  },
  sql: {
    label: 'SQL',
    short: 'SQL',
    icon: 'grid-outline',
    color: '#336791',
    hasDifficulty: true,
    hasTopics: true,
    poolTotal: sqlProblems.length,
  },
  quiz: {
    label: 'Quiz',
    short: 'Quiz',
    icon: 'help-circle-outline',
    color: '#A855F7',
    hasDifficulty: false,
    hasTopics: true,
    poolTotal: quizBank.length,
  },
  behavioral: {
    label: 'Behavioral',
    short: 'Behavioral',
    icon: 'chatbubbles-outline',
    color: '#1CB0F6',
    hasDifficulty: false,
    hasTopics: false,
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
export const DEBUG_TOPICS: Record<DebugKind, string[]> = {
  python: distinctSorted(bugFixProblems.filter((p) => p.language === 'python').map((p) => p.topic)),
  javascript: distinctSorted(bugFixProblems.filter((p) => p.language === 'javascript').map((p) => p.topic)),
  java: distinctSorted(bugFixProblems.filter((p) => p.language === 'java').map((p) => p.topic)),
};
export const SQL_TOPICS = distinctSorted(sqlProblems.map((p) => p.topic));

export const ALL_DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

/** Topic options for a section's topic multi-select ([] when N/A).
 *  For quiz, "topics" are the study tracks (Algorithms, iOS, SQL, …). */
export function topicsForKind(kind: SectionKind): string[] {
  switch (kind) {
    case 'algorithms':
      return ALGO_TOPICS;
    case 'system-design':
      return SD_TOPICS;
    case 'python':
    case 'javascript':
    case 'java':
      return DEBUG_TOPICS[kind];
    case 'sql':
      return SQL_TOPICS;
    case 'quiz':
      return QUIZ_TRACKS;
    default:
      return [];
  }
}

// Default per-question time budgets (seconds), tuned per kind.
export const DEFAULT_SECONDS: Record<SectionKind, number> = {
  algorithms: 1200, // 20 min
  'system-design': 1500, // 25 min
  python: 600, // 10 min
  javascript: 600,
  java: 600,
  sql: 600,
  quiz: 90, // rapid-fire
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
  /** Allowed difficulties — used by algorithms + code kinds. */
  difficulties: Difficulty[];
  /** Allowed topics — empty means "all". Ignored for behavioral. */
  topics: string[];
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

/**
 * Normalize a template: expand the pre-v2.4 "bug-fix" section (one pool with
 * a language filter) into per-language sections, drop unknown kinds, and
 * append any missing kinds disabled so old templates keep working and stay
 * editable in the builder.
 */
export function withAllSections(template: TestTemplate): TestTemplate {
  const sections: SectionConfig[] = [];
  for (const raw of template.sections as (SectionConfig & { languages?: string[] })[]) {
    if ((raw.kind as string) === 'bug-fix') {
      const langs = raw.languages && raw.languages.length > 0 ? raw.languages : [...DEBUG_KINDS];
      for (const lang of DEBUG_KINDS) {
        sections.push({
          ...createSectionConfig(lang),
          enabled: raw.enabled && langs.includes(lang),
          count: raw.count,
          secondsPerQuestion: raw.secondsPerQuestion,
          difficulties: [...raw.difficulties],
        });
      }
      continue;
    }
    if (!SECTION_KINDS.includes(raw.kind)) continue;
    if (sections.some((s) => s.kind === raw.kind)) continue;
    const { languages: _drop, ...rest } = raw;
    sections.push(rest);
  }
  const missing = SECTION_KINDS.filter((k) => !sections.some((s) => s.kind === k));
  for (const k of missing) sections.push({ ...createSectionConfig(k), enabled: false });
  // Keep the canonical kind order so the builder reads the same for everyone.
  sections.sort((a, b) => SECTION_KINDS.indexOf(a.kind) - SECTION_KINDS.indexOf(b.kind));
  return { ...template, sections };
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
    case 'python':
    case 'javascript':
    case 'java':
      return bugFixProblems
        .filter(
          (p) =>
            p.language === cfg.kind &&
            cfg.difficulties.includes(p.difficulty) &&
            matchesTopic(cfg.topics, p.topic),
        )
        .map((p) => p.id);
    case 'sql':
      return sqlProblems
        .filter(
          (p) =>
            cfg.difficulties.includes(p.difficulty) &&
            matchesTopic(cfg.topics, p.topic),
        )
        .map((p) => p.id);
    case 'quiz':
      return quizBank
        .filter((q) => matchesTopic(cfg.topics, q.track))
        .map((q) => q.bankId);
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
    case 'python':
    case 'javascript':
    case 'java':
      return getBugFixProblem(problemId)?.title ?? 'Problem';
    case 'sql':
      return getSqlProblem(problemId)?.title ?? 'Problem';
    case 'quiz':
      return getQuizBankItem(problemId)?.question ?? 'Question';
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
  objectiveItems: number; // everything except behavioral
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

/**
 * The one preset free users can actually run — one question of every section
 * kind. Shown only to non-subscribers, and only until they've run it once.
 *
 * The questions are FIXED (see buildSampleSession), not sampled: reinstalling
 * the app re-offers the sample but always with the same five questions, so
 * there's no fresh content to farm by resetting.
 */
export const SAMPLE_TEMPLATE_ID = 'preset-sample';

/** Fixed question set for the sample run — ids must exist in their pools. */
export function buildSampleSession(): TestItem[] {
  const fixed: { kind: SectionKind; problemId: string; seconds: number }[] = [
    { kind: 'algorithms', problemId: 'two-sum', seconds: 900 },
    { kind: 'system-design', problemId: 'url-shortener', seconds: 900 },
    { kind: 'python', problemId: 'py-off-by-one-sum', seconds: 480 },
    { kind: 'quiz', problemId: 'algorithms/sliding-window/sw-q1', seconds: 90 },
    { kind: 'behavioral', problemId: 'tech-challenge', seconds: 240 },
  ];
  return fixed.map((f, i) => ({
    uid: `sample-${f.kind}-${i}`,
    kind: f.kind,
    problemId: f.problemId,
    secondsBudget: f.seconds,
  }));
}

export const BUILT_IN_TEMPLATES: TestTemplate[] = [
  // Section configs mirror buildSampleSession so the card's chips/duration
  // are accurate — but the session itself uses the fixed ids above.
  preset(SAMPLE_TEMPLATE_ID, 'Sample interview', {
    algorithms: { count: 1, secondsPerQuestion: 900, difficulties: ['Easy'] },
    'system-design': { count: 1, secondsPerQuestion: 900 },
    python: { count: 1, secondsPerQuestion: 480 },
    quiz: { count: 1, secondsPerQuestion: 90 },
    behavioral: { count: 1, secondsPerQuestion: 240 },
  }),
  preset('preset-balanced', 'Balanced loop', {
    algorithms: { count: 2, secondsPerQuestion: 1200 },
    'system-design': { count: 2, secondsPerQuestion: 1500 },
    python: { count: 1, secondsPerQuestion: 600 },
    sql: { count: 1, secondsPerQuestion: 600 },
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
    python: { count: 1, secondsPerQuestion: 480 },
    javascript: { count: 1, secondsPerQuestion: 480 },
    java: { count: 1, secondsPerQuestion: 480 },
  }),
  preset('preset-data-round', 'Data & SQL round', {
    sql: { count: 3, secondsPerQuestion: 600 },
    quiz: { count: 4, secondsPerQuestion: 60 },
  }),
  preset('preset-design-deep', 'Design deep-dive', {
    'system-design': { count: 3, secondsPerQuestion: 1500 },
    behavioral: { count: 1, secondsPerQuestion: 360 },
  }),
  preset('preset-quiz-blitz', 'Quiz blitz', {
    quiz: { count: 8, secondsPerQuestion: 60 },
  }),
];

export {
  getProblem,
  getSystemDesignProblem,
  getBugFixProblem,
  getSqlProblem,
  getBehavioralQuestion,
  getQuizBankItem,
};
export type {
  Blind75Problem,
  SystemDesignProblem,
  BugFixProblem,
  SqlProblem,
  BehavioralQuestion,
  QuizBankItem,
};
