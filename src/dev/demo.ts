// Dev-only demo scripting. Opening the app with
//   com.raidea.algogo://demo?script=<name>
// runs a timed sequence of navigation + UI actions so screen recordings
// (onboarding GIFs, App Store previews) can be captured without touching the
// device. Screens opt in with `useDemoAction(name, handler)`; everything is a
// no-op outside __DEV__ builds.

import { useEffect } from 'react';
import { navigationRef } from '../navigation/ref';

type Handler = (payload?: any) => void;
// Lives on globalThis so Fast Refresh re-evaluating this module doesn't
// orphan the subscriptions screens registered with the previous instance.
const g = globalThis as any;
const handlers: Map<string, Set<Handler>> = (g.__algogoDemoHandlers ??= new Map());

export function emitDemo(action: string, payload?: any) {
  const set = handlers.get(action);
  if (!set || set.size === 0) {
    if (__DEV__) console.log('[demo] no handler for', action);
    return;
  }
  set.forEach((h) => h(payload));
}

/** Subscribe a screen/component to a demo action while mounted. */
export function useDemoAction(action: string, handler: Handler) {
  useEffect(() => {
    if (!__DEV__) return;
    let set = handlers.get(action);
    if (!set) {
      set = new Set();
      handlers.set(action, set);
    }
    set.add(handler);
    return () => {
      set!.delete(handler);
    };
  }, [action, handler]);
}

type Step = { at: number; run: () => void };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const nav = (name: string, params?: any) => {
  if (navigationRef.isReady()) (navigationRef.navigate as any)(name, params);
};
const tab = (tabName: 'StudyTab' | 'PracticeTab' | 'TestTab', screen?: string, params?: any) =>
  nav('MainTabs', screen ? { screen: tabName, params: { screen, params } } : { screen: tabName });

// Each script is a list of (ms since start, action). Keep them short — the
// GIFs loop.
const REACT_DEMO_ID = 'react-tabs';

