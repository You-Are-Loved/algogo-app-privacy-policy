// React build problems (Frontend practice) — write a component in JSX, watch
// it render live, then run DOM tests against it.
//
// Runtime (see src/practice/reactHtml.ts + reactHarness.ts):
//   - The user's code is compiled with Babel (preset react) and evaluated in
//     a sandboxed iframe (opaque origin, strict CSP, no network, no bridge to
//     the app). React 18 + ReactDOM are inlined into that frame.
//   - `componentName` is the function/const the harness picks up. `import`
//     lines for 'react' and `export` keywords are stripped so the usual file
//     shape works, and the React hooks are available as globals.
//   - Each test is an async function body run with these globals:
//       render(props?)  -> { container, getByText, queryByText, getAllByText,
//                           (props default to previewProps + previewSetup)
//                           getByTestId, queryByTestId, getByLabelText,
//                           getByPlaceholderText, getByRole, getAllByRole,
//                           rerender(props), unmount() }
//       screen          -> the same queries over document.body
//       fireEvent.click(el) / change(el, value) / input(el, value) /
//                 keyDown(el, key) / submit(form) / focus(el) / blur(el) /
//                 mouseEnter(el) / mouseLeave(el) / doubleClick(el)
//       expect(x).toBe / toEqual / toContain / toBeTruthy / toBeFalsy /
//                 toHaveLength / toMatch / toBeNull / toBeDefined /
//                 toBeGreaterThan / toBeLessThan / toHaveTextContent /
//                 toHaveAttribute / toBeDisabled  (all support `.not`)
//       tick()          -> await a macrotask (lets effects/timers run)
//       waitFor(fn)     -> polls fn until it stops throwing (1.5s max)
//       within(el)      -> queries scoped to an element
//     A test passes when it finishes without throwing.
//   - The reference `solution` must pass every test; the `starter` must not.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ReactTest {
  /** Shown to the user in the brief ("What we check") and in results. */
  name: string;
  /** Async function body using the harness globals. */
  code: string;
}

export interface ReactProblem {
  id: string;
  number: number; // 1-50
  title: string;
  difficulty: Difficulty;
  topic: string;
  /** Markdown-light task description: what to build and how it should behave. */
  statement: string;
  /** Name of the component the tests render. */
  componentName: string;
  /** JSX skeleton shown in the editor. Must define `componentName`. */
  starter: string;
  /** JSON props used by the live preview (and the default for render()). */
  previewProps?: Record<string, unknown>;
  /**
   * Optional JS function body evaluated inside the sandbox that returns extra
   * props — the only way to hand a component functions (fake loaders, event
   * spies) for the preview. Merged over previewProps. Example:
   *   "return { loadUser: async (id) => ({ id, name: 'Ada' }) };"
   */
  previewSetup?: string;
  tests: ReactTest[];
  hint?: string;
  explanation: string;
  /** Reference implementation (shown in the explanation sheet). */
  solution: string;
}

export const reactProblems: ReactProblem[] = [
  // ───────────────────────────── Rendering & Props ─────────────────────────────
  {
    id: 'react-greeting-from-props',
    number: 1,
    title: 'Greeting from Props',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement:
      "Build a `Greeting` component that takes two props: `name` (string) and `unread` (number).\n\n" +
      "- Render an `<h1>` that reads exactly `Hello, {name}!` (e.g. `Hello, Ada!`).\n" +
      "- Below it, render a `<p>` describing the unread count: `You have 1 new message` when `unread` is 1, otherwise `You have N new messages` (including `You have 0 new messages`).\n" +
      "- The output must update whenever the props change — read them on every render, never copy them into state.",
    componentName: 'Greeting',
    starter: `import React from 'react';

export default function Greeting({ name, unread }) {
  // TODO: greet the person by name and describe how many unread messages they have
  return <div />;
}
`,
    previewProps: { name: 'Ada', unread: 3 },
    tests: [
      {
        name: 'greets the person by name',
        code: `const { getByRole } = render({ name: 'Ada', unread: 0 });
expect(getByRole('heading')).toHaveTextContent('Hello, Ada!');`,
      },
      {
        name: 'updates when the name prop changes',
        code: `const { getByText, queryByText, rerender } = render({ name: 'Ada', unread: 0 });
expect(getByText('Hello, Ada!')).toBeTruthy();
rerender({ name: 'Grace', unread: 0 });
expect(getByText('Hello, Grace!')).toBeTruthy();
expect(queryByText('Hello, Ada!')).toBeNull();`,
      },
      {
        name: 'uses the singular for exactly one unread message',
        code: `const { getByText } = render({ name: 'Ada', unread: 1 });
expect(getByText('You have 1 new message')).toBeTruthy();`,
      },
      {
        name: 'uses the plural for zero and many',
        code: `const { getByText, rerender } = render({ name: 'Ada', unread: 0 });
expect(getByText('You have 0 new messages')).toBeTruthy();
rerender({ name: 'Ada', unread: 5 });
expect(getByText('You have 5 new messages')).toBeTruthy();`,
      },
    ],
    hint: 'Props are plain function arguments — interpolate them straight into JSX with `{}` and branch on `unread === 1` for the wording.',
    explanation:
      'Props flow in on every render, so the component just reads `name` and `unread` and returns JSX built from them; nothing needs to be stored. ' +
      'The pluralisation is a plain ternary in the render path. Copying props into `useState` is the classic mistake here: the state would be initialised once and stop reflecting new props.',
    solution: `import React from 'react';

export default function Greeting({ name, unread }) {
  const unreadText = unread === 1 ? 'You have 1 new message' : 'You have ' + unread + ' new messages';
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>{unreadText}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-task-list-stable-keys',
    number: 2,
    title: 'Task List with Stable Keys',
    difficulty: 'Medium',
    topic: 'Rendering & Props',
    statement:
      "Build a `TaskList` that receives `tasks` — an array of `{ id, title }` — and keeps its own copy in state so rows can be removed.\n\n" +
      "- Render a `<ul>` with one `<li>` per task carrying `data-testid=\"task-{id}\"`. Each row shows the task `title`, a text input with placeholder `Note` (the user can type a note; it is not saved anywhere), and a button with `aria-label` `Remove {title}`.\n" +
      "- Clicking the remove button deletes only that row.\n" +
      "- When no tasks remain, render `All done!` instead of the list.\n" +
      "- Use a stable `key` for each row: a note typed into a row must stay with that row when an earlier row is removed.",
    componentName: 'TaskList',
    starter: `import React, { useState } from 'react';

export default function TaskList({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);

  // TODO: render one row per task (title, Note input, Remove button) with a stable key,
  // remove a row on click, and show "All done!" when the list is empty
  return <ul />;
}
`,
    previewProps: {
      tasks: [
        { id: 1, title: 'Buy milk' },
        { id: 2, title: 'Walk the dog' },
        { id: 3, title: 'Write tests' },
      ],
    },
    tests: [
      {
        name: 'renders one list item per task',
        code: `const tasks = [{ id: 1, title: 'Buy milk' }, { id: 2, title: 'Walk the dog' }, { id: 3, title: 'Write tests' }];
const { getAllByRole, getByText } = render({ tasks });
expect(getAllByRole('listitem')).toHaveLength(3);
expect(getByText('Buy milk')).toBeTruthy();
expect(getByText('Write tests')).toBeTruthy();`,
      },
      {
        name: 'removes only the clicked task',
        code: `const tasks = [{ id: 1, title: 'Buy milk' }, { id: 2, title: 'Walk the dog' }, { id: 3, title: 'Write tests' }];
const { getByRole, getAllByRole, queryByTestId, getByTestId } = render({ tasks });
fireEvent.click(getByRole('button', { name: 'Remove Walk the dog' }));
expect(getAllByRole('listitem')).toHaveLength(2);
expect(queryByTestId('task-2')).toBeNull();
expect(getByTestId('task-1')).toBeTruthy();
expect(getByTestId('task-3')).toBeTruthy();`,
      },
      {
        name: 'a typed note stays with its row after an earlier row is removed',
        code: `const tasks = [{ id: 1, title: 'Buy milk' }, { id: 2, title: 'Walk the dog' }, { id: 3, title: 'Write tests' }];
const { getByRole, getByTestId } = render({ tasks });
const noteInput = within(getByTestId('task-2')).getByPlaceholderText('Note');
fireEvent.change(noteInput, 'bring the leash');
fireEvent.click(getByRole('button', { name: 'Remove Buy milk' }));
expect(within(getByTestId('task-2')).getByPlaceholderText('Note').value).toBe('bring the leash');
expect(within(getByTestId('task-3')).getByPlaceholderText('Note').value).toBe('');`,
      },
      {
        name: 'shows All done! when the last task is removed',
        code: `const { getByRole, getByText, queryByRole } = render({ tasks: [{ id: 9, title: 'Only one' }] });
fireEvent.click(getByRole('button', { name: 'Remove Only one' }));
expect(getByText('All done!')).toBeTruthy();
expect(queryByRole('list')).toBeNull();`,
      },
    ],
    hint: 'Key each `<li>` by `task.id`, not the array index — React uses the key to decide which DOM row survives a removal.',
    explanation:
      'Rows are keyed by `task.id`, so when the first task is filtered out React keeps the existing DOM nodes for the remaining rows and their uncontrolled inputs retain what was typed. ' +
      'With `key={index}` the keys shift after a removal: row "2" is now rendered into the DOM node that used to be row "1", so the note appears to jump to a different task. ' +
      'Removal uses the functional `setTasks(prev => prev.filter(...))` form so it never depends on a stale closure.',
    solution: `import React, { useState } from 'react';

export default function TaskList({ tasks: initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);

  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  if (tasks.length === 0) return <p>All done!</p>;

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id} data-testid={'task-' + task.id}>
          <span>{task.title}</span>
          <input placeholder="Note" />
          <button aria-label={'Remove ' + task.title} onClick={() => remove(task.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
`,
  },

  {
    id: 'react-inbox-empty-states',
    number: 3,
    title: 'Inbox Empty and Loading States',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement:
      "Build an `Inbox` that takes `loading` (boolean) and `messages` (array of `{ id, subject }`, possibly empty or `null`).\n\n" +
      "Render exactly ONE of these three states — never more than one at a time, and never a stray `0`:\n\n" +
      "- While `loading` is true: a `<p>` reading `Loading...` and nothing else.\n" +
      "- When not loading and there are no messages (empty array or `null`): a `<p>` reading `No messages`.\n" +
      "- Otherwise: a heading `Inbox (N)` where N is the message count, followed by a `<ul>` with one `<li>` per message showing its `subject`.",
    componentName: 'Inbox',
    starter: `import React from 'react';

export default function Inbox({ loading, messages }) {
  // TODO: render the loading state, the empty state, or the list — only one of them
  return <div />;
}
`,
    previewProps: {
      loading: false,
      messages: [
        { id: 1, subject: 'Welcome aboard' },
        { id: 2, subject: 'Your invoice' },
      ],
    },
    tests: [
      {
        name: 'shows only the loading text while loading',
        code: `const { container, getByText, queryByText, queryByRole } = render({ loading: true, messages: [] });
expect(getByText('Loading...')).toBeTruthy();
expect(queryByText('No messages')).toBeNull();
expect(queryByRole('list')).toBeNull();
expect(container.textContent.trim()).toBe('Loading...');`,
      },
      {
        name: 'shows the empty state (and nothing else) for an empty list',
        code: `const { container, getByText, queryByRole } = render({ loading: false, messages: [] });
expect(getByText('No messages')).toBeTruthy();
expect(queryByRole('list')).toBeNull();
expect(container.textContent.trim()).toBe('No messages');`,
      },
      {
        name: 'treats null messages as empty',
        code: `const { getByText } = render({ loading: false, messages: null });
expect(getByText('No messages')).toBeTruthy();`,
      },
      {
        name: 'lists the subjects with a count heading',
        code: `const { getByRole, getAllByRole, queryByText } = render({ loading: false, messages: [{ id: 1, subject: 'Welcome aboard' }, { id: 2, subject: 'Your invoice' }] });
expect(getByRole('heading')).toHaveTextContent('Inbox (2)');
const items = getAllByRole('listitem');
expect(items).toHaveLength(2);
expect(items[0]).toHaveTextContent('Welcome aboard');
expect(queryByText('No messages')).toBeNull();
expect(queryByText('Loading...')).toBeNull();`,
      },
    ],
    hint: 'Early-return each state in order: `if (loading) return ...; if (!messages || messages.length === 0) return ...;` then the list.',
    explanation:
      'Ordered early returns make the three states mutually exclusive and keep the happy-path JSX flat. ' +
      'The trap is chaining `&&` conditions: `{messages.length && <ul/>}` renders a literal `0` when the array is empty, and `{loading && ...}{messages.length === 0 && ...}` shows the loading and empty states together. ' +
      'Normalise `null` with `!messages || messages.length === 0` so the component never throws on a missing prop.',
    solution: `import React from 'react';

export default function Inbox({ loading, messages }) {
  if (loading) return <p>Loading...</p>;
  if (!messages || messages.length === 0) return <p>No messages</p>;
  return (
    <div>
      <h2>Inbox ({messages.length})</h2>
      <ul>
        {messages.map((m) => (
          <li key={m.id}>{m.subject}</li>
        ))}
      </ul>
    </div>
  );
}
`,
  },

  {
    id: 'react-card-children',
    number: 4,
    title: 'Card Wrapper with Children',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement:
      "Build a reusable `Card` wrapper that composes whatever is passed as `children`.\n\n" +
      "Props: `title` (string), `children` (any React content) and an optional `footer` (React content).\n\n" +
      "- Render a `<section>` containing an `<h2>` with the `title`.\n" +
      "- Render `children` inside an element with `data-testid=\"card-body\"`.\n" +
      "- If `footer` is provided, render it inside a `<footer>` element. If it is not provided, do NOT render a `<footer>` element at all (not even an empty one).",
    componentName: 'Card',
    starter: `import React from 'react';

export default function Card({ title, children, footer }) {
  // TODO: section > h2 title, a body that renders children, and an optional footer
  return <section>{title}</section>;
}
`,
    previewProps: { title: 'Weekly summary', footer: 'Updated 5 minutes ago' },
    previewSetup: "return { children: React.createElement('p', null, 'You completed 12 problems this week.') };",
    tests: [
      {
        name: 'renders the title as a heading',
        code: `const { getByRole } = render({ title: 'Profile', children: 'body' });
expect(getByRole('heading')).toHaveTextContent('Profile');`,
      },
      {
        name: 'renders children inside the card body',
        code: `const { getByTestId } = render({ title: 'Profile', children: React.createElement('p', null, 'Ada Lovelace') });
const body = getByTestId('card-body');
expect(within(body).getByText('Ada Lovelace')).toBeTruthy();`,
      },
      {
        name: 'renders no footer element when footer is not provided',
        code: `const { container } = render({ title: 'Profile', children: 'body' });
expect(container.querySelector('footer')).toBeNull();`,
      },
      {
        name: 'renders the footer content when provided',
        code: `const { container, getByText } = render({ title: 'Profile', children: 'body', footer: React.createElement('a', { href: '#' }, 'Edit') });
const footer = container.querySelector('footer');
expect(footer).toBeTruthy();
expect(within(footer).getByText('Edit')).toBeTruthy();`,
      },
    ],
    hint: '`children` is just a prop — put `{children}` where the body goes, and guard the footer with `{footer && <footer>…</footer>}`.',
    explanation:
      'Composition in React is simply rendering the `children` prop somewhere inside your markup; the wrapper does not need to know what it wraps. ' +
      'Optional slots like `footer` should be conditionally rendered so consumers do not get an empty `<footer>` (and its padding/border) when they pass nothing. ' +
      'Always rendering the element and only hiding its content is the common mistake this catches.',
    solution: `import React from 'react';

export default function Card({ title, children, footer }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div data-testid="card-body">{children}</div>
      {footer ? <footer>{footer}</footer> : null}
    </section>
  );
}
`,
  },

  {
    id: 'react-badge-classname-style',
    number: 5,
    title: 'Badge with className and Style Props',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement:
      "Build a `Badge` that renders a `<span data-testid=\"badge\">` showing `label`, styled from props.\n\n" +
      "Props: `label` (string), `variant` (string, default `'neutral'`), optional `color` (CSS colour string) and optional `className`.\n\n" +
      "- The span always has the class `badge` and the class `badge-{variant}` (so `badge badge-success`, or `badge badge-neutral` when no variant is given).\n" +
      "- If a `className` prop is passed, append it — the base classes must be kept.\n" +
      "- If `color` is passed, apply it as the inline `backgroundColor` style. Do not set any inline background when it is absent.",
    componentName: 'Badge',
    starter: `import React from 'react';

export default function Badge({ label, variant, color, className }) {
  // TODO: build the class list from the props and apply color as an inline background
  return <span data-testid="badge">{label}</span>;
}
`,
    previewProps: { label: 'Pro', variant: 'success', color: '#16a34a', className: 'pill' },
    tests: [
      {
        name: 'shows the label with the base and variant classes',
        code: `const { getByTestId } = render({ label: 'New', variant: 'success' });
const badge = getByTestId('badge');
expect(badge).toHaveTextContent('New');
expect(badge).toHaveClass('badge');
expect(badge).toHaveClass('badge-success');`,
      },
      {
        name: 'defaults the variant to neutral',
        code: `const { getByTestId } = render({ label: 'Draft' });
expect(getByTestId('badge')).toHaveClass('badge-neutral');
expect(getByTestId('badge').className).not.toContain('undefined');`,
      },
      {
        name: 'appends an extra className without dropping the base classes',
        code: `const { getByTestId } = render({ label: 'Hot', variant: 'warning', className: 'pill' });
const badge = getByTestId('badge');
expect(badge).toHaveClass('pill');
expect(badge).toHaveClass('badge');
expect(badge).toHaveClass('badge-warning');`,
      },
      {
        name: 'applies color as the inline background',
        code: `const { getByTestId, rerender } = render({ label: 'Hot', color: 'tomato' });
expect(getByTestId('badge').style.backgroundColor).toBe('tomato');
rerender({ label: 'Hot' });
expect(getByTestId('badge').style.backgroundColor).toBe('');`,
      },
    ],
    hint: 'Collect the class names in an array, `.filter(Boolean)` and `.join(" ")`; build the style object only when `color` is set.',
    explanation:
      'Class names are just strings, so the idiomatic pattern is to assemble the list (`["badge", "badge-" + variant, className]`), drop falsy entries and join with spaces. ' +
      'The trap is `className={className}`, which lets the consumer prop replace the base classes instead of extending them. ' +
      'Inline styles are objects with camelCase keys; passing `undefined` (or no style) when `color` is absent leaves the element clean.',
    solution: `import React from 'react';

export default function Badge({ label, variant = 'neutral', color, className }) {
  const classes = ['badge', 'badge-' + variant, className].filter(Boolean).join(' ');
  const style = color ? { backgroundColor: color } : undefined;
  return (
    <span data-testid="badge" className={classes} style={style}>
      {label}
    </span>
  );
}
`,
  },

  {
    id: 'react-avatar-defaults',
    number: 6,
    title: 'Avatar with Default and Optional Props',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement:
      "Build an `Avatar` with a required `name`, an optional `src` and a `size` that defaults to `48`.\n\n" +
      "- When `src` is provided, render an `<img>` with that `src` and `alt` set to `name`.\n" +
      "- Otherwise render a fallback `<div data-testid=\"avatar-fallback\">` showing the person's initials: the first letter of the FIRST word and the first letter of the LAST word of `name`, upper-cased (`Ada Lovelace` → `AL`, `Mary Jane Watson` → `MW`, a single word like `Plato` → `P`).\n" +
      "- Both the image and the fallback get inline `width` and `height` styles of `size` pixels (`48px` when `size` is omitted).",
    componentName: 'Avatar',
    starter: `import React from 'react';

export default function Avatar({ name, src, size }) {
  // TODO: default size to 48, render an <img> when src exists, otherwise the initials fallback
  return <div data-testid="avatar-fallback">{name}</div>;
}
`,
    previewProps: { name: 'Ada Lovelace', size: 64 },
    tests: [
      {
        name: 'shows upper-cased initials of the first and last word',
        code: `const { getByTestId, rerender } = render({ name: 'ada lovelace' });
expect(getByTestId('avatar-fallback')).toHaveTextContent('AL');
expect(getByTestId('avatar-fallback').textContent.trim()).toBe('AL');
rerender({ name: 'Mary Jane Watson' });
expect(getByTestId('avatar-fallback').textContent.trim()).toBe('MW');`,
      },
      {
        name: 'uses a single initial for a single-word name',
        code: `const { getByTestId } = render({ name: 'Plato' });
expect(getByTestId('avatar-fallback').textContent.trim()).toBe('P');`,
      },
      {
        name: 'defaults size to 48px and honours an explicit size',
        code: `const { getByTestId, rerender } = render({ name: 'Ada Lovelace' });
expect(getByTestId('avatar-fallback').style.width).toBe('48px');
expect(getByTestId('avatar-fallback').style.height).toBe('48px');
rerender({ name: 'Ada Lovelace', size: 96 });
expect(getByTestId('avatar-fallback').style.width).toBe('96px');`,
      },
      {
        name: 'renders an image with alt text when src is given',
        code: `const { getByRole, queryByTestId } = render({ name: 'Ada Lovelace', src: 'https://example.com/ada.png' });
const img = getByRole('img', { name: 'Ada Lovelace' });
expect(img).toHaveAttribute('src', 'https://example.com/ada.png');
expect(img.style.width).toBe('48px');
expect(queryByTestId('avatar-fallback')).toBeNull();`,
      },
    ],
    hint: 'Use a default value in the destructuring (`size = 48`); split the name on spaces and take `words[0][0]` and `words[words.length - 1][0]`.',
    explanation:
      'Default values in the destructured parameter list (`{ size = 48 }`) are the idiomatic replacement for `defaultProps` on function components, and optional props are simply checked with a conditional. ' +
      'The initials logic must take the first and last word, not every word, and upper-case the result — mapping over all words gives `MJW` for a three-word name and lower-case input stays lower-case. ' +
      'Numeric `width`/`height` style values are automatically suffixed with `px` by React.',
    solution: `import React from 'react';

function initialsOf(name) {
  const words = String(name).trim().split(' ').filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Avatar({ name, src, size = 48 }) {
  const style = { width: size, height: size };
  if (src) return <img src={src} alt={name} style={style} />;
  return (
    <div data-testid="avatar-fallback" style={style} title={name}>
      {initialsOf(name)}
    </div>
  );
}
`,
  },

  // ───────────────────────────── State & Events ─────────────────────────────
  {
    id: 'react-step-counter',
    number: 7,
    title: 'Counter with Step',
    difficulty: 'Easy',
    topic: 'State & Events',
    statement:
      "Build a `StepCounter` with props `initial` (default `0`) and `step` (default `1`).\n\n" +
      "- Show the current value as `Count: N`.\n" +
      "- Three buttons labelled `Increment`, `Decrement` and `Reset`.\n" +
      "- `Increment` adds `step`, `Decrement` subtracts `step`, and `Reset` returns the count to `initial` (not to zero).",
    componentName: 'StepCounter',
    starter: `import React, { useState } from 'react';

export default function StepCounter({ initial = 0, step = 1 }) {
  // TODO: keep the count in state and wire up the three buttons
  return (
    <div>
      <p>Count: {initial}</p>
    </div>
  );
}
`,
    previewProps: { initial: 10, step: 5 },
    tests: [
      {
        name: 'shows the initial count',
        code: `const { getByText } = render({ initial: 4 });
expect(getByText('Count: 4')).toBeTruthy();`,
      },
      {
        name: 'increments and decrements by the step',
        code: `const { getByText, getByRole } = render({ initial: 0, step: 5 });
fireEvent.click(getByRole('button', { name: 'Increment' }));
fireEvent.click(getByRole('button', { name: 'Increment' }));
expect(getByText('Count: 10')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Decrement' }));
expect(getByText('Count: 5')).toBeTruthy();`,
      },
      {
        name: 'defaults step to 1',
        code: `const { getByText, getByRole } = render({});
fireEvent.click(getByRole('button', { name: 'Increment' }));
expect(getByText('Count: 1')).toBeTruthy();`,
      },
      {
        name: 'Reset returns to the initial value, not zero',
        code: `const { getByText, getByRole } = render({ initial: 7, step: 2 });
fireEvent.click(getByRole('button', { name: 'Increment' }));
fireEvent.click(getByRole('button', { name: 'Increment' }));
expect(getByText('Count: 11')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Reset' }));
expect(getByText('Count: 7')).toBeTruthy();`,
      },
    ],
    hint: '`useState(initial)` seeds the count; use the functional updater `setCount(c => c + step)` and `setCount(initial)` for reset.',
    explanation:
      'The count lives in `useState(initial)` and each handler calls the setter; the functional form `setCount(c => c + step)` is safest because it never reads a stale value. ' +
      'The prop-driven detail people miss is Reset: it must go back to `initial`, which is still available as a prop, rather than hard-coding `0`.',
    solution: `import React, { useState } from 'react';

export default function StepCounter({ initial = 0, step = 1 }) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((c) => c + step)}>Increment</button>
      <button onClick={() => setCount((c) => c - step)}>Decrement</button>
      <button onClick={() => setCount(initial)}>Reset</button>
    </div>
  );
}
`,
  },

  {
    id: 'react-toggle-switch',
    number: 8,
    title: 'Toggle Switch',
    difficulty: 'Easy',
    topic: 'State & Events',
    statement:
      "Build a `Toggle` switch with props `initialOn` (boolean, default `false`) and an optional `onChange` callback.\n\n" +
      "- Render a single `<button role=\"switch\">` whose text is `On` when on and `Off` when off, with `aria-checked` set to `\"true\"` / `\"false\"` accordingly.\n" +
      "- Clicking flips the state.\n" +
      "- After each flip call `onChange(nextValue)` with the NEW boolean value (so the first click on an off switch calls `onChange(true)`).",
    componentName: 'Toggle',
    starter: `import React, { useState } from 'react';

export default function Toggle({ initialOn = false, onChange }) {
  // TODO: hold the on/off state, flip it on click and report the new value via onChange
  return <button role="switch">Off</button>;
}
`,
    previewProps: { initialOn: true },
    previewSetup: "return { onChange: (value) => console.log('toggle ->', value) };",
    tests: [
      {
        name: 'starts off by default with aria-checked false',
        code: `const { getByRole } = render({});
const sw = getByRole('switch');
expect(sw).toHaveTextContent('Off');
expect(sw).toHaveAttribute('aria-checked', 'false');`,
      },
      {
        name: 'flips to on and back on click',
        code: `const { getByRole } = render({});
fireEvent.click(getByRole('switch'));
expect(getByRole('switch')).toHaveTextContent('On');
expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');
fireEvent.click(getByRole('switch'));
expect(getByRole('switch')).toHaveTextContent('Off');`,
      },
      {
        name: 'respects initialOn',
        code: `const { getByRole } = render({ initialOn: true });
expect(getByRole('switch')).toHaveTextContent('On');
expect(getByRole('switch')).toHaveAttribute('aria-checked', 'true');`,
      },
      {
        name: 'calls onChange with the new value on every flip',
        code: `const calls = [];
const { getByRole } = render({ onChange: (v) => calls.push(v) });
fireEvent.click(getByRole('switch'));
fireEvent.click(getByRole('switch'));
fireEvent.click(getByRole('switch'));
expect(calls).toEqual([true, false, true]);`,
      },
    ],
    hint: 'Compute `const next = !on` first, then call both `setOn(next)` and `onChange(next)` with that same value.',
    explanation:
      'State updates are asynchronous: after `setOn(!on)` the `on` variable in the same handler still holds the old value. ' +
      'The trap calls `onChange(on)` (or `onChange(!on)` after a second read) and reports the stale value. Computing `next` once and using it for both the setter and the callback keeps them in sync. ' +
      'Booleans on `aria-*` attributes are stringified by React, so `aria-checked={on}` renders `"true"`/`"false"`.',
    solution: `import React, { useState } from 'react';

export default function Toggle({ initialOn = false, onChange }) {
  const [on, setOn] = useState(initialOn);

  const flip = () => {
    const next = !on;
    setOn(next);
    if (onChange) onChange(next);
  };

  return (
    <button role="switch" aria-checked={on} onClick={flip}>
      {on ? 'On' : 'Off'}
    </button>
  );
}
`,
  },

  {
    id: 'react-controlled-name-echo',
    number: 9,
    title: 'Controlled Input with Live Echo',
    difficulty: 'Easy',
    topic: 'State & Events',
    statement:
      "Build a `NameEcho` component with a controlled text input.\n\n" +
      "- A text input labelled `Your name` (wrap it in a `<label>` or use `htmlFor`).\n" +
      "- Below it a `<p>` that echoes `Hello, {value}!` as the user types, or `Type your name` while the input is empty.\n" +
      "- A button labelled `Clear` that empties BOTH the echo and the input itself (the input's value must actually become empty).",
    componentName: 'NameEcho',
    starter: `import React, { useState } from 'react';

export default function NameEcho() {
  // TODO: controlled input, live echo, and a Clear button that resets it
  return (
    <div>
      <label>
        Your name <input />
      </label>
      <p>Type your name</p>
      <button>Clear</button>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'shows the placeholder message when empty',
        code: `const { getByText, getByLabelText } = render();
expect(getByText('Type your name')).toBeTruthy();
expect(getByLabelText('Your name').value).toBe('');`,
      },
      {
        name: 'echoes what the user types',
        code: `const { getByText, getByLabelText, queryByText } = render();
fireEvent.change(getByLabelText('Your name'), 'Ada');
expect(getByText('Hello, Ada!')).toBeTruthy();
expect(queryByText('Type your name')).toBeNull();
fireEvent.change(getByLabelText('Your name'), 'Ada L');
expect(getByText('Hello, Ada L!')).toBeTruthy();`,
      },
      {
        name: 'Clear resets both the echo and the input value',
        code: `const { getByText, getByLabelText, getByRole } = render();
const input = getByLabelText('Your name');
fireEvent.change(input, 'Ada');
fireEvent.click(getByRole('button', { name: 'Clear' }));
expect(getByText('Type your name')).toBeTruthy();
expect(input.value).toBe('');
expect(input).toHaveValue('');`,
      },
    ],
    hint: 'A controlled input passes BOTH `value={name}` and `onChange` — then `setName("")` clears the field too.',
    explanation:
      'A controlled input takes its `value` from state and reports edits through `onChange`; React is the single source of truth, so setting the state to `""` clears the DOM field as well. ' +
      'The trap wires `onChange` but omits `value`: the echo updates because state changes, yet Clear only resets the state and the input keeps its text because the DOM owns it.',
    solution: `import React, { useState } from 'react';

export default function NameEcho() {
  const [name, setName] = useState('');
  return (
    <div>
      <label>
        Your name <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <p>{name ? 'Hello, ' + name + '!' : 'Type your name'}</p>
      <button onClick={() => setName('')}>Clear</button>
    </div>
  );
}
`,
  },

  {
    id: 'react-todo-add-remove',
    number: 10,
    title: 'Todo List Add and Remove',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build a `TodoList` that starts empty.\n\n" +
      "- A text input with placeholder `What needs doing?` and a button labelled `Add`.\n" +
      "- Clicking `Add` (or pressing `Enter` in the input) appends the trimmed text as a new todo and clears the input. Blank or whitespace-only text is ignored.\n" +
      "- Show a `<p>` reading `N todos` (e.g. `0 todos`, `2 todos`).\n" +
      "- Render the todos in a `<ul>`; each `<li>` shows the text inside a `<span>` and a button with `aria-label` `Remove {text}` that deletes just that todo.\n" +
      "- Never mutate the todos array in place.",
    componentName: 'TodoList',
    starter: `import React, { useState } from 'react';

export default function TodoList() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);

  // TODO: add (button + Enter), ignore blanks, remove by id, keep the count in sync
  return (
    <div>
      <input placeholder="What needs doing?" value={text} onChange={(e) => setText(e.target.value)} />
      <button>Add</button>
      <p>{todos.length} todos</p>
      <ul />
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'adds a todo, updates the count and clears the input',
        code: `const { getByPlaceholderText, getByRole, getByText, getAllByRole } = render();
const input = getByPlaceholderText('What needs doing?');
fireEvent.change(input, '  Buy milk ');
fireEvent.click(getByRole('button', { name: 'Add' }));
expect(getByText('Buy milk')).toBeTruthy();
expect(getByText('1 todos')).toBeTruthy();
expect(getAllByRole('listitem')).toHaveLength(1);
expect(input.value).toBe('');`,
      },
      {
        name: 'ignores blank input',
        code: `const { getByPlaceholderText, getByRole, getByText, queryByRole } = render();
fireEvent.change(getByPlaceholderText('What needs doing?'), '   ');
fireEvent.click(getByRole('button', { name: 'Add' }));
expect(getByText('0 todos')).toBeTruthy();
expect(queryByRole('listitem')).toBeNull();`,
      },
      {
        name: 'adds on Enter',
        code: `const { getByPlaceholderText, getByText } = render();
const input = getByPlaceholderText('What needs doing?');
fireEvent.change(input, 'Walk the dog');
fireEvent.keyDown(input, 'Enter');
expect(getByText('Walk the dog')).toBeTruthy();
expect(getByText('1 todos')).toBeTruthy();`,
      },
      {
        name: 'removes only the chosen todo',
        code: `const { getByPlaceholderText, getByRole, getByText, queryByText, getAllByRole } = render();
const input = getByPlaceholderText('What needs doing?');
['One', 'Two', 'Three'].forEach((t) => { fireEvent.change(input, t); fireEvent.click(getByRole('button', { name: 'Add' })); });
expect(getAllByRole('listitem')).toHaveLength(3);
fireEvent.click(getByRole('button', { name: 'Remove Two' }));
expect(queryByText('Two')).toBeNull();
expect(getByText('One')).toBeTruthy();
expect(getByText('Three')).toBeTruthy();
expect(getByText('2 todos')).toBeTruthy();`,
      },
    ],
    hint: 'Build a new array every time: `setTodos(prev => [...prev, todo])` to add and `prev.filter(t => t.id !== id)` to remove. Give each todo an id from a `useRef` counter.',
    explanation:
      'React only re-renders when it receives a new state value, so arrays must be replaced (`[...prev, item]`, `prev.filter(...)`) rather than mutated. ' +
      'The trap does `todos.push(item); setTodos(todos)` — same reference, so React bails out and the new todo never appears. ' +
      'A `useRef` counter gives each todo a stable id to key by and to remove by, and the Enter key is handled with `onKeyDown` checking `e.key === "Enter"`.',
    solution: `import React, { useState, useRef } from 'react';

export default function TodoList() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState([]);
  const nextId = useRef(1);

  const add = () => {
    const value = text.trim();
    if (!value) return;
    const id = nextId.current++;
    setTodos((prev) => [...prev, { id, text: value }]);
    setText('');
  };

  const remove = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  return (
    <div>
      <input
        placeholder="What needs doing?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
      />
      <button onClick={add}>Add</button>
      <p>{todos.length} todos</p>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text}</span>
            <button aria-label={'Remove ' + todo.text} onClick={() => remove(todo.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },

  {
    id: 'react-select-all-checkboxes',
    number: 11,
    title: 'Checkbox List with Select All',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build a `SelectAll` component for `items` — an array of `{ id, name }`.\n\n" +
      "- A master checkbox labelled `Select all`, and one checkbox per item labelled with the item's `name`.\n" +
      "- Checking the master selects every item; unchecking it clears the selection.\n" +
      "- The master checkbox must be DERIVED from the selection: it is checked exactly when every item is selected — so checking all items one by one checks it, and unchecking any single item unchecks it.\n" +
      "- Show a `<p>` reading `N selected`.",
    componentName: 'SelectAll',
    starter: `import React, { useState } from 'react';

