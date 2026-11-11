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
setInterval(() => {
  n += 1;
  state = { items: n % 4 === 0 ? [] : state.items.concat('Item ' + n) };
  listeners.forEach((l) => l());
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
];
