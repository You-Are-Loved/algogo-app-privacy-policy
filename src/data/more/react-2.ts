import type { ReactProblem } from '../reactProblems';

export const problems: ReactProblem[] = [
  // ───────────────────────────── Rendering & Props ─────────────────────────────
  {
    id: 'react-price-tag-sale',
    number: 51,
    title: 'Price Tag with Sale Price',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement: `Build \`PriceTag({ price, salePrice, currency = '$' })\`. Prices are whole numbers of **cents**.

- Format an amount as the currency symbol followed by the amount in units with exactly two decimals: \`1250\` becomes \`$12.50\`, and \`500\` with \`currency="€"\` becomes \`€5.00\`.
- The item is **on sale** only when \`salePrice\` is a number lower than \`price\`. \`0\` counts (the item is free). A missing \`salePrice\`, or one equal to or higher than \`price\`, means there is no sale.
- Not on sale: render the formatted \`price\` in an element with \`data-testid="price"\`. Nothing with \`data-testid="original"\` or \`data-testid="savings"\` may be in the DOM.
- On sale: \`data-testid="price"\` shows the formatted \`salePrice\`, an element with \`data-testid="original"\` shows the formatted \`price\` (a \`<s>\` element strikes it through), and an element with \`data-testid="savings"\` reads \`Save N%\`, where N is the discount as a percentage of \`price\` rounded to the nearest whole number (\`2999\` reduced to \`1999\` is \`Save 33%\`).
- Derive everything from the props on each render.`,
    componentName: 'PriceTag',
    starter: `import React from 'react';

export default function PriceTag({ price, salePrice, currency = '$' }) {
  // TODO: format cents as money, and show the sale layout only when salePrice is lower than price
  return <span data-testid="price">{price}</span>;
}
`,
    previewProps: { price: 2999, salePrice: 1999 },
    tests: [
      {
        name: 'formats a regular price with two decimals',
        code: `const { getByTestId, queryByTestId } = render({ price: 1250 });
expect(getByTestId('price').textContent).toBe('$12.50');
expect(queryByTestId('original')).toBeNull();
expect(queryByTestId('savings')).toBeNull();`,
      },
      {
        name: 'shows the sale price, the original price and the saving',
        code: `const { getByTestId } = render({ price: 2000, salePrice: 1500 });
expect(getByTestId('price').textContent).toBe('$15.00');
expect(getByTestId('original').textContent).toBe('$20.00');
expect(getByTestId('savings').textContent).toBe('Save 25%');`,
      },
      {
        name: 'rounds the saving to the nearest whole percent',
        code: `const { getByTestId, rerender } = render({ price: 2999, salePrice: 1999 });
expect(getByTestId('savings').textContent).toBe('Save 33%');
rerender({ price: 300, salePrice: 100 });
expect(getByTestId('savings').textContent).toBe('Save 67%');`,
      },
      {
        name: 'ignores a sale price that is not lower',
        code: `const { getByTestId, queryByTestId, rerender } = render({ price: 1000, salePrice: 1000 });
expect(getByTestId('price').textContent).toBe('$10.00');
expect(queryByTestId('original')).toBeNull();
rerender({ price: 1000, salePrice: 1200 });
expect(getByTestId('price').textContent).toBe('$10.00');
expect(queryByTestId('savings')).toBeNull();`,
      },
      {
        name: 'treats a sale price of 0 as free',
        code: `const { getByTestId } = render({ price: 800, salePrice: 0 });
expect(getByTestId('price').textContent).toBe('$0.00');
expect(getByTestId('original').textContent).toBe('$8.00');
expect(getByTestId('savings').textContent).toBe('Save 100%');`,
      },
      {
        name: 'uses the currency symbol it is given',
        code: `const { getByTestId } = render({ price: 500, salePrice: 450, currency: '€' });
expect(getByTestId('price').textContent).toBe('€4.50');
expect(getByTestId('original').textContent).toBe('€5.00');
expect(getByTestId('savings').textContent).toBe('Save 10%');`,
      },
    ],
    hint: 'Decide "on sale" with an explicit comparison (`typeof salePrice === \'number\' && salePrice < price`), not with truthiness: `0` is a real price.',
    explanation:
      'This is a pure rendering exercise: one boolean, `onSale`, picks between two layouts, and a small `format` helper turns cents into money with `(cents / 100).toFixed(2)`. ' +
      'The trap is testing `if (salePrice)`. That reads naturally but treats a sale price of `0` exactly like a missing one, so a free item is shown at full price. Comparing against `price` also covers the "sale price is not actually lower" case in the same expression. ' +
      'The saving is `(price - salePrice) / price * 100` passed through `Math.round`. Nothing is stored in state, so the tag always matches its props.',
    solution: `import React from 'react';

export default function PriceTag({ price, salePrice, currency = '$' }) {
  const format = (cents) => currency + (cents / 100).toFixed(2);
  const onSale = typeof salePrice === 'number' && salePrice < price;

  if (!onSale) {
    return <span data-testid="price">{format(price)}</span>;
  }

  const percent = Math.round(((price - salePrice) / price) * 100);
  return (
    <span>
      <strong data-testid="price">{format(salePrice)}</strong>{' '}
      <s data-testid="original">{format(price)}</s>{' '}
      <em data-testid="savings">Save {percent}%</em>
    </span>
  );
}
`,
  },

  {
    id: 'react-progress-meter',
    number: 52,
    title: 'Clamped Progress Bar',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement: `Build \`ProgressBar({ value, max = 100, label })\`. \`max\` is always greater than 0.

- First clamp \`value\` into the range 0 to \`max\`. Everything below uses the clamped value.
- Render an element with \`role="progressbar"\`, \`aria-label\` set to \`label\`, \`aria-valuemin="0"\`, \`aria-valuemax\` set to \`max\` and \`aria-valuenow\` set to the clamped value.
- The percentage is \`clamped / max * 100\` rounded to the nearest whole number. Show it as \`N%\` in an element with \`data-testid="percent"\`.
- Inside the progressbar element render an element with \`data-testid="fill"\` whose inline \`width\` style is that same percentage, for example \`style={{ width: '40%' }}\`.
- Render an element with \`data-testid="status"\` reading \`Not started\` when the clamped value is 0, \`Complete\` when it equals \`max\`, and \`In progress\` otherwise.`,
    componentName: 'ProgressBar',
    starter: `import React from 'react';

export default function ProgressBar({ value, max = 100, label }) {
  // TODO: clamp the value, then derive the percentage, the fill width and the status text
  return (
    <div>
      <div role="progressbar" aria-label={label} />
    </div>
  );
}
`,
    previewProps: { value: 40, max: 100, label: 'Upload' },
    tests: [
      {
        name: 'exposes the value through the progressbar role',
        code: `const { getByRole, getByTestId } = render({ value: 40, label: 'Upload' });
const bar = getByRole('progressbar');
expect(bar).toHaveAttribute('aria-label', 'Upload');
expect(bar).toHaveAttribute('aria-valuemin', '0');
expect(bar).toHaveAttribute('aria-valuemax', '100');
expect(bar).toHaveAttribute('aria-valuenow', '40');
expect(getByTestId('percent').textContent).toBe('40%');
expect(getByTestId('fill').style.width).toBe('40%');
expect(bar.contains(getByTestId('fill'))).toBe(true);`,
      },
      {
        name: 'computes the percentage against a custom max',
        code: `const { getByRole, getByTestId } = render({ value: 2, max: 3, label: 'Steps' });
expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
expect(getByRole('progressbar')).toHaveAttribute('aria-valuemax', '3');
expect(getByTestId('percent').textContent).toBe('67%');
expect(getByTestId('fill').style.width).toBe('67%');`,
      },
      {
        name: 'clamps values above max and below zero',
        code: `const { getByRole, getByTestId, rerender } = render({ value: 150, label: 'Upload' });
expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
expect(getByTestId('percent').textContent).toBe('100%');
expect(getByTestId('fill').style.width).toBe('100%');
expect(getByTestId('status').textContent).toBe('Complete');
rerender({ value: -5, label: 'Upload' });
expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
expect(getByTestId('percent').textContent).toBe('0%');
expect(getByTestId('fill').style.width).toBe('0%');
expect(getByTestId('status').textContent).toBe('Not started');`,
      },
      {
        name: 'describes the three states in words',
        code: `const { getByTestId, rerender } = render({ value: 0, label: 'Sync' });
expect(getByTestId('status').textContent).toBe('Not started');
rerender({ value: 1, label: 'Sync' });
expect(getByTestId('status').textContent).toBe('In progress');
rerender({ value: 99, label: 'Sync' });
expect(getByTestId('status').textContent).toBe('In progress');
rerender({ value: 8, max: 8, label: 'Sync' });
expect(getByTestId('status').textContent).toBe('Complete');
expect(getByTestId('percent').textContent).toBe('100%');`,
      },
    ],
    hint: 'Compute one `clamped` number with `Math.min(max, Math.max(0, value))` at the top and never touch the raw `value` again.',
    explanation:
      'All four outputs (the ARIA value, the percentage text, the fill width and the status word) are derived from a single clamped number, so compute that first and build everything else from it. ' +
      'The usual mistake is clamping in only one place, for example capping the fill width with CSS while `aria-valuenow` still reports 150, or letting a negative value produce `-5%`. ' +
      'With `clamped = Math.min(max, Math.max(0, value))`, the percentage is `Math.round(clamped / max * 100)` and the status is a three-way branch on `clamped`. No state is needed: the bar is a pure function of its props.',
    solution: `import React from 'react';

export default function ProgressBar({ value, max = 100, label }) {
  const clamped = Math.min(max, Math.max(0, value));
  const percent = Math.round((clamped / max) * 100);
  const status = clamped === 0 ? 'Not started' : clamped === max ? 'Complete' : 'In progress';

  return (
    <div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        style={{ background: '#e5e7eb', borderRadius: 4, height: 12, overflow: 'hidden' }}
      >
        <div data-testid="fill" style={{ width: percent + '%', height: '100%', background: '#2563eb' }} />
      </div>
      <span data-testid="percent">{percent}%</span>{' '}
      <span data-testid="status">{status}</span>
    </div>
  );
}
`,
  },

  {
    id: 'react-breadcrumb-trail',
    number: 53,
    title: 'Breadcrumb Trail',
    difficulty: 'Easy',
    topic: 'Rendering & Props',
    statement: `Build \`Breadcrumbs({ items })\`, where \`items\` is an array of \`{ label, href }\` ordered from the site root to the current page.

- With no items, render nothing at all.
- Otherwise render a \`<nav aria-label="Breadcrumb">\`.
- Every item except the last is a link: an \`<a href={href}>\` whose text is exactly the \`label\`.
- The last item is the current page. It is **not** a link: render its \`label\` as the only text of an element (a \`<span>\` is fine) that carries \`aria-current="page"\`. No other element has \`aria-current\`.
- Between each pair of neighbouring items render a separator \`<span aria-hidden="true">/</span>\`. There is no separator before the first item or after the last one, and nothing else in the component uses \`aria-hidden\`.`,
    componentName: 'Breadcrumbs',
    starter: `import React from 'react';

export default function Breadcrumbs({ items }) {
  // TODO: links for every item but the last, aria-current on the last, separators in between
  return (
    <nav aria-label="Breadcrumb">
      {items.map((item) => (
        <a key={item.href} href={item.href}>{item.label}</a>
      ))}
    </nav>
  );
}
`,
    previewProps: {
      items: [
        { label: 'Home', href: '/' },
        { label: 'Shoes', href: '/shoes' },
        { label: 'Sneakers', href: '/shoes/sneakers' },
      ],
    },
    tests: [
      {
        name: 'renders every item except the last as a link',
        code: `const { getAllByRole, getByRole } = render(props);
expect(getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb');
const links = getAllByRole('link');
expect(links.map((a) => a.textContent)).toEqual(['Home', 'Shoes']);
expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/shoes']);`,
      },
      {
        name: 'marks the last item as the current page without linking it',
        code: `const { container, queryByRole } = render(props);
const current = container.querySelectorAll('[aria-current]');
expect(current).toHaveLength(1);
expect(current[0].getAttribute('aria-current')).toBe('page');
expect(current[0].textContent).toBe('Sneakers');
expect(current[0].tagName).not.toBe('A');
expect(queryByRole('link', { name: 'Sneakers' })).toBeNull();`,
      },
      {
        name: 'puts a separator between items but not after the last',
        code: `const { container, getByRole } = render(props);
const seps = container.querySelectorAll('[aria-hidden="true"]');
expect(seps).toHaveLength(2);
expect(Array.from(seps).map((s) => s.textContent.trim())).toEqual(['/', '/']);
expect(getByRole('navigation').textContent.split(' ').join('')).toBe('Home/Shoes/Sneakers');`,
      },
      {
        name: 'a single item is just the current page',
        code: `const { container, queryByRole } = render({ items: [{ label: 'Home', href: '/' }] });
expect(queryByRole('link')).toBeNull();
expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
expect(container.querySelector('[aria-current="page"]').textContent).toBe('Home');`,
      },
      {
        name: 'renders nothing for an empty trail',
        code: `const { container, queryByRole } = render({ items: [] });
expect(queryByRole('navigation')).toBeNull();
expect(container.textContent).toBe('');`,
      },
      {
        name: 'the old current page becomes a link when the trail grows',
        code: `const { container, getByRole, rerender } = render({ items: [{ label: 'Home', href: '/' }, { label: 'Shoes', href: '/shoes' }] });
expect(container.querySelector('[aria-current="page"]').textContent).toBe('Shoes');
rerender(props);
expect(getByRole('link', { name: 'Shoes' })).toHaveAttribute('href', '/shoes');
expect(container.querySelector('[aria-current="page"]').textContent).toBe('Sneakers');`,
      },
    ],
    hint: 'Inside `items.map((item, index) => ...)`, compare `index` with `items.length - 1` to pick link or current page, and render the separator only when `index > 0`.',
    explanation:
      'The whole component is one `map` with two position checks. `index === items.length - 1` decides whether an item is the current page (plain text with `aria-current="page"`) or a link, and `index > 0` decides whether a separator goes in front of it. ' +
      'Putting the separator before every item except the first is the tidy way to get exactly `n - 1` separators; appending one after each item leaves a dangling `/` at the end, which is the classic off-by-one here. ' +
      'Returning `null` for an empty array avoids an empty landmark that screen readers would still announce. Each item and its separator share a keyed `Fragment` so the list has stable keys.',
    solution: `import React, { Fragment } from 'react';

export default function Breadcrumbs({ items }) {
  if (items.length === 0) return null;
  const lastIndex = items.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <span aria-hidden="true" style={{ margin: '0 6px' }}>/</span>}
          {index === lastIndex ? (
            <span aria-current="page">{item.label}</span>
          ) : (
            <a href={item.href}>{item.label}</a>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
`,
  },

  {
    id: 'react-recursive-file-tree',
    number: 54,
    title: 'Recursive File Tree',
    difficulty: 'Medium',
    topic: 'Rendering & Props',
    statement: `Build \`FileTree({ nodes })\`, a collapsible tree. Each node is \`{ name, children }\`. A node that has a \`children\` array (even an empty one) is a **folder**; a node without \`children\` is a **file**. Names are unique across the whole tree, and folders can nest to any depth.

- A file renders an element with \`data-testid="file"\` whose text is exactly its \`name\`.
- A folder renders a \`<button>\` whose text is exactly its \`name\`, with \`aria-expanded="true"\` or \`"false"\`. Clicking it toggles that folder only. Every folder starts collapsed.
- Next to each folder button (not inside it) render an element with \`data-testid="count-{name}"\` reading \`(N)\`, where N is the number of files anywhere inside that folder, at any depth. Sub-folders themselves are not counted.
- A folder's children are rendered, in the given order, only while it is expanded. While it is collapsed they are not in the DOM at all.
- An expanded folder whose \`children\` array is empty shows an element with \`data-testid="empty"\` reading \`Empty folder\`.

The natural solution is a component that renders itself for each child folder.`,
    componentName: 'FileTree',
    starter: `import React, { useState } from 'react';

export default function FileTree({ nodes }) {
  // TODO: render folders as toggle buttons with a recursive file count,
  // and render a folder's children (recursively) only while it is expanded
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.name}>{node.name}</li>
      ))}
    </ul>
  );
}
`,
    previewProps: {
      nodes: [
        {
          name: 'src',
          children: [
            { name: 'components', children: [{ name: 'Button.jsx' }, { name: 'Modal.jsx' }] },
            { name: 'index.js' },
          ],
        },
        { name: 'assets', children: [] },
        { name: 'README.md' },
      ],
    },
    tests: [
      {
        name: 'shows only the top level at first, with every folder collapsed',
        code: `const { getAllByRole, getAllByTestId, queryByText } = render(props);
expect(getAllByTestId('file').map((f) => f.textContent)).toEqual(['README.md']);
const folders = getAllByRole('button');
expect(folders.map((b) => b.textContent)).toEqual(['src', 'assets']);
folders.forEach((b) => expect(b).toHaveAttribute('aria-expanded', 'false'));
expect(queryByText('index.js')).toBeNull();`,
      },
      {
        name: 'expanding a folder reveals its direct children only',
        code: `const { getByRole, getAllByTestId, queryByText } = render(props);
fireEvent.click(getByRole('button', { name: 'src' }));
expect(getByRole('button', { name: 'src' })).toHaveAttribute('aria-expanded', 'true');
expect(getByRole('button', { name: 'components' })).toHaveAttribute('aria-expanded', 'false');
expect(getAllByTestId('file').map((f) => f.textContent)).toEqual(['index.js', 'README.md']);
expect(queryByText('Button.jsx')).toBeNull();`,
      },
      {
        name: 'nested folders open independently of their siblings',
        code: `const { getByRole, getAllByTestId } = render(props);
fireEvent.click(getByRole('button', { name: 'src' }));
fireEvent.click(getByRole('button', { name: 'components' }));
expect(getAllByTestId('file').map((f) => f.textContent)).toEqual(['Button.jsx', 'Modal.jsx', 'index.js', 'README.md']);
expect(getByRole('button', { name: 'assets' })).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'collapsing a folder removes its children from the DOM',
        code: `const { getByRole, getAllByTestId, queryByRole } = render(props);
fireEvent.click(getByRole('button', { name: 'src' }));
fireEvent.click(getByRole('button', { name: 'src' }));
expect(getByRole('button', { name: 'src' })).toHaveAttribute('aria-expanded', 'false');
expect(getAllByTestId('file').map((f) => f.textContent)).toEqual(['README.md']);
expect(queryByRole('button', { name: 'components' })).toBeNull();`,
      },
      {
        name: 'counts the files inside a folder at every depth',
        code: `const { getByRole, getByTestId } = render(props);
expect(getByTestId('count-src').textContent).toBe('(3)');
expect(getByTestId('count-assets').textContent).toBe('(0)');
fireEvent.click(getByRole('button', { name: 'src' }));
expect(getByTestId('count-components').textContent).toBe('(2)');`,
      },
      {
        name: 'an expanded empty folder says so',
        code: `const { getByRole, getByTestId, queryByTestId } = render(props);
expect(queryByTestId('empty')).toBeNull();
fireEvent.click(getByRole('button', { name: 'assets' }));
expect(getByTestId('empty').textContent).toBe('Empty folder');
fireEvent.click(getByRole('button', { name: 'assets' }));
expect(queryByTestId('empty')).toBeNull();`,
      },
    ],
    hint: 'Write a `Folder` component with its own `open` state that renders a list of its children, using `Folder` again for child folders. A separate recursive function can count files.',
    explanation:
      'Tree data maps directly onto recursive components. A `TreeList` renders one level; for each node it renders either a file row or a `Folder`, and `Folder` renders another `TreeList` for its children while it is open. Because every `Folder` instance owns its own `open` state, siblings toggle independently with no shared bookkeeping. ' +
      'Test for a folder with `Array.isArray(node.children)` rather than `node.children.length`, otherwise an empty folder is mistaken for a file. ' +
      'The count is derived, not stored: a small recursive function returns 1 for a file and the sum over the children for a folder. Counting `children.length` is the tempting shortcut, but it counts sub-folders and misses everything below the first level. ' +
      'Rendering costs O(visible nodes); the count walks each folder subtree, which is fine for small trees and could be memoized for large ones.',
    solution: `import React, { useState } from 'react';

function countFiles(node) {
  if (!Array.isArray(node.children)) return 1;
  return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function Folder({ node }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {node.name}
      </button>{' '}
      <span data-testid={'count-' + node.name}>({countFiles(node)})</span>
      {open && node.children.length === 0 && <p data-testid="empty">Empty folder</p>}
      {open && node.children.length > 0 && <TreeList nodes={node.children} />}
    </li>
  );
}

function TreeList({ nodes }) {
  return (
    <ul>
      {nodes.map((node) =>
        Array.isArray(node.children) ? (
          <Folder key={node.name} node={node} />
        ) : (
          <li key={node.name} data-testid="file">{node.name}</li>
        )
      )}
    </ul>
  );
}

export default function FileTree({ nodes }) {
  return <TreeList nodes={nodes} />;
}
`,
  },

  // ───────────────────────────── State & Events ─────────────────────────────
  {
    id: 'react-read-more-toggle',
    number: 55,
    title: 'Read More Truncation',
    difficulty: 'Easy',
    topic: 'State & Events',
    statement: `Build \`ReadMore({ text, limit = 80 })\`.

- Render the text in a \`<p data-testid="text">\`.
- If \`text\` has \`limit\` characters or fewer, show all of it and render no button.
- If it is longer, start **collapsed**: show exactly the first \`limit\` characters followed by three dots \`...\` (no trimming and no extra space), plus a \`<button>\` labelled \`Read more\` with \`aria-expanded="false"\`.
- Clicking the button expands it: the full text is shown with no dots and the button reads \`Show less\` with \`aria-expanded="true"\`. Clicking again collapses it.`,
    componentName: 'ReadMore',
    starter: `import React, { useState } from 'react';

export default function ReadMore({ text, limit = 80 }) {
  // TODO: truncate long text and add a Read more / Show less button
  return <p data-testid="text">{text}</p>;
}
`,
    previewProps: {
      text: 'React components are functions of props and state. When either changes, React calls the function again and updates the DOM to match what it returned.',
      limit: 60,
    },
    tests: [
      {
        name: 'short text is shown in full with no button',
        code: `const { getByTestId, queryByRole } = render({ text: 'Short note', limit: 20 });
expect(getByTestId('text').textContent).toBe('Short note');
expect(queryByRole('button')).toBeNull();`,
      },
      {
        name: 'text exactly at the limit is not truncated',
        code: `const { getByTestId, queryByRole } = render({ text: 'abcdefghij', limit: 10 });
expect(getByTestId('text').textContent).toBe('abcdefghij');
expect(queryByRole('button')).toBeNull();`,
      },
      {
        name: 'long text starts collapsed with three dots',
        code: `const { getByTestId, getByRole } = render({ text: 'The quick brown fox jumps', limit: 9 });
expect(getByTestId('text').textContent).toBe('The quick...');
expect(getByRole('button', { name: 'Read more' })).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'Read more expands to the full text',
        code: `const { getByTestId, getByRole, queryByRole } = render({ text: 'The quick brown fox jumps', limit: 9 });
fireEvent.click(getByRole('button', { name: 'Read more' }));
expect(getByTestId('text').textContent).toBe('The quick brown fox jumps');
expect(getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
expect(queryByRole('button', { name: 'Read more' })).toBeNull();`,
      },
      {
        name: 'Show less collapses it again',
        code: `const { getByTestId, getByRole } = render({ text: 'The quick brown fox jumps', limit: 9 });
fireEvent.click(getByRole('button', { name: 'Read more' }));
fireEvent.click(getByRole('button', { name: 'Show less' }));
expect(getByTestId('text').textContent).toBe('The quick...');
expect(getByRole('button', { name: 'Read more' })).toHaveAttribute('aria-expanded', 'false');`,
      },
      {
        name: 'the limit defaults to 80 characters',
        code: `const { getByTestId, queryByRole, rerender } = render({ text: 'a'.repeat(81) });
expect(getByTestId('text').textContent).toBe('a'.repeat(80) + '...');
rerender({ text: 'b'.repeat(80) });
expect(getByTestId('text').textContent).toBe('b'.repeat(80));
expect(queryByRole('button')).toBeNull();`,
      },
    ],
    hint: 'Keep a single boolean in state. Whether the text is too long is not state: compute `text.length > limit` during render.',
    explanation:
      'Only one thing here changes over time: whether the user has expanded the text. That is the single piece of state. Whether the text needs truncating at all (`text.length > limit`) and what to display are derived during render. ' +
      'The boundary is where bugs appear. A text of exactly `limit` characters already fits, so the comparison must be `>`; with `>=` a ten-character text with a limit of ten grows to thirteen characters and gains a pointless button. ' +
      'The button reports its state with `aria-expanded`, and its label flips between `Read more` and `Show less` from the same boolean, so the two can never disagree.',
    solution: `import React, { useState } from 'react';

export default function ReadMore({ text, limit = 80 }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > limit;
  const shown = isLong && !expanded ? text.slice(0, limit) + '...' : text;

  return (
    <div>
      <p data-testid="text">{shown}</p>
      {isLong && (
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
`,
  },
];