export default function SelectAll({ items }) {
  // TODO: track the selected ids; derive the master checkbox from them
  return (
    <div>
      <label>
        <input type="checkbox" /> Select all
      </label>
      <p>0 selected</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" /> {item.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
    previewProps: {
      items: [
        { id: 'a', name: 'Apples' },
        { id: 'b', name: 'Bananas' },
        { id: 'c', name: 'Cherries' },
      ],
    },
    tests: [
      {
        name: 'Select all checks every item and updates the count',
        code: `const items = [{ id: 'a', name: 'Apples' }, { id: 'b', name: 'Bananas' }, { id: 'c', name: 'Cherries' }];
const { getByLabelText, getByText } = render({ items });
fireEvent.click(getByLabelText('Select all'));
expect(getByLabelText('Apples').checked).toBe(true);
expect(getByLabelText('Bananas').checked).toBe(true);
expect(getByLabelText('Cherries').checked).toBe(true);
expect(getByText('3 selected')).toBeTruthy();`,
      },
      {
        name: 'unchecking one item unchecks Select all',
        code: `const items = [{ id: 'a', name: 'Apples' }, { id: 'b', name: 'Bananas' }, { id: 'c', name: 'Cherries' }];
const { getByLabelText, getByText } = render({ items });
fireEvent.click(getByLabelText('Select all'));
fireEvent.click(getByLabelText('Bananas'));
expect(getByLabelText('Select all').checked).toBe(false);
expect(getByLabelText('Bananas').checked).toBe(false);
expect(getByLabelText('Apples').checked).toBe(true);
expect(getByText('2 selected')).toBeTruthy();`,
      },
      {
        name: 'checking every item individually checks Select all',
        code: `const items = [{ id: 'a', name: 'Apples' }, { id: 'b', name: 'Bananas' }];
const { getByLabelText, getByText } = render({ items });
fireEvent.click(getByLabelText('Apples'));
expect(getByLabelText('Select all').checked).toBe(false);
fireEvent.click(getByLabelText('Bananas'));
expect(getByLabelText('Select all').checked).toBe(true);
expect(getByText('2 selected')).toBeTruthy();`,
      },
      {
        name: 'unchecking Select all clears everything',
        code: `const items = [{ id: 'a', name: 'Apples' }, { id: 'b', name: 'Bananas' }];
const { getByLabelText, getByText } = render({ items });
fireEvent.click(getByLabelText('Apples'));
fireEvent.click(getByLabelText('Bananas'));
fireEvent.click(getByLabelText('Select all'));
expect(getByLabelText('Apples').checked).toBe(false);
expect(getByLabelText('Bananas').checked).toBe(false);
expect(getByText('0 selected')).toBeTruthy();`,
      },
    ],
    hint: 'Keep only the set of selected ids in state; `allSelected = items.length > 0 && selected.size === items.length` is computed on each render, never stored.',
    explanation:
      'The only real state is which ids are selected; whether "all" are selected is derived from it during render. ' +
      'The trap keeps a second `allSelected` boolean in state and only flips it from the master checkbox, so it drifts out of sync when the user checks items individually or unchecks one after selecting all. ' +
      'Deriving avoids the whole class of "two sources of truth" bugs.',
    solution: `import React, { useState } from 'react';

export default function SelectAll({ items }) {
  const [selected, setSelected] = useState(() => new Set());
  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <label>
        <input type="checkbox" checked={allSelected} onChange={toggleAll} /> Select all
      </label>
      <p>{selected.size} selected</p>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} /> {item.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
  },

  {
    id: 'react-tabs',
    number: 12,
    title: 'Tabs',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build a `Tabs` component that takes `tabs` — an array of `{ label, content }` (content is a string).\n\n" +
      "- Render one `<button role=\"tab\">` per tab showing its `label`, inside a container with `role=\"tablist\"`.\n" +
      "- Exactly one tab is active at a time; the first tab is active initially. The active tab has `aria-selected=\"true\"`, all others `aria-selected=\"false\"`.\n" +
      "- Render a single element with `role=\"tabpanel\"` containing ONLY the active tab's `content`.\n" +
      "- Clicking a tab makes it active.",
    componentName: 'Tabs',
    starter: `import React, { useState } from 'react';

export default function Tabs({ tabs }) {
  // TODO: track the active index; render the tab buttons and one panel
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab) => (
          <button key={tab.label} role="tab" aria-selected="false">
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" />
    </div>
  );
}
`,
    previewProps: {
      tabs: [
        { label: 'Profile', content: 'Name, email and avatar settings.' },
        { label: 'Billing', content: 'Plan, invoices and payment method.' },
        { label: 'Notifications', content: 'Email and push preferences.' },
      ],
    },
    tests: [
      {
        name: 'shows the first tab as selected with its content',
        code: `const tabs = [{ label: 'Profile', content: 'Profile settings' }, { label: 'Billing', content: 'Billing settings' }];
const { getByRole, queryByText } = render({ tabs });
expect(getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
expect(getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'false');
expect(getByRole('tabpanel')).toHaveTextContent('Profile settings');
expect(queryByText('Billing settings')).toBeNull();`,
      },
      {
        name: 'clicking a tab switches the panel content',
        code: `const tabs = [{ label: 'Profile', content: 'Profile settings' }, { label: 'Billing', content: 'Billing settings' }];
const { getByRole, queryByText } = render({ tabs });
fireEvent.click(getByRole('tab', { name: 'Billing' }));
expect(getByRole('tabpanel')).toHaveTextContent('Billing settings');
expect(queryByText('Profile settings')).toBeNull();`,
      },
      {
        name: 'moves aria-selected to the clicked tab',
        code: `const tabs = [{ label: 'Profile', content: 'P' }, { label: 'Billing', content: 'B' }, { label: 'Team', content: 'T' }];
const { getByRole, getAllByRole } = render({ tabs });
fireEvent.click(getByRole('tab', { name: 'Team' }));
expect(getByRole('tab', { name: 'Team' })).toHaveAttribute('aria-selected', 'true');
expect(getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'false');
expect(getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
expect(getAllByRole('tabpanel')).toHaveLength(1);`,
      },
    ],
    hint: 'Store the active INDEX in state and pass a fresh arrow function to each `onClick={() => setActive(i)}`.',
    explanation:
      'One piece of state — the active index — drives both the `aria-selected` attributes and which content the single panel shows. ' +
      'The trap writes `onClick={setActive(i)}`, which CALLS the setter during render instead of passing a handler; every render schedules another update and React throws "Too many re-renders". ' +
      'Wrapping the call in an arrow function defers it until the click actually happens.',
    solution: `import React, { useState } from 'react';

export default function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, i) => (
          <button key={tab.label} role="tab" aria-selected={i === active} onClick={() => setActive(i)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs[active].content}</div>
    </div>
  );
}
`,
  },

  {
    id: 'react-accordion',
    number: 13,
    title: 'Accordion',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build an `Accordion` from `sections` — an array of `{ title, content }` — with an `allowMultiple` prop (default `false`).\n\n" +
      "- Each section has a header `<button>` showing its `title` with `aria-expanded` `\"true\"` when open and `\"false\"` when closed.\n" +
      "- A section's `content` is rendered ONLY while it is open (not just hidden). All sections start closed.\n" +
      "- Clicking a closed header opens it; clicking an open header closes it.\n" +
      "- When `allowMultiple` is false (the default), opening a section closes any other open section. When it is true, any number of sections can be open at once.",
    componentName: 'Accordion',
    starter: `import React, { useState } from 'react';

export default function Accordion({ sections, allowMultiple = false }) {
  // TODO: track which sections are open; honour allowMultiple
  return (
    <div>
      {sections.map((section) => (
        <div key={section.title}>
          <button aria-expanded="false">{section.title}</button>
        </div>
      ))}
    </div>
  );
}
`,
    previewProps: {
      sections: [
        { title: 'What is Algogo?', content: 'A CS interview-prep app.' },
        { title: 'Is it free?', content: 'The core tracks are free; Pro unlocks the rest.' },
        { title: 'Which languages?', content: 'Python, JavaScript, Java, C++ and more.' },
      ],
      allowMultiple: false,
    },
    tests: [
      {
        name: 'starts with every section closed',
        code: `const sections = [{ title: 'Shipping', content: 'Ships in 2 days' }, { title: 'Returns', content: '30-day returns' }];
const { getByRole, queryByText } = render({ sections });
expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'false');
expect(getByRole('button', { name: 'Returns' })).toHaveAttribute('aria-expanded', 'false');
expect(queryByText('Ships in 2 days')).toBeNull();
expect(queryByText('30-day returns')).toBeNull();`,
      },
      {
        name: 'clicking a header opens it and clicking again closes it',
        code: `const sections = [{ title: 'Shipping', content: 'Ships in 2 days' }, { title: 'Returns', content: '30-day returns' }];
const { getByRole, getByText, queryByText } = render({ sections });
fireEvent.click(getByRole('button', { name: 'Shipping' }));
expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'true');
expect(getByText('Ships in 2 days')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Shipping' }));
expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'false');
expect(queryByText('Ships in 2 days')).toBeNull();`,
      },
      {
        name: 'only one section is open at a time by default',
        code: `const sections = [{ title: 'Shipping', content: 'Ships in 2 days' }, { title: 'Returns', content: '30-day returns' }];
const { getByRole, getByText, queryByText } = render({ sections });
fireEvent.click(getByRole('button', { name: 'Shipping' }));
fireEvent.click(getByRole('button', { name: 'Returns' }));
expect(getByText('30-day returns')).toBeTruthy();
expect(queryByText('Ships in 2 days')).toBeNull();
expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'allowMultiple keeps several sections open',
        code: `const sections = [{ title: 'Shipping', content: 'Ships in 2 days' }, { title: 'Returns', content: '30-day returns' }];
const { getByRole, getByText } = render({ sections, allowMultiple: true });
fireEvent.click(getByRole('button', { name: 'Shipping' }));
fireEvent.click(getByRole('button', { name: 'Returns' }));
expect(getByText('Ships in 2 days')).toBeTruthy();
expect(getByText('30-day returns')).toBeTruthy();
expect(getByRole('button', { name: 'Shipping' })).toHaveAttribute('aria-expanded', 'true');
expect(getByRole('button', { name: 'Returns' })).toHaveAttribute('aria-expanded', 'true');`,
      },
    ],
    hint: 'Store a `Set` of open indexes. On toggle, start from `allowMultiple ? new Set(prev) : new Set()` and add/delete the clicked index.',
    explanation:
      'A `Set` of open indexes models both modes with one piece of state: in single mode the toggle starts from an empty set so opening one closes the rest, in multiple mode it copies the previous set first. ' +
      'The trap stores a single `openIndex` number and ignores `allowMultiple`, which can never represent two open sections. ' +
      'Rendering content with `{isOpen && <div>…</div>}` keeps closed sections out of the DOM entirely.',
    solution: `import React, { useState } from 'react';

export default function Accordion({ sections, allowMultiple = false }) {
  const [open, setOpen] = useState(() => new Set());

  const toggle = (index) => {
    setOpen((prev) => {
      const next = allowMultiple ? new Set(prev) : new Set();
      if (prev.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div>
      {sections.map((section, i) => {
        const isOpen = open.has(i);
        return (
          <div key={section.title}>
            <button aria-expanded={isOpen} onClick={() => toggle(i)}>
              {section.title}
            </button>
            {isOpen && <div>{section.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
`,
  },

  {
    id: 'react-character-limit',
    number: 14,
    title: 'Character Counter with Limit',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build a `LimitedMessage` composer with a `maxLength` prop (default `20`).\n\n" +
      "- A `<textarea>` labelled `Message` (controlled).\n" +
      "- A `<p data-testid=\"count\">` showing `{length}/{maxLength}`, e.g. `0/20`, `7/20`.\n" +
      "- A button labelled `Send`. It is disabled while the trimmed message is empty OR the message is longer than `maxLength`. A message of exactly `maxLength` characters is allowed.\n" +
      "- When the message is over the limit, also show a `<p>` reading `Over the limit`. Do not truncate the input — let the user see and fix it.",
    componentName: 'LimitedMessage',
    starter: `import React, { useState } from 'react';

export default function LimitedMessage({ maxLength = 20 }) {
  const [text, setText] = useState('');
  // TODO: counter, over-limit warning and the disabled logic for Send
  return (
    <div>
      <label>
        Message <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p data-testid="count">0/{maxLength}</p>
      <button>Send</button>
    </div>
  );
}
`,
    previewProps: { maxLength: 30 },
    tests: [
      {
        name: 'starts at 0 with Send disabled',
        code: `const { getByTestId, getByRole } = render({ maxLength: 20 });
expect(getByTestId('count')).toHaveTextContent('0/20');
expect(getByRole('button', { name: 'Send' })).toBeDisabled();`,
      },
      {
        name: 'counts characters and enables Send',
        code: `const { getByTestId, getByRole, getByLabelText, queryByText } = render({ maxLength: 20 });
fireEvent.change(getByLabelText('Message'), 'Hello!!');
expect(getByTestId('count')).toHaveTextContent('7/20');
expect(getByRole('button', { name: 'Send' })).not.toBeDisabled();
expect(queryByText('Over the limit')).toBeNull();`,
      },
      {
        name: 'allows exactly maxLength characters',
        code: `const { getByTestId, getByRole, getByLabelText, queryByText } = render({ maxLength: 10 });
fireEvent.change(getByLabelText('Message'), '0123456789');
expect(getByTestId('count')).toHaveTextContent('10/10');
expect(getByRole('button', { name: 'Send' })).not.toBeDisabled();
expect(queryByText('Over the limit')).toBeNull();`,
      },
      {
        name: 'disables Send and warns when over the limit',
        code: `const { getByTestId, getByRole, getByLabelText, getByText } = render({ maxLength: 10 });
fireEvent.change(getByLabelText('Message'), '0123456789X');
expect(getByTestId('count')).toHaveTextContent('11/10');
expect(getByRole('button', { name: 'Send' })).toBeDisabled();
expect(getByText('Over the limit')).toBeTruthy();`,
      },
      {
        name: 'keeps Send disabled for whitespace-only text',
        code: `const { getByRole, getByLabelText } = render({ maxLength: 10 });
fireEvent.change(getByLabelText('Message'), '    ');
expect(getByRole('button', { name: 'Send' })).toBeDisabled();`,
      },
    ],
    hint: 'Derive `over = text.length > maxLength` and `canSend = text.trim().length > 0 && !over` during render; pass `disabled={!canSend}`.',
    explanation:
      'Everything besides the text itself is derived: the count, the over-limit flag and the disabled state are computed from `text` on every render, so they can never disagree. ' +
      'The classic off-by-one is `text.length >= maxLength`, which rejects a message that is exactly at the limit — the spec (and the test) allow it. ' +
      'Disabling the button rather than clamping the textarea lets users see what they need to trim.',
    solution: `import React, { useState } from 'react';

export default function LimitedMessage({ maxLength = 20 }) {
  const [text, setText] = useState('');
  const over = text.length > maxLength;
  const canSend = text.trim().length > 0 && !over;

  return (
    <div>
      <label>
        Message <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <p data-testid="count">
        {text.length}/{maxLength}
      </p>
      {over && <p role="alert">Over the limit</p>}
      <button disabled={!canSend}>Send</button>
    </div>
  );
}
`,
  },

  {
    id: 'react-signup-form-submit',
    number: 15,
    title: 'Form Submit with onSubmit Prop',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement:
      "Build a `SignupForm` that collects an email and a password and hands them to an `onSubmit` prop.\n\n" +
      "- A `<form>` with two controlled inputs labelled `Email` and `Password`, and a submit button labelled `Sign up`.\n" +
      "- On submit, prevent the browser's default navigation, then call `onSubmit({ email, password })` with the trimmed email and the password exactly as typed.\n" +
      "- If EITHER field is empty (after trimming the email), do not call `onSubmit`; instead show a `<p>` reading `Both fields are required`. The message disappears once a valid submission happens.",
    componentName: 'SignupForm',
    starter: `import React, { useState } from 'react';

export default function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // TODO: handle submit (preventDefault, validate, call onSubmit with an object)
  return (
    <form>
      <label>
        Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Sign up</button>
    </form>
  );
}
`,
    previewProps: {},
    previewSetup: "return { onSubmit: (values) => console.log('submitted', values) };",
    tests: [
      {
        name: 'calls onSubmit with the entered values',
        code: `const calls = [];
const { getByLabelText, getByRole } = render({ onSubmit: (v) => calls.push(v) });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.change(getByLabelText('Password'), 'hunter2');
fireEvent.click(getByRole('button', { name: 'Sign up' }));
expect(calls).toHaveLength(1);
expect(calls[0]).toEqual({ email: 'ada@example.com', password: 'hunter2' });`,
      },
      {
        name: 'trims the email before submitting',
        code: `const calls = [];
const { getByLabelText, getByRole } = render({ onSubmit: (v) => calls.push(v) });
fireEvent.change(getByLabelText('Email'), '  ada@example.com  ');
fireEvent.change(getByLabelText('Password'), 'pw');
fireEvent.submit(getByRole('form'));
expect(calls[0].email).toBe('ada@example.com');`,
      },
      {
        name: 'does not submit when the password is missing',
        code: `const calls = [];
const { getByLabelText, getByRole, getByText } = render({ onSubmit: (v) => calls.push(v) });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('button', { name: 'Sign up' }));
expect(calls).toHaveLength(0);
expect(getByText('Both fields are required')).toBeTruthy();`,
      },
      {
        name: 'does not submit when the email is missing',
        code: `const calls = [];
const { getByLabelText, getByRole, getByText } = render({ onSubmit: (v) => calls.push(v) });
fireEvent.change(getByLabelText('Password'), 'hunter2');
fireEvent.submit(getByRole('form'));
expect(calls).toHaveLength(0);
expect(getByText('Both fields are required')).toBeTruthy();`,
      },
      {
        name: 'clears the error after a valid submission',
        code: `const calls = [];
const { getByLabelText, getByRole, queryByText } = render({ onSubmit: (v) => calls.push(v) });
fireEvent.submit(getByRole('form'));
expect(queryByText('Both fields are required')).toBeTruthy();
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.change(getByLabelText('Password'), 'hunter2');
fireEvent.submit(getByRole('form'));
expect(queryByText('Both fields are required')).toBeNull();
expect(calls).toHaveLength(1);`,
      },
    ],
    hint: 'Handle `onSubmit` on the `<form>` (not `onClick` on the button), call `e.preventDefault()`, and validate with `if (!email.trim() || !password)`.',
    explanation:
      'Attaching the handler to the form\'s `onSubmit` means both the button click and the Enter key go through the same path; `preventDefault()` stops the page from reloading. ' +
      'Validation must reject when EITHER field is empty — the trap checks `!email && !password`, which only fires when both are blank and happily submits an empty password. ' +
      'Passing a single object to `onSubmit` keeps the callback contract easy to extend.',
    solution: `import React, { useState } from 'react';

export default function SignupForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Both fields are required');
      return;
    }
    setError('');
    onSubmit({ email: cleanEmail, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
`,
  },

  // ───────────────────────────── Effects & Lifecycle ─────────────────────────────
  {
    id: 'react-document-title-sync',
    number: 16,
    title: 'Document Title from State',
    difficulty: 'Easy',
    topic: 'Effects & Lifecycle',
    statement:
      "Build a `PageTitle` editor that keeps `document.title` in sync with a text field — using an effect, not render-time side effects.\n\n" +
      "- A controlled text input labelled `Page title`.\n" +
      "- Show a `<p>` reading `Title: {value}`, or `Title: Untitled` when the field is empty.\n" +
      "- Whenever the value changes, set `document.title` to the value (or `Untitled` when empty).\n" +
      "- When the component unmounts, restore `document.title` to whatever it was before the component mounted.",
    componentName: 'PageTitle',
    starter: `import React, { useState, useEffect } from 'react';

export default function PageTitle() {
  const [title, setTitle] = useState('');

  // TODO: sync document.title in an effect and restore the previous title on unmount

  return (
    <div>
      <label>
        Page title <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <p>Title: {title || 'Untitled'}</p>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'sets the document title to Untitled on mount',
        code: `document.title = 'Before';
const { getByText } = render();
await tick();
expect(document.title).toBe('Untitled');
expect(getByText('Title: Untitled')).toBeTruthy();`,
      },
      {
        name: 'mirrors what the user types into document.title',
        code: `document.title = 'Before';
const { getByLabelText, getByText } = render();
fireEvent.change(getByLabelText('Page title'), 'Dashboard');
await waitFor(() => expect(document.title).toBe('Dashboard'));
expect(getByText('Title: Dashboard')).toBeTruthy();
fireEvent.change(getByLabelText('Page title'), '');
await waitFor(() => expect(document.title).toBe('Untitled'));`,
      },
      {
        name: 'restores the previous title on unmount',
        code: `document.title = 'Before';
const { getByLabelText, unmount } = render();
fireEvent.change(getByLabelText('Page title'), 'Dashboard');
await waitFor(() => expect(document.title).toBe('Dashboard'));
unmount();
await tick();
expect(document.title).toBe('Before');`,
      },
    ],
    hint: 'Two effects: one with `[]` deps that captures the old title and returns a cleanup restoring it; one with `[title]` deps that writes the new title.',
    explanation:
      'Touching `document.title` is a side effect, so it belongs in `useEffect` rather than in the render body. A `[title]`-dependent effect writes the new value after each change. ' +
      'A separate mount-only effect captures the original title and returns a cleanup that restores it, which is the standard pattern for undoing anything you did to the outside world. ' +
      'The trap assigns the title during render: it appears to work but there is no cleanup, so the old title is lost when the component leaves.',
    solution: `import React, { useState, useEffect } from 'react';

export default function PageTitle() {
  const [title, setTitle] = useState('');

  useEffect(() => {
    const previous = document.title;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    document.title = title || 'Untitled';
  }, [title]);

  return (
    <div>
      <label>
        Page title <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <p>Title: {title || 'Untitled'}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-interval-ticker',
    number: 17,
    title: 'Interval Ticker with Cleanup',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement:
      "Build a `Ticker` that counts up on an interval while running.\n\n" +
      "Props: `intervalMs` (default `50`) and an optional `onTick` callback.\n\n" +
      "- Show `<p data-testid=\"ticks\">Ticks: N</p>`, starting at `Ticks: 0`.\n" +
      "- Buttons labelled `Start`, `Stop` and `Reset`. Nothing ticks until `Start` is clicked.\n" +
      "- While running, increase the count by 1 every `intervalMs` milliseconds — the count must keep climbing (2, 3, 4 …), not get stuck at 1.\n" +
      "- After every tick, call `onTick(newCount)` if it was provided.\n" +
      "- `Stop` pauses; `Reset` sets the count back to 0.\n" +
      "- The interval must be cleared when stopped and when the component unmounts — no ticks (and no `onTick` calls) may happen after unmount.",
    componentName: 'Ticker',
    starter: `import React, { useState, useEffect } from 'react';

export default function Ticker({ intervalMs = 50, onTick }) {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);

  // TODO: set up the interval in an effect while running, clean it up, and report ticks via onTick

  return (
    <div>
      <p data-testid="ticks">Ticks: {ticks}</p>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Stop</button>
      <button onClick={() => setTicks(0)}>Reset</button>
    </div>
  );
}
`,
    previewProps: { intervalMs: 500 },
    previewSetup: "return { onTick: (n) => console.log('tick', n) };",
    tests: [
      {
        name: 'does not tick before Start is clicked',
        code: `const { getByTestId } = render({ intervalMs: 20 });
await sleep(120);
expect(getByTestId('ticks')).toHaveTextContent('Ticks: 0');`,
      },
      {
        name: 'keeps counting up after Start',
        code: `const { getByTestId, getByRole } = render({ intervalMs: 20 });
const count = () => Number(getByTestId('ticks').textContent.replace('Ticks: ', ''));
fireEvent.click(getByRole('button', { name: 'Start' }));
await waitFor(() => expect(count()).toBeGreaterThanOrEqual(3));`,
      },
      {
        name: 'Stop freezes the count',
        code: `const { getByTestId, getByRole } = render({ intervalMs: 20 });
const count = () => Number(getByTestId('ticks').textContent.replace('Ticks: ', ''));
fireEvent.click(getByRole('button', { name: 'Start' }));
await waitFor(() => expect(count()).toBeGreaterThanOrEqual(2));
fireEvent.click(getByRole('button', { name: 'Stop' }));
await tick();
const frozen = count();
await sleep(120);
expect(count()).toBe(frozen);`,
      },
      {
        name: 'reports each tick through onTick and stops after unmount',
        code: `const calls = [];
const { getByRole, unmount } = render({ intervalMs: 20, onTick: (n) => calls.push(n) });
fireEvent.click(getByRole('button', { name: 'Start' }));
await waitFor(() => expect(calls.length).toBeGreaterThanOrEqual(2));
expect(calls[0]).toBe(1);
expect(calls[1]).toBe(2);
unmount();
const after = calls.length;
await sleep(120);
expect(calls.length).toBe(after);`,
      },
      {
        name: 'Reset returns to zero',
        code: `const { getByTestId, getByRole } = render({ intervalMs: 20 });
const count = () => Number(getByTestId('ticks').textContent.replace('Ticks: ', ''));
fireEvent.click(getByRole('button', { name: 'Start' }));
await waitFor(() => expect(count()).toBeGreaterThanOrEqual(2));
fireEvent.click(getByRole('button', { name: 'Stop' }));
fireEvent.click(getByRole('button', { name: 'Reset' }));
expect(getByTestId('ticks')).toHaveTextContent('Ticks: 0');`,
      },
    ],
    hint: 'Inside `setInterval` use the functional updater `setTicks(t => t + 1)` so the callback never sees a stale count; return `() => clearInterval(id)` from the effect.',
    explanation:
      'The effect runs whenever `running` (or `intervalMs`) changes: it starts the interval and returns a cleanup that clears it, which handles Stop, prop changes and unmount alike. ' +
      'The trap writes `setTicks(ticks + 1)` inside the interval — the callback closed over `ticks === 0` when the effect ran, so every tick sets the count to 1 and it never climbs. ' +
      'The functional updater avoids the stale closure, and a small `[ticks]`-dependent effect reports the new value through `onTick` without making the updater impure.',
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function Ticker({ intervalMs = 50, onTick }) {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  });

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTicks((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [running, intervalMs]);

  useEffect(() => {
    if (ticks > 0 && onTickRef.current) onTickRef.current(ticks);
  }, [ticks]);

  return (
    <div>
      <p data-testid="ticks">Ticks: {ticks}</p>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Stop</button>
      <button onClick={() => setTicks(0)}>Reset</button>
    </div>
  );
}
`,
  },

  {
    id: 'react-debounced-search',
    number: 18,
    title: 'Debounced Search Input',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement:
      "Build a `DebouncedSearch` that waits for the user to stop typing before it 'searches'.\n\n" +
      "Props: `delay` in ms (default `50`) and an optional `onSearch` callback.\n\n" +
      "- A controlled text input labelled `Search`.\n" +
      "- Keep a separate DEBOUNCED value that only updates once the input has been unchanged for `delay` ms. Show `Searching for: {debounced}` in a `<p>`, or `Type to search` while the debounced value is empty.\n" +
      "- Call `onSearch(debounced)` each time the debounced value changes to a non-empty string. Typing `r`, `re`, `rea` with pauses shorter than `delay` must produce ONE call with `rea`, not three.\n" +
      "- Implement the debounce with `useEffect` + `setTimeout`, clearing the pending timeout whenever the input changes or the component unmounts.",
    componentName: 'DebouncedSearch',
    starter: `import React, { useState, useEffect } from 'react';

export default function DebouncedSearch({ delay = 50, onSearch }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  // TODO: debounce query into debounced with a timeout effect (with cleanup), then notify onSearch

  return (
    <div>
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <p>{debounced ? 'Searching for: ' + debounced : 'Type to search'}</p>
    </div>
  );
}
`,
    previewProps: { delay: 300 },
    previewSetup: "return { onSearch: (q) => console.log('search:', q) };",
    tests: [
      {
        name: 'does not update the debounced value immediately',
        code: `const { getByLabelText, getByText, queryByText } = render({ delay: 50 });
fireEvent.change(getByLabelText('Search'), 'react');
expect(queryByText('Searching for: react')).toBeNull();
expect(getByText('Type to search')).toBeTruthy();`,
      },
      {
        name: 'shows the value after the delay',
        code: `const { getByLabelText, getByText } = render({ delay: 50 });
fireEvent.change(getByLabelText('Search'), 'react');
await waitFor(() => expect(getByText('Searching for: react')).toBeTruthy());`,
      },
      {
        name: 'rapid typing produces a single onSearch call with the final value',
        code: `const calls = [];
const { getByLabelText } = render({ delay: 80, onSearch: (q) => calls.push(q) });
const input = getByLabelText('Search');
fireEvent.change(input, 'r');
await sleep(25);
fireEvent.change(input, 're');
await sleep(25);
fireEvent.change(input, 'rea');
await sleep(300);
expect(calls).toEqual(['rea']);`,
      },
      {
        name: 'does not call onSearch on mount for the empty value',
        code: `const calls = [];
render({ delay: 20, onSearch: (q) => calls.push(q) });
await sleep(100);
expect(calls).toEqual([]);`,
      },
    ],
    hint: 'In the effect: `const id = setTimeout(() => setDebounced(query), delay); return () => clearTimeout(id);` with `[query, delay]` deps.',
    explanation:
      'Each keystroke re-runs the effect; the cleanup from the previous run clears the pending timeout, so only the last one survives long enough to fire. ' +
      'The trap schedules the timeout but returns no cleanup, so every intermediate value (`r`, `re`, `rea`) eventually lands and `onSearch` fires three times. ' +
      'Notifying from a second effect keyed on `debounced` keeps the callback out of the timer and skips the initial empty value.',
    solution: `import React, { useState, useEffect, useRef } from 'react';

export default function DebouncedSearch({ delay = 50, onSearch }) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), delay);
    return () => clearTimeout(id);
  }, [query, delay]);

  useEffect(() => {
    if (debounced && onSearchRef.current) onSearchRef.current(debounced);
  }, [debounced]);

  return (
    <div>
      <label>
        Search <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <p>{debounced ? 'Searching for: ' + debounced : 'Type to search'}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-subscribe-unsubscribe',
    number: 19,
    title: 'Subscribe and Unsubscribe',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement:
      "Build a `LiveValue` that displays values pushed from an external source.\n\n" +
      "Props: `subscribe` — a function `subscribe(callback) => unsubscribe`; it will call `callback(value)` whenever a new value arrives and returns a function that cancels the subscription — and `label` (default `'Value'`).\n\n" +
      "- On mount, call `subscribe` exactly once with a callback that stores the latest value in state.\n" +
      "- Show `Waiting...` until the first value arrives, then `{label}: {value}` (e.g. `Value: 42`).\n" +
      "- Call the returned unsubscribe function when the component unmounts, and also when the `subscribe` prop changes (before subscribing to the new one).",
    componentName: 'LiveValue',
    starter: `import React, { useState, useEffect } from 'react';

export default function LiveValue({ subscribe, label = 'Value' }) {
  const [value, setValue] = useState(null);

  // TODO: subscribe in an effect and unsubscribe in its cleanup

  return <p>{value === null ? 'Waiting...' : label + ': ' + value}</p>;
}
`,
    previewProps: { label: 'Time' },
    previewSetup:
      "return { subscribe: (cb) => { const id = setInterval(() => cb(new Date().toLocaleTimeString()), 1000); return () => clearInterval(id); } };",
    tests: [
      {
        name: 'subscribes once on mount and shows Waiting...',
        code: `const listeners = [];
const subscribe = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
const { getByText } = render({ subscribe });
expect(getByText('Waiting...')).toBeTruthy();
expect(listeners).toHaveLength(1);`,
      },
      {
        name: 'renders values pushed by the source',
        code: `const listeners = [];
const subscribe = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
const { getByText } = render({ subscribe });
act(() => { listeners.forEach((l) => l(42)); });
expect(getByText('Value: 42')).toBeTruthy();
act(() => { listeners.forEach((l) => l(43)); });
expect(getByText('Value: 43')).toBeTruthy();`,
      },
      {
        name: 'uses the label prop',
        code: `const listeners = [];
const subscribe = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
const { getByText } = render({ subscribe, label: 'Price' });
act(() => { listeners.forEach((l) => l(9.5)); });
expect(getByText('Price: 9.5')).toBeTruthy();`,
      },
      {
        name: 'unsubscribes on unmount',
        code: `const listeners = [];
const subscribe = (fn) => { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn), 1); };
const { unmount } = render({ subscribe });
expect(listeners).toHaveLength(1);
unmount();
expect(listeners).toHaveLength(0);`,
      },
      {
        name: 'switches sources when the subscribe prop changes',
        code: `const a = [], b = [];
const subA = (fn) => { a.push(fn); return () => a.splice(a.indexOf(fn), 1); };
const subB = (fn) => { b.push(fn); return () => b.splice(b.indexOf(fn), 1); };
const { rerender, getByText } = render({ subscribe: subA });
rerender({ subscribe: subB });
expect(a).toHaveLength(0);
expect(b).toHaveLength(1);
act(() => { b.forEach((l) => l('hello')); });
expect(getByText('Value: hello')).toBeTruthy();`,
      },
    ],
    hint: '`useEffect(() => { const unsubscribe = subscribe(setValue); return unsubscribe; }, [subscribe])` — returning the unsubscribe IS the cleanup.',
    explanation:
      'Subscriptions are the canonical `useEffect` use case: subscribe in the effect body and return the unsubscribe function as the cleanup. ' +
      'React calls that cleanup on unmount and before re-running the effect when `subscribe` changes, which is exactly what switching sources needs. ' +
      'The trap subscribes but never returns the unsubscribe, leaking a listener that keeps calling `setState` on an unmounted component.',
    solution: `import React, { useState, useEffect } from 'react';

export default function LiveValue({ subscribe, label = 'Value' }) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribe((next) => setValue(next));
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribe]);

  return <p>{value === null ? 'Waiting...' : label + ': ' + value}</p>;
}
`,
  },

  {
    id: 'react-effect-on-prop-change',
    number: 20,
    title: 'Effect That Re-runs on Prop Change',
    difficulty: 'Medium',
    topic: 'Effects & Lifecycle',
    statement:
      "Build a `ViewTracker` that reports page views to analytics callbacks — and only when the page actually changes.\n\n" +
      "Props: `pageId` (string), `onEnter(pageId)`, `onLeave(pageId)` and an unrelated `theme` (string, default `'light'`) used only as a class name.\n\n" +
      "- Render `<p className={theme}>Viewing: {pageId}</p>`.\n" +
      "- Call `onEnter(pageId)` once when the component mounts and again whenever `pageId` changes.\n" +
      "- Before reacting to a new `pageId`, and on unmount, call `onLeave` with the PREVIOUS `pageId`.\n" +
      "- Re-rendering with the same `pageId` (for example only `theme` changed) must NOT trigger any calls.",
    componentName: 'ViewTracker',
    starter: `import React, { useEffect } from 'react';

export default function ViewTracker({ pageId, onEnter, onLeave, theme = 'light' }) {
  // TODO: an effect that enters on mount / pageId change and leaves in its cleanup

  return <p className={theme}>Viewing: {pageId}</p>;
}
`,
    previewProps: { pageId: 'home', theme: 'light' },
    previewSetup: "return { onEnter: (id) => console.log('enter', id), onLeave: (id) => console.log('leave', id) };",
    tests: [
      {
        name: 'calls onEnter once on mount',
        code: `const enters = [], leaves = [];
const onEnter = (id) => enters.push(id);
const onLeave = (id) => leaves.push(id);
const { getByText } = render({ pageId: 'home', onEnter, onLeave });
expect(getByText('Viewing: home')).toBeTruthy();
expect(enters).toEqual(['home']);
expect(leaves).toEqual([]);`,
      },
      {
        name: 'ignores re-renders where pageId did not change',
        code: `const enters = [], leaves = [];
const onEnter = (id) => enters.push(id);
const onLeave = (id) => leaves.push(id);
const { rerender, getByText } = render({ pageId: 'home', onEnter, onLeave, theme: 'light' });
rerender({ pageId: 'home', onEnter, onLeave, theme: 'dark' });
rerender({ pageId: 'home', onEnter, onLeave, theme: 'light' });
expect(getByText('Viewing: home').className).toBe('light');
expect(enters).toEqual(['home']);
expect(leaves).toEqual([]);`,
      },
      {
        name: 'leaves the old page and enters the new one when pageId changes',
        code: `const enters = [], leaves = [];
const onEnter = (id) => enters.push(id);
const onLeave = (id) => leaves.push(id);
const { rerender, getByText } = render({ pageId: 'home', onEnter, onLeave });
rerender({ pageId: 'about', onEnter, onLeave });
expect(getByText('Viewing: about')).toBeTruthy();
expect(leaves).toEqual(['home']);
expect(enters).toEqual(['home', 'about']);`,
      },
      {
        name: 'leaves the current page on unmount',
        code: `const enters = [], leaves = [];
const onEnter = (id) => enters.push(id);
const onLeave = (id) => leaves.push(id);
const { unmount } = render({ pageId: 'pricing', onEnter, onLeave });
unmount();
expect(leaves).toEqual(['pricing']);
expect(enters).toEqual(['pricing']);`,
      },
    ],
    hint: 'Put `pageId` in the dependency array and return `() => onLeave(pageId)` from the effect — the cleanup closes over the OLD id.',
    explanation:
      'A dependency array of `[pageId]` tells React to re-run the effect only when that value changes; before it does, React runs the previous cleanup, whose closure still holds the previous `pageId` — so `onLeave` naturally reports the old page. ' +
      'Omitting the dependency array (the trap) runs the effect after every render, so a theme change fires a spurious leave/enter pair; an empty array would never react to a new page at all.',
    solution: `import React, { useEffect } from 'react';

export default function ViewTracker({ pageId, onEnter, onLeave, theme = 'light' }) {
  useEffect(() => {
    onEnter(pageId);
    return () => onLeave(pageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  return <p className={theme}>Viewing: {pageId}</p>;
}
`,
  },

  // ───────────────────────────── Derived & Lists ─────────────────────────────
  {
    id: 'react-search-filter-list',
    number: 21,
    title: 'Search Filter List',
    difficulty: 'Easy',
    topic: 'Derived & Lists',
    statement:
      "Build a `FilterList` that filters a list of strings as the user types.\n\n" +
      "Props: `items` — an array of strings.\n\n" +
      "- A controlled text input labelled `Filter`.\n" +
      "- Show a `<p>` reading `Showing X of Y` (visible count / total count).\n" +
      "- Render the matching items in a `<ul>` (one `<li>` each). An item matches when it contains the query, case-insensitively; an empty query shows everything.\n" +
      "- When nothing matches, render `No matches` instead of the list.\n" +
      "- The filter must be derived from the query on each render — clearing or shortening the query must bring items back.",
    componentName: 'FilterList',
    starter: `import React, { useState } from 'react';

export default function FilterList({ items }) {
  const [query, setQuery] = useState('');

  // TODO: derive the visible items from query + items and render the count/list/empty state
  return (
    <div>
      <label>
        Filter <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <p>Showing {items.length} of {items.length}</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
`,
    previewProps: { items: ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Pineapple'] },
    tests: [
      {
        name: 'shows every item with an empty query',
        code: `const { getAllByRole, getByText } = render({ items: ['Apple', 'Banana', 'Cherry'] });
expect(getAllByRole('listitem')).toHaveLength(3);
expect(getByText('Showing 3 of 3')).toBeTruthy();`,
      },
      {
        name: 'filters case-insensitively',
        code: `const { getByLabelText, getAllByRole, getByText, queryByText } = render({ items: ['Apple', 'Banana', 'Pineapple'] });
fireEvent.change(getByLabelText('Filter'), 'APP');
const items = getAllByRole('listitem');
expect(items).toHaveLength(2);
expect(getByText('Apple')).toBeTruthy();
expect(getByText('Pineapple')).toBeTruthy();
expect(queryByText('Banana')).toBeNull();
expect(getByText('Showing 2 of 3')).toBeTruthy();`,
      },
      {
        name: 'shows No matches when nothing matches',
        code: `const { getByLabelText, getByText, queryByRole } = render({ items: ['Apple', 'Banana'] });
fireEvent.change(getByLabelText('Filter'), 'zzz');
expect(getByText('No matches')).toBeTruthy();
expect(queryByRole('list')).toBeNull();
expect(getByText('Showing 0 of 2')).toBeTruthy();`,
      },
      {
        name: 'brings items back when the query is shortened or cleared',
        code: `const { getByLabelText, getAllByRole, getByText } = render({ items: ['Apple', 'Banana', 'Cherry'] });
const input = getByLabelText('Filter');
fireEvent.change(input, 'ban');
expect(getAllByRole('listitem')).toHaveLength(1);
fireEvent.change(input, 'b');
expect(getAllByRole('listitem')).toHaveLength(1);
fireEvent.change(input, '');
expect(getAllByRole('listitem')).toHaveLength(3);
fireEvent.change(input, 'e');
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getByText('Showing 2 of 3')).toBeTruthy();`,
      },
    ],
    hint: 'Only the `query` needs state. Compute `visible = items.filter(i => i.toLowerCase().includes(query.toLowerCase()))` inline in the render.',
    explanation:
      'The filtered list is derived data: keep just the query in state and compute the visible items from `items` + `query` on every render. ' +
      'The trap stores the filtered array in state and filters it again on each keystroke (`setVisible(visible.filter(...))`), so items that were dropped can never come back when the user deletes characters. ' +
      'Derived values are always consistent with their inputs and need no synchronisation code.',
    solution: `import React, { useState } from 'react';

export default function FilterList({ items }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((item) => item.toLowerCase().includes(q)) : items;

  return (
    <div>
      <label>
        Filter <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <p>
        Showing {visible.length} of {items.length}
      </p>
      {visible.length === 0 ? (
        <p>No matches</p>
      ) : (
        <ul>
          {visible.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
  },

  {
    id: 'react-sortable-table',
    number: 22,
    title: 'Sortable Table',
    difficulty: 'Hard',
    topic: 'Derived & Lists',
    statement:
      "Build a `SortableTable` for `rows` — an array of `{ name: string, age: number }`.\n\n" +
      "- Render a `<table>`. The header row has two `<button>`s whose text STARTS with `Name` and `Age` respectively (you may append a ` ▲` / ` ▼` suffix to show the current direction).\n" +
      "- Each body row is a `<tr data-testid=\"row\">` with the name in the first `<td>` and the age in the second.\n" +
      "- Initially the rows appear in the order given (no sort).\n" +
      "- Clicking a header sorts ascending by that column; clicking the SAME header again flips to descending; clicking the other header sorts ascending by that column.\n" +
      "- Sort names alphabetically and ages NUMERICALLY (5 before 30 before 100).\n" +
      "- Never mutate the `rows` prop — sort a copy.",
    componentName: 'SortableTable',
    starter: `import React, { useState, useMemo } from 'react';

export default function SortableTable({ rows }) {
  // TODO: track the sort column + direction, derive a sorted copy and render it
  return (
    <table>
      <thead>
        <tr>
          <th><button>Name</button></th>
          <th><button>Age</button></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name} data-testid="row">
            <td>{row.name}</td>
            <td>{row.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`,
    previewProps: {
      rows: [
        { name: 'Charlie', age: 34 },
        { name: 'Ada', age: 5 },
        { name: 'Bob', age: 100 },
        { name: 'Dana', age: 27 },
      ],
    },
    tests: [
      {
        name: 'keeps the given order before any sort',
        code: `const rows = [{ name: 'Charlie', age: 34 }, { name: 'Ada', age: 5 }, { name: 'Bob', age: 100 }];
const { getAllByTestId } = render({ rows });
const names = getAllByTestId('row').map((r) => r.querySelector('td').textContent);
expect(names).toEqual(['Charlie', 'Ada', 'Bob']);`,
      },
      {
        name: 'sorts by name ascending, then descending on a second click',
        code: `const rows = [{ name: 'Charlie', age: 34 }, { name: 'Ada', age: 5 }, { name: 'Bob', age: 100 }];
const { getAllByTestId, getByRole } = render({ rows });
const names = () => getAllByTestId('row').map((r) => r.querySelector('td').textContent);
fireEvent.click(getByRole('button', { name: /^Name/ }));
expect(names()).toEqual(['Ada', 'Bob', 'Charlie']);
fireEvent.click(getByRole('button', { name: /^Name/ }));
expect(names()).toEqual(['Charlie', 'Bob', 'Ada']);`,
      },
      {
        name: 'sorts ages numerically, not as strings',
        code: `const rows = [{ name: 'Charlie', age: 34 }, { name: 'Ada', age: 5 }, { name: 'Bob', age: 100 }];
const { getAllByTestId, getByRole } = render({ rows });
const ages = () => getAllByTestId('row').map((r) => r.querySelectorAll('td')[1].textContent);
fireEvent.click(getByRole('button', { name: /^Age/ }));
expect(ages()).toEqual(['5', '34', '100']);
fireEvent.click(getByRole('button', { name: /^Age/ }));
expect(ages()).toEqual(['100', '34', '5']);`,
      },
      {
        name: 'switching columns resets to ascending',
        code: `const rows = [{ name: 'Charlie', age: 34 }, { name: 'Ada', age: 5 }, { name: 'Bob', age: 100 }];
const { getAllByTestId, getByRole } = render({ rows });
const names = () => getAllByTestId('row').map((r) => r.querySelector('td').textContent);
fireEvent.click(getByRole('button', { name: /^Age/ }));
fireEvent.click(getByRole('button', { name: /^Age/ }));
expect(names()).toEqual(['Bob', 'Charlie', 'Ada']);
fireEvent.click(getByRole('button', { name: /^Name/ }));
expect(names()).toEqual(['Ada', 'Bob', 'Charlie']);`,
      },
      {
        name: 'does not mutate the rows prop',
        code: `const rows = [{ name: 'Charlie', age: 34 }, { name: 'Ada', age: 5 }, { name: 'Bob', age: 100 }];
const { getByRole } = render({ rows });
fireEvent.click(getByRole('button', { name: /^Name/ }));
expect(rows.map((r) => r.name)).toEqual(['Charlie', 'Ada', 'Bob']);`,
      },
    ],
    hint: 'State: `{ key, dir }`. Derive `sorted` with `useMemo` from `[...rows].sort(comparator)`, where the comparator subtracts numbers and uses `localeCompare` for strings.',
    explanation:
      'The sort configuration (column + direction) is the only state; the sorted rows are derived with `useMemo` from a COPY of the prop (`[...rows]`) so the parent\'s array is untouched. ' +
      'The trap relies on `Array.prototype.sort()` without a comparator, which converts values to strings — so ages sort as `100, 34, 5` — and sorts `rows` in place, mutating the prop. ' +
      'A comparator that subtracts numbers and `localeCompare`s strings, negated for descending, handles both columns.',
    solution: `import React, { useState, useMemo } from 'react';

function compare(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export default function SortableTable({ rows }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const result = compare(a[sort.key], b[sort.key]);
      return sort.dir === 'asc' ? result : -result;
    });
    return copy;
  }, [rows, sort]);

  const clickHeader = (key) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const arrow = (key) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <table>
      <thead>
        <tr>
          <th><button onClick={() => clickHeader('name')}>Name{arrow('name')}</button></th>
          <th><button onClick={() => clickHeader('age')}>Age{arrow('age')}</button></th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.name} data-testid="row">
            <td>{row.name}</td>
            <td>{row.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
`,
  },

  {
    id: 'react-pagination',
    number: 23,
    title: 'Pagination with Page Size',
    difficulty: 'Medium',
    topic: 'Derived & Lists',
    statement:
      "Build a `Paginated` list.\n\n" +
      "Props: `items` (array of strings) and `pageSize` (default `3`).\n\n" +
      "- Render only the current page's items in a `<ul>` (one `<li>` each). Page 1 shows the first `pageSize` items.\n" +
      "- Show `Page X of Y` where Y is the total number of pages (round UP — 7 items with a page size of 3 is 3 pages; an empty list is `Page 1 of 1`).\n" +
      "- Buttons labelled `Prev` and `Next`. `Prev` is disabled on the first page, `Next` is disabled on the last page.\n" +
      "- The last page shows whatever items remain (it may be shorter than `pageSize`).",
    componentName: 'Paginated',
    starter: `import React, { useState } from 'react';

export default function Paginated({ items, pageSize = 3 }) {
  const [page, setPage] = useState(1);

  // TODO: compute the page count and the visible slice; wire Prev/Next with bounds
  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>Page {page} of 1</p>
      <button>Prev</button>
      <button>Next</button>
    </div>
  );
}
`,
    previewProps: { items: ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf'], pageSize: 3 },
    tests: [
      {
        name: 'shows the first page with Prev disabled',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, getByText } = render({ items, pageSize: 3 });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
expect(getByText('Page 1 of 3')).toBeTruthy();
expect(getByRole('button', { name: 'Prev' })).toBeDisabled();
expect(getByRole('button', { name: 'Next' })).not.toBeDisabled();`,
      },
      {
        name: 'Next and Prev move between pages',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, getByText } = render({ items, pageSize: 3 });
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['d', 'e', 'f']);
expect(getByText('Page 2 of 3')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Prev' }));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['a', 'b', 'c']);`,
      },
      {
        name: 'the last page shows the remainder and disables Next',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, getByText } = render({ items, pageSize: 3 });
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['g']);
expect(getByText('Page 3 of 3')).toBeTruthy();
expect(getByRole('button', { name: 'Next' })).toBeDisabled();`,
      },
      {
        name: 'defaults pageSize to 3 and handles an exact multiple',
        code: `const { getAllByRole, getByRole, getByText } = render({ items: ['a', 'b', 'c', 'd', 'e', 'f'] });
expect(getAllByRole('listitem')).toHaveLength(3);
expect(getByText('Page 1 of 2')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByText('Page 2 of 2')).toBeTruthy();
expect(getByRole('button', { name: 'Next' })).toBeDisabled();`,
      },
      {
        name: 'an empty list is Page 1 of 1 with both buttons disabled',
        code: `const { getByRole, getByText, queryByRole } = render({ items: [], pageSize: 3 });
expect(getByText('Page 1 of 1')).toBeTruthy();
expect(queryByRole('listitem')).toBeNull();
expect(getByRole('button', { name: 'Prev' })).toBeDisabled();
expect(getByRole('button', { name: 'Next' })).toBeDisabled();`,
      },
    ],
    hint: '`pageCount = Math.max(1, Math.ceil(items.length / pageSize))`; slice with `items.slice((page - 1) * pageSize, page * pageSize)`.',
    explanation:
      'Only the current page number is state; the page count and the visible slice are derived from `items`, `pageSize` and `page` during render. ' +
      'The page count must round UP with `Math.ceil` — the trap uses `Math.floor`, which silently drops the partial last page (7 items / 3 per page shows only 2 pages and item `g` is never reachable). ' +
      'Disabling the buttons from the same derived values keeps navigation within bounds.',
    solution: `import React, { useState } from 'react';

export default function Paginated({ items, pageSize = 3 }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  return (
    <div>
      <ul>
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>
        Page {page} of {pageCount}
      </p>
      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
        Prev
      </button>
      <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
        Next
      </button>
    </div>
  );
}
`,
  },

  {
    id: 'react-cart-totals-usememo',
    number: 24,
    title: 'Cart Totals with useMemo',
    difficulty: 'Hard',
    topic: 'Derived & Lists',
    statement:
      "Build a `Cart` whose totals are derived with `useMemo`.\n\n" +
      "Props: `items` — an array of `{ id, name, price, qty }` (copied into state on mount) — and `taxRate` (default `0.1`).\n\n" +
      "- Render one `<li>` per item showing its `name`, a `<span data-testid=\"qty-{id}\">` with the quantity, and two buttons with `aria-label`s `Increase {name}` and `Decrease {name}`. Quantity never drops below 1.\n" +
      "- Below the list show four `<p>`s: `Items: N` (sum of quantities), `Subtotal: $X.XX`, `Tax: $X.XX` (subtotal × taxRate) and `Total: $X.XX` (subtotal + tax). Format every amount with exactly two decimals (`toFixed(2)`).\n" +
      "- Compute the totals with `useMemo` and correct dependencies, and update items immutably (never mutate the item objects).",
    componentName: 'Cart',
    starter: `import React, { useState, useMemo } from 'react';

export default function Cart({ items: initialItems, taxRate = 0.1 }) {
  const [items, setItems] = useState(initialItems);

  // TODO: quantity handlers (min 1), memoised totals, two-decimal formatting

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span data-testid={'qty-' + item.id}>{item.qty}</span>
          </li>
        ))}
      </ul>
      <p>Items: 0</p>
      <p>Subtotal: $0.00</p>
      <p>Tax: $0.00</p>
      <p>Total: $0.00</p>
    </div>
  );
}
`,
    previewProps: {
      items: [
        { id: 'book', name: 'Book', price: 19.99, qty: 1 },
        { id: 'pen', name: 'Pen', price: 5.49, qty: 2 },
      ],
      taxRate: 0.1,
    },
    tests: [
      {
        name: 'shows the initial totals with two decimals',
        code: `const items = [{ id: 'book', name: 'Book', price: 19.99, qty: 1 }, { id: 'pen', name: 'Pen', price: 5.49, qty: 2 }];
const { getByText } = render({ items, taxRate: 0.1 });
expect(getByText('Items: 3')).toBeTruthy();
expect(getByText('Subtotal: $30.97')).toBeTruthy();
expect(getByText('Tax: $3.10')).toBeTruthy();
expect(getByText('Total: $34.07')).toBeTruthy();`,
      },
      {
        name: 'increasing a quantity recomputes the totals',
        code: `const items = [{ id: 'book', name: 'Book', price: 19.99, qty: 1 }, { id: 'pen', name: 'Pen', price: 5.49, qty: 2 }];
const { getByText, getByRole, getByTestId } = render({ items, taxRate: 0.1 });
fireEvent.click(getByRole('button', { name: 'Increase Book' }));
expect(getByTestId('qty-book')).toHaveTextContent('2');
expect(getByText('Items: 4')).toBeTruthy();
expect(getByText('Subtotal: $50.96')).toBeTruthy();
expect(getByText('Tax: $5.10')).toBeTruthy();
expect(getByText('Total: $56.06')).toBeTruthy();`,
      },
      {
        name: 'decreasing never goes below 1',
        code: `const items = [{ id: 'book', name: 'Book', price: 19.99, qty: 1 }, { id: 'pen', name: 'Pen', price: 5.49, qty: 2 }];
const { getByText, getByRole, getByTestId } = render({ items, taxRate: 0.1 });
fireEvent.click(getByRole('button', { name: 'Decrease Pen' }));
fireEvent.click(getByRole('button', { name: 'Decrease Pen' }));
fireEvent.click(getByRole('button', { name: 'Decrease Pen' }));
expect(getByTestId('qty-pen')).toHaveTextContent('1');
expect(getByText('Items: 2')).toBeTruthy();
expect(getByText('Subtotal: $25.48')).toBeTruthy();
expect(getByText('Total: $28.03')).toBeTruthy();`,
      },
      {
        name: 'uses the taxRate prop and defaults it to 0.1',
        code: `const items = [{ id: 'x', name: 'Widget', price: 10, qty: 1 }];
const { getByText, rerender } = render({ items, taxRate: 0.2 });
expect(getByText('Tax: $2.00')).toBeTruthy();
expect(getByText('Total: $12.00')).toBeTruthy();
rerender({ items });
expect(getByText('Tax: $1.00')).toBeTruthy();
expect(getByText('Total: $11.00')).toBeTruthy();`,
      },
      {
        name: 'does not mutate the original item objects',
        code: `const items = [{ id: 'book', name: 'Book', price: 19.99, qty: 1 }];
const { getByRole, getByTestId } = render({ items, taxRate: 0.1 });
fireEvent.click(getByRole('button', { name: 'Increase Book' }));
expect(getByTestId('qty-book')).toHaveTextContent('2');
expect(items[0].qty).toBe(1);`,
      },
    ],
    hint: '`useMemo(() => { const subtotal = items.reduce(...); const tax = subtotal * taxRate; return { subtotal, tax, total: subtotal + tax, count }; }, [items, taxRate])`.',
    explanation:
      '`useMemo` caches a derived value and recomputes it only when its dependencies change — so `items` and `taxRate` MUST be listed. ' +
      'The trap passes `[]`, which freezes the totals at their mount-time values even though the quantities on screen keep changing. ' +
      'Updating a quantity maps to a new array with a new object (`{ ...item, qty }`) so the memo sees a new `items` reference and the original objects stay untouched; `toFixed(2)` hides floating-point noise like `50.959999`.',
    solution: `import React, { useState, useMemo } from 'react';

const money = (n) => '$' + n.toFixed(2);

export default function Cart({ items: initialItems, taxRate = 0.1 }) {
  const [items, setItems] = useState(initialItems);

  const changeQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item))
    );
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const tax = subtotal * taxRate;
    return { subtotal, tax, total: subtotal + tax, count };
  }, [items, taxRate]);

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <button aria-label={'Decrease ' + item.name} onClick={() => changeQty(item.id, -1)}>-</button>
            <span data-testid={'qty-' + item.id}>{item.qty}</span>
            <button aria-label={'Increase ' + item.name} onClick={() => changeQty(item.id, 1)}>+</button>
            <span>{money(item.price * item.qty)}</span>
          </li>
        ))}
      </ul>
      <p>Items: {totals.count}</p>
      <p>Subtotal: {money(totals.subtotal)}</p>
      <p>Tax: {money(totals.tax)}</p>
      <p>Total: {money(totals.total)}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-group-by-rendering',
    number: 25,
    title: 'Group-By Rendering',
    difficulty: 'Hard',
    topic: 'Derived & Lists',
    statement:
      "Build `GroupedContacts`, which renders a flat list of contacts grouped under headings by a chosen field.\n\n" +
      "Props: `contacts` — an array of `{ name, city, team }` — and `keys` — the fields the user can group by (default `['city', 'team']`; the first is selected initially).\n\n" +
      "- A `<select>` labelled `Group by` with one `<option>` per key (value and text both the key).\n" +
      "- For each distinct value of the selected field render a `<section data-testid=\"group\">` with an `<h3>` reading `{value} ({count})` and a `<ul>` of the member names (one `<li>` each).\n" +
      "- Groups must be ordered alphabetically by their value, and the names inside each group alphabetically — regardless of the order the contacts came in.\n" +
      "- Changing the select regroups immediately. Derive the grouping from props + the selected key (use `useMemo`); do not store the groups in state.",
    componentName: 'GroupedContacts',
    starter: `import React, { useState, useMemo } from 'react';

export default function GroupedContacts({ contacts, keys = ['city', 'team'] }) {
  const [groupBy, setGroupBy] = useState(keys[0]);

  // TODO: derive sorted groups (and sorted names) for the selected key and render them

  return (
    <div>
      <label>
        Group by{' '}
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          {keys.map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </label>
      <ul>
        {contacts.map((c) => (
          <li key={c.name}>{c.name}</li>
        ))}
      </ul>
    </div>
  );
}
`,
    previewProps: {
      contacts: [
        { name: 'Zoe', city: 'Tokyo', team: 'Design' },
        { name: 'Ada', city: 'Berlin', team: 'Engineering' },
        { name: 'Liam', city: 'Lisbon', team: 'Design' },
        { name: 'Bea', city: 'Berlin', team: 'Sales' },
        { name: 'Kai', city: 'Tokyo', team: 'Engineering' },
      ],
      keys: ['city', 'team'],
    },
    tests: [
      {
        name: 'renders one group per distinct value, alphabetically, with counts',
        code: `const contacts = [
  { name: 'Zoe', city: 'Tokyo', team: 'Design' }, { name: 'Ada', city: 'Berlin', team: 'Engineering' },
  { name: 'Liam', city: 'Lisbon', team: 'Design' }, { name: 'Bea', city: 'Berlin', team: 'Sales' },
  { name: 'Kai', city: 'Tokyo', team: 'Engineering' }];
const { getAllByRole, getAllByTestId } = render({ contacts });
expect(getAllByTestId('group')).toHaveLength(3);
expect(getAllByRole('heading').map((h) => h.textContent)).toEqual(['Berlin (2)', 'Lisbon (1)', 'Tokyo (2)']);`,
      },
      {
        name: 'sorts the names within each group',
        code: `const contacts = [
  { name: 'Zoe', city: 'Tokyo', team: 'Design' }, { name: 'Ada', city: 'Berlin', team: 'Engineering' },
  { name: 'Kai', city: 'Tokyo', team: 'Engineering' }, { name: 'Bea', city: 'Berlin', team: 'Sales' }];
const { getAllByTestId } = render({ contacts });
const groups = getAllByTestId('group');
expect(within(groups[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Ada', 'Bea']);
expect(within(groups[1]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Kai', 'Zoe']);`,
      },
      {
        name: 'regroups when the select changes',
        code: `const contacts = [
  { name: 'Zoe', city: 'Tokyo', team: 'Design' }, { name: 'Ada', city: 'Berlin', team: 'Engineering' },
  { name: 'Liam', city: 'Lisbon', team: 'Design' }, { name: 'Bea', city: 'Berlin', team: 'Sales' },
  { name: 'Kai', city: 'Tokyo', team: 'Engineering' }];
const { getByLabelText, getAllByRole, getAllByTestId } = render({ contacts });
fireEvent.change(getByLabelText('Group by'), 'team');
expect(getByLabelText('Group by').value).toBe('team');
expect(getAllByRole('heading').map((h) => h.textContent)).toEqual(['Design (2)', 'Engineering (2)', 'Sales (1)']);
expect(within(getAllByTestId('group')[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Liam', 'Zoe']);`,
      },
      {
        name: 'offers exactly the keys given as options',
        code: `const contacts = [{ name: 'Ada', city: 'Berlin', team: 'Engineering', level: 'Senior' }];
const { getAllByRole, getByLabelText } = render({ contacts, keys: ['team', 'level'] });
expect(getAllByRole('option').map((o) => o.value)).toEqual(['team', 'level']);
expect(getByLabelText('Group by').value).toBe('team');
expect(getAllByRole('heading').map((h) => h.textContent)).toEqual(['Engineering (1)']);`,
      },
      {
        name: 'reflects new contacts passed in props',
        code: `const contacts = [{ name: 'Ada', city: 'Berlin', team: 'Engineering' }];
const { rerender, getAllByRole } = render({ contacts });
rerender({ contacts: [...contacts, { name: 'Amir', city: 'Berlin', team: 'Sales' }, { name: 'Cy', city: 'Cairo', team: 'Sales' }] });
expect(getAllByRole('heading').map((h) => h.textContent)).toEqual(['Berlin (2)', 'Cairo (1)']);`,
      },
    ],
    hint: 'Reduce contacts into a `Map` of value → names, then turn it into an array, sort the array by value and sort each names list. Wrap it in `useMemo` keyed on `[contacts, groupBy]`.',
    explanation:
      'Grouping is pure derivation: build a `Map` from the selected field to its member names, convert to an array, then sort the groups by their key and the names within each group. ' +
      'Because the result depends only on `contacts` and `groupBy`, `useMemo` with those dependencies caches it between unrelated renders and stays correct when either input changes. ' +
      'The trap groups into a plain object and renders `Object.keys(...)` — insertion order, not alphabetical — and never sorts the names, so the output depends on the incoming order.',
    solution: `import React, { useState, useMemo } from 'react';

export default function GroupedContacts({ contacts, keys = ['city', 'team'] }) {
  const [groupBy, setGroupBy] = useState(keys[0]);

  const groups = useMemo(() => {
    const byValue = new Map();
    contacts.forEach((contact) => {
      const value = String(contact[groupBy]);
      if (!byValue.has(value)) byValue.set(value, []);
      byValue.get(value).push(contact.name);
    });
    return Array.from(byValue.entries())
      .map(([value, names]) => ({ value, names: [...names].sort((a, b) => a.localeCompare(b)) }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [contacts, groupBy]);

  return (
    <div>
      <label>
        Group by{' '}
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          {keys.map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </label>
      {groups.map((group) => (
        <section key={group.value} data-testid="group">
          <h3>{group.value} ({group.names.length})</h3>
          <ul>
            {group.names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
`,
  },
  // ---------------------------------------------------------------- Forms
  {
    id: 'react-signup-validation',
    number: 26,
    title: 'Signup Form Validation',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`SignupForm({ onSubmit })\` — a controlled form with three fields and validation messages that appear only after the user tries to submit.

**Fields** (each an \`<input>\` inside a \`<label>\`): "Email", "Password", "Confirm password". Submit button text: "Create account".

**On submit** run these checks and render every failing message in its own \`<p role="alert">\`:
- Email empty → "Email is required"; email without "@" → "Enter a valid email".
- Password shorter than 8 characters → "Password must be at least 8 characters".
- Confirm password different from password → "Passwords do not match".

If anything fails, do **not** call \`onSubmit\`. If everything passes, call \`onSubmit({ email, password })\` exactly once, clear the alerts and show "Account created". No alerts should be visible before the first submit attempt.`,
    componentName: 'SignupForm',
    starter: `import React, { useState } from 'react';

export default function SignupForm({ onSubmit }) {
  // TODO: controlled fields, validate on submit, show <p role="alert"> messages
  return (
    <form>
      <label>Email<input type="email" /></label>
      <label>Password<input type="password" /></label>
      <label>Confirm password<input type="password" /></label>
      <button type="submit">Create account</button>
    </form>
  );
}
`,
    solution: `import React, { useState } from 'react';

function validate(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!form.email.includes('@')) errors.email = 'Enter a valid email';
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  if (form.confirm !== form.password) errors.confirm = 'Passwords do not match';
  return errors;
}

export default function SignupForm({ onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setCreated(false);
      return;
    }
    onSubmit({ email: form.email, password: form.password });
    setCreated(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>Email<input type="email" value={form.email} onChange={update('email')} /></label>
      {errors.email && <p role="alert">{errors.email}</p>}
      <label>Password<input type="password" value={form.password} onChange={update('password')} /></label>
      {errors.password && <p role="alert">{errors.password}</p>}
      <label>Confirm password<input type="password" value={form.confirm} onChange={update('confirm')} /></label>
      {errors.confirm && <p role="alert">{errors.confirm}</p>}
      <button type="submit">Create account</button>
      {created && <p>Account created</p>}
    </form>
  );
}
`,
    previewProps: {},
    previewSetup: "return { onSubmit: (data) => console.log('submitted', data) };",
    tests: [
      {
        name: 'shows no alerts before submitting',
        code: `const { container } = render({ onSubmit: () => {} });
expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);`,
      },
      {
        name: 'submitting empty fields shows the required/length errors and does not submit',
        code: `let calls = 0;
const { getByText, getByRole, queryByText } = render({ onSubmit: () => { calls += 1; } });
fireEvent.click(getByRole('button', { name: 'Create account' }));
expect(getByText('Email is required')).toBeTruthy();
expect(getByText('Password must be at least 8 characters')).toBeTruthy();
expect(queryByText('Passwords do not match')).toBeNull();
expect(calls).toBe(0);`,
      },
      {
        name: 'flags an email without @',
        code: `const { getByLabelText, getByRole, getByText } = render({ onSubmit: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada.example.com');
fireEvent.click(getByRole('button', { name: 'Create account' }));
expect(getByText('Enter a valid email')).toBeTruthy();`,
      },
      {
        name: 'flags mismatched passwords and does not submit',
        code: `let calls = 0;
const { getByLabelText, getByRole, getByText } = render({ onSubmit: () => { calls += 1; } });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.change(getByLabelText('Password'), 'hunter2hunter2');
fireEvent.change(getByLabelText('Confirm password'), 'hunter2hunter3');
fireEvent.click(getByRole('button', { name: 'Create account' }));
expect(getByText('Passwords do not match')).toBeTruthy();
expect(calls).toBe(0);`,
      },
      {
        name: 'valid input calls onSubmit once, clears alerts and shows Account created',
        code: `const received = [];
const { getByLabelText, getByRole, getByText, container } = render({ onSubmit: (d) => received.push(d) });
fireEvent.click(getByRole('button', { name: 'Create account' }));
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.change(getByLabelText('Password'), 'hunter2hunter2');
fireEvent.change(getByLabelText('Confirm password'), 'hunter2hunter2');
fireEvent.click(getByRole('button', { name: 'Create account' }));
expect(received).toEqual([{ email: 'ada@example.com', password: 'hunter2hunter2' }]);
expect(getByText('Account created')).toBeTruthy();
expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);`,
      },
    ],
    hint: 'Keep one state object for the field values and a separate `errors` object. Compute the errors in the submit handler, store them, and bail out early when the object is not empty.',
    explanation: 'The form is fully controlled, so the submit handler can validate the current state synchronously and store a map of messages. Rendering each message from that map keeps the alerts in sync with the last submit attempt. The early `return` after `setErrors` is what stops an invalid form from reaching `onSubmit` — a very common bug is to set the errors and keep going.',
  },
  {
    id: 'react-shipping-options',
    number: 27,
    title: 'Shipping Options Picker',
    difficulty: 'Easy',
    topic: 'Forms',
    statement: `Build \`ShippingOptions()\` — a select and a radio group that drive a summary line.

- A \`<select>\` labelled "Country" with options **United States** (value \`US\`), **Canada** (\`CA\`) and **United Kingdom** (\`UK\`). Default: United States.
- A radio group (three \`<input type="radio">\`, each inside a \`<label>\`) with the labels **Standard** ($5), **Express** ($15) and **Overnight** ($30). Default: Standard. Only one may be checked at a time.
- A summary element with \`data-testid="summary"\` reading e.g. "Express to Canada for $15" (speed label, country name, price).

Both controls must be controlled by React state, so changing either one updates the summary immediately.`,
    componentName: 'ShippingOptions',
    starter: `import React, { useState } from 'react';

const COUNTRIES = { US: 'United States', CA: 'Canada', UK: 'United Kingdom' };
const SPEEDS = [
  { id: 'standard', label: 'Standard', price: 5 },
  { id: 'express', label: 'Express', price: 15 },
  { id: 'overnight', label: 'Overnight', price: 30 },
];

export default function ShippingOptions() {
  // TODO: controlled select + radio group, summary line
  return (
    <div>
      <label>Country
        <select>
          {Object.entries(COUNTRIES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <p data-testid="summary">Standard to United States for $5</p>
    </div>
  );
}
`,
    solution: `import React, { useState } from 'react';

const COUNTRIES = { US: 'United States', CA: 'Canada', UK: 'United Kingdom' };
const SPEEDS = [
  { id: 'standard', label: 'Standard', price: 5 },
  { id: 'express', label: 'Express', price: 15 },
  { id: 'overnight', label: 'Overnight', price: 30 },
];

export default function ShippingOptions() {
  const [country, setCountry] = useState('US');
  const [speed, setSpeed] = useState('standard');
  const chosen = SPEEDS.find((s) => s.id === speed);

  return (
    <div>
      <label>Country
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {Object.entries(COUNTRIES).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </label>
      <fieldset>
        <legend>Delivery speed</legend>
        {SPEEDS.map((s) => (
          <label key={s.id}>
            <input type="radio" name="speed" value={s.id} checked={speed === s.id} onChange={(e) => setSpeed(e.target.value)} />
            {s.label}
          </label>
        ))}
      </fieldset>
      <p data-testid="summary">{chosen.label + ' to ' + COUNTRIES[country] + ' for $' + chosen.price}</p>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'starts with Standard to United States for $5',
        code: `const { getByTestId } = render({});
expect(getByTestId('summary')).toHaveTextContent('Standard to United States for $5');`,
      },
      {
        name: 'changing the country updates the summary',
        code: `const { getByTestId, getByLabelText } = render({});
fireEvent.change(getByLabelText('Country'), 'CA');
expect(getByTestId('summary')).toHaveTextContent('Standard to Canada for $5');`,
      },
      {
        name: 'picking a delivery speed updates the summary and price',
        code: `const { getByTestId, getByRole, getByLabelText } = render({});
fireEvent.change(getByLabelText('Country'), 'UK');
fireEvent.click(getByRole('radio', { name: 'Overnight' }));
expect(getByTestId('summary')).toHaveTextContent('Overnight to United Kingdom for $30');`,
      },
      {
        name: 'only one radio is checked at a time',
        code: `const { getByRole } = render({});
fireEvent.click(getByRole('radio', { name: 'Express' }));
expect(getByRole('radio', { name: 'Express' }).checked).toBe(true);
expect(getByRole('radio', { name: 'Standard' }).checked).toBe(false);
expect(getByRole('radio', { name: 'Overnight' }).checked).toBe(false);`,
      },
    ],
    hint: 'Two pieces of state: the country code and the speed id. Give every radio `checked={speed === s.id}` and set the state from `e.target.value`.',
    explanation: 'Selects and radio groups are controlled the same way as text inputs: `value`/`checked` comes from state and `onChange` writes back. Because the summary is derived from the same state during render, it can never drift from what the controls show. State must be replaced (a new value), never mutated in place — mutating the object and calling the setter with the same reference skips the re-render.',
  },
  {
    id: 'react-newsletter-gate',
    number: 28,
    title: 'Newsletter Signup Gate',
    difficulty: 'Easy',
    topic: 'Forms',
    statement: `Build \`NewsletterForm({ onSubscribe })\` whose submit button stays disabled until the form is valid.

- An \`<input>\` labelled "Email" and a checkbox labelled "I agree to the terms".
- A button "Subscribe" that is \`disabled\` unless the email contains "@" **and** the checkbox is checked. Unchecking the box must disable it again.
- Clicking Subscribe calls \`onSubscribe(email)\` once and shows \`Check your inbox, <email>\` (e.g. "Check your inbox, ada@example.com").`,
    componentName: 'NewsletterForm',
    starter: `import React, { useState } from 'react';

export default function NewsletterForm({ onSubscribe }) {
  // TODO: track email + agreement, disable the button until both are valid
  return (
    <form>
      <label>Email<input type="email" placeholder="you@example.com" /></label>
      <label><input type="checkbox" /> I agree to the terms</label>
      <button type="submit">Subscribe</button>
    </form>
  );
}
`,
    solution: `import React, { useState } from 'react';

export default function NewsletterForm({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [sent, setSent] = useState('');
  const valid = email.includes('@') && agreed;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSubscribe(email);
    setSent(email);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>Email<input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} /> I agree to the terms</label>
      <button type="submit" disabled={!valid}>Subscribe</button>
      {sent && <p>{'Check your inbox, ' + sent}</p>}
    </form>
  );
}
`,
    previewProps: {},
    previewSetup: "return { onSubscribe: (email) => console.log('subscribe', email) };",
    tests: [
      {
        name: 'Subscribe is disabled initially',
        code: `const { getByRole } = render({ onSubscribe: () => {} });
expect(getByRole('button', { name: 'Subscribe' })).toBeDisabled();`,
      },
      {
        name: 'stays disabled with only an email or only the checkbox',
        code: `const { getByRole, getByLabelText } = render({ onSubscribe: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
expect(getByRole('button', { name: 'Subscribe' })).toBeDisabled();
fireEvent.change(getByLabelText('Email'), '');
fireEvent.click(getByRole('checkbox'));
expect(getByRole('button', { name: 'Subscribe' })).toBeDisabled();`,
      },
      {
        name: 'enables with a valid email and the box checked',
        code: `const { getByRole, getByLabelText } = render({ onSubscribe: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('checkbox'));
expect(getByRole('button', { name: 'Subscribe' })).not.toBeDisabled();`,
      },
      {
        name: 'unchecking the terms disables the button again',
        code: `const { getByRole, getByLabelText } = render({ onSubscribe: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('checkbox'));
fireEvent.click(getByRole('checkbox'));
expect(getByRole('button', { name: 'Subscribe' })).toBeDisabled();`,
      },
      {
        name: 'submitting calls onSubscribe with the email and shows the confirmation',
        code: `const received = [];
const { getByRole, getByLabelText, getByText } = render({ onSubscribe: (e) => received.push(e) });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('checkbox'));
fireEvent.click(getByRole('button', { name: 'Subscribe' }));
expect(received).toEqual(['ada@example.com']);
expect(getByText('Check your inbox, ada@example.com')).toBeTruthy();`,
      },
    ],
    hint: 'Derive `valid` from state during render and pass `disabled={!valid}`. For a checkbox read `e.target.checked`, not `e.target.value`.',
    explanation: 'Validity is a derived value, so it is computed from state on every render rather than stored separately. The checkbox is the classic trap: its `value` is always the string "on", so reading it instead of `checked` makes the agreement stick after the user unchecks. Guarding the submit handler as well as the button keeps Enter-to-submit consistent with the disabled state.',
  },
  {
    id: 'react-feedback-form-reset',
    number: 29,
    title: 'Feedback Form That Resets',
    difficulty: 'Easy',
    topic: 'Forms',
    statement: `Build \`FeedbackForm({ onSend })\` — a small controlled form that clears itself after a successful submit.

- A \`<textarea>\` labelled "Your feedback" and a \`<select>\` labelled "Rating" with options 1–5 (default "5").
- A button "Send feedback" that is \`disabled\` while the feedback text is blank (whitespace only counts as blank).
- Submitting calls \`onSend({ rating, message })\` (rating as a **number**), shows "Thanks for your feedback!", empties the textarea, puts the rating back to 5 and disables the button again.

Reset through React state — the inputs are controlled, so calling \`form.reset()\` on the DOM is not enough.`,
    componentName: 'FeedbackForm',
    starter: `import React, { useState } from 'react';

export default function FeedbackForm({ onSend }) {
  // TODO: controlled textarea + select, disabled button, reset after submit
  return (
    <form>
      <label>Your feedback<textarea /></label>
      <label>Rating
        <select defaultValue="5">
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      <button type="submit">Send feedback</button>
    </form>
  );
}
`,
    solution: `import React, { useState } from 'react';

export default function FeedbackForm({ onSend }) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState('5');
  const [thanked, setThanked] = useState(false);
  const canSend = message.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend) return;
    onSend({ rating: Number(rating), message });
    setMessage('');
    setRating('5');
    setThanked(true);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Your feedback<textarea value={message} onChange={(e) => setMessage(e.target.value)} /></label>
      <label>Rating
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={String(n)}>{n}</option>)}
        </select>
      </label>
      <button type="submit" disabled={!canSend}>Send feedback</button>
      {thanked && <p>Thanks for your feedback!</p>}
    </form>
  );
}
`,
    previewProps: {},
    previewSetup: "return { onSend: (data) => console.log('feedback', data) };",
    tests: [
      {
        name: 'button is disabled while the feedback is blank',
        code: `const { getByRole, getByLabelText, queryByText } = render({ onSend: () => {} });
expect(getByRole('button', { name: 'Send feedback' })).toBeDisabled();
fireEvent.change(getByLabelText('Your feedback'), '   ');
expect(getByRole('button', { name: 'Send feedback' })).toBeDisabled();
expect(queryByText('Thanks for your feedback!')).toBeNull();`,
      },
      {
        name: 'submitting sends the rating as a number with the message',
        code: `const received = [];
const { getByRole, getByLabelText, getByText } = render({ onSend: (d) => received.push(d) });
fireEvent.change(getByLabelText('Your feedback'), 'Great app');
fireEvent.change(getByLabelText('Rating'), '3');
fireEvent.click(getByRole('button', { name: 'Send feedback' }));
expect(received).toEqual([{ rating: 3, message: 'Great app' }]);
expect(getByText('Thanks for your feedback!')).toBeTruthy();`,
      },
      {
        name: 'fields reset and the button is disabled again after sending',
        code: `const { getByRole, getByLabelText } = render({ onSend: () => {} });
fireEvent.change(getByLabelText('Your feedback'), 'Great app');
fireEvent.change(getByLabelText('Rating'), '2');
fireEvent.click(getByRole('button', { name: 'Send feedback' }));
expect(getByLabelText('Your feedback')).toHaveValue('');
expect(getByLabelText('Rating')).toHaveValue('5');
expect(getByRole('button', { name: 'Send feedback' })).toBeDisabled();`,
      },
      {
        name: 'a second submission after typing again works',
        code: `const received = [];
const { getByRole, getByLabelText } = render({ onSend: (d) => received.push(d) });
fireEvent.change(getByLabelText('Your feedback'), 'One');
fireEvent.click(getByRole('button', { name: 'Send feedback' }));
fireEvent.change(getByLabelText('Your feedback'), 'Two');
fireEvent.click(getByRole('button', { name: 'Send feedback' }));
expect(received.map((d) => d.message)).toEqual(['One', 'Two']);
expect(received[1].rating).toBe(5);`,
      },
    ],
    hint: 'Because the textarea and select are controlled, resetting means calling the state setters with their initial values. `form.reset()` only touches the DOM and leaves your state (and the disabled flag) behind.',
    explanation: 'With controlled inputs React state is the source of truth, so a reset is just `setMessage(\'\')` and `setRating(\'5\')`. A DOM-level `form.reset()` would visually clear the fields while the state still holds the old message, which is why the button would stay enabled and a resubmit would send stale text. Converting the rating with `Number()` at the boundary keeps the state a plain string that matches the option values.',
  },
  {
    id: 'react-dependent-selects',
    number: 30,
    title: 'Dependent Country and City Selects',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`LocationPicker({ regions })\` where \`regions\` maps a country name to an array of its cities, e.g. \`{ France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'] }\`.

- A \`<select>\` labelled "Country" listing the keys of \`regions\` (in object order) and a \`<select>\` labelled "City" listing the cities of the selected country.
- Initially the first country and its first city are selected.
- Changing the country must reset the city to the **first city of the new country** — a city from the previous country must never remain selected.
- Render \`<p data-testid="selection">City, Country</p>\`, e.g. "Paris, France".`,
    componentName: 'LocationPicker',
    starter: `import React, { useState } from 'react';

export default function LocationPicker({ regions }) {
  const countries = Object.keys(regions);
  // TODO: country + city state; reset the city when the country changes
  return (
    <div>
      <label>Country
        <select>{countries.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      </label>
      <label>City
        <select></select>
      </label>
      <p data-testid="selection"></p>
    </div>
  );
}
`,
    solution: `import React, { useState } from 'react';

export default function LocationPicker({ regions }) {
  const countries = Object.keys(regions);
  const [country, setCountry] = useState(countries[0]);
  const [city, setCity] = useState(regions[countries[0]][0]);
  const cities = regions[country] || [];

  const changeCountry = (e) => {
    const next = e.target.value;
    setCountry(next);
    setCity(regions[next][0]);
  };

  return (
    <div>
      <label>Country
        <select value={country} onChange={changeCountry}>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>City
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <p data-testid="selection">{city + ', ' + country}</p>
    </div>
  );
}
`,
    previewProps: { regions: { France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'], Brazil: ['Rio de Janeiro', 'São Paulo'] } },
    tests: [
      {
        name: 'starts with the first country and its first city',
        code: `const { getByTestId, getByLabelText } = render({ regions: { France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'] } });
expect(getByTestId('selection')).toHaveTextContent('Paris, France');
expect(getByLabelText('City').querySelectorAll('option')).toHaveLength(2);`,
      },
      {
        name: 'changing the city updates the selection',
        code: `const { getByTestId, getByLabelText } = render({ regions: { France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'] } });
fireEvent.change(getByLabelText('City'), 'Lyon');
expect(getByTestId('selection')).toHaveTextContent('Lyon, France');`,
      },
      {
        name: 'changing the country lists its cities and selects the first one',
        code: `const { getByTestId, getByLabelText } = render({ regions: { France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'] } });
fireEvent.change(getByLabelText('Country'), 'Japan');
expect(getByLabelText('City').querySelectorAll('option')).toHaveLength(3);
expect(getByLabelText('City')).toHaveValue('Tokyo');
expect(getByTestId('selection')).toHaveTextContent('Tokyo, Japan');`,
      },
      {
        name: 'a previously chosen city never survives a country change',
        code: `const { getByTestId, getByLabelText } = render({ regions: { France: ['Paris', 'Lyon'], Japan: ['Tokyo', 'Osaka', 'Kyoto'] } });
fireEvent.change(getByLabelText('City'), 'Lyon');
fireEvent.change(getByLabelText('Country'), 'Japan');
expect(getByTestId('selection')).toHaveTextContent('Tokyo, Japan');
fireEvent.change(getByLabelText('City'), 'Kyoto');
fireEvent.change(getByLabelText('Country'), 'France');
expect(getByTestId('selection')).toHaveTextContent('Paris, France');`,
      },
    ],
    hint: 'Handle both updates in the country change handler: set the country and set the city to `regions[next][0]` in the same event. Two setState calls in one handler are batched into a single render.',
    explanation: 'The city depends on the country, so the country handler is responsible for keeping both in sync; React batches the two updates so the user never sees an inconsistent frame. An alternative is a `useEffect` that resets the city when `country` changes, but that renders one stale frame first and is harder to reason about. Deriving the option list from `regions[country]` during render means no extra state is needed for the cities.',
  },
  {
    id: 'react-controlled-vs-uncontrolled',
    number: 31,
    title: 'Controlled vs Uncontrolled Inputs',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`NameFields({ defaultNickname })\` with one controlled and one uncontrolled input side by side.

- **Controlled**: an \`<input>\` labelled "Display name" driven by state. Render a live preview \`<p data-testid="preview">Hello, <name></p>\`; when the name is empty show "Hello, stranger".
- **Uncontrolled**: an \`<input>\` labelled "Nickname" that uses \`defaultValue={defaultNickname}\` and a \`ref\` — no state, no \`onChange\`. The user must be able to type in it freely.
- A button "Read nickname" that reads the current value **from the ref** and renders \`<p data-testid="nickname">Nickname: <value></p>\`.`,
    componentName: 'NameFields',
    starter: `import React, { useState, useRef } from 'react';

export default function NameFields({ defaultNickname = '' }) {
  // TODO: controlled "Display name" + uncontrolled "Nickname" read via a ref
  return (
    <div>
      <label>Display name<input /></label>
      <p data-testid="preview">Hello, stranger</p>
      <label>Nickname<input /></label>
      <button type="button">Read nickname</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useRef } from 'react';

export default function NameFields({ defaultNickname = '' }) {
  const [name, setName] = useState('');
  const nicknameRef = useRef(null);
  const [nickname, setNickname] = useState(null);

  return (
    <div>
      <label>Display name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <p data-testid="preview">{'Hello, ' + (name || 'stranger')}</p>
      <label>Nickname<input ref={nicknameRef} defaultValue={defaultNickname} /></label>
      <button type="button" onClick={() => setNickname(nicknameRef.current.value)}>Read nickname</button>
      {nickname !== null && <p data-testid="nickname">{'Nickname: ' + nickname}</p>}
    </div>
  );
}
`,
    previewProps: { defaultNickname: 'ace' },
    tests: [
      {
        name: 'the controlled input drives the live preview',
        code: `const { getByLabelText, getByTestId } = render({ defaultNickname: 'ace' });
expect(getByTestId('preview')).toHaveTextContent('Hello, stranger');
fireEvent.change(getByLabelText('Display name'), 'Ada');
expect(getByTestId('preview')).toHaveTextContent('Hello, Ada');
expect(getByLabelText('Display name')).toHaveValue('Ada');`,
      },
      {
        name: 'the nickname input starts with defaultNickname',
        code: `const { getByLabelText } = render({ defaultNickname: 'ace' });
expect(getByLabelText('Nickname')).toHaveValue('ace');`,
      },
      {
        name: 'Read nickname reports the default before any typing',
        code: `const { getByRole, getByTestId } = render({ defaultNickname: 'ace' });
fireEvent.click(getByRole('button', { name: 'Read nickname' }));
expect(getByTestId('nickname')).toHaveTextContent('Nickname: ace');`,
      },
      {
        name: 'typing into the uncontrolled input is reflected when read through the ref',
        code: `const { getByRole, getByTestId, getByLabelText } = render({ defaultNickname: 'ace' });
fireEvent.input(getByLabelText('Nickname'), 'maverick');
fireEvent.click(getByRole('button', { name: 'Read nickname' }));
expect(getByTestId('nickname')).toHaveTextContent('Nickname: maverick');
expect(getByLabelText('Nickname')).toHaveValue('maverick');`,
      },
    ],
    hint: 'An input with `value` but no `onChange` is read-only: React snaps it back to the prop after every keystroke. For the uncontrolled field use `defaultValue` and read `ref.current.value` when the button is clicked.',
    explanation: 'A controlled input renders whatever is in state, so typing must go through `onChange`; the preview is derived from that same state. The uncontrolled input lets the DOM own its value: `defaultValue` seeds it once and the ref lets you read it on demand. Passing `value={defaultNickname}` instead of `defaultValue` is the common mistake — React treats the field as controlled and reverts every edit.',
  },
  // ------------------------------------------------ Composition & Patterns
  {
    id: 'react-temperature-lifting',
    number: 32,
    title: 'Temperature Converter (Lifting State)',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`TemperatureConverter()\` — two sibling inputs that stay in sync by lifting their shared state into the parent.

- Write a child \`TemperatureInput({ scale, value, onChange })\` that renders an \`<input>\` inside a \`<label>\` reading "Celsius" or "Fahrenheit". The child owns **no state**.
- The parent stores the last typed value plus which scale it was typed in, and derives the other field: C→F is \`c * 9 / 5 + 32\`, F→C is \`(f - 32) * 5 / 9\`, rounded to one decimal (\`Math.round(x * 10) / 10\`) and rendered as a plain string (so 100 °C shows "212" in Fahrenheit).
- If the typed field is empty or not a number, the other field is empty.
- Below the inputs render \`<p>The water would boil.</p>\` when Celsius ≥ 100, \`<p>The water would not boil.</p>\` when a valid number is below 100, and nothing when the fields are empty.`,
    componentName: 'TemperatureConverter',
    starter: `import React, { useState } from 'react';

function TemperatureInput({ scale, value, onChange }) {
  // TODO: render a labelled input; no local state
  return <label>{scale}<input /></label>;
}

export default function TemperatureConverter() {
  // TODO: lift the value + scale here and derive the other field
  return (
    <div>
      <TemperatureInput scale="Celsius" />
      <TemperatureInput scale="Fahrenheit" />
    </div>
  );
}
`,
    solution: `import React, { useState } from 'react';

const toF = (c) => c * 9 / 5 + 32;
const toC = (f) => (f - 32) * 5 / 9;

function convert(value, fn) {
  const n = parseFloat(value);
  if (value.trim() === '' || Number.isNaN(n)) return '';
  return String(Math.round(fn(n) * 10) / 10);
}

function TemperatureInput({ scale, value, onChange }) {
  return (
    <label>{scale}<input value={value} onChange={(e) => onChange(e.target.value)} /></label>
  );
}

export default function TemperatureConverter() {
  const [value, setValue] = useState('');
  const [scale, setScale] = useState('c');
  const celsius = scale === 'c' ? value : convert(value, toC);
  const fahrenheit = scale === 'f' ? value : convert(value, toF);
  const c = parseFloat(celsius);
  const hasNumber = celsius.trim() !== '' && !Number.isNaN(c);

  return (
    <div>
      <TemperatureInput scale="Celsius" value={celsius} onChange={(v) => { setScale('c'); setValue(v); }} />
      <TemperatureInput scale="Fahrenheit" value={fahrenheit} onChange={(v) => { setScale('f'); setValue(v); }} />
      {hasNumber && <p>{c >= 100 ? 'The water would boil.' : 'The water would not boil.'}</p>}
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'typing Celsius fills Fahrenheit',
        code: `const { getByLabelText, getByText } = render({});
fireEvent.change(getByLabelText('Celsius'), '100');
expect(getByLabelText('Fahrenheit')).toHaveValue('212');
expect(getByText('The water would boil.')).toBeTruthy();`,
      },
      {
        name: 'typing Fahrenheit fills Celsius',
        code: `const { getByLabelText, getByText } = render({});
fireEvent.change(getByLabelText('Fahrenheit'), '32');
expect(getByLabelText('Celsius')).toHaveValue('0');
expect(getByText('The water would not boil.')).toBeTruthy();`,
      },
      {
        name: 'rounds to one decimal',
        code: `const { getByLabelText } = render({});
fireEvent.change(getByLabelText('Celsius'), '37.5');
expect(getByLabelText('Fahrenheit')).toHaveValue('99.5');
fireEvent.change(getByLabelText('Fahrenheit'), '100');
expect(getByLabelText('Celsius')).toHaveValue('37.8');`,
      },
      {
        name: 'clearing a field clears the other and hides the verdict',
        code: `const { getByLabelText, queryByText } = render({});
fireEvent.change(getByLabelText('Celsius'), '20');
fireEvent.change(getByLabelText('Celsius'), '');
expect(getByLabelText('Fahrenheit')).toHaveValue('');
expect(queryByText('The water would boil.')).toBeNull();
expect(queryByText('The water would not boil.')).toBeNull();`,
      },
    ],
    hint: 'Store only what the user typed (`value`) and where (`scale`). Everything else — the other field, the boiling verdict — is derived during render.',
    explanation: 'When two siblings need to agree, their state moves up to the closest common parent and flows back down as props. Keeping one source of truth (the raw text plus its scale) avoids rounding drift and makes the second field a pure derivation. Giving each child its own `useState` is the classic mistake: the inputs then diverge because nothing connects them.',
  },
  {
    id: 'react-theme-context',
    number: 33,
    title: 'Theme Toggle with Context',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`ThemedApp({ initialTheme })\` (\`initialTheme\` is "light" or "dark", default "light") using React context so that the toggle and the panel share the theme **without prop drilling**.

Inside the same file define:
- \`ThemeContext\` (via \`createContext\`) and \`ThemeProvider({ initialTheme, children })\`, which owns the \`theme\` state and provides \`{ theme, toggleTheme }\`.
- \`ThemeToggle()\` — a button reading "Switch to dark" when the theme is light and "Switch to light" when dark. It takes no props and uses \`useContext\`.
- \`ThemedPanel()\` — \`<div data-testid="panel" data-theme={theme}>Current theme: <theme></div>\`. No props either.

\`ThemedApp\` renders \`<ThemeProvider initialTheme={initialTheme}><ThemeToggle /><ThemedPanel /></ThemeProvider>\`. Every consumer must see the new theme immediately after a toggle.`,
    componentName: 'ThemedApp',
    starter: `import React, { useState, createContext, useContext } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ initialTheme, children }) {
  // TODO: hold the theme in state and provide { theme, toggleTheme }
  return <ThemeContext.Provider value={null}>{children}</ThemeContext.Provider>;
}

function ThemeToggle() {
  // TODO: read the context, render "Switch to dark" / "Switch to light"
  return <button type="button">Switch to dark</button>;
}

function ThemedPanel() {
  // TODO: read the context
  return <div data-testid="panel" data-theme="light">Current theme: light</div>;
}

export default function ThemedApp({ initialTheme = 'light' }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeToggle />
      <ThemedPanel />
    </ThemeProvider>
  );
}
`,
    solution: `import React, { useState, useMemo, createContext, useContext } from 'react';

const ThemeContext = createContext(null);

function ThemeProvider({ initialTheme, children }) {
  const [theme, setTheme] = useState(initialTheme);
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme}>
      {theme === 'light' ? 'Switch to dark' : 'Switch to light'}
    </button>
  );
}

function ThemedPanel() {
  const { theme } = useTheme();
  const style = theme === 'dark'
    ? { background: '#111', color: '#eee', padding: 12 }
    : { background: '#fff', color: '#111', padding: 12 };
  return (
    <div data-testid="panel" data-theme={theme} style={style}>{'Current theme: ' + theme}</div>
  );
}

export default function ThemedApp({ initialTheme = 'light' }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeToggle />
      <ThemedPanel />
    </ThemeProvider>
  );
}
`,
    previewProps: { initialTheme: 'light' },
    tests: [
      {
        name: 'starts on the initial theme',
        code: `const { getByTestId, getByRole } = render({ initialTheme: 'light' });
expect(getByTestId('panel')).toHaveTextContent('Current theme: light');
expect(getByTestId('panel')).toHaveAttribute('data-theme', 'light');
expect(getByRole('button', { name: 'Switch to dark' })).toBeTruthy();`,
      },
      {
        name: 'toggling updates the panel and the button label',
        code: `const { getByTestId, getByRole } = render({ initialTheme: 'light' });
fireEvent.click(getByRole('button', { name: 'Switch to dark' }));
expect(getByTestId('panel')).toHaveTextContent('Current theme: dark');
expect(getByTestId('panel')).toHaveAttribute('data-theme', 'dark');
expect(getByRole('button', { name: 'Switch to light' })).toBeTruthy();`,
      },
      {
        name: 'toggling twice returns to light',
        code: `const { getByTestId, getByRole } = render({ initialTheme: 'light' });
fireEvent.click(getByRole('button', { name: 'Switch to dark' }));
fireEvent.click(getByRole('button', { name: 'Switch to light' }));
expect(getByTestId('panel')).toHaveAttribute('data-theme', 'light');
expect(getByRole('button', { name: 'Switch to dark' })).toBeTruthy();`,
      },
      {
        name: 'respects initialTheme="dark"',
        code: `const { getByTestId, getByRole } = render({ initialTheme: 'dark' });
expect(getByTestId('panel')).toHaveAttribute('data-theme', 'dark');
fireEvent.click(getByRole('button', { name: 'Switch to light' }));
expect(getByTestId('panel')).toHaveTextContent('Current theme: light');`,
      },
    ],
    hint: 'The provider owns `useState(initialTheme)` and passes `{ theme, toggleTheme }` as the context value. If you memoize that value, `theme` must be in the dependency array or consumers will read a frozen copy.',
    explanation: 'Context lets deeply nested components read shared state without threading props through every layer. The provider is the only place with `useState`; consumers call `useContext` and re-render whenever the provided value changes. Memoizing the value object is a nice optimisation, but with an empty dependency array it freezes `theme` at its initial value — the toggle updates the provider while every consumer keeps seeing "light".',
  },
  {
    id: 'react-custom-hooks-counter-toggle',
    number: 34,
    title: 'Custom Hooks: useCounter and useToggle',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Extract reusable logic into two custom hooks and use them in \`PracticeCounter({ initial = 0, step = 1 })\`.

- \`useCounter(initial, step)\` returns \`{ count, increment, decrement, reset }\`. \`decrement\` never goes below 0. Calling \`increment()\` twice in the same handler must add \`2 * step\`.
- \`useToggle(initial = false)\` returns \`[on, toggle]\`.

The component renders:
- \`<p>Count: <n></p>\` and buttons "Increase", "Increase twice" (calls \`increment()\` two times), "Decrease", "Reset".
- A button reading "Show details" / "Hide details" driven by \`useToggle\`; while on, render \`<p data-testid="details">Step: <step></p>\`.`,
    componentName: 'PracticeCounter',
    starter: `import React, { useState } from 'react';

function useCounter(initial, step) {
  // TODO
  return { count: initial, increment: () => {}, decrement: () => {}, reset: () => {} };
}

function useToggle(initial = false) {
  // TODO
  return [initial, () => {}];
}

export default function PracticeCounter({ initial = 0, step = 1 }) {
  const { count, increment, decrement, reset } = useCounter(initial, step);
  const [showDetails, toggleDetails] = useToggle(false);
  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={increment}>Increase</button>
      <button type="button" onClick={() => { increment(); increment(); }}>Increase twice</button>
      <button type="button" onClick={decrement}>Decrease</button>
      <button type="button" onClick={reset}>Reset</button>
      <button type="button" onClick={toggleDetails}>{showDetails ? 'Hide details' : 'Show details'}</button>
      {showDetails && <p data-testid="details">Step: {step}</p>}
    </div>
  );
}
`,
    solution: `import React, { useState, useCallback } from 'react';

function useCounter(initial, step) {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount((c) => c + step), [step]);
  const decrement = useCallback(() => setCount((c) => Math.max(0, c - step)), [step]);
  const reset = useCallback(() => setCount(initial), [initial]);
  return { count, increment, decrement, reset };
}

function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((v) => !v), []);
  return [on, toggle];
}

export default function PracticeCounter({ initial = 0, step = 1 }) {
  const { count, increment, decrement, reset } = useCounter(initial, step);
  const [showDetails, toggleDetails] = useToggle(false);
  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={increment}>Increase</button>
      <button type="button" onClick={() => { increment(); increment(); }}>Increase twice</button>
      <button type="button" onClick={decrement}>Decrease</button>
      <button type="button" onClick={reset}>Reset</button>
      <button type="button" onClick={toggleDetails}>{showDetails ? 'Hide details' : 'Show details'}</button>
      {showDetails && <p data-testid="details">Step: {step}</p>}
    </div>
  );
}
`,
    previewProps: { initial: 0, step: 2 },
    tests: [
      {
        name: 'increments by step',
        code: `const { getByText, getByRole } = render({ initial: 1, step: 3 });
expect(getByText('Count: 1')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Increase' }));
expect(getByText('Count: 4')).toBeTruthy();`,
      },
      {
        name: 'Increase twice adds two steps in one click',
        code: `const { getByText, getByRole } = render({ initial: 0, step: 2 });
fireEvent.click(getByRole('button', { name: 'Increase twice' }));
expect(getByText('Count: 4')).toBeTruthy();`,
      },
      {
        name: 'never decrements below zero',
        code: `const { getByText, getByRole } = render({ initial: 1, step: 2 });
fireEvent.click(getByRole('button', { name: 'Decrease' }));
expect(getByText('Count: 0')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Decrease' }));
expect(getByText('Count: 0')).toBeTruthy();`,
      },
      {
        name: 'reset returns to the initial value',
        code: `const { getByText, getByRole } = render({ initial: 5, step: 1 });
fireEvent.click(getByRole('button', { name: 'Increase' }));
fireEvent.click(getByRole('button', { name: 'Increase' }));
fireEvent.click(getByRole('button', { name: 'Reset' }));
expect(getByText('Count: 5')).toBeTruthy();`,
      },
      {
        name: 'useToggle shows and hides the details',
        code: `const { getByRole, getByTestId, queryByTestId } = render({ initial: 0, step: 3 });
expect(queryByTestId('details')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Show details' }));
expect(getByTestId('details')).toHaveTextContent('Step: 3');
fireEvent.click(getByRole('button', { name: 'Hide details' }));
expect(queryByTestId('details')).toBeNull();`,
      },
    ],
    hint: 'Use the functional form `setCount((c) => c + step)` inside the hooks. `setCount(count + step)` reads a stale `count` when called twice in the same event.',
    explanation: 'Custom hooks are just functions that call other hooks, letting you reuse stateful logic across components. The functional updater form matters here: two `increment()` calls in one handler each receive the latest pending value, whereas `setCount(count + step)` would compute the same number twice from the closed-over `count`. Wrapping the callbacks in `useCallback` keeps their identity stable for memoized children.',
  },
  {
    id: 'react-compound-tabs',
    number: 35,
    title: 'Compound Tabs',
    difficulty: 'Hard',
    topic: 'Composition & Patterns',
    statement: `Implement a compound-component API — \`<Tabs>\`, \`<Tabs.List>\`, \`<Tabs.Tab>\`, \`<Tabs.Panel>\` — that shares the active tab through context, then use it in \`SettingsTabs({ tabs, defaultTab })\`.

\`tabs\` is an array of \`{ id, label, content }\`; \`defaultTab\` is an id (defaults to the first tab's id).

Required DOM:
- \`<div role="tablist">\` containing one \`<button role="tab" aria-selected="true|false">label</button>\` per tab.
- Exactly **one** \`<div role="tabpanel">\` in the DOM at any time, holding the active tab's \`content\`.
- Clicking a tab makes it selected and swaps the panel. The active id must live in \`<Tabs>\` (via \`useState\` + \`createContext\`), never inside an individual \`Tab\`.

\`SettingsTabs\` should render \`<Tabs defaultTab={...}><Tabs.List>{tabs.map(t => <Tabs.Tab id=…>…)}</Tabs.List>{tabs.map(t => <Tabs.Panel id=…>…)}</Tabs>\`.`,
    componentName: 'SettingsTabs',
    starter: `import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext(null);

function Tabs({ defaultTab, children }) {
  // TODO: hold the active id and provide { activeId, setActiveId }
  return <div>{children}</div>;
}
Tabs.List = function List({ children }) { return <div role="tablist">{children}</div>; };
Tabs.Tab = function Tab({ id, children }) {
  // TODO: role="tab", aria-selected, onClick
  return <button type="button" role="tab" aria-selected="false">{children}</button>;
};
Tabs.Panel = function Panel({ id, children }) {
  // TODO: render only when active
  return <div role="tabpanel">{children}</div>;
};

export default function SettingsTabs({ tabs, defaultTab }) {
  return (
    <Tabs defaultTab={defaultTab || tabs[0].id}>
      <Tabs.List>
        {tabs.map((t) => <Tabs.Tab key={t.id} id={t.id}>{t.label}</Tabs.Tab>)}
      </Tabs.List>
      {tabs.map((t) => <Tabs.Panel key={t.id} id={t.id}>{t.content}</Tabs.Panel>)}
    </Tabs>
  );
}
`,
    solution: `import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be rendered inside <Tabs>');
  return ctx;
}

function Tabs({ defaultTab, children }) {
  const [activeId, setActiveId] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeId, setActiveId }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function List({ children }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Tab = function Tab({ id, children }) {
  const { activeId, setActiveId } = useTabs();
  const selected = activeId === id;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected ? 'true' : 'false'}
      style={{ fontWeight: selected ? 'bold' : 'normal' }}
      onClick={() => setActiveId(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ id, children }) {
  const { activeId } = useTabs();
  if (activeId !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

export default function SettingsTabs({ tabs, defaultTab }) {
  return (
    <Tabs defaultTab={defaultTab || tabs[0].id}>
      <Tabs.List>
        {tabs.map((t) => <Tabs.Tab key={t.id} id={t.id}>{t.label}</Tabs.Tab>)}
      </Tabs.List>
      {tabs.map((t) => <Tabs.Panel key={t.id} id={t.id}>{t.content}</Tabs.Panel>)}
    </Tabs>
  );
}
`,
    previewProps: {
      tabs: [
        { id: 'profile', label: 'Profile', content: 'Edit your name and avatar' },
        { id: 'billing', label: 'Billing', content: 'Manage your plan' },
        { id: 'security', label: 'Security', content: 'Change your password' },
      ],
      defaultTab: 'profile',
    },
    tests: [
      {
        name: 'renders every tab and the default panel',
        code: `const { getAllByRole, getByRole } = render(props);
expect(getAllByRole('tab')).toHaveLength(3);
expect(getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
expect(getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'false');
expect(getByRole('tabpanel')).toHaveTextContent('Edit your name and avatar');`,
      },
      {
        name: 'clicking a tab selects it and swaps the panel',
        code: `const { getByRole } = render(props);
fireEvent.click(getByRole('tab', { name: 'Billing' }));
expect(getByRole('tabpanel')).toHaveTextContent('Manage your plan');
expect(getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
expect(getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'false');`,
      },
      {
        name: 'only one tabpanel exists after several clicks',
        code: `const { getByRole, getAllByRole } = render(props);
fireEvent.click(getByRole('tab', { name: 'Security' }));
fireEvent.click(getByRole('tab', { name: 'Billing' }));
expect(getAllByRole('tabpanel')).toHaveLength(1);
expect(getByRole('tabpanel')).toHaveTextContent('Manage your plan');
expect(getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);`,
      },
      {
        name: 'falls back to the first tab without defaultTab',
        code: `const { getByRole } = render({ tabs: props.tabs });
expect(getByRole('tab', { name: 'Profile' })).toHaveAttribute('aria-selected', 'true');
expect(getByRole('tabpanel')).toHaveTextContent('Edit your name and avatar');`,
      },
    ],
    hint: 'Put `useState(defaultTab)` in `Tabs` and expose `{ activeId, setActiveId }` through a context. `Tab` and `Panel` both read it — that is what makes the pieces composable without wiring props between them.',
    explanation: 'Compound components share implicit state through context so the consumer can arrange `Tab`s and `Panel`s freely while they still agree on which one is active. The parent `Tabs` is the single owner of `activeId`; each `Tab` only dispatches a change and each `Panel` only reads. Giving a `Tab` its own `useState` looks like it works for the button but the panels never hear about the click.',
  },
  {
    id: 'react-render-prop-disclosure',
    number: 36,
    title: 'Disclosure with Function-as-Child',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`Disclosure({ initialOpen = false, children })\` where \`children\` is a **function** (render prop) that receives \`{ open, toggle, close }\` and returns the UI.

- The component owns the \`open\` boolean. \`toggle()\` flips it, \`close()\` sets it to \`false\`.
- Render \`<div data-testid="disclosure">\` containing whatever \`children({ open, toggle, close })\` returns — call it on **every render** so the UI always reflects the latest state.
- No markup of your own beyond the wrapper: the caller decides what "open" looks like.

Tests pass a children function built with \`React.createElement\`, e.g. a button that shows "Open"/"Close" and a paragraph rendered only while open.`,
    componentName: 'Disclosure',
    starter: `import React, { useState } from 'react';

export default function Disclosure({ initialOpen = false, children }) {
  // TODO: own the open state and call children({ open, toggle, close })
  return <div data-testid="disclosure"></div>;
}
`,
    solution: `import React, { useState, useCallback } from 'react';

export default function Disclosure({ initialOpen = false, children }) {
  const [open, setOpen] = useState(initialOpen);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  return <div data-testid="disclosure">{children({ open, toggle, close })}</div>;
}
`,
    previewProps: { initialOpen: false },
    previewSetup: "return { children: ({ open, toggle, close }) => React.createElement('div', null, React.createElement('button', { type: 'button', onClick: toggle }, open ? 'Hide answer' : 'Show answer'), open ? React.createElement('p', null, 'Render props let the parent decide the markup.') : null, open ? React.createElement('button', { type: 'button', onClick: close }, 'Done') : null) };",
    tests: [
      {
        name: 'calls children with open=false initially',
        code: `const seen = [];
const { getByRole, queryByText } = render({ children: ({ open, toggle }) => { seen.push(open); return React.createElement('div', null, React.createElement('button', { type: 'button', onClick: toggle }, open ? 'Close' : 'Open'), open ? React.createElement('p', null, 'Secret') : null); } });
expect(seen[0]).toBe(false);
expect(getByRole('button', { name: 'Open' })).toBeTruthy();
expect(queryByText('Secret')).toBeNull();`,
      },
      {
        name: 'toggle re-invokes children with the new state',
        code: `const { getByRole, getByText, queryByText } = render({ children: ({ open, toggle }) => React.createElement('div', null, React.createElement('button', { type: 'button', onClick: toggle }, open ? 'Close' : 'Open'), open ? React.createElement('p', null, 'Secret') : null) });
fireEvent.click(getByRole('button', { name: 'Open' }));
expect(getByText('Secret')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Close' }));
expect(queryByText('Secret')).toBeNull();`,
      },
      {
        name: 'close() sets open to false',
        code: `const { getByRole, queryByText } = render({ initialOpen: true, children: ({ open, close }) => React.createElement('div', null, open ? React.createElement('p', null, 'Secret') : null, React.createElement('button', { type: 'button', onClick: close }, 'Dismiss')) });
expect(queryByText('Secret')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Dismiss' }));
fireEvent.click(getByRole('button', { name: 'Dismiss' }));
expect(queryByText('Secret')).toBeNull();`,
      },
      {
        name: 'renders inside the disclosure wrapper',
        code: `const { getByTestId } = render({ children: ({ open }) => React.createElement('span', null, open ? 'yes' : 'no') });
expect(getByTestId('disclosure')).toHaveTextContent('no');`,
      },
    ],
    hint: 'A function-as-child is just `children(api)` inside your JSX. Do not cache its result — the whole point is to re-run it whenever `open` changes.',
    explanation: 'Render props invert control: the component owns the behaviour (the `open` state and its transitions) while the caller owns the markup. Calling `children` during every render is what keeps the caller\'s UI in sync with the state. Memoizing the returned element with `useMemo` keyed on the children function defeats this, because the function identity rarely changes while the state does.',
  },
  {
    id: 'react-controlled-star-rating',
    number: 37,
    title: 'Controlled Star Rating',
    difficulty: 'Easy',
    topic: 'Composition & Patterns',
    statement: `Build \`StarRating({ value, onChange, max = 5 })\` as a **fully controlled** component: it renders whatever \`value\` it is given and reports clicks through \`onChange\` — it keeps no internal state.

- Render \`max\` buttons. Button \`n\` has \`aria-label="Rate n stars"\` (use "Rate 1 stars" for n = 1 too — keep it uniform) and shows "★" when \`n <= value\`, otherwise "☆".
- Clicking button \`n\` calls \`onChange(n)\`. The displayed stars must **not** change until the parent passes a new \`value\`.
- Render \`<p data-testid="rating-label"><value> of <max></p>\`, e.g. "3 of 5".`,
    componentName: 'StarRating',
    starter: `import React from 'react';

export default function StarRating({ value, onChange, max = 5 }) {
  // TODO: render max buttons driven only by props
  return (
    <div>
      <p data-testid="rating-label">{value} of {max}</p>
    </div>
  );
}
`,
    solution: `import React from 'react';

export default function StarRating({ value, onChange, max = 5 }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          aria-label={'Rate ' + n + ' stars'}
          onClick={() => onChange(n)}
          style={{ fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {n <= value ? '\\u2605' : '\\u2606'}
        </button>
      ))}
      <p data-testid="rating-label">{value + ' of ' + max}</p>
    </div>
  );
}
`,
    previewProps: { value: 3, max: 5 },
    previewSetup: "return { onChange: (n) => console.log('rating', n) };",
    tests: [
      {
        name: 'renders max buttons with value of them filled',
        code: `const { getAllByRole, getAllByText, getByTestId } = render({ value: 3, max: 5, onChange: () => {} });
expect(getAllByRole('button')).toHaveLength(5);
expect(getAllByText('\\u2605')).toHaveLength(3);
expect(getAllByText('\\u2606')).toHaveLength(2);
expect(getByTestId('rating-label')).toHaveTextContent('3 of 5');`,
      },
      {
        name: 'clicking reports through onChange without changing the display',
        code: `const received = [];
const { getByRole, getAllByText } = render({ value: 2, max: 5, onChange: (n) => received.push(n) });
fireEvent.click(getByRole('button', { name: 'Rate 5 stars' }));
expect(received).toEqual([5]);
expect(getAllByText('\\u2605')).toHaveLength(2);`,
      },
      {
        name: 'reflects a new value from the parent',
        code: `const { rerender, getAllByText, getByTestId } = render({ value: 2, max: 5, onChange: () => {} });
rerender({ value: 5, max: 5, onChange: () => {} });
expect(getAllByText('\\u2605')).toHaveLength(5);
expect(getByTestId('rating-label')).toHaveTextContent('5 of 5');
rerender({ value: 0, max: 5, onChange: () => {} });
expect(getAllByText('\\u2606')).toHaveLength(5);`,
      },
      {
        name: 'honours a custom max',
        code: `const { getAllByRole, getByTestId } = render({ value: 1, max: 3, onChange: () => {} });
expect(getAllByRole('button')).toHaveLength(3);
expect(getByTestId('rating-label')).toHaveTextContent('1 of 3');`,
      },
    ],
    hint: 'No `useState` at all. Everything you render comes from `value` and `max`; the only thing a click does is call `onChange(n)`.',
    explanation: 'A controlled component pushes ownership of the value to its parent, which is what makes it composable with forms, validation and undo. Copying `value` into local state with `useState(value)` breaks the contract twice: the display changes before the parent agrees, and later prop updates are ignored because `useState` only reads its argument on the first render.',
  },
  {
    id: 'react-error-boundary-host',
    number: 38,
    title: 'Error Boundary Fallback',
    difficulty: 'Hard',
    topic: 'Composition & Patterns',
    statement: `Build \`WidgetHost({ widget })\` where \`widget\` is a React **component** (a function) that may throw while rendering. Wrap it in a class-based error boundary so a crash shows a fallback instead of unmounting the whole tree.

- Define \`class ErrorBoundary extends React.Component\` with \`static getDerivedStateFromError\`. Its fallback is \`<div role="alert"><p>Something went wrong.</p><p data-testid="error-message"><error.message></p><button>Try again</button></div>\`.
- "Try again" clears the boundary's error state so the child renders again (it will show the fallback again if it still throws).
- \`WidgetHost\` renders \`<ErrorBoundary><Widget /></ErrorBoundary>\` where \`const Widget = widget\`. Render it as an element (\`<Widget />\`), not by calling \`widget()\` — hooks inside the widget must work.
- Above the boundary render \`<h2>Widget host</h2>\` which stays visible even when the widget crashes.`,
    componentName: 'WidgetHost',
    starter: `import React from 'react';

class ErrorBoundary extends React.Component {
  // TODO: state, getDerivedStateFromError, fallback with "Try again"
  render() {
    return this.props.children;
  }
}

export default function WidgetHost({ widget }) {
  const Widget = widget;
  return (
    <div>
      <h2>Widget host</h2>
      <ErrorBoundary>
        <Widget />
      </ErrorBoundary>
    </div>
  );
}
`,
    solution: `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // report to a logging service here
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert">
          <p>Something went wrong.</p>
          <p data-testid="error-message">{this.state.error.message}</p>
          <button type="button" onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WidgetHost({ widget }) {
  const Widget = widget;
  return (
    <div>
      <h2>Widget host</h2>
      <ErrorBoundary>
        <Widget />
      </ErrorBoundary>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: "return { widget: () => { const [n, setN] = React.useState(0); if (n >= 2) throw new Error('Widget crashed after 2 clicks'); return React.createElement('button', { type: 'button', onClick: () => setN(n + 1) }, 'Clicked ' + n + ' times (crashes at 2)'); } };",
    tests: [
      {
        name: 'renders a healthy widget as a component (hooks work)',
        code: `const { getByRole, getByText } = render({ widget: () => { const [n, setN] = React.useState(0); return React.createElement('button', { type: 'button', onClick: () => setN(n + 1) }, 'Clicked ' + n); } });
expect(getByText('Widget host')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'Clicked 0' }));
expect(getByRole('button', { name: 'Clicked 1' })).toBeTruthy();`,
      },
      {
        name: 'shows the fallback with the error message when the widget throws',
        code: `const { getByRole, getByText, getByTestId } = render({ widget: () => { throw new Error('boom'); } });
expect(getByText('Something went wrong.')).toBeTruthy();
expect(getByTestId('error-message')).toHaveTextContent('boom');
expect(getByRole('button', { name: 'Try again' })).toBeTruthy();
expect(getByText('Widget host')).toBeTruthy();`,
      },
      {
        name: 'Try again re-renders the widget once it stops throwing',
        code: `let ok = false;
const { getByRole, getByText, queryByText } = render({ widget: () => { if (!ok) throw new Error('boom'); return React.createElement('p', null, 'Widget OK'); } });
expect(getByText('Something went wrong.')).toBeTruthy();
ok = true;
fireEvent.click(getByRole('button', { name: 'Try again' }));
expect(getByText('Widget OK')).toBeTruthy();
expect(queryByText('Something went wrong.')).toBeNull();`,
      },
      {
        name: 'a widget that keeps throwing shows the fallback again after Try again',
        code: `const { getByRole, getByText } = render({ widget: () => { throw new Error('still broken'); } });
fireEvent.click(getByRole('button', { name: 'Try again' }));
expect(getByText('Something went wrong.')).toBeTruthy();
expect(getByRole('button', { name: 'Try again' })).toBeTruthy();`,
      },
    ],
    hint: 'Only class components can be error boundaries: implement `static getDerivedStateFromError(error)` returning `{ error }` and render the fallback when it is set. A `try/catch` around `{children}` in a function component catches nothing, because children render later.',
    explanation: 'Errors thrown during rendering propagate up the tree until a class component with `getDerivedStateFromError` catches them; that component then re-renders with the error in state and shows a fallback. Function components and `try/catch` cannot do this because JSX only describes elements — the child\'s render runs later, inside React. Resetting the state on "Try again" gives the child another chance without remounting the whole host.',
  },
  {
    id: 'react-modal-escape',
    number: 39,
    title: 'Modal with Escape to Close',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`ModalLauncher({ title, onClose })\` — a button that opens an inline modal (no portal needed) that closes on a button click or the Escape key.

- Initially render only a button "Open modal". No \`role="dialog"\` exists while closed.
- When open render \`<div role="dialog" aria-modal="true"><h2><title></h2><p>Press Escape or Close.</p><button>Close</button></div>\`.
- The "Close" button and the Escape key both close the modal and call \`onClose()\` **exactly once** per close.
- Listen for \`keydown\` on \`document\` only while the modal is open, and remove the listener when it closes or the component unmounts. Escape while closed must do nothing (no \`onClose\` call).`,
    componentName: 'ModalLauncher',
    starter: `import React, { useState, useEffect } from 'react';

export default function ModalLauncher({ title, onClose }) {
  const [open, setOpen] = useState(false);
  // TODO: close(), Escape listener with cleanup
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open modal</button>
      {open && (
        <div role="dialog" aria-modal="true">
          <h2>{title}</h2>
          <p>Press Escape or Close.</p>
          <button type="button">Close</button>
        </div>
      )}
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect, useCallback } from 'react';

export default function ModalLauncher({ title, onClose }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>Open modal</button>
      {open && (
        <div role="dialog" aria-modal="true" style={{ border: '1px solid #888', padding: 16, marginTop: 8 }}>
          <h2>{title}</h2>
          <p>Press Escape or Close.</p>
          <button type="button" onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
`,
    previewProps: { title: 'Delete project?' },
    previewSetup: "return { onClose: () => console.log('closed') };",
    tests: [
      {
        name: 'starts closed and opens on click',
        code: `const { getByRole, queryByRole, getByText } = render({ title: 'Delete project?', onClose: () => {} });
expect(queryByRole('dialog')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Open modal' }));
expect(getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
expect(getByText('Delete project?')).toBeTruthy();`,
      },
      {
        name: 'Close button closes and calls onClose once',
        code: `let closes = 0;
const { getByRole, queryByRole } = render({ title: 'Hi', onClose: () => { closes += 1; } });
fireEvent.click(getByRole('button', { name: 'Open modal' }));
fireEvent.click(getByRole('button', { name: 'Close' }));
expect(queryByRole('dialog')).toBeNull();
expect(closes).toBe(1);`,
      },
      {
        name: 'Escape closes and calls onClose once',
        code: `let closes = 0;
const { getByRole, queryByRole } = render({ title: 'Hi', onClose: () => { closes += 1; } });
fireEvent.click(getByRole('button', { name: 'Open modal' }));
fireEvent.keyDown(document.body, 'Escape');
expect(queryByRole('dialog')).toBeNull();
expect(closes).toBe(1);`,
      },
      {
        name: 'Escape while closed does nothing, and reopening works',
        code: `let closes = 0;
const { getByRole, queryByRole } = render({ title: 'Hi', onClose: () => { closes += 1; } });
fireEvent.keyDown(document.body, 'Escape');
expect(closes).toBe(0);
fireEvent.click(getByRole('button', { name: 'Open modal' }));
fireEvent.keyDown(document.body, 'Escape');
fireEvent.keyDown(document.body, 'Escape');
expect(closes).toBe(1);
fireEvent.click(getByRole('button', { name: 'Open modal' }));
expect(queryByRole('dialog')).toBeTruthy();
fireEvent.keyDown(document.body, 'Escape');
expect(closes).toBe(2);`,
      },
      {
        name: 'other keys do not close it',
        code: `const { getByRole, queryByRole } = render({ title: 'Hi', onClose: () => {} });
fireEvent.click(getByRole('button', { name: 'Open modal' }));
fireEvent.keyDown(document.body, 'Enter');
expect(queryByRole('dialog')).toBeTruthy();`,
      },
    ],
    hint: 'Subscribe inside `useEffect` keyed on `open`, return the `removeEventListener` cleanup, and bail out early when the modal is closed. Without cleanup every re-render stacks another listener.',
    explanation: 'Global listeners are side effects, so they belong in `useEffect` with a cleanup function; React runs the cleanup before re-running the effect and on unmount. Depending on `open` means the listener exists only while the modal is visible, which is why Escape is inert when closed. Forgetting the dependency array or the cleanup leaks listeners, and each stacked copy fires `onClose` again on the next Escape.',
  },
  // ------------------------------------------------- Performance & Hooks
  {
    id: 'react-usememo-filter',
    number: 40,
    title: 'Memoized Filtering with useMemo',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`ProductFilter({ items, compute })\` where \`compute(items, query)\` is an **expensive** function (passed in as a prop so tests can count how often you call it) that returns the filtered array.

- An \`<input>\` labelled "Filter" holding the query.
- A \`<ul>\` with one \`<li>\` per item returned by \`compute(items, query)\`.
- An unrelated button whose text is \`Clicked <n> times\` and increments a counter on each click.

Call \`compute\` **once on mount** and then **only when \`items\` or the query changes**. Clicking the unrelated button re-renders the component but must not call \`compute\` again — wrap the derivation in \`useMemo\`.`,
    componentName: 'ProductFilter',
    starter: `import React, { useState, useMemo } from 'react';

export default function ProductFilter({ items, compute }) {
  const [query, setQuery] = useState('');
  const [clicks, setClicks] = useState(0);
  // TODO: memoize compute(items, query)
  const visible = compute(items, query);
  return (
    <div>
      <label>Filter<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <button type="button" onClick={() => setClicks((c) => c + 1)}>Clicked {clicks} times</button>
      <ul>{visible.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
`,
    solution: `import React, { useState, useMemo } from 'react';

export default function ProductFilter({ items, compute }) {
  const [query, setQuery] = useState('');
  const [clicks, setClicks] = useState(0);
  const visible = useMemo(() => compute(items, query), [items, query, compute]);
  return (
    <div>
      <label>Filter<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <button type="button" onClick={() => setClicks((c) => c + 1)}>Clicked {clicks} times</button>
      <ul>{visible.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}
`,
    previewProps: { items: ['Keyboard', 'Mouse', 'Monitor', 'Headset', 'Webcam'] },
    previewSetup: "return { compute: (items, q) => items.filter((i) => i.toLowerCase().includes(q.toLowerCase())) };",
    tests: [
      {
        name: 'renders the list compute returns',
        code: `const items = ['Keyboard', 'Mouse', 'Monitor'];
const { getAllByRole } = render({ items, compute: (list, q) => list.filter((i) => i.toLowerCase().includes(q.toLowerCase())) });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Keyboard', 'Mouse', 'Monitor']);`,
      },
      {
        name: 'calls compute exactly once on mount',
        code: `let calls = 0;
const items = ['Keyboard', 'Mouse', 'Monitor'];
render({ items, compute: (list, q) => { calls += 1; return list.filter((i) => i.toLowerCase().includes(q.toLowerCase())); } });
expect(calls).toBe(1);`,
      },
      {
        name: 'unrelated clicks do not recompute',
        code: `let calls = 0;
const items = ['Keyboard', 'Mouse', 'Monitor'];
const { getByRole, getByText } = render({ items, compute: (list, q) => { calls += 1; return list.filter((i) => i.toLowerCase().includes(q.toLowerCase())); } });
fireEvent.click(getByRole('button'));
fireEvent.click(getByRole('button'));
fireEvent.click(getByRole('button'));
expect(getByText('Clicked 3 times')).toBeTruthy();
expect(calls).toBe(1);`,
      },
      {
        name: 'typing recomputes and narrows the list',
        code: `let calls = 0;
const items = ['Keyboard', 'Mouse', 'Monitor'];
const { getByLabelText, getAllByRole } = render({ items, compute: (list, q) => { calls += 1; return list.filter((i) => i.toLowerCase().includes(q.toLowerCase())); } });
fireEvent.change(getByLabelText('Filter'), 'mo');
expect(calls).toBe(2);
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Mouse', 'Monitor']);`,
      },
    ],
    hint: '`const visible = useMemo(() => compute(items, query), [items, query, compute])`. The dependency array is what decides when the expensive function runs again.',
    explanation: '`useMemo` caches the result of a computation between renders and only recomputes when one of its dependencies changes by reference. State that has nothing to do with the list (the click counter) still re-renders the component, but the memoized value is reused, so the expensive `compute` is skipped. Without it every keystroke and every click would pay the full cost.',
  },
  {
    id: 'react-memo-profile-card',
    number: 41,
    title: 'Skipping Re-renders with memo',
    difficulty: 'Hard',
    topic: 'Performance & Hooks',
    statement: `Build \`ProfileDashboard({ initialName })\` with a memoized child that ignores unrelated parent updates.

- Child \`ProfileCard({ name })\` wrapped in \`React.memo\`. It renders \`<p>Name: <name></p>\` and \`<p data-testid="render-count"><n></p>\` where \`n\` is how many times the card has rendered (keep a \`useRef\` counter and increment it during render).
- Parent state: \`name\` (an \`<input>\` labelled "Name", initialised from \`initialName\`) and \`pings\` — a button "Ping" that increments it, displayed as \`<p>Pings: <n></p>\`.
- The parent passes **only** \`name\` to \`ProfileCard\` — no inline objects or callbacks that change identity every render.

After mount \`render-count\` is "1". Clicking "Ping" any number of times must leave it at "1"; changing the name bumps it by one per change.`,
    componentName: 'ProfileDashboard',
    starter: `import React, { useState, useRef, memo } from 'react';

function ProfileCard({ name }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div>
      <p>Name: {name}</p>
      <p data-testid="render-count">{renders.current}</p>
    </div>
  );
}

export default function ProfileDashboard({ initialName = '' }) {
  const [name, setName] = useState(initialName);
  const [pings, setPings] = useState(0);
  // TODO: stop ProfileCard from re-rendering on Ping
  return (
    <div>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <button type="button" onClick={() => setPings((p) => p + 1)}>Ping</button>
      <p>Pings: {pings}</p>
      <ProfileCard name={name} />
    </div>
  );
}
`,
    solution: `import React, { useState, useRef, memo } from 'react';

const ProfileCard = memo(function ProfileCard({ name }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div style={{ border: '1px solid #ccc', padding: 8 }}>
      <p>Name: {name}</p>
      <p data-testid="render-count">{renders.current}</p>
    </div>
  );
});

export default function ProfileDashboard({ initialName = '' }) {
  const [name, setName] = useState(initialName);
  const [pings, setPings] = useState(0);
  return (
    <div>
      <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
      <button type="button" onClick={() => setPings((p) => p + 1)}>Ping</button>
      <p>Pings: {pings}</p>
      <ProfileCard name={name} />
    </div>
  );
}
`,
    previewProps: { initialName: 'Ada' },
    tests: [
      {
        name: 'renders the card once on mount',
        code: `const { getByTestId, getByText } = render({ initialName: 'Ada' });
expect(getByText('Name: Ada')).toBeTruthy();
expect(getByTestId('render-count')).toHaveTextContent('1');`,
      },
      {
        name: 'Ping re-renders the parent but not the memoized card',
        code: `const { getByTestId, getByText, getByRole } = render({ initialName: 'Ada' });
fireEvent.click(getByRole('button', { name: 'Ping' }));
fireEvent.click(getByRole('button', { name: 'Ping' }));
fireEvent.click(getByRole('button', { name: 'Ping' }));
expect(getByText('Pings: 3')).toBeTruthy();
expect(getByTestId('render-count')).toHaveTextContent('1');`,
      },
      {
        name: 'changing the name re-renders the card once per change',
        code: `const { getByTestId, getByText, getByLabelText } = render({ initialName: 'Ada' });
fireEvent.change(getByLabelText('Name'), 'Grace');
expect(getByText('Name: Grace')).toBeTruthy();
expect(getByTestId('render-count')).toHaveTextContent('2');
fireEvent.change(getByLabelText('Name'), 'Grace H');
expect(getByTestId('render-count')).toHaveTextContent('3');`,
      },
      {
        name: 'pings after a name change still do not touch the card',
        code: `const { getByTestId, getByLabelText, getByRole } = render({ initialName: 'Ada' });
fireEvent.change(getByLabelText('Name'), 'Linus');
fireEvent.click(getByRole('button', { name: 'Ping' }));
fireEvent.click(getByRole('button', { name: 'Ping' }));
expect(getByTestId('render-count')).toHaveTextContent('2');`,
      },
    ],
    hint: 'Wrap the child: `const ProfileCard = memo(function ProfileCard({ name }) { ... })`. Then make sure every prop you pass is a primitive or a stable reference — a fresh object or arrow function defeats the memo.',
    explanation: '`React.memo` makes a component skip rendering when its props are shallowly equal to the previous ones. The parent still re-renders on every ping, but React compares `name` (a string) and bails out of the card. The optimisation only holds if the props are stable: passing `{ name }` as an object or an inline callback creates a new reference each render and silently turns the memo into a no-op.',
  },
  {
    id: 'react-usecallback-like-button',
    number: 42,
    title: 'Stable Handlers with useCallback',
    difficulty: 'Hard',
    topic: 'Performance & Hooks',
    statement: `Build \`LikePanel()\` where a memoized child receives a callback that must keep the same identity across parent renders.

- Child \`LikeButton({ onLike })\` wrapped in \`React.memo\`: renders \`<button>Like</button>\` plus \`<span data-testid="button-renders"><n></span>\` counting its own renders (use a \`useRef\` counter incremented during render).
- Parent state: \`likes\` (shown as \`<p>Likes: <n></p>\`) and \`comment\` (an \`<input>\` labelled "Comment", echoed in \`<p data-testid="comment-preview"><comment></p>\`).
- Pass \`handleLike\` to the child through \`useCallback\` with an empty dependency array, using the functional \`setLikes((n) => n + 1)\` form so the callback never needs to change.

Expected: \`button-renders\` is "1" after mount and stays "1" while the user clicks Like or types a comment.`,
    componentName: 'LikePanel',
    starter: `import React, { useState, useRef, useCallback, memo } from 'react';

const LikeButton = memo(function LikeButton({ onLike }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div>
      <button type="button" onClick={onLike}>Like</button>
      <span data-testid="button-renders">{renders.current}</span>
    </div>
  );
});

export default function LikePanel() {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  // TODO: give LikeButton a stable handler
  return (
    <div>
      <p>Likes: {likes}</p>
      <label>Comment<input value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      <p data-testid="comment-preview">{comment}</p>
      <LikeButton onLike={() => setLikes(likes + 1)} />
    </div>
  );
}
`,
    solution: `import React, { useState, useRef, useCallback, memo } from 'react';

const LikeButton = memo(function LikeButton({ onLike }) {
  const renders = useRef(0);
  renders.current += 1;
  return (
    <div>
      <button type="button" onClick={onLike}>Like</button>
      <span data-testid="button-renders">{renders.current}</span>
    </div>
  );
});

export default function LikePanel() {
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState('');
  const handleLike = useCallback(() => setLikes((n) => n + 1), []);
  return (
    <div>
      <p>Likes: {likes}</p>
      <label>Comment<input value={comment} onChange={(e) => setComment(e.target.value)} /></label>
      <p data-testid="comment-preview">{comment}</p>
      <LikeButton onLike={handleLike} />
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'the button renders once on mount',
        code: `const { getByTestId, getByText } = render({});
expect(getByTestId('button-renders')).toHaveTextContent('1');
expect(getByText('Likes: 0')).toBeTruthy();`,
      },
      {
        name: 'clicking Like increments without re-rendering the button',
        code: `const { getByTestId, getByText, getByRole } = render({});
fireEvent.click(getByRole('button', { name: 'Like' }));
fireEvent.click(getByRole('button', { name: 'Like' }));
expect(getByText('Likes: 2')).toBeTruthy();
expect(getByTestId('button-renders')).toHaveTextContent('1');`,
      },
      {
        name: 'typing a comment does not re-render the button',
        code: `const { getByTestId, getByLabelText } = render({});
fireEvent.change(getByLabelText('Comment'), 'Nice');
fireEvent.change(getByLabelText('Comment'), 'Nice work');
expect(getByTestId('comment-preview')).toHaveTextContent('Nice work');
expect(getByTestId('button-renders')).toHaveTextContent('1');`,
      },
      {
        name: 'likes keep counting correctly after typing',
        code: `const { getByText, getByLabelText, getByRole } = render({});
fireEvent.click(getByRole('button', { name: 'Like' }));
fireEvent.change(getByLabelText('Comment'), 'x');
fireEvent.click(getByRole('button', { name: 'Like' }));
fireEvent.click(getByRole('button', { name: 'Like' }));
expect(getByText('Likes: 3')).toBeTruthy();`,
      },
    ],
    hint: '`const handleLike = useCallback(() => setLikes((n) => n + 1), [])`. The functional updater is what lets the dependency array stay empty without going stale.',
    explanation: 'An inline arrow function is a brand-new value on every render, so a memoized child receiving it re-renders every time the parent does. `useCallback` returns the same function reference until its dependencies change; combined with the functional state updater it never needs `likes` as a dependency and can stay stable forever. `memo` and `useCallback` only help together — one without the other does nothing.',
  },
  {
    id: 'react-useref-focus-field',
    number: 43,
    title: 'Focus Management with useRef',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`FocusField({ label })\` — a controlled text input with imperative focus handling via a ref.

- An \`<input>\` inside a \`<label>\` whose text is the \`label\` prop (e.g. "Query"). It must be **focused on mount** (\`document.activeElement\` is the input right after rendering) — do this in \`useEffect\`, not during render.
- A button "Focus input" that focuses the input through the ref.
- A button "Clear" that empties the input and focuses it.
- \`<p>Characters: <n></p>\` showing the current length.`,
    componentName: 'FocusField',
    starter: `import React, { useState, useRef, useEffect } from 'react';

export default function FocusField({ label = 'Query' }) {
  const [value, setValue] = useState('');
  // TODO: ref + focus on mount, Focus input, Clear
  return (
    <div>
      <label>{label}<input value={value} onChange={(e) => setValue(e.target.value)} /></label>
      <button type="button">Focus input</button>
      <button type="button">Clear</button>
      <p>Characters: {value.length}</p>
    </div>
  );
}
`,
    solution: `import React, { useState, useRef, useEffect } from 'react';

export default function FocusField({ label = 'Query' }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const focusInput = () => inputRef.current && inputRef.current.focus();
  const clear = () => {
    setValue('');
    focusInput();
  };

  return (
    <div>
      <label>{label}<input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} /></label>
      <button type="button" onClick={focusInput}>Focus input</button>
      <button type="button" onClick={clear}>Clear</button>
      <p>Characters: {value.length}</p>
    </div>
  );
}
`,
    previewProps: { label: 'Query' },
    tests: [
      {
        name: 'the input is focused on mount',
        code: `const { getByLabelText } = render({ label: 'Query' });
await tick();
expect(document.activeElement).toBe(getByLabelText('Query'));`,
      },
      {
        name: 'Focus input refocuses after blur',
        code: `const { getByLabelText, getByRole } = render({ label: 'Query' });
const input = getByLabelText('Query');
fireEvent.blur(input);
expect(document.activeElement).not.toBe(input);
fireEvent.click(getByRole('button', { name: 'Focus input' }));
expect(document.activeElement).toBe(input);`,
      },
      {
        name: 'Clear empties the value and focuses the input',
        code: `const { getByLabelText, getByRole, getByText } = render({ label: 'Query' });
const input = getByLabelText('Query');
fireEvent.change(input, 'hello');
expect(getByText('Characters: 5')).toBeTruthy();
fireEvent.blur(input);
fireEvent.click(getByRole('button', { name: 'Clear' }));
expect(input).toHaveValue('');
expect(getByText('Characters: 0')).toBeTruthy();
expect(document.activeElement).toBe(input);`,
      },
      {
        name: 'uses the label prop',
        code: `const { getByLabelText } = render({ label: 'Search term' });
expect(getByLabelText('Search term')).toBeTruthy();`,
      },
    ],
    hint: 'Attach `ref={inputRef}` and call `inputRef.current.focus()` inside `useEffect(() => {...}, [])`. During the first render `inputRef.current` is still `null` — the DOM node only exists after commit.',
    explanation: 'Refs give you an escape hatch to the real DOM node for imperative operations such as focus, scroll or measurement. The node is attached during the commit phase, which is why focusing must happen in `useEffect` (or an event handler) rather than in the render body where `ref.current` is still `null`. Event handlers run long after mount, so the same ref is ready for "Focus input" and "Clear".',
  },
  {
    id: 'react-usereducer-task-board',
    number: 44,
    title: 'Task Board with useReducer',
    difficulty: 'Medium',
    topic: 'Performance & Hooks',
    statement: `Build \`TaskBoard({ initialTasks })\` with all state transitions in a single reducer. \`initialTasks\` is an array of \`{ id, title, done }\`.

- Actions: \`add\` (title), \`toggle\` (id), \`remove\` (id). The reducer must return **new** arrays/objects — never mutate the previous state.
- An \`<input>\` labelled "New task" and a button "Add task". Adding a non-blank title appends a task (done: false) and clears the input; blank titles are ignored.
- Each task is an \`<li data-done="true|false">\` containing a checkbox with \`aria-label="Toggle <title>"\`, the title text, and a button with \`aria-label="Remove <title>"\`.
- A footer \`<p><remaining> of <total> remaining</p>\`, e.g. "1 of 2 remaining".`,
    componentName: 'TaskBoard',
    starter: `import React, { useState, useReducer } from 'react';

function reducer(state, action) {
  // TODO: add / toggle / remove without mutating
  return state;
}

export default function TaskBoard({ initialTasks = [] }) {
  const [tasks, dispatch] = useReducer(reducer, initialTasks);
  const [title, setTitle] = useState('');
  const remaining = tasks.filter((t) => !t.done).length;
  return (
    <div>
      <label>New task<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <button type="button">Add task</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id} data-done={t.done ? 'true' : 'false'}>
            <input type="checkbox" aria-label={'Toggle ' + t.title} checked={t.done} readOnly />
            <span>{t.title}</span>
            <button type="button" aria-label={'Remove ' + t.title}>x</button>
          </li>
        ))}
      </ul>
      <p>{remaining} of {tasks.length} remaining</p>
    </div>
  );
}
`,
    solution: `import React, { useState, useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return [...state, { id: Date.now() + Math.random(), title: action.title, done: false }];
    case 'toggle':
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case 'remove':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export default function TaskBoard({ initialTasks = [] }) {
  const [tasks, dispatch] = useReducer(reducer, initialTasks);
  const [title, setTitle] = useState('');
  const remaining = tasks.filter((t) => !t.done).length;

  const add = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    dispatch({ type: 'add', title: trimmed });
    setTitle('');
  };

  return (
    <div>
      <label>New task<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <button type="button" onClick={add}>Add task</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id} data-done={t.done ? 'true' : 'false'}>
            <input
              type="checkbox"
              aria-label={'Toggle ' + t.title}
              checked={t.done}
              onChange={() => dispatch({ type: 'toggle', id: t.id })}
            />
            <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
            <button type="button" aria-label={'Remove ' + t.title} onClick={() => dispatch({ type: 'remove', id: t.id })}>x</button>
          </li>
        ))}
      </ul>
      <p>{remaining} of {tasks.length} remaining</p>
    </div>
  );
}
`,
    previewProps: { initialTasks: [{ id: 1, title: 'Write tests', done: false }, { id: 2, title: 'Ship it', done: true }] },
    tests: [
      {
        name: 'renders the initial tasks and the remaining count',
        code: `const { getAllByRole, getByText } = render({ initialTasks: [{ id: 1, title: 'Write tests', done: false }, { id: 2, title: 'Ship it', done: true }] });
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getByText('1 of 2 remaining')).toBeTruthy();
expect(getAllByRole('listitem')[1]).toHaveAttribute('data-done', 'true');`,
      },
      {
        name: 'adds a task and clears the input; blank titles are ignored',
        code: `const { getByLabelText, getByRole, getByText, getAllByRole } = render({ initialTasks: [{ id: 1, title: 'Write tests', done: false }] });
fireEvent.click(getByRole('button', { name: 'Add task' }));
expect(getAllByRole('listitem')).toHaveLength(1);
fireEvent.change(getByLabelText('New task'), 'Review PR');
fireEvent.click(getByRole('button', { name: 'Add task' }));
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getByText('Review PR')).toBeTruthy();
expect(getByLabelText('New task')).toHaveValue('');
expect(getByText('2 of 2 remaining')).toBeTruthy();`,
      },
      {
        name: 'toggling updates data-done and the remaining count',
        code: `const { getByRole, getByText, getAllByRole } = render({ initialTasks: [{ id: 1, title: 'Write tests', done: false }, { id: 2, title: 'Ship it', done: false }] });
fireEvent.click(getByRole('checkbox', { name: 'Toggle Write tests' }));
expect(getAllByRole('listitem')[0]).toHaveAttribute('data-done', 'true');
expect(getByText('1 of 2 remaining')).toBeTruthy();
fireEvent.click(getByRole('checkbox', { name: 'Toggle Write tests' }));
expect(getByText('2 of 2 remaining')).toBeTruthy();`,
      },
      {
        name: 'removing a task deletes it',
        code: `const { getByRole, getByText, queryByText, getAllByRole } = render({ initialTasks: [{ id: 1, title: 'Write tests', done: false }, { id: 2, title: 'Ship it', done: true }] });
fireEvent.click(getByRole('button', { name: 'Remove Ship it' }));
expect(queryByText('Ship it')).toBeNull();
expect(getAllByRole('listitem')).toHaveLength(1);
expect(getByText('1 of 1 remaining')).toBeTruthy();`,
      },
    ],
    hint: 'Each case returns a new array: `[...state, newTask]`, `state.map(...)` with a spread for the toggled item, `state.filter(...)` for remove. Returning the same array reference makes React skip the update.',
    explanation: 'A reducer centralises every state transition as `(state, action) => newState`, which keeps event handlers tiny and makes the logic easy to test. React compares the returned value with the previous state by reference, so mutating a task in place and returning the same array is a silent no-op — the UI never updates. Immutable updates via spread, `map` and `filter` are what make the re-render happen.',
  },
  // ------------------------------------------------------- Async & Data
  {
    id: 'react-async-user-loader',
    number: 45,
    title: 'Loading, Data and Error States',
    difficulty: 'Medium',
    topic: 'Async & Data',
    statement: `Build \`UserLoader({ userId, load })\` where \`load(userId)\` returns a Promise of \`{ name, email }\` (injected so tests control timing).

- While the request is pending render \`<p>Loading...</p>\`.
- On success render \`<p>Name: <name></p>\` and \`<p>Email: <email></p>\`.
- On rejection render \`<p role="alert">Error: <message></p>\`.
- Fetch in \`useEffect\` when the component mounts **and whenever \`userId\` changes** (show "Loading..." again while the new request is pending). Ignore responses from a request whose \`userId\` is no longer current.`,
    componentName: 'UserLoader',
    starter: `import React, { useState, useEffect } from 'react';

export default function UserLoader({ userId, load }) {
  // TODO: loading / data / error state driven by load(userId)
  return <p>Loading...</p>;
}
`,
    solution: `import React, { useState, useEffect } from 'react';

export default function UserLoader({ userId, load }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: null, error: null });
    load(userId).then(
      (data) => { if (!cancelled) setState({ status: 'success', data, error: null }); },
      (err) => { if (!cancelled) setState({ status: 'error', data: null, error: err }); }
    );
    return () => { cancelled = true; };
  }, [userId, load]);

  if (state.status === 'loading') return <p>Loading...</p>;
  if (state.status === 'error') return <p role="alert">{'Error: ' + (state.error && state.error.message)}</p>;
  return (
    <div>
      <p>{'Name: ' + state.data.name}</p>
      <p>{'Email: ' + state.data.email}</p>
    </div>
  );
}
`,
    previewProps: { userId: 1 },
    previewSetup: "return { load: (id) => new Promise((res, rej) => setTimeout(() => (id === 3 ? rej(new Error('User not found')) : res({ name: id === 1 ? 'Ada Lovelace' : 'Grace Hopper', email: 'user' + id + '@example.com' })), 300)) };",
    tests: [
      {
        name: 'shows Loading... while the promise is pending',
        code: `const { getByText } = render({ userId: 1, load: () => new Promise(() => {}) });
expect(getByText('Loading...')).toBeTruthy();`,
      },
      {
        name: 'renders the user after the promise resolves',
        code: `const { getByText, queryByText } = render({ userId: 1, load: async (id) => ({ name: 'Ada', email: 'ada@example.com' }) });
await waitFor(() => getByText('Name: Ada'));
expect(getByText('Email: ada@example.com')).toBeTruthy();
expect(queryByText('Loading...')).toBeNull();`,
      },
      {
        name: 'renders the error message on rejection',
        code: `const { getByRole, queryByText } = render({ userId: 1, load: async () => { throw new Error('Not found'); } });
await waitFor(() => getByRole('alert'));
expect(getByRole('alert')).toHaveTextContent('Error: Not found');
expect(queryByText('Loading...')).toBeNull();`,
      },
      {
        name: 'refetches when userId changes',
        code: `const requested = [];
const load = async (id) => { requested.push(id); return { name: 'User ' + id, email: 'u' + id + '@example.com' }; };
const { getByText, rerender } = render({ userId: 1, load });
await waitFor(() => getByText('Name: User 1'));
rerender({ userId: 2, load });
await waitFor(() => getByText('Name: User 2'));
expect(requested).toEqual([1, 2]);`,
      },
    ],
    hint: 'Model the three states explicitly (`status: loading | success | error`) and run the request in `useEffect(..., [userId, load])`. Reset to loading at the start of the effect so a new id shows the spinner again.',
    explanation: 'Data fetching is a side effect, so it lives in `useEffect`; the dependency array makes the effect re-run whenever `userId` changes, which is how the component refetches. A single status field prevents impossible combinations such as "loading with data". The `cancelled` flag in the cleanup discards a response that arrives after the user id has already moved on.',
  },
  {
    id: 'react-retry-loader',
    number: 46,
    title: 'Retry After a Failed Request',
    difficulty: 'Medium',
    topic: 'Async & Data',
    statement: `Build \`RetryLoader({ load })\` where \`load()\` returns a Promise of a string.

- Call \`load()\` on mount. While pending render \`<p>Loading...</p>\`.
- On success render \`<p data-testid="result"><text></p>\`.
- On rejection render \`<p role="alert">Error: <message></p>\` and a button "Retry".
- Clicking Retry calls \`load()\` again; while that retry is pending the UI shows "Loading..." and the **alert is gone**.
- Render \`<p>Attempts: <n></p>\` counting every call to \`load\` so far.`,
    componentName: 'RetryLoader',
    starter: `import React, { useState, useEffect } from 'react';

export default function RetryLoader({ load }) {
  // TODO: call load(), handle loading / result / error, Retry button
  return (
    <div>
      <p>Attempts: 0</p>
      <p>Loading...</p>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect, useCallback } from 'react';

export default function RetryLoader({ load }) {
  const [status, setStatus] = useState('loading');
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const run = useCallback(() => {
    setStatus('loading');
    setError(null);
    setAttempts((n) => n + 1);
    load().then(
      (text) => { setResult(text); setStatus('success'); },
      (err) => { setError(err); setStatus('error'); }
    );
  }, [load]);

  useEffect(() => { run(); }, [run]);

  return (
    <div>
      <p>{'Attempts: ' + attempts}</p>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'success' && <p data-testid="result">{result}</p>}
      {status === 'error' && (
        <div>
          <p role="alert">{'Error: ' + error.message}</p>
          <button type="button" onClick={run}>Retry</button>
        </div>
      )}
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: "let n = 0; return { load: () => new Promise((res, rej) => setTimeout(() => { n += 1; if (n % 2 === 1) rej(new Error('Network unreachable')); else res('Connected on attempt ' + n); }, 300)) };",
    tests: [
      {
        name: 'shows the result after a successful load',
        code: `const { getByTestId, getByText, queryByText } = render({ load: async () => 'hello world' });
expect(getByText('Loading...')).toBeTruthy();
await waitFor(() => getByTestId('result'));
expect(getByTestId('result')).toHaveTextContent('hello world');
expect(getByText('Attempts: 1')).toBeTruthy();
expect(queryByText('Loading...')).toBeNull();`,
      },
      {
        name: 'shows the error and a Retry button on failure',
        code: `const { getByRole, getByText } = render({ load: async () => { throw new Error('Offline'); } });
await waitFor(() => getByRole('alert'));
expect(getByRole('alert')).toHaveTextContent('Error: Offline');
expect(getByRole('button', { name: 'Retry' })).toBeTruthy();
expect(getByText('Attempts: 1')).toBeTruthy();`,
      },
      {
        name: 'Retry calls load again and shows the result on success',
        code: `let calls = 0;
const load = async () => { calls += 1; if (calls === 1) throw new Error('Offline'); return 'back online'; };
const { getByRole, getByTestId, getByText, queryByRole } = render({ load });
await waitFor(() => getByRole('alert'));
fireEvent.click(getByRole('button', { name: 'Retry' }));
await waitFor(() => getByTestId('result'));
expect(getByTestId('result')).toHaveTextContent('back online');
expect(getByText('Attempts: 2')).toBeTruthy();
expect(queryByRole('alert')).toBeNull();
expect(calls).toBe(2);`,
      },
      {
        name: 'while the retry is pending the alert is gone and Loading... is shown',
        code: `let calls = 0;
const load = () => { calls += 1; return calls === 1 ? Promise.reject(new Error('Offline')) : new Promise(() => {}); };
const { getByRole, getByText, queryByRole } = render({ load });
await waitFor(() => getByRole('alert'));
fireEvent.click(getByRole('button', { name: 'Retry' }));
expect(getByText('Loading...')).toBeTruthy();
expect(queryByRole('alert')).toBeNull();
expect(getByText('Attempts: 2')).toBeTruthy();`,
      },
    ],
    hint: 'Write one `run()` function that resets to the loading state, bumps the attempt counter and kicks off `load()`. Call it from the mount effect and from the Retry button.',
    explanation: 'Retrying is the same operation as the initial fetch, so sharing a single `run` function keeps the two paths identical and avoids drift. The important detail is resetting the UI state *before* the new request starts: clearing the error and flipping back to loading gives the user immediate feedback that something is happening. Leaving the stale alert on screen during the retry is the bug this problem is designed to catch.',
  },
  {
    id: 'react-race-guard-switcher',
    number: 47,
    title: 'Race-Proof User Switcher',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`UserSwitcher({ userIds, load })\` where \`load(id)\` returns a Promise of \`{ name }\` with **unpredictable latency**.

- Render one button per id reading \`User <id>\`.
- Before any selection render \`<p>Select a user</p>\`. After a click render \`<p>Loading...</p>\` until the response for the **most recently clicked** user arrives, then \`<p data-testid="name">Name: <name></p>\`.
- Race guard: if the user clicks User 1 and then User 2 and the response for 1 arrives *after* the response for 2, the UI must show User 2 and never flip back to 1. Track the latest request (a ref or a cancelled flag in the effect cleanup) and ignore stale responses.`,
    componentName: 'UserSwitcher',
    starter: `import React, { useState, useEffect, useRef } from 'react';

export default function UserSwitcher({ userIds, load }) {
  const [selected, setSelected] = useState(null);
  // TODO: load the selected user and ignore stale responses
  return (
    <div>
      {userIds.map((id) => (
        <button key={id} type="button" onClick={() => setSelected(id)}>User {id}</button>
      ))}
      <p>Select a user</p>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from 'react';

export default function UserSwitcher({ userIds, load }) {
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selected === null) return undefined;
    let cancelled = false;
    setLoading(true);
    setUser(null);
    load(selected).then((data) => {
      if (cancelled) return;
      setUser(data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [selected, load]);

  return (
    <div>
      {userIds.map((id) => (
        <button key={id} type="button" onClick={() => setSelected(id)} style={{ fontWeight: id === selected ? 'bold' : 'normal' }}>User {id}</button>
      ))}
      {selected === null && <p>Select a user</p>}
      {loading && <p>Loading...</p>}
      {!loading && user && <p data-testid="name">{'Name: ' + user.name}</p>}
    </div>
  );
}
`,
    previewProps: { userIds: [1, 2, 3] },
    previewSetup: "const names = { 1: 'Ada', 2: 'Grace', 3: 'Linus' }; return { load: (id) => new Promise((res) => setTimeout(() => res({ name: names[id] }), id === 1 ? 300 : 100)) };",
    tests: [
      {
        name: 'shows the prompt, then Loading..., then the name',
        code: `const { getByText, getByRole, getByTestId } = render({ userIds: [1, 2], load: (id) => new Promise((res) => setTimeout(() => res({ name: 'User ' + id }), 10)) });
expect(getByText('Select a user')).toBeTruthy();
fireEvent.click(getByRole('button', { name: 'User 1' }));
expect(getByText('Loading...')).toBeTruthy();
await waitFor(() => getByTestId('name'));
expect(getByTestId('name')).toHaveTextContent('Name: User 1');`,
      },
      {
        name: 'calls load with the clicked id',
        code: `const ids = [];
const { getByRole } = render({ userIds: [1, 2, 3], load: async (id) => { ids.push(id); return { name: 'x' }; } });
fireEvent.click(getByRole('button', { name: 'User 3' }));
await waitFor(() => { if (ids.length < 1) throw new Error('not yet'); });
expect(ids).toEqual([3]);`,
      },
      {
        name: 'a slow earlier response never overwrites the latest selection',
        code: `const names = { 1: 'Ada', 2: 'Grace' };
const load = (id) => new Promise((res) => setTimeout(() => res({ name: names[id] }), id === 1 ? 40 : 5));
const { getByRole, getByTestId } = render({ userIds: [1, 2], load });
fireEvent.click(getByRole('button', { name: 'User 1' }));
fireEvent.click(getByRole('button', { name: 'User 2' }));
await waitFor(() => getByTestId('name'));
expect(getByTestId('name')).toHaveTextContent('Name: Grace');
await sleep(60);
expect(getByTestId('name')).toHaveTextContent('Name: Grace');`,
      },
      {
        name: 'switching shows Loading... again and then the new user',
        code: `const load = (id) => new Promise((res) => setTimeout(() => res({ name: 'User ' + id }), 5));
const { getByRole, getByTestId, getByText } = render({ userIds: [1, 2], load });
fireEvent.click(getByRole('button', { name: 'User 1' }));
await waitFor(() => getByTestId('name'));
fireEvent.click(getByRole('button', { name: 'User 2' }));
expect(getByText('Loading...')).toBeTruthy();
await waitFor(() => { if (getByTestId('name').textContent !== 'Name: User 2') throw new Error('not yet'); });`,
      },
    ],
    hint: 'Fetch inside `useEffect(..., [selected])` with a local `let cancelled = false` and `return () => { cancelled = true; }`. When the selection changes, React runs the cleanup first, so the previous request\'s `.then` sees `cancelled === true` and does nothing.',
    explanation: 'Promises cannot be cancelled, but their results can be ignored. Each effect run owns a `cancelled` flag; the cleanup that runs when `selected` changes flips the old flag, so a late response from a previous user is dropped instead of overwriting newer state. Without this guard the UI shows whichever response happened to arrive last — a bug that only appears under real network latency.',
  },
  {
    id: 'react-debounced-search-box',
    number: 48,
    title: 'Debounced Search Box',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`DebouncedSearch({ search, delay = 300 })\` where \`search(query)\` returns a Promise of a string array.

- An \`<input>\` labelled "Search".
- Call \`search(query)\` only after the user has stopped typing for \`delay\` ms. Typing "a", "ab", "abc" in quick succession must result in **exactly one** call, with "abc".
- Never call \`search\` for an empty query; clear any results instead.
- Render the results as \`<li>\` items in a \`<ul>\`. When the response is an empty array render \`<p>No results</p>\`.
- Cancel the pending timer when the query changes again or the component unmounts (\`useEffect\` cleanup with \`clearTimeout\`).`,
    componentName: 'DebouncedSearch',
    starter: `import React, { useState, useEffect } from 'react';

export default function DebouncedSearch({ search, delay = 300 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  // TODO: debounce search(query) by delay ms
  return (
    <div>
      <label>Search<input value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <ul>{results.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from 'react';

export default function DebouncedSearch({ search, delay = 300 }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(null);
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      search(query).then((list) => {
        if (!cancelled) setResults(list);
      });
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, delay, search]);

  return (
    <div>
      <label>Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type to search" /></label>
      {results && results.length === 0 && <p>No results</p>}
      {results && results.length > 0 && (
        <ul>{results.map((r) => <li key={r}>{r}</li>)}</ul>
      )}
    </div>
  );
}
`,
    previewProps: { delay: 300 },
    previewSetup: "const all = ['apple', 'apricot', 'banana', 'blueberry', 'cherry']; return { search: (q) => new Promise((res) => setTimeout(() => res(all.filter((w) => w.startsWith(q.toLowerCase()))), 150)) };",
    tests: [
      {
        name: 'fires one search with the final query after the delay',
        code: `const queries = [];
const { getByLabelText, getAllByRole } = render({ delay: 30, search: async (q) => { queries.push(q); return [q + '-1', q + '-2']; } });
const input = getByLabelText('Search');
fireEvent.change(input, 'a');
fireEvent.change(input, 'ab');
fireEvent.change(input, 'abc');
await sleep(80);
expect(queries).toEqual(['abc']);
await waitFor(() => getAllByRole('listitem'));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['abc-1', 'abc-2']);`,
      },
      {
        name: 'does not search before the delay has elapsed',
        code: `const queries = [];
const { getByLabelText } = render({ delay: 40, search: async (q) => { queries.push(q); return []; } });
fireEvent.change(getByLabelText('Search'), 'react');
await sleep(10);
expect(queries).toEqual([]);`,
      },
      {
        name: 'never searches an empty query',
        code: `const queries = [];
const { getByLabelText, queryByText } = render({ delay: 20, search: async (q) => { queries.push(q); return []; } });
fireEvent.change(getByLabelText('Search'), 'x');
fireEvent.change(getByLabelText('Search'), '');
await sleep(60);
expect(queries).toEqual([]);
expect(queryByText('No results')).toBeNull();`,
      },
      {
        name: 'shows No results for an empty response',
        code: `const { getByLabelText, getByText } = render({ delay: 20, search: async () => [] });
fireEvent.change(getByLabelText('Search'), 'zzz');
await waitFor(() => getByText('No results'));`,
      },
    ],
    hint: 'In `useEffect(..., [query])` start a `setTimeout(() => search(query)..., delay)` and return `() => clearTimeout(timer)`. Every keystroke cancels the previous timer, so only the last one survives long enough to fire.',
    explanation: 'Debouncing delays the work until input has settled. Implemented with an effect keyed on `query`, each new value first runs the previous cleanup (cancelling the timer that was about to fire) and then schedules a fresh one, so only the final query reaches `search`. The `cancelled` flag additionally protects against a slow response for an older query landing after a newer one.',
  },
  {
    id: 'react-optimistic-follow',
    number: 49,
    title: 'Optimistic Follow Button',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`FollowButton({ initialFollowing = false, toggleFollow })\` where \`toggleFollow(next)\` returns a Promise that resolves when the server has saved the new state (\`next\` is the boolean being requested).

- A button reading "Follow" when not following and "Following" when following.
- Clicking flips the label **immediately** (optimistic update) and calls \`toggleFollow(next)\` once.
- If the promise rejects, roll the label back to the previous state and render \`<p role="alert">Could not update</p>\`. A later successful click removes the alert.
- If it resolves, keep the optimistic state.`,
    componentName: 'FollowButton',
    starter: `import React, { useState } from 'react';

export default function FollowButton({ initialFollowing = false, toggleFollow }) {
  const [following, setFollowing] = useState(initialFollowing);
  // TODO: optimistic update + rollback on rejection
  return (
    <div>
      <button type="button">{following ? 'Following' : 'Follow'}</button>
    </div>
  );
}
`,
    solution: `import React, { useState } from 'react';

export default function FollowButton({ initialFollowing = false, toggleFollow }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [failed, setFailed] = useState(false);

  const handleClick = () => {
    const previous = following;
    const next = !following;
    setFollowing(next);
    setFailed(false);
    toggleFollow(next).catch(() => {
      setFollowing(previous);
      setFailed(true);
    });
  };

  return (
    <div>
      <button type="button" onClick={handleClick}>{following ? 'Following' : 'Follow'}</button>
      {failed && <p role="alert">Could not update</p>}
    </div>
  );
}
`,
    previewProps: { initialFollowing: false },
    previewSetup: "let n = 0; return { toggleFollow: (next) => new Promise((res, rej) => setTimeout(() => { n += 1; if (n % 3 === 0) rej(new Error('Server busy')); else res(); }, 300)) };",
    tests: [
      {
        name: 'flips the label immediately, before the promise settles',
        code: `const { getByRole } = render({ initialFollowing: false, toggleFollow: () => new Promise(() => {}) });
fireEvent.click(getByRole('button', { name: 'Follow' }));
expect(getByRole('button', { name: 'Following' })).toBeTruthy();`,
      },
      {
        name: 'calls toggleFollow once with the requested state',
        code: `const calls = [];
const { getByRole } = render({ initialFollowing: true, toggleFollow: (next) => { calls.push(next); return Promise.resolve(); } });
fireEvent.click(getByRole('button', { name: 'Following' }));
expect(calls).toEqual([false]);
await sleep(10);
expect(getByRole('button', { name: 'Follow' })).toBeTruthy();`,
      },
      {
        name: 'rolls back and shows an alert when the request fails',
        code: `const { getByRole, queryByRole } = render({ initialFollowing: false, toggleFollow: () => Promise.reject(new Error('nope')) });
fireEvent.click(getByRole('button', { name: 'Follow' }));
expect(getByRole('button', { name: 'Following' })).toBeTruthy();
await waitFor(() => getByRole('alert'));
expect(getByRole('alert')).toHaveTextContent('Could not update');
expect(getByRole('button', { name: 'Follow' })).toBeTruthy();`,
      },
      {
        name: 'a later successful click clears the alert',
        code: `let calls = 0;
const toggleFollow = () => { calls += 1; return calls === 1 ? Promise.reject(new Error('nope')) : Promise.resolve(); };
const { getByRole, queryByRole } = render({ initialFollowing: false, toggleFollow });
fireEvent.click(getByRole('button', { name: 'Follow' }));
await waitFor(() => getByRole('alert'));
fireEvent.click(getByRole('button', { name: 'Follow' }));
expect(queryByRole('alert')).toBeNull();
await sleep(10);
expect(getByRole('button', { name: 'Following' })).toBeTruthy();`,
      },
    ],
    hint: 'Capture `previous` and `next` before calling the setter, update state synchronously, then attach `.catch` to the promise to restore `previous` and flag the failure.',
    explanation: 'Optimistic UI assumes the request will succeed and updates the screen right away, which makes the app feel instant. Because the state has already changed by the time the promise settles, the handler must remember the previous value in a local constant to roll back correctly. Waiting for the promise before updating is the pessimistic approach — safe, but it is exactly what this pattern is meant to avoid.',
  },
  {
    id: 'react-polling-status',
    number: 50,
    title: 'Polling with Cleanup',
    difficulty: 'Hard',
    topic: 'Async & Data',
    statement: `Build \`StatusPoller({ poll, interval = 1000 })\` where \`poll()\` returns a Promise of a status string.

- Call \`poll()\` immediately on mount and then every \`interval\` ms while the component is mounted and not paused.
- Render \`<p>Status: <value></p>\` (show "Status: unknown" before the first response) and \`<p>Polls: <n></p>\` counting how many times \`poll\` has been called.
- A button reading "Pause" while polling and "Resume" while paused. Pausing stops the interval; resuming polls immediately and restarts it.
- The interval must be cleared when the component unmounts or is paused (\`useEffect\` cleanup with \`clearInterval\`) — after unmount \`poll\` must never be called again.`,
    componentName: 'StatusPoller',
    starter: `import React, { useState, useEffect } from 'react';

export default function StatusPoller({ poll, interval = 1000 }) {
  const [status, setStatus] = useState('unknown');
  const [polls, setPolls] = useState(0);
  const [paused, setPaused] = useState(false);
  // TODO: poll immediately + every interval ms, with cleanup
  return (
    <div>
      <p>Status: {status}</p>
      <p>Polls: {polls}</p>
      <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
    </div>
  );
}
`,
    solution: `import React, { useState, useEffect } from 'react';

export default function StatusPoller({ poll, interval = 1000 }) {
  const [status, setStatus] = useState('unknown');
  const [polls, setPolls] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    let active = true;
    const run = () => {
      setPolls((n) => n + 1);
      poll().then((value) => { if (active) setStatus(value); });
    };
    run();
    const id = setInterval(run, interval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [paused, poll, interval]);

  return (
    <div>
      <p>Status: {status}</p>
      <p>Polls: {polls}</p>
      <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
    </div>
  );
}
`,
    previewProps: { interval: 300 },
    previewSetup: "const states = ['OK', 'OK', 'Degraded', 'OK']; let i = 0; return { poll: () => new Promise((res) => setTimeout(() => res(states[i++ % states.length]), 50)) };",
    tests: [
      {
        name: 'polls immediately on mount and shows the status',
        code: `let calls = 0;
const { getByText } = render({ interval: 20, poll: async () => { calls += 1; return 'OK'; } });
expect(calls).toBe(1);
expect(getByText('Polls: 1')).toBeTruthy();
await waitFor(() => getByText('Status: OK'));`,
      },
      {
        name: 'keeps polling on the interval',
        code: `let calls = 0;
render({ interval: 20, poll: async () => { calls += 1; return 'OK'; } });
await waitFor(() => { if (calls < 3) throw new Error('only ' + calls + ' calls'); });
expect(calls).toBeGreaterThanOrEqual(3);`,
      },
      {
        name: 'stops polling after unmount',
        code: `let calls = 0;
const { unmount } = render({ interval: 20, poll: async () => { calls += 1; return 'OK'; } });
await waitFor(() => { if (calls < 2) throw new Error('not yet'); });
unmount();
const after = calls;
await sleep(80);
expect(calls).toBe(after);`,
      },
      {
        name: 'Pause stops the interval and Resume polls again',
        code: `let calls = 0;
const { getByRole } = render({ interval: 20, poll: async () => { calls += 1; return 'OK'; } });
fireEvent.click(getByRole('button', { name: 'Pause' }));
const paused = calls;
await sleep(70);
expect(calls).toBe(paused);
fireEvent.click(getByRole('button', { name: 'Resume' }));
expect(calls).toBe(paused + 1);
expect(getByRole('button', { name: 'Pause' })).toBeTruthy();`,
      },
    ],
    hint: 'One effect keyed on `paused`: return early when paused, otherwise call `poll` once, start `setInterval`, and return a cleanup that calls `clearInterval`. React runs that cleanup on unmount and whenever `paused` flips.',
    explanation: 'Timers are subscriptions, and every subscription set up in an effect needs a matching teardown. Returning `clearInterval` from the effect covers three cases at once: unmount, pause (the dependency changes so the old interval is torn down) and prop changes. A `setInterval` without cleanup keeps firing against an unmounted component, hammering the server and leaking memory for as long as the page lives.',
  },
];

export const getReactProblem = (id: string): ReactProblem | undefined =>
  reactProblems.find((p) => p.id === id);
