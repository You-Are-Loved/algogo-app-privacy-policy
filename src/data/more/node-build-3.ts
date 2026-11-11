// Node.js build problems 76-100: data-layer and async-flow logic (queues, leases, breakers,
// replay, replication, caches) as pure or async functions over plain data. Time is always an argument.

import type { BugFixProblem } from '../bugFixes';

export const problems: BugFixProblem[] = [
  {
    id: 'node-bulk-insert-batch-packer',
    number: 76,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Bulk Insert Batch Packer',
    difficulty: 'Easy',
    topic: 'Data & Streams',
    statement:
      'An analytics service writes click records to its database in bulk, and the database rejects any bulk request that carries too many rows or too many bytes. Implement `packBatches(records, maxCount, maxBytes)`.\n' +
      '\n' +
      '- `records` is an array of `{ id, bytes }` in arrival order (`bytes` is a positive integer). Records are never reordered.\n' +
      '- A record with `bytes > maxBytes` can never be sent: put its `id` in `rejected` and move on. It does NOT close the batch that is currently open.\n' +
      '- Otherwise the record joins the open batch, unless that would give the batch more than `maxCount` records or more than `maxBytes` bytes in total. In that case close the open batch first and start a new one with this record. A batch may hold exactly `maxCount` records and exactly `maxBytes` bytes.\n' +
      '- Return `{ batches, rejected }` where `batches` is an array of `{ ids, bytes }` (the record ids in order and their total size) and `rejected` lists the rejected ids in order. Never emit an empty batch; no records gives `{ batches: [], rejected: [] }`.',
    functionName: 'packBatches',
    functionSignature: 'function packBatches(records, maxCount, maxBytes)',
    buggyCode:
      'function packBatches(records, maxCount, maxBytes) {\n' +
      '  // TODO: walk the records in order, keeping one open batch.\n' +
      '  // - bytes > maxBytes: id goes to rejected, the open batch stays open\n' +
      '  // - would exceed maxCount or maxBytes: close the open batch, start a new one\n' +
      '  // Return { batches: [{ ids, bytes }], rejected: [ids] }.\n' +
      '}\n',
    solution:
      'function packBatches(records, maxCount, maxBytes) {\n' +
      '  const batches = [];\n' +
      '  const rejected = [];\n' +
      '  let open = null;\n' +
      '  for (const record of records) {\n' +
      '    if (record.bytes > maxBytes) {\n' +
      '      rejected.push(record.id);\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (open && (open.ids.length + 1 > maxCount || open.bytes + record.bytes > maxBytes)) {\n' +
      '      batches.push(open);\n' +
      '      open = null;\n' +
      '    }\n' +
      '    if (!open) open = { ids: [], bytes: 0 };\n' +
      '    open.ids.push(record.id);\n' +
      '    open.bytes += record.bytes;\n' +
      '  }\n' +
      '  if (open) batches.push(open);\n' +
      '  return { batches, rejected };\n' +
      '}\n',
    hint: 'Keep a single open batch. Decide BEFORE adding a record whether it still fits; an exact fit is allowed, and an oversized record is skipped without touching the open batch.',
    explanation: 'Bulk APIs usually cap both the row count and the payload size, so a packer has to check two limits at once. Keep one open batch and, for each record, ask "would adding this break either limit?" before adding it; if so, flush and start a fresh batch with the record. Two details cause most bugs: using `>=` where the limit is inclusive (which wastes the last slot or byte), and letting a record that can never fit either close the open batch or sit in a batch of its own that the database will refuse. One pass, O(n) time, and only the open batch is held besides the output.',
    examples: [
      { input: [[{"id":"a","bytes":40},{"id":"b","bytes":50},{"id":"c","bytes":30},{"id":"d","bytes":10}],3,100], expected: {"batches":[{"ids":["a","b"],"bytes":90},{"ids":["c","d"],"bytes":40}],"rejected":[]} },
      { input: [[{"id":"a","bytes":60},{"id":"big","bytes":500},{"id":"b","bytes":40},{"id":"c","bytes":1}],5,100], expected: {"batches":[{"ids":["a","b"],"bytes":100},{"ids":["c"],"bytes":1}],"rejected":["big"]} },
      { input: [[{"id":"r1","bytes":1},{"id":"r2","bytes":1},{"id":"r3","bytes":1},{"id":"r4","bytes":1},{"id":"r5","bytes":1}],2,100], expected: {"batches":[{"ids":["r1","r2"],"bytes":2},{"ids":["r3","r4"],"bytes":2},{"ids":["r5"],"bytes":1}],"rejected":[]} },
    ],
    hiddenTests: [
      { input: [[],3,100], expected: {"batches":[],"rejected":[]} },
      { input: [[{"id":"x","bytes":101},{"id":"y","bytes":999}],3,100], expected: {"batches":[],"rejected":["x","y"]} },
      { input: [[{"id":"x","bytes":100},{"id":"y","bytes":100},{"id":"z","bytes":99},{"id":"w","bytes":1}],10,100], expected: {"batches":[{"ids":["x"],"bytes":100},{"ids":["y"],"bytes":100},{"ids":["z","w"],"bytes":100}],"rejected":[]} },
      { input: [[{"id":"p","bytes":5},{"id":"q","bytes":5},{"id":"r","bytes":5}],1,100], expected: {"batches":[{"ids":["p"],"bytes":5},{"ids":["q"],"bytes":5},{"ids":["r"],"bytes":5}],"rejected":[]} },
      { input: [[{"id":"a","bytes":30},{"id":"b","bytes":30},{"id":"huge","bytes":61},{"id":"c","bytes":30},{"id":"d","bytes":30},{"id":"e","bytes":60}],3,60], expected: {"batches":[{"ids":["a","b"],"bytes":60},{"ids":["c","d"],"bytes":60},{"ids":["e"],"bytes":60}],"rejected":["huge"]} },
    ],
  },
  {
    id: 'node-inventory-circuit-breaker',
    number: 77,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Inventory Circuit Breaker Timeline',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A checkout service wraps its calls to a flaky inventory service in a circuit breaker, and wants the breaker logic replayable from a log with no real clock. Implement `runBreaker(calls, config)`.\n' +
      '\n' +
      '- `config` is `{ failureThreshold, cooldownMs }`. `calls` is an array of `{ t, ok }` sorted by `t` (milliseconds); `ok` says whether the inventory service WOULD succeed if this call reached it.\n' +
      '- The breaker starts `"closed"` with a consecutive-failure count of 0.\n' +
      '- While closed, every call goes through. A success resets the count to 0. A failure adds 1, and when the count reaches `failureThreshold` the breaker opens and remembers `openedAt = t`.\n' +
      '- While open, a call with `t - openedAt < cooldownMs` is rejected without reaching the service; it changes nothing (in particular it does not restart the cooldown).\n' +
      '- The first call with `t - openedAt >= cooldownMs` is a probe and goes through. If it succeeds the breaker closes with the count back at 0. If it fails the breaker stays open and the cooldown restarts from this call (`openedAt = t`).\n' +
      '- Return one `{ outcome, state }` per call: `outcome` is `"ok"`, `"fail"` or `"rejected"`, and `state` is the breaker state right after the call, `"closed"` or `"open"`.',
    functionName: 'runBreaker',
    functionSignature: 'function runBreaker(calls, config)',
    buggyCode:
      'function runBreaker(calls, config) {\n' +
      '  // TODO: replay the calls through a circuit breaker.\n' +
      '  // closed: count consecutive failures, open at failureThreshold (openedAt = t)\n' +
      '  // open:   reject while t - openedAt < cooldownMs; otherwise let one probe through\n' +
      '  // probe:  ok -> closed (count 0), fail -> open again with openedAt = t\n' +
      '  // Return [{ outcome: \'ok\' | \'fail\' | \'rejected\', state: \'closed\' | \'open\' }, ...].\n' +
      '}\n',
    solution:
      'function runBreaker(calls, config) {\n' +
      '  let state = \'closed\';\n' +
      '  let failures = 0;\n' +
      '  let openedAt = 0;\n' +
      '  const out = [];\n' +
      '  for (const call of calls) {\n' +
      '    if (state === \'open\') {\n' +
      '      if (call.t - openedAt < config.cooldownMs) {\n' +
      '        out.push({ outcome: \'rejected\', state });\n' +
      '        continue;\n' +
      '      }\n' +
      '      if (call.ok) {\n' +
      '        state = \'closed\';\n' +
      '        failures = 0;\n' +
      '      } else {\n' +
      '        openedAt = call.t;\n' +
      '      }\n' +
      '      out.push({ outcome: call.ok ? \'ok\' : \'fail\', state });\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (call.ok) {\n' +
      '      failures = 0;\n' +
      '    } else {\n' +
      '      failures++;\n' +
      '      if (failures >= config.failureThreshold) {\n' +
      '        state = \'open\';\n' +
      '        openedAt = call.t;\n' +
      '      }\n' +
      '    }\n' +
      '    out.push({ outcome: call.ok ? \'ok\' : \'fail\', state });\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Three pieces of state are enough: the state name, the consecutive-failure count and openedAt. Handle the open case first, and think about which events are allowed to move openedAt.',
    explanation: 'A circuit breaker stops a struggling dependency from being hammered: after enough consecutive failures it fails fast for a cooldown, then lets a single probe through to see whether the dependency has recovered. Model it as a small state machine with `failures` and `openedAt`. The subtle parts are (1) the count is of CONSECUTIVE failures, so any success while closed resets it; (2) rejected calls must not move `openedAt`, otherwise steady traffic keeps the breaker open forever; and (3) a failed probe restarts the cooldown from the probe, not from the original trip. Because the calls are replayed one at a time, the half-open state lasts for exactly one call and never shows up in the output. One pass, O(n).',
    examples: [
      { input: [[{"t":0,"ok":false},{"t":10,"ok":false},{"t":20,"ok":false},{"t":30,"ok":true},{"t":1020,"ok":true},{"t":1030,"ok":true}],{"failureThreshold":3,"cooldownMs":1000}], expected: [{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"ok","state":"closed"},{"outcome":"ok","state":"closed"}] },
      { input: [[{"t":0,"ok":false},{"t":1,"ok":false},{"t":2,"ok":true},{"t":3,"ok":false},{"t":4,"ok":false}],{"failureThreshold":3,"cooldownMs":1000}], expected: [{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"closed"},{"outcome":"ok","state":"closed"},{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"closed"}] },
      { input: [[{"t":0,"ok":false},{"t":50,"ok":true},{"t":100,"ok":false},{"t":150,"ok":true},{"t":200,"ok":true}],{"failureThreshold":1,"cooldownMs":100}], expected: [{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"ok","state":"closed"}] },
    ],
    hiddenTests: [
      { input: [[],{"failureThreshold":2,"cooldownMs":100}], expected: [] },
      { input: [[{"t":0,"ok":false},{"t":1,"ok":false},{"t":60,"ok":true},{"t":101,"ok":true},{"t":102,"ok":false},{"t":103,"ok":false},{"t":104,"ok":true}],{"failureThreshold":2,"cooldownMs":100}], expected: [{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"ok","state":"closed"},{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"}] },
      { input: [[{"t":5,"ok":false},{"t":6,"ok":false},{"t":104,"ok":true},{"t":105,"ok":false},{"t":204,"ok":true},{"t":205,"ok":true}],{"failureThreshold":2,"cooldownMs":100}], expected: [{"outcome":"fail","state":"closed"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"ok","state":"closed"},{"outcome":"ok","state":"closed"}] },
      { input: [[{"t":0,"ok":true},{"t":1,"ok":true},{"t":2,"ok":false},{"t":3,"ok":true}],{"failureThreshold":2,"cooldownMs":10}], expected: [{"outcome":"ok","state":"closed"},{"outcome":"ok","state":"closed"},{"outcome":"fail","state":"closed"},{"outcome":"ok","state":"closed"}] },
      { input: [[{"t":0,"ok":false},{"t":40,"ok":false},{"t":80,"ok":false},{"t":100,"ok":false},{"t":199,"ok":true},{"t":200,"ok":true}],{"failureThreshold":1,"cooldownMs":100}], expected: [{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"fail","state":"open"},{"outcome":"rejected","state":"open"},{"outcome":"ok","state":"closed"}] },
    ],
  },
  {
    id: 'node-ticket-queue-visibility-leases',
    number: 78,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Ticket Queue Visibility Leases',
    difficulty: 'Hard',
    topic: 'Scheduling & Jobs',
    statement:
      'A help-desk backend hands support tickets to workers through a queue with visibility leases: a received ticket is hidden for a while, and comes back if the worker never acknowledges it. Implement `runLeaseQueue(ops, config)` with `config = { visibilityMs, maxReceives }`. Every op carries the current time `now` (non-decreasing across ops).\n' +
      '\n' +
      '- `[\'send\', id, now]`: append a ticket to the queue. Ids are unique and never contain `#`. No output.\n' +
      '- `[\'receive\', now]`: scan tickets in send order. A ticket whose lease is still running (`now < leasedUntil`) is skipped. The first ticket that is not leased is examined: if it has already been received `maxReceives` times it is removed from the queue and its id is appended to the dead-letter list, and the scan continues; otherwise its receive count goes up by 1, its lease is set to `leasedUntil = now + visibilityMs`, and the output is `{ id, receipt }` with `receipt = id + \'#\' + receiveCount`. Output `null` if the scan finds nothing.\n' +
      '- `[\'ack\', receipt, now]`: if `receipt` is the latest receipt issued for a ticket still in the queue and its lease is still running (`now < leasedUntil`), delete the ticket and output `true`. Otherwise output `false` and change nothing.\n' +
      '- `[\'nack\', receipt, now]`: same validity check as `ack`. When valid, end the lease now so the ticket is immediately receivable again (its receive count is kept) and output `true`; otherwise `false`.\n' +
      '\n' +
      'Return `{ outputs, dead, pending }`: the outputs of every receive/ack/nack in order, the dead-letter ids in the order they were moved, and the ids still in the queue in send order.',
    functionName: 'runLeaseQueue',
    functionSignature: 'function runLeaseQueue(ops, config)',
    buggyCode:
      'function runLeaseQueue(ops, config) {\n' +
      '  // TODO: simulate a queue with visibility leases.\n' +
      '  // [\'send\', id, now]        append\n' +
      '  // [\'receive\', now]         first unleased ticket in send order; dead-letter it instead\n' +
      '  //                          when it was already received maxReceives times\n' +
      '  // [\'ack\', receipt, now]    delete if the receipt is the latest one and the lease is running\n' +
      '  // [\'nack\', receipt, now]   same check; makes the ticket receivable again right away\n' +
      '  // Return { outputs, dead, pending }.\n' +
      '}\n',
    solution:
      'function runLeaseQueue(ops, config) {\n' +
      '  const queue = [];\n' +
      '  const outputs = [];\n' +
      '  const dead = [];\n' +
      '  const holder = (receipt, now) => {\n' +
      '    const ticket = queue.find((x) => x.receives > 0 && x.id + \'#\' + x.receives === receipt);\n' +
      '    return ticket && now < ticket.leasedUntil ? ticket : null;\n' +
      '  };\n' +
      '  for (const op of ops) {\n' +
      '    if (op[0] === \'send\') {\n' +
      '      queue.push({ id: op[1], receives: 0, leasedUntil: op[2] });\n' +
      '    } else if (op[0] === \'receive\') {\n' +
      '      const now = op[1];\n' +
      '      let out = null;\n' +
      '      let i = 0;\n' +
      '      while (i < queue.length && out === null) {\n' +
      '        const ticket = queue[i];\n' +
      '        if (now < ticket.leasedUntil) {\n' +
      '          i++;\n' +
      '        } else if (ticket.receives >= config.maxReceives) {\n' +
      '          dead.push(ticket.id);\n' +
      '          queue.splice(i, 1);\n' +
      '        } else {\n' +
      '          ticket.receives++;\n' +
      '          ticket.leasedUntil = now + config.visibilityMs;\n' +
      '          out = { id: ticket.id, receipt: ticket.id + \'#\' + ticket.receives };\n' +
      '        }\n' +
      '      }\n' +
      '      outputs.push(out);\n' +
      '    } else {\n' +
      '      const ticket = holder(op[1], op[2]);\n' +
      '      if (!ticket) {\n' +
      '        outputs.push(false);\n' +
      '      } else {\n' +
      '        if (op[0] === \'ack\') queue.splice(queue.indexOf(ticket), 1);\n' +
      '        else ticket.leasedUntil = op[2];\n' +
      '        outputs.push(true);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { outputs, dead, pending: queue.map((x) => x.id) };\n' +
      '}\n',
    hint: 'Store { id, receives, leasedUntil } per ticket. A receipt is only valid if it names the CURRENT receive count and the lease has not run out; ack and nack share that check.',
    explanation: 'This is the model behind SQS-style queues: delivery is at-least-once, and a lease (visibility timeout) replaces an explicit "in progress" flag. Each ticket needs only a receive count and a `leasedUntil` time; "visible" simply means `now >= leasedUntil`, so an expired lease needs no timer or sweep. The receipt ties an acknowledgement to one particular delivery: once the lease has expired and another worker has received the ticket, the first worker\'s late ack must be refused or it would delete work that someone else now owns. The dead-letter rule is checked lazily at receive time, which keeps poison tickets from cycling forever. Each op scans the queue, so the cost is O(n) per op; a production queue would index by visibility time.',
    examples: [
      { input: [[["send","a",0],["send","b",1],["receive",5],["receive",6],["receive",7],["ack","a#1",10],["receive",40],["ack","b#1",41],["ack","b#2",41]],{"visibilityMs":30,"maxReceives":2}], expected: {"outputs":[{"id":"a","receipt":"a#1"},{"id":"b","receipt":"b#1"},null,true,{"id":"b","receipt":"b#2"},false,true],"dead":[],"pending":[]} },
      { input: [[["send","a",0],["receive",0],["receive",30],["send","b",50],["receive",60]],{"visibilityMs":30,"maxReceives":2}], expected: {"outputs":[{"id":"a","receipt":"a#1"},{"id":"a","receipt":"a#2"},{"id":"b","receipt":"b#1"}],"dead":["a"],"pending":["b"]} },
      { input: [[["send","a",0],["send","b",0],["receive",0],["nack","a#1",5],["receive",6],["ack","a#1",7],["ack","a#2",40]],{"visibilityMs":30,"maxReceives":3}], expected: {"outputs":[{"id":"a","receipt":"a#1"},true,{"id":"a","receipt":"a#2"},false,false],"dead":[],"pending":["a","b"]} },
    ],
    hiddenTests: [
      { input: [[],{"visibilityMs":30,"maxReceives":2}], expected: {"outputs":[],"dead":[],"pending":[]} },
      { input: [[["receive",0],["ack","ghost#1",1],["nack","ghost#1",2],["send","a",3],["ack","a#1",4],["ack","a#0",4]],{"visibilityMs":30,"maxReceives":2}], expected: {"outputs":[null,false,false,false,false],"dead":[],"pending":["a"]} },
      { input: [[["send","a",0],["receive",1],["ack","a#1",2],["ack","a#1",3],["nack","a#1",3],["receive",100]],{"visibilityMs":30,"maxReceives":2}], expected: {"outputs":[{"id":"a","receipt":"a#1"},true,false,false,null],"dead":[],"pending":[]} },
      { input: [[["send","a",0],["send","b",0],["send","c",0],["receive",0],["receive",0],["receive",10],["receive",10],["ack","c#1",20],["receive",20],["ack","c#1",21]],{"visibilityMs":10,"maxReceives":1}], expected: {"outputs":[{"id":"a","receipt":"a#1"},{"id":"b","receipt":"b#1"},{"id":"c","receipt":"c#1"},null,false,null,false],"dead":["a","b","c"],"pending":[]} },
      { input: [[["send","a",0],["receive",0],["nack","a#1",30],["receive",30],["nack","a#2",31],["nack","a#2",32],["receive",33],["ack","a#3",62],["ack","a#3",63],["receive",63],["receive",64]],{"visibilityMs":30,"maxReceives":3}], expected: {"outputs":[{"id":"a","receipt":"a#1"},false,{"id":"a","receipt":"a#2"},true,false,{"id":"a","receipt":"a#3"},true,false,null,null],"dead":[],"pending":[]} },
    ],
  },
  {
    id: 'node-kitchen-bell-emitter',
    number: 79,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Kitchen Bell Event Emitter',
    difficulty: 'Easy',
    topic: 'Caching & State',
    statement:
      'A restaurant\'s order system wires its stations together with an in-memory event emitter. Listeners are identified by name so the behaviour can be replayed from a script. Implement `runEmitter(ops)` over these ops:\n' +
      '\n' +
      '- `[\'on\', event, listener]`: register `listener` at the end of that event\'s list. The same name may be registered several times; each registration is separate.\n' +
      '- `[\'once\', event, listener]`: like `on`, but the registration is removed as soon as it has been called once.\n' +
      '- `[\'off\', event, listener]`: remove ONE registration of that name from that event, the most recently added one (whether it came from `on` or `once`). Do nothing if there is none.\n' +
      '- `[\'emit\', event]`: call every registration of that event in the order they were registered. The output is the array of listener names called (`[]` when there are none).\n' +
      '- `[\'count\', event]`: the output is the number of registrations currently on that event.\n' +
      '\n' +
      'Events are independent of each other. Return the outputs of every `emit` and `count`, in order.',
    functionName: 'runEmitter',
    functionSignature: 'function runEmitter(ops)',
    buggyCode:
      'function runEmitter(ops) {\n' +
      '  // TODO: keep an ordered list of registrations per event.\n' +
      '  // on / once: append.  off: remove the most recently added registration of that name.\n' +
      '  // emit: output the names in registration order, then drop the \'once\' ones.\n' +
      '  // count: output how many registrations the event has.\n' +
      '  // Return the outputs of emit and count ops.\n' +
      '}\n',
    solution:
      'function runEmitter(ops) {\n' +
      '  const events = new Map();\n' +
      '  const listOf = (event) => {\n' +
      '    if (!events.has(event)) events.set(event, []);\n' +
      '    return events.get(event);\n' +
      '  };\n' +
      '  const outputs = [];\n' +
      '  for (const [kind, event, listener] of ops) {\n' +
      '    const list = listOf(event);\n' +
      '    if (kind === \'on\' || kind === \'once\') {\n' +
      '      list.push({ listener, once: kind === \'once\' });\n' +
      '    } else if (kind === \'off\') {\n' +
      '      for (let i = list.length - 1; i >= 0; i--) {\n' +
      '        if (list[i].listener === listener) {\n' +
      '          list.splice(i, 1);\n' +
      '          break;\n' +
      '        }\n' +
      '      }\n' +
      '    } else if (kind === \'emit\') {\n' +
      '      outputs.push(list.map((r) => r.listener));\n' +
      '      events.set(event, list.filter((r) => !r.once));\n' +
      '    } else {\n' +
      '      outputs.push(list.length);\n' +
      '    }\n' +
      '  }\n' +
      '  return outputs;\n' +
      '}\n',
    hint: 'One array of { listener, once } per event is enough. For off, search that array from the END.',
    explanation: 'An event emitter is a map from event name to an ordered list of registrations. `on` and `once` append, `emit` walks the list in order and then drops the one-shot entries, and `off` removes a single registration. The detail people miss is which one: Node\'s `removeListener` removes the most recently added matching registration, so the list has to be searched from the back, and removing "all with that name" or "the first" changes the order later emits see. Storing `once` as a flag on the registration (rather than in a second list) keeps the call order right when one-shot and permanent listeners are mixed. Every op is O(k) in the number of registrations on that event.',
    examples: [
      { input: [[["on","order","grill"],["once","order","bell"],["on","order","printer"],["emit","order"],["emit","order"],["count","order"]]], expected: [["grill","bell","printer"],["grill","printer"],2] },
      { input: [[["on","tick","a"],["on","tick","b"],["on","tick","a"],["off","tick","a"],["emit","tick"]]], expected: [["a","b"]] },
      { input: [[["emit","nothing"],["off","nothing","x"],["count","nothing"]]], expected: [[],0] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[["once","ready","bell"],["off","ready","bell"],["emit","ready"],["count","ready"]]], expected: [[],0] },
      { input: [[["once","ready","bell"],["once","ready","bell"],["count","ready"],["emit","ready"],["emit","ready"],["count","ready"]]], expected: [2,["bell","bell"],[],0] },
      { input: [[["on","open","door"],["on","close","door"],["off","open","door"],["emit","open"],["emit","close"],["off","close","window"],["count","close"]]], expected: [[],["door"],1] },
      { input: [[["on","e","x"],["once","e","y"],["on","e","y"],["once","e","x"],["off","e","y"],["count","e"],["emit","e"],["emit","e"],["off","e","x"],["off","e","x"],["emit","e"],["count","e"]]], expected: [3,["x","y","x"],["x"],[],0] },
    ],
  },
  {
    id: 'node-profile-lookup-single-flight',
    number: 80,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Profile Lookup Single Flight',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A chat server looks up user profiles from a slow backend. When many requests ask for the same profile at the same moment, only one backend call should be made and everyone should share its result. The starter provides `makeBackend()`, which returns `{ calls, fetch }`: `fetch(key)` records the key in `calls` and returns a promise that resolves to the key in upper case, or rejects with an `Error` when the key starts with `!`.\n' +
      '\n' +
      'Implement `async function singleFlight(rounds)`:\n' +
      '\n' +
      '- Create ONE backend with `makeBackend()` and use it for the whole call.\n' +
      '- `rounds` is an array of arrays of keys. Handle the rounds one after another. Within a round, start a lookup for every key in order WITHOUT awaiting in between, then wait for all of them to settle before starting the next round.\n' +
      '- A lookup for a key that already has a backend fetch in flight must share that fetch instead of calling the backend again.\n' +
      '- As soon as a fetch settles (resolved or rejected) it is forgotten, so a later round fetches the key again. This is not a cache.\n' +
      '- A lookup that succeeds yields `{ key, value }`; one whose fetch rejected yields `{ key, error }` with the error\'s `message`. A failure never rejects `singleFlight` itself.\n' +
      '\n' +
      'Resolve to `{ results, calls }`: `results` has one array per round with one entry per requested key in order, and `calls` is the backend\'s `calls` array.',
    functionName: 'singleFlight',
    functionSignature: 'async function singleFlight(rounds)',
    buggyCode:
      '// Provided: a fake slow backend. Do not change it.\n' +
      'function makeBackend() {\n' +
      '  const calls = [];\n' +
      '  return {\n' +
      '    calls,\n' +
      '    fetch(key) {\n' +
      '      calls.push(key);\n' +
      '      return new Promise((resolve, reject) => {\n' +
      '        Promise.resolve().then(() => {\n' +
      '          if (key.startsWith(\'!\')) reject(new Error(\'no such profile: \' + key));\n' +
      '          else resolve(key.toUpperCase());\n' +
      '        });\n' +
      '      });\n' +
      '    },\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'async function singleFlight(rounds) {\n' +
      '  const backend = makeBackend();\n' +
      '  // TODO: for each round, start every lookup without awaiting in between, sharing one\n' +
      '  // backend.fetch per key while it is in flight; forget it once it settles.\n' +
      '  // Each lookup yields { key, value } or { key, error: message }.\n' +
      '  // Resolve to { results: [[...], ...], calls: backend.calls }.\n' +
      '}\n',
    solution:
      '// Provided: a fake slow backend. Do not change it.\n' +
      'function makeBackend() {\n' +
      '  const calls = [];\n' +
      '  return {\n' +
      '    calls,\n' +
      '    fetch(key) {\n' +
      '      calls.push(key);\n' +
      '      return new Promise((resolve, reject) => {\n' +
      '        Promise.resolve().then(() => {\n' +
      '          if (key.startsWith(\'!\')) reject(new Error(\'no such profile: \' + key));\n' +
      '          else resolve(key.toUpperCase());\n' +
      '        });\n' +
      '      });\n' +
      '    },\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'async function singleFlight(rounds) {\n' +
      '  const backend = makeBackend();\n' +
      '  const inFlight = new Map();\n' +
      '  const lookup = (key) => {\n' +
      '    if (!inFlight.has(key)) {\n' +
      '      const shared = backend.fetch(key).then(\n' +
      '        (value) => {\n' +
      '          inFlight.delete(key);\n' +
      '          return { key, value };\n' +
      '        },\n' +
      '        (err) => {\n' +
      '          inFlight.delete(key);\n' +
      '          return { key, error: err.message };\n' +
      '        },\n' +
      '      );\n' +
      '      inFlight.set(key, shared);\n' +
      '    }\n' +
      '    return inFlight.get(key);\n' +
      '  };\n' +
      '  const results = [];\n' +
      '  for (const round of rounds) {\n' +
      '    results.push(await Promise.all(round.map(lookup)));\n' +
      '  }\n' +
      '  return { results, calls: backend.calls };\n' +
      '}\n',
    hint: 'Keep a Map from key to the PROMISE of the fetch in flight. Callers that find an entry return that same promise; remove the entry when the promise settles, on success and on failure.',
    explanation: 'Single-flight (request coalescing) protects a backend from a thundering herd: store the in-flight promise per key, and hand that same promise to every caller that arrives before it settles. The entry must be removed when the promise settles, in both the success and the failure path; forgetting that turns the helper into an unbounded cache that also pins errors forever. Converting a rejection into an `{ error }` value inside the shared promise means one bad key cannot reject the `Promise.all` for the whole round. Note that the map stores promises, not values: the check and the insert happen synchronously in the same tick, which is what makes concurrent callers see each other. Work is O(1) per lookup, and the backend sees one call per distinct key per round.',
    examples: [
      { input: [[["ana","bo","ana"]]], expected: {"results":[[{"key":"ana","value":"ANA"},{"key":"bo","value":"BO"},{"key":"ana","value":"ANA"}]],"calls":["ana","bo"]} },
      { input: [[["ana","ana"],["ana"]]], expected: {"results":[[{"key":"ana","value":"ANA"},{"key":"ana","value":"ANA"}],[{"key":"ana","value":"ANA"}]],"calls":["ana","ana"]} },
      { input: [[["!ghost","bo","!ghost"],["bo"]]], expected: {"results":[[{"key":"!ghost","error":"no such profile: !ghost"},{"key":"bo","value":"BO"},{"key":"!ghost","error":"no such profile: !ghost"}],[{"key":"bo","value":"BO"}]],"calls":["!ghost","bo","bo"]} },
    ],
    hiddenTests: [
      { input: [[]], expected: {"results":[],"calls":[]} },
      { input: [[[],["kit"],[]]], expected: {"results":[[],[{"key":"kit","value":"KIT"}],[]],"calls":["kit"]} },
      { input: [[["!x"],["!x","!x"],["x"]]], expected: {"results":[[{"key":"!x","error":"no such profile: !x"}],[{"key":"!x","error":"no such profile: !x"},{"key":"!x","error":"no such profile: !x"}],[{"key":"x","value":"X"}]],"calls":["!x","!x","x"]} },
      { input: [[["a","b","c","a","b","c","c"],["c","c","d"],["a"]]], expected: {"results":[[{"key":"a","value":"A"},{"key":"b","value":"B"},{"key":"c","value":"C"},{"key":"a","value":"A"},{"key":"b","value":"B"},{"key":"c","value":"C"},{"key":"c","value":"C"}],[{"key":"c","value":"C"},{"key":"c","value":"C"},{"key":"d","value":"D"}],[{"key":"a","value":"A"}]],"calls":["a","b","c","c","d","a"]} },
      { input: [[["zed","!zed","zed","!zed"]]], expected: {"results":[[{"key":"zed","value":"ZED"},{"key":"!zed","error":"no such profile: !zed"},{"key":"zed","value":"ZED"},{"key":"!zed","error":"no such profile: !zed"}]],"calls":["zed","!zed"]} },
    ],
  },
  {
    id: 'node-seat-map-versioned-writes',
    number: 81,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Seat Map Versioned Writes',
    difficulty: 'Easy',
    topic: 'Distributed Data',
    statement:
      'A cinema booking API protects its seat records with optimistic locking: every write says which version of the record it was based on, and is refused if someone else got there first. Implement `applyVersionedWrites(store, writes)`.\n' +
      '\n' +
      '- `store` maps a record id to `{ version, data }` (`version` is an integer of at least 1).\n' +
      '- `writes` is an array of `{ id, expectedVersion, data }`, applied in order.\n' +
      '- If the record does not exist: the write succeeds only when `expectedVersion` is `0`, creating the record with version 1. Any other `expectedVersion` gives `{ status: \'not_found\', version: null }`.\n' +
      '- If the record exists and `expectedVersion` equals its current version: replace `data`, add 1 to the version, and report `{ status: \'ok\', version }` with the NEW version (a created record reports `{ status: \'ok\', version: 1 }`).\n' +
      '- If the record exists and `expectedVersion` is anything else (lower, higher, or 0): change nothing and report `{ status: \'conflict\', version }` with the CURRENT version.\n' +
      '\n' +
      'Return `{ results, store }`: one result per write, and the store after all writes.',
    functionName: 'applyVersionedWrites',
    functionSignature: 'function applyVersionedWrites(store, writes)',
    buggyCode:
      'function applyVersionedWrites(store, writes) {\n' +
      '  // TODO: compare-and-set each write against the record\'s current version.\n' +
      '  // missing record: expectedVersion 0 creates it at version 1, otherwise \'not_found\'\n' +
      '  // existing record: exact match -> replace data, version + 1; otherwise \'conflict\'\n' +
      '  // Return { results: [{ status, version }, ...], store }.\n' +
      '}\n',
    solution:
      'function applyVersionedWrites(store, writes) {\n' +
      '  const results = [];\n' +
      '  for (const write of writes) {\n' +
      '    const record = Object.prototype.hasOwnProperty.call(store, write.id) ? store[write.id] : null;\n' +
      '    if (!record) {\n' +
      '      if (write.expectedVersion === 0) {\n' +
      '        store[write.id] = { version: 1, data: write.data };\n' +
      '        results.push({ status: \'ok\', version: 1 });\n' +
      '      } else {\n' +
      '        results.push({ status: \'not_found\', version: null });\n' +
      '      }\n' +
      '    } else if (write.expectedVersion === record.version) {\n' +
      '      record.version++;\n' +
      '      record.data = write.data;\n' +
      '      results.push({ status: \'ok\', version: record.version });\n' +
      '    } else {\n' +
      '      results.push({ status: \'conflict\', version: record.version });\n' +
      '    }\n' +
      '  }\n' +
      '  return { results, store };\n' +
      '}\n',
    hint: 'This is compare-and-set: the write wins only on an EXACT version match. Decide the missing-record case first, then compare.',
    explanation: 'Optimistic locking lets many clients read freely and only checks for interference at write time: the client sends back the version it read, and the server applies the write only if that is still the current version, bumping it in the same step. Anything other than an exact match is a conflict, including a version that is too high, because it means the client is not looking at the record the server has. Returning the current version with a conflict lets the client re-read and retry. Using `expectedVersion: 0` for "create only if absent" folds creation into the same rule and makes two racing creates safe: the second one conflicts. Each write is O(1).',
    examples: [
      { input: [{"s1":{"version":2,"data":{"seat":"12A","holder":"mia"}}},[{"id":"s1","expectedVersion":2,"data":{"seat":"12A","holder":"noor"}},{"id":"s1","expectedVersion":2,"data":{"seat":"12A","holder":"omar"}}]], expected: {"results":[{"status":"ok","version":3},{"status":"conflict","version":3}],"store":{"s1":{"version":3,"data":{"seat":"12A","holder":"noor"}}}} },
      { input: [{},[{"id":"s9","expectedVersion":0,"data":{"seat":"3F"}},{"id":"s9","expectedVersion":0,"data":{"seat":"3G"}},{"id":"zz","expectedVersion":3,"data":{"seat":"1A"}}]], expected: {"results":[{"status":"ok","version":1},{"status":"conflict","version":1},{"status":"not_found","version":null}],"store":{"s9":{"version":1,"data":{"seat":"3F"}}}} },
    ],
    hiddenTests: [
      { input: [{"a":{"version":1,"data":1}},[]], expected: {"results":[],"store":{"a":{"version":1,"data":1}}} },
      { input: [{"a":{"version":1,"data":"x"}},[{"id":"a","expectedVersion":1,"data":"y"},{"id":"a","expectedVersion":2,"data":"z"},{"id":"a","expectedVersion":3,"data":"w"}]], expected: {"results":[{"status":"ok","version":2},{"status":"ok","version":3},{"status":"ok","version":4}],"store":{"a":{"version":4,"data":"w"}}} },
      { input: [{"a":{"version":2,"data":"x"}},[{"id":"a","expectedVersion":5,"data":"future"},{"id":"a","expectedVersion":1,"data":"past"},{"id":"a","expectedVersion":0,"data":"create"}]], expected: {"results":[{"status":"conflict","version":2},{"status":"conflict","version":2},{"status":"conflict","version":2}],"store":{"a":{"version":2,"data":"x"}}} },
      { input: [{"a":{"version":4,"data":"x"},"b":{"version":1,"data":"y"}},[{"id":"b","expectedVersion":4,"data":"no"},{"id":"c","expectedVersion":1,"data":"no"},{"id":"c","expectedVersion":0,"data":"new"},{"id":"c","expectedVersion":1,"data":"newer"},{"id":"a","expectedVersion":4,"data":"yes"}]], expected: {"results":[{"status":"conflict","version":1},{"status":"not_found","version":null},{"status":"ok","version":1},{"status":"ok","version":2},{"status":"ok","version":5}],"store":{"a":{"version":5,"data":"yes"},"b":{"version":1,"data":"y"},"c":{"version":2,"data":"newer"}}} },
    ],
  },
  {
    id: 'node-ledger-wal-replay',
    number: 82,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Ledger Write-Ahead Log Replay',
    difficulty: 'Medium',
    topic: 'Distributed Data',
    statement:
      'A small key-value store recovers from a crash by loading its last snapshot and replaying a write-ahead log. Implement `replayLog(snapshot, entries)`.\n' +
      '\n' +
      '- `snapshot` is a plain object of key/value pairs: the state before the log.\n' +
      '- `entries` is the log in the order it was written. Each entry is `{ txn, op }` plus `key` / `value` where needed; `op` is `"begin"`, `"set"` (key and value), `"del"` (key), `"commit"` or `"abort"`. Entries of different transactions may be interleaved. The log is well formed: a transaction\'s entries start with its `begin`, and nothing follows its `commit` or `abort`.\n' +
      '- An entry may carry `torn: true`, meaning the crash cut it off half-written. Ignore that entry and everything after it, as if the log ended just before it.\n' +
      '- A transaction\'s writes take effect only when its `commit` entry is reached, all at once, in the order they were logged inside that transaction. So transactions take effect in COMMIT order, not in the order they began or wrote.\n' +
      '- A transaction that aborted, or that has no `commit` by the end of the (possibly cut) log, changes nothing.\n' +
      '- `del` of a key that does not exist is a no-op.\n' +
      '\n' +
      'Return `{ data, committed, discarded }`: the recovered state, the ids of committed transactions in commit order, and the ids of transactions that began but did not commit, in the order they began.',
    functionName: 'replayLog',
    functionSignature: 'function replayLog(snapshot, entries)',
    buggyCode:
      'function replayLog(snapshot, entries) {\n' +
      '  // TODO: replay the log on top of the snapshot.\n' +
      '  // - stop at the first entry with torn: true\n' +
      '  // - buffer each transaction\'s set/del until its commit, then apply them in order\n' +
      '  // - aborted or unfinished transactions change nothing\n' +
      '  // Return { data, committed: [txn ids in commit order], discarded: [txn ids in begin order] }.\n' +
      '}\n',
    solution:
      'function replayLog(snapshot, entries) {\n' +
      '  const data = Object.assign({}, snapshot);\n' +
      '  const open = new Map();\n' +
      '  const began = [];\n' +
      '  const committed = [];\n' +
      '  for (const entry of entries) {\n' +
      '    if (entry.torn) break;\n' +
      '    if (entry.op === \'begin\') {\n' +
      '      open.set(entry.txn, []);\n' +
      '      began.push(entry.txn);\n' +
      '    } else if (entry.op === \'set\' || entry.op === \'del\') {\n' +
      '      open.get(entry.txn).push(entry);\n' +
      '    } else if (entry.op === \'abort\') {\n' +
      '      open.delete(entry.txn);\n' +
      '    } else if (entry.op === \'commit\') {\n' +
      '      for (const write of open.get(entry.txn)) {\n' +
      '        if (write.op === \'set\') data[write.key] = write.value;\n' +
      '        else delete data[write.key];\n' +
      '      }\n' +
      '      open.delete(entry.txn);\n' +
      '      committed.push(entry.txn);\n' +
      '    }\n' +
      '  }\n' +
      '  const discarded = began.filter((txn) => !committed.includes(txn));\n' +
      '  return { data, committed, discarded };\n' +
      '}\n',
    hint: 'Do not touch the data when you see a set or del. Park the write in a per-transaction buffer and apply the whole buffer when that transaction\'s commit shows up.',
    explanation: 'A write-ahead log records intent before the data pages change, so recovery can rebuild exactly the committed state. The replay rule is "redo winners, ignore losers": buffer each transaction\'s writes as you scan, apply the buffer when you reach its commit record, and drop it on abort. Anything still open when the log ends was in flight at the crash and is discarded, and a torn final record marks where the trustworthy log stops. The tempting shortcut, applying the writes of committed transactions in raw log order, is wrong when two transactions touch the same key: the one that committed LAST must win, even if its write was logged first. One pass over the log, O(n) time, with memory proportional to the writes of open transactions.',
    examples: [
      { input: [{"x":1},[{"txn":"T1","op":"begin"},{"txn":"T1","op":"set","key":"x","value":5},{"txn":"T2","op":"begin"},{"txn":"T2","op":"set","key":"y","value":9},{"txn":"T2","op":"commit"}]], expected: {"data":{"x":1,"y":9},"committed":["T2"],"discarded":["T1"]} },
      { input: [{},[{"txn":"T1","op":"begin"},{"txn":"T2","op":"begin"},{"txn":"T2","op":"set","key":"x","value":2},{"txn":"T1","op":"set","key":"x","value":1},{"txn":"T1","op":"commit"},{"txn":"T2","op":"commit"}]], expected: {"data":{"x":2},"committed":["T1","T2"],"discarded":[]} },
      { input: [{"b":2},[{"txn":"T1","op":"begin"},{"txn":"T1","op":"set","key":"a","value":1},{"txn":"T1","op":"del","key":"b"},{"txn":"T1","op":"commit"},{"txn":"T2","op":"begin"},{"txn":"T2","op":"set","key":"c","value":3},{"txn":"T2","op":"abort"},{"txn":"T3","op":"begin"},{"txn":"T3","op":"set","key":"d","value":4},{"txn":"T3","op":"commit","torn":true}]], expected: {"data":{"a":1},"committed":["T1"],"discarded":["T2","T3"]} },
    ],
    hiddenTests: [
      { input: [{"k":"v"},[]], expected: {"data":{"k":"v"},"committed":[],"discarded":[]} },
      { input: [{"k":"v"},[{"txn":"A","op":"begin","torn":true},{"txn":"A","op":"set","key":"k","value":"w"},{"txn":"A","op":"commit"}]], expected: {"data":{"k":"v"},"committed":[],"discarded":[]} },
      { input: [{"n":1},[{"txn":"A","op":"begin"},{"txn":"A","op":"set","key":"n","value":2},{"txn":"A","op":"set","key":"n","value":3},{"txn":"A","op":"del","key":"missing"},{"txn":"A","op":"commit"},{"txn":"B","op":"begin"},{"txn":"B","op":"del","key":"n"},{"txn":"B","op":"set","key":"n","value":7},{"txn":"B","op":"commit"},{"txn":"C","op":"begin"},{"txn":"C","op":"commit"}]], expected: {"data":{"n":7},"committed":["A","B","C"],"discarded":[]} },
      { input: [{"x":0,"y":0},[{"txn":"A","op":"begin"},{"txn":"B","op":"begin"},{"txn":"C","op":"begin"},{"txn":"A","op":"set","key":"x","value":"a"},{"txn":"B","op":"del","key":"x"},{"txn":"C","op":"set","key":"y","value":"c"},{"txn":"B","op":"commit"},{"txn":"C","op":"abort"},{"txn":"A","op":"commit"},{"txn":"D","op":"begin"},{"txn":"D","op":"set","key":"y","value":"d"}]], expected: {"data":{"y":0,"x":"a"},"committed":["B","A"],"discarded":["C","D"]} },
      { input: [{"x":1},[{"txn":"A","op":"begin"},{"txn":"B","op":"begin"},{"txn":"B","op":"set","key":"x","value":2},{"txn":"A","op":"del","key":"x"},{"txn":"A","op":"commit"},{"txn":"B","op":"commit"},{"txn":"C","op":"begin"},{"txn":"C","op":"del","key":"x","torn":true},{"txn":"C","op":"commit"}]], expected: {"data":{"x":2},"committed":["A","B"],"discarded":["C"]} },
    ],
  },
  {
    id: 'node-scheduler-leader-lease',
    number: 83,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Scheduler Leader Lease',
    difficulty: 'Medium',
    topic: 'Distributed Data',
    statement:
      'Three copies of a cron service run for redundancy, but only the one holding the leader lease may fire jobs. The lease lives in a shared store and must be renewed before it runs out. Implement `runElection(events, leaseMs)`, replaying events `{ t, node, type }` sorted by `t`.\n' +
      '\n' +
      'State: the current `leader` (initially none), the lease\'s `expiresAt`, and a `term` counter starting at 0.\n' +
      '\n' +
      '- Before handling any event: if there is a leader and `t >= expiresAt`, the lease has run out and there is no leader any more.\n' +
      '- `"campaign"`: with no leader, `node` becomes leader, `term` goes up by 1 and `expiresAt = t + leaseMs`; the event succeeds. If `node` already is the leader, it just renews (`expiresAt = t + leaseMs`, same term) and succeeds. If another node leads, it fails.\n' +
      '- `"heartbeat"`: succeeds only if `node` is the current leader, and then sets `expiresAt = t + leaseMs`. A node whose lease already ran out cannot revive it with a heartbeat; it has to campaign again.\n' +
      '- `"resign"`: succeeds only if `node` is the current leader; afterwards there is no leader.\n' +
      '\n' +
      'Return one `{ ok, leader, term }` per event: whether it succeeded, the leader after the event (`null` if none) and the current term.',
    functionName: 'runElection',
    functionSignature: 'function runElection(events, leaseMs)',
    buggyCode:
      'function runElection(events, leaseMs) {\n' +
      '  // TODO: replay { t, node, type } events against a single lease.\n' +
      '  // First expire the lease if t >= expiresAt.\n' +
      '  // campaign:  no leader -> become leader, term + 1; own lease -> renew; else fail\n' +
      '  // heartbeat: leader only -> renew\n' +
      '  // resign:    leader only -> no leader\n' +
      '  // Return [{ ok, leader, term }, ...] (leader is null when nobody leads).\n' +
      '}\n',
    solution:
      'function runElection(events, leaseMs) {\n' +
      '  let leader = null;\n' +
      '  let expiresAt = 0;\n' +
      '  let term = 0;\n' +
      '  const out = [];\n' +
      '  for (const event of events) {\n' +
      '    if (leader !== null && event.t >= expiresAt) leader = null;\n' +
      '    let ok = false;\n' +
      '    if (event.type === \'campaign\') {\n' +
      '      if (leader === null) {\n' +
      '        leader = event.node;\n' +
      '        term++;\n' +
      '        ok = true;\n' +
      '      } else if (leader === event.node) {\n' +
      '        ok = true;\n' +
      '      }\n' +
      '      if (ok) expiresAt = event.t + leaseMs;\n' +
      '    } else if (event.type === \'heartbeat\') {\n' +
      '      if (leader === event.node) {\n' +
      '        expiresAt = event.t + leaseMs;\n' +
      '        ok = true;\n' +
      '      }\n' +
      '    } else if (event.type === \'resign\') {\n' +
      '      if (leader === event.node) {\n' +
      '        leader = null;\n' +
      '        ok = true;\n' +
      '      }\n' +
      '    }\n' +
      '    out.push({ ok, leader, term });\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Start every event by checking whether the lease has already run out. After that step the three event types are each a couple of lines.',
    explanation: 'Lease-based election needs no voting: whoever writes its name into the shared record owns leadership until `expiresAt`, and keeps it by renewing in time. Expiry is evaluated lazily, at the start of each event, so no timer is required. Two rules carry the safety of the scheme. A lapsed lease cannot be revived by a late heartbeat, because another node may be about to take over; the old leader has to win a fresh campaign. And every new leadership gets a larger `term`, which real systems attach to their writes as a fencing token so that a paused ex-leader can be recognised and refused. Renewals keep the term, since nothing changed hands. One pass, O(n).',
    examples: [
      { input: [[{"t":0,"node":"a","type":"campaign"},{"t":10,"node":"b","type":"campaign"},{"t":90,"node":"a","type":"heartbeat"},{"t":150,"node":"b","type":"campaign"},{"t":190,"node":"b","type":"campaign"}],100], expected: [{"ok":true,"leader":"a","term":1},{"ok":false,"leader":"a","term":1},{"ok":true,"leader":"a","term":1},{"ok":false,"leader":"a","term":1},{"ok":true,"leader":"b","term":2}] },
      { input: [[{"t":0,"node":"a","type":"campaign"},{"t":100,"node":"a","type":"heartbeat"},{"t":101,"node":"a","type":"campaign"}],100], expected: [{"ok":true,"leader":"a","term":1},{"ok":false,"leader":null,"term":1},{"ok":true,"leader":"a","term":2}] },
      { input: [[{"t":0,"node":"a","type":"campaign"},{"t":5,"node":"b","type":"resign"},{"t":6,"node":"a","type":"resign"},{"t":7,"node":"b","type":"campaign"},{"t":50,"node":"b","type":"campaign"},{"t":120,"node":"a","type":"campaign"}],100], expected: [{"ok":true,"leader":"a","term":1},{"ok":false,"leader":"a","term":1},{"ok":true,"leader":null,"term":1},{"ok":true,"leader":"b","term":2},{"ok":true,"leader":"b","term":2},{"ok":false,"leader":"b","term":2}] },
    ],
    hiddenTests: [
      { input: [[],100], expected: [] },
      { input: [[{"t":0,"node":"a","type":"heartbeat"},{"t":1,"node":"a","type":"resign"},{"t":2,"node":"a","type":"campaign"},{"t":3,"node":"a","type":"resign"},{"t":4,"node":"a","type":"heartbeat"},{"t":5,"node":"b","type":"campaign"}],50], expected: [{"ok":false,"leader":null,"term":0},{"ok":false,"leader":null,"term":0},{"ok":true,"leader":"a","term":1},{"ok":true,"leader":null,"term":1},{"ok":false,"leader":null,"term":1},{"ok":true,"leader":"b","term":2}] },
      { input: [[{"t":0,"node":"a","type":"campaign"},{"t":49,"node":"a","type":"heartbeat"},{"t":98,"node":"a","type":"heartbeat"},{"t":147,"node":"c","type":"campaign"},{"t":148,"node":"b","type":"heartbeat"},{"t":148,"node":"c","type":"campaign"},{"t":149,"node":"a","type":"heartbeat"},{"t":150,"node":"a","type":"campaign"}],50], expected: [{"ok":true,"leader":"a","term":1},{"ok":true,"leader":"a","term":1},{"ok":true,"leader":"a","term":1},{"ok":false,"leader":"a","term":1},{"ok":false,"leader":null,"term":1},{"ok":true,"leader":"c","term":2},{"ok":false,"leader":"c","term":2},{"ok":false,"leader":"c","term":2}] },
      { input: [[{"t":10,"node":"n1","type":"campaign"},{"t":20,"node":"n2","type":"campaign"},{"t":20,"node":"n1","type":"heartbeat"},{"t":29,"node":"n2","type":"campaign"},{"t":30,"node":"n2","type":"resign"},{"t":30,"node":"n2","type":"campaign"},{"t":39,"node":"n1","type":"resign"},{"t":40,"node":"n1","type":"resign"}],10], expected: [{"ok":true,"leader":"n1","term":1},{"ok":true,"leader":"n2","term":2},{"ok":false,"leader":"n2","term":2},{"ok":true,"leader":"n2","term":2},{"ok":true,"leader":null,"term":2},{"ok":true,"leader":"n2","term":3},{"ok":false,"leader":"n2","term":3},{"ok":false,"leader":null,"term":3}] },
    ],
  },
  {
    id: 'node-photo-shard-hash-ring',
    number: 84,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Photo Shard Hash Ring',
    difficulty: 'Hard',
    topic: 'Distributed Data',
    statement:
      'A photo service spreads albums over storage nodes with consistent hashing, so that adding or removing a node moves only a small share of the albums. The starter provides the hash: `ringHash(s)` starts at 7 and, for each character, computes `h = (h * 31 + charCode) % 1024`, giving a position from 0 to 1023 on the ring.\n' +
      '\n' +
      'Implement `ringOwners(nodes, vnodes, replicas, keys)`:\n' +
      '\n' +
      '- Each node name in `nodes` (unique strings) is placed on the ring `vnodes` times, at `ringHash(i + \'#\' + name)` for `i = 0 .. vnodes - 1` (so node `ash` with 2 virtual points sits at `ringHash(\'0#ash\')` and `ringHash(\'1#ash\')`).\n' +
      '- Order the points by position ascending. Points at the same position are ordered by node name ascending (plain string comparison), then by `i`.\n' +
      '- For a key, compute `p = ringHash(key)` and start at the first point whose position is `>= p`. If there is none, wrap around to the first point of the ring.\n' +
      '- Walk the points from there in ring order, wrapping around, and collect node names, skipping nodes already collected, until you have `replicas` distinct nodes or every node has been collected.\n' +
      '- Return an object mapping each key to its list of nodes, in the order collected. With no nodes, every key maps to `[]`.',
    functionName: 'ringOwners',
    functionSignature: 'function ringOwners(nodes, vnodes, replicas, keys)',
    buggyCode:
      '// Provided: the ring hash. Do not change it.\n' +
      'function ringHash(s) {\n' +
      '  let h = 7;\n' +
      '  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1024;\n' +
      '  return h;\n' +
      '}\n' +
      '\n' +
      'function ringOwners(nodes, vnodes, replicas, keys) {\n' +
      '  // TODO: place each node at ringHash(i + \'#\' + name) for i in 0..vnodes-1,\n' +
      '  // sort the points (position, then node name, then i), and for each key walk\n' +
      '  // clockwise from the first point with position >= ringHash(key), wrapping,\n' +
      '  // collecting distinct node names until there are \'replicas\' of them.\n' +
      '  // Return { key: [node, ...], ... }.\n' +
      '}\n',
    solution:
      '// Provided: the ring hash. Do not change it.\n' +
      'function ringHash(s) {\n' +
      '  let h = 7;\n' +
      '  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1024;\n' +
      '  return h;\n' +
      '}\n' +
      '\n' +
      'function ringOwners(nodes, vnodes, replicas, keys) {\n' +
      '  const points = [];\n' +
      '  for (const node of nodes) {\n' +
      '    for (let i = 0; i < vnodes; i++) points.push({ pos: ringHash(i + \'#\' + node), node, i });\n' +
      '  }\n' +
      '  points.sort((a, b) => a.pos - b.pos || (a.node < b.node ? -1 : a.node > b.node ? 1 : 0) || a.i - b.i);\n' +
      '  const want = Math.min(replicas, nodes.length);\n' +
      '  const result = {};\n' +
      '  for (const key of keys) {\n' +
      '    const owners = [];\n' +
      '    if (points.length > 0) {\n' +
      '      const p = ringHash(key);\n' +
      '      let start = points.findIndex((pt) => pt.pos >= p);\n' +
      '      if (start === -1) start = 0;\n' +
      '      for (let step = 0; step < points.length && owners.length < want; step++) {\n' +
      '        const node = points[(start + step) % points.length].node;\n' +
      '        if (!owners.includes(node)) owners.push(node);\n' +
      '      }\n' +
      '    }\n' +
      '    result[key] = owners;\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n',
    hint: 'Build one sorted array of { pos, node, i } points. A lookup is "first point at or after the key\'s position, else index 0", followed by a walk with modulo that skips nodes you already have.',
    explanation: 'Consistent hashing puts nodes and keys on the same ring; a key belongs to the first node point at or after its own position, wrapping past the end. Giving every node several virtual points evens out the arcs, and it is also why the replica walk must skip repeats: the next point clockwise is often another virtual point of a node you already picked, and storing two copies on the same machine protects nothing. The classic bugs are forgetting the wrap-around for keys that hash past the last point, using `>` instead of `>=` for a key that lands exactly on a point, and returning duplicate nodes in the replica list. Building the ring costs O(P log P) for P = nodes x vnodes points; this version scans for the start in O(P), where a production ring would binary-search.',
    examples: [
      { input: [["ash","birch","cedar"],3,1,["lisbon","market","karaoke"]], expected: {"lisbon":["cedar"],"market":["cedar"],"karaoke":["birch"]} },
      { input: [["ash","birch","cedar"],3,2,["carnival","cats","karaoke"]], expected: {"carnival":["birch","cedar"],"cats":["cedar","ash"],"karaoke":["birch","cedar"]} },
      { input: [["east","west"],4,5,["album-317","lima"]], expected: {"album-317":["east","west"],"lima":["east","west"]} },
    ],
    hiddenTests: [
      { input: [[],3,2,["lima","cats"]], expected: {"lima":[],"cats":[]} },
      { input: [["solo"],2,3,["lima","album-718","album-719","karaoke"]], expected: {"lima":["solo"],"album-718":["solo"],"album-719":["solo"],"karaoke":["solo"]} },
      { input: [["south","east","north"],4,2,["album-317","album-300","garden","attic"]], expected: {"album-317":["east","south"],"album-300":["north","east"],"garden":["north","east"],"attic":["east","north"]} },
      { input: [["ash","birch","cedar","dune","elm"],4,3,["lima","carnival","beach","festival","lagoon","harbor","karaoke"]], expected: {"lima":["birch","elm","dune"],"carnival":["dune","elm","cedar"],"beach":["cedar","dune","birch"],"festival":["ash","dune","birch"],"lagoon":["birch","ash","dune"],"harbor":["ash","cedar","birch"],"karaoke":["birch","elm","dune"]} },
      { input: [["ash","birch","cedar"],1,3,["attic","graduation","desert","karaoke"]], expected: {"attic":["cedar","ash","birch"],"graduation":["birch","cedar","ash"],"desert":["cedar","ash","birch"],"karaoke":["birch","cedar","ash"]} },
      { input: [["ash","birch"],2,1,[]], expected: {} },
    ],
  },
  {
    id: 'node-login-sliding-window-limiter',
    number: 85,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Login Sliding Window Limiter',
    difficulty: 'Medium',
    topic: 'Auth & Security',
    statement:
      'A login endpoint limits password attempts per account with a sliding-window log, because a fixed window lets an attacker double the rate around the window boundary. Implement `slidingLimiter(requests, limit, windowMs)` that replays a request log.\n' +
      '\n' +
      '- `requests` is an array of `{ key, t }` with `t` in milliseconds, non-decreasing. Each `key` is limited independently. `limit` is at least 1.\n' +
      '- A request at time `t` looks at the ALLOWED requests of the same key with a timestamp `s` in the window `t - windowMs < s <= t`. A request exactly `windowMs` old has left the window.\n' +
      '- If fewer than `limit` such requests exist, the request is allowed and joins the log: `{ allowed: true, retryAfterMs: 0 }`.\n' +
      '- Otherwise it is rejected and is NOT added to the log: `{ allowed: false, retryAfterMs }`, where `retryAfterMs` is how long until the oldest request in the window leaves it, i.e. `oldest + windowMs - t`.\n' +
      '\n' +
      'Return the decisions in request order.',
    functionName: 'slidingLimiter',
    functionSignature: 'function slidingLimiter(requests, limit, windowMs)',
    buggyCode:
      'function slidingLimiter(requests, limit, windowMs) {\n' +
      '  // TODO: keep, per key, the timestamps of ALLOWED requests.\n' +
      '  // A request at t counts the allowed timestamps s with t - windowMs < s <= t.\n' +
      '  // fewer than limit -> { allowed: true, retryAfterMs: 0 } and log t\n' +
      '  // otherwise        -> { allowed: false, retryAfterMs: oldest + windowMs - t }\n' +
      '}\n',
    solution:
      'function slidingLimiter(requests, limit, windowMs) {\n' +
      '  const logs = new Map();\n' +
      '  const out = [];\n' +
      '  for (const { key, t } of requests) {\n' +
      '    if (!logs.has(key)) logs.set(key, []);\n' +
      '    const log = logs.get(key);\n' +
      '    while (log.length > 0 && log[0] <= t - windowMs) log.shift();\n' +
      '    if (log.length < limit) {\n' +
      '      log.push(t);\n' +
      '      out.push({ allowed: true, retryAfterMs: 0 });\n' +
      '    } else {\n' +
      '      out.push({ allowed: false, retryAfterMs: log[0] + windowMs - t });\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    hint: 'Per key, keep the allowed timestamps in arrival order. They are already sorted, so expired ones can be dropped from the front before you count.',
    explanation: 'A sliding-window log keeps the timestamps of recent allowed requests per key and counts those still inside the window that ends now. Because requests arrive in time order, the log is sorted and the expired entries are always at the front, so trimming is a few shifts and the oldest surviving entry is exactly the one whose departure frees the next slot, which gives `retryAfterMs` for free. Two decisions matter: rejected requests must not be logged (otherwise a client that keeps retrying locks itself out forever), and the window is half-open so that an entry exactly `windowMs` old no longer counts. Unlike a fixed-window counter, no alignment of requests around a boundary can let more than `limit` through in any `windowMs` span. Amortised O(1) per request, memory up to `limit` timestamps per key.',
    examples: [
      { input: [[{"key":"ana","t":0},{"key":"ana","t":100},{"key":"ana","t":200},{"key":"ana","t":300},{"key":"ana","t":1000},{"key":"ana","t":1050}],3,1000], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":700},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":50}] },
      { input: [[{"key":"bo","t":900},{"key":"bo","t":950},{"key":"bo","t":1000},{"key":"bo","t":1100},{"key":"bo","t":1900},{"key":"bo","t":1949},{"key":"bo","t":1950}],2,1000], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":900},{"allowed":false,"retryAfterMs":800},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":1},{"allowed":true,"retryAfterMs":0}] },
      { input: [[{"key":"a","t":0},{"key":"a","t":50},{"key":"b","t":60},{"key":"a","t":100},{"key":"b","t":100}],1,100], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":50},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":60}] },
    ],
    hiddenTests: [
      { input: [[],3,1000], expected: [] },
      { input: [[{"key":"k","t":5},{"key":"k","t":5},{"key":"k","t":5},{"key":"k","t":14},{"key":"k","t":15},{"key":"k","t":15},{"key":"k","t":15}],2,10], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":10},{"allowed":false,"retryAfterMs":1},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":10}] },
      { input: [[{"key":"k","t":0},{"key":"k","t":1},{"key":"k","t":2},{"key":"k","t":3},{"key":"k","t":4},{"key":"k","t":10},{"key":"k","t":11},{"key":"k","t":11}],1,10], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":9},{"allowed":false,"retryAfterMs":8},{"allowed":false,"retryAfterMs":7},{"allowed":false,"retryAfterMs":6},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":9},{"allowed":false,"retryAfterMs":9}] },
      { input: [[{"key":"x","t":0},{"key":"y","t":0},{"key":"x","t":400},{"key":"y","t":600},{"key":"x","t":700},{"key":"y","t":999},{"key":"x","t":1000},{"key":"x","t":1001},{"key":"y","t":1000},{"key":"x","t":1400},{"key":"x","t":1401}],2,1000], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":300},{"allowed":false,"retryAfterMs":1},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":399},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":599}] },
      { input: [[{"key":"k","t":0},{"key":"k","t":10},{"key":"k","t":20},{"key":"k","t":5000},{"key":"k","t":5001},{"key":"k","t":5002},{"key":"k","t":5003}],3,100], expected: [{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":true,"retryAfterMs":0},{"allowed":false,"retryAfterMs":97}] },
    ],
  },
  {
    id: 'node-tracking-event-resequencer',
    number: 86,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Tracking Event Resequencer',
    difficulty: 'Easy',
    topic: 'Data & Streams',
    statement:
      'A parcel-tracking service receives status events over a network that can reorder and repeat them, but the timeline shown to customers must be in sequence order with no gaps. Implement `resequence(arrivals, firstSeq)`.\n' +
      '\n' +
      '- `arrivals` is an array of `{ seq, data }` in the order the events arrived. `seq` is an integer; the stream starts at `firstSeq` and the correct order is `firstSeq, firstSeq + 1, ...`\n' +
      '- Keep `next`, the sequence number that must be released next (initially `firstSeq`), and a buffer of events that arrived early.\n' +
      '- An arrival with `seq < next` (already released) or with a `seq` that is already in the buffer is a duplicate: ignore it. The first copy wins.\n' +
      '- Otherwise buffer it, then release as many events as possible: while the buffer holds `next`, release its `data` and add 1 to `next`.\n' +
      '\n' +
      'Return `{ released, stuck }`: `released` has one array per arrival holding the `data` values that arrival caused to be released, in order (`[]` when it released nothing), and `stuck` lists the sequence numbers still buffered at the end, ascending.',
    functionName: 'resequence',
    functionSignature: 'function resequence(arrivals, firstSeq)',
    buggyCode:
      'function resequence(arrivals, firstSeq) {\n' +
      '  // TODO: buffer early events and release them in sequence order.\n' +
      '  // - seq < next or already buffered: duplicate, ignore (first copy wins)\n' +
      '  // - otherwise buffer, then release next, next + 1, ... while they are buffered\n' +
      '  // Return { released: [[data, ...] per arrival], stuck: [seqs still buffered, ascending] }.\n' +
      '}\n',
    solution:
      'function resequence(arrivals, firstSeq) {\n' +
      '  const buffer = new Map();\n' +
      '  let next = firstSeq;\n' +
      '  const released = [];\n' +
      '  for (const { seq, data } of arrivals) {\n' +
      '    const out = [];\n' +
      '    if (seq >= next && !buffer.has(seq)) {\n' +
      '      buffer.set(seq, data);\n' +
      '      while (buffer.has(next)) {\n' +
      '        out.push(buffer.get(next));\n' +
      '        buffer.delete(next);\n' +
      '        next++;\n' +
      '      }\n' +
      '    }\n' +
      '    released.push(out);\n' +
      '  }\n' +
      '  const stuck = Array.from(buffer.keys()).sort((a, b) => a - b);\n' +
      '  return { released, stuck };\n' +
      '}\n',
    hint: 'A Map from seq to data plus one counter, next. After buffering an arrival, loop while the Map has next.',
    explanation: 'A resequencer turns an unordered, at-least-once stream into an ordered, exactly-once one. It needs only a counter for the next expected sequence number and a map of early arrivals: each arrival is either stale (below the counter), a repeat of something already waiting, or new, and a new arrival may unblock a whole run of buffered events, which is why the release step is a loop rather than a single check. Deciding that the first copy wins keeps the output stable when a retransmission carries a different payload. Each event is inserted and removed at most once, so the whole run is O(n) apart from the final sort of what is left; in production the buffer would also need a size or time limit so that one lost event cannot hold everything back forever.',
    examples: [
      { input: [[{"seq":2,"data":"out for delivery"},{"seq":1,"data":"at depot"},{"seq":3,"data":"delivered"}],1], expected: {"released":[[],["at depot","out for delivery"],["delivered"]],"stuck":[]} },
      { input: [[{"seq":1,"data":"a"},{"seq":1,"data":"a-again"},{"seq":3,"data":"c"},{"seq":3,"data":"c-again"},{"seq":5,"data":"e"},{"seq":2,"data":"b"}],1], expected: {"released":[["a"],[],[],[],[],["b","c"]],"stuck":[5]} },
      { input: [[{"seq":9,"data":"old"},{"seq":11,"data":"y"},{"seq":10,"data":"x"}],10], expected: {"released":[[],[],["x","y"]],"stuck":[]} },
    ],
    hiddenTests: [
      { input: [[],1], expected: {"released":[],"stuck":[]} },
      { input: [[{"seq":4,"data":"d"},{"seq":3,"data":"c"},{"seq":2,"data":"b"},{"seq":1,"data":"a"},{"seq":0,"data":"z"}],0], expected: {"released":[[],[],[],[],["z","a","b","c","d"]],"stuck":[]} },
      { input: [[{"seq":7,"data":"h"},{"seq":5,"data":"f"},{"seq":9,"data":"j"},{"seq":7,"data":"h2"}],0], expected: {"released":[[],[],[],[]],"stuck":[5,7,9]} },
      { input: [[{"seq":0,"data":1},{"seq":2,"data":3},{"seq":2,"data":30},{"seq":1,"data":2},{"seq":2,"data":300},{"seq":1,"data":20},{"seq":4,"data":5},{"seq":3,"data":4}],0], expected: {"released":[[1],[],[],[2,3],[],[],[],[4,5]],"stuck":[]} },
      { input: [[{"seq":101,"data":"b"},{"seq":100,"data":"a"},{"seq":100,"data":"a"},{"seq":103,"data":"d"},{"seq":99,"data":"?"}],100], expected: {"released":[[],["a","b"],[],[],[]],"stuck":[103]} },
    ],
  },
  {
    id: 'node-webhook-dedupe-window',
    number: 87,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Payment Webhook Dedupe Window',
    difficulty: 'Easy',
    topic: 'Data & Streams',
    statement:
      'A payment provider delivers webhooks at least once, so the same event id can arrive several times. The consumer remembers recently processed ids to skip repeats, but memory is bounded: it remembers only the last `windowSize` ids it processed. Implement `dedupeDeliveries(ids, windowSize)`.\n' +
      '\n' +
      '- `ids` is the array of event ids in delivery order; `windowSize` is an integer of at least 0.\n' +
      '- If an id is currently remembered, the delivery is a duplicate: skip it. A duplicate does NOT change what is remembered or the order in which ids will be forgotten.\n' +
      '- Otherwise process it and remember it. If more than `windowSize` ids are now remembered, forget the one that was processed longest ago.\n' +
      '- With `windowSize` 0 nothing is remembered and every delivery is processed.\n' +
      '\n' +
      'Return `{ processed, duplicates }`: the ids that were processed, in order (an id can appear twice if it came back after being forgotten), and the number of deliveries skipped.',
    functionName: 'dedupeDeliveries',
    functionSignature: 'function dedupeDeliveries(ids, windowSize)',
    buggyCode:
      'function dedupeDeliveries(ids, windowSize) {\n' +
      '  // TODO: remember the last windowSize processed ids (first in, first out).\n' +
      '  // remembered id -> duplicate, skip (does not refresh its place)\n' +
      '  // otherwise     -> process, remember, forget the oldest if over windowSize\n' +
      '  // Return { processed: [ids], duplicates: count }.\n' +
      '}\n',
    solution:
      'function dedupeDeliveries(ids, windowSize) {\n' +
      '  const seen = new Set();\n' +
      '  const order = [];\n' +
      '  const processed = [];\n' +
      '  let duplicates = 0;\n' +
      '  for (const id of ids) {\n' +
      '    if (seen.has(id)) {\n' +
      '      duplicates++;\n' +
      '      continue;\n' +
      '    }\n' +
      '    processed.push(id);\n' +
      '    seen.add(id);\n' +
      '    order.push(id);\n' +
      '    if (order.length > windowSize) seen.delete(order.shift());\n' +
      '  }\n' +
      '  return { processed, duplicates };\n' +
      '}\n',
    hint: 'Use a Set for the membership test and a queue of ids in the order they were processed for eviction. Only a processed id enters the queue.',
    explanation: 'At-least-once delivery pushes deduplication onto the consumer, and an unbounded "seen" set is a memory leak, so real consumers keep a bounded window. A Set answers "have I seen this?" in O(1) and a FIFO queue says which id to forget next. The eviction order is by first processing, not by last sighting: a duplicate is skipped without refreshing its position, which is what distinguishes this from an LRU cache and what the tests check. The consequence, visible in the second example, is that a redelivery arriving after its id has been forgotten is processed again; the window size is a trade between memory and how late a duplicate can be caught. O(1) per delivery, O(windowSize) memory.',
    examples: [
      { input: [["evt_1","evt_2","evt_1","evt_3"],3], expected: {"processed":["evt_1","evt_2","evt_3"],"duplicates":1} },
      { input: [["a","b","a","c","a"],2], expected: {"processed":["a","b","c","a"],"duplicates":1} },
      { input: [["a","a","a"],0], expected: {"processed":["a","a","a"],"duplicates":0} },
    ],
    hiddenTests: [
      { input: [[],5], expected: {"processed":[],"duplicates":0} },
      { input: [["a","a","a","b","b","a"],1], expected: {"processed":["a","b","a"],"duplicates":3} },
      { input: [["a","b","c","a","b","c","d","a","b"],3], expected: {"processed":["a","b","c","d","a","b"],"duplicates":3} },
      { input: [["x","y","x","x","z","y","x","w","z","x"],2], expected: {"processed":["x","y","z","x","w","z","x"],"duplicates":3} },
      { input: [["p","q","r","s","p","q","r","s"],4], expected: {"processed":["p","q","r","s"],"duplicates":4} },
    ],
  },
  {
    id: 'node-meter-frame-decoder',
    number: 88,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Meter Frame Decoder',
    difficulty: 'Medium',
    topic: 'Data & Streams',
    statement:
      'Smart electricity meters send readings over a socket as length-prefixed frames, and the network delivers the text in arbitrary chunks. A frame is `<length>:<payload>;` where `<length>` is one or more decimal digits (leading zeros allowed), `<payload>` is exactly that many characters (it may itself contain digits, `:` and `;`), and `;` closes the frame. For example `5:hello;` carries `hello` and `0:;` carries the empty string. Implement `decodeFrames(chunks)`.\n' +
      '\n' +
      '- `chunks` is an array of strings in arrival order (some may be empty). A frame may be split anywhere, across any number of chunks.\n' +
      '- A frame is complete only once its closing `;` has arrived. Report each frame\'s payload under the chunk that completed it.\n' +
      '- While reading a length: a character that is neither a digit nor `:`, or a `:` with no digits before it, is the error `"bad_length"`.\n' +
      '- If the character right after a payload is not `;`, that is the error `"bad_terminator"`.\n' +
      '- At the first error stop decoding: frames completed earlier are kept, the frame in error is not emitted, and every later chunk contributes nothing.\n' +
      '\n' +
      'Return `{ perChunk, error, incomplete }`: `perChunk` has one array of payloads per input chunk, `error` is `null` or the error name, and `incomplete` is `true` when there was no error but characters of an unfinished frame are left over at the end.',
    functionName: 'decodeFrames',
    functionSignature: 'function decodeFrames(chunks)',
    buggyCode:
      'function decodeFrames(chunks) {\n' +
      '  // TODO: decode "<length>:<payload>;" frames from a chunked stream.\n' +
      '  // Keep the unconsumed text between chunks. A frame is emitted (under the chunk\n' +
      '  // that completed it) only when its closing \';\' has arrived.\n' +
      '  // Errors: \'bad_length\' (non-digit before \':\' or no digits), \'bad_terminator\'.\n' +
      '  // Return { perChunk: [[payload, ...], ...], error: null | name, incomplete: boolean }.\n' +
      '}\n',
    solution:
      'function decodeFrames(chunks) {\n' +
      '  const perChunk = [];\n' +
      '  let buffer = \'\';\n' +
      '  let error = null;\n' +
      '  for (const chunk of chunks) {\n' +
      '    const out = [];\n' +
      '    if (error === null) {\n' +
      '      buffer += chunk;\n' +
      '      while (true) {\n' +
      '        let i = 0;\n' +
      '        while (i < buffer.length && buffer[i] >= \'0\' && buffer[i] <= \'9\') i++;\n' +
      '        if (i === buffer.length) break;\n' +
      '        if (buffer[i] !== \':\' || i === 0) {\n' +
      '          error = \'bad_length\';\n' +
      '          break;\n' +
      '        }\n' +
      '        const end = i + 1 + Number(buffer.slice(0, i));\n' +
      '        if (buffer.length <= end) break;\n' +
      '        if (buffer[end] !== \';\') {\n' +
      '          error = \'bad_terminator\';\n' +
      '          break;\n' +
      '        }\n' +
      '        out.push(buffer.slice(i + 1, end));\n' +
      '        buffer = buffer.slice(end + 1);\n' +
      '      }\n' +
      '    }\n' +
      '    perChunk.push(out);\n' +
      '  }\n' +
      '  return { perChunk, error, incomplete: error === null && buffer.length > 0 };\n' +
      '}\n',
    hint: 'Append each chunk to a buffer, then loop: read digits up to ":", work out where the frame ends, and only consume it if the whole frame INCLUDING its ";" is already in the buffer. Otherwise wait for the next chunk.',
    explanation: 'Length-prefixed framing exists because delimiter-based framing breaks as soon as the payload can contain the delimiter; splitting on `;` is the tempting approach and it corrupts any payload with a semicolon in it. The decoder is a loop over a carry-over buffer: parse the digits, find the colon, compute where the frame must end, and either consume a complete frame or leave everything in the buffer for the next chunk. "Not enough data yet" is a normal state, not an error, and it can happen in the middle of the length, the payload, or right before the terminator. Errors, by contrast, are sticky: after a bad length there is no way to know where the next frame starts, so the stream is abandoned. Re-scanning the buffer keeps the code short; total work is linear in the input as long as frames are small compared with the stream.',
    examples: [
      { input: [["5:hello;3:","abc;"]], expected: {"perChunk":[["hello"],["abc"]],"error":null,"incomplete":false} },
      { input: [["1","1:a;b:c",";12:3x;0",":;4:da"]], expected: {"perChunk":[[],[],["a;b:c;12:3x"],[""]],"error":null,"incomplete":true} },
      { input: [["2:ok;x:","1:a;"]], expected: {"perChunk":[["ok"],[]],"error":"bad_length","incomplete":false} },
    ],
    hiddenTests: [
      { input: [[]], expected: {"perChunk":[],"error":null,"incomplete":false} },
      { input: [["","2:hi","",";",""]], expected: {"perChunk":[[],[],[],["hi"],[]],"error":null,"incomplete":false} },
      { input: [["3:abcd;"]], expected: {"perChunk":[[]],"error":"bad_terminator","incomplete":false} },
      { input: [["2:hi","!","2:yo;"]], expected: {"perChunk":[[],[],[]],"error":"bad_terminator","incomplete":false} },
      { input: [["0","0","3",":","a",";","b",";","1",":",";",";"]], expected: {"perChunk":[[],[],[],[],[],[],[],["a;b"],[],[],[],[";"]],"error":null,"incomplete":false} },
      { input: [["4:kWh=;2:",":;",";3:a;b;:;","1:z;"]], expected: {"perChunk":[["kWh="],[],[":;","a;b"],[]],"error":"bad_length","incomplete":false} },
    ],
  },
  {
    id: 'node-upload-backpressure-sim',
    number: 89,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Upload Backpressure Simulator',
    difficulty: 'Medium',
    topic: 'Data & Streams',
    statement:
      'A video service copies uploads to slow storage through a buffered writer. The writer applies backpressure the way Node\'s writable streams do: once its buffer reaches the high-water mark the producer must pause, and it may resume only when the buffer has completely drained. Implement `simulateBackpressure(chunks, highWater, drainRate)` as a tick-by-tick simulation.\n' +
      '\n' +
      '- `chunks` is an array of positive integers: the sizes, in bytes, of the chunks the producer wants to write, in order. `highWater` and `drainRate` are positive integers.\n' +
      '- The buffer starts empty and the producer starts unpaused. Ticks are numbered from 1, and each tick has two steps:\n' +
      '  1. Storage drains up to `drainRate` bytes from the buffer. If the producer is paused and the buffer is now empty, the producer resumes.\n' +
      '  2. If the producer is not paused, it writes chunks one after another. Each write adds the whole chunk to the buffer (a write is never refused or split, even if it overshoots the mark). If the buffer is `>= highWater` after a write, the producer pauses and writes nothing more this tick; otherwise it carries on with the next chunk in the same tick.\n' +
      '- The simulation ends after the first tick at whose end every chunk has been written and the buffer is empty.\n' +
      '\n' +
      'Return `{ ticks, peak, pauses, writtenAt }`: the number of ticks run, the largest buffer size ever reached, how many times the producer paused, and for each chunk the tick in which it was written. For no chunks return `{ ticks: 0, peak: 0, pauses: 0, writtenAt: [] }`.',
    functionName: 'simulateBackpressure',
    functionSignature: 'function simulateBackpressure(chunks, highWater, drainRate)',
    buggyCode:
      'function simulateBackpressure(chunks, highWater, drainRate) {\n' +
      '  // TODO: simulate tick by tick (ticks start at 1).\n' +
      '  // Step 1: drain up to drainRate bytes; a paused producer resumes only when the buffer is EMPTY.\n' +
      '  // Step 2: while not paused, write the next chunk whole; pause if buffer >= highWater.\n' +
      '  // Stop after the tick where all chunks are written and the buffer is empty.\n' +
      '  // Return { ticks, peak, pauses, writtenAt }.\n' +
      '}\n',
    solution:
      'function simulateBackpressure(chunks, highWater, drainRate) {\n' +
      '  let buffer = 0;\n' +
      '  let paused = false;\n' +
      '  let next = 0;\n' +
      '  let ticks = 0;\n' +
      '  let peak = 0;\n' +
      '  let pauses = 0;\n' +
      '  const writtenAt = [];\n' +
      '  while (next < chunks.length || buffer > 0) {\n' +
      '    ticks++;\n' +
      '    buffer -= Math.min(buffer, drainRate);\n' +
      '    if (paused && buffer === 0) paused = false;\n' +
      '    while (!paused && next < chunks.length) {\n' +
      '      buffer += chunks[next];\n' +
      '      next++;\n' +
      '      writtenAt.push(ticks);\n' +
      '      peak = Math.max(peak, buffer);\n' +
      '      if (buffer >= highWater) {\n' +
      '        paused = true;\n' +
      '        pauses++;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { ticks, peak, pauses, writtenAt };\n' +
      '}\n',
    hint: 'Loop while there is still something to write or something in the buffer. Inside, do the drain step, then the resume check, then an inner loop of writes that stops when the producer pauses.',
    explanation: 'Backpressure is how a fast producer is kept from flooding a slow consumer: `write()` returns false once the buffer reaches the high-water mark, and the producer is expected to stop until the `drain` event. The high-water mark is a signal, not a hard cap: the write that crosses it is still accepted in full, which is why `peak` can exceed it. And `drain` fires when the buffer has emptied, not when it merely dips below the mark; resuming early makes the producer flap between paused and running and keeps the buffer permanently near the limit. The simulation is a direct translation: one outer loop per tick, a drain step, a resume check, then writes until paused. Cost is O(ticks + chunks).',
    examples: [
      { input: [[4,4,4],8,3], expected: {"ticks":6,"peak":8,"pauses":1,"writtenAt":[1,1,4]} },
      { input: [[1,1],10,5], expected: {"ticks":2,"peak":2,"pauses":0,"writtenAt":[1,1]} },
      { input: [[20,1],5,10], expected: {"ticks":4,"peak":20,"pauses":1,"writtenAt":[1,3]} },
    ],
    hiddenTests: [
      { input: [[],8,3], expected: {"ticks":0,"peak":0,"pauses":0,"writtenAt":[]} },
      { input: [[5],5,5], expected: {"ticks":2,"peak":5,"pauses":1,"writtenAt":[1]} },
      { input: [[3,3,3,3,3,3],6,2], expected: {"ticks":10,"peak":6,"pauses":3,"writtenAt":[1,1,4,4,7,7]} },
      { input: [[1,2,3,4,5,6],7,4], expected: {"ticks":7,"peak":11,"pauses":2,"writtenAt":[1,1,1,1,4,4]} },
      { input: [[9,1,1,1],10,1], expected: {"ticks":13,"peak":10,"pauses":1,"writtenAt":[1,1,11,11]} },
      { input: [[2,2,2],100,1], expected: {"ticks":7,"peak":6,"pauses":0,"writtenAt":[1,1,1]} },
    ],
  },
  {
    id: 'node-trip-booking-saga',
    number: 90,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Trip Booking Saga',
    difficulty: 'Medium',
    topic: 'Async Patterns',
    statement:
      'A travel site books a trip as several separate reservations (flight, hotel, car...). There is no shared database transaction, so when one booking fails the earlier ones have to be undone with compensating calls. The starter provides `callService(action, step)`: it returns a promise that resolves to the receipt string `action + \':\' + step.name`, or rejects with an `Error` when `step.failOn` equals `action`. `action` is `\'do\'` or `\'undo\'`.\n' +
      '\n' +
      'Implement `async function runSaga(steps)` where `steps` is an array of `{ name, failOn }` (`failOn` may be missing, `\'do\'` or `\'undo\'`):\n' +
      '\n' +
      '- Call `callService(\'do\', step)` for each step in order, waiting for each call before making the next.\n' +
      '- If every step succeeds, the status is `\'completed\'`.\n' +
      '- If a `do` call rejects, run no further steps. Compensate the steps that had succeeded, in REVERSE order, with `callService(\'undo\', step)`, again one at a time. The failed step itself is not compensated.\n' +
      '- If an `undo` call rejects, add that step\'s name to `stuck` and carry on compensating the remaining steps.\n' +
      '- `log` collects the receipt of every call that resolved, in the order the calls finished.\n' +
      '\n' +
      'Resolve to `{ status, log, failed, stuck }`: `failed` is the name of the step whose `do` rejected (`null` if none), `stuck` lists the steps whose `undo` rejected, and `status` is `\'completed\'`, `\'compensated\'` (a step failed and every undo worked) or `\'needs_attention\'` (a step failed and `stuck` is not empty). `runSaga` never rejects.',
    functionName: 'runSaga',
    functionSignature: 'async function runSaga(steps)',
    buggyCode:
      '// Provided: fake remote services. Do not change this function.\n' +
      'function callService(action, step) {\n' +
      '  return new Promise((resolve, reject) => {\n' +
      '    Promise.resolve().then(() => {\n' +
      '      if (step.failOn === action) reject(new Error(action + \' \' + step.name + \' failed\'));\n' +
      '      else resolve(action + \':\' + step.name);\n' +
      '    });\n' +
      '  });\n' +
      '}\n' +
      '\n' +
      'async function runSaga(steps) {\n' +
      '  // TODO: await callService(\'do\', step) for each step in order.\n' +
      '  // On the first rejection: stop, then await callService(\'undo\', step) for the steps\n' +
      '  // that succeeded, newest first. An undo that rejects goes into stuck; keep going.\n' +
      '  // Resolve to { status, log, failed, stuck } and never reject.\n' +
      '}\n',
    solution:
      '// Provided: fake remote services. Do not change this function.\n' +
      'function callService(action, step) {\n' +
      '  return new Promise((resolve, reject) => {\n' +
      '    Promise.resolve().then(() => {\n' +
      '      if (step.failOn === action) reject(new Error(action + \' \' + step.name + \' failed\'));\n' +
      '      else resolve(action + \':\' + step.name);\n' +
      '    });\n' +
      '  });\n' +
      '}\n' +
      '\n' +
      'async function runSaga(steps) {\n' +
      '  const log = [];\n' +
      '  const done = [];\n' +
      '  const stuck = [];\n' +
      '  let failed = null;\n' +
      '  for (const step of steps) {\n' +
      '    try {\n' +
      '      log.push(await callService(\'do\', step));\n' +
      '      done.push(step);\n' +
      '    } catch (err) {\n' +
      '      failed = step.name;\n' +
      '      break;\n' +
      '    }\n' +
      '  }\n' +
      '  if (failed === null) return { status: \'completed\', log, failed, stuck };\n' +
      '  for (let i = done.length - 1; i >= 0; i--) {\n' +
      '    try {\n' +
      '      log.push(await callService(\'undo\', done[i]));\n' +
      '    } catch (err) {\n' +
      '      stuck.push(done[i].name);\n' +
      '    }\n' +
      '  }\n' +
      '  return { status: stuck.length > 0 ? \'needs_attention\' : \'compensated\', log, failed, stuck };\n' +
      '}\n',
    hint: 'Keep a list of the steps whose do call resolved. Each undo needs its own try/catch inside the reverse loop, or one bad compensation will skip all the others.',
    explanation: 'A saga replaces one atomic transaction with a sequence of local ones, each paired with a compensating action. The forward pass records what actually succeeded; on the first failure the backward pass walks that record newest-first, because later steps may depend on earlier ones (cancel the hotel before the flight it was booked around). The failed step is not compensated: its own service is responsible for leaving nothing behind. Compensation is best-effort per step, so each undo gets its own `try/catch`; wrapping the whole reverse loop in a single one is the common bug, since the first failing undo then leaves every older booking in place and unreported. Whatever cannot be undone is surfaced in `stuck` for a human or a retry job. Calls are sequential: at most 2n awaits for n steps.',
    examples: [
      { input: [[{"name":"flight"},{"name":"hotel"},{"name":"car"}]], expected: {"status":"completed","log":["do:flight","do:hotel","do:car"],"failed":null,"stuck":[]} },
      { input: [[{"name":"flight"},{"name":"hotel"},{"name":"car","failOn":"do"},{"name":"tour"}]], expected: {"status":"compensated","log":["do:flight","do:hotel","undo:hotel","undo:flight"],"failed":"car","stuck":[]} },
      { input: [[{"name":"flight","failOn":"undo"},{"name":"hotel"},{"name":"car","failOn":"do"}]], expected: {"status":"needs_attention","log":["do:flight","do:hotel","undo:hotel"],"failed":"car","stuck":["flight"]} },
    ],
    hiddenTests: [
      { input: [[]], expected: {"status":"completed","log":[],"failed":null,"stuck":[]} },
      { input: [[{"name":"flight","failOn":"do"},{"name":"hotel"}]], expected: {"status":"compensated","log":[],"failed":"flight","stuck":[]} },
      { input: [[{"name":"a"},{"name":"b","failOn":"undo"},{"name":"c"},{"name":"d","failOn":"do"},{"name":"e","failOn":"do"}]], expected: {"status":"needs_attention","log":["do:a","do:b","do:c","undo:c","undo:a"],"failed":"d","stuck":["b"]} },
      { input: [[{"name":"a","failOn":"undo"},{"name":"b","failOn":"undo"},{"name":"c"}]], expected: {"status":"completed","log":["do:a","do:b","do:c"],"failed":null,"stuck":[]} },
      { input: [[{"name":"a","failOn":"undo"},{"name":"b"},{"name":"c","failOn":"undo"},{"name":"d"},{"name":"e","failOn":"do"}]], expected: {"status":"needs_attention","log":["do:a","do:b","do:c","do:d","undo:d","undo:b"],"failed":"e","stuck":["c","a"]} },
    ],
  },
  {
    id: 'node-order-outbox-relay',
    number: 91,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Order Outbox Relay',
    difficulty: 'Medium',
    topic: 'Distributed Data',
    statement:
      'An order service must publish an event to a message broker whenever it saves an order, without ever losing one. It uses the transactional outbox pattern: the event is written to an outbox table in the same database transaction as the order, and a separate relay polls that table and publishes. Implement `relayOutbox(writes, polls, batchSize)`.\n' +
      '\n' +
      '- `writes` is an array of `{ t, txn, committed, messages }` sorted by `t`. A committed transaction adds one outbox row per entry of `messages` (an array of strings), in order; the row for the message at index `i` has id `txn + \':\' + i`. A transaction with `committed: false` was rolled back and adds nothing.\n' +
      '- `polls` is an array of `{ t, accept, crash }` sorted by `t`. Process writes and polls together in time order; when a write and a poll have the same `t`, the write happens first.\n' +
      '- A poll takes up to `batchSize` of the oldest unsent rows and publishes them one at a time, in order. `accept` is how many publishes the broker accepts during this poll (`null` means no limit). Every accepted publish is recorded as `{ t, id, message }` with the poll\'s `t`. At the first publish the broker refuses, the relay stops the batch so that order is preserved.\n' +
      '- After publishing, the relay marks the accepted rows as sent, unless `crash` is `true`: then the relay died before marking, and NONE of this poll\'s rows are marked, although their publishes did happen.\n' +
      '\n' +
      'Return `{ published, unsent }`: every recorded publish in order (the same row can appear more than once), and the ids of the rows still unsent at the end, oldest first.',
    functionName: 'relayOutbox',
    functionSignature: 'function relayOutbox(writes, polls, batchSize)',
    buggyCode:
      'function relayOutbox(writes, polls, batchSize) {\n' +
      '  // TODO: merge writes and polls by time (a write goes first on a tie).\n' +
      '  // write: if committed, add rows { id: txn + \':\' + i, message } to the outbox\n' +
      '  // poll:  take up to batchSize oldest unsent rows, publish the first \'accept\' of them\n' +
      '  //        (null = all) as { t, id, message }; mark them sent unless crash is true\n' +
      '  // Return { published, unsent: [ids] }.\n' +
      '}\n',
    solution:
      'function relayOutbox(writes, polls, batchSize) {\n' +
      '  const outbox = [];\n' +
      '  const published = [];\n' +
      '  let w = 0;\n' +
      '  let p = 0;\n' +
      '  while (w < writes.length || p < polls.length) {\n' +
      '    if (w < writes.length && (p >= polls.length || writes[w].t <= polls[p].t)) {\n' +
      '      const write = writes[w++];\n' +
      '      if (write.committed) {\n' +
      '        write.messages.forEach((message, i) => outbox.push({ id: write.txn + \':\' + i, message }));\n' +
      '      }\n' +
      '    } else {\n' +
      '      const poll = polls[p++];\n' +
      '      const batch = outbox.slice(0, batchSize);\n' +
      '      const accepted = poll.accept === null ? batch.length : Math.min(poll.accept, batch.length);\n' +
      '      for (let i = 0; i < accepted; i++) {\n' +
      '        published.push({ t: poll.t, id: batch[i].id, message: batch[i].message });\n' +
      '      }\n' +
      '      if (!poll.crash) outbox.splice(0, accepted);\n' +
      '    }\n' +
      '  }\n' +
      '  return { published, unsent: outbox.map((row) => row.id) };\n' +
      '}\n',
    hint: 'Walk the two sorted lists with two indexes, like a merge. Keep the outbox as an array of unsent rows, oldest first; a poll publishes a prefix of it and (usually) removes that prefix.',
    explanation: 'The outbox pattern solves the dual-write problem: you cannot atomically commit to a database and publish to a broker, so you commit the event as a row alongside the business data and let a relay publish it afterwards. Rolled-back transactions therefore never produce events, and committed ones can never lose theirs. The price is at-least-once delivery: publishing and marking a row as sent are two separate steps, and a crash between them means the next poll publishes the same rows again, so consumers must be idempotent. Stopping a batch at the first refused publish, rather than skipping ahead, is what keeps events in commit order. The simulation is a two-pointer merge of writes and polls over a FIFO of unsent rows, O(writes + polls x batchSize).',
    examples: [
      { input: [[{"t":0,"txn":"o1","committed":true,"messages":["created","paid"]},{"t":5,"txn":"o2","committed":false,"messages":["created"]},{"t":6,"txn":"o3","committed":true,"messages":["created"]}],[{"t":10,"accept":null,"crash":false},{"t":20,"accept":null,"crash":false}],2], expected: {"published":[{"t":10,"id":"o1:0","message":"created"},{"t":10,"id":"o1:1","message":"paid"},{"t":20,"id":"o3:0","message":"created"}],"unsent":[]} },
      { input: [[{"t":0,"txn":"o1","committed":true,"messages":["created","paid"]},{"t":6,"txn":"o3","committed":true,"messages":["created"]}],[{"t":10,"accept":1,"crash":false},{"t":20,"accept":0,"crash":false},{"t":30,"accept":null,"crash":false}],2], expected: {"published":[{"t":10,"id":"o1:0","message":"created"},{"t":30,"id":"o1:1","message":"paid"},{"t":30,"id":"o3:0","message":"created"}],"unsent":[]} },
      { input: [[{"t":0,"txn":"o1","committed":true,"messages":["created","paid"]},{"t":6,"txn":"o3","committed":true,"messages":["created"]}],[{"t":10,"accept":null,"crash":true},{"t":20,"accept":null,"crash":false}],2], expected: {"published":[{"t":10,"id":"o1:0","message":"created"},{"t":10,"id":"o1:1","message":"paid"},{"t":20,"id":"o1:0","message":"created"},{"t":20,"id":"o1:1","message":"paid"}],"unsent":["o3:0"]} },
    ],
    hiddenTests: [
      { input: [[],[],3], expected: {"published":[],"unsent":[]} },
      { input: [[],[{"t":1,"accept":null,"crash":false},{"t":2,"accept":null,"crash":true}],3], expected: {"published":[],"unsent":[]} },
      { input: [[{"t":10,"txn":"a","committed":true,"messages":["x"]},{"t":20,"txn":"b","committed":true,"messages":["y"]},{"t":30,"txn":"c","committed":true,"messages":["z"]}],[{"t":5,"accept":null,"crash":false},{"t":10,"accept":null,"crash":false},{"t":19,"accept":null,"crash":false},{"t":20,"accept":null,"crash":false}],5], expected: {"published":[{"t":10,"id":"a:0","message":"x"},{"t":20,"id":"b:0","message":"y"}],"unsent":["c:0"]} },
      { input: [[{"t":0,"txn":"a","committed":true,"messages":["m0","m1","m2"]},{"t":0,"txn":"b","committed":false,"messages":["n0","n1"]},{"t":0,"txn":"c","committed":true,"messages":[]},{"t":0,"txn":"d","committed":true,"messages":["p0"]}],[{"t":1,"accept":2,"crash":true},{"t":2,"accept":1,"crash":false},{"t":3,"accept":5,"crash":false},{"t":4,"accept":null,"crash":true},{"t":5,"accept":null,"crash":false}],3], expected: {"published":[{"t":1,"id":"a:0","message":"m0"},{"t":1,"id":"a:1","message":"m1"},{"t":2,"id":"a:0","message":"m0"},{"t":3,"id":"a:1","message":"m1"},{"t":3,"id":"a:2","message":"m2"},{"t":3,"id":"d:0","message":"p0"}],"unsent":[]} },
      { input: [[{"t":0,"txn":"a","committed":true,"messages":["1","2","3","4","5"]},{"t":15,"txn":"b","committed":true,"messages":["6"]}],[{"t":10,"accept":null,"crash":false},{"t":20,"accept":1,"crash":false},{"t":30,"accept":null,"crash":true}],2], expected: {"published":[{"t":10,"id":"a:0","message":"1"},{"t":10,"id":"a:1","message":"2"},{"t":20,"id":"a:2","message":"3"},{"t":30,"id":"a:3","message":"4"},{"t":30,"id":"a:4","message":"5"}],"unsent":["a:3","a:4","b:0"]} },
    ],
  },
  {
    id: 'node-wallet-atomic-transfers',
    number: 92,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Wallet Atomic Transfers',
    difficulty: 'Easy',
    topic: 'Distributed Data',
    statement:
      'A game stores each player\'s coin balance and moves coins between wallets in transactions that must be all-or-nothing. Implement `applyTransfers(balances, transactions)`.\n' +
      '\n' +
      '- `balances` maps an account name to a whole number of coins (never negative).\n' +
      '- `transactions` is an array; each transaction is an array of transfers `{ from, to, amount }` with a positive integer `amount`.\n' +
      '- Run the transactions in order. Inside a transaction apply the transfers in order: take `amount` from `from` and add it to `to`. Later transfers see the effect of earlier ones in the same transaction.\n' +
      '- A transfer fails if `from` or `to` is not an existing account, or if `from` holds less than `amount` at that moment (a balance may drop to exactly 0).\n' +
      '- If any transfer fails, the whole transaction is rolled back: balances return to what they were before it started, its remaining transfers are not attempted, and its result is `\'rolled_back\'`. Otherwise its result is `\'committed\'`. An empty transaction commits.\n' +
      '\n' +
      'Return `{ balances, results }`: the final balances and one result per transaction.',
    functionName: 'applyTransfers',
    functionSignature: 'function applyTransfers(balances, transactions)',
    buggyCode:
      'function applyTransfers(balances, transactions) {\n' +
      '  // TODO: apply each transaction\'s transfers in order, all-or-nothing.\n' +
      '  // A transfer fails on an unknown account or when \'from\' has less than \'amount\'.\n' +
      '  // On failure restore the balances from before the transaction: \'rolled_back\'.\n' +
      '  // Otherwise \'committed\'.\n' +
      '  // Return { balances, results }.\n' +
      '}\n',
    solution:
      'function applyTransfers(balances, transactions) {\n' +
      '  let current = Object.assign({}, balances);\n' +
      '  const results = [];\n' +
      '  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);\n' +
      '  for (const transfers of transactions) {\n' +
      '    const draft = Object.assign({}, current);\n' +
      '    let ok = true;\n' +
      '    for (const { from, to, amount } of transfers) {\n' +
      '      if (!has(draft, from) || !has(draft, to) || draft[from] < amount) {\n' +
      '        ok = false;\n' +
      '        break;\n' +
      '      }\n' +
      '      draft[from] -= amount;\n' +
      '      draft[to] += amount;\n' +
      '    }\n' +
      '    if (ok) current = draft;\n' +
      '    results.push(ok ? \'committed\' : \'rolled_back\');\n' +
      '  }\n' +
      '  return { balances: current, results };\n' +
      '}\n',
    hint: 'Work on a copy of the balances for each transaction and only replace the real ones if every transfer in it succeeded.',
    explanation: 'Atomicity means a transaction is never seen half-applied. The simplest way to get it in memory is copy-on-write: clone the balances, apply the transfers to the clone, and swap the clone in only if nothing failed; a failure just discards the clone, so rollback costs nothing. Validating every transfer against the starting balances before applying any looks equivalent but is not: transfers inside one transaction build on each other, so coins received in step one may legitimately be spent in step two, and the same account can be drained by two individually valid transfers. The check has to be made against the in-progress state. Cost is O(accounts) per transaction for the copy plus O(transfers); an undo log of the changes made so far would avoid the copy when there are many accounts.',
    examples: [
      { input: [{"ana":100,"bo":50,"cy":0},[[{"from":"ana","to":"bo","amount":30}],[{"from":"bo","to":"cy","amount":100}]]], expected: {"balances":{"ana":70,"bo":80,"cy":0},"results":["committed","rolled_back"]} },
      { input: [{"ana":100,"bo":50,"cy":0},[[{"from":"ana","to":"bo","amount":60},{"from":"ana","to":"cy","amount":60}]]], expected: {"balances":{"ana":100,"bo":50,"cy":0},"results":["rolled_back"]} },
      { input: [{"ana":100,"bo":50,"cy":0},[[{"from":"ana","to":"cy","amount":100},{"from":"cy","to":"bo","amount":100}]]], expected: {"balances":{"ana":0,"bo":150,"cy":0},"results":["committed"]} },
    ],
    hiddenTests: [
      { input: [{"a":5},[]], expected: {"balances":{"a":5},"results":[]} },
      { input: [{"a":5,"b":0},[[],[{"from":"a","to":"b","amount":5}],[{"from":"a","to":"b","amount":1}],[{"from":"b","to":"a","amount":5}]]], expected: {"balances":{"a":5,"b":0},"results":["committed","committed","rolled_back","committed"]} },
      { input: [{"a":10,"b":10},[[{"from":"a","to":"b","amount":4},{"from":"b","to":"ghost","amount":1}],[{"from":"ghost","to":"a","amount":1}],[{"from":"a","to":"b","amount":10}]]], expected: {"balances":{"a":0,"b":20},"results":["rolled_back","rolled_back","committed"]} },
      { input: [{"a":10,"b":0,"c":0},[[{"from":"a","to":"b","amount":10},{"from":"b","to":"c","amount":10},{"from":"c","to":"a","amount":11}],[{"from":"a","to":"c","amount":3},{"from":"a","to":"b","amount":3},{"from":"c","to":"b","amount":3}]]], expected: {"balances":{"a":4,"b":6,"c":0},"results":["rolled_back","committed"]} },
      { input: [{"x":1,"y":1},[[{"from":"x","to":"x","amount":1}],[{"from":"x","to":"x","amount":2}],[{"from":"x","to":"y","amount":1},{"from":"y","to":"x","amount":2},{"from":"x","to":"y","amount":3}]]], expected: {"balances":{"x":1,"y":1},"results":["committed","rolled_back","rolled_back"]} },
    ],
  },
  {
    id: 'node-notes-lww-merge',
    number: 93,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Notes Last-Writer-Wins Merge',
    difficulty: 'Easy',
    topic: 'Distributed Data',
    statement:
      'A notes app keeps a copy of each user\'s data on two servers, and the copies drift apart while the servers cannot reach each other. When they reconnect, the copies are merged field by field with a last-writer-wins rule. Implement `mergeReplicas(a, b)`.\n' +
      '\n' +
      '- `a` and `b` are objects mapping a field name to an entry `{ value, ts, node, deleted }`: the value, the timestamp of the write, the id of the server that accepted it, and whether the write was a deletion (a deletion is kept as an entry with `deleted: true` and `value: null`, a "tombstone").\n' +
      '- For a field present in only one replica, take that entry.\n' +
      '- For a field present in both, take the entry with the larger `ts`. If the timestamps are equal, take the one with the larger `node` (plain string comparison). If both are equal the entries are identical.\n' +
      '- Tombstones compete like any other entry and are kept in the result when they win.\n' +
      '\n' +
      'Return `{ merged, live }`: `merged` maps every field of either replica to its winning entry, and `live` lists the fields whose winning entry is not deleted, sorted ascending.',
    functionName: 'mergeReplicas',
    functionSignature: 'function mergeReplicas(a, b)',
    buggyCode:
      'function mergeReplicas(a, b) {\n' +
      '  // TODO: merge two replicas entry by entry.\n' +
      '  // Each entry is { value, ts, node, deleted }. Larger ts wins; on a ts tie the\n' +
      '  // larger node id wins. Tombstones (deleted: true) are kept when they win.\n' +
      '  // Return { merged: { field: entry }, live: [non-deleted field names, sorted] }.\n' +
      '}\n',
    solution:
      'function mergeReplicas(a, b) {\n' +
      '  const merged = {};\n' +
      '  const newer = (x, y) => x.ts > y.ts || (x.ts === y.ts && x.node > y.node);\n' +
      '  for (const key of Object.keys(a)) merged[key] = a[key];\n' +
      '  for (const key of Object.keys(b)) {\n' +
      '    const mine = Object.prototype.hasOwnProperty.call(merged, key) ? merged[key] : null;\n' +
      '    if (mine === null || newer(b[key], mine)) merged[key] = b[key];\n' +
      '  }\n' +
      '  const live = Object.keys(merged).filter((key) => !merged[key].deleted).sort();\n' +
      '  return { merged, live };\n' +
      '}\n',
    hint: 'Write a small "is x newer than y" function that compares ts first and node second, then use it for every field that appears on both sides.',
    explanation: 'Last-writer-wins is the simplest way to reconcile replicas: every write carries a timestamp, and the merge keeps the newest entry per field. Two details make it correct. First, ties must be broken by something both sides agree on, here the node id; otherwise merge(a, b) and merge(b, a) can disagree and the replicas never converge. Second, deletions have to be stored as tombstones that take part in the comparison. If a delete simply removed the field, the other replica\'s older copy would look like a brand-new value and the deleted data would come back. The merge is commutative and idempotent, so replicas can exchange state in any order, any number of times. O(n) over the fields plus the sort for `live`.',
    examples: [
      { input: [{"title":{"value":"Draft","ts":5,"node":"n1","deleted":false},"body":{"value":"hello","ts":6,"node":"n1","deleted":false}},{"title":{"value":"Final","ts":9,"node":"n2","deleted":false},"tags":{"value":"work","ts":2,"node":"n2","deleted":false}}], expected: {"merged":{"title":{"value":"Final","ts":9,"node":"n2","deleted":false},"body":{"value":"hello","ts":6,"node":"n1","deleted":false},"tags":{"value":"work","ts":2,"node":"n2","deleted":false}},"live":["body","tags","title"]} },
      { input: [{"todo":{"value":"buy milk","ts":3,"node":"n1","deleted":false},"pin":{"value":true,"ts":8,"node":"n1","deleted":false}},{"todo":{"value":null,"ts":7,"node":"n2","deleted":true},"pin":{"value":null,"ts":4,"node":"n2","deleted":true}}], expected: {"merged":{"todo":{"value":null,"ts":7,"node":"n2","deleted":true},"pin":{"value":true,"ts":8,"node":"n1","deleted":false}},"live":["pin"]} },
      { input: [{"color":{"value":"red","ts":4,"node":"n1","deleted":false},"size":{"value":"L","ts":4,"node":"n2","deleted":false}},{"color":{"value":"blue","ts":4,"node":"n2","deleted":false},"size":{"value":"M","ts":4,"node":"n1","deleted":false}}], expected: {"merged":{"color":{"value":"blue","ts":4,"node":"n2","deleted":false},"size":{"value":"L","ts":4,"node":"n2","deleted":false}},"live":["color","size"]} },
    ],
    hiddenTests: [
      { input: [{},{}], expected: {"merged":{},"live":[]} },
      { input: [{"zeta":{"value":1,"ts":1,"node":"n1","deleted":false},"alpha":{"value":null,"ts":2,"node":"n1","deleted":true}},{}], expected: {"merged":{"zeta":{"value":1,"ts":1,"node":"n1","deleted":false},"alpha":{"value":null,"ts":2,"node":"n1","deleted":true}},"live":["zeta"]} },
      { input: [{},{"m":{"value":"x","ts":1,"node":"n2","deleted":false},"b":{"value":"y","ts":1,"node":"n2","deleted":false},"k":{"value":null,"ts":1,"node":"n2","deleted":true}}], expected: {"merged":{"m":{"value":"x","ts":1,"node":"n2","deleted":false},"b":{"value":"y","ts":1,"node":"n2","deleted":false},"k":{"value":null,"ts":1,"node":"n2","deleted":true}},"live":["b","m"]} },
      { input: [{"k":{"value":null,"ts":5,"node":"n1","deleted":true},"j":{"value":"keep","ts":5,"node":"n3","deleted":false}},{"k":{"value":"back","ts":5,"node":"n2","deleted":false},"j":{"value":null,"ts":5,"node":"n2","deleted":true}}], expected: {"merged":{"k":{"value":"back","ts":5,"node":"n2","deleted":false},"j":{"value":"keep","ts":5,"node":"n3","deleted":false}},"live":["j","k"]} },
      { input: [{"a":{"value":1,"ts":10,"node":"n2","deleted":false},"b":{"value":2,"ts":3,"node":"n2","deleted":false},"c":{"value":null,"ts":7,"node":"n2","deleted":true},"d":{"value":4,"ts":1,"node":"n2","deleted":false}},{"a":{"value":9,"ts":10,"node":"n1","deleted":false},"b":{"value":null,"ts":3,"node":"n9","deleted":true},"c":{"value":3,"ts":6,"node":"n1","deleted":false},"e":{"value":5,"ts":1,"node":"n1","deleted":false}}], expected: {"merged":{"a":{"value":1,"ts":10,"node":"n2","deleted":false},"b":{"value":null,"ts":3,"node":"n9","deleted":true},"c":{"value":null,"ts":7,"node":"n2","deleted":true},"d":{"value":4,"ts":1,"node":"n2","deleted":false},"e":{"value":5,"ts":1,"node":"n1","deleted":false}},"live":["a","d","e"]} },
    ],
  },
  {
    id: 'node-smart-home-retained-broker',
    number: 94,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Smart Home Retained Topic Broker',
    difficulty: 'Hard',
    topic: 'Caching & State',
    statement:
      'A smart-home hub routes sensor readings with a small MQTT-style broker. Topics are made of levels separated by `/` (for example `home/kitchen/temp`; levels are never empty). A subscription filter is written the same way, with two wildcards:\n' +
      '\n' +
      '- `+` matches exactly one level.\n' +
      '- `#` may appear only as the LAST level of a filter and matches zero or more remaining levels, so `home/#` matches `home`, `home/attic` and `home/attic/temp`, and `#` alone matches every topic.\n' +
      '- Every other level must be equal, and without `#` the filter and the topic must have the same number of levels.\n' +
      '\n' +
      'Implement `runBroker(ops)` over these ops:\n' +
      '\n' +
      '- `[\'sub\', client, filter]`: if the client already holds this exact filter, do nothing at all. Otherwise add the subscription, then immediately deliver to this client every retained message whose topic matches the filter, in ascending topic order (plain string comparison).\n' +
      '- `[\'unsub\', client, filter]`: remove that exact subscription if it exists.\n' +
      '- `[\'pub\', topic, payload, retain]`: if `retain` is `true` and `payload` is `null`, forget the retained message of that topic and deliver nothing. Otherwise deliver the message to every client that has at least one matching subscription, once per client, ordering clients by the creation order of their first matching subscription; and if `retain` is `true`, store the payload as that topic\'s retained message (replacing any earlier one).\n' +
      '\n' +
      'Return the delivery log: an array of `[client, topic, payload]` triples in the order they were delivered.',
    functionName: 'runBroker',
    functionSignature: 'function runBroker(ops)',
    buggyCode:
      'function runBroker(ops) {\n' +
      '  // TODO: MQTT-style broker with retained messages.\n' +
      '  // Filters: \'+\' = exactly one level, trailing \'#\' = zero or more levels.\n' +
      '  // [\'sub\', client, filter]            new subscription, then replay matching retained\n' +
      '  //                                    messages to that client in ascending topic order\n' +
      '  // [\'unsub\', client, filter]          remove that exact subscription\n' +
      '  // [\'pub\', topic, payload, retain]    retain + null payload clears and delivers nothing;\n' +
      '  //                                    otherwise deliver once per matching client (order of\n' +
      '  //                                    their first matching subscription) and maybe retain\n' +
      '  // Return [[client, topic, payload], ...].\n' +
      '}\n',
    solution:
      'function runBroker(ops) {\n' +
      '  const subs = [];\n' +
      '  const retained = new Map();\n' +
      '  const log = [];\n' +
      '  const matches = (filter, topic) => {\n' +
      '    const f = filter.split(\'/\');\n' +
      '    const t = topic.split(\'/\');\n' +
      '    for (let i = 0; i < f.length; i++) {\n' +
      '      if (f[i] === \'#\') return true;\n' +
      '      if (i >= t.length) return false;\n' +
      '      if (f[i] !== \'+\' && f[i] !== t[i]) return false;\n' +
      '    }\n' +
      '    return f.length === t.length;\n' +
      '  };\n' +
      '  for (const op of ops) {\n' +
      '    if (op[0] === \'sub\') {\n' +
      '      const [, client, filter] = op;\n' +
      '      if (subs.some((s) => s.client === client && s.filter === filter)) continue;\n' +
      '      subs.push({ client, filter });\n' +
      '      const topics = Array.from(retained.keys()).filter((topic) => matches(filter, topic)).sort();\n' +
      '      for (const topic of topics) log.push([client, topic, retained.get(topic)]);\n' +
      '    } else if (op[0] === \'unsub\') {\n' +
      '      const i = subs.findIndex((s) => s.client === op[1] && s.filter === op[2]);\n' +
      '      if (i >= 0) subs.splice(i, 1);\n' +
      '    } else {\n' +
      '      const [, topic, payload, retain] = op;\n' +
      '      if (retain && payload === null) {\n' +
      '        retained.delete(topic);\n' +
      '        continue;\n' +
      '      }\n' +
      '      const reached = new Set();\n' +
      '      for (const s of subs) {\n' +
      '        if (!reached.has(s.client) && matches(s.filter, topic)) {\n' +
      '          reached.add(s.client);\n' +
      '          log.push([s.client, topic, payload]);\n' +
      '        }\n' +
      '      }\n' +
      '      if (retain) retained.set(topic, payload);\n' +
      '    }\n' +
      '  }\n' +
      '  return log;\n' +
      '}\n',
    hint: 'Write matches(filter, topic) first and test it on its own: walk the filter levels, return true as soon as you hit "#", and otherwise require equal lengths at the end. The broker is then a list of subscriptions plus a Map of retained messages.',
    explanation: 'The broker has two pieces of state: the subscriptions in creation order and a map from topic to its retained message. Matching walks the filter level by level; `+` consumes exactly one topic level, and `#` ends the comparison successfully wherever it is reached, including when the topic has already run out, which is how `home/#` matches `home` itself. Checking "is there a topic level left?" before checking for `#` is the usual off-by-one. Retained messages give late subscribers the last known value of each matching topic as soon as they subscribe, and publishing a retained null payload is the conventional way to clear one. Delivering once per client, not once per subscription, matters because overlapping filters such as `x/+` and `x/#` are common. Each publish costs O(subscriptions x levels).',
    examples: [
      { input: [[["sub","hall","home/+/temp"],["sub","log","home/#"],["pub","home/kitchen/temp",21,false],["pub","home/kitchen/door","open",false],["pub","home","online",false]]], expected: [["hall","home/kitchen/temp",21],["log","home/kitchen/temp",21],["log","home/kitchen/door","open"],["log","home","online"]] },
      { input: [[["pub","home/attic/temp",17,true],["pub","home/attic/hum",40,false],["sub","late","home/attic/+"],["pub","home/attic/temp",18,true],["sub","other","#"],["pub","home/attic/temp",null,true],["sub","third","home/#"]]], expected: [["late","home/attic/temp",17],["late","home/attic/temp",18],["other","home/attic/temp",18]] },
      { input: [[["sub","a","x/+"],["sub","a","x/#"],["pub","x/y",1,false],["unsub","a","x/+"],["pub","x/y",2,false],["pub","x/y/z",3,false],["unsub","a","x/#"],["pub","x/y",4,false]]], expected: [["a","x/y",1],["a","x/y",2],["a","x/y/z",3]] },
    ],
    hiddenTests: [
      { input: [[]], expected: [] },
      { input: [[["sub","c","a/+"],["pub","a",1,false],["pub","a/b",2,false],["pub","a/b/c",3,false],["sub","d","a/#"],["pub","a",4,false],["pub","ab",5,false],["sub","e","+"],["pub","a",6,false],["pub","b/a",7,false]]], expected: [["c","a/b",2],["d","a",4],["d","a",6],["e","a",6]] },
      { input: [[["pub","z/1","z",true],["pub","b/2","b",true],["pub","b/10","b10",true],["pub","b","root",true],["sub","all","#"],["sub","bs","b/#"],["sub","bs","b/#"],["sub","one","+/1"],["unsub","bs","b/#"],["sub","bs","b/#"]]], expected: [["all","b","root"],["all","b/10","b10"],["all","b/2","b"],["all","z/1","z"],["bs","b","root"],["bs","b/10","b10"],["bs","b/2","b"],["one","z/1","z"],["bs","b","root"],["bs","b/10","b10"],["bs","b/2","b"]] },
      { input: [[["sub","p","r/+/t"],["sub","q","r/#"],["sub","p","#"],["pub","r/s/t",1,false],["unsub","p","r/+/t"],["pub","r/s/t",2,false],["unsub","q","nope"],["unsub","nobody","#"],["pub","other",3,true],["pub","other",null,true],["pub","other",null,false],["sub","late","other"]]], expected: [["p","r/s/t",1],["q","r/s/t",1],["q","r/s/t",2],["p","r/s/t",2],["p","other",3],["p","other",null]] },
      { input: [[["pub","a/b",1,true],["pub","a/b",2,true],["pub","a/c",3,true],["pub","a/c",null,true],["sub","s","a/+"],["sub","t","+/+/#"],["pub","a/b/c/d",5,true],["sub","u","a/b/#"]]], expected: [["s","a/b",2],["t","a/b",2],["t","a/b/c/d",5],["u","a/b",2],["u","a/b/c/d",5]] },
    ],
  },
  {
    id: 'node-sharded-audit-page-merge',
    number: 95,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Sharded Audit Log Page Merge',
    difficulty: 'Medium',
    topic: 'Pagination & Data',
    statement:
      'An audit log is stored across several database shards. Each shard returns its own events sorted by time, and the API has to present them as one time-ordered list, paged with a cursor that remembers how far it has read into every shard. Implement `mergeShardPage(shards, cursor, limit)`.\n' +
      '\n' +
      '- `shards` is an array of arrays; each inner array holds events `{ ts, id }` already sorted by `ts` ascending. `limit` is at least 1.\n' +
      '- `cursor` is `null` for the first page. Otherwise it must be an array with one entry per shard, each an integer from 0 to that shard\'s length: the number of events already returned from that shard. Anything else (wrong length, a non-integer, a value out of range) returns `{ error: \'bad_cursor\' }`.\n' +
      '- Starting from the cursor\'s offsets, repeatedly take the unread event with the smallest `ts`. When several shards tie on `ts`, take from the shard with the lowest index. Stop after `limit` events or when every shard is exhausted.\n' +
      '- Return `{ items, nextCursor }`: the events taken, in order, and the offsets after this page. `nextCursor` is `null` when no unread events remain in any shard, including when this page happened to end exactly at the end.',
    functionName: 'mergeShardPage',
    functionSignature: 'function mergeShardPage(shards, cursor, limit)',
    buggyCode:
      'function mergeShardPage(shards, cursor, limit) {\n' +
      '  // TODO: k-way merge one page out of per-shard sorted lists.\n' +
      '  // cursor: null (start) or one offset per shard (integer, 0..shard.length), else\n' +
      '  //         return { error: \'bad_cursor\' }\n' +
      '  // Take the smallest unread ts each time; ties go to the lowest shard index.\n' +
      '  // Return { items, nextCursor } with nextCursor null when nothing is left unread.\n' +
      '}\n',
    solution:
      'function mergeShardPage(shards, cursor, limit) {\n' +
      '  let offsets;\n' +
      '  if (cursor === null) {\n' +
      '    offsets = shards.map(() => 0);\n' +
      '  } else {\n' +
      '    const valid =\n' +
      '      Array.isArray(cursor) &&\n' +
      '      cursor.length === shards.length &&\n' +
      '      cursor.every((n, i) => Number.isInteger(n) && n >= 0 && n <= shards[i].length);\n' +
      '    if (!valid) return { error: \'bad_cursor\' };\n' +
      '    offsets = cursor.slice();\n' +
      '  }\n' +
      '  const items = [];\n' +
      '  while (items.length < limit) {\n' +
      '    let best = -1;\n' +
      '    for (let i = 0; i < shards.length; i++) {\n' +
      '      if (offsets[i] >= shards[i].length) continue;\n' +
      '      if (best === -1 || shards[i][offsets[i]].ts < shards[best][offsets[best]].ts) best = i;\n' +
      '    }\n' +
      '    if (best === -1) break;\n' +
      '    items.push(shards[best][offsets[best]]);\n' +
      '    offsets[best]++;\n' +
      '  }\n' +
      '  const done = offsets.every((n, i) => n >= shards[i].length);\n' +
      '  return { items, nextCursor: done ? null : offsets };\n' +
      '}\n',
    hint: 'Keep one read position per shard. Each step looks at the head of every shard that still has events and takes the smallest; a strict "<" while scanning shards in index order gives the tie-break for free.',
    explanation: 'Paging over shards is a k-way merge that can be paused and resumed. The cursor cannot be a single offset or a single timestamp: a global offset would force re-merging everything before it, and a timestamp alone cannot say which of several events with the same `ts` were already returned. One offset per shard captures the position exactly, and a fixed tie-break (lowest shard first) makes every page deterministic so that consecutive pages neither repeat nor skip events. `nextCursor` must be decided by looking at what is left, not by whether the page came back full, otherwise a client whose last page is exactly `limit` long is sent to fetch an empty page. Validating the cursor matters because it comes back from the client. Each item costs O(k) for k shards; a heap brings that to O(log k) when there are many shards.',
    examples: [
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],null,3], expected: {"items":[{"ts":1,"id":"a1"},{"ts":2,"id":"b1"},{"ts":4,"id":"a2"}],"nextCursor":[2,1,0]} },
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],[2,1,0],3], expected: {"items":[{"ts":4,"id":"b2"},{"ts":9,"id":"a3"}],"nextCursor":null} },
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],[1,1],2], expected: {"error":"bad_cursor"} },
    ],
    hiddenTests: [
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],null,5], expected: {"items":[{"ts":1,"id":"a1"},{"ts":2,"id":"b1"},{"ts":4,"id":"a2"},{"ts":4,"id":"b2"},{"ts":9,"id":"a3"}],"nextCursor":null} },
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],[1,0,0],2], expected: {"items":[{"ts":2,"id":"b1"},{"ts":4,"id":"a2"}],"nextCursor":[2,1,0]} },
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],[3,2,0],4], expected: {"items":[],"nextCursor":null} },
      { input: [[[{"ts":1,"id":"a1"},{"ts":4,"id":"a2"},{"ts":9,"id":"a3"}],[{"ts":2,"id":"b1"},{"ts":4,"id":"b2"}],[]],[4,0,0],2], expected: {"error":"bad_cursor"} },
      { input: [[[],[]],null,3], expected: {"items":[],"nextCursor":null} },
      { input: [[[{"ts":5,"id":"x1"},{"ts":5,"id":"x2"}],[{"ts":5,"id":"y1"}],[{"ts":3,"id":"z1"},{"ts":5,"id":"z2"},{"ts":6,"id":"z3"}]],[0,0,1],3], expected: {"items":[{"ts":5,"id":"x1"},{"ts":5,"id":"x2"},{"ts":5,"id":"y1"}],"nextCursor":[2,1,1]} },
    ],
  },
  {
    id: 'node-ticket-aging-scheduler',
    number: 96,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Support Ticket Aging Scheduler',
    difficulty: 'Medium',
    topic: 'Scheduling & Jobs',
    statement:
      'A background worker processes jobs by priority, but a strict priority queue can starve low-priority jobs forever. The fix is aging: the longer a job waits, the more its priority grows. Implement `scheduleWithAging(jobs, ageEveryMs)` for a single worker that runs one job at a time and never interrupts a job.\n' +
      '\n' +
      '- `jobs` is an array of `{ id, arrive, ms, priority }` sorted by `arrive` (non-decreasing): the time the job is submitted, how long it runs (positive), and its base priority (an integer; higher runs first).\n' +
      '- The clock starts at 0. Whenever the worker is free at time `T`, the candidates are the jobs not yet started with `arrive <= T`. If there are none, the worker idles until the next job arrives and decides at that time instead.\n' +
      '- A candidate\'s effective priority at time `T` is `priority + Math.floor((T - arrive) / ageEveryMs)`.\n' +
      '- Start the candidate with the highest effective priority. Ties go to the job that arrived earlier, and then to the one that comes first in `jobs`.\n' +
      '- The chosen job runs from `T` to `T + ms`, and the worker is free again at `T + ms`.\n' +
      '\n' +
      'Return the runs in execution order as `{ id, start, end }`.',
    functionName: 'scheduleWithAging',
    functionSignature: 'function scheduleWithAging(jobs, ageEveryMs)',
    buggyCode:
      'function scheduleWithAging(jobs, ageEveryMs) {\n' +
      '  // TODO: single worker, no preemption, clock starts at 0.\n' +
      '  // When free at T: candidates = unstarted jobs with arrive <= T (if none, jump T to\n' +
      '  // the next arrival). Effective priority = priority + floor((T - arrive) / ageEveryMs).\n' +
      '  // Highest wins; ties -> earlier arrive, then earlier position in jobs.\n' +
      '  // Return [{ id, start, end }, ...] in execution order.\n' +
      '}\n',
    solution:
      'function scheduleWithAging(jobs, ageEveryMs) {\n' +
      '  const waiting = jobs.slice();\n' +
      '  const runs = [];\n' +
      '  let now = 0;\n' +
      '  while (waiting.length > 0) {\n' +
      '    if (waiting[0].arrive > now) now = waiting[0].arrive;\n' +
      '    let best = -1;\n' +
      '    let bestScore = 0;\n' +
      '    for (let i = 0; i < waiting.length && waiting[i].arrive <= now; i++) {\n' +
      '      const score = waiting[i].priority + Math.floor((now - waiting[i].arrive) / ageEveryMs);\n' +
      '      if (best === -1 || score > bestScore) {\n' +
      '        best = i;\n' +
      '        bestScore = score;\n' +
      '      }\n' +
      '    }\n' +
      '    const job = waiting.splice(best, 1)[0];\n' +
      '    runs.push({ id: job.id, start: now, end: now + job.ms });\n' +
      '    now += job.ms;\n' +
      '  }\n' +
      '  return runs;\n' +
      '}\n',
    hint: 'Keep the unstarted jobs in their given order. Because that order is by arrival, scanning it front to back with a strict ">" already implements both tie-breaks.',
    explanation: 'This is an event-driven simulation with one decision point: the moment the worker becomes free. At that moment compute every waiting job\'s effective priority from how long it has waited and pick the best. Effective priority cannot be cached or kept in an ordinary heap, because it depends on the current time and jobs that arrived at different times age at different offsets, so the ranking can change between decisions; with small queues a linear scan per decision is the honest solution. Two details are easy to get wrong: jobs that have not arrived yet are not candidates, and when nothing has arrived the clock must jump to the next arrival rather than tick. Keeping the list in arrival order makes a strict comparison implement the stated tie-breaks. O(n^2) overall for n jobs.',
    examples: [
      { input: [[{"id":"A","arrive":0,"ms":30,"priority":1},{"id":"B","arrive":5,"ms":10,"priority":1},{"id":"C","arrive":10,"ms":10,"priority":3},{"id":"D","arrive":20,"ms":10,"priority":2}],10], expected: [{"id":"A","start":0,"end":30},{"id":"C","start":30,"end":40},{"id":"B","start":40,"end":50},{"id":"D","start":50,"end":60}] },
      { input: [[{"id":"big","arrive":0,"ms":50,"priority":5},{"id":"low","arrive":0,"ms":5,"priority":1},{"id":"high","arrive":45,"ms":5,"priority":5}],10], expected: [{"id":"big","start":0,"end":50},{"id":"low","start":50,"end":55},{"id":"high","start":55,"end":60}] },
      { input: [[{"id":"A","arrive":10,"ms":5,"priority":0},{"id":"B","arrive":100,"ms":5,"priority":9}],10], expected: [{"id":"A","start":10,"end":15},{"id":"B","start":100,"end":105}] },
    ],
    hiddenTests: [
      { input: [[],10], expected: [] },
      { input: [[{"id":"X","arrive":0,"ms":20,"priority":9},{"id":"P","arrive":0,"ms":5,"priority":1},{"id":"Q","arrive":10,"ms":5,"priority":2}],10], expected: [{"id":"X","start":0,"end":20},{"id":"P","start":20,"end":25},{"id":"Q","start":25,"end":30}] },
      { input: [[{"id":"a","arrive":3,"ms":4,"priority":2},{"id":"b","arrive":3,"ms":4,"priority":2},{"id":"c","arrive":3,"ms":4,"priority":3},{"id":"d","arrive":3,"ms":4,"priority":2}],100], expected: [{"id":"c","start":3,"end":7},{"id":"a","start":7,"end":11},{"id":"b","start":11,"end":15},{"id":"d","start":15,"end":19}] },
      { input: [[{"id":"run","arrive":0,"ms":100,"priority":0},{"id":"old","arrive":1,"ms":10,"priority":-3},{"id":"mid","arrive":40,"ms":10,"priority":2},{"id":"new","arrive":99,"ms":10,"priority":6},{"id":"gap","arrive":500,"ms":1,"priority":0}],20], expected: [{"id":"run","start":0,"end":100},{"id":"new","start":100,"end":110},{"id":"mid","start":110,"end":120},{"id":"old","start":120,"end":130},{"id":"gap","start":500,"end":501}] },
      { input: [[{"id":"j1","arrive":0,"ms":9,"priority":0},{"id":"j2","arrive":0,"ms":9,"priority":1},{"id":"j3","arrive":9,"ms":9,"priority":1},{"id":"j4","arrive":18,"ms":9,"priority":2},{"id":"j5","arrive":18,"ms":9,"priority":3}],9], expected: [{"id":"j2","start":0,"end":9},{"id":"j1","start":9,"end":18},{"id":"j5","start":18,"end":27},{"id":"j3","start":27,"end":36},{"id":"j4","start":36,"end":45}] },
    ],
  },
  {
    id: 'node-tenant-keyed-job-pool',
    number: 97,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Per-Tenant Keyed Job Pool',
    difficulty: 'Hard',
    topic: 'Scheduling & Jobs',
    statement:
      'A report service runs export jobs on a pool of workers. Two rules apply at once: at most `limit` jobs run at the same time, and two jobs of the same tenant never run together, because they write to the same files. The team wants the scheduling policy as a pure simulation over virtual time. Implement `simulateKeyedPool(jobs, limit)`.\n' +
      '\n' +
      '- `jobs` is an array of `{ id, key, ms }` (`ms` is a positive integer, `key` is the tenant). All jobs are queued at time 0 in array order. `limit` is at least 1.\n' +
      '- At time 0, and again at every moment a job finishes, fill the pool: while fewer than `limit` jobs are running, start the earliest job in the queue whose `key` is not running right now. A job whose key is busy is skipped for the moment but keeps its place in the queue; jobs behind it may start first.\n' +
      '- A job started at time `s` runs until `s + ms`. When several jobs finish at the same moment, all of them are finished (their workers and keys are free) before the pool is filled.\n' +
      '\n' +
      'Return `{ runs, makespan }`: `runs` lists `{ id, start, end }` in the order the jobs were started, and `makespan` is the time the last job finishes (`0` for no jobs).',
    functionName: 'simulateKeyedPool',
    functionSignature: 'function simulateKeyedPool(jobs, limit)',
    buggyCode:
      'function simulateKeyedPool(jobs, limit) {\n' +
      '  // TODO: simulate in virtual time; every job is queued at time 0.\n' +
      '  // Fill the pool at time 0 and at every completion time: while running < limit, start\n' +
      '  // the earliest queued job whose key is not currently running (skip busy keys).\n' +
      '  // Jobs that finish at the same moment all finish before the pool is refilled.\n' +
      '  // Return { runs: [{ id, start, end }, ...] in start order, makespan }.\n' +
      '}\n',
    solution:
      'function simulateKeyedPool(jobs, limit) {\n' +
      '  const waiting = jobs.slice();\n' +
      '  let running = [];\n' +
      '  const runs = [];\n' +
      '  let now = 0;\n' +
      '  while (waiting.length > 0 || running.length > 0) {\n' +
      '    let i = 0;\n' +
      '    while (i < waiting.length && running.length < limit) {\n' +
      '      const job = waiting[i];\n' +
      '      if (running.some((r) => r.key === job.key)) {\n' +
      '        i++;\n' +
      '        continue;\n' +
      '      }\n' +
      '      waiting.splice(i, 1);\n' +
      '      running.push({ key: job.key, end: now + job.ms });\n' +
      '      runs.push({ id: job.id, start: now, end: now + job.ms });\n' +
      '    }\n' +
      '    now = Math.min.apply(null, running.map((r) => r.end));\n' +
      '    running = running.filter((r) => r.end > now);\n' +
      '  }\n' +
      '  return { runs, makespan: now };\n' +
      '}\n',
    hint: 'Alternate two phases in a loop: fill the pool from the queue (skipping busy keys), then jump the clock to the earliest end time among the running jobs and remove everything that ends then.',
    explanation: 'A discrete-event simulation never ticks through idle time: it jumps from one interesting moment to the next. Here the only interesting moments are completions, so the loop alternates between filling the pool and advancing the clock to the smallest end time among running jobs. Two constraints interact in the fill step. The global limit caps the pool, and the per-key rule means the queue is not strictly first-in-first-out: a job whose tenant is busy is skipped without losing its place, otherwise one tenant with many jobs would block every worker (head-of-line blocking). Removing every job that ends at the new time before refilling is what makes simultaneous completions behave as one event. The work is O(n) per fill for n queued jobs and O(n^2) overall, which is fine for a scheduler queue; the real async version of this is a semaphore plus a per-key lock.',
    examples: [
      { input: [[{"id":"a1","key":"acme","ms":10},{"id":"a2","key":"acme","ms":10},{"id":"b1","key":"bolt","ms":5},{"id":"c1","key":"cube","ms":5}],2], expected: {"runs":[{"id":"a1","start":0,"end":10},{"id":"b1","start":0,"end":5},{"id":"c1","start":5,"end":10},{"id":"a2","start":10,"end":20}],"makespan":20} },
      { input: [[{"id":"a1","key":"acme","ms":3},{"id":"b1","key":"bolt","ms":2},{"id":"a2","key":"acme","ms":1}],1], expected: {"runs":[{"id":"a1","start":0,"end":3},{"id":"b1","start":3,"end":5},{"id":"a2","start":5,"end":6}],"makespan":6} },
      { input: [[{"id":"x1","key":"x","ms":5},{"id":"y1","key":"y","ms":5},{"id":"x2","key":"x","ms":5},{"id":"y2","key":"y","ms":5},{"id":"z1","key":"z","ms":1}],2], expected: {"runs":[{"id":"x1","start":0,"end":5},{"id":"y1","start":0,"end":5},{"id":"x2","start":5,"end":10},{"id":"y2","start":5,"end":10},{"id":"z1","start":10,"end":11}],"makespan":11} },
    ],
    hiddenTests: [
      { input: [[],3], expected: {"runs":[],"makespan":0} },
      { input: [[{"id":"k1","key":"k","ms":4},{"id":"k2","key":"k","ms":4},{"id":"k3","key":"k","ms":4}],5], expected: {"runs":[{"id":"k1","start":0,"end":4},{"id":"k2","start":4,"end":8},{"id":"k3","start":8,"end":12}],"makespan":12} },
      { input: [[{"id":"long","key":"l","ms":50},{"id":"s1","key":"s","ms":1},{"id":"s2","key":"s","ms":1},{"id":"s3","key":"s","ms":1}],2], expected: {"runs":[{"id":"long","start":0,"end":50},{"id":"s1","start":0,"end":1},{"id":"s2","start":1,"end":2},{"id":"s3","start":2,"end":3}],"makespan":50} },
      { input: [[{"id":"a1","key":"a","ms":6},{"id":"a2","key":"a","ms":2},{"id":"a3","key":"a","ms":2},{"id":"b1","key":"b","ms":3},{"id":"b2","key":"b","ms":3},{"id":"c1","key":"c","ms":4},{"id":"d1","key":"d","ms":1}],3], expected: {"runs":[{"id":"a1","start":0,"end":6},{"id":"b1","start":0,"end":3},{"id":"c1","start":0,"end":4},{"id":"b2","start":3,"end":6},{"id":"d1","start":4,"end":5},{"id":"a2","start":6,"end":8},{"id":"a3","start":8,"end":10}],"makespan":10} },
      { input: [[{"id":"p","key":"p","ms":2},{"id":"q","key":"q","ms":3},{"id":"r","key":"r","ms":4},{"id":"s","key":"s","ms":5}],10], expected: {"runs":[{"id":"p","start":0,"end":2},{"id":"q","start":0,"end":3},{"id":"r","start":0,"end":4},{"id":"s","start":0,"end":5}],"makespan":5} },
    ],
  },
  {
    id: 'node-graceful-shutdown-order',
    number: 98,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Graceful Shutdown Stop Order',
    difficulty: 'Medium',
    topic: 'Scheduling & Jobs',
    statement:
      'When a server process receives a termination signal it has a limited grace period to stop its components cleanly, and the order matters: the HTTP layer must stop before the database pool it uses. Implement `planShutdown(components, graceMs)`.\n' +
      '\n' +
      '- `components` is an array of `{ name, dependsOn, stopMs }`: a unique name, the names of the components it uses (all present in the list, no cycles), and how long its clean stop takes.\n' +
      '- Components are stopped one at a time. A component may be stopped only after every component that depends on it has been stopped (dependents first). When several components are eligible, the alphabetically smallest name goes next (plain string comparison). This fixes one complete stop order.\n' +
      '- Walk that order with a clock starting at 0. If the component\'s stop would finish at or before `graceMs` (`clock + stopMs <= graceMs`), it is `\'stopped\'` at `at = clock + stopMs` and the clock advances.\n' +
      '- The first component that does not fit is `\'killed\'` with `at = graceMs`, and so is every component after it in the order, however short its stop would have been: the grace period is over.\n' +
      '\n' +
      'Return the components in stop order as `{ name, status, at }`.',
    functionName: 'planShutdown',
    functionSignature: 'function planShutdown(components, graceMs)',
    buggyCode:
      'function planShutdown(components, graceMs) {\n' +
      '  // TODO: build the stop order: a component is eligible once everything that depends\n' +
      '  // on it has been stopped; among eligible ones take the alphabetically smallest name.\n' +
      '  // Then walk it with a clock from 0: \'stopped\' at clock + stopMs while that is\n' +
      '  // <= graceMs; from the first one that does not fit, everything is \'killed\' at graceMs.\n' +
      '  // Return [{ name, status, at }, ...] in stop order.\n' +
      '}\n',
    solution:
      'function planShutdown(components, graceMs) {\n' +
      '  const remaining = components.slice();\n' +
      '  const order = [];\n' +
      '  while (remaining.length > 0) {\n' +
      '    const eligible = remaining.filter(\n' +
      '      (c) => !remaining.some((other) => other.dependsOn.includes(c.name)),\n' +
      '    );\n' +
      '    eligible.sort((a, b) => (a.name < b.name ? -1 : 1));\n' +
      '    const next = eligible[0];\n' +
      '    order.push(next);\n' +
      '    remaining.splice(remaining.indexOf(next), 1);\n' +
      '  }\n' +
      '  const plan = [];\n' +
      '  let clock = 0;\n' +
      '  let expired = false;\n' +
      '  for (const c of order) {\n' +
      '    if (!expired && clock + c.stopMs <= graceMs) {\n' +
      '      clock += c.stopMs;\n' +
      '      plan.push({ name: c.name, status: \'stopped\', at: clock });\n' +
      '    } else {\n' +
      '      expired = true;\n' +
      '      plan.push({ name: c.name, status: \'killed\', at: graceMs });\n' +
      '    }\n' +
      '  }\n' +
      '  return plan;\n' +
      '}\n',
    hint: 'Repeatedly pick, among the components not yet stopped, one that no remaining component depends on. Compute the whole order first, then apply the clock in a second pass.',
    explanation: 'Shutdown order is a topological sort of the dependency graph with the edges reversed: a component can go once nothing still running needs it. Picking the smallest eligible name at each step turns the many valid orders into exactly one, which is what makes shutdown logs comparable between runs. Note that this is not the same as computing the startup order and reversing it: both are valid, but the tie-breaks land differently, and the statement asks for the tie-break to be applied in stop order. The grace period is then a simple running clock, with one rule that mirrors real process managers: once the deadline is hit the process is killed, so everything not yet stopped is lost even if it would have been quick. The repeated scan is O(n^2) for n components, plenty for a process with a handful of them.',
    examples: [
      { input: [[{"name":"api","dependsOn":["db","cache"],"stopMs":20},{"name":"worker","dependsOn":["db","queue"],"stopMs":30},{"name":"db","dependsOn":[],"stopMs":10},{"name":"cache","dependsOn":[],"stopMs":5},{"name":"queue","dependsOn":[],"stopMs":5}],100], expected: [{"name":"api","status":"stopped","at":20},{"name":"cache","status":"stopped","at":25},{"name":"worker","status":"stopped","at":55},{"name":"db","status":"stopped","at":65},{"name":"queue","status":"stopped","at":70}] },
      { input: [[{"name":"api","dependsOn":["db","cache"],"stopMs":20},{"name":"worker","dependsOn":["db","queue"],"stopMs":30},{"name":"db","dependsOn":[],"stopMs":10},{"name":"cache","dependsOn":[],"stopMs":5},{"name":"queue","dependsOn":[],"stopMs":5}],60], expected: [{"name":"api","status":"stopped","at":20},{"name":"cache","status":"stopped","at":25},{"name":"worker","status":"stopped","at":55},{"name":"db","status":"killed","at":60},{"name":"queue","status":"killed","at":60}] },
      { input: [[{"name":"api","dependsOn":["db","cache"],"stopMs":20},{"name":"worker","dependsOn":["db","queue"],"stopMs":30},{"name":"db","dependsOn":[],"stopMs":10},{"name":"cache","dependsOn":[],"stopMs":5},{"name":"queue","dependsOn":[],"stopMs":5}],65], expected: [{"name":"api","status":"stopped","at":20},{"name":"cache","status":"stopped","at":25},{"name":"worker","status":"stopped","at":55},{"name":"db","status":"stopped","at":65},{"name":"queue","status":"killed","at":65}] },
    ],
    hiddenTests: [
      { input: [[],50], expected: [] },
      { input: [[{"name":"api","dependsOn":["db","cache"],"stopMs":20},{"name":"worker","dependsOn":["db","queue"],"stopMs":30},{"name":"db","dependsOn":[],"stopMs":10},{"name":"cache","dependsOn":[],"stopMs":5},{"name":"queue","dependsOn":[],"stopMs":5}],0], expected: [{"name":"api","status":"killed","at":0},{"name":"cache","status":"killed","at":0},{"name":"worker","status":"killed","at":0},{"name":"db","status":"killed","at":0},{"name":"queue","status":"killed","at":0}] },
      { input: [[{"name":"zeta","dependsOn":[],"stopMs":1},{"name":"alpha","dependsOn":[],"stopMs":50},{"name":"mid","dependsOn":[],"stopMs":1}],10], expected: [{"name":"alpha","status":"killed","at":10},{"name":"mid","status":"killed","at":10},{"name":"zeta","status":"killed","at":10}] },
      { input: [[{"name":"store","dependsOn":[],"stopMs":4},{"name":"repo","dependsOn":["store"],"stopMs":3},{"name":"service","dependsOn":["repo"],"stopMs":2},{"name":"http","dependsOn":["service"],"stopMs":1}],6], expected: [{"name":"http","status":"stopped","at":1},{"name":"service","status":"stopped","at":3},{"name":"repo","status":"stopped","at":6},{"name":"store","status":"killed","at":6}] },
      { input: [[{"name":"a","dependsOn":["z"],"stopMs":5},{"name":"z","dependsOn":[],"stopMs":5},{"name":"b","dependsOn":[],"stopMs":5},{"name":"y","dependsOn":["b"],"stopMs":5},{"name":"c","dependsOn":["a","y"],"stopMs":5}],25], expected: [{"name":"c","status":"stopped","at":5},{"name":"a","status":"stopped","at":10},{"name":"y","status":"stopped","at":15},{"name":"b","status":"stopped","at":20},{"name":"z","status":"stopped","at":25}] },
    ],
  },
  {
    id: 'node-price-feed-swr-timeline',
    number: 99,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Price Feed Stale-While-Revalidate',
    difficulty: 'Hard',
    topic: 'Caching & State',
    statement:
      'A trading dashboard caches price quotes with a stale-while-revalidate policy: a slightly old quote is served instantly while a fresh one is fetched in the background. Implement `swrTimeline(requests, config)`, replaying requests `{ key, t }` (sorted by `t`) with `config = { ttlMs, staleMs, fetchMs }`. Every fetch takes exactly `fetchMs`. Keys are independent.\n' +
      '\n' +
      'Per key keep: a cached `entry` `{ version, storedAt }` (or none), at most one `pending` fetch `{ version, doneAt }` (or none), and a count of fetches started. The n-th fetch started for a key produces version `n`.\n' +
      '\n' +
      'For a request at time `t`, in this order:\n' +
      '\n' +
      '1. If there is a pending fetch with `doneAt <= t`, it has finished: the entry becomes `{ version: pending.version, storedAt: pending.doneAt }` and nothing is pending.\n' +
      '2. Let `age = t - entry.storedAt`. If there is an entry and `age < ttlMs`, respond `{ status: \'fresh\', version: entry.version, at: t }`.\n' +
      '3. Otherwise, if there is an entry and `age < ttlMs + staleMs`, respond `{ status: \'stale\', version: entry.version, at: t }` and, if nothing is pending, start a background fetch (`doneAt = t + fetchMs`).\n' +
      '4. Otherwise there is nothing usable and the caller must wait. If nothing is pending, start a fetch (`doneAt = t + fetchMs`) and respond with status `\'miss\'`; if a fetch is already pending, join it and respond with status `\'wait\'`. Either way the response carries `version: pending.version` and `at: pending.doneAt`.\n' +
      '\n' +
      'Return `{ responses, fetches }`: one response per request, and an object mapping each key to the number of fetches started for it.',
    functionName: 'swrTimeline',
    functionSignature: 'function swrTimeline(requests, config)',
    buggyCode:
      'function swrTimeline(requests, config) {\n' +
      '  // TODO: per key keep entry { version, storedAt }, pending { version, doneAt }, fetch count.\n' +
      '  // For each request at t:\n' +
      '  // 1. pending.doneAt <= t  -> install it as the entry (storedAt = doneAt)\n' +
      '  // 2. age < ttlMs          -> \'fresh\' at t\n' +
      '  // 3. age < ttlMs+staleMs  -> \'stale\' at t, start a background fetch if none is pending\n' +
      '  // 4. otherwise            -> \'miss\' (starts a fetch) or \'wait\' (joins the pending one),\n' +
      '  //                            with the pending version and at = pending.doneAt\n' +
      '  // Return { responses: [{ status, version, at }], fetches: { key: count } }.\n' +
      '}\n',
    solution:
      'function swrTimeline(requests, config) {\n' +
      '  const keys = new Map();\n' +
      '  const responses = [];\n' +
      '  for (const { key, t } of requests) {\n' +
      '    if (!keys.has(key)) keys.set(key, { entry: null, pending: null, count: 0 });\n' +
      '    const state = keys.get(key);\n' +
      '    if (state.pending && state.pending.doneAt <= t) {\n' +
      '      state.entry = { version: state.pending.version, storedAt: state.pending.doneAt };\n' +
      '      state.pending = null;\n' +
      '    }\n' +
      '    const startFetch = () => {\n' +
      '      state.count++;\n' +
      '      state.pending = { version: state.count, doneAt: t + config.fetchMs };\n' +
      '    };\n' +
      '    const age = state.entry ? t - state.entry.storedAt : null;\n' +
      '    if (state.entry && age < config.ttlMs) {\n' +
      '      responses.push({ status: \'fresh\', version: state.entry.version, at: t });\n' +
      '    } else if (state.entry && age < config.ttlMs + config.staleMs) {\n' +
      '      responses.push({ status: \'stale\', version: state.entry.version, at: t });\n' +
      '      if (!state.pending) startFetch();\n' +
      '    } else {\n' +
      '      const status = state.pending ? \'wait\' : \'miss\';\n' +
      '      if (!state.pending) startFetch();\n' +
      '      responses.push({ status, version: state.pending.version, at: state.pending.doneAt });\n' +
      '    }\n' +
      '  }\n' +
      '  const fetches = {};\n' +
      '  for (const [key, state] of keys) fetches[key] = state.count;\n' +
      '  return { responses, fetches };\n' +
      '}\n',
    hint: 'Do the four numbered steps literally, in order. Step 1 is the one that is easy to forget: a background fetch "finishes" lazily, the next time the key is requested, but its storedAt is the time it really finished.',
    explanation: 'Stale-while-revalidate splits an entry\'s life into three bands: fresh (serve it), stale (serve it and refresh in the background), and expired (wait for a fetch). The simulation needs only two records per key, the stored entry and the fetch in flight, and no timers: a background fetch is installed lazily when the next request notices that its completion time has passed. The freshness clock of the new entry starts when the fetch completed, not when it was noticed, otherwise quiet keys would appear fresh for longer than they are. The single pending slot does double duty as a single-flight guard: a burst of stale requests triggers one refresh, and requests that arrive during a blocking fetch join it rather than starting their own, which is exactly the behaviour that keeps a cache from stampeding its origin. O(1) per request.',
    examples: [
      { input: [[{"key":"btc","t":0},{"key":"btc","t":10},{"key":"btc","t":40},{"key":"btc","t":129},{"key":"btc","t":130},{"key":"btc","t":150},{"key":"btc","t":160}],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[{"status":"miss","version":1,"at":30},{"status":"wait","version":1,"at":30},{"status":"fresh","version":1,"at":40},{"status":"fresh","version":1,"at":129},{"status":"stale","version":1,"at":130},{"status":"stale","version":1,"at":150},{"status":"fresh","version":2,"at":160}],"fetches":{"btc":2}} },
      { input: [[{"key":"eth","t":0},{"key":"eth","t":329},{"key":"eth","t":340},{"key":"eth","t":359}],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[{"status":"miss","version":1,"at":30},{"status":"stale","version":1,"at":329},{"status":"wait","version":2,"at":359},{"status":"fresh","version":2,"at":359}],"fetches":{"eth":2}} },
      { input: [[{"key":"a","t":0},{"key":"b","t":5},{"key":"a","t":400},{"key":"b","t":400},{"key":"a","t":430}],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[{"status":"miss","version":1,"at":30},{"status":"miss","version":1,"at":35},{"status":"miss","version":2,"at":430},{"status":"miss","version":2,"at":430},{"status":"fresh","version":2,"at":430}],"fetches":{"a":2,"b":2}} },
    ],
    hiddenTests: [
      { input: [[],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[],"fetches":{}} },
      { input: [[{"key":"k","t":0},{"key":"k","t":130},{"key":"k","t":200},{"key":"k","t":259},{"key":"k","t":260},{"key":"k","t":261},{"key":"k","t":290}],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[{"status":"miss","version":1,"at":30},{"status":"stale","version":1,"at":130},{"status":"fresh","version":2,"at":200},{"status":"fresh","version":2,"at":259},{"status":"stale","version":2,"at":260},{"status":"stale","version":2,"at":261},{"status":"fresh","version":3,"at":290}],"fetches":{"k":3}} },
      { input: [[{"key":"k","t":7},{"key":"k","t":7},{"key":"k","t":8},{"key":"k","t":9},{"key":"k","t":10},{"key":"k","t":10},{"key":"k","t":11}],{"ttlMs":2,"staleMs":1,"fetchMs":0}], expected: {"responses":[{"status":"miss","version":1,"at":7},{"status":"fresh","version":1,"at":7},{"status":"fresh","version":1,"at":8},{"status":"stale","version":1,"at":9},{"status":"fresh","version":2,"at":10},{"status":"fresh","version":2,"at":10},{"status":"stale","version":2,"at":11}],"fetches":{"k":3}} },
      { input: [[{"key":"k","t":0},{"key":"k","t":60},{"key":"k","t":80},{"key":"k","t":90},{"key":"k","t":99},{"key":"k","t":100},{"key":"k","t":119},{"key":"k","t":120},{"key":"k","t":150}],{"ttlMs":10,"staleMs":20,"fetchMs":50}], expected: {"responses":[{"status":"miss","version":1,"at":50},{"status":"stale","version":1,"at":60},{"status":"wait","version":2,"at":110},{"status":"wait","version":2,"at":110},{"status":"wait","version":2,"at":110},{"status":"wait","version":2,"at":110},{"status":"fresh","version":2,"at":119},{"status":"stale","version":2,"at":120},{"status":"wait","version":3,"at":170}],"fetches":{"k":3}} },
      { input: [[{"key":"x","t":0},{"key":"y","t":0},{"key":"x","t":30},{"key":"x","t":131},{"key":"y","t":131},{"key":"y","t":161},{"key":"x","t":500},{"key":"x","t":529},{"key":"x","t":530}],{"ttlMs":100,"staleMs":200,"fetchMs":30}], expected: {"responses":[{"status":"miss","version":1,"at":30},{"status":"miss","version":1,"at":30},{"status":"fresh","version":1,"at":30},{"status":"stale","version":1,"at":131},{"status":"stale","version":1,"at":131},{"status":"fresh","version":2,"at":161},{"status":"miss","version":3,"at":530},{"status":"wait","version":3,"at":530},{"status":"fresh","version":3,"at":530}],"fetches":{"x":3,"y":2}} },
    ],
  },
  {
    id: 'node-scoreboard-write-behind',
    number: 100,
    language: 'javascript',
    track: 'node',
    kind: 'build',
    title: 'Scoreboard Write-Behind Buffer',
    difficulty: 'Medium',
    topic: 'Caching & State',
    statement:
      'A live game scoreboard receives far more score updates than its database can take, so updates go to an in-memory buffer and are written to the database later in batches (a write-behind cache). Implement `writeBehind(ops, config)` with `config = { flushEveryMs, maxDirty }`, returning the batches that reach the database.\n' +
      '\n' +
      '`ops` is sorted by time and contains `[\'set\', key, value, t]` and `[\'close\', t]`. The buffer holds the dirty keys, each with its latest value, in the order the keys FIRST became dirty since the last flush, and remembers `dirtySince`: the time of the `set` that made the buffer non-empty.\n' +
      '\n' +
      'For every op, in this order:\n' +
      '\n' +
      '1. Timer check: if the buffer is not empty and `t - dirtySince >= flushEveryMs`, flush with `reason: \'timer\'` and `at: dirtySince + flushEveryMs` (the moment the timer would have fired, not `t`).\n' +
      '2. `set`: record the value. A key that is already dirty just has its value replaced and keeps its position. Then, if the buffer holds `maxDirty` distinct keys, flush with `reason: \'size\'` and `at: t`.\n' +
      '3. `close`: if the buffer is not empty, flush with `reason: \'close\'` and `at: t`.\n' +
      '\n' +
      'A flush emits `{ at, reason, writes }` where `writes` is an array of `[key, value]` pairs in buffer order, and then empties the buffer. Return the array of flushes in order (`[]` if nothing was ever flushed).',
    functionName: 'writeBehind',
    functionSignature: 'function writeBehind(ops, config)',
    buggyCode:
      'function writeBehind(ops, config) {\n' +
      '  // TODO: buffer dirty keys (latest value, order of first dirtying) and emit flushes.\n' +
      '  // Before each op: buffer non-empty and t - dirtySince >= flushEveryMs\n' +
      '  //                 -> flush \'timer\' at dirtySince + flushEveryMs\n' +
      '  // [\'set\', key, value, t]: record; if distinct dirty keys == maxDirty -> flush \'size\' at t\n' +
      '  // [\'close\', t]: flush \'close\' at t if anything is dirty\n' +
      '  // Return [{ at, reason, writes: [[key, value], ...] }, ...].\n' +
      '}\n',
    solution:
      'function writeBehind(ops, config) {\n' +
      '  const flushes = [];\n' +
      '  let dirty = new Map();\n' +
      '  let dirtySince = 0;\n' +
      '  const flush = (at, reason) => {\n' +
      '    flushes.push({ at, reason, writes: Array.from(dirty.entries()) });\n' +
      '    dirty = new Map();\n' +
      '  };\n' +
      '  for (const op of ops) {\n' +
      '    const t = op[op.length - 1];\n' +
      '    if (dirty.size > 0 && t - dirtySince >= config.flushEveryMs) {\n' +
      '      flush(dirtySince + config.flushEveryMs, \'timer\');\n' +
      '    }\n' +
      '    if (op[0] === \'set\') {\n' +
      '      if (dirty.size === 0) dirtySince = t;\n' +
      '      dirty.set(op[1], op[2]);\n' +
      '      if (dirty.size >= config.maxDirty) flush(t, \'size\');\n' +
      '    } else if (dirty.size > 0) {\n' +
      '      flush(t, \'close\');\n' +
      '    }\n' +
      '  }\n' +
      '  return flushes;\n' +
      '}\n',
    hint: 'A Map already keeps keys in first-insertion order and lets you overwrite a value without moving the key. Run the timer check at the top of every op, before looking at what the op is.',
    explanation: 'Write-behind trades durability for throughput: many updates to the same key collapse into one database write, and writes travel in batches. The buffer is a map of dirty keys to latest values, and three things empty it: a time limit measured from when the buffer first became dirty (which bounds how much data a crash can lose), a size limit (which bounds memory and batch size), and shutdown. Because there is no real timer in a replay, the time limit is checked lazily at the start of each op, and the flush is stamped with the time the timer would have fired rather than the time it was noticed; the op that revealed it then starts a new buffer. Rewriting a dirty key must not count as a new key or reorder the batch. Every op is O(1) apart from emitting a batch, which is linear in its size.',
    examples: [
      { input: [[["set","ana",10,0],["set","bo",7,10],["set","ana",12,20],["close",50]],{"flushEveryMs":100,"maxDirty":3}], expected: [{"at":50,"reason":"close","writes":[["ana",12],["bo",7]]}] },
      { input: [[["set","a",1,0],["set","b",2,1],["set","c",3,2],["set","d",4,3],["close",4]],{"flushEveryMs":100,"maxDirty":3}], expected: [{"at":2,"reason":"size","writes":[["a",1],["b",2],["c",3]]},{"at":4,"reason":"close","writes":[["d",4]]}] },
      { input: [[["set","a",1,0],["set","b",2,150],["set","b",5,249],["set","c",9,250],["close",400]],{"flushEveryMs":100,"maxDirty":3}], expected: [{"at":100,"reason":"timer","writes":[["a",1]]},{"at":250,"reason":"timer","writes":[["b",5]]},{"at":350,"reason":"timer","writes":[["c",9]]}] },
    ],
    hiddenTests: [
      { input: [[],{"flushEveryMs":100,"maxDirty":3}], expected: [] },
      { input: [[["close",5]],{"flushEveryMs":100,"maxDirty":3}], expected: [] },
      { input: [[["set","a",1,0],["set","a",2,1],["set","b",3,2],["close",3]],{"flushEveryMs":100,"maxDirty":1}], expected: [{"at":0,"reason":"size","writes":[["a",1]]},{"at":1,"reason":"size","writes":[["a",2]]},{"at":2,"reason":"size","writes":[["b",3]]}] },
      { input: [[["set","a",1,0],["set","a",2,10],["set","a",3,20],["set","b",1,30],["set","a",4,40],["set","c",1,99],["set","d",1,100],["close",100]],{"flushEveryMs":100,"maxDirty":3}], expected: [{"at":99,"reason":"size","writes":[["a",4],["b",1],["c",1]]},{"at":100,"reason":"close","writes":[["d",1]]}] },
      { input: [[["set","x",1,10],["set","y",1,60],["set","x",2,110],["set","z",1,111],["set","y",2,300],["close",399],["set","q",1,400],["close",500]],{"flushEveryMs":100,"maxDirty":5}], expected: [{"at":110,"reason":"timer","writes":[["x",1],["y",1]]},{"at":210,"reason":"timer","writes":[["x",2],["z",1]]},{"at":399,"reason":"close","writes":[["y",2]]},{"at":500,"reason":"timer","writes":[["q",1]]}] },
    ],
  },
];