const SCRIPTS: Record<string, Step[]> = {
  study: [
    { at: 0, run: () => tab('StudyTab', 'Home') },
    { at: 300, run: () => emitDemo('track.select', 'algorithms') },
    { at: 1200, run: () => emitDemo('home.scroll', 380) },
    { at: 2600, run: () => emitDemo('home.scroll', 0) },
    { at: 3800, run: () => emitDemo('track.open') },
    { at: 5300, run: () => emitDemo('menu.select', 'system-design') },
    { at: 7000, run: () => emitDemo('track.select', 'algorithms') },
  ],
  cards: [
    { at: 0, run: () => tab('StudyTab', 'Category', { slug: 'sliding-window' }) },
    { at: 1300, run: () => emitDemo('category.tab', 'cards') },
    { at: 2600, run: () => emitDemo('cards.flip') },
    { at: 4600, run: () => emitDemo('cards.next') },
    { at: 5900, run: () => emitDemo('cards.flip') },
  ],
  algorithms: [
    { at: 0, run: () => tab('PracticeTab', 'Problem', { problemId: 'two-sum' }) },
    { at: 4500, run: () => emitDemo('problem.closeBrief') },
    { at: 6000, run: () => emitDemo('problem.openBrief') },
  ],
  languages: [
    { at: 0, run: () => tab('PracticeTab', 'ReactProblem', { problemId: REACT_DEMO_ID }) },
    { at: 3500, run: () => emitDemo('problem.closeBrief') },
    { at: 4200, run: () => emitDemo('react.loadSolution') },
    { at: 6000, run: () => emitDemo('react.mode', 'preview') },
  ],
  design: [
    { at: 0, run: () => tab('PracticeTab', 'SystemDesign', { problemId: 'url-shortener' }) },
    { at: 1200, run: () => emitDemo('design.clear') },
    { at: 1400, run: () => emitDemo('design.place', { type: 'client', fx: 0.5, fy: 0.04 }) },
    { at: 2100, run: () => emitDemo('design.place', { type: 'web_server', fx: 0.5, fy: 0.4 }) },
    { at: 2800, run: () => emitDemo('design.place', { type: 'cache', fx: 0.08, fy: 0.78 }) },
    { at: 3400, run: () => emitDemo('design.place', { type: 'database', fx: 0.5, fy: 0.78 }) },
    { at: 4000, run: () => emitDemo('design.place', { type: 'id_generator', fx: 0.92, fy: 0.78 }) },
    { at: 4800, run: () => emitDemo('design.connect', ['client', 'web_server']) },
    { at: 5300, run: () => emitDemo('design.connect', ['web_server', 'cache']) },
    { at: 5800, run: () => emitDemo('design.connect', ['web_server', 'database']) },
    { at: 6300, run: () => emitDemo('design.connect', ['web_server', 'id_generator']) },
    { at: 7300, run: () => emitDemo('design.test') },
    { at: 9600, run: () => emitDemo('design.closeResult') },
  ],
  interview: [
    { at: 0, run: () => tab('TestTab', 'TestBuilder') },
    { at: 300, run: () => emitDemo('builder.reset') },
    { at: 400, run: () => emitDemo('builder.scroll', 0) },
    { at: 1400, run: () => emitDemo('builder.section', { kind: 'algorithms', patch: { count: 3 } }) },
    { at: 2000, run: () => emitDemo('builder.section', { kind: 'algorithms', patch: { secondsPerQuestion: 900 } }) },
    { at: 2800, run: () => emitDemo('builder.scroll', 300) },
    { at: 3600, run: () => emitDemo('builder.section', { kind: 'system-design', patch: { enabled: true } }) },
    { at: 4400, run: () => emitDemo('builder.section', { kind: 'system-design', patch: { count: 1 } }) },
    { at: 5400, run: () => emitDemo('builder.start') },
  ],
  search: [
    { at: 0, run: () => tab('PracticeTab', 'PracticeList') },
    { at: 300, run: () => emitDemo('practice.setCategory', 'algorithms') },
    { at: 1200, run: () => emitDemo('practice.toggleComplete', 'Problem:two-sum') },
    { at: 2600, run: () => emitDemo('practice.openSearch') },
    { at: 3600, run: () => emitDemo('search.type', 'bin') },
    { at: 4400, run: () => emitDemo('search.type', 'binary') },
  ],
  'toggle-first': [
    { at: 0, run: () => emitDemo('practice.toggleComplete', 'Problem:two-sum') },
  ],
  'onboarding-design': [
    { at: 0, run: () => emitDemo('onboarding.goTo', 4) },
  ],
  'design-close': [
    { at: 0, run: () => emitDemo('design.closeResult') },
  ],
  'search-close': [
    { at: 0, run: () => emitDemo('practice.closeSearch') },
  ],
  offline: [
    { at: 0, run: () => tab('PracticeTab', 'PracticeList') },
    { at: 200, run: () => emitDemo('practice.setCategory', 'algorithms') },
    { at: 1200, run: () => emitDemo('practice.scroll', 700) },
    { at: 3000, run: () => emitDemo('practice.scroll', 1500) },
    { at: 4800, run: () => emitDemo('practice.scroll', 0) },
  ],
};

let running = false;
export async function runDemoScript(name: string) {
  if (!__DEV__) return;
  const steps = SCRIPTS[name];
  if (!steps) {
    console.log('[demo] unknown script', name);
    return;
  }
  if (running) return;
  running = true;
  console.log('[demo] start', name);
  try {
    let t = 0;
    for (const step of steps) {
      await sleep(Math.max(0, step.at - t));
      t = step.at;
      step.run();
    }
  } finally {
    running = false;
    console.log('[demo] done', name);
  }
}

/** Handle a deep link; returns true when it was a demo URL. */
export function handleDemoUrl(url: string | null | undefined): boolean {
  if (!__DEV__ || !url) return false;
  const m = url.match(/demo\?script=([a-z-]+)/i);
  if (!m) return false;
  runDemoScript(m[1]);
  return true;
}
