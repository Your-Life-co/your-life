export type GameStats = {
  age: number;
  money: number;
  energy: number;
  happiness: number;
  annualIncome: number;
  annualExpenses: number;
};

export type LifeProfile = {
  married: boolean;
  hasChildren: boolean;
  employed: boolean;
  ownsBusiness: boolean;
  ownsHome: boolean;
  inDebt: boolean;
  unemployed: boolean;
  relationshipBroken: boolean;
  flags: string[];
};

export type EventChoice = {
  label: string;
  result: string;
  money?: number;
  energy?: number;
  happiness?: number;
  income?: number;
  expenses?: number;
  addFlags?: string[];
  removeFlags?: string[];
  profileChanges?: Partial<Omit<LifeProfile, "flags">>;
  nextEvent?: string;
};

export type LifeEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  weight: number;
  once?: boolean;
  requires?: string[];
  excludes?: string[];
  choices: [EventChoice, EventChoice];
};

export type HistoryEntry = {
  age: number;
  eventTitle: string;
  category: string;
  choice: string;
  result: string;
};

export type GameState = {
  stats: GameStats;
  profile: LifeProfile;
  history: HistoryEntry[];
  seenEvents: string[];
  queuedEvent: string | null;
  chapterCount: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const initialGameState: GameState = {
  stats: {
    age: 18,
    money: 2000,
    energy: 80,
    happiness: 70,
    annualIncome: 24000,
    annualExpenses: 21000,
  },
  profile: {
    married: false,
    hasChildren: false,
    employed: true,
    ownsBusiness: false,
    ownsHome: false,
    inDebt: false,
    unemployed: false,
    relationshipBroken: false,
    flags: [],
  },
  history: [],
  seenEvents: [],
  queuedEvent: null,
  chapterCount: 0,
};

export const lifeEvents: LifeEvent[] = [
  {
    id: "new_relationship",
    title: "Someone Special",
    description: "You meet someone who could change your life. Do you take a chance?",
    category: "FAMILY",
    weight: 5,
    once: true,
    excludes: ["married"],
    choices: [
      {
        label: "Start a relationship",
        result: "A new relationship begins. Your life takes an unexpected turn.",
        money: -200,
        happiness: 15,
        addFlags: ["relationship"],
        nextEvent: "relationship_future",
      },
      {
        label: "Focus on yourself",
        result: "You decide that this is not the right time for a relationship.",
        energy: 5,
        happiness: 3,
      },
    ],
  },
  {
    id: "relationship_future",
    title: "Where Is This Going?",
    description: "Your relationship has grown stronger. It's time to decide what comes next.",
    category: "FAMILY",
    weight: 1,
    once: true,
    requires: ["relationship"],
    choices: [
      {
        label: "Get married",
        result: "You get married. A new chapter of your life begins.",
        money: -3000,
        happiness: 20,
        expenses: 2500,
        addFlags: ["married"],
        profileChanges: { married: true },
        nextEvent: "first_child",
      },
      {
        label: "Take it slowly",
        result: "You decide not to rush. Your relationship continues.",
        happiness: 5,
      },
    ],
  },
  {
    id: "first_child",
    title: "A New Life",
    description: "Your family is expecting a baby. Everything is about to change.",
    category: "FAMILY",
    weight: 1,
    once: true,
    requires: ["married"],
    choices: [
      {
        label: "Welcome the child",
        result: "You become a parent. Your responsibilities and priorities change.",
        money: -2000,
        energy: -15,
        happiness: 25,
        expenses: 4000,
        addFlags: ["child"],
        profileChanges: { hasChildren: true },
      },
      {
        label: "Prepare financially first",
        result: "You postpone the decision and focus on financial stability.",
        money: 1000,
        happiness: -3,
      },
    ],
  },
  {
    id: "family_pressure",
    title: "Family Responsibilities",description: "Your family needs more of your time and attention.",
    category: "FAMILY",
    weight: 4,
    requires: ["married"],
    choices: [
      {
        label: "Spend time with family",
        result: "Your family feels supported. Your career receives less attention.",
        money: -500,
        energy: -5,
        happiness: 15,
        expenses: 500,
      },
      {
        label: "Focus on your career",
        result: "You make progress professionally, but your family misses you.",
        energy: -10,
        happiness: -8,
        income: 2000,
      },
    ],
  },
  {
    id: "relationship_crisis",
    title: "A Difficult Period",
    description: "Your relationship is going through a serious crisis.",
    category: "FAMILY",
    weight: 3,
    requires: ["relationship"],
    choices: [
      {
        label: "Work things out",
        result: "You both make an effort to save the relationship.",
        money: -500,
        energy: -10,
        happiness: 8,
      },
      {
        label: "End the relationship",
        result: "You separate and begin a new chapter alone.",
        happiness: -20,
        expenses: -1000,
        addFlags: ["separated"],
        profileChanges: {
          married: false,
          relationshipBroken: true,
        },
      },
    ],
  },
  {
    id: "job_promotion",
    title: "A Career Breakthrough",
    description: "Your manager offers you a promotion with more responsibility.",
    category: "CAREER",
    weight: 5,
    choices: [
      {
        label: "Accept the promotion",
        result: "Your income grows, but the workload increases.",
        income: 7000,
        expenses: 1000,
        energy: -15,
        happiness: 5,
      },
      {
        label: "Keep your balance",
        result: "You choose stability and protect your personal time.",
        energy: 10,
        happiness: 8,
      },
    ],
  },
  {
    id: "job_loss",
    title: "Unexpected Job Loss",
    description: "Your company is restructuring. Your position is eliminated.",
    category: "CAREER",
    weight: 3,
    choices: [
      {
        label: "Find a new job",
        result: "You start looking for a new opportunity.",
        money: -1500,
        income: -4000,
        addFlags: ["job_search"],
        profileChanges: { employed: false, unemployed: true },
        nextEvent: "new_job",
      },
      {
        label: "Start working for yourself",
        result: "You decide to take control of your professional future.",
        money: -3000,
        energy: -15,
        income: 3000,
        addFlags: ["self_employed"],
        profileChanges: { employed: false, unemployed: false },
        nextEvent: "business_start",
      },
    ],
  },
];export const moreLifeEvents: LifeEvent[] = [
  {
    id: "new_job",
    title: "A New Opportunity",
    description: "After searching for a while, you receive a job offer.",
    category: "CAREER",
    weight: 1,
    once: true,
    requires: ["job_search"],
    choices: [
      {
        label: "Accept the offer",
        result: "You return to work with a fresh start.",
        income: 5000,
        happiness: 8,
        removeFlags: ["job_search"],
        profileChanges: { employed: true, unemployed: false },
      },
      {
        label: "Keep searching",
        result: "You reject the offer and continue looking.",
        money: -1000,
        energy: -5,
      },
    ],
  },
  {
    id: "business_start",
    title: "Your Own Business",
    description: "You have an idea and an opportunity to build something of your own.",
    category: "BUSINESS",
    weight: 1,
    once: true,
    requires: ["self_employed"],
    choices: [
      {
        label: "Invest and launch",
        result: "You launch your business. The future is uncertain.",
        money: -5000,
        income: 5000,
        expenses: 2000,
        energy: -15,
        addFlags: ["business"],
        profileChanges: { ownsBusiness: true },
        nextEvent: "business_result",
      },
      {
        label: "Wait for a better moment",
        result: "You keep your savings and reconsider the idea later.",
        happiness: -3,
      },
    ],
  },
  {
    id: "business_result",
    title: "The Business Reality",
    description: "Your business has reached an important turning point.",
    category: "BUSINESS",
    weight: 1,
    once: true,
    requires: ["business"],
    choices: [
      {
        label: "Expand the business",
        result: "You invest again and grow your operation.",
        money: -3000,
        income: 10000,
        expenses: 3000,
        energy: -10,
        happiness: 10,
      },
      {
        label: "Protect what you have",
        result: "You avoid unnecessary risks and stabilize the business.",
        income: 3000,
        happiness: 5,
      },
    ],
  },
  {
    id: "business_failure",
    title: "Business Failure",
    description: "Sales have collapsed. Your business is losing money.",
    category: "CRISIS",
    weight: 2,
    requires: ["business"],
    choices: [
      {
        label: "Try to save it",
        result: "You invest your remaining resources to keep the business alive.",
        money: -5000,
        energy: -15,
        happiness: -10,
      },
      {
        label: "Close the business",
        result: "You accept the loss and start rebuilding.",
        income: -5000,
        expenses: -2000,
        happiness: -15,
        profileChanges: { ownsBusiness: false },
        removeFlags: ["business"],
      },
    ],
  },
  {
    id: "investment_success",
    title: "A Profitable Investment",
    description: "One of your investments has performed better than expected.",
    category: "INVESTMENT",
    weight: 3,
    choices: [
      {
        label: "Reinvest the profit",
        result: "You put your gains back to work.",
        money: 3000,
        income: 2000,
      },
      {
        label: "Take the profit",
        result: "You secure the money and enjoy your progress.",
        money: 7000,
        happiness: 10,
      },
    ],
  },
  {
    id: "investment_loss",
    title: "A Bad Investment",
    description: "The market moves against you. Your investment loses value.",
    category: "CRISIS",
    weight: 3,
    choices: [
      {
        label: "Hold your position",
        result: "You accept the risk and wait for recovery.",
        money: -3000,
        energy: -5,
      },
      {
        label: "Cut your losses",
        result: "You sell and protect the rest of your savings.",
        money: -1500,
        happiness: -5,
      },
    ],
  },
  {
    id: "unexpected_debt",
    title: "Unexpected Debt",
    description: "An unexpected expense leaves you with a serious financial problem.",
    category: "FINANCE",
    weight: 4,
    choices: [
      {label: "Use your savings",
        result: "You pay the bill without taking a loan.",
        money: -4000,
        happiness: -3,
      },
      {
        label: "Borrow the money",
        result: "You solve the immediate problem but take on debt.",
        money: 1000,
        expenses: 1500,
        addFlags: ["debt"],
        profileChanges: { inDebt: true },
      },
    ],
  },
  {
    id: "inheritance",
    title: "Unexpected Inheritance",
    description: "A relative leaves you an inheritance.",
    category: "FINANCE",
    weight: 1,
    once: true,
    choices: [
      {
        label: "Save the money",
        result: "You strengthen your financial position.",
        money: 15000,
      },
      {
        label: "Improve your life",
        result: "You spend part of the inheritance on something meaningful.",
        money: 8000,
        happiness: 15,
      },
    ],
  },
  {
    id: "fraud",
    title: "Financial Scam",
    description: "You discover that someone has tricked you into sending money.",
    category: "CRISIS",
    weight: 2,
    choices: [
      {
        label: "Report the fraud",
        result: "You take action. Recovery is uncertain.",
        money: -2000,
        energy: -10,
        happiness: -8,
      },
      {
        label: "Move on",
        result: "You accept the loss and become more cautious.",
        money: -5000,
        happiness: -12,
      },
    ],
  },
  {
    id: "buy_home",
    title: "A Chance to Buy a Home",
    description: "You find a home that could become your family's long-term base.",
    category: "LIFESTYLE",
    weight: 2,
    choices: [
      {
        label: "Buy the property",
        result: "You become a homeowner and take on new responsibilities.",
        money: -12000,
        expenses: 2500,
        happiness: 15,
        addFlags: ["home"],
        profileChanges: { ownsHome: true },
      },
      {
        label: "Keep renting",
        result: "You preserve your savings and stay flexible.",
        money: -500,
        happiness: 2,
      },
    ],
  },
  {
    id: "relocation",
    title: "A New City",
    description: "An opportunity appears in another city. A fresh start is possible.",
    category: "LIFE_EVENT",
    weight: 2,
    choices: [
      {
        label: "Move",
        result: "You begin a new chapter in a different place.",
        money: -3000,
        energy: -10,
        happiness: 10,
        income: 3000,
      },
      {
        label: "Stay where you are",
        result: "You choose familiarity and stability.",
        happiness: 3,
      },
    ],
  },
];export const finalLifeEvents: LifeEvent[] = [
{
id: "health_warning",
title: "A Health Warning",
description: "Your body is telling you that your current lifestyle is not sustainable.",
category: "HEALTH",
weight: 3,
choices: [
{
label: "Take a proper break",
result: "You rest and begin taking better care of yourself.",
money: -1000,
energy: 20,
happiness: 10,
},
{
label: "Keep pushing",
result: "You ignore the warning and continue working.",
income: 2000,
energy: -20,
happiness: -10,
},
],
},
{
id: "career_change",
title: "A Career Change",
description: "You are offered a chance to learn a completely new profession.",
category: "CAREER",
weight: 3,
choices: [
{
label: "Learn a new skill",
result: "You invest in your future and open new career paths.",
money: -1500,
energy: -5,
happiness: 10,
income: 4000,
},
{
label: "Stay in your field",
result: "You keep your experience and avoid starting over.",
money: 500,
happiness: 3,
},
],
},
{
id: "child_education",
title: "Your Child's Future",
description: "Your child needs support with an important educational opportunity.",
category: "FAMILY",
weight: 2,
requires: ["child"],
choices: [
{
label: "Invest in education",
result: "You support your child's development.",
money: -3000,
happiness: 15,
expenses: 1000,
},
{
label: "Choose a practical option",
result: "You find a more affordable way forward.",
money: -500,
happiness: 5,
},
],
},
{
id: "parent_care",
title: "Caring for a Parent",
description: "An aging parent needs more help and attention.",
category: "FAMILY",
weight: 2,
choices: [
{
label: "Be there for them",
result: "You make family a priority during a difficult time.",
money: -2000,
energy: -10,
happiness: 10,
expenses: 1000,
},
{
label: "Arrange professional support",
result: "You organize reliable help, but it comes at a cost.",
money: -4000,
energy: 5,
happiness: 5,
expenses: 2000,
},
],
},
{
id: "friend_opportunity",
title: "A Friend's Proposal",
description: "A friend invites you to join a new project.",
category: "OPPORTUNITY",
weight: 3,
choices: [
{
label: "Work together",
result: "You take a chance on a new partnership.",
money: -1000,
energy: -5,
income: 3000,
addFlags: ["partnership"],
},
{
label: "Keep things separate",
result: "You protect the friendship and avoid business risk.",
happiness: 5,
},
],
},
{
id: "partnership_conflict",
title: "A Partnership Dispute",
description: "You and your business partner disagree about the future.",
category: "BUSINESS",
weight: 2,
requires: ["partnership"],
choices: [
{
label: "Negotiate",
result: "You reach a compromise and keep working together.",
energy: -5,
happiness: 5,
},
{
label: "Go separate ways",
result: "You end the partnership and move forward independently.",
money: -1000,
happiness: -5,
removeFlags: ["partnership"],
},
],
},
{
id: "lottery",
title: "A Lucky Surprise",
description: "You receive an unexpected small financial reward.",
category: "DESTINY",
weight: 1,
choices: [
{
label: "Save it",
result: "You add the money to your savings.",
money: 5000,
},
{
label: "Celebrate",
result: "You enjoy the moment and share it with others.",
money: 2500,
happiness: 15,
},
],
},
{
id: "major_crisis",
title: "Everything at Once",
description: "Several problems arrive at the same time. You must choose what matters most.",
category: "CRISIS",
weight: 2,
choices: [
{
label: "Protect your finances",
result: "You make difficult cuts to protect your future.",
money: -2000,
happiness: -10,
expenses: -1000,
},
{
label: "Protect your well-being",
result: "You accept a financial setback to protect your energy.",
money: -5000,
energy: 15,
happiness: 10,
},
],
},
{
id: "retirement",
title: "Thinking About Retirement",
description: "You begin thinking about how you want the next chapter of life to look.",
category: "MILESTONE",
weight: 2,
choices: [
{
label: "Prepare for retirement",
result: "You reduce risks and focus on long-term security.",
money: -1000,
income: -2000,
expenses: -1000,
happiness: 10,
},
{
label: "Keep working",
result: "You stay active and continue building your resources.",
income: 3000,
energy: -5,
},],
},
{
id: "new_hobby",
title: "A New Passion",
description: "You discover an activity that brings new energy into your life.",
category: "LIFESTYLE",
weight: 4,
choices: [
{
label: "Make time for it",
result: "You find more balance and enjoyment in everyday life.",
money: -500,
energy: 10,
happiness: 15,
},
{
label: "Focus on responsibilities",
result: "You postpone the hobby and keep your current routine.",
income: 1000,
happiness: -3,
},
],
},
{
id: "travel",
title: "The Journey",
description: "You have a chance to travel and see something new.",
category: "LIFESTYLE",
weight: 3,
choices: [
{
label: "Take the trip",
result: "You create memories that stay with you.",
money: -2500,
energy: 10,
happiness: 20,
},
{
label: "Save the money",
result: "You decide that financial security comes first.",
money: 1000,
happiness: 2,
},
],
},
{
id: "unexpected_opportunity",
title: "A Once-in-a-Lifetime Chance",
description: "An unusual opportunity appears, but it requires courage.",
category: "OPPORTUNITY",
weight: 2,
choices: [
{
label: "Take the risk",
result: "You step into the unknown. The decision may change your future.",
money: -2000,
energy: -10,
happiness: 10,
income: 5000,
},
{
label: "Play it safe",
result: "You protect what you have and wait for another chance.",
money: 500,
energy: 5,
},
],
},
];

export const allLifeEvents: LifeEvent[] = [
...lifeEvents,
...moreLifeEvents,
...finalLifeEvents,
];

export function getEventById(id: string): LifeEvent | undefined {
return allLifeEvents.find((event) => event.id === id);
}

export function getEligibleEvents(state: GameState): LifeEvent[] {
return allLifeEvents.filter((event) => {
if (event.once && state.seenEvents.includes(event.id)) return false;

const flags = state.profile.flags;

if (event.requires?.some((flag) => !flags.includes(flag))) {
  return false;
}

if (event.excludes?.some((flag) => flags.includes(flag))) {
  return false;
}

return true;
});
}

export function drawLifeEvent(
state: GameState,
random: () => number = Math.random,
): LifeEvent | null {
if (state.queuedEvent) {
const queued = getEventById(state.queuedEvent);
if (queued) return queued;
}

const available = getEligibleEvents(state);

if (available.length === 0) return null;

const totalWeight = available.reduce(
(sum, event) => sum + event.weight,
0,
);

let roll = random() * totalWeight;

for (const event of available) {
roll -= event.weight;
if (roll <= 0) return event;
}

return available[available.length - 1];
}export function applyEventChoice(
current: GameState,
event: LifeEvent,
choiceIndex: 0 | 1,
): GameState {
const choice = event.choices[choiceIndex];

const nextStats: GameStats = {
age: Math.min(80, current.stats.age + 2),
money: current.stats.money + (choice.money ?? 0),
energy: clamp(current.stats.energy + (choice.energy ?? 0), 0, 100),
happiness: clamp(
current.stats.happiness + (choice.happiness ?? 0),
0,
100,
),
annualIncome: Math.max(
0,
current.stats.annualIncome + (choice.income ?? 0),
),
annualExpenses: Math.max(
0,
current.stats.annualExpenses + (choice.expenses ?? 0),
),
};

const twoYearResult =
(nextStats.annualIncome - nextStats.annualExpenses) * 2;

nextStats.money += twoYearResult;

const nextFlags = new Set(current.profile.flags);

choice.addFlags?.forEach((flag) => nextFlags.add(flag));
choice.removeFlags?.forEach((flag) => nextFlags.delete(flag));

const nextProfile: LifeProfile = {
...current.profile,
...choice.profileChanges,
flags: [...nextFlags],
};

const historyEntry: HistoryEntry = {
age: nextStats.age,
eventTitle: event.title,
category: event.category,
choice: choice.label,
result: choice.result,
};

return {
stats: nextStats,
profile: nextProfile,
history: [...current.history, historyEntry],
seenEvents: event.once
? [...current.seenEvents, event.id]
: current.seenEvents,
queuedEvent: choice.nextEvent ?? null,
chapterCount: current.chapterCount + 1,
};
}

export function buildLifeJournal(state: GameState): string[] {
  const lines: string[] = [];
  const stats = state.stats;
  const profile = state.profile;
  const history = state.history;

  lines.push("You lived to the age of " + stats.age + ".");

  if (profile.married) {
    lines.push("You built a marriage and shared important years with your partner.");
  } else if (profile.relationshipBroken) {
    lines.push("Your life included a difficult relationship chapter and a new beginning.");
  } else {
    lines.push("Your personal life followed its own path.");
  }

  if (profile.hasChildren) {
    lines.push("You became a parent and took responsibility for another generation.");
  }

  if (profile.ownsBusiness) {
    lines.push("You built your own business and experienced the risks of entrepreneurship.");
  }

  if (profile.ownsHome) {
    lines.push("You achieved home ownership.");
  }

  if (profile.inDebt) {
    lines.push("Debt became one of the financial challenges of your life.");
  }

  if (profile.unemployed) {
    lines.push("Your career included a period without employment.");
  }

  lines.push(
    "You finished with $" +
    stats.money.toLocaleString("en-US") +
    " in available money."
  );

  lines.push(
    "Your annual income was $" +
    stats.annualIncome.toLocaleString("en-US") +
    "."
  );

  lines.push(
    "Your annual expenses were $" +
    stats.annualExpenses.toLocaleString("en-US") +
    "."
  );

  lines.push("Your final energy level was " + stats.energy + "/100.");
  lines.push("Your final happiness level was " + stats.happiness + "/100.");
  lines.push("You made " + history.length + " important life decisions.");

  const categories = [...new Set(history.map((entry) => entry.category))];

  if (categories.length > 0) {
    lines.push("Your journey included: " + categories.join(", ") + ".");
  }

  return lines;
}