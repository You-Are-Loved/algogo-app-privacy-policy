import type { ReactProblem } from '../reactProblems';

// React build problems 76-100: effects, async data, custom hooks, reducers, context,
// refs and focus, render performance, keyboard-accessible widgets.
export const problems: ReactProblem[] = [
  {
    id: 'react-network-status-badge',
    number: 76,
    title: 'Online and Offline Status Badge',
    difficulty: 'Easy',
    topic: 'Effects & Lifecycle',
    statement: `Build \`NetworkBadge({ initialOnline = true, onChange })\` that follows the browser's connectivity events.

- Render \`<p data-testid="status">\` whose text is \`Online\` or \`Offline\`. The first render uses \`initialOnline\`.
- After mounting, listen for the \`online\` and \`offline\` events on \`window\`. An \`offline\` event switches the badge to \`Offline\`, an \`online\` event switches it to \`Online\`.
- While offline, also render \`<p role="alert">You are offline. Changes will sync later.</p>\`. There is no element with \`role="alert"\` while online.
- Each time the status really changes, call \`onChange(isOnline)\` (a boolean) if the prop was given. It is not called on mount, and a repeated event for the status you are already in (for example \`offline\` while already offline) changes nothing and does not call \`onChange\`.
- Remove both listeners when the component unmounts. Events fired after the unmount must not call \`onChange\`.`,
    componentName: 'NetworkBadge',
    starter: `import React, { useState, useEffect } from 'react';

export default function NetworkBadge({ initialOnline = true, onChange }) {
  const [online, setOnline] = useState(initialOnline);
  // TODO: listen for the window "online" / "offline" events and clean up
  return (
    <div>
      <p data-testid="status">{online ? 'Online' : 'Offline'}</p>
    </div>
  );
}
`,
    previewProps: {"initialOnline": true},
    tests: [
      {
        name: 'starts from initialOnline, with an alert only while offline',
        code: `const a = render({ initialOnline: true });
expect(a.getByTestId('status').textContent).toBe('Online');
expect(a.queryByRole('alert')).toBeNull();
const b = render({ initialOnline: false });
expect(b.getByTestId('status').textContent).toBe('Offline');
expect(b.getByRole('alert')).toHaveTextContent('You are offline. Changes will sync later.');`,
      },
      {
        name: 'window offline and online events switch the badge',
        code: `const { getByTestId, queryByRole } = render({ initialOnline: true });
act(() => { window.dispatchEvent(new Event('offline')); });
expect(getByTestId('status').textContent).toBe('Offline');
expect(queryByRole('alert')).toBeTruthy();
act(() => { window.dispatchEvent(new Event('online')); });
expect(getByTestId('status').textContent).toBe('Online');
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'onChange receives false, then true, and nothing on mount',
        code: `const calls = [];
render({ initialOnline: true, onChange: (v) => calls.push(v) });
expect(calls).toEqual([]);
act(() => { window.dispatchEvent(new Event('offline')); });
act(() => { window.dispatchEvent(new Event('online')); });
expect(calls).toEqual([false, true]);`,
      },
      {
        name: 'a repeated event for the current status is ignored',
        code: `const calls = [];
const { getByTestId } = render({ initialOnline: true, onChange: (v) => calls.push(v) });
act(() => { window.dispatchEvent(new Event('online')); });
expect(calls).toEqual([]);
act(() => { window.dispatchEvent(new Event('offline')); });
act(() => { window.dispatchEvent(new Event('offline')); });
expect(calls).toEqual([false]);
expect(getByTestId('status').textContent).toBe('Offline');`,
      },
      {
        name: 'listeners are removed on unmount',
        code: `const calls = [];
const { unmount } = render({ initialOnline: true, onChange: (v) => calls.push(v) });
unmount();
act(() => { window.dispatchEvent(new Event('offline')); });
act(() => { window.dispatchEvent(new Event('online')); });
expect(calls).toEqual([]);`,
      },
    ],
    hint: `Register both listeners in one \`useEffect\` with an empty dependency array and return a cleanup that removes the very same function references. To know whether an event is a real change, compare against the current status kept in a ref (the listener was created on mount and cannot see newer state).`,
    explanation: `The \`window\` object lives outside React, so talking to it is a side effect: subscribe in \`useEffect\`, unsubscribe in the cleanup. \`removeEventListener\` only works with the same function reference that was added, which is why the handlers are declared inside the effect and reused in the cleanup.

The subtle part is "only real changes". The handlers are created once, so a plain \`online\` variable inside them is frozen at its mount value. The reference keeps the live status in a ref, compares against it, and only then updates state and calls \`onChange\`. The callback itself is also read through a ref so a parent passing a new function on every render does not force a re-subscribe.

Forgetting the cleanup leaves a listener behind for every mount. It keeps calling \`onChange\` for a component that no longer exists, which is exactly what the last test catches. Cost: two listeners for the lifetime of the component, O(1) work per event.`,
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function NetworkBadge({ initialOnline = true, onChange }) {
  const [online, setOnline] = useState(initialOnline);
  const onlineRef = useRef(initialOnline);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    function update(next) {
      if (onlineRef.current === next) return;
      onlineRef.current = next;
      setOnline(next);
      if (onChangeRef.current) onChangeRef.current(next);
    }
    const goOnline = () => update(true);
    const goOffline = () => update(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div>
      <p data-testid="status">{online ? 'Online' : 'Offline'}</p>
      {!online && <p role="alert">You are offline. Changes will sync later.</p>}
    </div>
  );
}
`,
  },
  {
    id: 'react-store-cart-badge',
    number: 77,
    title: 'Cart Badge Bound to an External Store',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement: `Build \`CartBadge({ store })\` that mirrors a tiny external store (a plain object that lives outside React).

The store has two methods:
- \`store.getState()\` returns the current state \`{ items: string[] }\`. Every change produces a NEW state object.
- \`store.subscribe(listener)\` registers \`listener\` and returns an \`unsubscribe\` function. After every change the store calls \`listener()\` with no arguments; the listener has to read \`getState()\` again.

Render:
- \`<span data-testid="count">\` containing the number of items.
- \`<p>Cart is empty</p>\` when there are no items, otherwise \`<p>Last added: <name></p>\` with the last item of the array (for example \`Last added: Ink\`).

Rules:
- The first render already shows the store's current state. Do not wait for a notification.
- Subscribe from an effect, exactly once per store: re-renders and notifications must not subscribe again.
- When the component unmounts, call the \`unsubscribe\` function.
- When the \`store\` prop is replaced by a different store, unsubscribe from the old one, subscribe to the new one and show the new store's state. Later changes to the old store must not affect the badge.`,
    componentName: 'CartBadge',
    starter: `import React, { useState, useEffect } from 'react';

export default function CartBadge({ store }) {
  // TODO: keep this in sync with the store (subscribe + cleanup)
  const items = [];
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      <p>Cart is empty</p>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: `let state = { items: ['Notebook'] };
const listeners = new Set();
const store = {
  getState: () => state,
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
};
let n = 0;
const timer = setInterval(() => {
  n += 1;
  state = { items: n % 4 === 0 ? [] : state.items.concat('Item ' + n) };
  listeners.forEach((l) => l());
  if (n >= 12) clearInterval(timer);
}, 1500);
return { store };`,
    tests: [
      {
        name: 'shows the current store state on the first render',
        code: `function makeStore(items) { let state = { items }; const ls = new Set(); return { getState: () => state, subscribe: (l) => { ls.add(l); return () => { ls.delete(l); }; }, add: (x) => { state = { items: state.items.concat(x) }; ls.forEach((l) => l()); }, size: () => ls.size }; }
const a = render({ store: makeStore(['Pen', 'Ink']) });
expect(a.getByTestId('count').textContent).toBe('2');
expect(a.getByText('Last added: Ink')).toBeTruthy();
expect(a.queryByText('Cart is empty')).toBeNull();
const b = render({ store: makeStore([]) });
expect(b.getByTestId('count').textContent).toBe('0');
expect(b.getByText('Cart is empty')).toBeTruthy();`,
      },
      {
        name: 'updates when the store notifies its listeners',
        code: `function makeStore(items) { let state = { items }; const ls = new Set(); return { getState: () => state, subscribe: (l) => { ls.add(l); return () => { ls.delete(l); }; }, add: (x) => { state = { items: state.items.concat(x) }; ls.forEach((l) => l()); }, size: () => ls.size }; }
const store = makeStore([]);
const { getByTestId, getByText, queryByText } = render({ store });
act(() => { store.add('Cup'); });
expect(getByTestId('count').textContent).toBe('1');
expect(getByText('Last added: Cup')).toBeTruthy();
expect(queryByText('Cart is empty')).toBeNull();
act(() => { store.add('Lamp'); });
expect(getByTestId('count').textContent).toBe('2');
expect(getByText('Last added: Lamp')).toBeTruthy();`,
      },
      {
        name: 'subscribes once, even across re-renders and updates',
        code: `let subscribeCalls = 0;
function makeStore(items) { let state = { items }; const ls = new Set(); return { getState: () => state, subscribe: (l) => { subscribeCalls += 1; ls.add(l); return () => { ls.delete(l); }; }, add: (x) => { state = { items: state.items.concat(x) }; ls.forEach((l) => l()); }, size: () => ls.size }; }
const store = makeStore(['Pen']);
const { rerender, getByTestId } = render({ store });
act(() => { store.add('Cup'); });
rerender({ store });
act(() => { store.add('Mug'); });
rerender({ store });
expect(getByTestId('count').textContent).toBe('3');
expect(subscribeCalls).toBe(1);
expect(store.size()).toBe(1);`,
      },
      {
        name: 'unsubscribes when it unmounts',
        code: `function makeStore(items) { let state = { items }; const ls = new Set(); return { getState: () => state, subscribe: (l) => { ls.add(l); return () => { ls.delete(l); }; }, add: (x) => { state = { items: state.items.concat(x) }; ls.forEach((l) => l()); }, size: () => ls.size }; }
const store = makeStore(['Pen']);
const { unmount } = render({ store });
expect(store.size()).toBe(1);
unmount();
expect(store.size()).toBe(0);`,
      },
      {
        name: 'switching to another store re-subscribes and shows its state',
        code: `function makeStore(items) { let state = { items }; const ls = new Set(); return { getState: () => state, subscribe: (l) => { ls.add(l); return () => { ls.delete(l); }; }, add: (x) => { state = { items: state.items.concat(x) }; ls.forEach((l) => l()); }, size: () => ls.size }; }
const first = makeStore(['Pen']);
const second = makeStore(['Desk', 'Chair', 'Rug']);
const { rerender, getByTestId, getByText } = render({ store: first });
rerender({ store: second });
expect(first.size()).toBe(0);
expect(second.size()).toBe(1);
expect(getByTestId('count').textContent).toBe('3');
expect(getByText('Last added: Rug')).toBeTruthy();
act(() => { first.add('Stale'); });
expect(getByTestId('count').textContent).toBe('3');
act(() => { second.add('Vase'); });
expect(getByTestId('count').textContent).toBe('4');
expect(getByText('Last added: Vase')).toBeTruthy();`,
      },
    ],
    hint: `The effect should depend on \`store\` and return the function that \`store.subscribe(...)\` gives you. Inside the listener, copy \`store.getState()\` into React state. Remember that a different \`store\` prop means the state you are holding belongs to the old store.`,
    explanation: `An external store is a subscription with a snapshot. React needs two things from you: read the snapshot (\`getState()\`) for rendering, and be told when to render again (\`subscribe\`).

The reference keeps the snapshot in state, initialised lazily from \`store.getState()\` so the first paint is already correct. One effect keyed on \`[store]\` first re-reads the snapshot (that covers a swapped store, and any change that slipped in between render and subscribe) and then subscribes with a listener that copies the new snapshot into state. Returning the store's \`unsubscribe\` as the cleanup handles both unmount and a store swap, because React always runs the previous cleanup before running the effect again.

Common mistakes: an empty dependency array (the badge stays glued to the first store), no cleanup (listeners pile up and fire for dead components), or subscribing during render (a new subscription on every render). Because the store creates a new state object on each change, \`setState\` with the new object always triggers a render; a store that mutated in place would need a version counter instead. React also ships \`useSyncExternalStore\`, which packages exactly this pattern.`,
    solution: `import React, { useState, useEffect } from 'react';

export default function CartBadge({ store }) {
  const [snapshot, setSnapshot] = useState(() => store.getState());

  useEffect(() => {
    setSnapshot(store.getState());
    const unsubscribe = store.subscribe(() => {
      setSnapshot(store.getState());
    });
    return unsubscribe;
  }, [store]);

  const items = snapshot.items;
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      {items.length === 0 ? <p>Cart is empty</p> : <p>{'Last added: ' + items[items.length - 1]}</p>}
    </div>
  );
}
`,
  },
  {
    id: 'react-global-keyboard-shortcuts',
    number: 78,
    title: 'Global Keyboard Shortcuts',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement: `Build \`ShortcutList({ items, onSelect })\`, a list that is driven by page-wide keyboard shortcuts. \`items\` is a non-empty array of unique strings.

Render:
- A \`<ul>\` with one \`<li>\` per item (the item text). The selected item's \`<li>\` has \`aria-current="true"\`; the other \`<li>\` elements have no \`aria-current\` attribute. The first item is selected initially.
- A text input with \`aria-label="Notes"\` that the user can type in freely.
- A help panel \`<div role="note">Shortcuts: j = next, k = previous, ? = help</div>\` that is hidden at first.

Listen for \`keydown\` on \`document\`:
- \`j\` selects the next item and stops at the last one (no wrap-around).
- \`k\` selects the previous item and stops at the first one.
- \`?\` shows the help panel, and hides it again on the next press.
- If the event's target is an \`<input>\` or a \`<textarea>\`, the user is typing: ignore the key completely.

Call \`onSelect(item)\` (if given) each time the selection moves to a different item. It is not called on mount, and not when \`j\` / \`k\` is pressed at the end / start of the list.

Remove the listener when the component unmounts.`,
    componentName: 'ShortcutList',
    starter: `import React, { useState, useEffect } from 'react';

export default function ShortcutList({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  // TODO: document-level keydown shortcuts (j, k, ?) with cleanup
  return (
    <div>
      <ul>
        {items.map((item, i) => (
          <li key={item} aria-current={i === index ? 'true' : undefined}>{item}</li>
        ))}
      </ul>
      <input aria-label="Notes" />
    </div>
  );
}
`,
    previewProps: {"items": ["Inbox", "Drafts", "Sent", "Archive"]},
    tests: [
      {
        name: 'the first item is selected and the help panel is hidden',
        code: `const { container, getAllByRole, queryByRole } = render({ items: ['Inbox', 'Drafts', 'Sent'] });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Inbox', 'Drafts', 'Sent']);
const current = container.querySelectorAll('[aria-current]');
expect(current).toHaveLength(1);
expect(current[0].textContent).toBe('Inbox');
expect(current[0].getAttribute('aria-current')).toBe('true');
expect(queryByRole('note')).toBeNull();`,
      },
      {
        name: 'j moves down repeatedly and k moves back up',
        code: `const { container } = render({ items: ['Inbox', 'Drafts', 'Sent', 'Archive'] });
const selected = () => Array.from(container.querySelectorAll('li[aria-current="true"]')).map((li) => li.textContent);
fireEvent.keyDown(document.body, 'j');
expect(selected()).toEqual(['Drafts']);
fireEvent.keyDown(document.body, 'j');
expect(selected()).toEqual(['Sent']);
fireEvent.keyDown(document.body, 'j');
expect(selected()).toEqual(['Archive']);
fireEvent.keyDown(document.body, 'k');
fireEvent.keyDown(document.body, 'k');
expect(selected()).toEqual(['Drafts']);`,
      },
      {
        name: 'stops at both ends and reports only real moves to onSelect',
        code: `const calls = [];
const { container } = render({ items: ['Inbox', 'Drafts'], onSelect: (item) => calls.push(item) });
const selected = () => Array.from(container.querySelectorAll('li[aria-current="true"]')).map((li) => li.textContent);
expect(calls).toEqual([]);
fireEvent.keyDown(document.body, 'k');
expect(selected()).toEqual(['Inbox']);
fireEvent.keyDown(document.body, 'j');
fireEvent.keyDown(document.body, 'j');
fireEvent.keyDown(document.body, 'j');
expect(selected()).toEqual(['Drafts']);
fireEvent.keyDown(document.body, 'k');
expect(calls).toEqual(['Drafts', 'Inbox']);`,
      },
      {
        name: '? toggles the help panel',
        code: `const { queryByRole, getByRole } = render({ items: ['Inbox', 'Drafts'] });
fireEvent.keyDown(document.body, '?');
expect(getByRole('note').textContent).toBe('Shortcuts: j = next, k = previous, ? = help');
fireEvent.keyDown(document.body, '?');
expect(queryByRole('note')).toBeNull();
fireEvent.keyDown(document.body, '?');
expect(getByRole('note')).toBeTruthy();`,
      },
      {
        name: 'keys typed into the Notes input are ignored',
        code: `const calls = [];
const { container, getByLabelText, queryByRole } = render({ items: ['Inbox', 'Drafts', 'Sent'], onSelect: (item) => calls.push(item) });
const notes = getByLabelText('Notes');
fireEvent.keyDown(notes, 'j');
fireEvent.keyDown(notes, '?');
expect(container.querySelector('li[aria-current="true"]').textContent).toBe('Inbox');
expect(queryByRole('note')).toBeNull();
expect(calls).toEqual([]);
fireEvent.keyDown(document.body, 'j');
expect(container.querySelector('li[aria-current="true"]').textContent).toBe('Drafts');`,
      },
      {
        name: 'the document listener is removed on unmount',
        code: `const calls = [];
const { unmount } = render({ items: ['Inbox', 'Drafts', 'Sent'], onSelect: (item) => calls.push(item) });
fireEvent.keyDown(document.body, 'j');
expect(calls).toEqual(['Drafts']);
unmount();
fireEvent.keyDown(document.body, 'j');
fireEvent.keyDown(document.body, 'k');
expect(calls).toEqual(['Drafts']);`,
      },
    ],
    hint: `A listener added once in \`useEffect(..., [])\` only ever sees the \`index\` from the first render. Either keep the live index in a ref that the listener reads, or list what the listener uses in the dependency array so it is re-attached with fresh values. Check \`event.target.tagName\` before doing anything.`,
    explanation: `Page-wide shortcuts cannot be \`onKeyDown\` props, because the key may be pressed while nothing inside your component has focus. So the listener goes on \`document\`, from an effect, with a cleanup that removes it.

The classic bug is the stale closure: an effect with \`[]\` captures the handler from the first render, where \`index\` is 0, so \`setIndex(index + 1)\` can only ever produce 1. Functional updates fix the state part, but here the handler also needs the current index to decide whether a move really happened before calling \`onSelect\`. The reference stores the index in a ref next to the state and lets the single listener read \`indexRef.current\`, so it stays attached for the whole life of the component. Re-attaching the listener whenever \`index\` changes is an equally valid fix.

The typing guard reads \`event.target.tagName\`: keydown events bubble from the focused element up to \`document\`, so the target tells you where the user was typing. Without it, writing the letter j in a notes field would move the selection. Each key press does O(1) work.`,
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function ShortcutList({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const live = useRef({ index: 0, items, onSelect });
  live.current.items = items;
  live.current.onSelect = onSelect;

  useEffect(() => {
    function move(delta) {
      const state = live.current;
      const next = Math.max(0, Math.min(state.items.length - 1, state.index + delta));
      if (next === state.index) return;
      state.index = next;
      setIndex(next);
      if (state.onSelect) state.onSelect(state.items[next]);
    }
    function onKeyDown(event) {
      const tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'j') move(1);
      else if (event.key === 'k') move(-1);
      else if (event.key === '?') setShowHelp((shown) => !shown);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div>
      <ul>
        {items.map((item, i) => (
          <li key={item} aria-current={i === index ? 'true' : undefined}>{item}</li>
        ))}
      </ul>
      <input aria-label="Notes" />
      {showHelp && <div role="note">Shortcuts: j = next, k = previous, ? = help</div>}
    </div>
  );
}
`,
  },
  {
    id: 'react-previous-price-trend',
    number: 79,
    title: 'Price Trend from the Previous Value',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`PriceTrend({ price })\` (\`price\` is a number) on top of a custom hook \`usePreviousDistinct(value)\`.

\`usePreviousDistinct(value)\` returns the value that \`value\` had **before its most recent change**, or \`undefined\` if it has never changed since the component mounted. Re-rendering with the same value does not count as a change.

Render exactly these three paragraphs:
- \`<p data-testid="now">Now: <price></p>\`
- \`<p data-testid="before">Before: <previous></p>\`, or \`Before: none\` while there is no previous price.
- \`<p data-testid="trend">\` reading \`Trend: up\` when the price is higher than the previous one, \`Trend: down\` when it is lower, and \`Trend: flat\` while there is no previous price.

Example: the parent renders prices 10, 12, 12, 9 in that order. The component shows \`Before: none\` / \`Trend: flat\`, then \`Before: 10\` / \`Trend: up\`, then (same price again, nothing changes) still \`Before: 10\` / \`Trend: up\`, then \`Before: 12\` / \`Trend: down\`.

A price of \`0\` is a real price: going from 0 to 5 shows \`Before: 0\`.`,
    componentName: 'PriceTrend',
    starter: `import React, { useState, useRef, useEffect } from 'react';

function usePreviousDistinct(value) {
  // TODO: return the value from before the most recent change
  return undefined;
}

export default function PriceTrend({ price }) {
  const previous = usePreviousDistinct(price);
  return (
    <div>
      <p data-testid="now">Now: {price}</p>
      <p data-testid="before">Before: none</p>
      <p data-testid="trend">Trend: flat</p>
    </div>
  );
}
`,
    previewProps: {"price": 42},
    tests: [
      {
        name: 'the first render has no previous price',
        code: `const { getByTestId } = render({ price: 10 });
expect(getByTestId('now').textContent).toBe('Now: 10');
expect(getByTestId('before').textContent).toBe('Before: none');
expect(getByTestId('trend').textContent).toBe('Trend: flat');`,
      },
      {
        name: 'a higher price shows the old one and Trend: up (0 counts as a price)',
        code: `const { getByTestId, rerender } = render({ price: 0 });
rerender({ price: 5 });
expect(getByTestId('now').textContent).toBe('Now: 5');
expect(getByTestId('before').textContent).toBe('Before: 0');
expect(getByTestId('trend').textContent).toBe('Trend: up');`,
      },
      {
        name: 'a lower price shows Trend: down',
        code: `const { getByTestId, rerender } = render({ price: 10 });
rerender({ price: 12 });
rerender({ price: 9 });
expect(getByTestId('now').textContent).toBe('Now: 9');
expect(getByTestId('before').textContent).toBe('Before: 12');
expect(getByTestId('trend').textContent).toBe('Trend: down');`,
      },
      {
        name: 're-rendering with the same price keeps Before and Trend',
        code: `const { getByTestId, rerender } = render({ price: 10 });
rerender({ price: 12 });
rerender({ price: 12 });
rerender({ price: 12 });
expect(getByTestId('now').textContent).toBe('Now: 12');
expect(getByTestId('before').textContent).toBe('Before: 10');
expect(getByTestId('trend').textContent).toBe('Trend: up');
rerender({ price: 10 });
rerender({ price: 10 });
expect(getByTestId('before').textContent).toBe('Before: 12');
expect(getByTestId('trend').textContent).toBe('Trend: down');`,
      },
      {
        name: 're-rendering the first price again still shows no previous price',
        code: `const { getByTestId, rerender } = render({ price: 7 });
rerender({ price: 7 });
expect(getByTestId('before').textContent).toBe('Before: none');
expect(getByTestId('trend').textContent).toBe('Trend: flat');`,
      },
    ],
    hint: `The well-known \`usePrevious\` (write the value into a ref inside an effect) returns the value from the previous RENDER, so an unrelated re-render makes "previous" equal to "current". Remember two things instead, the current value and the one before it, and only shift them when the incoming value differs.`,
    explanation: `"Previous value" has two meanings. The textbook \`usePrevious\` stores the value in a ref after every render, so it answers "what was it on the last render?". As soon as the parent re-renders for an unrelated reason, that answer is the current value and the trend collapses to flat. What the UI needs is "what was it before it last changed?".

The reference keeps a pair in state, \`current\` and \`previous\`, and compares the incoming value with \`current\` during render. When they differ it shifts the pair (\`previous\` takes the old \`current\`) by calling the setters right there in render. React allows a component to update its own state during render for exactly this derive-from-props case: it discards the output and immediately renders again with the new state, before touching the DOM. The hook returns the old \`current\` in that aborted pass so the value is right either way.

Because nothing is written when the value is unchanged, same-price renders leave the pair alone. The checks use \`=== undefined\`, not truthiness, so a price of 0 is still a real previous value. A ref holding the same pair, updated during render when the value differs, works too. Cost is O(1) per render.`,
    solution: `import React, { useState } from 'react';

function usePreviousDistinct(value) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(undefined);
  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
    return current;
  }
  return previous;
}

export default function PriceTrend({ price }) {
  const previous = usePreviousDistinct(price);
  const hasPrevious = previous !== undefined;
  let trend = 'flat';
  if (hasPrevious && price > previous) trend = 'up';
  if (hasPrevious && price < previous) trend = 'down';
  return (
    <div>
      <p data-testid="now">{'Now: ' + price}</p>
      <p data-testid="before">{'Before: ' + (hasPrevious ? previous : 'none')}</p>
      <p data-testid="trend">{'Trend: ' + trend}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-media-query-layout',
    number: 80,
    title: 'Responsive Layout from a Media Query',
    difficulty: 'Easy',
    topic: 'Effects & Lifecycle',
    statement: `Build \`ResponsiveNav({ matchMedia })\` that picks a layout from a media query. \`matchMedia\` is injected so it can be faked; it works like \`window.matchMedia\`:

\`matchMedia(query)\` returns an object with
- \`matches\`: a boolean, whether the query matches right now,
- \`addEventListener('change', listener)\`: \`listener(event)\` is called whenever the result flips, and \`event.matches\` is the new boolean,
- \`removeEventListener('change', listener)\`.

Requirements:
- Use the query string \`(max-width: 600px)\`, exactly like that.
- Render \`<p data-testid="layout">Mobile layout</p>\` when the query matches, otherwise \`<p data-testid="layout">Desktop layout</p>\`. The first render already reflects \`matches\`.
- Add a \`change\` listener after mounting and update the text whenever the result flips.
- Remove that same listener when the component unmounts.`,
    componentName: 'ResponsiveNav',
    starter: `import React, { useState, useEffect } from 'react';

export default function ResponsiveNav({ matchMedia }) {
  // TODO: read the media query, listen for changes, clean up
  return <p data-testid="layout">Desktop layout</p>;
}
`,
    previewProps: {},
    previewSetup: `const real = typeof window.matchMedia === 'function';
return {
  matchMedia: (query) => real
    ? window.matchMedia(query)
    : { matches: false, addEventListener: () => {}, removeEventListener: () => {} },
};`,
    tests: [
      {
        name: 'the first render follows the current match',
        code: `function fakeMedia(initial) { const ls = new Set(); const queries = []; const mql = { matches: initial, addEventListener: (type, l) => { if (type === 'change') ls.add(l); }, removeEventListener: (type, l) => { if (type === 'change') ls.delete(l); } }; return { matchMedia: (q) => { queries.push(q); return mql; }, set: (m) => { mql.matches = m; Array.from(ls).forEach((l) => l({ matches: m })); }, count: () => ls.size, queries }; }
const small = fakeMedia(true);
const a = render({ matchMedia: small.matchMedia });
expect(a.getByTestId('layout').textContent).toBe('Mobile layout');
const wide = fakeMedia(false);
const b = render({ matchMedia: wide.matchMedia });
expect(b.getByTestId('layout').textContent).toBe('Desktop layout');`,
      },
      {
        name: 'asks for the (max-width: 600px) query',
        code: `function fakeMedia(initial) { const ls = new Set(); const queries = []; const mql = { matches: initial, addEventListener: (type, l) => { if (type === 'change') ls.add(l); }, removeEventListener: (type, l) => { if (type === 'change') ls.delete(l); } }; return { matchMedia: (q) => { queries.push(q); return mql; }, set: (m) => { mql.matches = m; Array.from(ls).forEach((l) => l({ matches: m })); }, count: () => ls.size, queries }; }
const media = fakeMedia(false);
render({ matchMedia: media.matchMedia });
expect(media.queries.length).toBeGreaterThan(0);
expect(media.queries.every((q) => q === '(max-width: 600px)')).toBe(true);`,
      },
      {
        name: 'switches layout when the media query result changes',
        code: `function fakeMedia(initial) { const ls = new Set(); const queries = []; const mql = { matches: initial, addEventListener: (type, l) => { if (type === 'change') ls.add(l); }, removeEventListener: (type, l) => { if (type === 'change') ls.delete(l); } }; return { matchMedia: (q) => { queries.push(q); return mql; }, set: (m) => { mql.matches = m; Array.from(ls).forEach((l) => l({ matches: m })); }, count: () => ls.size, queries }; }
const media = fakeMedia(false);
const { getByTestId } = render({ matchMedia: media.matchMedia });
expect(media.count()).toBe(1);
act(() => { media.set(true); });
expect(getByTestId('layout').textContent).toBe('Mobile layout');
act(() => { media.set(false); });
expect(getByTestId('layout').textContent).toBe('Desktop layout');
act(() => { media.set(true); });
expect(getByTestId('layout').textContent).toBe('Mobile layout');`,
      },
      {
        name: 'removes its change listener on unmount',
        code: `function fakeMedia(initial) { const ls = new Set(); const queries = []; const mql = { matches: initial, addEventListener: (type, l) => { if (type === 'change') ls.add(l); }, removeEventListener: (type, l) => { if (type === 'change') ls.delete(l); } }; return { matchMedia: (q) => { queries.push(q); return mql; }, set: (m) => { mql.matches = m; Array.from(ls).forEach((l) => l({ matches: m })); }, count: () => ls.size, queries }; }
const media = fakeMedia(true);
const { unmount } = render({ matchMedia: media.matchMedia });
expect(media.count()).toBe(1);
unmount();
expect(media.count()).toBe(0);`,
      },
    ],
    hint: `Initialise state from \`matchMedia(QUERY).matches\` so the first render is right, then in an effect call \`addEventListener('change', handler)\` on the same kind of object and return a cleanup that calls \`removeEventListener\` with the same \`handler\`.`,
    explanation: `A media query is another external source: it has a current value (\`matches\`) and it notifies you when that value flips. The component reads the value once for its initial state, using a lazy initialiser so \`matchMedia\` is not called again on every render, and subscribes in an effect.

Inside the effect the handler copies \`event.matches\` into state. The cleanup must pass the same function reference to \`removeEventListener\`, which is why the handler is a named constant inside the effect and not an inline arrow in both calls. Without the cleanup every mount leaks a listener that keeps a dead component alive.

Rendering is then a plain conditional on one boolean. Wrapping the two steps in a reusable \`useMediaQuery(matchMedia, query)\` hook, as the reference does, lets any component ask the same question. Cost: one listener per mounted component, O(1) per change.`,
    solution: `import React, { useState, useEffect } from 'react';

const QUERY = '(max-width: 600px)';

function useMediaQuery(matchMedia, query) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);

  useEffect(() => {
    const list = matchMedia(query);
    setMatches(list.matches);
    const onChange = (event) => setMatches(event.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [matchMedia, query]);

  return matches;
}

export default function ResponsiveNav({ matchMedia }) {
  const isMobile = useMediaQuery(matchMedia, QUERY);
  return <p data-testid="layout">{isMobile ? 'Mobile layout' : 'Desktop layout'}</p>;
}
`,
  },
  {
    id: 'react-stored-draft-hook',
    number: 81,
    title: 'Draft Note Saved to Injected Storage',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build a custom hook \`useStoredState(storage, key, initialValue)\` and use it in \`DraftNote({ storage, storageKey = 'draft' })\`.

\`storage\` is injected and behaves like \`localStorage\`: \`getItem(key)\` returns a string or \`null\`, \`setItem(key, string)\` stores a string, \`removeItem(key)\` deletes the key.

The hook returns \`[value, setValue, clear]\`:
- First render: read \`storage.getItem(key)\`. If it returns a string that is valid JSON, start with the parsed value. If it returns \`null\` or text that is not valid JSON, start with \`initialValue\` (do not crash).
- \`setValue(next)\` updates the value and stores it as JSON: \`storage.setItem(key, JSON.stringify(next))\`. So the text \`Hello\` is stored as \`"Hello"\`, with the double quotes.
- \`clear()\` resets the value to \`initialValue\` and removes the key with \`storage.removeItem(key)\`. Afterwards \`storage.getItem(key)\` must return \`null\` (not an empty string, not \`""\`).

\`DraftNote\` uses the hook with \`initialValue\` \`''\` and renders:
- \`<textarea aria-label="Note">\` bound to the value.
- \`<p data-testid="count">Characters: <n></p>\` with the length of the text.
- A button \`Clear draft\` that calls \`clear()\`.

\`storage\` and \`storageKey\` do not change while the component is mounted.`,
    componentName: 'DraftNote',
    starter: `import React, { useState } from 'react';

function useStoredState(storage, key, initialValue) {
  // TODO: read from storage on the first render, write on change, support clear()
  const [value, setValue] = useState(initialValue);
  const clear = () => {};
  return [value, setValue, clear];
}

export default function DraftNote({ storage, storageKey = 'draft' }) {
  const [text, setText, clear] = useStoredState(storage, storageKey, '');
  return (
    <div>
      <textarea aria-label="Note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="count">Characters: {text.length}</p>
      <button type="button" onClick={clear}>Clear draft</button>
    </div>
  );
}
`,
    previewProps: {"storageKey": "draft"},
    previewSetup: `const data = { draft: JSON.stringify('Remember to water the plants') };
return {
  storage: {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
  },
};`,
    tests: [
      {
        name: 'starts empty when storage has nothing',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const { getByLabelText, getByTestId } = render({ storage: makeStorage() });
expect(getByLabelText('Note').value).toBe('');
expect(getByTestId('count').textContent).toBe('Characters: 0');`,
      },
      {
        name: 'restores a saved JSON draft on the first render',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const storage = makeStorage({ draft: '"Buy milk"', other: '"Wrong key"' });
const { getByLabelText, getByTestId } = render({ storage });
expect(getByLabelText('Note').value).toBe('Buy milk');
expect(getByTestId('count').textContent).toBe('Characters: 8');`,
      },
      {
        name: 'typing stores the text as JSON under storageKey',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const storage = makeStorage();
const { getByLabelText, getByTestId } = render({ storage, storageKey: 'note-7' });
fireEvent.change(getByLabelText('Note'), 'Hello');
expect(getByLabelText('Note').value).toBe('Hello');
expect(getByTestId('count').textContent).toBe('Characters: 5');
expect(storage.getItem('note-7')).toBe('"Hello"');
fireEvent.change(getByLabelText('Note'), 'Hello "you"');
expect(JSON.parse(storage.getItem('note-7'))).toBe('Hello "you"');
expect(storage.getItem('draft')).toBeNull();`,
      },
      {
        name: 'text that is not valid JSON falls back to an empty note',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const storage = makeStorage({ draft: '{oops' });
const { getByLabelText, getByTestId } = render({ storage });
expect(getByLabelText('Note').value).toBe('');
expect(getByTestId('count').textContent).toBe('Characters: 0');`,
      },
      {
        name: 'Clear draft empties the note and removes the key',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const storage = makeStorage({ draft: '"Old text"' });
const { getByLabelText, getByRole, getByTestId } = render({ storage });
fireEvent.change(getByLabelText('Note'), 'Old text plus more');
fireEvent.click(getByRole('button', { name: 'Clear draft' }));
expect(getByLabelText('Note').value).toBe('');
expect(getByTestId('count').textContent).toBe('Characters: 0');
expect(storage.getItem('draft')).toBeNull();`,
      },
      {
        name: 'a new mount picks up what was typed before',
        code: `function makeStorage(seed) { const m = new Map(Object.entries(seed || {})); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); } }; }
const storage = makeStorage();
const first = render({ storage, storageKey: 'trip' });
fireEvent.change(first.getByLabelText('Note'), 'Pack the tent');
first.unmount();
const second = render({ storage, storageKey: 'trip' });
expect(second.getByLabelText('Note').value).toBe('Pack the tent');`,
      },
    ],
    hint: `Give \`useState\` a function so storage is read once: inside it call \`storage.getItem(key)\`, return \`initialValue\` for \`null\`, and wrap \`JSON.parse\` in \`try / catch\`. The setter you return is your own function that both updates state and calls \`storage.setItem\`. If you sync with an effect instead, make sure \`clear()\` does not write the initial value straight back.`,
    explanation: `The hook wraps \`useState\` with a read on the way in and a write on the way out.

Reading: a lazy initialiser (\`useState(() => ...)\`) runs only on the first render, so storage is not hit on every keystroke. Storage holds strings, so values are serialised as JSON. Two things can go wrong when reading: the key is missing (\`null\`) or someone stored text that is not JSON. Both fall back to \`initialValue\`, and \`JSON.parse\` sits in a \`try / catch\` because it throws on bad input. Storing the raw string instead of JSON looks fine until a saved value like \`"Buy milk"\` comes back with its quotes, or you want to store a number or an object.

Writing: the reference returns its own \`setValue\` that calls the state setter and \`storage.setItem(key, JSON.stringify(next))\` together. \`clear\` sets the state back to the initial value and calls \`removeItem\`. An effect that mirrors every value into storage is a common alternative, but it also runs after \`clear()\` and would store \`""\` again, so it needs a flag to tell "cleared" from "edited".

Injecting \`storage\` keeps the hook testable and lets the same code run where \`localStorage\` does not exist. Each call costs one serialisation of the value.`,
    solution: `import React, { useState } from 'react';

function useStoredState(storage, key, initialValue) {
  const [value, setValueState] = useState(() => {
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined) return initialValue;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return initialValue;
    }
  });

  function setValue(next) {
    setValueState(next);
    storage.setItem(key, JSON.stringify(next));
  }

  function clear() {
    setValueState(initialValue);
    storage.removeItem(key);
  }

  return [value, setValue, clear];
}

export default function DraftNote({ storage, storageKey = 'draft' }) {
  const [text, setText, clear] = useStoredState(storage, storageKey, '');
  return (
    <div>
      <textarea aria-label="Note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="count">{'Characters: ' + text.length}</p>
      <button type="button" onClick={clear}>Clear draft</button>
    </div>
  );
}
`,
  },
  {
    id: 'react-autosave-steady-interval',
    number: 82,
    title: 'Autosave on a Steady Interval',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement: `Build \`AutosaveNote({ save, everyMs = 2000 })\`, a note field that saves itself on a fixed rhythm. \`save(text)\` is a plain synchronous function.

Render:
- \`<textarea aria-label="Note">\`, empty at first.
- \`<p data-testid="status">\` reading \`All changes saved\` when the text equals the last saved text, otherwise \`Unsaved changes\`. The last saved text starts as the empty string, so the first render shows \`All changes saved\`.

Behaviour:
- Start ONE interval with period \`everyMs\` when the component mounts.
- On each tick: if the text differs from the last saved text, call \`save(text)\` once with the LATEST text and remember it as the last saved text (the status flips back to \`All changes saved\`). If nothing changed since the last save, the tick does nothing and \`save\` is not called.
- Typing must not restart the interval. Someone who keeps typing without a pause still gets a save roughly every \`everyMs\` ms, not only after they stop.
- Clear the interval on unmount. \`save\` must never be called after the unmount, even if there were unsaved changes.`,
    componentName: 'AutosaveNote',
    starter: `import React, { useState, useEffect, useRef } from 'react';

export default function AutosaveNote({ save, everyMs = 2000 }) {
  const [text, setText] = useState('');
  // TODO: one interval that saves the latest text when it changed
  return (
    <div>
      <textarea aria-label="Note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="status">All changes saved</p>
    </div>
  );
}
`,
    previewProps: {"everyMs": 2000},
    previewSetup: `return { save: (text) => { console.log('saved', text); } };`,
    tests: [
      {
        name: 'starts saved and does not call save while nothing changes',
        code: `const calls = [];
const { getByTestId } = render({ save: (t) => calls.push(t), everyMs: 15 });
expect(getByTestId('status').textContent).toBe('All changes saved');
await sleep(70);
expect(calls).toEqual([]);
expect(getByTestId('status').textContent).toBe('All changes saved');`,
      },
      {
        name: 'typing shows Unsaved changes, then one save with the latest text',
        code: `const calls = [];
const { getByTestId, getByLabelText } = render({ save: (t) => calls.push(t), everyMs: 30 });
fireEvent.change(getByLabelText('Note'), 'a');
fireEvent.change(getByLabelText('Note'), 'ab');
expect(getByTestId('status').textContent).toBe('Unsaved changes');
await waitFor(() => { if (calls.length < 1) throw new Error('not saved yet'); });
expect(calls).toEqual(['ab']);
await waitFor(() => expect(getByTestId('status').textContent).toBe('All changes saved'));`,
      },
      {
        name: 'saves again only after another edit',
        code: `const calls = [];
const { getByTestId, getByLabelText } = render({ save: (t) => calls.push(t), everyMs: 15 });
fireEvent.change(getByLabelText('Note'), 'one');
await waitFor(() => { if (calls.length < 1) throw new Error('not saved yet'); });
await sleep(70);
expect(calls).toEqual(['one']);
fireEvent.change(getByLabelText('Note'), 'one two');
expect(getByTestId('status').textContent).toBe('Unsaved changes');
await waitFor(() => { if (calls.length < 2) throw new Error('not saved yet'); });
await sleep(50);
expect(calls).toEqual(['one', 'one two']);`,
      },
      {
        name: 'continuous typing does not postpone the save',
        code: `const calls = [];
const { getByLabelText } = render({ save: (t) => calls.push(t), everyMs: 40 });
const full = 'abcdefghijklmnopqrst';
for (let i = 1; i <= full.length; i++) {
  fireEvent.change(getByLabelText('Note'), full.slice(0, i));
  await sleep(8);
}
expect(calls.length).toBeGreaterThan(0);
expect(calls.every((c) => c.length > 0 && full.startsWith(c))).toBe(true);`,
      },
      {
        name: 'never saves after unmount',
        code: `const calls = [];
const { getByLabelText, unmount } = render({ save: (t) => calls.push(t), everyMs: 20 });
fireEvent.change(getByLabelText('Note'), 'draft');
unmount();
await sleep(80);
expect(calls).toEqual([]);`,
      },
    ],
    hint: `If the interval effect lists \`text\` as a dependency, every keystroke clears the timer and starts a new one. Keep the effect's dependencies to \`[everyMs]\` and let the tick read the newest text (and the last saved text) from a ref that you update on every render.`,
    explanation: `Two requirements pull in opposite directions: the interval must be created once, and its callback must see the newest text. A callback created on mount closes over the first render's \`text\`, which is always the empty string.

The tempting fix is to add \`text\` to the effect's dependencies. That gives the callback fresh data, but the cleanup now runs on every keystroke, so the timer restarts each time. Someone typing steadily never reaches a tick, and the autosave degrades into a debounce. The "continuous typing" test catches this.

The reference separates the two concerns. A ref holds the live values (\`text\`, the last saved text, the \`save\` prop) and is refreshed on every render. The interval is created in an effect that depends only on \`everyMs\`, and each tick reads from the ref, compares, saves and records what it saved. A small piece of state mirrors the saved text so the status line re-renders. The cleanup clears the interval, which is what guarantees no save after unmount.

This "latest value in a ref, stable timer" pattern is what a general \`useInterval(callback, delay)\` hook does. Each tick is O(1) plus the cost of \`save\`.`,
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function AutosaveNote({ save, everyMs = 2000 }) {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const live = useRef({ text: '', saved: '', save });
  live.current.text = text;
  live.current.save = save;

  useEffect(() => {
    const id = setInterval(() => {
      const now = live.current;
      if (now.text === now.saved) return;
      now.saved = now.text;
      now.save(now.text);
      setSavedText(now.text);
    }, everyMs);
    return () => clearInterval(id);
  }, [everyMs]);

  return (
    <div>
      <textarea aria-label="Note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="status">{text === savedText ? 'All changes saved' : 'Unsaved changes'}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-click-outside-menu',
    number: 83,
    title: 'Options Menu That Closes on Outside Click',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement: `Build \`OptionsMenu({ options, onSelect, onDismiss })\`, a small dropdown. \`options\` is an array of unique strings.

Render:
- A button with the text \`Options\`. It has \`aria-expanded="false"\` while the menu is closed and \`aria-expanded="true"\` while it is open. Clicking it toggles the menu.
- While open, an element with \`role="menu"\` that contains one element with \`role="menuitem"\` per option (the option text). Nothing with \`role="menu"\` exists while closed.

Behaviour:
- Clicking a menu item calls \`onSelect(option)\` and closes the menu.
- While the menu is open, a \`click\` anywhere in the document OUTSIDE the component closes it and calls \`onDismiss()\` once. "Inside the component" means the \`Options\` button, the \`role="menu"\` element and everything in them: a click on the menu element itself (for example its padding) keeps the menu open and does not call \`onDismiss\`.
- Closing with the \`Options\` button or by picking an item does not call \`onDismiss\`.
- The click that opens the menu must not immediately close it again.
- Outside clicks while the menu is closed do nothing, and after the component unmounts (even if it was open) outside clicks must not call \`onDismiss\`. Use a \`click\` listener on \`document\` and remove it in the effect cleanup.

\`onSelect\` and \`onDismiss\` are optional.`,
    componentName: 'OptionsMenu',
    starter: `import React, { useState, useEffect, useRef } from 'react';

export default function OptionsMenu({ options, onSelect, onDismiss }) {
  const [open, setOpen] = useState(false);
  // TODO: close on a document click outside this component (with cleanup)
  return (
    <div>
      <button type="button" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen(!open)}>Options</button>
    </div>
  );
}
`,
    previewProps: {"options": ["Rename", "Duplicate", "Archive"]},
    previewSetup: `return { onSelect: (option) => console.log('selected', option), onDismiss: () => console.log('dismissed') };`,
    tests: [
      {
        name: 'the Options button opens and closes the menu',
        code: `const { getByRole, queryByRole, getAllByRole } = render({ options: ['Rename', 'Duplicate', 'Archive'] });
const button = getByRole('button', { name: 'Options' });
expect(button).toHaveAttribute('aria-expanded', 'false');
expect(queryByRole('menu')).toBeNull();
fireEvent.click(button);
expect(button).toHaveAttribute('aria-expanded', 'true');
expect(getByRole('menu')).toBeTruthy();
expect(getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['Rename', 'Duplicate', 'Archive']);
fireEvent.click(button);
expect(queryByRole('menu')).toBeNull();
expect(button).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'picking an item calls onSelect and closes without onDismiss',
        code: `const picked = [];
let dismissed = 0;
const { getByRole, queryByRole } = render({ options: ['Rename', 'Archive'], onSelect: (o) => picked.push(o), onDismiss: () => { dismissed += 1; } });
fireEvent.click(getByRole('button', { name: 'Options' }));
fireEvent.click(getByRole('menuitem', { name: 'Archive' }));
expect(picked).toEqual(['Archive']);
expect(queryByRole('menu')).toBeNull();
expect(dismissed).toBe(0);`,
      },
      {
        name: 'a click outside closes the menu and calls onDismiss once',
        code: `let dismissed = 0;
const { getByRole, queryByRole } = render({ options: ['Rename', 'Archive'], onDismiss: () => { dismissed += 1; } });
const outside = document.createElement('p');
outside.textContent = 'Somewhere else';
document.body.appendChild(outside);
fireEvent.click(outside);
expect(dismissed).toBe(0);
fireEvent.click(getByRole('button', { name: 'Options' }));
expect(getByRole('menu')).toBeTruthy();
fireEvent.click(outside);
expect(queryByRole('menu')).toBeNull();
expect(getByRole('button', { name: 'Options' })).toHaveAttribute('aria-expanded', 'false');
expect(dismissed).toBe(1);
fireEvent.click(outside);
expect(dismissed).toBe(1);
outside.remove();`,
      },
      {
        name: 'a click on the menu element itself keeps it open',
        code: `let dismissed = 0;
const picked = [];
const { getByRole, queryByRole } = render({ options: ['Rename', 'Archive'], onSelect: (o) => picked.push(o), onDismiss: () => { dismissed += 1; } });
fireEvent.click(getByRole('button', { name: 'Options' }));
fireEvent.click(getByRole('menu'));
expect(queryByRole('menu')).toBeTruthy();
expect(dismissed).toBe(0);
expect(picked).toEqual([]);`,
      },
      {
        name: 'it can be reopened and dismissed again',
        code: `let dismissed = 0;
const { getByRole, queryByRole } = render({ options: ['Rename'], onDismiss: () => { dismissed += 1; } });
fireEvent.click(getByRole('button', { name: 'Options' }));
fireEvent.click(document.body);
expect(queryByRole('menu')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Options' }));
expect(getByRole('menu')).toBeTruthy();
fireEvent.click(document.body);
expect(queryByRole('menu')).toBeNull();
expect(dismissed).toBe(2);`,
      },
      {
        name: 'no onDismiss after unmounting while open',
        code: `let dismissed = 0;
const { getByRole, unmount } = render({ options: ['Rename'], onDismiss: () => { dismissed += 1; } });
fireEvent.click(getByRole('button', { name: 'Options' }));
unmount();
fireEvent.click(document.body);
expect(dismissed).toBe(0);`,
      },
    ],
    hint: `Put a ref on the element that wraps BOTH the button and the menu. In an effect that runs only while \`open\` is true, add a document \`click\` listener that checks \`wrapperRef.current.contains(event.target)\` and closes only when that is false. Return a cleanup that removes the listener.`,
    explanation: `"Click outside" cannot be expressed with React props on your own elements, because the interesting clicks land on elements you do not render. The listener therefore goes on \`document\`, and the question becomes: was the click target inside my subtree? \`node.contains(target)\` answers that.

Where you put the ref matters. If it wraps only the menu, the click on the \`Options\` button counts as outside: the document listener closes the menu and the button's own handler opens it again, or the opening click itself is treated as an outside click and the menu never appears. Wrapping button and menu in one element with the ref avoids both.

The effect depends on \`open\` and returns early when the menu is closed, so the listener exists only while it is needed. React runs the cleanup when \`open\` flips back to false and when the component unmounts, which is what stops \`onDismiss\` from firing for a menu that is gone. A handler that closes on every document click (no \`contains\` check) fails as soon as the user clicks the menu's own padding.

Each document click costs one \`contains\` walk up from the target, O(depth of the DOM).`,
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function OptionsMenu({ options, onSelect, onDismiss }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return undefined;
    function onDocumentClick(event) {
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) return;
      setOpen(false);
      if (dismissRef.current) dismissRef.current();
    }
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [open]);

  function choose(option) {
    setOpen(false);
    if (onSelect) onSelect(option);
  }

  return (
    <div ref={wrapperRef} style={{ display: 'inline-block', position: 'relative' }}>
      <button type="button" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen((o) => !o)}>Options</button>
      {open && (
        <ul role="menu" style={{ listStyle: 'none', margin: 0, padding: 8, border: '1px solid #ccc' }}>
          {options.map((option) => (
            <li key={option} role="menuitem" onClick={() => choose(option)} style={{ cursor: 'pointer' }}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
  },
  {
    id: 'react-lazy-initial-scores',
    number: 84,
    title: 'Lazy Initial State for a Scoreboard',
    difficulty: 'Easy',
    topic: 'Performance & Hooks',
    statement: `Build \`ScoreBoard({ createInitialScores })\`. \`createInitialScores()\` is an EXPENSIVE function that returns the starting scores as an array of \`{ name, points }\` (names are unique). Your job is to call it only when the result is really needed.

Render:
- For every player a \`<span data-testid="score-<name>">\` reading \`<name>: <points>\`, for example \`<span data-testid="score-Ada">Ada: 3</span>\`, in the order of the array.
- For every player a button with \`aria-label="Add point to <name>"\` that adds 1 point to that player.
- \`<p data-testid="total">Total: <sum of all points></p>\`.
- A button \`Reset\` that starts over with a fresh \`createInitialScores()\` result.

Rules:
- Call \`createInitialScores\` exactly once when the component mounts. Re-renders (adding points, the parent re-rendering) must NOT call it again.
- Each click on \`Reset\` calls it exactly one more time.
- Never mutate the array or the objects that \`createInitialScores\` returned. Build new ones when a score changes.`,
    componentName: 'ScoreBoard',
    starter: `import React, { useState } from 'react';

export default function ScoreBoard({ createInitialScores }) {
  // TODO: initialise from createInitialScores without calling it on every render
  const scores = [];
  return (
    <div>
      <p data-testid="total">Total: 0</p>
      <button type="button">Reset</button>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: `return { createInitialScores: () => [{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }, { name: 'Grace', points: 0 }] };`,
    tests: [
      {
        name: 'renders every player and the total',
        code: `const make = () => [{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }, { name: 'Grace', points: 0 }];
const { getByTestId, getAllByRole } = render({ createInitialScores: make });
expect(getByTestId('score-Ada').textContent).toBe('Ada: 3');
expect(getByTestId('score-Linus').textContent).toBe('Linus: 1');
expect(getByTestId('score-Grace').textContent).toBe('Grace: 0');
expect(getByTestId('total').textContent).toBe('Total: 4');
expect(getAllByRole('button').map((b) => b.getAttribute('aria-label')).filter(Boolean)).toEqual(['Add point to Ada', 'Add point to Linus', 'Add point to Grace']);`,
      },
      {
        name: 'createInitialScores runs exactly once on mount, not on re-renders',
        code: `let calls = 0;
const make = () => { calls += 1; return [{ name: 'Ada', points: 3 }]; };
const { rerender, getByTestId } = render({ createInitialScores: make });
expect(calls).toBe(1);
rerender({ createInitialScores: make });
rerender({ createInitialScores: make });
expect(calls).toBe(1);
expect(getByTestId('score-Ada').textContent).toBe('Ada: 3');`,
      },
      {
        name: 'adding points updates the row and total without recomputing',
        code: `let calls = 0;
const make = () => { calls += 1; return [{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }]; };
const { getByLabelText, getByTestId } = render({ createInitialScores: make });
fireEvent.click(getByLabelText('Add point to Linus'));
fireEvent.click(getByLabelText('Add point to Linus'));
fireEvent.click(getByLabelText('Add point to Ada'));
expect(getByTestId('score-Linus').textContent).toBe('Linus: 3');
expect(getByTestId('score-Ada').textContent).toBe('Ada: 4');
expect(getByTestId('total').textContent).toBe('Total: 7');
expect(calls).toBe(1);`,
      },
      {
        name: 'Reset calls it once more and restores the starting scores',
        code: `let calls = 0;
const make = () => { calls += 1; return [{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }]; };
const { getByLabelText, getByTestId, getByRole } = render({ createInitialScores: make });
fireEvent.click(getByLabelText('Add point to Ada'));
fireEvent.click(getByRole('button', { name: 'Reset' }));
expect(calls).toBe(2);
expect(getByTestId('score-Ada').textContent).toBe('Ada: 3');
expect(getByTestId('total').textContent).toBe('Total: 4');
fireEvent.click(getByLabelText('Add point to Linus'));
expect(getByTestId('total').textContent).toBe('Total: 5');
expect(calls).toBe(2);`,
      },
      {
        name: 'the returned data is never mutated',
        code: `const original = [{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }];
const { getByLabelText, getByTestId } = render({ createInitialScores: () => original });
fireEvent.click(getByLabelText('Add point to Ada'));
fireEvent.click(getByLabelText('Add point to Linus'));
expect(getByTestId('score-Ada').textContent).toBe('Ada: 4');
expect(getByTestId('total').textContent).toBe('Total: 6');
expect(original).toEqual([{ name: 'Ada', points: 3 }, { name: 'Linus', points: 1 }]);`,
      },
    ],
    hint: `\`useState(createInitialScores())\` calls the function on every render and throws the result away on all but the first. Pass the function itself: \`useState(createInitialScores)\` or \`useState(() => createInitialScores())\`.`,
    explanation: `\`useState(initial)\` only uses its argument on the first render, but JavaScript still evaluates the argument expression every time the component function runs. Writing \`useState(createInitialScores())\` therefore repeats the expensive work on every render and discards it. When you pass a function instead, React calls it once, on mount, and never again. That is the lazy initialiser. \`useReducer\` has the same feature through its third argument.

Reset is an ordinary event: calling \`createInitialScores()\` inside the click handler runs it once per click, which is exactly what is wanted.

Adding a point maps the array to a new array and creates a new object only for the changed player. The originals are left alone, so anything else holding the array returned by \`createInitialScores\` is unaffected, and React sees a new reference and re-renders. The total is derived during render with a \`reduce\`; storing it in state would only create a second value to keep in sync.

Cost: one O(n) pass per render for the rows and the total, and the expensive call only on mount and on Reset.`,
    solution: `import React, { useState } from 'react';

export default function ScoreBoard({ createInitialScores }) {
  const [scores, setScores] = useState(() => createInitialScores());

  function addPoint(name) {
    setScores((current) => current.map((player) => (
      player.name === name ? { ...player, points: player.points + 1 } : player
    )));
  }

  const total = scores.reduce((sum, player) => sum + player.points, 0);

  return (
    <div>
      <ul>
        {scores.map((player) => (
          <li key={player.name}>
            <span data-testid={'score-' + player.name}>{player.name + ': ' + player.points}</span>{' '}
            <button type="button" aria-label={'Add point to ' + player.name} onClick={() => addPoint(player.name)}>+1</button>
          </li>
        ))}
      </ul>
      <p data-testid="total">{'Total: ' + total}</p>
      <button type="button" onClick={() => setScores(createInitialScores())}>Reset</button>
    </div>
  );
}
`,
  },
  {
    id: 'react-load-more-feed',
    number: 85,
    title: 'Load More with a Cursor',
    difficulty: 'Medium',
    topic: 'Async & Data',
    statement: `Build \`PostFeed({ loadPage })\`, a feed that loads one page at a time.

\`loadPage(cursor)\` returns a Promise of \`{ items, nextCursor }\`. \`items\` is an array of \`{ id, title }\`. \`nextCursor\` is the value to pass for the following page, or \`null\` when this was the last page.

- On mount call \`loadPage(null)\` for the first page.
- Render every post loaded so far as an \`<li>\` (its \`title\`) inside ONE \`<ul>\`, in the order the pages arrived. A new page is appended; earlier posts stay.
- While a request is pending render \`<p>Loading...</p>\` and do not render the \`Load more\` button.
- When no request is pending and the last response had a non-null \`nextCursor\`, render a button \`Load more\`. Clicking it calls \`loadPage(nextCursor)\`.
- When the last page has been loaded (\`nextCursor\` is \`null\`): render \`<p>No more posts</p>\` if at least one post is shown, or \`<p>No posts yet</p>\` if the feed is completely empty. Never both, and no \`Load more\` button.
- If a request rejects: render \`<p role="alert">Could not load posts</p>\` and a button \`Retry\`, keep the posts already loaded, and do not render \`Load more\`. \`Retry\` repeats the failed request with the same cursor; while it is pending the alert is gone and \`Loading...\` shows again.`,
    componentName: 'PostFeed',
    starter: `import React, { useState, useEffect } from 'react';

export default function PostFeed({ loadPage }) {
  const [posts, setPosts] = useState([]);
  // TODO: load the first page on mount, then page by page with "Load more"
  return (
    <div>
      <ul>
        {posts.map((post) => <li key={post.id}>{post.title}</li>)}
      </ul>
      <p>Loading...</p>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: `const pages = {
  start: { items: [{ id: 1, title: 'Hello world' }, { id: 2, title: 'Second post' }], nextCursor: 'p2' },
  p2: { items: [{ id: 3, title: 'Cursor pagination' }, { id: 4, title: 'Appending pages' }], nextCursor: 'p3' },
  p3: { items: [{ id: 5, title: 'The last one' }], nextCursor: null },
};
return { loadPage: (cursor) => new Promise((resolve) => setTimeout(() => resolve(pages[cursor === null ? 'start' : cursor]), 400)) };`,
    tests: [
      {
        name: 'loads the first page on mount with a null cursor',
        code: `const cursors = [];
const loadPage = async (cursor) => { cursors.push(cursor); return { items: [{ id: 1, title: 'Alpha' }, { id: 2, title: 'Beta' }], nextCursor: 'c2' }; };
const { getByText, getAllByRole, getByRole, queryByText, queryByRole } = render({ loadPage });
expect(getByText('Loading...')).toBeTruthy();
expect(queryByRole('button', { name: 'Load more' })).toBeNull();
await waitFor(() => getByRole('button', { name: 'Load more' }));
expect(cursors).toEqual([null]);
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Beta']);
expect(queryByText('Loading...')).toBeNull();
expect(queryByText('No more posts')).toBeNull();`,
      },
      {
        name: 'Load more passes the cursor and appends the next page',
        code: `const cursors = [];
const pages = { first: { items: [{ id: 1, title: 'Alpha' }, { id: 2, title: 'Beta' }], nextCursor: 'c2' }, c2: { items: [{ id: 3, title: 'Gamma' }], nextCursor: 'c3' }, c3: { items: [{ id: 4, title: 'Delta' }], nextCursor: null } };
let release = null;
const loadPage = (cursor) => { cursors.push(cursor); if (cursor === null) return Promise.resolve(pages.first); return new Promise((resolve) => { release = () => resolve(pages[cursor]); }); };
const { getByText, getAllByRole, getByRole, queryByRole, queryByText } = render({ loadPage });
await waitFor(() => getByRole('button', { name: 'Load more' }));
fireEvent.click(getByRole('button', { name: 'Load more' }));
expect(cursors).toEqual([null, 'c2']);
expect(getByText('Loading...')).toBeTruthy();
expect(queryByRole('button', { name: 'Load more' })).toBeNull();
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Beta']);
release();
await waitFor(() => getByRole('button', { name: 'Load more' }));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
expect(getAllByRole('list')).toHaveLength(1);
fireEvent.click(getByRole('button', { name: 'Load more' }));
expect(cursors).toEqual([null, 'c2', 'c3']);
release();
await waitFor(() => getByText('No more posts'));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
expect(queryByText('Loading...')).toBeNull();`,
      },
      {
        name: 'the last page shows No more posts and no button',
        code: `const loadPage = async () => ({ items: [{ id: 1, title: 'Only post' }], nextCursor: null });
const { getByText, queryByRole, queryByText } = render({ loadPage });
await waitFor(() => getByText('No more posts'));
expect(getByText('Only post')).toBeTruthy();
expect(queryByRole('button', { name: 'Load more' })).toBeNull();
expect(queryByText('No posts yet')).toBeNull();`,
      },
      {
        name: 'an empty feed shows No posts yet',
        code: `const loadPage = async () => ({ items: [], nextCursor: null });
const { getByText, queryByRole, queryByText } = render({ loadPage });
await waitFor(() => getByText('No posts yet'));
expect(queryByText('No more posts')).toBeNull();
expect(queryByText('Loading...')).toBeNull();
expect(queryByRole('button', { name: 'Load more' })).toBeNull();
expect(queryByRole('listitem')).toBeNull();`,
      },
      {
        name: 'a failed page keeps the posts and Retry repeats the same cursor',
        code: `const cursors = [];
let failNext = true;
const loadPage = async (cursor) => {
  cursors.push(cursor);
  if (cursor === null) return { items: [{ id: 1, title: 'Alpha' }], nextCursor: 'c2' };
  if (failNext) { failNext = false; throw new Error('offline'); }
  return { items: [{ id: 2, title: 'Beta' }], nextCursor: null };
};
const { getByText, getAllByRole, getByRole, queryByRole, queryByText } = render({ loadPage });
await waitFor(() => getByRole('button', { name: 'Load more' }));
fireEvent.click(getByRole('button', { name: 'Load more' }));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Could not load posts');
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha']);
expect(queryByRole('button', { name: 'Load more' })).toBeNull();
expect(queryByText('Loading...')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Retry' }));
expect(queryByRole('alert')).toBeNull();
expect(getByText('Loading...')).toBeTruthy();
await waitFor(() => getByText('No more posts'));
expect(cursors).toEqual([null, 'c2', 'c2']);
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Beta']);
expect(queryByRole('button', { name: 'Retry' })).toBeNull();`,
      },
      {
        name: 'a failing first page can be retried',
        code: `let attempts = 0;
const loadPage = async (cursor) => { attempts += 1; if (attempts === 1) throw new Error('boom'); return { items: [{ id: 1, title: 'Alpha' }], nextCursor: null }; };
const { getByText, getByRole, queryByText } = render({ loadPage });
await waitFor(() => getByRole('alert'));
expect(queryByText('No posts yet')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Retry' }));
await waitFor(() => getByText('Alpha'));
expect(getByText('No more posts')).toBeTruthy();`,
      },
    ],
    hint: `Keep four things: the posts so far, the cursor for the NEXT request, a status (\`loading\`, \`idle\`, \`error\`) and whether the end was reached. One \`fetchPage(cursor)\` function sets the status to loading, then appends with \`setPosts((prev) => prev.concat(page.items))\`. Because the cursor only advances on success, Retry can simply call \`fetchPage\` with the cursor you already have.`,
    explanation: `Cursor pagination is a small state machine around an accumulating list.

The list only grows: each successful page is appended with a functional update (\`prev.concat(page.items)\`), so nothing depends on a stale copy of the array. Replacing the list with the newest page is the most common bug and is what the append test catches.

Next to the list, the component tracks which cursor to request next, whether a request is running, whether the last one failed and whether the server said there is nothing more (\`nextCursor === null\`). The reference stores the cursor in state and advances it only inside the success branch. That makes Retry trivial: the cursor still points at the page that failed, so the same \`fetchPage(cursor)\` call repeats the request.

The UI is derived from the status. \`loading\` shows the Loading line and hides every button, which also prevents double requests. \`error\` shows the alert and Retry. Otherwise it shows \`Load more\`, or one of the two end messages depending on whether any posts are on screen. The first page is requested from an effect with an empty dependency array, and every later page from a click handler.

Each page costs one request and an O(k) append for its k items.`,
    solution: `import React, { useState, useEffect } from 'react';

export default function PostFeed({ loadPage }) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [status, setStatus] = useState('loading');
  const [done, setDone] = useState(false);

  function fetchPage(at) {
    setStatus('loading');
    loadPage(at).then(
      (page) => {
        setPosts((prev) => prev.concat(page.items));
        setCursor(page.nextCursor);
        setDone(page.nextCursor === null);
        setStatus('idle');
      },
      () => setStatus('error')
    );
  }

  useEffect(() => {
    fetchPage(null);
  }, []);

  return (
    <div>
      <ul>
        {posts.map((post) => <li key={post.id}>{post.title}</li>)}
      </ul>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && (
        <div>
          <p role="alert">Could not load posts</p>
          <button type="button" onClick={() => fetchPage(cursor)}>Retry</button>
        </div>
      )}
      {status === 'idle' && !done && (
        <button type="button" onClick={() => fetchPage(cursor)}>Load more</button>
      )}
      {status === 'idle' && done && (
        <p>{posts.length > 0 ? 'No more posts' : 'No posts yet'}</p>
      )}
    </div>
  );
}
`,
  },
  {
    id: 'react-refresh-keep-stale',
    number: 86,
    title: 'Refresh Without Losing the Old Data',
    difficulty: 'Medium',
    topic: 'Async & Data',
    statement: `Build \`QuoteCard({ load })\`. \`load()\` returns a Promise of \`{ price, time }\` (a number and a string) and may reject with an \`Error\`.

First load:
- Call \`load()\` once on mount. Until it settles render only \`<p>Loading...</p>\`.
- If it rejects, render \`<p role="alert">Could not load: <error.message></p>\` and a button \`Try again\`. \`Try again\` starts the first load over (back to \`Loading...\`, alert gone).

After a successful load render:
- \`<p data-testid="price">Price: <price></p>\` and \`<p data-testid="updated">Updated: <time></p>\`.
- A button \`Refresh\` that calls \`load()\` again.

Refreshing must keep the old data on screen:
- While a refresh is pending, the previous price and time stay visible, \`Loading...\` is NOT shown, and the button is disabled and reads \`Refreshing...\`.
- When the refresh resolves, show the new price and time and a normal \`Refresh\` button.
- When the refresh rejects, keep the previous price and time, show \`<p role="alert">Refresh failed: <error.message></p>\` and a normal \`Refresh\` button.
- The \`Refresh failed\` alert disappears as soon as the next refresh starts.`,
    componentName: 'QuoteCard',
    starter: `import React, { useState, useEffect } from 'react';

export default function QuoteCard({ load }) {
  const [quote, setQuote] = useState(null);
  // TODO: first load, refresh that keeps the old quote, both error cases
  return (
    <div>
      <p>Loading...</p>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: `let n = 0;
return {
  load: () => new Promise((resolve, reject) => setTimeout(() => {
    n += 1;
    if (n % 3 === 0) reject(new Error('Server busy'));
    else resolve({ price: 100 + n * 3, time: '10:0' + (n % 10) });
  }, 700)),
};`,
    tests: [
      {
        name: 'shows Loading... and then the first quote',
        code: `const pending = [];
const load = () => new Promise((resolve, reject) => { pending.push({ resolve, reject }); });
const { getByText, getByTestId, getByRole, queryByText, queryByTestId, queryByRole } = render({ load });
expect(getByText('Loading...')).toBeTruthy();
expect(queryByTestId('price')).toBeNull();
expect(queryByRole('button')).toBeNull();
expect(pending).toHaveLength(1);
pending[0].resolve({ price: 101, time: '09:30' });
await waitFor(() => getByTestId('price'));
expect(getByTestId('price').textContent).toBe('Price: 101');
expect(getByTestId('updated').textContent).toBe('Updated: 09:30');
expect(queryByText('Loading...')).toBeNull();
expect(getByRole('button', { name: 'Refresh' })).not.toBeDisabled();`,
      },
      {
        name: 'a refresh keeps the old quote visible until the new one arrives',
        code: `const pending = [];
const load = () => new Promise((resolve, reject) => { pending.push({ resolve, reject }); });
const { getByTestId, getByRole, queryByText, queryByRole } = render({ load });
pending[0].resolve({ price: 101, time: '09:30' });
await waitFor(() => getByTestId('price'));
fireEvent.click(getByRole('button', { name: 'Refresh' }));
expect(pending).toHaveLength(2);
expect(getByTestId('price').textContent).toBe('Price: 101');
expect(getByTestId('updated').textContent).toBe('Updated: 09:30');
expect(queryByText('Loading...')).toBeNull();
expect(getByRole('button', { name: 'Refreshing...' })).toBeDisabled();
expect(queryByRole('button', { name: 'Refresh' })).toBeNull();
pending[1].resolve({ price: 107, time: '09:31' });
await waitFor(() => expect(getByTestId('price').textContent).toBe('Price: 107'));
expect(getByTestId('updated').textContent).toBe('Updated: 09:31');
expect(getByRole('button', { name: 'Refresh' })).not.toBeDisabled();`,
      },
      {
        name: 'a failed refresh keeps the old quote and shows Refresh failed',
        code: `const pending = [];
const load = () => new Promise((resolve, reject) => { pending.push({ resolve, reject }); });
const { getByTestId, getByRole, queryByRole } = render({ load });
pending[0].resolve({ price: 55, time: '12:00' });
await waitFor(() => getByTestId('price'));
fireEvent.click(getByRole('button', { name: 'Refresh' }));
pending[1].reject(new Error('Server busy'));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Refresh failed: Server busy');
expect(getByTestId('price').textContent).toBe('Price: 55');
expect(getByTestId('updated').textContent).toBe('Updated: 12:00');
expect(getByRole('button', { name: 'Refresh' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Refresh' }));
expect(queryByRole('alert')).toBeNull();
expect(getByTestId('price').textContent).toBe('Price: 55');
pending[2].resolve({ price: 58, time: '12:02' });
await waitFor(() => expect(getByTestId('price').textContent).toBe('Price: 58'));
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'a failed first load offers Try again',
        code: `const pending = [];
const load = () => new Promise((resolve, reject) => { pending.push({ resolve, reject }); });
const { getByTestId, getByRole, getByText, queryByRole, queryByText, queryByTestId } = render({ load });
pending[0].reject(new Error('No network'));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Could not load: No network');
expect(queryByText('Loading...')).toBeNull();
expect(queryByTestId('price')).toBeNull();
expect(queryByRole('button', { name: 'Refresh' })).toBeNull();
fireEvent.click(getByRole('button', { name: 'Try again' }));
expect(getByText('Loading...')).toBeTruthy();
expect(queryByRole('alert')).toBeNull();
expect(pending).toHaveLength(2);
pending[1].resolve({ price: 9, time: '08:00' });
await waitFor(() => getByTestId('price'));
expect(getByTestId('price').textContent).toBe('Price: 9');
expect(queryByRole('button', { name: 'Try again' })).toBeNull();`,
      },
      {
        name: 'load runs once on mount and once per refresh',
        code: `let calls = 0;
const load = async () => { calls += 1; return { price: calls * 10, time: 't' + calls }; };
const { getByTestId, getByRole } = render({ load });
await waitFor(() => getByTestId('price'));
expect(calls).toBe(1);
fireEvent.click(getByRole('button', { name: 'Refresh' }));
await waitFor(() => expect(getByTestId('price').textContent).toBe('Price: 20'));
fireEvent.click(getByRole('button', { name: 'Refresh' }));
await waitFor(() => expect(getByTestId('price').textContent).toBe('Price: 30'));
expect(getByTestId('updated').textContent).toBe('Updated: t3');
expect(calls).toBe(3);`,
      },
    ],
    hint: `Do not model this as a single \`loading\` flag that hides everything. Keep the data (\`quote\`, possibly null), a \`busy\` flag and an \`error\` message as separate pieces of state. What to draw depends on whether you HAVE data: no data means the first-load screens, data means the card plus an optional refresh state on top.`,
    explanation: `A plain "loading / error / data" switch throws the data away whenever a request starts, so every refresh flashes a spinner and a failed refresh leaves the user with nothing. The better model keeps the last good data and treats "a request is running" and "the last request failed" as extra facts next to it.

The reference stores three independent values: \`quote\` (null until the first success), \`busy\` and \`error\`. One \`run()\` function sets \`busy\`, clears \`error\`, calls \`load()\`, and on success replaces \`quote\`, on failure stores the message. It never clears \`quote\`. Rendering then branches on whether a quote exists. Without one, the component is in first-load territory: \`Loading...\` while busy, or the \`Could not load\` alert with \`Try again\`. With one, it always shows the price and time, and layers the refresh state on top: a disabled \`Refreshing...\` button while busy, or the \`Refresh failed\` alert.

Clearing \`error\` at the start of \`run()\` is what removes the alert the moment a new attempt begins. Disabling the button while busy prevents overlapping requests, so no stale-response guard is needed here. Each attempt is one call to \`load\`.`,
    solution: `import React, { useState, useEffect } from 'react';

export default function QuoteCard({ load }) {
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);

  function run() {
    setBusy(true);
    setError(null);
    load().then(
      (next) => {
        setQuote(next);
        setBusy(false);
      },
      (err) => {
        setError(err && err.message ? err.message : String(err));
        setBusy(false);
      }
    );
  }

  useEffect(() => {
    run();
  }, []);

  if (quote === null) {
    if (busy) return <div><p>Loading...</p></div>;
    return (
      <div>
        <p role="alert">{'Could not load: ' + error}</p>
        <button type="button" onClick={run}>Try again</button>
      </div>
    );
  }

  return (
    <div>
      <p data-testid="price">{'Price: ' + quote.price}</p>
      <p data-testid="updated">{'Updated: ' + quote.time}</p>
      {error !== null && <p role="alert">{'Refresh failed: ' + error}</p>}
      <button type="button" disabled={busy} onClick={run}>{busy ? 'Refreshing...' : 'Refresh'}</button>
    </div>
  );
}
`,
  },
  {
    id: 'react-optimistic-delete-rollback',
    number: 87,
    title: 'Optimistic Delete with Rollback',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`BookmarkList({ initialBookmarks, deleteBookmark })\`. \`initialBookmarks\` is an array of \`{ id, title }\` with unique ids and titles. \`deleteBookmark(id)\` returns a Promise that resolves when the server deleted the bookmark and rejects when it could not.

Render:
- One \`<li>\` per visible bookmark, in the order of \`initialBookmarks\`. Each \`<li>\` contains \`<span data-testid="title"><title></span>\` and a button with \`aria-label="Delete <title>"\`.
- \`<p data-testid="count">Bookmarks: <number of visible bookmarks></p>\`.
- \`<p>No bookmarks</p>\` when no bookmark is visible.

Deleting is optimistic:
- Clicking a Delete button hides that bookmark IMMEDIATELY (before the promise settles) and calls \`deleteBookmark(id)\` once.
- If the promise resolves, the bookmark stays gone.
- If it rejects, the bookmark comes back in its ORIGINAL position (the order of \`initialBookmarks\` among the visible ones) and \`<p role="alert">Could not delete <title></p>\` is rendered.
- Several deletes can be in flight at once and each settles on its own. A failed delete brings back only its own bookmark: it must not bring back another bookmark whose delete succeeded or is still pending.
- Only one alert is shown, for the most recent failure. Clicking any Delete button removes the alert.`,
    componentName: 'BookmarkList',
    starter: `import React, { useState } from 'react';

export default function BookmarkList({ initialBookmarks, deleteBookmark }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  // TODO: hide optimistically, call deleteBookmark, roll back on failure
  return (
    <div>
      <ul>
        {bookmarks.map((b) => (
          <li key={b.id}>
            <span data-testid="title">{b.title}</span>
            <button type="button" aria-label={'Delete ' + b.title}>Delete</button>
          </li>
        ))}
      </ul>
      <p data-testid="count">Bookmarks: {bookmarks.length}</p>
    </div>
  );
}
`,
    previewProps: {"initialBookmarks": [{"id": 1, "title": "React docs"}, {"id": 2, "title": "MDN"}, {"id": 3, "title": "Protected page"}, {"id": 4, "title": "Can I use"}]},
    previewSetup: `return { deleteBookmark: (id) => new Promise((resolve, reject) => setTimeout(() => (id === 3 ? reject(new Error('locked')) : resolve()), 800)) };`,
    tests: [
      {
        name: 'renders the bookmarks in order with a count',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }, { id: 3, title: 'Wiki' }];
const { container, getByTestId, getAllByRole, queryByText, queryByRole } = render({ initialBookmarks: data, deleteBookmark: async () => {} });
expect(Array.from(container.querySelectorAll('[data-testid="title"]')).map((el) => el.textContent)).toEqual(['Docs', 'Blog', 'Wiki']);
expect(getAllByRole('listitem')).toHaveLength(3);
expect(getByTestId('count').textContent).toBe('Bookmarks: 3');
expect(queryByText('No bookmarks')).toBeNull();
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'a click hides the bookmark before the server answers',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }, { id: 3, title: 'Wiki' }];
const calls = [];
const settle = {};
const deleteBookmark = (id) => new Promise((resolve, reject) => { calls.push(id); settle[id] = { resolve, reject }; });
const { container, getByTestId, getByLabelText } = render({ initialBookmarks: data, deleteBookmark });
const titles = () => Array.from(container.querySelectorAll('[data-testid="title"]')).map((el) => el.textContent);
fireEvent.click(getByLabelText('Delete Blog'));
expect(titles()).toEqual(['Docs', 'Wiki']);
expect(getByTestId('count').textContent).toBe('Bookmarks: 2');
expect(calls).toEqual([2]);
settle[2].resolve();
await sleep(20);
expect(titles()).toEqual(['Docs', 'Wiki']);
expect(container.querySelector('[role="alert"]')).toBeNull();`,
      },
      {
        name: 'a rejected delete restores the bookmark in its original position',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }, { id: 3, title: 'Wiki' }];
const settle = {};
const deleteBookmark = (id) => new Promise((resolve, reject) => { settle[id] = { resolve, reject }; });
const { container, getByTestId, getByLabelText, getByRole } = render({ initialBookmarks: data, deleteBookmark });
const titles = () => Array.from(container.querySelectorAll('[data-testid="title"]')).map((el) => el.textContent);
fireEvent.click(getByLabelText('Delete Blog'));
expect(titles()).toEqual(['Docs', 'Wiki']);
settle[2].reject(new Error('nope'));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Could not delete Blog');
expect(titles()).toEqual(['Docs', 'Blog', 'Wiki']);
expect(getByTestId('count').textContent).toBe('Bookmarks: 3');`,
      },
      {
        name: 'a failure does not bring back a bookmark that was deleted successfully',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }, { id: 3, title: 'Wiki' }, { id: 4, title: 'News' }];
const settle = {};
const deleteBookmark = (id) => new Promise((resolve, reject) => { settle[id] = { resolve, reject }; });
const { container, getByLabelText, getByRole } = render({ initialBookmarks: data, deleteBookmark });
const titles = () => Array.from(container.querySelectorAll('[data-testid="title"]')).map((el) => el.textContent);
fireEvent.click(getByLabelText('Delete Docs'));
fireEvent.click(getByLabelText('Delete Wiki'));
fireEvent.click(getByLabelText('Delete News'));
expect(titles()).toEqual(['Blog']);
settle[3].resolve();
await sleep(10);
settle[1].reject(new Error('nope'));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Could not delete Docs');
expect(titles()).toEqual(['Docs', 'Blog']);
settle[4].reject(new Error('nope'));
await waitFor(() => expect(getByRole('alert').textContent).toBe('Could not delete News'));
expect(titles()).toEqual(['Docs', 'Blog', 'News']);
expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);`,
      },
      {
        name: 'the alert goes away on the next Delete click',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }];
const settle = {};
const deleteBookmark = (id) => new Promise((resolve, reject) => { settle[id] = { resolve, reject }; });
const { getByLabelText, getByRole, queryByRole } = render({ initialBookmarks: data, deleteBookmark });
fireEvent.click(getByLabelText('Delete Docs'));
settle[1].reject(new Error('nope'));
await waitFor(() => getByRole('alert'));
fireEvent.click(getByLabelText('Delete Blog'));
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'deleting everything shows No bookmarks',
        code: `const data = [{ id: 1, title: 'Docs' }, { id: 2, title: 'Blog' }];
const { container, getByLabelText, getByText, getByTestId } = render({ initialBookmarks: data, deleteBookmark: async () => {} });
fireEvent.click(getByLabelText('Delete Docs'));
fireEvent.click(getByLabelText('Delete Blog'));
expect(getByText('No bookmarks')).toBeTruthy();
expect(getByTestId('count').textContent).toBe('Bookmarks: 0');
await sleep(20);
expect(container.querySelectorAll('[data-testid="title"]')).toHaveLength(0);
expect(getByText('No bookmarks')).toBeTruthy();`,
      },
    ],
    hint: `Restoring a snapshot of the whole list (\`setBookmarks(listBeforeTheClick)\`) undoes every other delete that happened in the meantime. Instead of removing items from an array, keep a set of hidden ids and derive the visible list from \`initialBookmarks\`. Rolling back is then "take this one id out of the set", always with a functional update.`,
    explanation: `Optimistic UI means acting as if the server already agreed, and undoing the action if it did not. The hard part is the undo when several requests overlap.

The obvious rollback saves the list before the click and puts it back on failure. That snapshot is a picture of the past: if another delete succeeded since then, restoring the picture resurrects that bookmark as well. The fourth test deletes three bookmarks, lets one succeed and then fails another to expose exactly this.

The reference never edits the list. It keeps a \`Set\` of hidden ids and computes \`visible = initialBookmarks.filter((b) => !hidden.has(b.id))\` during render. Deleting adds one id, a rejection removes that same id, and both use functional updates (\`setHidden((prev) => ...)\`) so each change is applied to the latest set and not to the one captured when the click happened. Because the visible list is always filtered from the original array, a restored bookmark reappears in its original position without any index bookkeeping.

The alert is a separate piece of state holding the title of the last failure. It is cleared at the start of every delete click. Each render filters the list once, O(n).`,
    solution: `import React, { useState } from 'react';

export default function BookmarkList({ initialBookmarks, deleteBookmark }) {
  const [hidden, setHidden] = useState(() => new Set());
  const [failedTitle, setFailedTitle] = useState(null);

  function remove(bookmark) {
    setFailedTitle(null);
    setHidden((prev) => {
      const next = new Set(prev);
      next.add(bookmark.id);
      return next;
    });
    deleteBookmark(bookmark.id).catch(() => {
      setHidden((prev) => {
        const next = new Set(prev);
        next.delete(bookmark.id);
        return next;
      });
      setFailedTitle(bookmark.title);
    });
  }

  const visible = initialBookmarks.filter((b) => !hidden.has(b.id));

  return (
    <div>
      {failedTitle !== null && <p role="alert">{'Could not delete ' + failedTitle}</p>}
      <ul>
        {visible.map((b) => (
          <li key={b.id}>
            <span data-testid="title">{b.title}</span>{' '}
            <button type="button" aria-label={'Delete ' + b.title} onClick={() => remove(b)}>Delete</button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p>No bookmarks</p>}
      <p data-testid="count">{'Bookmarks: ' + visible.length}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-abortable-city-search',
    number: 88,
    title: 'Cancelling Requests with AbortController',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`CitySearch({ search })\`. \`search(query, signal)\` returns a Promise of an array of city names. \`signal\` is an \`AbortSignal\`: when it is aborted the request is cancelled and its promise usually rejects with an \`AbortError\`.

Render a text input with \`aria-label="City"\`. There is no debounce: every change of the input starts a new search.

For each change:
- A query that is empty or only spaces is "empty": do not call \`search\`, and render no list and none of the messages below.
- Otherwise create a NEW \`AbortController\` and call \`search(query, controller.signal)\` with the query exactly as typed.
- Before that (and also when the query becomes empty, and when the component unmounts) call \`abort()\` on the controller of the previous request, so the earlier call's \`signal.aborted\` becomes \`true\`.

What to show for a non-empty query:
- While the latest request is pending: \`<p>Searching...</p>\` and no list from an earlier query.
- When it resolves with cities: a \`<ul>\` with one \`<li>\` per city, in the given order.
- When it resolves with an empty array: \`<p>No cities found</p>\`.
- When it rejects and was NOT aborted: \`<p role="alert">Search failed</p>\`.

A request that has been aborted must never change the screen, whether its promise rejects (no \`Search failed\` for a cancelled request) or resolves late (its cities are ignored).`,
    componentName: 'CitySearch',
    starter: `import React, { useState, useEffect } from 'react';

export default function CitySearch({ search }) {
  const [query, setQuery] = useState('');
  // TODO: search on every change, abort the previous request, ignore aborted results
  return (
    <div>
      <input aria-label="City" value={query} onChange={(e) => setQuery(e.target.value)} />
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: `const cities = ['Amsterdam', 'Athens', 'Auckland', 'Berlin', 'Bern', 'Bogota', 'Boston', 'Lima', 'Lisbon', 'London'];
return {
  search: (query, signal) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(cities.filter((c) => c.toLowerCase().startsWith(query.trim().toLowerCase()))), 600);
    signal.addEventListener('abort', () => { clearTimeout(timer); const e = new Error('Aborted'); e.name = 'AbortError'; reject(e); });
  }),
};`,
    tests: [
      {
        name: 'calls search with the query and a live signal, then lists the cities',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => { calls.push({ query, signal, resolve, reject }); });
const { getByLabelText, getByText, getAllByRole, queryByText, queryByRole } = render({ search });
expect(calls).toHaveLength(0);
expect(queryByText('Searching...')).toBeNull();
fireEvent.change(getByLabelText('City'), 'Li');
expect(calls).toHaveLength(1);
expect(calls[0].query).toBe('Li');
expect(typeof calls[0].signal.addEventListener).toBe('function');
expect(calls[0].signal.aborted).toBe(false);
expect(getByText('Searching...')).toBeTruthy();
calls[0].resolve(['Lima', 'Lisbon']);
await waitFor(() => getAllByRole('listitem'));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Lima', 'Lisbon']);
expect(queryByText('Searching...')).toBeNull();
expect(calls[0].signal.aborted).toBe(false);
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'a new query aborts the previous request without showing an error',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => {
  calls.push({ query, signal, resolve, reject });
  signal.addEventListener('abort', () => { const e = new Error('Aborted'); e.name = 'AbortError'; reject(e); });
});
const { getByLabelText, getByText, getAllByRole, queryByRole } = render({ search });
fireEvent.change(getByLabelText('City'), 'B');
fireEvent.change(getByLabelText('City'), 'Be');
expect(calls.map((c) => c.query)).toEqual(['B', 'Be']);
expect(calls[0].signal.aborted).toBe(true);
expect(calls[1].signal.aborted).toBe(false);
expect(calls[0].signal).not.toBe(calls[1].signal);
await sleep(20);
expect(queryByRole('alert')).toBeNull();
expect(getByText('Searching...')).toBeTruthy();
calls[1].resolve(['Berlin', 'Bern']);
await waitFor(() => getAllByRole('listitem'));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Berlin', 'Bern']);
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'a cancelled request that resolves late is ignored',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => { calls.push({ query, signal, resolve, reject }); });
const { getByLabelText, getAllByRole } = render({ search });
fireEvent.change(getByLabelText('City'), 'A');
fireEvent.change(getByLabelText('City'), 'At');
calls[1].resolve(['Athens']);
await waitFor(() => getAllByRole('listitem'));
calls[0].resolve(['Amsterdam', 'Athens', 'Auckland']);
await sleep(30);
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Athens']);`,
      },
      {
        name: 'an empty result and a real failure have their own messages',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => { calls.push({ query, signal, resolve, reject }); });
const { getByLabelText, getByText, getByRole, queryByRole, queryByText } = render({ search });
fireEvent.change(getByLabelText('City'), 'Zz');
calls[0].resolve([]);
await waitFor(() => getByText('No cities found'));
expect(queryByRole('listitem')).toBeNull();
fireEvent.change(getByLabelText('City'), 'Zzz');
expect(queryByText('No cities found')).toBeNull();
expect(getByText('Searching...')).toBeTruthy();
calls[1].reject(new Error('500'));
await waitFor(() => getByRole('alert'));
expect(getByRole('alert').textContent).toBe('Search failed');
expect(queryByText('Searching...')).toBeNull();
fireEvent.change(getByLabelText('City'), 'Zzzz');
expect(queryByRole('alert')).toBeNull();
expect(getByText('Searching...')).toBeTruthy();`,
      },
      {
        name: 'clearing the input aborts the request and clears the screen',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => { calls.push({ query, signal, resolve, reject }); });
const { getByLabelText, getAllByRole, queryByText, queryByRole } = render({ search });
fireEvent.change(getByLabelText('City'), 'Bo');
calls[0].resolve(['Bogota', 'Boston']);
await waitFor(() => getAllByRole('listitem'));
fireEvent.change(getByLabelText('City'), 'Bos');
fireEvent.change(getByLabelText('City'), '');
expect(calls).toHaveLength(2);
expect(calls[1].signal.aborted).toBe(true);
expect(queryByRole('listitem')).toBeNull();
expect(queryByText('Searching...')).toBeNull();
fireEvent.change(getByLabelText('City'), '   ');
expect(calls).toHaveLength(2);
expect(queryByText('Searching...')).toBeNull();
expect(queryByText('No cities found')).toBeNull();
calls[1].resolve(['Boston']);
await sleep(30);
expect(queryByRole('listitem')).toBeNull();`,
      },
      {
        name: 'unmounting aborts the request in flight',
        code: `const calls = [];
const search = (query, signal) => new Promise((resolve, reject) => { calls.push({ query, signal, resolve, reject }); });
const { getByLabelText, unmount } = render({ search });
fireEvent.change(getByLabelText('City'), 'Lon');
expect(calls[0].signal.aborted).toBe(false);
unmount();
expect(calls[0].signal.aborted).toBe(true);`,
      },
    ],
    hint: `Run the request in an effect keyed on the query. Create the controller inside the effect, pass \`controller.signal\` to \`search\`, and return \`() => controller.abort()\` as the cleanup: React calls it before the next query's effect and on unmount. In BOTH promise callbacks, first check \`controller.signal.aborted\` and do nothing if it is true.`,
    explanation: `Ignoring a stale response with a boolean flag fixes the screen, but the request itself keeps running and wasting bandwidth. \`AbortController\` cancels the work as well: the controller's \`signal\` goes to the request, and \`controller.abort()\` flips \`signal.aborted\` and tells the request to stop.

The effect lifecycle maps onto this exactly. One effect run equals one request. The effect creates a controller, starts the search and returns a cleanup that aborts. React runs that cleanup before the effect for the next query and when the component unmounts, so there is never more than one live request. For an empty query the effect resets the view and returns without starting anything, but the previous run's cleanup has already aborted the old request.

Cancelling has a side effect people forget: an aborted request rejects. A \`.catch\` that blindly shows an error turns every keystroke into a flash of \`Search failed\`. So both the success and the failure handler begin with \`if (controller.signal.aborted) return;\`. That one check covers rejections caused by the abort and also servers that ignore the signal and answer late.

The view is a single state object with a \`status\` (\`idle\`, \`loading\`, \`done\`, \`error\`), set to \`loading\` at the start of each run, which is what clears older results while a new request is pending. Each change costs one request.`,
    solution: `import React, { useState, useEffect } from 'react';

export default function CitySearch({ search }) {
  const [query, setQuery] = useState('');
  const [view, setView] = useState({ status: 'idle', cities: [] });

  useEffect(() => {
    if (query.trim() === '') {
      setView({ status: 'idle', cities: [] });
      return undefined;
    }
    const controller = new AbortController();
    setView({ status: 'loading', cities: [] });
    search(query, controller.signal).then(
      (cities) => {
        if (controller.signal.aborted) return;
        setView({ status: 'done', cities });
      },
      () => {
        if (controller.signal.aborted) return;
        setView({ status: 'error', cities: [] });
      }
    );
    return () => controller.abort();
  }, [query, search]);

  return (
    <div>
      <input aria-label="City" value={query} onChange={(e) => setQuery(e.target.value)} />
      {view.status === 'loading' && <p>Searching...</p>}
      {view.status === 'error' && <p role="alert">Search failed</p>}
      {view.status === 'done' && view.cities.length === 0 && <p>No cities found</p>}
      {view.status === 'done' && view.cities.length > 0 && (
        <ul>
          {view.cities.map((city) => <li key={city}>{city}</li>)}
        </ul>
      )}
    </div>
  );
}
`,
  },
  {
    id: 'react-door-state-machine',
    number: 89,
    title: 'Door Lock State Machine',
    difficulty: 'Easy',
    topic: 'State & Events',
    statement: `Build \`DoorControl({ initialState = 'closed' })\`, a door modelled as a small state machine with \`useReducer\`.

The door is always in exactly one of three states: \`open\`, \`closed\` or \`locked\`. Only these four moves are allowed:

- \`Open\`: from \`closed\` to \`open\`
- \`Close\`: from \`open\` to \`closed\`
- \`Lock\`: from \`closed\` to \`locked\`
- \`Unlock\`: from \`locked\` to \`closed\`

So a locked door cannot be opened directly, and an open door cannot be locked.

Render:
- \`<p data-testid="state">Door is <state></p>\`, for example \`Door is closed\`.
- Four buttons with the texts \`Open\`, \`Close\`, \`Lock\` and \`Unlock\`. A button is \`disabled\` whenever its move is not allowed in the current state.
- \`<p data-testid="moves">Moves: <n></p>\`, the number of moves made so far (starts at 0).

\`initialState\` is one of the three state names.`,
    componentName: 'DoorControl',
    starter: `import React, { useReducer } from 'react';

export default function DoorControl({ initialState = 'closed' }) {
  // TODO: a reducer that only allows the four legal moves
  return (
    <div>
      <p data-testid="state">Door is {initialState}</p>
      <button type="button">Open</button>
      <button type="button">Close</button>
      <button type="button">Lock</button>
      <button type="button">Unlock</button>
      <p data-testid="moves">Moves: 0</p>
    </div>
  );
}
`,
    previewProps: {"initialState": "closed"},
    tests: [
      {
        name: 'a closed door can be opened or locked, nothing else',
        code: `const { getByTestId, getByRole } = render({});
expect(getByTestId('state').textContent).toBe('Door is closed');
expect(getByTestId('moves').textContent).toBe('Moves: 0');
expect(getByRole('button', { name: 'Open' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Lock' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Close' })).toBeDisabled();
expect(getByRole('button', { name: 'Unlock' })).toBeDisabled();`,
      },
      {
        name: 'an open door can only be closed',
        code: `const { getByTestId, getByRole } = render({ initialState: 'closed' });
fireEvent.click(getByRole('button', { name: 'Open' }));
expect(getByTestId('state').textContent).toBe('Door is open');
expect(getByRole('button', { name: 'Close' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Open' })).toBeDisabled();
expect(getByRole('button', { name: 'Lock' })).toBeDisabled();
expect(getByRole('button', { name: 'Unlock' })).toBeDisabled();`,
      },
      {
        name: 'a locked door can only be unlocked',
        code: `const { getByTestId, getByRole } = render({ initialState: 'closed' });
fireEvent.click(getByRole('button', { name: 'Lock' }));
expect(getByTestId('state').textContent).toBe('Door is locked');
expect(getByRole('button', { name: 'Unlock' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Open' })).toBeDisabled();
expect(getByRole('button', { name: 'Close' })).toBeDisabled();
expect(getByRole('button', { name: 'Lock' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Unlock' }));
expect(getByTestId('state').textContent).toBe('Door is closed');`,
      },
      {
        name: 'counts every move through a full cycle',
        code: `const { getByTestId, getByRole } = render({ initialState: 'closed' });
fireEvent.click(getByRole('button', { name: 'Open' }));
fireEvent.click(getByRole('button', { name: 'Close' }));
fireEvent.click(getByRole('button', { name: 'Lock' }));
expect(getByTestId('moves').textContent).toBe('Moves: 3');
fireEvent.click(getByRole('button', { name: 'Unlock' }));
fireEvent.click(getByRole('button', { name: 'Open' }));
expect(getByTestId('state').textContent).toBe('Door is open');
expect(getByTestId('moves').textContent).toBe('Moves: 5');`,
      },
      {
        name: 'initialState picks the starting state',
        code: `const a = render({ initialState: 'locked' });
expect(a.getByTestId('state').textContent).toBe('Door is locked');
expect(a.getByRole('button', { name: 'Unlock' })).not.toBeDisabled();
expect(a.getByRole('button', { name: 'Open' })).toBeDisabled();
const b = render({ initialState: 'open' });
expect(b.getByTestId('state').textContent).toBe('Door is open');
expect(b.getByRole('button', { name: 'Close' })).not.toBeDisabled();
expect(b.getByRole('button', { name: 'Lock' })).toBeDisabled();
expect(b.getByTestId('moves').textContent).toBe('Moves: 0');`,
      },
    ],
    hint: `Write the rules as data: a table from state to the moves it allows and where each leads, for example \`closed: { Open: 'open', Lock: 'locked' }\`. The reducer looks the move up and returns the old state when there is no entry. The same table tells you which buttons to disable.`,
    explanation: `A state machine replaces a pile of booleans (\`isOpen\`, \`isLocked\`) that can contradict each other with one value that is always valid. The impossible combination "open and locked" cannot even be written down.

The rules live in a transition table, \`TRANSITIONS[state][move]\`, that gives the next state or \`undefined\`. The reducer looks the move up: if there is a next state it returns it with the move counter increased, otherwise it returns the previous state object unchanged, which makes React skip the re-render. Keeping the rule in the reducer means an illegal move is rejected no matter where it was dispatched from.

The buttons read the same table: a button is disabled when \`TRANSITIONS[state][move]\` is missing. Since the table is the single source of truth, the UI and the logic cannot drift apart, and adding a state or a move is a one-line change. A hand-written \`if\` chain such as "Open is allowed unless the door is already open" is where bugs like opening a locked door come from.

Every dispatch is an O(1) lookup.`,
    solution: `import React, { useReducer } from 'react';

const TRANSITIONS = {
  closed: { Open: 'open', Lock: 'locked' },
  open: { Close: 'closed' },
  locked: { Unlock: 'closed' },
};
const MOVES = ['Open', 'Close', 'Lock', 'Unlock'];

function doorReducer(state, move) {
  const next = TRANSITIONS[state.door][move];
  if (!next) return state;
  return { door: next, moves: state.moves + 1 };
}

export default function DoorControl({ initialState = 'closed' }) {
  const [state, dispatch] = useReducer(doorReducer, { door: initialState, moves: 0 });

  return (
    <div>
      <p data-testid="state">{'Door is ' + state.door}</p>
      {MOVES.map((move) => (
        <button key={move} type="button" disabled={!TRANSITIONS[state.door][move]} onClick={() => dispatch(move)}>
          {move}
        </button>
      ))}
      <p data-testid="moves">{'Moves: ' + state.moves}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-playlist-queue-reducer',
    number: 90,
    title: 'Playlist Queue Reducer',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`PlaylistQueue({ tracks })\` with ALL state changes in one \`useReducer\` reducer. \`tracks\` is the catalogue: an array of \`{ id, title }\` with unique ids and titles.

The state is a play queue (an ordered list of tracks) plus which queued track is the current one. The queue starts empty.

Render:
- Catalogue: for every track a button \`Queue <title>\`. It is \`disabled\` while that track is in the queue.
- Queue: one \`<li>\` per queued track, in queue order. Each \`<li>\` contains \`<span data-testid="queued"><title></span>\` and a button with \`aria-label="Remove <title>"\`. The \`<li>\` of the current track has \`aria-current="true"\`; the others have no \`aria-current\` attribute.
- \`<p data-testid="now">Now playing: <title of the current track></p>\`, or \`Now playing: nothing\` when the queue is empty.
- Buttons \`Previous\`, \`Next\` and \`Clear queue\`.

Actions:
- \`Queue <title>\` appends the track to the end of the queue. If the queue was empty, it becomes the current track; otherwise the current track does not change.
- \`Next\` makes the following track current. It is disabled when the current track is the last one or the queue is empty.
- \`Previous\` makes the preceding track current. It is disabled when the current track is the first one or the queue is empty.
- \`Remove <title>\` takes that track out of the queue:
  - removing a track that is NOT current never changes which track is playing, even when the removed track was earlier in the queue;
  - removing the current track makes the track that followed it current; if it was the last one, the new last track becomes current; if the queue is now empty nothing is playing.
- \`Clear queue\` empties the queue. It is disabled when the queue is empty.`,
    componentName: 'PlaylistQueue',
    starter: `import React, { useReducer } from 'react';

function queueReducer(state, action) {
  // TODO: handle queue / next / previous / remove / clear
  return state;
}

export default function PlaylistQueue({ tracks }) {
  const [state, dispatch] = useReducer(queueReducer, { queue: [], current: -1 });
  return (
    <div>
      {tracks.map((track) => (
        <button key={track.id} type="button">Queue {track.title}</button>
      ))}
      <p data-testid="now">Now playing: nothing</p>
      <button type="button" disabled>Previous</button>
      <button type="button" disabled>Next</button>
      <button type="button" disabled>Clear queue</button>
    </div>
  );
}
`,
    previewProps: {"tracks": [{"id": "t1", "title": "Blue Monday"}, {"id": "t2", "title": "Heroes"}, {"id": "t3", "title": "Hyperballad"}, {"id": "t4", "title": "Windowlicker"}]},
    tests: [
      {
        name: 'starts empty with the transport buttons disabled',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }, { id: 'c', title: 'Charlie' }];
const { container, getByTestId, getByRole } = render({ tracks });
expect(getByTestId('now').textContent).toBe('Now playing: nothing');
expect(container.querySelectorAll('[data-testid="queued"]')).toHaveLength(0);
expect(getByRole('button', { name: 'Previous' })).toBeDisabled();
expect(getByRole('button', { name: 'Next' })).toBeDisabled();
expect(getByRole('button', { name: 'Clear queue' })).toBeDisabled();
expect(getByRole('button', { name: 'Queue Bravo' })).not.toBeDisabled();`,
      },
      {
        name: 'queueing appends and the first queued track starts playing',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }, { id: 'c', title: 'Charlie' }];
const { container, getByTestId, getByRole } = render({ tracks });
const queued = () => Array.from(container.querySelectorAll('[data-testid="queued"]')).map((el) => el.textContent);
fireEvent.click(getByRole('button', { name: 'Queue Bravo' }));
fireEvent.click(getByRole('button', { name: 'Queue Alpha' }));
expect(queued()).toEqual(['Bravo', 'Alpha']);
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');
expect(getByRole('button', { name: 'Queue Bravo' })).toBeDisabled();
expect(getByRole('button', { name: 'Queue Alpha' })).toBeDisabled();
expect(getByRole('button', { name: 'Queue Charlie' })).not.toBeDisabled();
const current = container.querySelectorAll('li[aria-current]');
expect(current).toHaveLength(1);
expect(current[0].getAttribute('aria-current')).toBe('true');
expect(current[0]).toHaveTextContent('Bravo');
expect(getByRole('button', { name: 'Clear queue' })).not.toBeDisabled();`,
      },
      {
        name: 'Next and Previous walk the queue and stop at the ends',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }, { id: 'c', title: 'Charlie' }];
const { container, getByTestId, getByRole } = render({ tracks });
['Alpha', 'Bravo', 'Charlie'].forEach((t) => fireEvent.click(getByRole('button', { name: 'Queue ' + t })));
expect(getByRole('button', { name: 'Previous' })).toBeDisabled();
expect(getByRole('button', { name: 'Next' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');
expect(getByRole('button', { name: 'Previous' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('now').textContent).toBe('Now playing: Charlie');
expect(container.querySelector('li[aria-current="true"]')).toHaveTextContent('Charlie');
expect(getByRole('button', { name: 'Next' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Previous' }));
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');`,
      },
      {
        name: 'removing an earlier track keeps the same track playing',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }, { id: 'c', title: 'Charlie' }];
const { container, getByTestId, getByRole, getByLabelText } = render({ tracks });
const queued = () => Array.from(container.querySelectorAll('[data-testid="queued"]')).map((el) => el.textContent);
['Alpha', 'Bravo', 'Charlie'].forEach((t) => fireEvent.click(getByRole('button', { name: 'Queue ' + t })));
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.click(getByLabelText('Remove Alpha'));
expect(queued()).toEqual(['Bravo', 'Charlie']);
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');
expect(container.querySelector('li[aria-current="true"]')).toHaveTextContent('Bravo');
expect(getByRole('button', { name: 'Previous' })).toBeDisabled();
expect(getByRole('button', { name: 'Queue Alpha' })).not.toBeDisabled();
fireEvent.click(getByLabelText('Remove Charlie'));
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');
expect(getByRole('button', { name: 'Next' })).toBeDisabled();`,
      },
      {
        name: 'removing the current track hands over to the next, or the new last one',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }, { id: 'c', title: 'Charlie' }];
const { container, getByTestId, getByRole, getByLabelText } = render({ tracks });
['Alpha', 'Bravo', 'Charlie'].forEach((t) => fireEvent.click(getByRole('button', { name: 'Queue ' + t })));
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.click(getByLabelText('Remove Bravo'));
expect(getByTestId('now').textContent).toBe('Now playing: Charlie');
fireEvent.click(getByLabelText('Remove Charlie'));
expect(getByTestId('now').textContent).toBe('Now playing: Alpha');
expect(container.querySelectorAll('li[aria-current="true"]')).toHaveLength(1);
fireEvent.click(getByLabelText('Remove Alpha'));
expect(getByTestId('now').textContent).toBe('Now playing: nothing');
expect(container.querySelectorAll('[data-testid="queued"]')).toHaveLength(0);
expect(getByRole('button', { name: 'Clear queue' })).toBeDisabled();`,
      },
      {
        name: 'Clear queue empties everything and tracks can be queued again',
        code: `const tracks = [{ id: 'a', title: 'Alpha' }, { id: 'b', title: 'Bravo' }];
const { container, getByTestId, getByRole } = render({ tracks });
fireEvent.click(getByRole('button', { name: 'Queue Alpha' }));
fireEvent.click(getByRole('button', { name: 'Queue Bravo' }));
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.click(getByRole('button', { name: 'Clear queue' }));
expect(getByTestId('now').textContent).toBe('Now playing: nothing');
expect(container.querySelectorAll('[data-testid="queued"]')).toHaveLength(0);
expect(getByRole('button', { name: 'Queue Alpha' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Queue Bravo' }));
expect(getByTestId('now').textContent).toBe('Now playing: Bravo');
expect(getByRole('button', { name: 'Next' })).toBeDisabled();
expect(getByRole('button', { name: 'Previous' })).toBeDisabled();`,
      },
    ],
    hint: `If you store the current track as an INDEX, removing an earlier track shifts everything after it one place to the left, so the index has to move with it. Handle three cases in the \`remove\` branch: the removed position is before the current index, equal to it, or after it.`,
    explanation: `The queue and the "current" marker change together, which is the situation \`useReducer\` is for: one pure function receives the whole state and an action and returns the whole next state, so the two values can never be updated half-way.

The reference stores \`queue\` (an array of track ids) and \`current\` (an index, -1 when empty). Most actions are one-liners. \`remove\` is where the thinking happens, because an index is a position and positions shift when an earlier element disappears:

- removed position before \`current\`: everything moved left by one, so \`current - 1\` keeps the same track playing;
- removed position equal to \`current\`: keep the index, since the following track slid into this slot, but clamp it to the new last index (\`Math.min(current, queue.length - 1)\`), which also yields -1 for an empty queue;
- removed position after \`current\`: nothing to adjust.

Leaving the index alone in the first case is the classic bug: removing an earlier song silently skips to the next one.

Storing the current track's id instead of an index is a valid alternative. Then removal of other tracks needs no adjustment, but removing the current one has to look up its neighbour before filtering. Either way the reducer returns new arrays and never mutates the old state. Every action is O(n) in the queue length.`,
    solution: `import React, { useReducer } from 'react';

const EMPTY = { queue: [], current: -1 };

function queueReducer(state, action) {
  switch (action.type) {
    case 'queue': {
      if (state.queue.includes(action.id)) return state;
      return { queue: [...state.queue, action.id], current: state.current === -1 ? 0 : state.current };
    }
    case 'next':
      return state.current < state.queue.length - 1 ? { ...state, current: state.current + 1 } : state;
    case 'previous':
      return state.current > 0 ? { ...state, current: state.current - 1 } : state;
    case 'remove': {
      const at = state.queue.indexOf(action.id);
      if (at === -1) return state;
      const queue = state.queue.filter((id) => id !== action.id);
      let current = state.current;
      if (at < current) current -= 1;
      else if (at === current) current = Math.min(current, queue.length - 1);
      return { queue, current };
    }
    case 'clear':
      return EMPTY;
    default:
      return state;
  }
}

export default function PlaylistQueue({ tracks }) {
  const [state, dispatch] = useReducer(queueReducer, EMPTY);
  const byId = {};
  tracks.forEach((track) => { byId[track.id] = track; });
  const queued = state.queue.map((id) => byId[id]);
  const playing = state.current === -1 ? null : queued[state.current];

  return (
    <div>
      <div>
        {tracks.map((track) => (
          <button key={track.id} type="button" disabled={state.queue.includes(track.id)} onClick={() => dispatch({ type: 'queue', id: track.id })}>
            {'Queue ' + track.title}
          </button>
        ))}
      </div>
      <p data-testid="now">{'Now playing: ' + (playing ? playing.title : 'nothing')}</p>
      <ol>
        {queued.map((track, i) => (
          <li key={track.id} aria-current={i === state.current ? 'true' : undefined}>
            <span data-testid="queued">{track.title}</span>{' '}
            <button type="button" aria-label={'Remove ' + track.title} onClick={() => dispatch({ type: 'remove', id: track.id })}>x</button>
          </li>
        ))}
      </ol>
      <button type="button" disabled={state.current <= 0} onClick={() => dispatch({ type: 'previous' })}>Previous</button>
      <button type="button" disabled={state.current === -1 || state.current >= state.queue.length - 1} onClick={() => dispatch({ type: 'next' })}>Next</button>
      <button type="button" disabled={state.queue.length === 0} onClick={() => dispatch({ type: 'clear' })}>Clear queue</button>
    </div>
  );
}
`,
  },
  {
    id: 'react-locale-context-fallback',
    number: 91,
    title: 'Translations Through Context',
    difficulty: 'Easy',
    topic: 'Composition & Patterns',
    statement: `Build \`LocalizedApp({ messages, initialLocale = 'en' })\`, which shares the current language through React context so that deeply nested components can translate without receiving props.

\`messages\` maps a locale code to its translations, for example \`{ en: { greeting: 'Hello', farewell: 'Goodbye' }, es: { greeting: 'Hola' } }\`. It always contains \`en\`.

In the same file create a context, a provider that owns the current locale, and a hook \`useTranslate()\` that returns a function \`t(key)\`:
- \`t(key)\` returns the text for \`key\` in the current locale;
- if the current locale has no entry for \`key\`, it returns the \`en\` text;
- if \`en\` has none either, it returns the \`key\` itself.

\`LocalizedApp\` renders:
- One button per locale code, in the key order of \`messages\`, whose text is the code (\`en\`, \`es\`, ...). The button of the current locale has \`aria-pressed="true"\`, all others \`aria-pressed="false"\`. Clicking a button switches the locale.
- \`<h1 data-testid="greeting">\` with \`t('greeting')\`.
- \`<p data-testid="farewell">\` with \`t('farewell')\`.
- \`<p data-testid="tagline">\` with \`t('tagline')\`.

The three texts should come from small child components that call \`useTranslate()\` themselves and take no translation props.`,
    componentName: 'LocalizedApp',
    starter: `import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext(null);

function useTranslate() {
  // TODO: read the context and return t(key) with the en fallback
  return (key) => key;
}

function Greeting() {
  const t = useTranslate();
  return <h1 data-testid="greeting">{t('greeting')}</h1>;
}

export default function LocalizedApp({ messages, initialLocale = 'en' }) {
  // TODO: provide the locale, render one button per locale, the greeting, farewell and tagline
  return (
    <div>
      <Greeting />
    </div>
  );
}
`,
    previewProps: {"messages": {"en": {"greeting": "Hello", "farewell": "Goodbye", "tagline": "Learn every day"}, "es": {"greeting": "Hola", "farewell": "Adios"}, "fr": {"greeting": "Bonjour"}}, "initialLocale": "en"},
    tests: [
      {
        name: 'renders English by default with one button per locale',
        code: `const messages = { en: { greeting: 'Hello', farewell: 'Goodbye', tagline: 'Learn daily' }, es: { greeting: 'Hola', farewell: 'Adios', tagline: 'Aprende a diario' } };
const { getByTestId, getAllByRole, getByRole } = render({ messages });
expect(getByTestId('greeting').textContent).toBe('Hello');
expect(getByTestId('farewell').textContent).toBe('Goodbye');
expect(getByTestId('tagline').textContent).toBe('Learn daily');
expect(getAllByRole('button').map((b) => b.textContent)).toEqual(['en', 'es']);
expect(getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'es' })).toHaveAttribute('aria-pressed', 'false');`,
      },
      {
        name: 'switching the locale translates every consumer',
        code: `const messages = { en: { greeting: 'Hello', farewell: 'Goodbye', tagline: 'Learn daily' }, es: { greeting: 'Hola', farewell: 'Adios', tagline: 'Aprende a diario' } };
const { getByTestId, getByRole } = render({ messages });
fireEvent.click(getByRole('button', { name: 'es' }));
expect(getByTestId('greeting').textContent).toBe('Hola');
expect(getByTestId('farewell').textContent).toBe('Adios');
expect(getByTestId('tagline').textContent).toBe('Aprende a diario');
expect(getByRole('button', { name: 'es' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'en' })).toHaveAttribute('aria-pressed', 'false');
fireEvent.click(getByRole('button', { name: 'en' }));
expect(getByTestId('greeting').textContent).toBe('Hello');`,
      },
      {
        name: 'a key missing in the current locale falls back to English',
        code: `const messages = { en: { greeting: 'Hello', farewell: 'Goodbye', tagline: 'Learn daily' }, fr: { greeting: 'Bonjour' } };
const { getByTestId, getByRole } = render({ messages });
fireEvent.click(getByRole('button', { name: 'fr' }));
expect(getByTestId('greeting').textContent).toBe('Bonjour');
expect(getByTestId('farewell').textContent).toBe('Goodbye');
expect(getByTestId('tagline').textContent).toBe('Learn daily');`,
      },
      {
        name: 'a key missing everywhere shows the key itself',
        code: `const messages = { en: { greeting: 'Hello' }, de: { farewell: 'Tschuess' } };
const { getByTestId, getByRole } = render({ messages });
expect(getByTestId('farewell').textContent).toBe('farewell');
expect(getByTestId('tagline').textContent).toBe('tagline');
fireEvent.click(getByRole('button', { name: 'de' }));
expect(getByTestId('greeting').textContent).toBe('Hello');
expect(getByTestId('farewell').textContent).toBe('Tschuess');
expect(getByTestId('tagline').textContent).toBe('tagline');`,
      },
      {
        name: 'initialLocale picks the starting language',
        code: `const messages = { en: { greeting: 'Hello', farewell: 'Goodbye' }, es: { greeting: 'Hola', farewell: 'Adios' }, fr: { greeting: 'Bonjour' } };
const { getByTestId, getByRole, getAllByRole } = render({ messages, initialLocale: 'es' });
expect(getByTestId('greeting').textContent).toBe('Hola');
expect(getAllByRole('button').map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
expect(getByRole('button', { name: 'es' })).toHaveAttribute('aria-pressed', 'true');`,
      },
    ],
    hint: `Put \`{ locale, setLocale, messages }\` into the context value. \`useTranslate\` reads it and returns a function that tries \`messages[locale][key]\`, then \`messages.en[key]\`, then gives back \`key\`. Check for \`undefined\`, and remember that \`messages[locale]\` might not have the key at all.`,
    explanation: `Translation is the textbook case for context: almost every component needs it, and threading a \`t\` prop through every level would be noise. The provider sits at the top and owns one piece of state, the current locale. Consumers call a hook and stay unaware of where the data comes from.

\`useTranslate\` hides the context behind a small API. It builds \`t(key)\` as a lookup chain: the current locale's table, then the English table, then the key. Returning the key as a last resort keeps the screen readable and makes a missing translation easy to spot, where rendering \`undefined\` would show nothing at all. That missing fallback is the usual bug.

When a locale button calls \`setLocale\`, the provider re-renders with a new context value and React re-renders every component that reads the context, however deep it is, which is why the greeting, farewell and tagline all switch together. The buttons are consumers too: they read \`locale\` to set \`aria-pressed\`.

Each \`t\` call is at most two object lookups.`,
    solution: `import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext(null);

function LocaleProvider({ messages, initialLocale, children }) {
  const [locale, setLocale] = useState(initialLocale);
  return (
    <LocaleContext.Provider value={{ locale, setLocale, messages }}>
      {children}
    </LocaleContext.Provider>
  );
}

function useTranslate() {
  const { locale, messages } = useContext(LocaleContext);
  return function t(key) {
    const current = messages[locale] || {};
    if (current[key] !== undefined) return current[key];
    const fallback = messages.en || {};
    if (fallback[key] !== undefined) return fallback[key];
    return key;
  };
}

function LocaleSwitcher() {
  const { locale, setLocale, messages } = useContext(LocaleContext);
  return (
    <div>
      {Object.keys(messages).map((code) => (
        <button key={code} type="button" aria-pressed={code === locale ? 'true' : 'false'} onClick={() => setLocale(code)}>
          {code}
        </button>
      ))}
    </div>
  );
}

function Greeting() {
  const t = useTranslate();
  return <h1 data-testid="greeting">{t('greeting')}</h1>;
}

function Farewell() {
  const t = useTranslate();
  return <p data-testid="farewell">{t('farewell')}</p>;
}

function Tagline() {
  const t = useTranslate();
  return <p data-testid="tagline">{t('tagline')}</p>;
}

export default function LocalizedApp({ messages, initialLocale = 'en' }) {
  return (
    <LocaleProvider messages={messages} initialLocale={initialLocale}>
      <LocaleSwitcher />
      <Greeting />
      <Farewell />
      <Tagline />
    </LocaleProvider>
  );
}
`,
  },
  {
    id: 'react-toast-queue-context',
    number: 92,
    title: 'Toast Queue with Auto-Dismiss',
    difficulty: 'Hard',
    topic: 'Composition & Patterns',
    statement: `Build a toast notification system and a demo for it: \`ToastDemo({ duration = 3000, maxVisible = 3 })\`.

Structure (all in one file): a \`ToastProvider\` that owns the list of toasts and exposes \`addToast(message)\` and \`dismissToast(id)\` through context, a \`useToasts()\` hook, and a toast list rendered by the provider. The form below is a consumer that only calls \`addToast\`.

\`ToastDemo\` renders:
- A text input with \`aria-label="Message"\` and a button \`Show toast\`. Clicking the button adds a toast with the input's current text, trimmed. If the trimmed text is empty nothing happens. The input keeps its text.
- \`<p data-testid="toast-count">Toasts: <n></p>\` with the number of toasts on screen.
- One \`<div role="status">\` per toast, oldest first. Each contains \`<span data-testid="toast-message"><message></span>\` and a button with \`aria-label="Dismiss"\`.

Rules:
- Every toast removes itself \`duration\` ms after IT was added. Each toast has its own timer: adding or dismissing another toast must not restart or delay it.
- Clicking a toast's \`Dismiss\` button removes that toast immediately.
- At most \`maxVisible\` toasts are shown. Adding one more removes the oldest toast first.
- Two toasts may have the same message; they are still separate toasts.
- Clear all pending timers when the component unmounts.`,
    componentName: 'ToastDemo',
    starter: `import React, { createContext, useContext, useState, useReducer, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

export default function ToastDemo({ duration = 3000, maxVisible = 3 }) {
  const [text, setText] = useState('');
  // TODO: ToastProvider + useToasts, own timer per toast, maxVisible, Dismiss
  return (
    <div>
      <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button">Show toast</button>
      <p data-testid="toast-count">Toasts: 0</p>
    </div>
  );
}
`,
    previewProps: {"duration": 3000, "maxVisible": 3},
    tests: [
      {
        name: 'Show toast adds a status element with the trimmed message',
        code: `const { container, getByLabelText, getByRole, getByTestId, queryByRole } = render({ duration: 1000, maxVisible: 3 });
const messages = () => Array.from(container.querySelectorAll('[role="status"] [data-testid="toast-message"]')).map((el) => el.textContent);
expect(queryByRole('status')).toBeNull();
expect(getByTestId('toast-count').textContent).toBe('Toasts: 0');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(messages()).toEqual([]);
fireEvent.change(getByLabelText('Message'), '   ');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(messages()).toEqual([]);
fireEvent.change(getByLabelText('Message'), '  Saved  ');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(messages()).toEqual(['Saved']);
expect(getByTestId('toast-count').textContent).toBe('Toasts: 1');
expect(getByLabelText('Message').value).toBe('  Saved  ');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(messages()).toEqual(['Saved', 'Saved']);`,
      },
      {
        name: 'a toast disappears by itself after the duration',
        code: `const { container, getByLabelText, getByRole, getByTestId } = render({ duration: 30, maxVisible: 3 });
fireEvent.change(getByLabelText('Message'), 'Saved');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(container.querySelectorAll('[role="status"]')).toHaveLength(1);
await waitFor(() => expect(container.querySelectorAll('[role="status"]')).toHaveLength(0));
expect(getByTestId('toast-count').textContent).toBe('Toasts: 0');`,
      },
      {
        name: 'Dismiss removes only that toast',
        code: `const { container, getByLabelText, getByRole, getAllByRole, getByTestId } = render({ duration: 1000, maxVisible: 5 });
const messages = () => Array.from(container.querySelectorAll('[role="status"] [data-testid="toast-message"]')).map((el) => el.textContent);
['One', 'Two', 'Three'].forEach((m) => { fireEvent.change(getByLabelText('Message'), m); fireEvent.click(getByRole('button', { name: 'Show toast' })); });
expect(messages()).toEqual(['One', 'Two', 'Three']);
const second = getAllByRole('status')[1];
fireEvent.click(within(second).getByLabelText('Dismiss'));
expect(messages()).toEqual(['One', 'Three']);
expect(getByTestId('toast-count').textContent).toBe('Toasts: 2');
fireEvent.click(within(getAllByRole('status')[0]).getByLabelText('Dismiss'));
expect(messages()).toEqual(['Three']);`,
      },
      {
        name: 'never shows more than maxVisible, dropping the oldest',
        code: `const { container, getByLabelText, getByRole, getByTestId } = render({ duration: 1000, maxVisible: 2 });
const messages = () => Array.from(container.querySelectorAll('[role="status"] [data-testid="toast-message"]')).map((el) => el.textContent);
['One', 'Two', 'Three', 'Four'].forEach((m) => { fireEvent.change(getByLabelText('Message'), m); fireEvent.click(getByRole('button', { name: 'Show toast' })); });
expect(messages()).toEqual(['Three', 'Four']);
expect(getByTestId('toast-count').textContent).toBe('Toasts: 2');`,
      },
      {
        name: 'each toast keeps its own timer when another one is added',
        code: `const { container, getByLabelText, getByRole } = render({ duration: 100, maxVisible: 3 });
const messages = () => Array.from(container.querySelectorAll('[role="status"] [data-testid="toast-message"]')).map((el) => el.textContent);
fireEvent.change(getByLabelText('Message'), 'First');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
await sleep(60);
fireEvent.change(getByLabelText('Message'), 'Second');
fireEvent.click(getByRole('button', { name: 'Show toast' }));
expect(messages()).toEqual(['First', 'Second']);
await sleep(60);
expect(messages()).toEqual(['Second']);
await waitFor(() => expect(messages()).toEqual([]));`,
      },
      {
        name: 'dismissing one toast does not cancel the timers of the others',
        code: `const { container, getByLabelText, getByRole, getAllByRole } = render({ duration: 40, maxVisible: 3 });
['One', 'Two', 'Three'].forEach((m) => { fireEvent.change(getByLabelText('Message'), m); fireEvent.click(getByRole('button', { name: 'Show toast' })); });
fireEvent.click(within(getAllByRole('status')[0]).getByLabelText('Dismiss'));
expect(container.querySelectorAll('[role="status"]')).toHaveLength(2);
await waitFor(() => expect(container.querySelectorAll('[role="status"]')).toHaveLength(0));`,
      },
    ],
    hint: `Give every toast a unique id (a counter in a ref is enough). The simplest way to get one timer per toast is to make each toast its own component: its \`useEffect\` starts a \`setTimeout\` that dismisses its id and returns \`clearTimeout\` as cleanup. One shared effect that depends on the whole list gets cancelled and restarted every time the list changes.`,
    explanation: `There are three parts: who owns the list, how consumers reach it, and who owns the timers.

Ownership and access: the provider keeps the list in a reducer (\`add\` appends and trims to the newest \`maxVisible\`, \`dismiss\` filters by id) and publishes \`addToast\` and \`dismissToast\` through context. Any component, however deep, can raise a toast with \`useToasts().addToast('Saved')\` and knows nothing about rendering or timing. Ids come from a counter in a ref, because messages can repeat and array indexes shift as toasts leave.

Timers are where implementations go wrong. A single effect in the provider that depends on the list, something like "after \`duration\`, remove the oldest", is torn down and restarted on every change, so a new toast extends the life of all older ones. The reference instead renders each toast as its own \`ToastItem\` component whose effect starts one timeout for its own id. React keys keep that component instance alive while other toasts come and go, so its timer is never touched. When the toast is removed for any reason (timeout, Dismiss, pushed out by \`maxVisible\`, the whole tree unmounting) its cleanup clears the timeout. That one mechanism satisfies every timer rule.

\`dismissToast\` is created with \`useCallback\` so its identity is stable and the item effects do not re-run. Adding and dismissing are O(n) in the number of visible toasts.`,
    solution: `import React, { createContext, useContext, useState, useReducer, useEffect, useRef, useCallback } from 'react';

const ToastContext = createContext(null);

function toastReducer(toasts, action) {
  switch (action.type) {
    case 'add': {
      const next = [...toasts, action.toast];
      return next.length > action.max ? next.slice(next.length - action.max) : next;
    }
    case 'dismiss':
      return toasts.filter((toast) => toast.id !== action.id);
    default:
      return toasts;
  }
}

function ToastItem({ toast, duration, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div role="status">
      <span data-testid="toast-message">{toast.message}</span>{' '}
      <button type="button" aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>x</button>
    </div>
  );
}

function ToastProvider({ duration, maxVisible, children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextId = useRef(1);

  const addToast = useCallback((message) => {
    const id = nextId.current;
    nextId.current += 1;
    dispatch({ type: 'add', toast: { id, message }, max: maxVisible });
  }, [maxVisible]);

  const dismissToast = useCallback((id) => dispatch({ type: 'dismiss', id }), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast }}>
      {children}
      <div>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} duration={duration} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToasts() {
  return useContext(ToastContext);
}

function ToastForm() {
  const { toasts, addToast } = useToasts();
  const [text, setText] = useState('');

  function show() {
    const message = text.trim();
    if (message === '') return;
    addToast(message);
  }

  return (
    <div>
      <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" onClick={show}>Show toast</button>
      <p data-testid="toast-count">{'Toasts: ' + toasts.length}</p>
    </div>
  );
}

export default function ToastDemo({ duration = 3000, maxVisible = 3 }) {
  return (
    <ToastProvider duration={duration} maxVisible={maxVisible}>
      <ToastForm />
    </ToastProvider>
  );
}
`,
  },
  {
    id: 'react-reveal-search-focus',
    number: 93,
    title: 'Reveal a Search Field and Manage Focus',
    difficulty: 'Easy',
    topic: 'Performance & Hooks',
    statement: `Build \`SearchReveal()\`, a search field that is hidden behind a button and handles keyboard focus properly.

Closed (the initial state):
- Render a button \`Search\`. There is no \`<input>\` in the DOM.
- On the first mount the component must NOT move focus anywhere. The \`Search\` button is not focused automatically.

Open (after clicking \`Search\`):
- Render a text input with \`aria-label="Search query"\` and a button \`Cancel\`. The \`Search\` button is not rendered.
- The input receives focus automatically as soon as it appears (\`document.activeElement\` is the input).

Closing:
- Clicking \`Cancel\`, or pressing the \`Escape\` key while the input has focus, closes the field.
- After closing, focus returns to the \`Search\` button (\`document.activeElement\` is that button).
- The typed text is discarded: opening again shows an empty input.`,
    componentName: 'SearchReveal',
    starter: `import React, { useState, useRef, useEffect } from 'react';

export default function SearchReveal() {
  const [open, setOpen] = useState(false);
  // TODO: focus the input when it appears, return focus to the button when it closes
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Search</button>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'starts closed without stealing focus',
        code: `const { container, getByRole, queryByRole } = render({});
expect(getByRole('button', { name: 'Search' })).toBeTruthy();
expect(container.querySelector('input')).toBeNull();
expect(queryByRole('button', { name: 'Cancel' })).toBeNull();
expect(document.activeElement === getByRole('button', { name: 'Search' })).toBe(false);`,
      },
      {
        name: 'clicking Search shows the input and focuses it',
        code: `const { getByRole, getByLabelText, queryByRole } = render({});
fireEvent.click(getByRole('button', { name: 'Search' }));
const input = getByLabelText('Search query');
expect(document.activeElement === input).toBe(true);
expect(queryByRole('button', { name: 'Search' })).toBeNull();
expect(getByRole('button', { name: 'Cancel' })).toBeTruthy();`,
      },
      {
        name: 'Escape closes the field and returns focus to the Search button',
        code: `const { container, getByRole, getByLabelText } = render({});
fireEvent.click(getByRole('button', { name: 'Search' }));
fireEvent.keyDown(getByLabelText('Search query'), 'a');
expect(container.querySelector('input')).toBeTruthy();
fireEvent.keyDown(getByLabelText('Search query'), 'Escape');
expect(container.querySelector('input')).toBeNull();
expect(document.activeElement === getByRole('button', { name: 'Search' })).toBe(true);`,
      },
      {
        name: 'Cancel closes the field and returns focus too',
        code: `const { container, getByRole } = render({});
fireEvent.click(getByRole('button', { name: 'Search' }));
fireEvent.click(getByRole('button', { name: 'Cancel' }));
expect(container.querySelector('input')).toBeNull();
expect(document.activeElement === getByRole('button', { name: 'Search' })).toBe(true);`,
      },
      {
        name: 'reopening shows an empty, focused input',
        code: `const { getByRole, getByLabelText } = render({});
fireEvent.click(getByRole('button', { name: 'Search' }));
fireEvent.change(getByLabelText('Search query'), 'react hooks');
expect(getByLabelText('Search query').value).toBe('react hooks');
fireEvent.click(getByRole('button', { name: 'Cancel' }));
fireEvent.click(getByRole('button', { name: 'Search' }));
expect(getByLabelText('Search query').value).toBe('');
expect(document.activeElement === getByLabelText('Search query')).toBe(true);`,
      },
    ],
    hint: `An element can only be focused after it exists in the DOM, so focus belongs in an effect that runs after the render that changed \`open\`. That effect also runs on the very first render, when \`open\` is false: you need a way to tell "just mounted" apart from "just closed", for example a ref that remembers whether the field has ever been open.`,
    explanation: `Focus is imperative: there is no "focused" prop, you call \`element.focus()\` on a DOM node, which React hands you through a ref. The node only exists after React has committed the render, so the call goes into \`useEffect\`, not into the click handler that merely requested the state change.

One effect keyed on \`open\` covers both directions. When \`open\` became true the input has just been mounted, so focus it. When \`open\` became false the button has just been mounted again, so focus that. This keeps keyboard and screen-reader users oriented: without it, closing the field removes the focused element and focus falls back to the page body.

The trap is the first render. Effects also run after mount, and at that moment \`open\` is false, so a naive effect focuses the \`Search\` button the instant the component appears and steals focus from whatever the user was doing. The reference keeps a \`wasOpen\` ref and only returns focus when the field really was open before.

Discarding the text is done by resetting the query state when closing. Because the input is unmounted while closed, keeping its text in the input's own DOM state would also lose it. All of this is O(1).`,
    solution: `import React, { useState, useRef, useEffect } from 'react';

export default function SearchReveal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      inputRef.current.focus();
    } else if (wasOpen.current) {
      buttonRef.current.focus();
    }
    wasOpen.current = open;
  }, [open]);

  function close() {
    setOpen(false);
    setQuery('');
  }

  if (!open) {
    return (
      <div>
        <button type="button" ref={buttonRef} onClick={() => setOpen(true)}>Search</button>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={inputRef}
        aria-label="Search query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
      />
      <button type="button" onClick={close}>Cancel</button>
    </div>
  );
}
`,
  },
  {
    id: 'react-one-time-code-boxes',
    number: 94,
    title: 'One-Time Code Boxes',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`CodeInput({ length = 4, onComplete })\`, the row of single-digit boxes used for verification codes, with focus that follows the user.

Render:
- \`length\` text inputs. Box number i (1-based) has \`aria-label="Digit i"\`, so \`Digit 1\`, \`Digit 2\`, and so on. Give each \`maxLength={1}\`.
- \`<p data-testid="code">Code: <display></p>\` where the display has one character per box: the digit, or \`_\` for an empty box. With 4 boxes and digits 1 and 2 entered it reads \`Code: 12__\`.

Focus and input rules:
- On mount, \`Digit 1\` is focused.
- When a change event gives a box a single digit (\`0\` to \`9\`), store it and move focus to the next box. The last box keeps focus.
- Any other non-empty text (a letter, a symbol) is rejected: the box keeps its previous content and focus does not move.
- When a change event makes a box empty (the user deleted the digit), clear that box. Focus stays there.
- Pressing \`Backspace\` (keydown) in a box that is EMPTY moves focus to the previous box and clears that previous box. In \`Digit 1\` it does nothing.

Completion:
- Whenever a change fills the last empty box, call \`onComplete(code)\` with all digits joined into one string, for example \`onComplete('1234')\`. If the user then changes a digit and the code becomes complete again, call it again with the new code. \`onComplete\` is optional.`,
    componentName: 'CodeInput',
    starter: `import React, { useState, useRef, useEffect } from 'react';

export default function CodeInput({ length = 4, onComplete }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  // TODO: focus handling, digit validation, Backspace, onComplete
  return (
    <div>
      {digits.map((digit, i) => (
        <input key={i} aria-label={'Digit ' + (i + 1)} maxLength={1} value={digit} onChange={() => {}} />
      ))}
      <p data-testid="code">Code: {digits.map((d) => d || '_').join('')}</p>
    </div>
  );
}
`,
    previewProps: {"length": 4},
    previewSetup: `return { onComplete: (code) => console.log('code entered', code) };`,
    tests: [
      {
        name: 'renders one box per digit and focuses the first',
        code: `const { container, getByLabelText, getByTestId } = render({ length: 6 });
expect(container.querySelectorAll('input')).toHaveLength(6);
expect(getByLabelText('Digit 6')).toBeTruthy();
expect(document.activeElement === getByLabelText('Digit 1')).toBe(true);
expect(getByTestId('code').textContent).toBe('Code: ______');`,
      },
      {
        name: 'typing a digit stores it and moves focus to the next box',
        code: `const { getByLabelText, getByTestId } = render({ length: 4 });
fireEvent.change(getByLabelText('Digit 1'), '4');
expect(getByLabelText('Digit 1').value).toBe('4');
expect(document.activeElement === getByLabelText('Digit 2')).toBe(true);
fireEvent.change(getByLabelText('Digit 2'), '0');
expect(document.activeElement === getByLabelText('Digit 3')).toBe(true);
expect(getByTestId('code').textContent).toBe('Code: 40__');`,
      },
      {
        name: 'anything that is not a digit is rejected',
        code: `const calls = [];
const { getByLabelText, getByTestId } = render({ length: 4, onComplete: (c) => calls.push(c) });
fireEvent.change(getByLabelText('Digit 1'), 'x');
expect(getByLabelText('Digit 1').value).toBe('');
expect(document.activeElement === getByLabelText('Digit 1')).toBe(true);
fireEvent.change(getByLabelText('Digit 1'), ' ');
fireEvent.change(getByLabelText('Digit 1'), '-');
expect(getByLabelText('Digit 1').value).toBe('');
expect(getByTestId('code').textContent).toBe('Code: ____');
expect(calls).toEqual([]);`,
      },
      {
        name: 'calls onComplete once with the whole code and keeps focus on the last box',
        code: `const calls = [];
const { getByLabelText, getByTestId } = render({ length: 4, onComplete: (c) => calls.push(c) });
['1', '2', '3'].forEach((d, i) => fireEvent.change(getByLabelText('Digit ' + (i + 1)), d));
expect(calls).toEqual([]);
fireEvent.change(getByLabelText('Digit 4'), '4');
expect(calls).toEqual(['1234']);
expect(getByTestId('code').textContent).toBe('Code: 1234');
expect(document.activeElement === getByLabelText('Digit 4')).toBe(true);`,
      },
      {
        name: 'Backspace in an empty box goes back and clears the previous digit',
        code: `const { getByLabelText, getByTestId } = render({ length: 4 });
fireEvent.change(getByLabelText('Digit 1'), '1');
fireEvent.change(getByLabelText('Digit 2'), '2');
expect(document.activeElement === getByLabelText('Digit 3')).toBe(true);
fireEvent.keyDown(getByLabelText('Digit 3'), 'Backspace');
expect(document.activeElement === getByLabelText('Digit 2')).toBe(true);
expect(getByLabelText('Digit 2').value).toBe('');
expect(getByTestId('code').textContent).toBe('Code: 1___');
fireEvent.keyDown(getByLabelText('Digit 2'), 'Backspace');
expect(document.activeElement === getByLabelText('Digit 1')).toBe(true);
expect(getByTestId('code').textContent).toBe('Code: ____');
fireEvent.keyDown(getByLabelText('Digit 1'), 'Backspace');
expect(document.activeElement === getByLabelText('Digit 1')).toBe(true);`,
      },
      {
        name: 'deleting a digit and completing again reports the new code',
        code: `const calls = [];
const { getByLabelText, getByTestId } = render({ length: 3, onComplete: (c) => calls.push(c) });
['7', '8', '9'].forEach((d, i) => fireEvent.change(getByLabelText('Digit ' + (i + 1)), d));
fireEvent.change(getByLabelText('Digit 3'), '');
expect(getByTestId('code').textContent).toBe('Code: 78_');
expect(document.activeElement === getByLabelText('Digit 3')).toBe(true);
fireEvent.change(getByLabelText('Digit 3'), '5');
expect(calls).toEqual(['789', '785']);`,
      },
    ],
    hint: `Keep the digits in one array in state and the input DOM nodes in one ref holding an array (\`inputsRef.current[i] = node\`). In the change handler, compute the next array, set it, then call \`.focus()\` on the neighbour directly. \`Backspace\` on a filled box already produces a change event with an empty value, so \`onKeyDown\` only has to handle the empty-box case.`,
    explanation: `The component is a controlled array plus imperative focus moves.

State: one array of strings, one entry per box. Each input is controlled by its slot, so a rejected character never shows up: the handler simply does not update state and React restores the old value. Validation is a regular expression for exactly one digit, \`/^[0-9]$/\`.

Refs: focus has to jump between sibling inputs, so the component needs their DOM nodes. A single \`useRef([])\` filled by callback refs (\`ref={(node) => { inputs.current[i] = node; }}\`) scales to any \`length\`; you cannot call \`useRef\` in a loop. The neighbours already exist in the DOM, so the handler can focus them directly without waiting for an effect. Only the initial focus on mount needs \`useEffect\`.

Backspace has two cases that are easy to confuse. In a filled box the browser deletes the character and fires a change event with an empty value, which the change handler treats as "clear this box". In an empty box no change event fires at all, so \`onKeyDown\` handles it: clear the previous box and focus it. Moving back without clearing forces the user to press Backspace twice per digit.

Completion is checked in the change handler on the freshly computed array (\`next.every(Boolean)\`), not on the state variable, which still holds the old digits at that point. Work per keystroke is O(length).`,
    solution: `import React, { useState, useRef, useEffect } from 'react';

export default function CodeInput({ length = 4, onComplete }) {
  const [digits, setDigits] = useState(() => Array(length).fill(''));
  const inputs = useRef([]);

  useEffect(() => {
    if (inputs.current[0]) inputs.current[0].focus();
  }, []);

  function handleChange(index, value) {
    if (value !== '' && !/^[0-9]$/.test(value)) return;
    const next = digits.slice();
    next[index] = value;
    setDigits(next);
    if (value === '') return;
    if (index < length - 1) inputs.current[index + 1].focus();
    if (next.every((d) => d !== '') && onComplete) onComplete(next.join(''));
  }

  function handleKeyDown(index, event) {
    if (event.key !== 'Backspace' || digits[index] !== '' || index === 0) return;
    const next = digits.slice();
    next[index - 1] = '';
    setDigits(next);
    inputs.current[index - 1].focus();
  }

  return (
    <div>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(node) => { inputs.current[i] = node; }}
          aria-label={'Digit ' + (i + 1)}
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          style={{ width: 32, textAlign: 'center', marginRight: 6 }}
        />
      ))}
      <p data-testid="code">{'Code: ' + digits.map((d) => d || '_').join('')}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-imperative-handle-pin-field',
    number: 95,
    title: 'Imperative Handle on a Custom Field',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`PinField\`, a text field that a parent component can command through a ref without getting access to the DOM node. Define it with \`forwardRef\`:

\`const PinField = forwardRef(function PinField({ label }, ref) { ... })\`

Render:
- A text input with \`aria-label\` equal to the \`label\` prop, empty at first.
- \`<p data-testid="length">Length: <n></p>\` with the number of characters currently in the input.

Expose EXACTLY three methods on the ref with \`useImperativeHandle\`:
- \`focus()\` focuses the input.
- \`clear()\` empties the input (so \`Length: 0\`) and focuses it.
- \`getValue()\` returns the text that is in the input right now, including text typed after the component mounted.

Rules:
- \`ref.current\` must be the object with those three methods, NOT the \`<input>\` element. The parent should not be able to reach \`tagName\`, \`value\`, \`style\` and the like.
- The field does not focus itself on mount.

(In the tests a parent creates \`const ref = React.createRef()\`, renders \`<PinField label="PIN" ref={ref} />\` and calls the methods.)`,
    componentName: 'PinField',
    starter: `import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const PinField = forwardRef(function PinField({ label }, ref) {
  const [value, setValue] = useState('');
  // TODO: expose { focus, clear, getValue } through the ref
  return (
    <div>
      <input aria-label={label} value={value} onChange={(e) => setValue(e.target.value)} />
      <p data-testid="length">Length: {value.length}</p>
    </div>
  );
});

export default PinField;
`,
    previewProps: {"label": "PIN"},
    tests: [
      {
        name: 'the ref exposes exactly focus, clear and getValue, not the DOM node',
        code: `const ref = React.createRef();
const { getByLabelText, getByTestId } = render({ label: 'PIN', ref });
expect(getByLabelText('PIN').value).toBe('');
expect(getByTestId('length').textContent).toBe('Length: 0');
expect(ref.current).toBeTruthy();
expect(Object.keys(ref.current).sort()).toEqual(['clear', 'focus', 'getValue']);
expect(typeof ref.current.focus).toBe('function');
expect(typeof ref.current.clear).toBe('function');
expect(typeof ref.current.getValue).toBe('function');
expect(ref.current.tagName).toBeUndefined();
expect(ref.current === getByLabelText('PIN')).toBe(false);`,
      },
      {
        name: 'focus() focuses the input, which is not focused on mount',
        code: `const ref = React.createRef();
const { getByLabelText } = render({ label: 'Card PIN', ref });
expect(document.activeElement === getByLabelText('Card PIN')).toBe(false);
act(() => { ref.current.focus(); });
expect(document.activeElement === getByLabelText('Card PIN')).toBe(true);`,
      },
      {
        name: 'getValue() returns what is currently typed',
        code: `const ref = React.createRef();
const { getByLabelText, getByTestId } = render({ label: 'PIN', ref });
expect(ref.current.getValue()).toBe('');
fireEvent.change(getByLabelText('PIN'), '12');
expect(ref.current.getValue()).toBe('12');
fireEvent.change(getByLabelText('PIN'), '1234');
expect(ref.current.getValue()).toBe('1234');
expect(getByTestId('length').textContent).toBe('Length: 4');`,
      },
      {
        name: 'clear() empties the field and focuses it',
        code: `const ref = React.createRef();
const { getByLabelText, getByTestId } = render({ label: 'PIN', ref });
fireEvent.change(getByLabelText('PIN'), '9876');
expect(getByTestId('length').textContent).toBe('Length: 4');
act(() => { ref.current.clear(); });
expect(getByLabelText('PIN').value).toBe('');
expect(getByTestId('length').textContent).toBe('Length: 0');
expect(ref.current.getValue()).toBe('');
expect(document.activeElement === getByLabelText('PIN')).toBe(true);`,
      },
      {
        name: 'the handle keeps working after clear and more typing',
        code: `const ref = React.createRef();
const { getByLabelText, getByTestId } = render({ label: 'PIN', ref });
fireEvent.change(getByLabelText('PIN'), '11');
act(() => { ref.current.clear(); });
fireEvent.change(getByLabelText('PIN'), '222');
expect(ref.current.getValue()).toBe('222');
expect(getByTestId('length').textContent).toBe('Length: 3');
expect(Object.keys(ref.current).sort()).toEqual(['clear', 'focus', 'getValue']);`,
      },
    ],
    hint: `Keep a private \`inputRef\` for the real DOM node and pass the parent's \`ref\` only to \`useImperativeHandle(ref, () => ({ ... }), deps)\`. If \`getValue\` reads a state variable, that variable must be in the dependency list, otherwise the handle keeps returning the value from the render in which it was created.`,
    explanation: `Normally data flows down through props. Sometimes a parent needs to trigger an action that is not state, such as "focus yourself", and a ref is the right tool. Forwarding the ref straight to the \`<input>\` works, but hands the parent the whole DOM node: it can change styles, read anything, and it now depends on your component being implemented with exactly that element.

\`useImperativeHandle\` lets the component publish a small, deliberate API instead. The component keeps its own \`inputRef\` for the DOM node, and tells React "when a parent asks for my ref, give it this object". The parent sees three functions and nothing else.

The detail that bites is the dependency list. The handle object is created by a function that closes over the current render's variables. With \`[]\` as dependencies it is created once, and a \`getValue\` that returns the \`value\` state variable would return the empty string forever. Listing \`[value]\` rebuilds the handle when the text changes. Reading from the DOM node (\`inputRef.current.value\`) or from a ref is another way to stay current.

\`clear()\` combines a state update with a focus call. The focus can happen immediately because the input already exists. Every method is O(1).`,
    solution: `import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const PinField = forwardRef(function PinField({ label }, ref) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      setValue('');
      inputRef.current.focus();
    },
    getValue() {
      return value;
    },
  }), [value]);

  return (
    <div>
      <input ref={inputRef} aria-label={label} value={value} onChange={(e) => setValue(e.target.value)} />
      <p data-testid="length">{'Length: ' + value.length}</p>
    </div>
  );
});

export default PinField;
`,
  },
  {
    id: 'react-memo-rows-render-spy',
    number: 96,
    title: 'Only the Changed Row Re-renders',
    difficulty: 'Hard',
    topic: 'Performance & Hooks',
    statement: `Build \`GuestList({ initialGuests, onRowRender })\`, a list that stays fast because a row only re-renders when ITS guest changes. \`initialGuests\` is an array of \`{ id, name, attending }\` with unique ids and names.

Render:
- One row per guest, in order. A row contains \`<span data-testid="status-<id>">\` reading \`<name>: attending\` or \`<name>: not attending\`, and a button with \`aria-label="Toggle <name>"\` that flips that guest's \`attending\`.
- \`<p data-testid="summary">Attending: <count> of <total></p>\`.
- A text input with \`aria-label="Note"\` whose text lives in the state of \`GuestList\` itself (the same component that owns the guests).

Measuring renders: each row must be its own component, and that component must call \`onRowRender(guest.id)\` at the top of its body, unconditionally, every time it renders. \`onRowRender\` is a spy supplied by the tests; its identity never changes.

Requirements:
- After mounting, \`onRowRender\` has been called exactly once per guest.
- Typing in the Note input must not render any row again.
- Toggling a guest must render ONLY that guest's row again (exactly one more \`onRowRender\` call, with that id).
- Toggling must stay correct over several clicks on different rows: earlier toggles are never lost.`,
    componentName: 'GuestList',
    starter: `import React, { useState, useCallback, memo } from 'react';

function GuestRow({ guest, onToggle, onRowRender }) {
  onRowRender(guest.id);
  return (
    <li>
      <span data-testid={'status-' + guest.id}>{guest.name}: {guest.attending ? 'attending' : 'not attending'}</span>
      <button type="button" aria-label={'Toggle ' + guest.name} onClick={() => onToggle(guest.id)}>Toggle</button>
    </li>
  );
}

export default function GuestList({ initialGuests, onRowRender }) {
  const [guests, setGuests] = useState(initialGuests);
  const [note, setNote] = useState('');
  // TODO: toggling, the summary, and rows that skip unnecessary renders
  return (
    <div>
      <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <ul>
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} onToggle={() => {}} onRowRender={onRowRender} />
        ))}
      </ul>
      <p data-testid="summary">Attending: 0 of {guests.length}</p>
    </div>
  );
}
`,
    previewProps: {"initialGuests": [{"id": 1, "name": "Ada", "attending": true}, {"id": 2, "name": "Linus", "attending": false}, {"id": 3, "name": "Grace", "attending": false}]},
    previewSetup: `return { onRowRender: (id) => console.log('row rendered', id) };`,
    tests: [
      {
        name: 'renders every guest once, with the summary',
        code: `const renders = [];
const guests = [{ id: 1, name: 'Ada', attending: true }, { id: 2, name: 'Linus', attending: false }, { id: 3, name: 'Grace', attending: true }];
const { getByTestId } = render({ initialGuests: guests, onRowRender: (id) => renders.push(id) });
expect(getByTestId('status-1').textContent).toBe('Ada: attending');
expect(getByTestId('status-2').textContent).toBe('Linus: not attending');
expect(getByTestId('status-3').textContent).toBe('Grace: attending');
expect(getByTestId('summary').textContent).toBe('Attending: 2 of 3');
expect(renders.slice().sort()).toEqual([1, 2, 3]);`,
      },
      {
        name: 'toggling flips the status and the summary',
        code: `const guests = [{ id: 1, name: 'Ada', attending: true }, { id: 2, name: 'Linus', attending: false }];
const { getByTestId, getByLabelText } = render({ initialGuests: guests, onRowRender: () => {} });
fireEvent.click(getByLabelText('Toggle Linus'));
expect(getByTestId('status-2').textContent).toBe('Linus: attending');
expect(getByTestId('summary').textContent).toBe('Attending: 2 of 2');
fireEvent.click(getByLabelText('Toggle Ada'));
fireEvent.click(getByLabelText('Toggle Linus'));
expect(getByTestId('status-1').textContent).toBe('Ada: not attending');
expect(getByTestId('status-2').textContent).toBe('Linus: not attending');
expect(getByTestId('summary').textContent).toBe('Attending: 0 of 2');`,
      },
      {
        name: 'typing a note does not re-render any row',
        code: `const renders = [];
const guests = [{ id: 1, name: 'Ada', attending: true }, { id: 2, name: 'Linus', attending: false }, { id: 3, name: 'Grace', attending: true }];
const { getByLabelText } = render({ initialGuests: guests, onRowRender: (id) => renders.push(id) });
expect(renders).toHaveLength(3);
fireEvent.change(getByLabelText('Note'), 'B');
fireEvent.change(getByLabelText('Note'), 'Bring');
fireEvent.change(getByLabelText('Note'), 'Bring cake');
expect(getByLabelText('Note').value).toBe('Bring cake');
expect(renders).toHaveLength(3);`,
      },
      {
        name: 'toggling one guest re-renders only that row',
        code: `const renders = [];
const guests = [{ id: 1, name: 'Ada', attending: true }, { id: 2, name: 'Linus', attending: false }, { id: 3, name: 'Grace', attending: true }];
const { getByLabelText, getByTestId } = render({ initialGuests: guests, onRowRender: (id) => renders.push(id) });
renders.length = 0;
fireEvent.click(getByLabelText('Toggle Linus'));
expect(getByTestId('status-2').textContent).toBe('Linus: attending');
expect(renders).toEqual([2]);`,
      },
      {
        name: 'several toggles in a row stay correct and stay cheap',
        code: `const renders = [];
const guests = [{ id: 1, name: 'Ada', attending: false }, { id: 2, name: 'Linus', attending: false }, { id: 3, name: 'Grace', attending: false }];
const { getByLabelText, getByTestId } = render({ initialGuests: guests, onRowRender: (id) => renders.push(id) });
renders.length = 0;
fireEvent.click(getByLabelText('Toggle Ada'));
fireEvent.click(getByLabelText('Toggle Grace'));
fireEvent.change(getByLabelText('Note'), 'two so far');
fireEvent.click(getByLabelText('Toggle Ada'));
fireEvent.click(getByLabelText('Toggle Linus'));
expect(renders).toEqual([1, 3, 1, 2]);
expect(getByTestId('status-1').textContent).toBe('Ada: not attending');
expect(getByTestId('status-2').textContent).toBe('Linus: attending');
expect(getByTestId('status-3').textContent).toBe('Grace: attending');
expect(getByTestId('summary').textContent).toBe('Attending: 2 of 3');`,
      },
    ],
    hint: `\`memo\` skips a render only when EVERY prop is identical to last time. Check each prop of the row: the guest object (do you create new objects for guests that did not change?), and the toggle callback (an inline arrow is a new function on every render). A callback wrapped in \`useCallback\` with no dependencies has to use the functional form \`setGuests((prev) => ...)\`.`,
    explanation: `When a parent renders, React renders all of its children again unless told otherwise. \`memo(Row)\` is the opt-out: React compares the new props with the previous ones using \`Object.is\` and reuses the old output if all are equal. The work is making the props really equal.

Three things must hold. First, the guest object: the toggle maps over the array and returns the SAME object for untouched guests (\`g.id === id ? { ...g, attending: !g.attending } : g\`). Copying every guest would change every row's props. Second, the callback: \`onToggle={() => toggle(guest.id)}\` creates a new function per row per render, which defeats \`memo\` completely. The reference passes one \`toggle\` function to every row, kept stable by \`useCallback(..., [])\`, and the row calls it with its own id. Third, that stable callback must not read \`guests\` from its closure, because with an empty dependency list it would see the first render's array forever and lose earlier toggles. The functional update \`setGuests((prev) => ...)\` receives the latest array instead.

With all three in place, typing in the Note field re-renders \`GuestList\` but every row's props are unchanged, so no row function runs. A toggle changes exactly one guest object, so exactly one row runs. \`dispatch\` from \`useReducer\` is an alternative to \`useCallback\`, since React guarantees its identity.

The summary is recomputed in the parent on each render, O(n), which is cheap compared with rendering n rows.`,
    solution: `import React, { useState, useCallback, memo } from 'react';

const GuestRow = memo(function GuestRow({ guest, onToggle, onRowRender }) {
  onRowRender(guest.id);
  return (
    <li>
      <span data-testid={'status-' + guest.id}>{guest.name + ': ' + (guest.attending ? 'attending' : 'not attending')}</span>{' '}
      <button type="button" aria-label={'Toggle ' + guest.name} onClick={() => onToggle(guest.id)}>Toggle</button>
    </li>
  );
});

export default function GuestList({ initialGuests, onRowRender }) {
  const [guests, setGuests] = useState(initialGuests);
  const [note, setNote] = useState('');

  const toggle = useCallback((id) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, attending: !g.attending } : g)));
  }, []);

  const attending = guests.filter((g) => g.attending).length;

  return (
    <div>
      <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <ul>
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} onToggle={toggle} onRowRender={onRowRender} />
        ))}
      </ul>
      <p data-testid="summary">{'Attending: ' + attending + ' of ' + guests.length}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-roving-tabindex-menu',
    number: 97,
    title: 'Roving Tabindex Menu',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement: `Build \`ActionMenu({ actions, onAction })\`, an always-visible vertical menu with proper keyboard navigation. \`actions\` is an array of \`{ label, disabled }\` (\`disabled\` is optional) with unique labels. At least one action is enabled.

Markup:
- A container with \`role="menu"\`.
- One \`<button role="menuitem">\` per action whose text is the label, in order.
- A disabled action has \`aria-disabled="true"\`. Do NOT use the native \`disabled\` attribute. Enabled actions have no \`aria-disabled\` attribute.

Roving tabindex (so the Tab key stops in the menu only once):
- Exactly one item has \`tabIndex={0}\`; every other item has \`tabIndex={-1}\`.
- Initially the item with \`tabIndex={0}\` is the first ENABLED action.

Keyboard, handled on \`keydown\` while an item has focus:
- \`ArrowDown\` moves to the next enabled item, wrapping from the last enabled item to the first enabled one.
- \`ArrowUp\` moves to the previous enabled item, wrapping from the first enabled item to the last enabled one.
- \`Home\` moves to the first enabled item, \`End\` to the last enabled item.
- "Moves to" means two things: that item becomes the one with \`tabIndex={0}\` AND it receives DOM focus (\`element.focus()\`).
- Disabled items are always skipped.

Mouse:
- Clicking an enabled item calls \`onAction(label)\` and makes it the item with \`tabIndex={0}\`.
- Clicking a disabled item does nothing.`,
    componentName: 'ActionMenu',
    starter: `import React, { useState, useRef } from 'react';

export default function ActionMenu({ actions, onAction }) {
  // TODO: roving tabindex, arrow keys, Home / End, skipping disabled items
  return (
    <div role="menu">
      {actions.map((action) => (
        <button key={action.label} type="button" role="menuitem" tabIndex={0}>
          {action.label}
        </button>
      ))}
    </div>
  );
}
`,
    previewProps: {"actions": [{"label": "Cut"}, {"label": "Copy"}, {"label": "Paste", "disabled": true}, {"label": "Rename"}, {"label": "Delete"}]},
    previewSetup: `return { onAction: (label) => console.log('action', label) };`,
    tests: [
      {
        name: 'renders a menu where only the first enabled item is tabbable',
        code: `const actions = [{ label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }];
const { getByRole, getAllByRole } = render({ actions });
expect(getByRole('menu')).toBeTruthy();
const items = getAllByRole('menuitem');
expect(items.map((el) => el.textContent)).toEqual(['Cut', 'Copy', 'Paste']);
expect(items.map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
expect(items.every((el) => !el.hasAttribute('aria-disabled') && !el.disabled)).toBe(true);
expect(getByRole('menu').contains(items[2])).toBe(true);`,
      },
      {
        name: 'ArrowDown moves focus and the tab stop, wrapping at the end',
        code: `const actions = [{ label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }];
const { getAllByRole } = render({ actions });
const items = () => getAllByRole('menuitem');
fireEvent.focus(items()[0]);
fireEvent.keyDown(document.activeElement, 'ArrowDown');
expect(document.activeElement.textContent).toBe('Copy');
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
fireEvent.keyDown(document.activeElement, 'ArrowDown');
expect(document.activeElement.textContent).toBe('Paste');
fireEvent.keyDown(document.activeElement, 'ArrowDown');
expect(document.activeElement.textContent).toBe('Cut');
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);`,
      },
      {
        name: 'ArrowUp wraps to the last item, Home and End jump',
        code: `const actions = [{ label: 'Cut' }, { label: 'Copy' }, { label: 'Paste' }, { label: 'Delete' }];
const { getAllByRole } = render({ actions });
const items = () => getAllByRole('menuitem');
fireEvent.focus(items()[0]);
fireEvent.keyDown(document.activeElement, 'ArrowUp');
expect(document.activeElement.textContent).toBe('Delete');
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '0']);
fireEvent.keyDown(document.activeElement, 'ArrowUp');
expect(document.activeElement.textContent).toBe('Paste');
fireEvent.keyDown(document.activeElement, 'Home');
expect(document.activeElement.textContent).toBe('Cut');
fireEvent.keyDown(document.activeElement, 'End');
expect(document.activeElement.textContent).toBe('Delete');
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '0']);`,
      },
      {
        name: 'disabled items are marked with aria-disabled and skipped by the keyboard',
        code: `const actions = [{ label: 'Undo', disabled: true }, { label: 'Cut' }, { label: 'Paste', disabled: true }, { label: 'Rename' }, { label: 'Share', disabled: true }];
const { getAllByRole } = render({ actions });
const items = () => getAllByRole('menuitem');
expect(items().map((el) => el.getAttribute('aria-disabled'))).toEqual(['true', null, 'true', null, 'true']);
expect(items().some((el) => el.disabled)).toBe(false);
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1', '-1']);
fireEvent.focus(items()[1]);
fireEvent.keyDown(document.activeElement, 'ArrowDown');
expect(document.activeElement.textContent).toBe('Rename');
fireEvent.keyDown(document.activeElement, 'ArrowDown');
expect(document.activeElement.textContent).toBe('Cut');
fireEvent.keyDown(document.activeElement, 'ArrowUp');
expect(document.activeElement.textContent).toBe('Rename');
fireEvent.keyDown(document.activeElement, 'Home');
expect(document.activeElement.textContent).toBe('Cut');
fireEvent.keyDown(document.activeElement, 'End');
expect(document.activeElement.textContent).toBe('Rename');
expect(items().map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '-1', '0', '-1']);`,
      },
      {
        name: 'clicking calls onAction for enabled items only and moves the tab stop',
        code: `const picked = [];
const actions = [{ label: 'Cut' }, { label: 'Copy', disabled: true }, { label: 'Paste' }];
const { getAllByRole, getByRole } = render({ actions, onAction: (label) => picked.push(label) });
fireEvent.click(getByRole('menuitem', { name: 'Paste' }));
expect(picked).toEqual(['Paste']);
expect(getAllByRole('menuitem').map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
fireEvent.click(getByRole('menuitem', { name: 'Copy' }));
expect(picked).toEqual(['Paste']);
expect(getAllByRole('menuitem').map((el) => el.getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
fireEvent.click(getByRole('menuitem', { name: 'Cut' }));
expect(picked).toEqual(['Paste', 'Cut']);`,
      },
    ],
    hint: `Keep the index of the "tab stop" item in state and the button nodes in a ref array. For the arrows, first build the list of enabled indexes, find where the current one sits in that list, step with modulo arithmetic, then set the state and call \`.focus()\` on the target node.`,
    explanation: `A menu is one stop in the Tab order: Tab enters it, the arrow keys move inside it, Tab leaves it. Roving tabindex implements that with plain attributes. Only one item has \`tabIndex={0}\` and is reachable by Tab. The rest have \`-1\`, which means focusable by script but skipped by Tab. When the user presses an arrow, the component moves the \`0\` to another item and focuses it.

State is a single number, the index of the current tab stop, initialised to the first enabled index. Rendering derives every \`tabIndex\` from it.

Navigation is easiest on a list of enabled indexes, for example \`[1, 3]\` when items 0, 2 and 4 are disabled. Find the current position in that list, add or subtract one, and wrap with \`(pos + delta + n) % n\`. Home and End are the first and last entries. Skipping disabled items falls out of the data structure and needs no loop of "is this one disabled?" checks. Stepping through the raw indexes instead is the usual bug: focus lands on a disabled item.

Focus is moved imperatively through a ref array because the target button already exists. Disabled items use \`aria-disabled\`, not the native \`disabled\` attribute, so they stay visible to assistive technology in the menu. The click handler therefore has to ignore them itself.

Each key press is O(n) for building the enabled list.`,
    solution: `import React, { useState, useRef } from 'react';

export default function ActionMenu({ actions, onAction }) {
  const enabled = actions.map((action, i) => (action.disabled ? -1 : i)).filter((i) => i !== -1);
  const [active, setActive] = useState(enabled[0]);
  const nodes = useRef([]);

  function moveTo(index) {
    setActive(index);
    if (nodes.current[index]) nodes.current[index].focus();
  }

  function onKeyDown(event) {
    const pos = enabled.indexOf(active);
    const count = enabled.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveTo(enabled[(pos + 1) % count]);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveTo(enabled[(pos - 1 + count) % count]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveTo(enabled[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveTo(enabled[count - 1]);
    }
  }

  function onClick(action, index) {
    if (action.disabled) return;
    setActive(index);
    if (onAction) onAction(action.label);
  }

  return (
    <div role="menu" onKeyDown={onKeyDown} style={{ display: 'inline-flex', flexDirection: 'column' }}>
      {actions.map((action, i) => (
        <button
          key={action.label}
          ref={(node) => { nodes.current[i] = node; }}
          type="button"
          role="menuitem"
          tabIndex={i === active ? 0 : -1}
          aria-disabled={action.disabled ? 'true' : undefined}
          onClick={() => onClick(action, i)}
          style={{ opacity: action.disabled ? 0.5 : 1 }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
`,
  },
  {
    id: 'react-listbox-active-descendant',
    number: 98,
    title: 'Listbox with aria-activedescendant',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement: `Build \`OptionListbox({ label, options, onChange })\`, a single-select listbox operated with the keyboard. \`options\` is a non-empty array of unique strings.

This widget uses the "active descendant" pattern: DOM focus stays on the listbox container the whole time, and the container points at the option the keyboard is currently on.

Markup:
- A container with \`role="listbox"\`, \`tabIndex={0}\` and \`aria-label\` equal to \`label\`.
- One element with \`role="option"\` per option (its text is the option), each with a unique, non-empty \`id\`.
- Every option has \`aria-selected\`: \`"true"\` for the selected option, \`"false"\` for the others. Nothing is selected at first.
- The ACTIVE option (where the keyboard is) has \`data-active="true"\`; other options have no \`data-active\` attribute. The container's \`aria-activedescendant\` is always the \`id\` of the active option. The first option is active initially.
- \`<p data-testid="value">Selected: <option></p>\`, or \`Selected: none\` before any selection.

Keyboard (\`keydown\` on the listbox container):
- \`ArrowDown\` / \`ArrowUp\` move the active option by one. They stop at the last / first option (no wrap-around).
- \`Home\` / \`End\` make the first / last option active.
- \`Enter\` or the space key (\`event.key === ' '\`) selects the active option.
- Never move DOM focus to an option.

Mouse: clicking an option makes it both active and selected.

Each time an option is selected (keyboard or mouse) call \`onChange(option)\` if it was given. Moving the active option does not select anything.`,
    componentName: 'OptionListbox',
    starter: `import React, { useState } from 'react';

export default function OptionListbox({ label, options, onChange }) {
  // TODO: active option, selection, keyboard handling, aria-activedescendant
  return (
    <div>
      <ul role="listbox" tabIndex={0} aria-label={label}>
        {options.map((option) => (
          <li key={option} role="option" aria-selected="false">{option}</li>
        ))}
      </ul>
      <p data-testid="value">Selected: none</p>
    </div>
  );
}
`,
    previewProps: {"label": "Shipping speed", "options": ["Standard", "Express", "Overnight", "Pickup"]},
    previewSetup: `return { onChange: (option) => console.log('selected', option) };`,
    tests: [
      {
        name: 'renders a labelled listbox whose first option is active and nothing selected',
        code: `const { getByRole, getAllByRole, getByTestId } = render({ label: 'Speed', options: ['Standard', 'Express', 'Overnight'] });
const listbox = getByRole('listbox', { name: 'Speed' });
expect(listbox.getAttribute('tabindex')).toBe('0');
const opts = getAllByRole('option');
expect(opts.map((o) => o.textContent)).toEqual(['Standard', 'Express', 'Overnight']);
expect(opts.map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false']);
expect(opts.every((o) => o.id && o.id.length > 0)).toBe(true);
expect(new Set(opts.map((o) => o.id)).size).toBe(3);
expect(opts.map((o) => o.getAttribute('data-active'))).toEqual(['true', null, null]);
expect(listbox.getAttribute('aria-activedescendant')).toBe(opts[0].id);
expect(getByTestId('value').textContent).toBe('Selected: none');`,
      },
      {
        name: 'arrow keys move the active option and stop at the ends',
        code: `const { getByRole, getAllByRole, getByTestId } = render({ label: 'Speed', options: ['Standard', 'Express', 'Overnight'] });
const listbox = getByRole('listbox');
const active = () => getAllByRole('option').filter((o) => o.getAttribute('data-active') === 'true').map((o) => o.textContent);
const pointsAtActive = () => { const el = getAllByRole('option').find((o) => o.getAttribute('data-active') === 'true'); return listbox.getAttribute('aria-activedescendant') === el.id; };
fireEvent.focus(listbox);
fireEvent.keyDown(listbox, 'ArrowUp');
expect(active()).toEqual(['Standard']);
fireEvent.keyDown(listbox, 'ArrowDown');
expect(active()).toEqual(['Express']);
expect(pointsAtActive()).toBe(true);
fireEvent.keyDown(listbox, 'ArrowDown');
fireEvent.keyDown(listbox, 'ArrowDown');
fireEvent.keyDown(listbox, 'ArrowDown');
expect(active()).toEqual(['Overnight']);
expect(pointsAtActive()).toBe(true);
fireEvent.keyDown(listbox, 'ArrowUp');
expect(active()).toEqual(['Express']);
expect(document.activeElement === listbox).toBe(true);
expect(getByTestId('value').textContent).toBe('Selected: none');
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'false']);`,
      },
      {
        name: 'Enter and Space select the active option and call onChange',
        code: `const picked = [];
const { getByRole, getAllByRole, getByTestId } = render({ label: 'Speed', options: ['Standard', 'Express', 'Overnight'], onChange: (o) => picked.push(o) });
const listbox = getByRole('listbox');
fireEvent.keyDown(listbox, 'ArrowDown');
expect(picked).toEqual([]);
fireEvent.keyDown(listbox, 'Enter');
expect(picked).toEqual(['Express']);
expect(getByTestId('value').textContent).toBe('Selected: Express');
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
fireEvent.keyDown(listbox, 'ArrowDown');
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
fireEvent.keyDown(listbox, ' ');
expect(picked).toEqual(['Express', 'Overnight']);
expect(getByTestId('value').textContent).toBe('Selected: Overnight');
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);`,
      },
      {
        name: 'Home and End jump to the first and last option',
        code: `const { getByRole, getAllByRole } = render({ label: 'Speed', options: ['Standard', 'Express', 'Overnight', 'Pickup'] });
const listbox = getByRole('listbox');
const activeEl = () => getAllByRole('option').find((o) => o.getAttribute('data-active') === 'true');
fireEvent.keyDown(listbox, 'End');
expect(activeEl().textContent).toBe('Pickup');
expect(listbox.getAttribute('aria-activedescendant')).toBe(activeEl().id);
fireEvent.keyDown(listbox, 'Home');
expect(activeEl().textContent).toBe('Standard');
expect(listbox.getAttribute('aria-activedescendant')).toBe(activeEl().id);
expect(getAllByRole('option').filter((o) => o.hasAttribute('data-active'))).toHaveLength(1);`,
      },
      {
        name: 'clicking an option selects it and the keyboard continues from there',
        code: `const picked = [];
const { getByRole, getAllByRole, getByTestId } = render({ label: 'Speed', options: ['Standard', 'Express', 'Overnight', 'Pickup'], onChange: (o) => picked.push(o) });
const listbox = getByRole('listbox');
const activeEl = () => getAllByRole('option').find((o) => o.getAttribute('data-active') === 'true');
fireEvent.click(getByRole('option', { name: 'Overnight' }));
expect(picked).toEqual(['Overnight']);
expect(getByTestId('value').textContent).toBe('Selected: Overnight');
expect(activeEl().textContent).toBe('Overnight');
expect(listbox.getAttribute('aria-activedescendant')).toBe(activeEl().id);
fireEvent.keyDown(listbox, 'ArrowDown');
expect(activeEl().textContent).toBe('Pickup');
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false']);`,
      },
    ],
    hint: `You need two separate pieces of state: the active index (moved by the arrows) and the selected option (set by Enter, Space or a click). Generate option ids from \`useId()\` plus the index, and compute \`aria-activedescendant\` from the active index with the same formula so the two can never disagree.`,
    explanation: `There are two ways to do keyboard navigation inside a composite widget. Roving tabindex moves real DOM focus from item to item. The active-descendant pattern keeps focus on the container and sets \`aria-activedescendant\` to the id of the item that is "virtually" focused. Screen readers announce that item as if it had focus. This pattern suits lists whose items are re-created often, because there is no focus to lose.

Active and selected are different ideas, and mixing them into one variable is the main mistake here. Arrowing through a list should not change the form value, only Enter, Space or a click commits. So the reference holds \`activeIndex\` (a number, starts at 0) and \`selected\` (an option or null).

The key handler on the container is a clamped index move: \`Math.min(last, i + 1)\`, \`Math.max(0, i - 1)\`, 0 for Home, last for End. It calls \`preventDefault()\` for the keys it handles so the page does not scroll. Enter and Space select \`options[activeIndex]\`.

Ids must be unique on the page even if the listbox is rendered twice, so they are built from \`useId()\` and the option index. The same expression produces both the option's \`id\` and the container's \`aria-activedescendant\`, which keeps them in sync by construction. A click sets both pieces of state so that the keyboard continues from the clicked option. Each key press is O(1), and rendering is O(n).`,
    solution: `import React, { useState, useId } from 'react';

export default function OptionListbox({ label, options, onChange }) {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const optionId = (index) => baseId + '-option-' + index;

  function select(index) {
    setActiveIndex(index);
    setSelected(options[index]);
    if (onChange) onChange(options[index]);
  }

  function onKeyDown(event) {
    const last = options.length - 1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(last, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(last);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(activeIndex);
    }
  }

  return (
    <div>
      <ul
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={optionId(activeIndex)}
        onKeyDown={onKeyDown}
        style={{ listStyle: 'none', padding: 0 }}
      >
        {options.map((option, i) => (
          <li
            key={option}
            id={optionId(i)}
            role="option"
            aria-selected={option === selected ? 'true' : 'false'}
            data-active={i === activeIndex ? 'true' : undefined}
            onClick={() => select(i)}
            style={{ outline: i === activeIndex ? '2px solid #4a7' : 'none', fontWeight: option === selected ? 'bold' : 'normal' }}
          >
            {option}
          </li>
        ))}
      </ul>
      <p data-testid="value">{'Selected: ' + (selected === null ? 'none' : selected)}</p>
    </div>
  );
}
`,
  },
  {
    id: 'react-combobox-autocomplete',
    number: 99,
    title: 'Autocomplete Combobox with Keyboard Selection',
    difficulty: 'Hard',
    topic: 'State & Events',
    statement: `Build \`LanguageCombobox({ options, onSelect })\`, a text field with a suggestion list that can be operated entirely from the keyboard. \`options\` is an array of unique strings.

Markup:
- An \`<input role="combobox" aria-label="Language">\` holding the text.
- Suggestions are the options that CONTAIN the input text, ignoring upper / lower case, in their original order.
- While the list is open, render an element with \`role="listbox"\` containing one element with \`role="option"\` per suggestion (its text is the option). Each option has a unique, non-empty \`id\` and \`aria-selected\`: \`"true"\` for the active option, \`"false"\` for the others.
- The input has \`aria-expanded="true"\` while the listbox is rendered and \`aria-expanded="false"\` otherwise.
- When an option is active, the input's \`aria-activedescendant\` is that option's \`id\`. When no option is active, the input has NO \`aria-activedescendant\` attribute.

Opening and closing:
- Every change of the text opens the list if the new text is not empty and has at least one suggestion, and resets the active option to "none".
- If the text is not empty but nothing matches, render \`<p>No matches</p>\` and no listbox.
- If the text is empty, render neither.
- \`Escape\` closes the list and keeps the text. (The next change of the text opens it again.)

Keyboard on the input while the list is open:
- \`ArrowDown\` makes the next option active: from "none" to the first, and from the last back to the first.
- \`ArrowUp\` makes the previous option active: from "none" to the last, and from the first back to the last.
- \`Enter\` with an active option selects it. \`Enter\` with no active option does nothing.

While the list is closed, the arrow keys and \`Enter\` do nothing.

Selecting an option (by \`Enter\`, or by clicking the option) puts the option's text into the input, closes the list and calls \`onSelect(option)\` (if given). After a selection no listbox and no \`No matches\` text is shown until the text changes again.`,
    componentName: 'LanguageCombobox',
    starter: `import React, { useState } from 'react';

export default function LanguageCombobox({ options, onSelect }) {
  const [text, setText] = useState('');
  // TODO: suggestions, open / close, active option, keyboard, selection
  return (
    <div>
      <input role="combobox" aria-label="Language" aria-expanded="false" value={text} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}
`,
    previewProps: {"options": ["JavaScript", "TypeScript", "Java", "Python", "Kotlin", "Swift", "Go", "Rust"]},
    previewSetup: `return { onSelect: (option) => console.log('selected', option) };`,
    tests: [
      {
        name: 'typing filters the options without regard to case',
        code: `const options = ['JavaScript', 'TypeScript', 'Java', 'Python', 'Go'];
const { getByRole, getAllByRole, queryByRole } = render({ options });
const input = getByRole('combobox', { name: 'Language' });
expect(input).toHaveAttribute('aria-expanded', 'false');
expect(queryByRole('listbox')).toBeNull();
fireEvent.change(input, 'SCRIPT');
expect(input).toHaveAttribute('aria-expanded', 'true');
expect(getByRole('listbox')).toBeTruthy();
expect(getAllByRole('option').map((o) => o.textContent)).toEqual(['JavaScript', 'TypeScript']);
fireEvent.change(input, 'o');
expect(getAllByRole('option').map((o) => o.textContent)).toEqual(['Python', 'Go']);
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false']);
expect(input.hasAttribute('aria-activedescendant')).toBe(false);
expect(new Set(getAllByRole('option').map((o) => o.id)).size).toBe(2);
expect(getAllByRole('option').every((o) => o.id.length > 0)).toBe(true);`,
      },
      {
        name: 'shows No matches for unknown text and nothing for empty text',
        code: `const options = ['JavaScript', 'TypeScript', 'Java'];
const { getByRole, getByText, queryByRole, queryByText } = render({ options });
const input = getByRole('combobox');
expect(queryByText('No matches')).toBeNull();
fireEvent.change(input, 'rust');
expect(getByText('No matches')).toBeTruthy();
expect(queryByRole('listbox')).toBeNull();
expect(input).toHaveAttribute('aria-expanded', 'false');
fireEvent.change(input, '');
expect(queryByText('No matches')).toBeNull();
expect(queryByRole('listbox')).toBeNull();
expect(input).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'ArrowDown and ArrowUp move the active option and wrap around',
        code: `const options = ['JavaScript', 'TypeScript', 'Java', 'Python'];
const { getByRole, getAllByRole } = render({ options });
const input = getByRole('combobox');
const activeTexts = () => getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.textContent);
const activeId = () => { const el = getAllByRole('option').find((o) => o.getAttribute('aria-selected') === 'true'); return el ? el.id : null; };
fireEvent.change(input, 'a');
expect(getAllByRole('option').map((o) => o.textContent)).toEqual(['JavaScript', 'Java']);
fireEvent.keyDown(input, 'ArrowDown');
expect(activeTexts()).toEqual(['JavaScript']);
expect(input.getAttribute('aria-activedescendant')).toBe(activeId());
fireEvent.keyDown(input, 'ArrowDown');
expect(activeTexts()).toEqual(['Java']);
expect(input.getAttribute('aria-activedescendant')).toBe(activeId());
fireEvent.keyDown(input, 'ArrowDown');
expect(activeTexts()).toEqual(['JavaScript']);
fireEvent.keyDown(input, 'ArrowUp');
expect(activeTexts()).toEqual(['Java']);
fireEvent.change(input, 'p');
expect(activeTexts()).toEqual([]);
fireEvent.keyDown(input, 'ArrowUp');
expect(activeTexts()).toEqual(['Python']);
expect(input.getAttribute('aria-activedescendant')).toBe(activeId());`,
      },
      {
        name: 'Enter selects the active option, fills the input and closes the list',
        code: `const picked = [];
const options = ['JavaScript', 'TypeScript', 'Java', 'Python'];
const { getByRole, queryByRole, queryByText } = render({ options, onSelect: (o) => picked.push(o) });
const input = getByRole('combobox');
fireEvent.change(input, 'ja');
fireEvent.keyDown(input, 'Enter');
expect(picked).toEqual([]);
expect(queryByRole('listbox')).toBeTruthy();
expect(input.value).toBe('ja');
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'Enter');
expect(picked).toEqual(['Java']);
expect(input.value).toBe('Java');
expect(queryByRole('listbox')).toBeNull();
expect(queryByText('No matches')).toBeNull();
expect(input).toHaveAttribute('aria-expanded', 'false');
expect(input.hasAttribute('aria-activedescendant')).toBe(false);
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'Enter');
expect(picked).toEqual(['Java']);
expect(queryByRole('listbox')).toBeNull();`,
      },
      {
        name: 'typing after moving resets the active option, and Escape closes the list',
        code: `const picked = [];
const options = ['JavaScript', 'TypeScript', 'Java', 'Python'];
const { getByRole, getAllByRole, queryByRole } = render({ options, onSelect: (o) => picked.push(o) });
const input = getByRole('combobox');
fireEvent.change(input, 'p');
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'ArrowDown');
expect(input.hasAttribute('aria-activedescendant')).toBe(true);
fireEvent.change(input, 'pt');
expect(getAllByRole('option').map((o) => o.textContent)).toEqual(['JavaScript', 'TypeScript']);
expect(getAllByRole('option').map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'false']);
expect(input.hasAttribute('aria-activedescendant')).toBe(false);
fireEvent.keyDown(input, 'Enter');
expect(picked).toEqual([]);
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'Escape');
expect(queryByRole('listbox')).toBeNull();
expect(input.value).toBe('pt');
expect(input).toHaveAttribute('aria-expanded', 'false');
expect(input.hasAttribute('aria-activedescendant')).toBe(false);
fireEvent.keyDown(input, 'ArrowDown');
fireEvent.keyDown(input, 'Enter');
expect(picked).toEqual([]);
fireEvent.change(input, 'typ');
expect(getAllByRole('option').map((o) => o.textContent)).toEqual(['TypeScript']);
expect(getAllByRole('option')[0].getAttribute('aria-selected')).toBe('false');`,
      },
      {
        name: 'clicking a suggestion selects it',
        code: `const picked = [];
const options = ['JavaScript', 'TypeScript', 'Java', 'Python'];
const { getByRole, queryByRole } = render({ options, onSelect: (o) => picked.push(o) });
const input = getByRole('combobox');
fireEvent.change(input, 'script');
fireEvent.click(getByRole('option', { name: 'TypeScript' }));
expect(picked).toEqual(['TypeScript']);
expect(input.value).toBe('TypeScript');
expect(queryByRole('listbox')).toBeNull();
fireEvent.change(input, 'TypeScrip');
expect(getByRole('option', { name: 'TypeScript' })).toBeTruthy();`,
      },
    ],
    hint: `Three pieces of state are enough: the text, an \`open\` boolean and an \`activeIndex\` where -1 means "none". The suggestions are derived from the text on every render. Set \`open\` and reset \`activeIndex\` in the change handler, not in an effect. For wrapping, treat -1 as a special case before applying modulo.`,
    explanation: `A combobox is an input plus a popup, and the difficulty is keeping a handful of small states consistent.

Derived data first: the suggestions are a pure function of the text, \`options.filter((o) => o.toLowerCase().includes(text.toLowerCase()))\`, so they are computed during render and never stored.

Real state: \`text\`, \`open\` and \`activeIndex\`. "Is the list open" cannot be derived from the text alone, because Escape and a selection both close the list while matching text is still in the input. That is why \`open\` is its own boolean, set to true by every change and to false by Escape and by selecting. The listbox is shown when \`open\` is true and there are suggestions; \`No matches\` is shown when \`open\` is true, the text is not empty and there are none.

\`activeIndex\` uses -1 for "nothing active". It must be reset on every text change, otherwise it points at whatever option happens to sit at the old position in the new, shorter list, and Enter picks something the user never looked at. Wrapping needs care with -1: ArrowDown is \`(active + 1) % n\`, which already maps -1 to 0, while ArrowUp is \`active <= 0 ? n - 1 : active - 1\`.

Focus never leaves the input, so the active option is conveyed with \`aria-activedescendant\` (omitted when nothing is active) and \`aria-selected\` on the options. The handler calls \`preventDefault()\` on the arrows so the text cursor does not jump, and on Enter so an enclosing form is not submitted. Option ids come from \`useId()\`, so two comboboxes on one page do not clash.

Filtering is O(n times the option length) per render.`,
    solution: `import React, { useState, useId } from 'react';

export default function LanguageCombobox({ options, onSelect }) {
  const baseId = useId();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const needle = text.toLowerCase();
  const suggestions = text === '' ? [] : options.filter((option) => option.toLowerCase().includes(needle));
  const showList = open && suggestions.length > 0;
  const showEmpty = open && text !== '' && suggestions.length === 0;
  const optionId = (index) => baseId + '-opt-' + index;

  function handleChange(event) {
    setText(event.target.value);
    setOpen(true);
    setActiveIndex(-1);
  }

  function choose(option) {
    setText(option);
    setOpen(false);
    setActiveIndex(-1);
    if (onSelect) onSelect(option);
  }

  function handleKeyDown(event) {
    if (!showList) return;
    const count = suggestions.length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((activeIndex + 1) % count);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(activeIndex <= 0 ? count - 1 : activeIndex - 1);
    } else if (event.key === 'Enter') {
      if (activeIndex === -1) return;
      event.preventDefault();
      choose(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      <input
        role="combobox"
        aria-label="Language"
        aria-expanded={showList ? 'true' : 'false'}
        aria-activedescendant={showList && activeIndex !== -1 ? optionId(activeIndex) : undefined}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {showList && (
        <ul role="listbox" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {suggestions.map((option, i) => (
            <li
              key={option}
              id={optionId(i)}
              role="option"
              aria-selected={i === activeIndex ? 'true' : 'false'}
              onClick={() => choose(option)}
              style={{ background: i === activeIndex ? '#dde' : 'transparent', cursor: 'pointer' }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
      {showEmpty && <p>No matches</p>}
    </div>
  );
}
`,
  },
  {
    id: 'react-dialog-focus-trap',
    number: 100,
    title: 'Confirm Dialog with a Focus Trap',
    difficulty: 'Hard',
    topic: 'Composition & Patterns',
    statement: `Build \`DeleteConfirm({ itemName, onConfirm })\`, a delete button guarded by a modal confirmation dialog that manages keyboard focus correctly (rendered inline, no portal).

Closed (initial state):
- Render one button \`Delete <itemName>\`, for example \`Delete Old draft\`. No element with \`role="dialog"\` exists.

Open (after clicking that button):
- Render \`<div role="dialog" aria-modal="true" aria-labelledby="<id of the heading>">\` containing a heading \`<h2 id="...">Delete <itemName>?</h2>\` and two buttons, \`Cancel\` first and \`Confirm\` second.
- The trigger button stays in the DOM.
- When the dialog opens, focus moves to \`Cancel\` (the safe choice).

Focus trap, on \`keydown\` with \`event.key === 'Tab'\`:
- \`Tab\` (without Shift) while \`Confirm\`, the last button, has focus: call \`event.preventDefault()\` and focus \`Cancel\`.
- \`Shift+Tab\` (\`event.shiftKey\` is true) while \`Cancel\`, the first button, has focus: call \`event.preventDefault()\` and focus \`Confirm\`.

Closing:
- \`Cancel\` closes the dialog.
- \`Confirm\` calls \`onConfirm()\` exactly once and closes the dialog.
- The \`Escape\` key, pressed while focus is inside the dialog, closes it without calling \`onConfirm\`.
- Whenever the dialog closes, focus returns to the \`Delete <itemName>\` button.
- The component does not move focus when it first mounts.`,
    componentName: 'DeleteConfirm',
    starter: `import React, { useState, useRef, useEffect } from 'react';

export default function DeleteConfirm({ itemName, onConfirm }) {
  const [open, setOpen] = useState(false);
  // TODO: dialog markup, initial focus, focus trap, Escape, focus return
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Delete {itemName}</button>
    </div>
  );
}
`,
    previewProps: {"itemName": "Quarterly report"},
    previewSetup: `return { onConfirm: () => console.log('confirmed') };`,
    tests: [
      {
        name: 'opening shows a labelled modal dialog and focuses Cancel',
        code: `const { getByRole, queryByRole } = render({ itemName: 'Old draft', onConfirm: () => {} });
const trigger = getByRole('button', { name: 'Delete Old draft' });
expect(queryByRole('dialog')).toBeNull();
expect(document.activeElement === trigger).toBe(false);
fireEvent.click(trigger);
const dialog = getByRole('dialog', { name: 'Delete Old draft?' });
expect(dialog).toHaveAttribute('aria-modal', 'true');
expect(within(dialog).getByRole('heading').textContent).toBe('Delete Old draft?');
expect(within(dialog).getAllByRole('button').map((b) => b.textContent)).toEqual(['Cancel', 'Confirm']);
expect(document.activeElement === within(dialog).getByRole('button', { name: 'Cancel' })).toBe(true);
expect(getByRole('button', { name: 'Delete Old draft' })).toBeTruthy();`,
      },
      {
        name: 'Tab on the last button wraps to the first, Shift+Tab on the first wraps to the last',
        code: `const { getByRole } = render({ itemName: 'Old draft', onConfirm: () => {} });
fireEvent.click(getByRole('button', { name: 'Delete Old draft' }));
const cancel = getByRole('button', { name: 'Cancel' });
const confirm = getByRole('button', { name: 'Confirm' });
const firstAllowed = fireEvent.keyDown(cancel, { key: 'Tab', shiftKey: true });
expect(document.activeElement === confirm).toBe(true);
expect(firstAllowed).toBe(false);
const secondAllowed = fireEvent.keyDown(confirm, { key: 'Tab' });
expect(document.activeElement === cancel).toBe(true);
expect(secondAllowed).toBe(false);
fireEvent.focus(confirm);
fireEvent.keyDown(confirm, { key: 'Tab', shiftKey: false });
expect(document.activeElement === cancel).toBe(true);
expect(getByRole('dialog')).toBeTruthy();`,
      },
      {
        name: 'Escape closes without confirming and returns focus to the trigger',
        code: `let confirmed = 0;
const { getByRole, queryByRole } = render({ itemName: 'Old draft', onConfirm: () => { confirmed += 1; } });
fireEvent.click(getByRole('button', { name: 'Delete Old draft' }));
fireEvent.keyDown(document.activeElement, 'Escape');
expect(queryByRole('dialog')).toBeNull();
expect(confirmed).toBe(0);
expect(document.activeElement === getByRole('button', { name: 'Delete Old draft' })).toBe(true);`,
      },
      {
        name: 'Confirm calls onConfirm once, closes and returns focus',
        code: `let confirmed = 0;
const { getByRole, queryByRole } = render({ itemName: 'Invoice 7', onConfirm: () => { confirmed += 1; } });
fireEvent.click(getByRole('button', { name: 'Delete Invoice 7' }));
fireEvent.click(getByRole('button', { name: 'Confirm' }));
expect(confirmed).toBe(1);
expect(queryByRole('dialog')).toBeNull();
expect(document.activeElement === getByRole('button', { name: 'Delete Invoice 7' })).toBe(true);`,
      },
      {
        name: 'Cancel closes without confirming and the dialog can be opened again',
        code: `let confirmed = 0;
const { getByRole, queryByRole } = render({ itemName: 'Old draft', onConfirm: () => { confirmed += 1; } });
fireEvent.click(getByRole('button', { name: 'Delete Old draft' }));
fireEvent.click(getByRole('button', { name: 'Cancel' }));
expect(queryByRole('dialog')).toBeNull();
expect(confirmed).toBe(0);
expect(document.activeElement === getByRole('button', { name: 'Delete Old draft' })).toBe(true);
fireEvent.click(getByRole('button', { name: 'Delete Old draft' }));
expect(getByRole('dialog')).toBeTruthy();
expect(document.activeElement === getByRole('button', { name: 'Cancel' })).toBe(true);
fireEvent.keyDown(document.activeElement, 'Escape');
fireEvent.keyDown(document.body, 'Escape');
expect(queryByRole('dialog')).toBeNull();
expect(confirmed).toBe(0);`,
      },
    ],
    hint: `Use refs for the trigger, \`Cancel\` and \`Confirm\`. One effect keyed on \`open\` moves focus: to \`Cancel\` when it became true, back to the trigger when it became false, but not on the first mount. Put a single \`onKeyDown\` on the dialog element. Key events from the buttons bubble up to it, and \`document.activeElement\` tells you which button has focus.`,
    explanation: `A modal dialog makes three promises to keyboard users: focus goes into the dialog when it opens, it cannot leave while the dialog is open, and it goes back to where it was when the dialog closes. None of that happens by default.

Moving focus in and out is the job of an effect keyed on \`open\`, because the elements to focus only exist after the render. When \`open\` becomes true the effect focuses \`Cancel\`, the non-destructive option, so that an accidental Enter does not delete anything. When it becomes false it focuses the trigger. A \`wasOpen\` ref stops the effect from focusing the trigger on the initial mount, when nothing was closed.

The trap handles the two edges of the tab order. Tab on the last focusable element would move focus out of the dialog to the page behind it, so the handler prevents the default and focuses the first one. Shift+Tab on the first does the reverse. \`preventDefault()\` matters: without it the browser performs its own focus move right after yours. Elements between the edges need no handling because the browser's normal Tab already stays inside. With only two buttons you can compare \`document.activeElement\` to the refs. A general dialog would query its focusable descendants and use the first and last.

One \`onKeyDown\` on the dialog element sees keys from both buttons through bubbling, and also handles Escape. Confirm calls \`onConfirm\` and then closes, and every way of closing goes through the same state change, so the focus return in the effect covers them all. All handlers are O(1).`,
    solution: `import React, { useState, useRef, useEffect, useId } from 'react';

export default function DeleteConfirm({ itemName, onConfirm }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      cancelRef.current.focus();
    } else if (wasOpen.current) {
      triggerRef.current.focus();
    }
    wasOpen.current = open;
  }, [open]);

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab') return;
    if (!event.shiftKey && document.activeElement === confirmRef.current) {
      event.preventDefault();
      cancelRef.current.focus();
    } else if (event.shiftKey && document.activeElement === cancelRef.current) {
      event.preventDefault();
      confirmRef.current.focus();
    }
  }

  function confirm() {
    if (onConfirm) onConfirm();
    setOpen(false);
  }

  return (
    <div>
      <button type="button" ref={triggerRef} onClick={() => setOpen(true)}>{'Delete ' + itemName}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown} style={{ border: '1px solid #999', padding: 12, marginTop: 8 }}>
          <h2 id={titleId}>{'Delete ' + itemName + '?'}</h2>
          <button type="button" ref={cancelRef} onClick={() => setOpen(false)}>Cancel</button>{' '}
          <button type="button" ref={confirmRef} onClick={confirm}>Confirm</button>
        </div>
      )}
    </div>
  );
}
`,
  },
];
