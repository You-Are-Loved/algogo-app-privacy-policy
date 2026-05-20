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
];

export const getBehavioralQuestion = (id: string) =>
  behavioralQuestions.find((q) => q.id === id);
