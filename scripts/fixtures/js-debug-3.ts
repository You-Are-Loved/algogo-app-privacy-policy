// Reference fixes for src/data/more/js-debug-3.ts (JavaScript debug problems 126-150).

export { problems } from '../../src/data/more/js-debug-3';

export const fixes: Record<string, string> = {
  'js-async-price-not-awaited': `const PRICES = { apple: 3, bread: 4, milk: 2, cheese: 7 };

// Pretend this is a network call.
async function fetchPrice(name) {
  await null;
  return PRICES[name] || 0;
}

async function cartTotal(items) {
  let total = 0;
  for (const item of items) {
    const price = await fetchPrice(item.name);
    total += price * item.qty;
  }
  return total;
}
`,
  'js-memo-cache-rebuilt-per-call': `function memoize(fn) {
  const cache = {};
  return function (n) {
    if (n in cache) return cache[n];
    const value = fn(n);
    cache[n] = value;
    return value;
  };
}

function squareAll(nums) {
  let computed = 0;
  const square = memoize(function (n) {
    computed++;
    return n * n;
  });
  const results = nums.map(function (n) {
    return square(n);
  });
  return { results: results, computed: computed };
}
`,
  'js-tdz-helper-reads-const-early': `function invoiceTotal(lines) {
  const TAX_PERCENT = 20;

  let subtotal = 0;
  for (const line of lines) {
    subtotal += line.price * line.qty;
  }

  const total = addTax(subtotal);

  function addTax(amount) {
    return amount + (amount * TAX_PERCENT) / 100;
  }

  return total;
}
`,
  'js-arrow-method-has-no-this': `function describeAccount(owner, balance) {
  const account = {
    owner: owner,
    balance: balance,
    summary() {
      return this.owner + ' has ' + this.balance + ' credits';
    },
  };
  return account.summary();
}
`,
  'js-bind-first-arg-is-this': `function scale(factor, value) {
  return factor * value;
}

function applyDiscount(prices, percentOff) {
  const keep = (100 - percentOff) / 100;
  const discount = scale.bind(null, keep);
  return prices.map(discount);
}
`,
  'js-subclass-constructor-skips-super': `class Shape {
  constructor(label) {
    this.label = label;
  }
  describe() {
    return this.label + ' with area ' + this.area();
  }
}

class Rect extends Shape {
  constructor(label, width, height) {
    super(label);
    this.width = width;
    this.height = height;
  }
  area() {
    return this.width * this.height;
  }
}

function describeRect(label, width, height) {
  return new Rect(label, width, height).describe();
}
`,
  'js-throwing-bare-strings': `function checkAge(age) {
  if (typeof age !== 'number') throw new Error('age must be a number');
  if (age < 0) throw new Error('age cannot be negative');
  return age;
}

function validateAge(age) {
  try {
    return { ok: true, age: checkAge(age) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
`,
  'js-foreach-ignores-async-callbacks': `// Pretend database write that takes record.ms milliseconds.
function saveRecord(record) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('id-' + record.name);
    }, record.ms);
  });
}

async function saveAll(records) {
  const ids = [];
  for (const record of records) {
    const id = await saveRecord(record);
    ids.push(id);
  }
  return ids;
}
`,
  'js-filter-with-async-predicate': `const BLOCKED = ['spam.example', 'junk.example'];

// Pretend this asks a remote reputation service.
async function isAllowed(email) {
  await null;
  const domain = email.split('@')[1];
  return !BLOCKED.includes(domain);
}

async function allowedEmails(emails) {
  const flags = await Promise.all(emails.map(isAllowed));
  return emails.filter(function (email, i) {
    return flags[i];
  });
}
`,
  'js-then-callback-drops-inner-promise': `const USERS = { 1: 'Ada', 2: 'Lin', 3: 'Sam', 4: 'Mia', 5: 'Zed' };
const ORDERS = {
  Ada: ['book', 'pen'],
  Lin: [],
  Sam: ['lamp'],
  Mia: ['desk', 'chair', 'rug', 'vase'],
  Zed: ['mug', 'tea', 'kettle'],
};

function getUser(id) {
  return Promise.resolve({ id: id, name: USERS[id] });
}

function getOrders(name) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(ORDERS[name]);
    }, 1);
  });
}

function loadProfile(id) {
  const profile = { name: '', orderCount: 0 };
  return getUser(id)
    .then(function (user) {
      profile.name = user.name;
      return getOrders(user.name).then(function (orders) {
        profile.orderCount = orders.length;
      });
    })
    .then(function () {
      return profile.name + ': ' + profile.orderCount + ' orders';
    });
}
`,
  'js-retry-loop-keeps-going': `async function retry(outcomes, maxAttempts) {
  let calls = 0;

  // The flaky operation: consumes one outcome per call.
  async function attempt() {
    const outcome = outcomes[calls];
    calls++;
    await null;
    if (typeof outcome !== 'number') throw new Error(outcome);
    return outcome;
  }

  let lastError = null;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const value = await attempt();
      return { ok: true, value: value, attempts: calls };
    } catch (err) {
      lastError = err;
    }
  }
  return { ok: false, error: lastError.message, attempts: calls };
}
`,
  'js-stale-closure-click-handler': `function countClicks(start, clicks) {
  let state = { count: start };

  function setState(next) {
    state = next;
  }

  function render() {
    const count = state.count;
    return {
      label: 'Count: ' + count,
      onClick: function () {
        setState({ count: state.count + 1 });
      },
    };
  }

  const view = render(); // drawn once before the burst of clicks
  for (let i = 0; i < clicks; i++) {
    view.onClick();
  }
  return render().label;
}
`,
  'js-undeclared-variable-in-recursion': `function listTeam(person) {
  let names = [person.name];
  for (const report of person.reports) {
    const below = listTeam(report);
    names = names.concat(below);
  }
  return names;
}
`,
  'js-class-method-passed-detached': `class Tally {
  constructor() {
    this.counts = {};
  }
  record(name) {
    this.counts[name] = (this.counts[name] || 0) + 1;
  }
}

function tallyVotes(votes) {
  const tally = new Tally();
  votes.forEach(function (name) {
    tally.record(name);
  });
  return tally.counts;
}
`,
  'js-debounce-timer-not-restarted': `function debounceFires(calls, wait) {
  const fires = [];
  let deadline = null; // when the pending countdown ends, or null if none

  for (const t of calls) {
    if (deadline !== null && t >= deadline) {
      fires.push(deadline);
    }
    deadline = t + wait;
  }

  if (deadline !== null) fires.push(deadline);
  return fires;
}
`,
  'js-assigning-to-getter-only-property': `class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }
  get fahrenheit() {
    return (this.celsius * 9) / 5 + 32;
  }
  set fahrenheit(f) {
    this.celsius = ((f - 32) * 5) / 9;
  }
}

function warmUp(celsius, degreesF) {
  const t = new Temperature(celsius);
  t.fahrenheit = t.fahrenheit + degreesF;
  return { celsius: t.celsius, fahrenheit: t.fahrenheit };
}
`,
  'js-generator-consumed-twice': `function* passing(scores, cutoff) {
  for (const score of scores) {
    if (score >= cutoff) yield score;
  }
}

function passStats(scores, cutoff) {
  const passed = [...passing(scores, cutoff)];

  let count = 0;
  for (const score of passed) {
    count++;
  }

  let total = 0;
  for (const score of passed) {
    total += score;
  }

  return { count: count, average: count === 0 ? 0 : total / count };
}
`,
  'js-urgent-jobs-on-the-slow-queue': `async function runJobs(jobs) {
  const log = [];

  for (const job of jobs) {
    const run = function () {
      log.push(job.name);
    };
    if (job.urgent) {
      Promise.resolve().then(run);
    } else {
      setTimeout(run, 0);
    }
  }
  log.push('queued');

  // Give everything that was scheduled time to run.
  await new Promise(function (resolve) {
    setTimeout(resolve, 2);
  });
  return log;
}
`,
  'js-memo-key-runs-arguments-together': `function areaReport(rooms) {
  const cache = {};
  let computed = 0;

  function area(width, height) {
    const key = width + ',' + height;
    if (!(key in cache)) {
      computed++;
      cache[key] = width * height;
    }
    return cache[key];
  }

  const areas = rooms.map(function (room) {
    return area(room[0], room[1]);
  });
  return { areas: areas, computed: computed };
}
`,
  'js-throttle-rejected-calls-reset-window': `function throttle(calls, interval) {
  const accepted = [];
  let last = null; // timestamp the window is measured from

  for (const t of calls) {
    if (last === null || t - last >= interval) {
      accepted.push(t);
      last = t;
    }
  }
  return accepted;
}
`,
  'js-slow-response-overwrites-newer-one': `// Pretend network search that answers after ms milliseconds.
function search(q, ms) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('results for ' + q);
    }, ms);
  });
}

async function typeAhead(requests) {
  let shown = '';
  let latest = 0;

  const pending = requests.map(function (request) {
    const id = ++latest;
    return search(request.q, request.ms).then(function (results) {
      if (id === latest) shown = results;
    });
  });

  await Promise.all(pending);
  return shown;
}
`,
  'js-try-catch-misses-returned-promise': `const STOCK = { widget: 4, gadget: 0, gizmo: 1 };

// Pretend this talks to the warehouse service.
async function reserve(item) {
  await null;
  if (!(item in STOCK)) throw new Error('unknown item: ' + item);
  if (STOCK[item] === 0) throw new Error('out of stock: ' + item);
  return 'reserved ' + item;
}

async function safeReserve(item) {
  try {
    return await reserve(item);
  } catch (err) {
    return 'failed: ' + err.message;
  }
}
`,
  'js-compound-assignment-across-await': `// Pretend remote lookup that answers after file.ms milliseconds.
function fetchSize(file) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(file.size);
    }, file.ms);
  });
}

async function totalSize(files) {
  let total = 0;

  await Promise.all(
    files.map(async function (file) {
      const size = await fetchSize(file);
      total += size;
    })
  );

  return total;
}
`,
  'js-array-on-prototype-shared-by-instances': `function Inbox(owner) {
  this.owner = owner;
  this.messages = [];
}
Inbox.prototype.receive = function (text) {
  this.messages.push(text);
};

function deliver(mail) {
  const inboxes = {};
  for (const message of mail) {
    if (!inboxes[message.to]) {
      inboxes[message.to] = new Inbox(message.to);
    }
    inboxes[message.to].receive(message.text);
  }

  const result = {};
  for (const owner in inboxes) {
    result[owner] = inboxes[owner].messages;
  }
  return result;
}
`,
  'js-break-closes-the-generator': `function* reader(rows) {
  for (const row of rows) {
    yield row;
  }
}

function splitMessage(rows) {
  const input = reader(rows);

  const headers = [];
  let step = input.next();
  while (!step.done && step.value !== '') {
    headers.push(step.value);
    step = input.next();
  }

  const body = [];
  for (const row of input) {
    body.push(row);
  }

  return { headers: headers, body: body };
}
`,
};
