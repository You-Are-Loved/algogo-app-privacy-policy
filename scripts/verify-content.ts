// Structural validator for study-track content (categories, flashcards, quiz
// questions, learn sections, diagram visualizations) plus the practice
// catalogs (system design, behavioral). Run with:
//
//   node_modules/.bin/sucrase-node scripts/verify-content.ts            # whole app
//   node_modules/.bin/sucrase-node scripts/verify-content.ts <file.ts>  # a fragment
//
// A fragment module must export an array of Category objects under any name
// (the first exported array is used). Exit code 1 on any hard error.

import path from 'path';
import { Category } from '../src/types';

const errors: string[] = [];
const warnings: string[] = [];
const err = (m: string) => errors.push(m);
const warn = (m: string) => warnings.push(m);

const NODE_TYPES = new Set(['primary', 'secondary', 'warning', 'error', 'info', 'success', undefined]);

const STOP = new Set(['what','is','the','a','an','of','in','to','and','or','for','how','does','do','why','when','you','your','it','on','with','are','vs','between','difference','which','that','this','be','can','should','use','used','from','as','at','by','given','return','find','array','string','list','number','integer','value','values']);
function tokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase().split('\n')[0].replace(/[^a-z0-9@#+ ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)),
  );
}
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / (a.size + b.size - inter);
}
function nearDuplicates(tag: string, kind: string, items: { id: string; text: string }[]) {
  const toks = items.map((i) => tokens(i.text));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const sim = jaccard(toks[i], toks[j]);
      if (sim >= 0.7 && toks[i].size >= 3) {
        warn(`${tag} near-duplicate ${kind} ${items[i].id} / ${items[j].id} (${sim.toFixed(2)}): "${items[i].text.split('\n')[0].slice(0, 50)}" ~ "${items[j].text.split('\n')[0].slice(0, 50)}"`);
      }
    }
  }
}

function checkCategory(c: Category, seenIds: Set<string>, seenSlugs: Set<string>) {
  const tag = `[${c.id}]`;
  for (const k of ['id', 'name', 'slug', 'description', 'icon', 'color', 'colorDark'] as const) {
    if (!c[k] || typeof c[k] !== 'string') err(`${tag} missing ${k}`);
  }
  if (seenIds.has(c.id)) err(`${tag} duplicate category id`);
  if (seenSlugs.has(c.slug)) err(`${tag} duplicate category slug ${c.slug}`);
  seenIds.add(c.id);
  seenSlugs.add(c.slug);

  if (!Array.isArray(c.learnContent) || c.learnContent.length === 0) err(`${tag} no learnContent`);
  const learnIds = new Set<string>();
  (c.learnContent || []).forEach((s, i) => {
    if (!s.title?.trim()) err(`${tag} learn[${i}] empty title`);
    if (!s.content?.trim()) err(`${tag} learn[${i}] empty content`);
    if (s.id) {
      if (learnIds.has(s.id)) err(`${tag} learn duplicate id ${s.id}`);
      learnIds.add(s.id);
    }
  });

  const cardIds = new Set<string>();
  const fronts = new Set<string>();
  (c.flashcards || []).forEach((f, i) => {
    if (!f.id) err(`${tag} card[${i}] missing id`);
    if (cardIds.has(f.id)) err(`${tag} duplicate card id ${f.id}`);
    cardIds.add(f.id);
    if (!f.front?.trim()) err(`${tag} card ${f.id} empty front`);
    if (!f.back?.trim()) err(`${tag} card ${f.id} empty back`);
    const key = (f.front || '').trim().toLowerCase();
    if (fronts.has(key)) err(`${tag} duplicate card front: ${f.front.slice(0, 60)}`);
    fronts.add(key);
  });

  const qIds = new Set<string>();
  const qTexts = new Set<string>();
  (c.quizQuestions || []).forEach((q, i) => {
    if (!q.id) err(`${tag} quiz[${i}] missing id`);
    if (qIds.has(q.id)) err(`${tag} duplicate quiz id ${q.id}`);
    qIds.add(q.id);
    if (!q.question?.trim()) err(`${tag} quiz ${q.id} empty question`);
    if (!Array.isArray(q.options) || q.options.length !== 4) err(`${tag} quiz ${q.id} must have exactly 4 options (has ${q.options?.length})`);
    const opts = (q.options || []).map((o) => String(o).trim().toLowerCase());
    if (new Set(opts).size !== opts.length) err(`${tag} quiz ${q.id} has duplicate options`);
    if (!Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= (q.options?.length ?? 0)) {
      err(`${tag} quiz ${q.id} correctAnswer ${q.correctAnswer} out of range`);
    }
    if (!q.explanation?.trim()) err(`${tag} quiz ${q.id} empty explanation`);
    const key = (q.question || '').trim().toLowerCase();
    if (qTexts.has(key)) err(`${tag} duplicate quiz question: ${q.question.slice(0, 60)}`);
    qTexts.add(key);
  });

  (c.visualizations || []).forEach((v, i) => {
    const vt = `${tag} viz[${i}] "${v.title}"`;
    if (!v.title?.trim()) err(`${tag} viz[${i}] empty title`);
    if (v.nodes) {
      const ids = new Set<string>();
      v.nodes.forEach((n) => {
        if (ids.has(n.id)) err(`${vt} duplicate node id ${n.id}`);
        ids.add(n.id);
        if (!n.label?.trim()) err(`${vt} node ${n.id} empty label`);
        if (!NODE_TYPES.has(n.type)) err(`${vt} node ${n.id} unknown type ${n.type}`);
        if (typeof n.x !== 'number' || typeof n.y !== 'number') warn(`${vt} node ${n.id} has no x/y`);
      });
      (v.edges || []).forEach((e) => {
        if (!ids.has(e.from)) err(`${vt} edge from unknown node ${e.from}`);
        if (!ids.has(e.to)) err(`${vt} edge to unknown node ${e.to}`);
      });
    }
  });

  nearDuplicates(tag, 'cards', (c.flashcards || []).map((f) => ({ id: f.id, text: f.front })));
  nearDuplicates(tag, 'quiz', (c.quizQuestions || []).map((q) => ({ id: q.id, text: q.question })));

  const nc = c.flashcards?.length ?? 0;
  const nq = c.quizQuestions?.length ?? 0;
  if (nc % 10 !== 0) warn(`${tag} flashcards=${nc} is not a round number`);
  if (nq % 10 !== 0) warn(`${tag} quiz=${nq} is not a round number`);
  return { learn: c.learnContent?.length ?? 0, cards: nc, quiz: nq, viz: c.visualizations?.length ?? 0 };
}

