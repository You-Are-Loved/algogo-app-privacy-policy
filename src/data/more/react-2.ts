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

  {
    id: 'react-quantity-picker-bounds',
    number: 56,
    title: 'Quantity Picker with Typed Input',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement: `Build \`QuantityPicker({ min = 1, max = 10, initial })\`, a quantity control with two buttons and a field you can type in. \`initial\` defaults to \`min\`.

The component tracks two things: the **committed quantity** (always a whole number from \`min\` to \`max\`) and the text currently in the field.

- A text input with \`aria-label="Quantity"\` (use \`type="text"\`). It starts out showing the committed quantity.
- A \`<p data-testid="committed">\` reading \`In cart: N\`, where N is the committed quantity.
- Buttons with \`aria-label\` \`Decrease quantity\` and \`Increase quantity\`. They change the committed quantity by 1, and the field then shows the new quantity. \`Decrease quantity\` is disabled when the committed quantity is \`min\`; \`Increase quantity\` is disabled when it is \`max\`.
- Typing changes only the text in the field. The committed quantity does **not** change while the user types.
- When the field loses focus (blur): if the trimmed text consists of digits only, convert it to a number, clamp it into \`min\` to \`max\`, commit it and show the committed value in the field. Anything else (empty text, letters, a minus sign, a decimal point) is rejected: the field goes back to showing the committed quantity, which stays unchanged.`,
    componentName: 'QuantityPicker',
    starter: `import React, { useState } from 'react';

export default function QuantityPicker({ min = 1, max = 10, initial }) {
  const [quantity, setQuantity] = useState(initial === undefined ? min : initial);

  // TODO: keep the typed text separately, commit it on blur, and respect the bounds

  return (
    <div>
      <button type="button" aria-label="Decrease quantity">-</button>
      <input type="text" aria-label="Quantity" defaultValue={quantity} />
      <button type="button" aria-label="Increase quantity">+</button>
      <p data-testid="committed">In cart: {quantity}</p>
    </div>
  );
}
`,
    previewProps: { min: 1, max: 5, initial: 2 },
    tests: [
      {
        name: 'starts at the initial quantity',
        code: `const { getByLabelText, getByTestId } = render({ min: 1, max: 5, initial: 3 });
expect(getByLabelText('Quantity').value).toBe('3');
expect(getByTestId('committed').textContent).toBe('In cart: 3');`,
      },
      {
        name: 'defaults to min 1, max 10 and starts at min',
        code: `const { getByLabelText, getByRole, getByTestId } = render({});
expect(getByLabelText('Quantity').value).toBe('1');
expect(getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
for (let i = 0; i < 12; i++) fireEvent.click(getByRole('button', { name: 'Increase quantity' }));
expect(getByTestId('committed').textContent).toBe('In cart: 10');
expect(getByLabelText('Quantity').value).toBe('10');`,
      },
      {
        name: 'the buttons step by one and are disabled at the bounds',
        code: `const { getByLabelText, getByRole, getByTestId } = render({ min: 1, max: 5, initial: 4 });
const dec = () => getByRole('button', { name: 'Decrease quantity' });
const inc = () => getByRole('button', { name: 'Increase quantity' });
expect(inc()).not.toBeDisabled();
fireEvent.click(inc());
expect(getByTestId('committed').textContent).toBe('In cart: 5');
expect(getByLabelText('Quantity').value).toBe('5');
expect(inc()).toBeDisabled();
expect(dec()).not.toBeDisabled();
for (let i = 0; i < 4; i++) fireEvent.click(dec());
expect(getByTestId('committed').textContent).toBe('In cart: 1');
expect(dec()).toBeDisabled();`,
      },
      {
        name: 'typing does not commit until the field loses focus',
        code: `const { getByLabelText, getByTestId } = render({ min: 1, max: 5, initial: 3 });
const input = getByLabelText('Quantity');
fireEvent.change(input, '4');
expect(input.value).toBe('4');
expect(getByTestId('committed').textContent).toBe('In cart: 3');
fireEvent.blur(input);
expect(getByTestId('committed').textContent).toBe('In cart: 4');
expect(input.value).toBe('4');`,
      },
      {
        name: 'clamps a typed number into the allowed range on blur',
        code: `const { getByLabelText, getByTestId } = render({ min: 2, max: 5, initial: 3 });
const input = getByLabelText('Quantity');
fireEvent.change(input, '99');
expect(getByTestId('committed').textContent).toBe('In cart: 3');
fireEvent.blur(input);
expect(input.value).toBe('5');
expect(getByTestId('committed').textContent).toBe('In cart: 5');
fireEvent.change(input, ' 0 ');
fireEvent.blur(input);
expect(input.value).toBe('2');
expect(getByTestId('committed').textContent).toBe('In cart: 2');`,
      },
      {
        name: 'rejects text that is not a whole number and restores the field',
        code: `const { getByLabelText, getByTestId } = render({ min: 1, max: 5, initial: 3 });
const input = getByLabelText('Quantity');
for (const bad of ['abc', '', '2.5', '-2', '4x']) {
  fireEvent.change(input, bad);
  fireEvent.blur(input);
  expect(input.value).toBe('3');
  expect(getByTestId('committed').textContent).toBe('In cart: 3');
}`,
      },
    ],
    hint: 'Use two pieces of state: the committed number and a `draft` string for the field. `onChange` only updates the draft; `onBlur` validates it and either commits or resets the draft.',
    explanation:
      'A field that must accept half-typed input cannot be bound directly to a number. If every keystroke is parsed and clamped, the user can never clear the field to type a new value, and typing `1` on the way to `12` may already be clamped. So the component holds a `draft` string for the input and a separate committed `quantity`. ' +
      '`onChange` only writes the draft. `onBlur` is the commit point: a digits-only draft is converted, clamped with `Math.min(max, Math.max(min, n))` and committed; anything else is discarded by resetting the draft to the committed value. ' +
      'The buttons go through the same `commit` helper, which sets both pieces of state so the field and the number can never drift apart. The disabled flags are derived from the committed quantity rather than stored.',
    solution: `import React, { useState } from 'react';

export default function QuantityPicker({ min = 1, max = 10, initial }) {
  const [quantity, setQuantity] = useState(initial === undefined ? min : initial);
  const [draft, setDraft] = useState(String(quantity));

  const commit = (next) => {
    setQuantity(next);
    setDraft(String(next));
  };

  const handleBlur = () => {
    const text = draft.trim();
    if (/^[0-9]+$/.test(text)) {
      commit(Math.min(max, Math.max(min, Number(text))));
    } else {
      setDraft(String(quantity));
    }
  };

  return (
    <div>
      <button type="button" aria-label="Decrease quantity" disabled={quantity <= min} onClick={() => commit(quantity - 1)}>
        -
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        style={{ width: 48, textAlign: 'center' }}
      />
      <button type="button" aria-label="Increase quantity" disabled={quantity >= max} onClick={() => commit(quantity + 1)}>
        +
      </button>
      <p data-testid="committed">In cart: {quantity}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-tag-input',
    number: 57,
    title: 'Tag Input',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement: `Build \`TagInput({ initialTags = [], max = 5 })\`.

- A controlled text input with the placeholder \`Add a tag\`.
- Show the current tags in order. Each tag is rendered with its text and a \`<button>\` whose \`aria-label\` is \`Remove {tag}\`; clicking it removes that tag only.
- A \`<p data-testid="count">\` reading \`{number of tags}/{max}\`, for example \`2/5\`.
- Pressing **Enter** in the input (handle the \`keydown\` event whose \`key\` is \`Enter\`) normalises the text by trimming it and converting it to lower case, then:
  - if the result is empty or is already one of the tags, nothing is added and the input text is left as it is;
  - otherwise the tag is appended and the input is cleared.
- Pressing **Backspace** (\`key\` is \`Backspace\`) while the input is empty removes the last tag. If the input contains any text, Backspace must not touch the tags.
- No other key adds or removes tags.
- When there are \`max\` tags the input is disabled. It becomes enabled again as soon as a tag is removed.

\`initialTags\` is already lower case, has no duplicates and is never longer than \`max\`.`,
    componentName: 'TagInput',
    starter: `import React, { useState } from 'react';

export default function TagInput({ initialTags = [], max = 5 }) {
  const [tags, setTags] = useState(initialTags);
  const [text, setText] = useState('');

  // TODO: add on Enter, remove on Backspace when empty, remove buttons, max

  return (
    <div>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <input placeholder="Add a tag" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="count">{tags.length}/{max}</p>
    </div>
  );
}
`,
    previewProps: { initialTags: ['react', 'hooks'], max: 5 },
    tests: [
      {
        name: 'Enter adds a trimmed, lower-case tag and clears the input',
        code: `const { container, getByPlaceholderText, getByTestId } = render({});
const tags = () => Array.from(container.querySelectorAll('button[aria-label^="Remove "]')).map((b) => b.getAttribute('aria-label').slice(7));
const input = getByPlaceholderText('Add a tag');
fireEvent.change(input, '  React ');
fireEvent.keyDown(input, 'a');
expect(tags()).toEqual([]);
fireEvent.keyDown(input, 'Enter');
expect(tags()).toEqual(['react']);
expect(input.value).toBe('');
expect(getByTestId('count').textContent).toBe('1/5');
fireEvent.change(input, 'Hooks');
fireEvent.keyDown(input, 'Enter');
expect(tags()).toEqual(['react', 'hooks']);`,
      },
      {
        name: 'ignores empty text and duplicates',
        code: `const { container, getByPlaceholderText, getByTestId } = render({ initialTags: ['css'] });
const tags = () => Array.from(container.querySelectorAll('button[aria-label^="Remove "]')).map((b) => b.getAttribute('aria-label').slice(7));
const input = getByPlaceholderText('Add a tag');
fireEvent.keyDown(input, 'Enter');
fireEvent.change(input, '   ');
fireEvent.keyDown(input, 'Enter');
expect(tags()).toEqual(['css']);
fireEvent.change(input, ' CSS');
fireEvent.keyDown(input, 'Enter');
expect(tags()).toEqual(['css']);
expect(input.value).toBe(' CSS');
expect(getByTestId('count').textContent).toBe('1/5');`,
      },
      {
        name: 'a remove button removes only its own tag',
        code: `const { container, getByRole, getByTestId } = render({ initialTags: ['html', 'css', 'js'] });
const tags = () => Array.from(container.querySelectorAll('button[aria-label^="Remove "]')).map((b) => b.getAttribute('aria-label').slice(7));
expect(tags()).toEqual(['html', 'css', 'js']);
fireEvent.click(getByRole('button', { name: 'Remove css' }));
expect(tags()).toEqual(['html', 'js']);
expect(getByTestId('count').textContent).toBe('2/5');`,
      },
      {
        name: 'Backspace removes the last tag only when the input is empty',
        code: `const { container, getByPlaceholderText } = render({ initialTags: ['html', 'css'] });
const tags = () => Array.from(container.querySelectorAll('button[aria-label^="Remove "]')).map((b) => b.getAttribute('aria-label').slice(7));
const input = getByPlaceholderText('Add a tag');
fireEvent.change(input, 'x');
fireEvent.keyDown(input, 'Backspace');
expect(tags()).toEqual(['html', 'css']);
fireEvent.change(input, '');
fireEvent.keyDown(input, 'Backspace');
expect(tags()).toEqual(['html']);
fireEvent.keyDown(input, 'Backspace');
fireEvent.keyDown(input, 'Backspace');
expect(tags()).toEqual([]);`,
      },
      {
        name: 'disables the input at the maximum and re-enables it after a removal',
        code: `const { container, getByPlaceholderText, getByRole, getByTestId } = render({ initialTags: ['a', 'b'], max: 3 });
const tags = () => Array.from(container.querySelectorAll('button[aria-label^="Remove "]')).map((b) => b.getAttribute('aria-label').slice(7));
const input = getByPlaceholderText('Add a tag');
expect(input).not.toBeDisabled();
fireEvent.change(input, 'c');
fireEvent.keyDown(input, 'Enter');
expect(tags()).toEqual(['a', 'b', 'c']);
expect(getByTestId('count').textContent).toBe('3/3');
expect(getByPlaceholderText('Add a tag')).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Remove a' }));
expect(getByPlaceholderText('Add a tag')).not.toBeDisabled();
expect(getByTestId('count').textContent).toBe('2/3');`,
      },
    ],
    hint: 'One `onKeyDown` handler with two branches. Normalise the text first, then check `tags.includes(normalised)`; for Backspace check that the input text is the empty string.',
    explanation:
      'The state is small: the `tags` array and the input `text`. All the work is in one `onKeyDown` handler. ' +
      'For Enter, normalise before you compare: trimming and lower-casing first is what makes ` CSS` a duplicate of `css`. Comparing the raw text lets near-duplicates through. Add with `[...tags, tag]` so React sees a new array. ' +
      'For Backspace the guard `text === \'\'` matters: without it, every correction the user makes while typing silently deletes a finished tag. ' +
      'The count and the disabled flag are derived from `tags.length`. Tags are unique, so each one can serve as its own React key.',
    solution: `import React, { useState } from 'react';

export default function TagInput({ initialTags = [], max = 5 }) {
  const [tags, setTags] = useState(initialTags);
  const [text, setText] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const tag = text.trim().toLowerCase();
      if (tag === '' || tags.includes(tag)) return;
      setTags([...tags, tag]);
      setText('');
    } else if (e.key === 'Backspace' && text === '') {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tags.map((tag) => (
          <li key={tag} style={{ display: 'inline-block', marginRight: 6 }}>
            {tag}{' '}
            <button type="button" aria-label={'Remove ' + tag} onClick={() => setTags(tags.filter((t) => t !== tag))}>
              x
            </button>
          </li>
        ))}
      </ul>
      <input
        placeholder="Add a tag"
        value={text}
        disabled={tags.length >= max}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <p data-testid="count">{tags.length}/{max}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-inline-edit-rows',
    number: 58,
    title: 'Inline Editable Rows',
    difficulty: 'Medium',
    topic: 'State & Events',
    statement: `Build \`EditableList({ items, onRename })\`. \`items\` is an array of \`{ id, name }\` that is copied into state when the component mounts; \`onRename\` is optional.

- Render one \`<li data-testid="row-{id}">\` per item, in order.
- A row that is **not** being edited shows the item's name and a button with \`aria-label="Edit {name}"\`.
- Clicking that button puts the row into edit mode. An editing row shows a text input with \`aria-label="Name"\` pre-filled with the current name, a \`Save\` button and a \`Cancel\` button, and has no Edit button.
- Only one row can be in edit mode at a time. Clicking Edit on another row discards the unsaved text and moves edit mode to that row.
- \`Save\` is disabled while the trimmed text is empty. Otherwise it replaces the item's name with the trimmed text, leaves edit mode and calls \`onRename(id, trimmedName)\` if the prop was given.
- \`Cancel\` leaves edit mode without changing anything. The typed text is thrown away: editing the same row again starts from its saved name.`,
    componentName: 'EditableList',
    starter: `import React, { useState } from 'react';

export default function EditableList({ items: initialItems, onRename }) {
  const [items, setItems] = useState(initialItems);

  // TODO: track which row is being edited and the draft text; add Save and Cancel

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} data-testid={'row-' + item.id}>
          <span>{item.name}</span>{' '}
          <button type="button" aria-label={'Edit ' + item.name}>Edit</button>
        </li>
      ))}
    </ul>
  );
}
`,
    previewProps: {
      items: [
        { id: 1, name: 'Ada Lovelace' },
        { id: 2, name: 'Alan Turing' },
        { id: 3, name: 'Grace Hopper' },
      ],
    },
    tests: [
      {
        name: 'shows every name with an Edit button and no input',
        code: `const { getByTestId, getByRole, queryByRole } = render(props);
expect(getByTestId('row-1')).toHaveTextContent('Ada Lovelace');
expect(getByTestId('row-3')).toHaveTextContent('Grace Hopper');
expect(getByRole('button', { name: 'Edit Alan Turing' })).toBeTruthy();
expect(queryByRole('textbox')).toBeNull();
expect(queryByRole('button', { name: 'Save' })).toBeNull();`,
      },
      {
        name: 'Edit opens a pre-filled input and Save commits the trimmed name',
        code: `const calls = [];
const { getByTestId, getByRole, getByLabelText, queryByRole } = render({ items: props.items, onRename: (id, name) => calls.push([id, name]) });
fireEvent.click(getByRole('button', { name: 'Edit Alan Turing' }));
expect(getByLabelText('Name').value).toBe('Alan Turing');
expect(getByTestId('row-2').contains(getByLabelText('Name'))).toBe(true);
expect(queryByRole('button', { name: 'Edit Alan Turing' })).toBeNull();
fireEvent.change(getByLabelText('Name'), '  Alan M. Turing ');
expect(calls).toEqual([]);
fireEvent.click(getByRole('button', { name: 'Save' }));
expect(queryByRole('textbox')).toBeNull();
expect(getByTestId('row-2')).toHaveTextContent('Alan M. Turing');
expect(getByRole('button', { name: 'Edit Alan M. Turing' })).toBeTruthy();
expect(calls).toEqual([[2, 'Alan M. Turing']]);`,
      },
      {
        name: 'Cancel throws the typed text away',
        code: `const calls = [];
const { getByTestId, getByRole, getByLabelText, queryByRole } = render({ items: props.items, onRename: (id, name) => calls.push([id, name]) });
fireEvent.click(getByRole('button', { name: 'Edit Ada Lovelace' }));
fireEvent.change(getByLabelText('Name'), 'Zed');
fireEvent.click(getByRole('button', { name: 'Cancel' }));
expect(queryByRole('textbox')).toBeNull();
expect(getByTestId('row-1')).toHaveTextContent('Ada Lovelace');
expect(getByTestId('row-1')).not.toHaveTextContent('Zed');
expect(calls).toEqual([]);
fireEvent.click(getByRole('button', { name: 'Edit Ada Lovelace' }));
expect(getByLabelText('Name').value).toBe('Ada Lovelace');`,
      },
      {
        name: 'Save is disabled while the name is blank',
        code: `const { getByTestId, getByRole, getByLabelText } = render({ items: props.items });
fireEvent.click(getByRole('button', { name: 'Edit Grace Hopper' }));
expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
fireEvent.change(getByLabelText('Name'), '   ');
expect(getByRole('button', { name: 'Save' })).toBeDisabled();
fireEvent.change(getByLabelText('Name'), 'Bo');
expect(getByRole('button', { name: 'Save' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Save' }));
expect(getByTestId('row-3')).toHaveTextContent('Bo');`,
      },
      {
        name: 'only one row is in edit mode at a time',
        code: `const { getByTestId, getByRole, getAllByRole } = render({ items: props.items });
fireEvent.click(getByRole('button', { name: 'Edit Ada Lovelace' }));
fireEvent.change(getAllByRole('textbox')[0], 'Draft');
fireEvent.click(getByRole('button', { name: 'Edit Grace Hopper' }));
expect(getAllByRole('textbox')).toHaveLength(1);
expect(getAllByRole('textbox')[0].value).toBe('Grace Hopper');
expect(getByTestId('row-3').contains(getAllByRole('textbox')[0])).toBe(true);
expect(getByTestId('row-1')).toHaveTextContent('Ada Lovelace');
expect(getByRole('button', { name: 'Edit Ada Lovelace' })).toBeTruthy();`,
      },
    ],
    hint: 'Keep `editingId` and a separate `draft` string. Copy the name into `draft` when Edit is clicked, and write it back into `items` only in the Save handler.',
    explanation:
      'The key decision is where the in-progress text lives. If `onChange` writes straight into the `items` array, there is nothing left to cancel: the old name is already gone. Keeping a separate `draft` string means the list only changes at one well-defined moment, Save. ' +
      'Storing a single `editingId` (rather than an `isEditing` flag per row) makes "one row at a time" automatic, because starting to edit another row just overwrites the id and the draft. ' +
      'Save maps over the items and returns a new object for the matching id, so the update is immutable, then clears `editingId` and reports the change through the optional callback. Cancel only clears `editingId`; the next Edit click re-seeds the draft from the saved name.',
    solution: `import React, { useState } from 'react';

export default function EditableList({ items: initialItems, onRename }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (item) => {
    setEditingId(item.id);
    setDraft(item.name);
  };

  const save = () => {
    const name = draft.trim();
    if (name === '') return;
    setItems(items.map((item) => (item.id === editingId ? { ...item, name } : item)));
    if (onRename) onRename(editingId, name);
    setEditingId(null);
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} data-testid={'row-' + item.id}>
          {item.id === editingId ? (
            <>
              <input type="text" aria-label="Name" value={draft} onChange={(e) => setDraft(e.target.value)} />{' '}
              <button type="button" onClick={save} disabled={draft.trim() === ''}>Save</button>{' '}
              <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span>{item.name}</span>{' '}
              <button type="button" aria-label={'Edit ' + item.name} onClick={() => startEdit(item)}>Edit</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
`,
  },

  {
    id: 'react-undo-redo-history',
    number: 59,
    title: 'Undo and Redo History',
    difficulty: 'Hard',
    topic: 'State & Events',
    statement: `Build \`ColorHistory({ colors, initial, limit = 5 })\`, a colour picker with undo and redo. \`colors\` is an array of colour names and \`initial\` (default: the first colour) is the starting colour.

The component keeps a **history** (a list of colours) and a **position** in it. At the start the history is just \`[initial]\`.

- One \`<button>\` per colour whose text is the colour name. The button of the current colour has \`aria-pressed="true"\`; the others have \`aria-pressed="false"\`.
- \`<p data-testid="current">\` reads \`Current: {colour}\`, the colour at the current position.
- \`<p data-testid="position">\` reads \`Step X of Y\`: X is the 1-based position and Y is the history length.
- Buttons labelled \`Undo\` and \`Redo\` move the position one step back or forward. \`Undo\` is disabled at the first entry, \`Redo\` at the last.
- Picking a colour different from the current one first throws away every entry after the current position (the redo steps), then appends the new colour and moves to it.
- Picking the colour that is already current does nothing at all.
- The history never holds more than \`limit\` entries. If appending would exceed it, drop the oldest entry, so the position stays on the newest one.`,
    componentName: 'ColorHistory',
    starter: `import React, { useState } from 'react';

export default function ColorHistory({ colors, initial, limit = 5 }) {
  const [current, setCurrent] = useState(initial === undefined ? colors[0] : initial);

  // TODO: replace the single value with a history list and a position so Undo and Redo can work

  return (
    <div>
      {colors.map((color) => (
        <button key={color} type="button" aria-pressed={color === current} onClick={() => setCurrent(color)}>
          {color}
        </button>
      ))}
      <p data-testid="current">Current: {current}</p>
      <p data-testid="position">Step 1 of 1</p>
      <button type="button" disabled>Undo</button>
      <button type="button" disabled>Redo</button>
    </div>
  );
}
`,
    previewProps: { colors: ['red', 'green', 'blue', 'gold'], initial: 'red', limit: 5 },
    tests: [
      {
        name: 'starts with a one-entry history',
        code: `const colors = ['red', 'green', 'blue', 'gold'];
const { getByRole, getByTestId, rerender } = render({ colors });
expect(getByTestId('current').textContent).toBe('Current: red');
expect(getByTestId('position').textContent).toBe('Step 1 of 1');
expect(getByRole('button', { name: 'Undo' })).toBeDisabled();
expect(getByRole('button', { name: 'Redo' })).toBeDisabled();
expect(getByRole('button', { name: 'red' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'green' })).toHaveAttribute('aria-pressed', 'false');`,
      },
      {
        name: 'respects the initial colour',
        code: `const { getByRole, getByTestId } = render({ colors: ['red', 'green', 'blue'], initial: 'blue' });
expect(getByTestId('current').textContent).toBe('Current: blue');
expect(getByRole('button', { name: 'blue' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'red' })).toHaveAttribute('aria-pressed', 'false');
fireEvent.click(getByRole('button', { name: 'red' }));
fireEvent.click(getByRole('button', { name: 'Undo' }));
expect(getByTestId('current').textContent).toBe('Current: blue');`,
      },
      {
        name: 'Undo and Redo walk back and forth through the picks',
        code: `const colors = ['red', 'green', 'blue', 'gold'];
const { getByRole, getByTestId } = render({ colors });
const cur = () => getByTestId('current').textContent;
const pos = () => getByTestId('position').textContent;
fireEvent.click(getByRole('button', { name: 'green' }));
fireEvent.click(getByRole('button', { name: 'blue' }));
expect(cur()).toBe('Current: blue');
expect(pos()).toBe('Step 3 of 3');
expect(getByRole('button', { name: 'Redo' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Undo' }));
expect(cur()).toBe('Current: green');
expect(pos()).toBe('Step 2 of 3');
expect(getByRole('button', { name: 'green' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'blue' })).toHaveAttribute('aria-pressed', 'false');
expect(getByRole('button', { name: 'Redo' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Undo' }));
expect(cur()).toBe('Current: red');
expect(getByRole('button', { name: 'Undo' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Redo' }));
fireEvent.click(getByRole('button', { name: 'Redo' }));
expect(cur()).toBe('Current: blue');
expect(pos()).toBe('Step 3 of 3');`,
      },
      {
        name: 'a new pick after Undo discards the redo steps',
        code: `const colors = ['red', 'green', 'blue', 'gold'];
const { getByRole, getByTestId } = render({ colors });
fireEvent.click(getByRole('button', { name: 'green' }));
fireEvent.click(getByRole('button', { name: 'blue' }));
fireEvent.click(getByRole('button', { name: 'Undo' }));
fireEvent.click(getByRole('button', { name: 'Undo' }));
fireEvent.click(getByRole('button', { name: 'gold' }));
expect(getByTestId('current').textContent).toBe('Current: gold');
expect(getByTestId('position').textContent).toBe('Step 2 of 2');
expect(getByRole('button', { name: 'Redo' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Undo' }));
expect(getByTestId('current').textContent).toBe('Current: red');`,
      },
      {
        name: 'picking the current colour again changes nothing',
        code: `const colors = ['red', 'green', 'blue', 'gold'];
const { getByRole, getByTestId } = render({ colors });
fireEvent.click(getByRole('button', { name: 'red' }));
expect(getByTestId('position').textContent).toBe('Step 1 of 1');
fireEvent.click(getByRole('button', { name: 'green' }));
fireEvent.click(getByRole('button', { name: 'green' }));
expect(getByTestId('position').textContent).toBe('Step 2 of 2');
fireEvent.click(getByRole('button', { name: 'Undo' }));
fireEvent.click(getByRole('button', { name: 'red' }));
expect(getByTestId('position').textContent).toBe('Step 1 of 2');
expect(getByRole('button', { name: 'Redo' })).not.toBeDisabled();`,
      },
      {
        name: 'drops the oldest entry once the limit is reached',
        code: `const colors = ['red', 'green', 'blue', 'gold'];
const { getByRole, getByTestId } = render({ colors, limit: 3 });
fireEvent.click(getByRole('button', { name: 'green' }));
fireEvent.click(getByRole('button', { name: 'blue' }));
expect(getByTestId('position').textContent).toBe('Step 3 of 3');
fireEvent.click(getByRole('button', { name: 'gold' }));
expect(getByTestId('position').textContent).toBe('Step 3 of 3');
expect(getByTestId('current').textContent).toBe('Current: gold');
fireEvent.click(getByRole('button', { name: 'Undo' }));
fireEvent.click(getByRole('button', { name: 'Undo' }));
expect(getByTestId('current').textContent).toBe('Current: green');
expect(getByTestId('position').textContent).toBe('Step 1 of 3');
expect(getByRole('button', { name: 'Undo' })).toBeDisabled();`,
      },
    ],
    hint: 'Store `{ history, index }` together. A pick is `history.slice(0, index + 1).concat(color)`; Undo and Redo only move `index`.',
    explanation:
      'Undo/redo is a list plus a cursor. The current value is `history[index]`, and whether Undo or Redo is available is derived from the cursor (`index > 0`, `index < history.length - 1`), so none of that needs its own state. ' +
      'Undo and Redo never touch the list; they only move the cursor. The interesting operation is a new pick. It must cut the list at the cursor before appending, `history.slice(0, index + 1).concat(color)`. Appending to the full list is the common bug: the abandoned redo entries stay in the history and the new entry lands after them. ' +
      'The limit is applied to the new list by slicing off the front, and the cursor is then placed on the last entry, which keeps the two values consistent. Keeping `history` and `index` in one state object means they are always updated together in a single render. ' +
      'Each operation is O(limit).',
    solution: `import React, { useState } from 'react';

export default function ColorHistory({ colors, initial, limit = 5 }) {
  const [state, setState] = useState({
    history: [initial === undefined ? colors[0] : initial],
    index: 0,
  });
  const { history, index } = state;
  const current = history[index];

  const pick = (color) => {
    if (color === current) return;
    let next = history.slice(0, index + 1).concat(color);
    if (next.length > limit) next = next.slice(next.length - limit);
    setState({ history: next, index: next.length - 1 });
  };

  return (
    <div>
      <div>
        {colors.map((color) => (
          <button key={color} type="button" aria-pressed={color === current} onClick={() => pick(color)}>
            {color}
          </button>
        ))}
      </div>
      <p data-testid="current">Current: {current}</p>
      <p data-testid="position">Step {index + 1} of {history.length}</p>
      <button type="button" disabled={index === 0} onClick={() => setState({ history, index: index - 1 })}>
        Undo
      </button>
      <button type="button" disabled={index === history.length - 1} onClick={() => setState({ history, index: index + 1 })}>
        Redo
      </button>
    </div>
  );
}
`,
  },

  {
    id: 'react-tic-tac-toe',
    number: 60,
    title: 'Tic-Tac-Toe Board',
    difficulty: 'Hard',
    topic: 'State & Events',
    statement: `Build \`TicTacToe()\`, a two-player game on a 3×3 board. It takes no props.

- Render nine \`<button>\`s with \`aria-label\` \`Square 1\` to \`Square 9\`, numbered left to right, top row first. A square's text is \`X\`, \`O\` or empty.
- \`X\` moves first and the players alternate. Clicking an empty square places the current player's mark. Clicking a filled square does nothing (the turn does not change).
- A player wins by filling a full row, column or diagonal. Once somebody has won, further clicks on squares do nothing.
- \`<p data-testid="status">\` reads \`Next player: X\` or \`Next player: O\` while the game is on, \`Winner: X\` or \`Winner: O\` after a win, and \`Draw\` when all nine squares are filled and nobody has won. A move that fills the last square **and** completes a line is a win, not a draw.
- After a win, the three squares of the winning line have \`data-winning="true"\`. No other square has that attribute value, and no square has it before the game is won.
- A button labelled \`Reset\` empties the board and gives the first move back to \`X\`.

Work out the winner from the board on every render instead of storing it in state.`,
    componentName: 'TicTacToe',
    starter: `import React, { useState } from 'react';

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));

  // TODO: place marks in turn, detect the winner or a draw, mark the winning line, reset

  return (
    <div>
      <p data-testid="status">Next player: X</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 4 }}>
        {squares.map((value, i) => (
          <button key={i} type="button" aria-label={'Square ' + (i + 1)} style={{ height: 48 }}>
            {value}
          </button>
        ))}
      </div>
      <button type="button">Reset</button>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'starts with nine empty squares and X to move',
        code: `const { getByRole, getByTestId } = render({});
for (let n = 1; n <= 9; n++) expect(getByRole('button', { name: 'Square ' + n }).textContent).toBe('');
expect(getByTestId('status').textContent).toBe('Next player: X');`,
      },
      {
        name: 'players alternate and a filled square cannot be taken',
        code: `const { getByRole, getByTestId } = render({});
const sq = (n) => getByRole('button', { name: 'Square ' + n });
fireEvent.click(sq(5));
expect(sq(5).textContent).toBe('X');
expect(getByTestId('status').textContent).toBe('Next player: O');
fireEvent.click(sq(5));
expect(sq(5).textContent).toBe('X');
expect(getByTestId('status').textContent).toBe('Next player: O');
fireEvent.click(sq(1));
expect(sq(1).textContent).toBe('O');
expect(getByTestId('status').textContent).toBe('Next player: X');`,
      },
      {
        name: 'a row or a column wins and the game stops',
        code: `const { getByRole, getByTestId } = render({});
const sq = (n) => getByRole('button', { name: 'Square ' + n });
[1, 4, 2, 5, 3].forEach((n) => fireEvent.click(sq(n)));
expect(getByTestId('status').textContent).toBe('Winner: X');
fireEvent.click(sq(9));
expect(sq(9).textContent).toBe('');
expect(getByTestId('status').textContent).toBe('Winner: X');
fireEvent.click(getByRole('button', { name: 'Reset' }));
[2, 1, 5, 4, 9, 7].forEach((n) => fireEvent.click(sq(n)));
expect(getByTestId('status').textContent).toBe('Winner: O');`,
      },
      {
        name: 'marks exactly the winning line',
        code: `const { getByRole, getByTestId } = render({});
const sq = (n) => getByRole('button', { name: 'Square ' + n });
const winning = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => sq(n).getAttribute('data-winning') === 'true');
[1, 3, 2, 5, 9].forEach((n) => fireEvent.click(sq(n)));
expect(winning()).toEqual([]);
fireEvent.click(sq(7));
expect(getByTestId('status').textContent).toBe('Winner: O');
expect(winning()).toEqual([3, 5, 7]);`,
      },
      {
        name: 'a full board with no line is a draw',
        code: `const { getByRole, getByTestId } = render({});
