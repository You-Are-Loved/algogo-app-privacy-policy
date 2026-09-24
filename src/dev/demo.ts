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
    { at: 0, run: () => tab('PracticeTab', 'PracticeList') },
    { at: 200, run: () => emitDemo('practice.setCategory', 'algorithms') },
    { at: 900, run: () => emitDemo('practice.openMenu') },
    { at: 2100, run: () => emitDemo('menu.toggleGroup', 'group-frontend') },
    { at: 3300, run: () => emitDemo('menu.toggleGroup', 'group-backend') },
    { at: 4800, run: () => emitDemo('menu.select', 'sql') },
  ],
  design: [
    { at: 0, run: () => tab('PracticeTab', 'SystemDesign', { problemId: 'url-shortener' }) },
  ],
  interview: [
    { at: 0, run: () => tab('TestTab', 'TestBuilder') },
    { at: 200, run: () => emitDemo('builder.scroll', 0) },
    { at: 1600, run: () => emitDemo('builder.scroll', 520) },
    { at: 3200, run: () => emitDemo('builder.scroll', 1150) },
    { at: 5000, run: () => emitDemo('builder.scroll', 0) },
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