async function main() {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const arg = process.argv[2];

  if (arg) {
    const mod = require(path.resolve(arg));
    const arr = Object.values(mod).find((v) => Array.isArray(v)) as Category[] | undefined;
    if (!arr) {
      console.error('fragment exports no array');
      process.exit(1);
    }
    let t = { learn: 0, cards: 0, quiz: 0, viz: 0 };
    for (const c of arr) {
      const r = checkCategory(c, seenIds, seenSlugs);
      console.log(`  ${c.id.padEnd(30)} learn=${r.learn} cards=${String(r.cards).padStart(3)} quiz=${String(r.quiz).padStart(3)} viz=${r.viz}`);
      t = { learn: t.learn + r.learn, cards: t.cards + r.cards, quiz: t.quiz + r.quiz, viz: t.viz + r.viz };
    }
    console.log(`  TOTAL categories=${arr.length} learn=${t.learn} cards=${t.cards} quiz=${t.quiz}`);
  } else {
    const { getCategoriesByType, contentTypeInfo } = require('../src/data/allCategories');
    const { quizBank } = require('../src/data/quizBank');
    const { systemDesignProblems, componentCatalog } = require('../src/data/systemDesign');
    const { behavioralQuestions } = require('../src/data/behavioral');
    const { blind75 } = require('../src/data/blind75');
    const { bugFixProblems } = require('../src/data/bugFixes');
    const { contentStats } = require('../src/data/stats');

    let grand = { learn: 0, cards: 0, quiz: 0, cats: 0 };
    for (const type of Object.keys(contentTypeInfo)) {
      const cats: Category[] = getCategoriesByType(type);
      console.log(`== ${type} (${cats.length} categories)`);
      let t = { learn: 0, cards: 0, quiz: 0 };
      for (const c of cats) {
        const r = checkCategory(c, seenIds, seenSlugs);
        console.log(`  ${c.id.padEnd(30)} learn=${String(r.learn).padStart(2)} cards=${String(r.cards).padStart(3)} quiz=${String(r.quiz).padStart(3)} viz=${r.viz}${c.premium ? '' : '  FREE'}`);
        t = { learn: t.learn + r.learn, cards: t.cards + r.cards, quiz: t.quiz + r.quiz };
      }
      console.log(`  TOTAL learn=${t.learn} cards=${t.cards} quiz=${t.quiz}`);
      grand = { learn: grand.learn + t.learn, cards: grand.cards + t.cards, quiz: grand.quiz + t.quiz, cats: grand.cats + cats.length };
    }
    console.log(`ALL categories=${grand.cats} learn=${grand.learn} cards=${grand.cards} quiz=${grand.quiz}`);
    console.log(`quizBank=${quizBank.length}`);
    const bankIds = new Set<string>();
    for (const q of quizBank) {
      if (bankIds.has(q.bankId)) err(`duplicate quiz bankId ${q.bankId}`);
      bankIds.add(q.bankId);
    }
    if (contentStats.tracks !== Object.keys(contentTypeInfo).length) {
      err(`stats.tracks=${contentStats.tracks} but contentTypeInfo has ${Object.keys(contentTypeInfo).length} tracks`);
    }

    // --- system design
    const sdIds = new Set<string>();
    const sdNums = new Set<number>();
    for (const p of systemDesignProblems) {
      const tag = `[sd:${p.id}]`;
      if (sdIds.has(p.id)) err(`${tag} duplicate id`);
      sdIds.add(p.id);
      if (sdNums.has(p.number)) err(`${tag} duplicate number ${p.number}`);
      sdNums.add(p.number);
      if (!p.prompt?.trim() || !p.solution?.trim() || !p.title?.trim() || !p.topic?.trim()) err(`${tag} missing text`);
      if (!Array.isArray(p.hints) || p.hints.length !== 3) err(`${tag} needs exactly 3 hints`);
      const pal = new Set(p.palette);
      for (const c of p.palette) if (!componentCatalog[c]) err(`${tag} unknown palette component ${c}`);
      if (pal.size !== p.palette.length) err(`${tag} duplicate palette entries`);
      for (const c of p.requiredComponents) if (!pal.has(c)) err(`${tag} required component ${c} not in palette`);
      for (const [a, b] of p.requiredConnections) {
        if (!pal.has(a) || !pal.has(b)) err(`${tag} connection ${a}-${b} uses component outside palette`);
        if (a === b) err(`${tag} self connection ${a}`);
      }
      if (p.requiredComponents.length < 3) warn(`${tag} only ${p.requiredComponents.length} required components`);
    }
    for (let i = 1; i <= systemDesignProblems.length; i++) if (!sdNums.has(i)) err(`system design numbering gap at ${i}`);
    console.log(`systemDesign=${systemDesignProblems.length}`);

    // --- behavioral
    const bIds = new Set<string>();
    const bNums = new Set<number>();
    const bPrompts = new Set<string>();
    for (const q of behavioralQuestions) {
      if (bIds.has(q.id)) err(`[behavioral:${q.id}] duplicate id`);
      bIds.add(q.id);
      if (bNums.has(q.number)) err(`[behavioral:${q.id}] duplicate number`);
      bNums.add(q.number);
      if (!q.prompt?.trim()) err(`[behavioral:${q.id}] empty prompt`);
      const k = q.prompt.trim().toLowerCase();
      if (bPrompts.has(k)) err(`[behavioral:${q.id}] duplicate prompt`);
      bPrompts.add(k);
    }
    for (let i = 1; i <= behavioralQuestions.length; i++) if (!bNums.has(i)) err(`behavioral numbering gap at ${i}`);
    console.log(`behavioral=${behavioralQuestions.length}`);

    // --- algorithms / bug fix (structure only; runtime checks live in verify-algos / verify-bugfix)
    const aIds = new Set<string>();
    const aNums = new Set<number>();
    for (const p of blind75) {
      if (aIds.has(p.id)) err(`[algo:${p.id}] duplicate id`);
      aIds.add(p.id);
      if (aNums.has(p.number)) err(`[algo:${p.id}] duplicate number ${p.number}`);
      aNums.add(p.number);
    }
    for (let i = 1; i <= blind75.length; i++) if (!aNums.has(i)) err(`algorithms numbering gap at ${i}`);
    console.log(`algorithms=${blind75.length}`);

    const bfIds = new Set<string>();
    const perLang: Record<string, Set<number>> = {};
    for (const p of bugFixProblems) {
      if (bfIds.has(p.id)) err(`[bugfix:${p.id}] duplicate id`);
      bfIds.add(p.id);
      perLang[p.language] = perLang[p.language] || new Set();
      if (perLang[p.language].has(p.number)) err(`[bugfix:${p.id}] duplicate number ${p.number} in ${p.language}`);
      perLang[p.language].add(p.number);
    }
    for (const [lang, nums] of Object.entries(perLang)) {
      for (let i = 1; i <= nums.size; i++) if (!nums.has(i)) err(`bugfix ${lang} numbering gap at ${i}`);
      console.log(`bugfix ${lang}=${nums.size}`);
    }
    console.log(`bugfix=${bugFixProblems.length}`);
  }

  for (const w of warnings) console.log('WARN', w);
  for (const e of errors) console.log('ERROR', e);
  console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}

main();
