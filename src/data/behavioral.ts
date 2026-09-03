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
  {
    id: 'bad-news-stakeholder',
    number: 26,
    prompt: 'Tell me about a time you had to deliver bad news to a stakeholder or customer.',
    hint: 'Say what the news was, how you framed it, what options you brought, and how the relationship held up afterward.',
  },
  {
    id: 'inherited-messy-codebase',
    number: 27,
    prompt: 'Describe a time you inherited a messy codebase. What did you do first?',
    hint: 'Interviewers want to hear how you prioritized: tests, docs, observability, or the riskiest path — and why that order.',
  },
  {
    id: 'saying-no-to-feature',
    number: 28,
    prompt: 'Tell me about a time you said no to a feature request.',
    hint: 'Who asked, what tradeoff you saw, how you said it, and what you offered instead.',
  },
  {
    id: 'too-many-priorities',
    number: 29,
    prompt: 'Describe a time you were juggling too many priorities at once. How did you decide what to drop?',
    hint: 'Show the framework you used (impact, urgency, who is blocked) and how you communicated the cut.',
  },
  {
    id: 'mentoring-new-hire',
    number: 30,
    prompt: 'Tell me about mentoring an intern or new hire through their first real project.',
    hint: 'Focus on how you scoped the work, gave feedback, and gradually stepped back.',
  },
  {
    id: 'bug-in-code-review',
    number: 31,
    prompt: 'Describe a time you caught a serious bug in code review. How did you raise it?',
    hint: 'What the bug would have caused, how you phrased the comment, and what changed in the process afterward.',
  },
  {
    id: 'project-cancelled',
    number: 32,
    prompt: 'Tell me about a project that was cancelled or de-prioritized after you had invested heavily in it.',
    hint: 'Be honest about the frustration, then show how you salvaged learnings, code, or relationships.',
  },
  {
    id: 'disagree-and-commit',
    number: 33,
    prompt: 'Describe a time you disagreed with a technical decision but committed to it anyway.',
    hint: 'Explain your objection, why you decided to commit, and how you supported the decision once made.',
  },
  {
    id: 'improved-team-process',
    number: 34,
    prompt: 'Tell me about a time you improved a team process — on-call, code review, planning, or testing.',
    hint: 'What was broken, what you changed, how you got buy-in, and a concrete before/after.',
  },
  {
    id: 'cross-timezone-collab',
    number: 35,
    prompt: 'Describe a time you worked closely with a team in another time zone or organization.',
    hint: 'Handoffs, written communication, and how you avoided blocking each other are the interesting parts.',
  },
  {
    id: 'hardest-performance-problem',
    number: 36,
    prompt: 'Tell me about the hardest performance problem you have diagnosed.',
    hint: 'Walk through how you measured, what you ruled out, the root cause, and the fix. Numbers help.',
  },
  {
    id: 'decision-incomplete-info',
    number: 37,
    prompt: 'Describe a decision you made with incomplete information and no time to gather more.',
    hint: 'What you knew, what you assumed, how you hedged, and whether you would decide the same way again.',
  },
  {
    id: 'advocated-for-user',
    number: 38,
    prompt: 'Tell me about a time you advocated for the user when the business was pushing another way.',
    hint: 'What evidence you brought, who you convinced, and how the outcome landed for users and the business.',
  },
  {
    id: 'learned-from-junior',
    number: 39,
    prompt: 'Describe a time you learned something important from a more junior colleague.',
    hint: 'This is about humility and openness. Name the thing you learned and how it changed what you do.',
  },
  {
    id: 'over-engineered',
    number: 40,
    prompt: 'Tell me about a time you over-engineered something. How did you notice, and what did you do?',
    hint: 'Interviewers want self-awareness: what signal told you, and how you scaled it back.',
  },
  {
    id: 'changed-scope-or-setback',
    number: 41,
    prompt: 'Describe a professional setback — a missed promotion, a reorg, or a project taken away. How did you respond?',
    hint: 'Stay constructive. Show what you did in the following months, not just how you felt.',
  },
  {
    id: 'quality-under-pressure',
    number: 42,
    prompt: 'Tell me about a time you held the line on quality or security while under pressure to ship.',
    hint: 'What the risk was, how you made it visible, and what compromise (if any) you reached.',
  },
  {
    id: 'building-credibility',
    number: 43,
    prompt: 'Describe how you built credibility quickly after joining a new team.',
    hint: 'Early wins, listening before proposing changes, and how you handled being the new person.',
  },
  {
    id: 'estimate-badly-wrong',
    number: 44,
    prompt: 'Tell me about a project estimate you got badly wrong.',
    hint: 'What you missed, when you realized, how you re-planned, and what you do differently when estimating now.',
  },
  {
    id: 'difficult-feedback-to-peer',
    number: 45,
    prompt: 'Describe a time you gave difficult feedback to a peer.',
    hint: 'How you prepared, what you said, how they reacted, and what happened to the working relationship.',
  },
  {
    id: 'automated-toil',
    number: 46,
    prompt: 'Tell me about a time you automated something that was eating the team\'s time.',
    hint: 'Quantify the toil before and after, and mention any resistance or edge cases you had to handle.',
  },
  {
    id: 'migration-or-deprecation',
    number: 47,
    prompt: 'Describe a time you migrated or deprecated something that other people depended on.',
    hint: 'How you found the dependents, the communication plan, the rollout, and what broke anyway.',
  },
  {
    id: 'changed-technical-opinion',
    number: 48,
    prompt: 'What is a strongly held technical opinion you changed your mind about, and why?',
    hint: 'Pick something real. Show the evidence or experience that moved you, not just that you were open-minded.',
  },
  {
    id: 'cross-team-launch',
    number: 49,
    prompt: 'Tell me about a time you coordinated a launch across multiple teams.',
    hint: 'Dependencies, the plan, how you tracked readiness, and how you handled the thing that slipped.',
  },
  {
    id: 'three-year-plan',
    number: 50,
    prompt: 'Where do you want to be in three years, and how does this role get you there?',
    hint: 'Be specific about skills and scope you want to grow into, and connect them to what this team actually does.',
  },
];

export const getBehavioralQuestion = (id: string) =>
  behavioralQuestions.find((q) => q.id === id);
