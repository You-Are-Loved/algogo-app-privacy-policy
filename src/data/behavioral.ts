// Behavioral interview questions — the prompts you tend to hear at every SWE
// onsite. These are general categories paraphrased in our own voice; users
// save personal STAR-style answers against each one.

export interface BehavioralQuestion {
  id: string;
  number: number;
  prompt: string;
  hint?: string;
}

export const behavioralQuestions: BehavioralQuestion[] = [
  {
    id: 'tech-challenge',
    number: 1,
    prompt: 'Tell me about a challenging technical problem you solved recently.',
    hint: 'Walk through the situation, what made it hard, what you tried, and the outcome.',
  },
  {
    id: 'teammate-disagreement',
    number: 2,
    prompt: 'Describe a time you disagreed with a teammate. How did you work through it?',
    hint: 'Focus on how you listened, what changed your mind (or theirs), and how you decided.',
  },
  {
    id: 'proudest-project',
    number: 3,
    prompt: "What's a project you're most proud of, and what made it stand out?",
    hint: 'Highlight your contribution, the problem it solved, and concrete impact.',
  },
  {
    id: 'mistake-at-work',
    number: 4,
    prompt: 'Tell me about a mistake you made at work. What did you learn?',
    hint: 'Be honest about what happened. Spend most of the answer on the lesson and what you changed.',
  },
  {
    id: 'rapid-learning',
    number: 5,
    prompt: 'Describe a time you had to ramp up on something unfamiliar fast.',
    hint: 'How did you decide what to learn first? What was your learning loop?',
  },
  {
    id: 'tight-deadline',
    number: 6,
    prompt: 'Tell me about a time you delivered under serious time pressure.',
    hint: 'What did you cut? What did you protect? What did you ship?',
  },
  {
    id: 'critical-feedback',
    number: 7,
    prompt: 'Share a piece of critical feedback you received. How did you respond?',
    hint: 'Pick feedback that genuinely changed how you work. Avoid humble brags.',
  },
  {
    id: 'mentoring',
    number: 8,
    prompt: 'Describe a time you helped a teammate level up.',
    hint: 'A specific person, a specific moment. What did you do differently than you would for yourself?',
  },
  {
    id: 'calculated-risk',
    number: 9,
    prompt: "Tell me about a calculated risk you took that didn't pan out.",
    hint: 'Show the reasoning at the time, what surprised you, and how you wound things down.',
  },
  {
    id: 'motivation',
    number: 10,
    prompt: 'Why are you drawn to this kind of work?',
    hint: "Personal story beats generic answers. What hooked you and what keeps you in it?",
  },
  {
    id: 'lead-without-authority',
    number: 11,
    prompt: "Tell me about a project you led without anyone formally reporting to you.",
    hint: 'How did you get people aligned when no one had to listen? What kept the work moving when momentum dipped?',
  },
  {
    id: 'production-incident',
    number: 12,
    prompt: 'Walk me through a production incident you helped debug or resolve.',
    hint: 'What was breaking, how did you triage, and what was the fix? End with what changed structurally so it can\'t happen the same way again.',
  },
  {
    id: 'push-back',
    number: 13,
    prompt: 'Describe a time you pushed back on a request from your manager or a senior stakeholder.',
    hint: "Why was pushing back the right call, and how did you frame it so it didn't read as obstruction?",
  },
  {
    id: 'ambiguous-requirements',
    number: 14,
    prompt: "Tell me about a project where the requirements weren't clear when you started.",
    hint: "How did you scope it? Who did you talk to to nail down what 'done' actually meant?",
  },
  {
    id: 'cross-functional-disagreement',
    number: 15,
    prompt: 'Describe a time you disagreed with a product manager, designer, or other non-engineer.',
    hint: 'Name the trade-off — user value vs. effort, scope vs. timeline. How did you land on a decision both sides could live with?',
  },
  {
    id: 'simplifying-complex',
    number: 16,
    prompt: 'Tell me about a time you replaced something complicated with something simpler.',
    hint: 'Concrete before/after numbers help: lines of code, latency, on-call pages, support tickets — whatever moved.',
  },
  {
    id: 'difficult-colleague',
    number: 17,
    prompt: "Describe a working relationship that didn't click. How did you handle it?",
    hint: "Without making them the villain. Focus on what you actually tried and what eventually shifted.",
  },
  {
    id: 'taking-initiative',
    number: 18,
    prompt: "Tell me about something you built or fixed that wasn't on your roadmap.",
    hint: 'What pulled you toward it? Was anyone watching, or was it quietly load-bearing?',
  },
  {
    id: 'data-driven-decision',
    number: 19,
    prompt: 'Walk me through a decision you made by looking at data instead of going on instinct.',
    hint: 'What data did you actually have? What did it talk you out of, and how would you have gone wrong without it?',
  },
  {
    id: 'unconventional-solution',
    number: 20,
    prompt: 'Describe a time you solved a problem in a way the team didn\'t initially expect.',
    hint: "What was the 'obvious' approach you didn't take, and what made the alternative work better?",
  },
  {
    id: 'meaningful-failure',
    number: 21,
    prompt: 'Tell me about a time you failed at something that mattered.',
    hint: "Be specific about what failure looked like. The lesson is more interesting than the spin, so don't rush past it.",
  },
  {
    id: 'speed-vs-quality',
    number: 22,
    prompt: 'Describe a time you had to choose between shipping fast and shipping it right.',
    hint: 'Which way did you go and what did it cost? Did you revisit the decision later?',
  },
  {
    id: 'building-consensus',
    number: 23,
    prompt: 'Tell me about a time you got a divided team to agree on a direction.',
    hint: 'Walk through how you surfaced the real disagreements and where the compromise actually came from.',
  },
  {
    id: 'end-to-end-ownership',
    number: 24,
    prompt: 'Describe a project you owned from kickoff through launch.',
    hint: 'Where did you spend your time at each stage? What did you almost ship that you caught at the last minute?',
  },
  {
    id: 'why-this-role',
    number: 25,
    prompt: 'Why this company, and why this role specifically?',
    hint: 'What about the product, mission, or team caught your eye? Specific beats generic — name the thing.',
  },
];

export const getBehavioralQuestion = (id: string) =>
  behavioralQuestions.find((q) => q.id === id);