const sq = (n) => getByRole('button', { name: 'Square ' + n });
[1, 2, 3, 5, 4, 6, 8, 7].forEach((n) => fireEvent.click(sq(n)));
expect(getByTestId('status').textContent).toBe('Next player: X');
fireEvent.click(sq(9));
expect(getByTestId('status').textContent).toBe('Draw');
expect([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => sq(n).getAttribute('data-winning') === 'true')).toEqual([]);`,
      },
      {
        name: 'winning with the last square is a win, and Reset starts over',
        code: `const { getByRole, getByTestId } = render({});
const sq = (n) => getByRole('button', { name: 'Square ' + n });
[1, 2, 3, 4, 5, 6, 8, 7, 9].forEach((n) => fireEvent.click(sq(n)));
expect(getByTestId('status').textContent).toBe('Winner: X');
expect([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => sq(n).getAttribute('data-winning') === 'true')).toEqual([1, 5, 9]);
fireEvent.click(getByRole('button', { name: 'Reset' }));
for (let n = 1; n <= 9; n++) {
  expect(sq(n).textContent).toBe('');
  expect(sq(n).getAttribute('data-winning') === 'true').toBe(false);
}
expect(getByTestId('status').textContent).toBe('Next player: X');
fireEvent.click(sq(1));
expect(sq(1).textContent).toBe('X');`,
      },
    ],
    hint: 'The board array is the only state you need. List the eight winning lines as index triples, write a function that finds a completed line, and derive the status text from its result (check for a winner before checking for a draw).',
    explanation:
      'The only real state is the board: an array of nine cells. Whose turn it is can be derived by counting the filled squares (an even count means X), and the winner is derived by checking the eight possible lines. Storing either of those separately creates values that can fall out of sync with the board. ' +
      'A `findWin` helper walks the line table and returns the mark and the three indexes of the first completed line. The click handler ignores the click when the square is taken or a winner already exists, otherwise it copies the array and writes the current mark. ' +
      'Order matters in the status text: check for a winner first, and only then whether the board is full. Testing "board full" first reports a draw for a game that was won with the ninth move. ' +
      'The winning indexes from the same helper drive the `data-winning` attribute, and Reset just restores the empty array, which resets everything derived from it.',
    solution: `import React, { useState } from 'react';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function findWin(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));

  const win = findWin(squares);
  const filled = squares.filter(Boolean).length;
  const next = filled % 2 === 0 ? 'X' : 'O';
  const status = win ? 'Winner: ' + win.winner : filled === 9 ? 'Draw' : 'Next player: ' + next;

  const handleClick = (i) => {
    if (win || squares[i]) return;
    const copy = squares.slice();
    copy[i] = next;
    setSquares(copy);
  };

  return (
    <div>
      <p data-testid="status">{status}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: 4 }}>
        {squares.map((value, i) => {
          const winning = win !== null && win.line.includes(i);
          return (
            <button
              key={i}
              type="button"
              aria-label={'Square ' + (i + 1)}
              data-winning={winning ? 'true' : undefined}
              onClick={() => handleClick(i)}
              style={{ height: 48, fontSize: 20, background: winning ? '#bbf7d0' : undefined }}
            >
              {value}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => setSquares(Array(9).fill(null))} style={{ marginTop: 8 }}>
        Reset
      </button>
    </div>
  );
}
`,
  },

  // ───────────────────────────── Derived & Lists ─────────────────────────────
  {
    id: 'react-show-more-list',
    number: 61,
    title: 'Show More List',
    difficulty: 'Easy',
    topic: 'Derived & Lists',
    statement: `Build \`ShowMoreList({ items, step = 3 })\`, where \`items\` is an array of strings.

- If \`items\` is empty, render only a \`<p>\` reading \`Nothing here yet\` (no list, no summary, no button).
- Otherwise render the visible items in a \`<ul>\`, one \`<li>\` each, in order. At first the first \`step\` items are visible (all of them if there are fewer).
- \`<p data-testid="summary">\` reads \`Showing X of Y\`: X is the number of visible items and Y is the total.
- While some items are still hidden, render a \`<button>\` reading \`Show more (N)\`, where N is the number of items still hidden. Clicking it reveals up to \`step\` more items.
- Once every item is visible, the button is not rendered.`,
    componentName: 'ShowMoreList',
    starter: `import React, { useState } from 'react';

export default function ShowMoreList({ items, step = 3 }) {
  // TODO: show the first \`step\` items, a summary, and a button that reveals more
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
`,
    previewProps: {
      items: ['Signed in', 'Updated profile photo', 'Joined team Rocket', 'Commented on a task', 'Closed 3 issues', 'Invited Sam', 'Changed password'],
      step: 3,
    },
    tests: [
      {
        name: 'shows the first step items with a summary and a button',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, getByTestId } = render({ items, step: 3 });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
expect(getByTestId('summary').textContent).toBe('Showing 3 of 7');
expect(getByRole('button').textContent).toBe('Show more (4)');`,
      },
      {
        name: 'each click reveals one more step',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, getByTestId } = render({ items, step: 3 });
fireEvent.click(getByRole('button'));
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
expect(getByTestId('summary').textContent).toBe('Showing 6 of 7');
expect(getByRole('button').textContent).toBe('Show more (1)');`,
      },
      {
        name: 'the last click shows the remainder and removes the button',
        code: `const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const { getAllByRole, getByRole, queryByRole, getByTestId } = render({ items, step: 3 });
fireEvent.click(getByRole('button'));
fireEvent.click(getByRole('button'));
expect(getAllByRole('listitem')).toHaveLength(7);
expect(getByTestId('summary').textContent).toBe('Showing 7 of 7');
expect(queryByRole('button')).toBeNull();`,
      },
      {
        name: 'no button when everything already fits',
        code: `const { getAllByRole, queryByRole, getByTestId, rerender } = render({ items: ['a', 'b'], step: 3 });
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getByTestId('summary').textContent).toBe('Showing 2 of 2');
expect(queryByRole('button')).toBeNull();
rerender({ items: ['a', 'b', 'c'], step: 3 });
expect(getByTestId('summary').textContent).toBe('Showing 3 of 3');
expect(queryByRole('button')).toBeNull();`,
      },
      {
        name: 'an empty list shows only the placeholder',
        code: `const { getByText, queryByRole, queryByTestId } = render({ items: [] });
expect(getByText('Nothing here yet')).toBeTruthy();
expect(queryByRole('list')).toBeNull();
expect(queryByRole('button')).toBeNull();
expect(queryByTestId('summary')).toBeNull();`,
      },
      {
        name: 'step defaults to 3 and can be changed',
        code: `const items = ['a', 'b', 'c', 'd', 'e'];
const first = render({ items });
expect(first.getAllByRole('listitem')).toHaveLength(3);
expect(first.getByRole('button').textContent).toBe('Show more (2)');
first.unmount();
const second = render({ items, step: 2 });
expect(second.getAllByRole('listitem')).toHaveLength(2);
fireEvent.click(second.getByRole('button'));
expect(second.getAllByRole('listitem')).toHaveLength(4);
expect(second.getByRole('button').textContent).toBe('Show more (1)');`,
      },
    ],
    hint: 'Store how many items are visible (a number), not the visible items themselves. Slice the array during render and cap the number with `Math.min`.',
    explanation:
      'The only state is a count of how many items are visible. The visible slice, the summary and the number of hidden items are all derived from that count and the `items` prop, so they cannot get out of step. ' +
      'The detail to get right is the cap. Adding `step` on each click without limiting it produces a count larger than the list on the last click: `slice` hides the problem in the list itself, but the summary then claims `Showing 9 of 7`. Either cap when updating (`Math.min(count + step, items.length)`) or cap when reading; the solution caps on read, which also stays correct if `items` shrinks. ' +
      'The button is rendered only while `hidden > 0`, and the empty list returns early with the placeholder.',
    solution: `import React, { useState } from 'react';

export default function ShowMoreList({ items, step = 3 }) {
  const [count, setCount] = useState(step);

  if (items.length === 0) return <p>Nothing here yet</p>;

  const visible = Math.min(count, items.length);
  const hidden = items.length - visible;

  return (
    <div>
      <ul>
        {items.slice(0, visible).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p data-testid="summary">Showing {visible} of {items.length}</p>
      {hidden > 0 && (
        <button type="button" onClick={() => setCount(visible + step)}>
          Show more ({hidden})
        </button>
      )}
    </div>
  );
}
`,
  },

  {
    id: 'react-job-board-filter-sort',
    number: 62,
    title: 'Job Board Filters and Sorting',
    difficulty: 'Medium',
    topic: 'Derived & Lists',
    statement: `Build \`JobBoard({ jobs })\`. Each job is \`{ id, title, team, salary, remote }\`: \`salary\` is a whole number of thousands and \`remote\` is a boolean.

Controls:
- A \`<select>\` labelled \`Team\`. Its first option is \`All\` (value \`all\`), followed by one option per distinct team in alphabetical order (value and text are both the team name). \`All\` is selected at first.
- A checkbox labelled \`Remote only\`, unchecked at first.
- A \`<select>\` labelled \`Sort by\` with three options in this order: value \`title\` with text \`Title\`, value \`salary-desc\` with text \`Salary: high to low\`, value \`salary-asc\` with text \`Salary: low to high\`. \`title\` is selected at first.

Output:
- One \`<li>\` per job that passes both filters. Its text is the title followed by the salary in brackets with a dollar sign and a \`k\`, exactly like \`Data Engineer ($150k)\`.
- \`title\` sorts alphabetically by title. The two salary orders sort by salary, and jobs with the same salary are ordered alphabetically by title in **both** directions.
- \`<p data-testid="count">\` reads \`Showing X of Y\` (X matching jobs, Y all jobs).
- If no job matches, render a \`<p>\` reading \`No jobs match\` and no \`<li>\`.

Derive the visible list during render. Never reorder or modify the \`jobs\` array you were given.`,
    componentName: 'JobBoard',
    starter: `import React, { useState } from 'react';

export default function JobBoard({ jobs }) {
  // TODO: team select, remote checkbox, sort select; derive the visible jobs from them
  return (
    <div>
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>{job.title} (\${job.salary}k)</li>
        ))}
      </ul>
      <p data-testid="count">Showing {jobs.length} of {jobs.length}</p>
    </div>
  );
}
`,
    previewProps: {
      jobs: [
        { id: 1, title: 'Product Designer', team: 'Design', salary: 110, remote: true },
        { id: 2, title: 'Backend Engineer', team: 'Engineering', salary: 140, remote: false },
        { id: 3, title: 'Support Lead', team: 'Support', salary: 85, remote: true },
        { id: 4, title: 'QA Engineer', team: 'Engineering', salary: 110, remote: true },
        { id: 5, title: 'Brand Designer', team: 'Design', salary: 85, remote: false },
        { id: 6, title: 'Data Engineer', team: 'Engineering', salary: 150, remote: true },
      ],
    },
    tests: [
      {
        name: 'lists every job by title at first',
        code: `const { getAllByRole, getByTestId, getByLabelText } = render(props);
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual([
  'Backend Engineer ($140k)', 'Brand Designer ($85k)', 'Data Engineer ($150k)',
  'Product Designer ($110k)', 'QA Engineer ($110k)', 'Support Lead ($85k)']);
expect(getByTestId('count').textContent).toBe('Showing 6 of 6');
expect(getByLabelText('Team').value).toBe('all');
expect(getByLabelText('Sort by').value).toBe('title');
expect(getByLabelText('Remote only').checked).toBe(false);`,
      },
      {
        name: 'offers All plus each team once, alphabetically',
        code: `const { getByLabelText } = render(props);
const teamOptions = Array.from(getByLabelText('Team').querySelectorAll('option'));
expect(teamOptions.map((o) => o.value)).toEqual(['all', 'Design', 'Engineering', 'Support']);
expect(teamOptions.map((o) => o.textContent)).toEqual(['All', 'Design', 'Engineering', 'Support']);
const sortOptions = Array.from(getByLabelText('Sort by').querySelectorAll('option'));
expect(sortOptions.map((o) => o.value)).toEqual(['title', 'salary-desc', 'salary-asc']);
expect(sortOptions.map((o) => o.textContent)).toEqual(['Title', 'Salary: high to low', 'Salary: low to high']);`,
      },
      {
        name: 'the team and remote filters combine',
        code: `const { getAllByRole, getByTestId, getByLabelText } = render(props);
const titles = () => getAllByRole('listitem').map((li) => li.textContent);
fireEvent.change(getByLabelText('Team'), 'Engineering');
expect(titles()).toEqual(['Backend Engineer ($140k)', 'Data Engineer ($150k)', 'QA Engineer ($110k)']);
expect(getByTestId('count').textContent).toBe('Showing 3 of 6');
fireEvent.click(getByLabelText('Remote only'));
expect(titles()).toEqual(['Data Engineer ($150k)', 'QA Engineer ($110k)']);
expect(getByTestId('count').textContent).toBe('Showing 2 of 6');
fireEvent.change(getByLabelText('Team'), 'all');
expect(titles()).toEqual(['Data Engineer ($150k)', 'Product Designer ($110k)', 'QA Engineer ($110k)', 'Support Lead ($85k)']);`,
      },
      {
        name: 'sorts by salary in both directions, breaking ties by title',
        code: `const { getAllByRole, getByLabelText } = render(props);
const titles = () => getAllByRole('listitem').map((li) => li.textContent);
fireEvent.change(getByLabelText('Sort by'), 'salary-desc');
expect(titles()).toEqual([
  'Data Engineer ($150k)', 'Backend Engineer ($140k)', 'Product Designer ($110k)',
  'QA Engineer ($110k)', 'Brand Designer ($85k)', 'Support Lead ($85k)']);
fireEvent.change(getByLabelText('Sort by'), 'salary-asc');
expect(titles()).toEqual([
  'Brand Designer ($85k)', 'Support Lead ($85k)', 'Product Designer ($110k)',
  'QA Engineer ($110k)', 'Backend Engineer ($140k)', 'Data Engineer ($150k)']);
fireEvent.change(getByLabelText('Sort by'), 'title');
expect(titles()[0]).toBe('Backend Engineer ($140k)');`,
      },
      {
        name: 'says so when nothing matches',
        code: `const jobs = [{ id: 1, title: 'Office Manager', team: 'Operations', salary: 70, remote: false }];
const { container, getByText, queryByText, getByTestId, getByLabelText } = render({ jobs });
expect(queryByText('No jobs match')).toBeNull();
fireEvent.click(getByLabelText('Remote only'));
expect(getByText('No jobs match')).toBeTruthy();
expect(container.querySelectorAll('li')).toHaveLength(0);
expect(getByTestId('count').textContent).toBe('Showing 0 of 1');`,
      },
      {
        name: 'leaves the jobs prop in its original order',
        code: `const jobs = props.jobs.map((job) => ({ ...job }));
const { getByLabelText, getAllByRole } = render({ jobs });
fireEvent.change(getByLabelText('Sort by'), 'salary-asc');
fireEvent.change(getByLabelText('Sort by'), 'title');
expect(getAllByRole('listitem')).toHaveLength(6);
expect(jobs.map((job) => job.id)).toEqual([1, 2, 3, 4, 5, 6]);`,
      },
    ],
    hint: 'State holds only the three control values. `filter` already returns a new array, so sorting its result is safe; write one comparator per sort mode and fall back to comparing titles when salaries are equal.',
    explanation:
      'The controls are the state (team, remote flag, sort key); the visible list is derived from them and the `jobs` prop on every render. Storing a filtered copy in state would mean keeping it in sync by hand every time any control changes. ' +
      'Two details need care. First, `Array.prototype.sort` sorts in place, so calling it on the prop reorders the parent\'s data; `filter` returns a fresh array, which makes the following `sort` safe. ' +
      'Second, the tie rule. Building the descending order by reversing the ascending one also reverses the ties, putting `QA Engineer` before `Product Designer`. Each direction needs its own comparator that compares salaries first and then falls back to the same title comparison. ' +
      'The team options come from a `Set` of the team names, sorted. The work per render is O(n log n), which is fine for a list this size; `useMemo` would be the next step for a large one.',
    solution: `import React, { useState } from 'react';

const byTitle = (a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0);
const COMPARATORS = {
  title: byTitle,
  'salary-desc': (a, b) => b.salary - a.salary || byTitle(a, b),
  'salary-asc': (a, b) => a.salary - b.salary || byTitle(a, b),
};

export default function JobBoard({ jobs }) {
  const [team, setTeam] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  const teams = Array.from(new Set(jobs.map((job) => job.team))).sort();
  const visible = jobs
    .filter((job) => (team === 'all' || job.team === team) && (!remoteOnly || job.remote))
    .sort(COMPARATORS[sortBy]);

  return (
    <div>
      <label>
        Team{' '}
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="all">All</option>
          {teams.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>{' '}
      <label>
        <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} /> Remote only
      </label>{' '}
      <label>
        Sort by{' '}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="title">Title</option>
          <option value="salary-desc">Salary: high to low</option>
          <option value="salary-asc">Salary: low to high</option>
        </select>
      </label>
      {visible.length === 0 ? (
        <p>No jobs match</p>
      ) : (
        <ul>
          {visible.map((job) => (
            <li key={job.id}>{job.title + ' ($' + job.salary + 'k)'}</li>
          ))}
        </ul>
      )}
      <p data-testid="count">Showing {visible.length} of {jobs.length}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-leaderboard-ranks',
    number: 63,
    title: 'Leaderboard with Tied Ranks',
    difficulty: 'Medium',
    topic: 'Derived & Lists',
    statement: `Build \`Leaderboard({ players, currentUser, top })\`. \`players\` is an array of \`{ name, score }\` with unique names; \`currentUser\` (a name) and \`top\` (a number) are optional.

- Order the players by \`score\`, highest first. Players with the same score are ordered alphabetically by name.
- Ranks use competition ranking: players with the same score share a rank, and the rank after a tie skips ahead. Scores 90, 80, 80, 70 get the ranks 1, 2, 2, 4.
- Render one \`<li>\` per row reading \`{rank}. {name} - {score} pts\`, for example \`2. Bea - 80 pts\`.
- The row of \`currentUser\` has \`aria-current="true"\`. No other row has an \`aria-current\` attribute.
- If \`top\` is given, show only the first \`top\` rows of the ordered list. If \`currentUser\` is a player who falls outside those rows, add their row at the end with their real rank.
- If \`players\` is empty, render a \`<p>\` reading \`No scores yet\` and no rows.

Do not reorder or modify the \`players\` array.`,
    componentName: 'Leaderboard',
    starter: `import React from 'react';

export default function Leaderboard({ players, currentUser, top }) {
  // TODO: sort a copy, compute ranks with ties, apply \`top\`, highlight the current user
  return (
    <ol>
      {players.map((player, index) => (
        <li key={player.name}>
          {index + 1}. {player.name} - {player.score} pts
        </li>
      ))}
    </ol>
  );
}
`,
    previewProps: {
      players: [
        { name: 'Dan', score: 70 },
        { name: 'Bea', score: 80 },
        { name: 'Ada', score: 90 },
        { name: 'Cy', score: 80 },
        { name: 'Eve', score: 70 },
        { name: 'Fay', score: 50 },
      ],
      currentUser: 'Fay',
      top: 3,
    },
    tests: [
      {
        name: 'orders players by score, highest first',
        code: `const players = [{ name: 'Mo', score: 12 }, { name: 'Al', score: 40 }, { name: 'Jo', score: 25 }];
const { getAllByRole } = render({ players });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1. Al - 40 pts', '2. Jo - 25 pts', '3. Mo - 12 pts']);`,
      },
      {
        name: 'tied scores share a rank and the next rank skips',
        code: `const { getAllByRole } = render({ players: props.players });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual([
  '1. Ada - 90 pts', '2. Bea - 80 pts', '2. Cy - 80 pts', '4. Dan - 70 pts', '4. Eve - 70 pts', '6. Fay - 50 pts']);`,
      },
      {
        name: 'highlights only the current user',
        code: `const { container, rerender } = render({ players: props.players, currentUser: 'Cy' });
const marked = container.querySelectorAll('[aria-current]');
expect(marked).toHaveLength(1);
expect(marked[0].getAttribute('aria-current')).toBe('true');
expect(marked[0].textContent).toBe('2. Cy - 80 pts');
rerender({ players: props.players });
expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);`,
      },
      {
        name: 'top limits the rows and appends the current user with their real rank',
        code: `const { container, getAllByRole } = render({ players: props.players, currentUser: 'Fay', top: 3 });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual([
  '1. Ada - 90 pts', '2. Bea - 80 pts', '2. Cy - 80 pts', '6. Fay - 50 pts']);
const marked = container.querySelectorAll('[aria-current]');
expect(marked).toHaveLength(1);
expect(marked[0].textContent).toBe('6. Fay - 50 pts');`,
      },
      {
        name: 'does not duplicate a current user who is already in the top rows',
        code: `const { getAllByRole, rerender } = render({ players: props.players, currentUser: 'Bea', top: 3 });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1. Ada - 90 pts', '2. Bea - 80 pts', '2. Cy - 80 pts']);
rerender({ players: props.players, top: 2 });
expect(getAllByRole('listitem')).toHaveLength(2);
rerender({ players: props.players, currentUser: 'Zed', top: 2 });
expect(getAllByRole('listitem')).toHaveLength(2);
rerender({ players: props.players, currentUser: 'Eve', top: 10 });
expect(getAllByRole('listitem')).toHaveLength(6);`,
      },
      {
        name: 'handles an empty board and leaves the prop untouched',
        code: `const first = render({ players: [] });
expect(first.getByText('No scores yet')).toBeTruthy();
expect(first.container.querySelectorAll('li')).toHaveLength(0);
first.unmount();
const players = props.players.map((p) => ({ ...p }));
render({ players });
expect(players.map((p) => p.name)).toEqual(['Dan', 'Bea', 'Ada', 'Cy', 'Eve', 'Fay']);`,
      },
    ],
    hint: 'Sort a copy, then walk it once: a player gets the previous player\'s rank when the scores are equal, otherwise their position (index + 1). Compute ranks for everyone before applying `top`.',
    explanation:
      'Everything is derived from props, in a fixed order of steps: copy and sort, attach ranks, then cut to `top`. ' +
      'Sort with a comparator that compares scores descending and falls back to the name, and sort a copy (`[...players]`) because `sort` mutates. ' +
      'For competition ranking, walk the sorted list: if a player has the same score as the previous one they inherit its rank, otherwise their rank is `index + 1`. Using `index + 1` for everyone ignores ties, and incrementing a counter only when the score changes gives dense ranking (1, 2, 2, 3), which is a different scheme. ' +
      'Ranks must be assigned before slicing, so that a current user appended from outside the top rows still carries their true rank. The append step checks that the user exists and is not already visible. The cost is the sort, O(n log n).',
    solution: `import React from 'react';

export default function Leaderboard({ players, currentUser, top }) {
  if (players.length === 0) return <p>No scores yet</p>;

  const sorted = [...players].sort(
    (a, b) => b.score - a.score || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
  );

  const ranked = [];
  sorted.forEach((player, index) => {
    const prev = ranked[index - 1];
    const rank = prev && prev.score === player.score ? prev.rank : index + 1;
    ranked.push({ ...player, rank });
  });

  let rows = top === undefined ? ranked : ranked.slice(0, top);
  const me = ranked.find((row) => row.name === currentUser);
  if (me && !rows.includes(me)) rows = [...rows, me];

  return (
    <ol style={{ listStyle: 'none', padding: 0 }}>
      {rows.map((row) => (
        <li
          key={row.name}
          aria-current={row.name === currentUser ? 'true' : undefined}
          style={{ fontWeight: row.name === currentUser ? 'bold' : 'normal' }}
        >
          {row.rank}. {row.name} - {row.score} pts
        </li>
      ))}
    </ol>
  );
}
`,
  },

  {
    id: 'react-transfer-list',
    number: 64,
    title: 'Transfer List',
    difficulty: 'Hard',
    topic: 'Derived & Lists',
    statement: `Build \`TransferList({ items, initialChosen = [], onChange })\`, a two-column picker. \`items\` is an array of \`{ id, label }\`; \`initialChosen\` is an array of ids that start in the chosen column; \`onChange\` is optional.

- Render two containers: \`data-testid="available"\` and \`data-testid="chosen"\`. Every item is in exactly one of them.
- Each container has an \`<h3>\` reading \`Available (N)\` or \`Chosen (N)\`, where N is the number of items in it, and a \`<ul>\` with one \`<li>\` per item. Each \`<li>\` contains a \`<label>\` that wraps an \`<input type="checkbox">\` and the item's label. The label is the only text in the \`<li>\`.
- Both columns always list their items in the order of the \`items\` prop, no matter in which order they were moved.
- A button labelled \`Move to chosen\` moves every checked item of the available column to the chosen column. A button labelled \`Move to available\` does the opposite. Each button is disabled while its source column has no checked item.
- Items arrive unchecked. A move does not change the checkboxes in the other column.
- After each move call \`onChange(chosenIds)\` (if given) with the ids of the chosen items in \`items\` order.`,
    componentName: 'TransferList',
    starter: `import React, { useState } from 'react';

export default function TransferList({ items, initialChosen = [], onChange }) {
  // TODO: track which ids are chosen and which are checked; derive both columns from \`items\`
  return (
    <div>
      <div data-testid="available">
        <h3>Available ({items.length})</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <label><input type="checkbox" /> {item.label}</label>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" disabled>Move to chosen</button>
      <button type="button" disabled>Move to available</button>
      <div data-testid="chosen">
        <h3>Chosen (0)</h3>
        <ul />
      </div>
    </div>
  );
}
`,
    previewProps: {
      items: [
        { id: 'a', label: 'Apple' },
        { id: 'b', label: 'Banana' },
        { id: 'c', label: 'Cherry' },
        { id: 'd', label: 'Dates' },
      ],
      initialChosen: ['c'],
    },
    tests: [
      {
        name: 'splits the items into the two columns with counts',
        code: `const { getByTestId, getByRole } = render({ items: props.items, initialChosen: ['c'] });
const names = (id) => Array.from(getByTestId(id).querySelectorAll('li')).map((li) => li.textContent.trim());
expect(names('available')).toEqual(['Apple', 'Banana', 'Dates']);
expect(names('chosen')).toEqual(['Cherry']);
expect(within(getByTestId('available')).getByRole('heading').textContent).toBe('Available (3)');
expect(within(getByTestId('chosen')).getByRole('heading').textContent).toBe('Chosen (1)');
expect(getByRole('button', { name: 'Move to chosen' })).toBeDisabled();
expect(getByRole('button', { name: 'Move to available' })).toBeDisabled();`,
      },
      {
        name: 'moves the checked items across and unchecks them',
        code: `const { getByTestId, getByRole } = render({ items: props.items, initialChosen: ['c'] });
const names = (id) => Array.from(getByTestId(id).querySelectorAll('li')).map((li) => li.textContent.trim());
const box = (id, label) => within(getByTestId(id)).getByLabelText(label);
fireEvent.click(box('available', 'Banana'));
fireEvent.click(box('available', 'Dates'));
expect(box('available', 'Banana').checked).toBe(true);
expect(getByRole('button', { name: 'Move to chosen' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Move to available' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
expect(names('available')).toEqual(['Apple']);
expect(names('chosen')).toEqual(['Banana', 'Cherry', 'Dates']);
expect(within(getByTestId('available')).getByRole('heading').textContent).toBe('Available (1)');
expect(within(getByTestId('chosen')).getByRole('heading').textContent).toBe('Chosen (3)');
expect(box('chosen', 'Banana').checked).toBe(false);
expect(box('chosen', 'Dates').checked).toBe(false);
expect(getByRole('button', { name: 'Move to chosen' })).toBeDisabled();`,
      },
      {
        name: 'keeps both columns in the original item order',
        code: `const { getByTestId, getByRole } = render({ items: props.items });
const names = (id) => Array.from(getByTestId(id).querySelectorAll('li')).map((li) => li.textContent.trim());
const box = (id, label) => within(getByTestId(id)).getByLabelText(label);
fireEvent.click(box('available', 'Dates'));
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
fireEvent.click(box('available', 'Apple'));
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
expect(names('chosen')).toEqual(['Apple', 'Dates']);
fireEvent.click(box('available', 'Cherry'));
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
expect(names('chosen')).toEqual(['Apple', 'Cherry', 'Dates']);
expect(names('available')).toEqual(['Banana']);`,
      },
      {
        name: 'moves items back to the available column',
        code: `const { getByTestId, getByRole } = render({ items: props.items, initialChosen: ['d', 'a', 'b'] });
const names = (id) => Array.from(getByTestId(id).querySelectorAll('li')).map((li) => li.textContent.trim());
const box = (id, label) => within(getByTestId(id)).getByLabelText(label);
expect(names('chosen')).toEqual(['Apple', 'Banana', 'Dates']);
fireEvent.click(box('chosen', 'Apple'));
expect(getByRole('button', { name: 'Move to available' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Move to chosen' })).toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Move to available' }));
expect(names('available')).toEqual(['Apple', 'Cherry']);
expect(names('chosen')).toEqual(['Banana', 'Dates']);
expect(box('available', 'Apple').checked).toBe(false);
expect(getByRole('button', { name: 'Move to available' })).toBeDisabled();`,
      },
      {
        name: "a move leaves the other column's checkboxes alone",
        code: `const { getByTestId, getByRole } = render({ items: props.items, initialChosen: ['c'] });
const names = (id) => Array.from(getByTestId(id).querySelectorAll('li')).map((li) => li.textContent.trim());
const box = (id, label) => within(getByTestId(id)).getByLabelText(label);
fireEvent.click(box('available', 'Apple'));
fireEvent.click(box('available', 'Apple'));
expect(getByRole('button', { name: 'Move to chosen' })).toBeDisabled();
fireEvent.click(box('chosen', 'Cherry'));
fireEvent.click(box('available', 'Apple'));
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
expect(names('chosen')).toEqual(['Apple', 'Cherry']);
expect(box('chosen', 'Cherry').checked).toBe(true);
expect(box('chosen', 'Apple').checked).toBe(false);
expect(getByRole('button', { name: 'Move to available' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Move to available' }));
expect(names('chosen')).toEqual(['Apple']);
expect(names('available')).toEqual(['Banana', 'Cherry', 'Dates']);`,
      },
      {
        name: 'reports the chosen ids in item order after every move',
        code: `const calls = [];
const { getByTestId, getByRole } = render({ items: props.items, onChange: (ids) => calls.push(ids.slice()) });
const box = (id, label) => within(getByTestId(id)).getByLabelText(label);
fireEvent.click(box('available', 'Dates'));
expect(calls).toEqual([]);
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
fireEvent.click(box('available', 'Apple'));
fireEvent.click(getByRole('button', { name: 'Move to chosen' }));
fireEvent.click(box('chosen', 'Dates'));
fireEvent.click(getByRole('button', { name: 'Move to available' }));
expect(calls).toEqual([['d'], ['a', 'd'], ['a']]);`,
      },
    ],
    hint: 'Keep two sets of ids in state: `chosen` and `checked`. Both columns are `items.filter(...)`, which gives you the original order for free.',
    explanation:
      'The trick is to store membership, not lists. State is two collections of ids: which items are chosen and which are ticked. Each column is then `items.filter(...)` over the original array, so the display order is always the prop order without any sorting. ' +
      'The tempting design keeps two arrays of items and pushes moved items onto the end of the destination. That renders items in the order they were moved, and the ids reported to the parent come out in that order too. ' +
      'A move works on the ticked items of the source column only: add (or remove) their ids from `chosen`, and remove exactly those ids from `checked`, so they arrive unticked and ticks in the other column survive. The button states are derived by asking whether each column has a ticked item. ' +
      'Because the next chosen set is computed in the handler, the same value is used for `setChosen` and for `onChange`, mapped through `items` to keep the order.',
    solution: `import React, { useState } from 'react';

export default function TransferList({ items, initialChosen = [], onChange }) {
  const [chosen, setChosen] = useState(initialChosen);
  const [checked, setChecked] = useState([]);

  const available = items.filter((item) => !chosen.includes(item.id));
  const picked = items.filter((item) => chosen.includes(item.id));
  const checkedIn = (list) => list.filter((item) => checked.includes(item.id)).map((item) => item.id);

  const toggle = (id) =>
    setChecked(checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]);

  const move = (toChosen) => {
    const moving = checkedIn(toChosen ? available : picked);
    const nextChosen = items
      .map((item) => item.id)
      .filter((id) => (toChosen ? chosen.includes(id) || moving.includes(id) : chosen.includes(id) && !moving.includes(id)));
    setChosen(nextChosen);
    setChecked(checked.filter((id) => !moving.includes(id)));
    if (onChange) onChange(nextChosen);
  };

  const renderColumn = (testId, title, list) => (
    <div data-testid={testId}>
      <h3>{title} ({list.length})</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {list.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={checked.includes(item.id)} onChange={() => toggle(item.id)} /> {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      {renderColumn('available', 'Available', available)}
      <button type="button" disabled={checkedIn(available).length === 0} onClick={() => move(true)}>
        Move to chosen
      </button>{' '}
      <button type="button" disabled={checkedIn(picked).length === 0} onClick={() => move(false)}>
        Move to available
      </button>
      {renderColumn('chosen', 'Chosen', picked)}
    </div>
  );
}
`,
  },

  // ───────────────────────────── Forms ─────────────────────────────
  {
    id: 'react-tip-calculator',
    number: 65,
    title: 'Tip and Split Calculator',
    difficulty: 'Easy',
    topic: 'Forms',
    statement: `Build \`TipCalculator()\`. It takes no props.

Inputs:
- A text input labelled \`Bill\`, empty at first.
- A \`<select>\` labelled \`Tip\` with the options \`10%\`, \`15%\` and \`20%\` (values \`10\`, \`15\`, \`20\`). \`15\` is selected at first.
- A text input labelled \`People\`, containing \`1\` at first.

Outputs, recalculated on every change:
- \`<p data-testid="tip">\` reads \`Tip: $X.XX\` (the bill multiplied by the tip percentage).
- \`<p data-testid="total">\` reads \`Total: $X.XX\` (bill plus tip).
- \`<p data-testid="per-person">\` reads \`Per person: $X.XX\` (total divided by the number of people).

Rules:
- Read the bill with \`Number(text)\`. If the field is empty, the result is not a number, or it is negative, use 0.
- Read the people count with \`Number(text)\`. If the field is empty, the result is not a number, or it is less than 1, split by 1.
- Format every amount with \`toFixed(2)\`.

Keep only the three field values in state; calculate the three amounts during render.`,
    componentName: 'TipCalculator',
    starter: `import React, { useState } from 'react';

export default function TipCalculator() {
  const [bill, setBill] = useState('');

  // TODO: add the Tip select and the People field, then derive the three amounts

  return (
    <div>
      <label>
        Bill <input type="text" value={bill} onChange={(e) => setBill(e.target.value)} />
      </label>
      <p data-testid="tip">Tip: $0.00</p>
      <p data-testid="total">Total: $0.00</p>
      <p data-testid="per-person">Per person: $0.00</p>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'starts empty with a 15% tip for one person',
        code: `const { getByLabelText, getByTestId } = render({});
expect(getByLabelText('Bill').value).toBe('');
expect(getByLabelText('Tip').value).toBe('15');
expect(Array.from(getByLabelText('Tip').querySelectorAll('option')).map((o) => o.textContent)).toEqual(['10%', '15%', '20%']);
expect(getByLabelText('People').value).toBe('1');
expect(getByTestId('tip').textContent).toBe('Tip: $0.00');
expect(getByTestId('total').textContent).toBe('Total: $0.00');
expect(getByTestId('per-person').textContent).toBe('Per person: $0.00');`,
      },
      {
        name: 'calculates the tip and the total as the bill is typed',
        code: `const { getByLabelText, getByTestId } = render({});
fireEvent.change(getByLabelText('Bill'), '80');
expect(getByTestId('tip').textContent).toBe('Tip: $12.00');
expect(getByTestId('total').textContent).toBe('Total: $92.00');
expect(getByTestId('per-person').textContent).toBe('Per person: $92.00');`,
      },
      {
        name: 'recalculates when the tip percentage changes',
        code: `const { getByLabelText, getByTestId } = render({});
fireEvent.change(getByLabelText('Bill'), '45.50');
fireEvent.change(getByLabelText('Tip'), '20');
expect(getByTestId('tip').textContent).toBe('Tip: $9.10');
expect(getByTestId('total').textContent).toBe('Total: $54.60');
fireEvent.change(getByLabelText('Bill'), '60');
fireEvent.change(getByLabelText('Tip'), '10');
expect(getByTestId('tip').textContent).toBe('Tip: $6.00');
expect(getByTestId('total').textContent).toBe('Total: $66.00');`,
      },
      {
        name: 'splits the total between people',
        code: `const { getByLabelText, getByTestId } = render({});
fireEvent.change(getByLabelText('Bill'), '80');
fireEvent.change(getByLabelText('People'), '4');
expect(getByTestId('total').textContent).toBe('Total: $92.00');
expect(getByTestId('per-person').textContent).toBe('Per person: $23.00');`,
      },
      {
        name: 'treats an invalid or negative bill as zero',
        code: `const { getByLabelText, getByTestId } = render({});
for (const bad of ['abc', '-20', '12abc']) {
  fireEvent.change(getByLabelText('Bill'), bad);
  expect(getByTestId('tip').textContent).toBe('Tip: $0.00');
  expect(getByTestId('total').textContent).toBe('Total: $0.00');
  expect(getByTestId('per-person').textContent).toBe('Per person: $0.00');
}`,
      },
      {
        name: 'splits by one when the people count is invalid',
        code: `const { getByLabelText, getByTestId } = render({});
fireEvent.change(getByLabelText('Bill'), '50');
fireEvent.change(getByLabelText('Tip'), '20');
for (const bad of ['0', '', 'x', '-3']) {
  fireEvent.change(getByLabelText('People'), bad);
  expect(getByTestId('per-person').textContent).toBe('Per person: $60.00');
}
fireEvent.change(getByLabelText('People'), '3');
expect(getByTestId('per-person').textContent).toBe('Per person: $20.00');`,
      },
    ],
    hint: 'Store the raw strings from the three fields. Turn them into safe numbers at the top of the render (with fallbacks for `NaN`, negatives and zero people), then do the arithmetic.',
    explanation:
      'Form fields hold strings, and those strings are the state. The amounts are never stored: they are computed from the strings on each render, so they cannot go stale. ' +
      'The work is in making the inputs safe before doing arithmetic. `Number(\'abc\')` is `NaN`, and `NaN` spreads through every calculation until the screen shows `$NaN`. A people count of `0` gives `Infinity`. So each value gets a guard: the bill falls back to 0 unless it is a non-negative number, and the people count falls back to 1 unless it is at least 1. ' +
      'After that the maths is three lines, and `toFixed(2)` handles the formatting. Keeping the fields as text inputs with string state (rather than converting on change) also lets the user type intermediate values such as `45.` without the field fighting back.',
    solution: `import React, { useState } from 'react';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [percent, setPercent] = useState('15');
  const [people, setPeople] = useState('1');

  const billValue = Number(bill);
  const safeBill = Number.isNaN(billValue) || billValue < 0 ? 0 : billValue;
  const peopleValue = Number(people);
  const safePeople = Number.isNaN(peopleValue) || peopleValue < 1 ? 1 : peopleValue;

  const tip = (safeBill * Number(percent)) / 100;
  const total = safeBill + tip;
  const perPerson = total / safePeople;

  return (
    <div>
      <label>
        Bill <input type="text" inputMode="decimal" value={bill} onChange={(e) => setBill(e.target.value)} />
      </label>{' '}
      <label>
        Tip{' '}
        <select value={percent} onChange={(e) => setPercent(e.target.value)}>
          <option value="10">10%</option>
          <option value="15">15%</option>
          <option value="20">20%</option>
        </select>
      </label>{' '}
      <label>
        People <input type="text" inputMode="numeric" value={people} onChange={(e) => setPeople(e.target.value)} />
      </label>
      <p data-testid="tip">Tip: \${tip.toFixed(2)}</p>
      <p data-testid="total">Total: \${total.toFixed(2)}</p>
      <p data-testid="per-person">Per person: \${perPerson.toFixed(2)}</p>
    </div>
  );
}
`,
  },
];
