export { problems } from '../../src/data/more/js-debug-2';

export const fixes: Record<string, string> = {
  'js-splice-missing-index': `function removeItem(list, item) {
  const copy = list.slice();
  const index = copy.indexOf(item);
  if (index !== -1) {
    copy.splice(index, 1);
  }
  return copy;
}
`,
  'js-template-plain-quotes':
    'function cartMessage(name, count) {\n  return `Hi ${name}, your cart has ${count} item(s).`;\n}\n',
  'js-chained-comparison': `function isBetween(low, value, high) {
  return low < value && value < high;
}
`,
  'js-parsefloat-thousands': `function parseAmount(text) {
  return parseFloat(text.replace(/,/g, ''));
}
`,
  'js-sort-subtract-strings': `function sortByName(people) {
  return people.slice().sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}
`,
  'js-switch-strict-match': `function statusLabel(code) {
  switch (Number(code)) {
    case 200:
      return 'OK';
    case 404:
      return 'Not Found';
    case 500:
      return 'Server Error';
    default:
      return 'Unknown';
  }
}
`,
  'js-foreach-return-lost': `function firstOverLimit(readings, limit) {
  for (const reading of readings) {
    if (reading > limit) {
      return reading;
    }
  }
  return null;
}
`,
  'js-regex-unanchored-test': String.raw`function isPin(text) {
  return /^\d{4}$/.test(text);
}
`,
  'js-object-assign-target': `const DEFAULTS = { theme: 'light', fontSize: 14, notifications: true };

function buildSettings(overrides) {
  return Object.assign({}, DEFAULTS, overrides);
}
`,
  'js-regex-greedy-quantifier': `function firstQuoted(text) {
  const match = text.match(/"([^"]*)"/);
  return match ? match[1] : null;
}
`,
  'js-string-false-is-truthy': `function parseFlag(value) {
  return value.toLowerCase() === 'true';
}
`,
  'js-dollars-to-cents-floor': `function centsField(dollars) {
  return String(Math.round(dollars * 100));
}
`,
  'js-in-sees-inherited': `const ROLE_LEVELS = { viewer: 1, editor: 2, admin: 3 };

function roleLevel(role) {
  if (Object.prototype.hasOwnProperty.call(ROLE_LEVELS, role)) {
    return ROLE_LEVELS[role];
  }
  return 0;
}
`,
  'js-split-capturing-group': `function splitFields(line) {
  return line.split(/[,;]/);
}
`,
  'js-date-seconds-not-millis': `function yearOf(unixSeconds) {
  return new Date(unixSeconds * 1000).getUTCFullYear();
}
`,
  'js-parseint-trailing-garbage': String.raw`function isWholeNumber(text) {
  return /^-?\d+$/.test(text);
}
`,
  'js-object-key-collision': `function countDistinctUsers(events) {
  const seen = {};
  for (const event of events) {
    seen[event.user.id] = true;
  }
  return Object.keys(seen).length;
}
`,
  'js-version-string-compare': `function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const x = i < pa.length ? pa[i] : 0;
    const y = i < pb.length ? pb[i] : 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}
`,
  'js-regexp-unescaped-input': `function countOccurrences(text, term) {
  return text.split(term).length - 1;
}
`,
  'js-json-compare-key-order': `function sameSettings(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && a[key] === b[key]);
}
`,
  'js-null-compares-as-zero': `function averageAnswered(scores) {
  let sum = 0;
  let count = 0;
  for (const score of scores) {
    if (typeof score === 'number' && score >= 0) {
      sum += score;
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}
`,
  'js-replacement-dollar-patterns': `function fillTemplate(template, value) {
  return template.replace('{value}', () => value);
}
`,
  'js-shallow-merge-nested': `function mergeConfig(defaults, overrides) {
  const isSection = (v) => typeof v === 'object' && v !== null;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (isSection(defaults[key]) && isSection(overrides[key])) {
      result[key] = { ...defaults[key], ...overrides[key] };
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}
`,
  'js-add-months-overflow': `function addMonths(isoDate, months) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const target = month - 1 + months;
  const lastDay = new Date(Date.UTC(year, target + 1, 0)).getUTCDate();
  const result = new Date(Date.UTC(year, target, Math.min(day, lastDay)));
  return result.toISOString().slice(0, 10);
}
`,
  'js-tofixed-half-cent': `function roundPrice(text) {
  const [whole, fraction = ''] = text.split('.');
  const digits = (fraction + '000').slice(0, 3);
  let cents = Number(whole) * 100 + Number(digits.slice(0, 2));
  if (digits[2] >= '5') {
    cents += 1;
  }
  const padded = String(cents).padStart(3, '0');
  return padded.slice(0, -2) + '.' + padded.slice(-2);
}
`,
};
