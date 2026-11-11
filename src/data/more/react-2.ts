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
    statement: `Build \`QuantityPicker({ min = 1, max = 10, initial })\`, a quantity control with two buttons and a field you can type in. \`initial\` defaults to \`min\` and is always within \`min\` to \`max\`.

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
    statement: `Build \`ShowMoreList({ items, step = 3 })\`, where \`items\` is an array of unique strings.

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

  {
    id: 'react-topping-picker-limit',
    number: 66,
    title: 'Checkbox Group with a Maximum',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`ToppingPicker({ options, max = 3, basePrice = 0, onChange })\`. \`options\` is an array of \`{ id, label, price }\`; the prices and \`basePrice\` are whole numbers of cents. \`onChange\` is optional.

- One checkbox per option, in order, all unchecked at first. Each sits in a \`<label>\` whose text is the option label followed by its price in brackets, exactly like \`Mushrooms (+$1.50)\`.
- \`<p data-testid="summary">\` reads \`N of {max} selected\`, for example \`2 of 3 selected\`.
- \`<p data-testid="total">\` reads \`Total: $X.XX\`: \`basePrice\` plus the prices of the checked options, in dollars with two decimals.
- Once \`max\` options are checked, every **unchecked** checkbox is disabled. The checked ones stay enabled so the user can untick them, which enables the others again.
- A button labelled \`Clear\` unticks everything. It is disabled while nothing is checked.
- Whenever the selection changes (a tick, an untick or Clear), call \`onChange(ids)\` if it was given, with the checked ids in the order of the \`options\` array, not in click order.`,
    componentName: 'ToppingPicker',
    starter: `import React, { useState } from 'react';

export default function ToppingPicker({ options, max = 3, basePrice = 0, onChange }) {
  // TODO: track the checked ids; derive the summary, the total and which boxes are disabled
  return (
    <div>
      {options.map((option) => (
        <label key={option.id} style={{ display: 'block' }}>
          <input type="checkbox" /> {option.label} (+\${(option.price / 100).toFixed(2)})
        </label>
      ))}
      <p data-testid="summary">0 of {max} selected</p>
      <p data-testid="total">Total: \${(basePrice / 100).toFixed(2)}</p>
      <button type="button" disabled>Clear</button>
    </div>
  );
}
`,
    previewProps: {
      options: [
        { id: 'mush', label: 'Mushrooms', price: 150 },
        { id: 'pep', label: 'Pepperoni', price: 200 },
        { id: 'oli', label: 'Olives', price: 100 },
        { id: 'ham', label: 'Ham', price: 250 },
      ],
      max: 2,
      basePrice: 900,
    },
    tests: [
      {
        name: 'starts with nothing selected and the base price',
        code: `const { getAllByRole, getByLabelText, getByRole, getByTestId } = render({ options: props.options, max: 3, basePrice: 900 });
expect(getAllByRole('checkbox')).toHaveLength(4);
expect(getAllByRole('checkbox').some((c) => c.checked)).toBe(false);
expect(getByLabelText('Mushrooms (+$1.50)')).toBeTruthy();
expect(getByLabelText('Ham (+$2.50)')).toBeTruthy();
expect(getByTestId('summary').textContent).toBe('0 of 3 selected');
expect(getByTestId('total').textContent).toBe('Total: $9.00');
expect(getByRole('button', { name: 'Clear' })).toBeDisabled();`,
      },
      {
        name: 'ticking and unticking updates the summary and the total',
        code: `const { getByLabelText, getByTestId } = render({ options: props.options, max: 3, basePrice: 900 });
fireEvent.click(getByLabelText('Pepperoni (+$2.00)'));
fireEvent.click(getByLabelText('Olives (+$1.00)'));
expect(getByLabelText('Pepperoni (+$2.00)').checked).toBe(true);
expect(getByTestId('summary').textContent).toBe('2 of 3 selected');
expect(getByTestId('total').textContent).toBe('Total: $12.00');
fireEvent.click(getByLabelText('Olives (+$1.00)'));
expect(getByLabelText('Olives (+$1.00)').checked).toBe(false);
expect(getByTestId('summary').textContent).toBe('1 of 3 selected');
expect(getByTestId('total').textContent).toBe('Total: $11.00');`,
      },
      {
        name: 'at the maximum only the unchecked boxes are disabled',
        code: `const { getByLabelText, getByTestId } = render({ options: props.options, max: 2, basePrice: 900 });
fireEvent.click(getByLabelText('Ham (+$2.50)'));
expect(getByLabelText('Olives (+$1.00)')).not.toBeDisabled();
fireEvent.click(getByLabelText('Mushrooms (+$1.50)'));
expect(getByTestId('summary').textContent).toBe('2 of 2 selected');
expect(getByLabelText('Pepperoni (+$2.00)')).toBeDisabled();
expect(getByLabelText('Olives (+$1.00)')).toBeDisabled();
expect(getByLabelText('Ham (+$2.50)')).not.toBeDisabled();
expect(getByLabelText('Mushrooms (+$1.50)')).not.toBeDisabled();
fireEvent.click(getByLabelText('Ham (+$2.50)'));
expect(getByLabelText('Pepperoni (+$2.00)')).not.toBeDisabled();
expect(getByLabelText('Olives (+$1.00)')).not.toBeDisabled();`,
      },
      {
        name: 'reports the checked ids in option order, not click order',
        code: `const calls = [];
const { getByLabelText } = render({ options: props.options, max: 3, onChange: (ids) => calls.push(ids.slice()) });
fireEvent.click(getByLabelText('Ham (+$2.50)'));
fireEvent.click(getByLabelText('Mushrooms (+$1.50)'));
fireEvent.click(getByLabelText('Olives (+$1.00)'));
fireEvent.click(getByLabelText('Mushrooms (+$1.50)'));
expect(calls).toEqual([['ham'], ['mush', 'ham'], ['mush', 'oli', 'ham'], ['oli', 'ham']]);`,
      },
      {
        name: 'Clear unticks everything',
        code: `const calls = [];
const { getAllByRole, getByLabelText, getByRole, getByTestId } = render({ options: props.options, max: 2, basePrice: 900, onChange: (ids) => calls.push(ids.slice()) });
fireEvent.click(getByLabelText('Pepperoni (+$2.00)'));
fireEvent.click(getByLabelText('Ham (+$2.50)'));
expect(getByRole('button', { name: 'Clear' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Clear' }));
expect(getAllByRole('checkbox').some((c) => c.checked)).toBe(false);
expect(getAllByRole('checkbox').some((c) => c.disabled)).toBe(false);
expect(getByTestId('summary').textContent).toBe('0 of 2 selected');
expect(getByTestId('total').textContent).toBe('Total: $9.00');
expect(getByRole('button', { name: 'Clear' })).toBeDisabled();
expect(calls[calls.length - 1]).toEqual([]);
expect(calls).toHaveLength(3);`,
      },
      {
        name: 'defaults to a maximum of 3 and a base price of 0',
        code: `const { getByLabelText, getByTestId } = render({ options: props.options });
expect(getByTestId('summary').textContent).toBe('0 of 3 selected');
expect(getByTestId('total').textContent).toBe('Total: $0.00');
fireEvent.click(getByLabelText('Mushrooms (+$1.50)'));
fireEvent.click(getByLabelText('Pepperoni (+$2.00)'));
expect(getByLabelText('Ham (+$2.50)')).not.toBeDisabled();
fireEvent.click(getByLabelText('Olives (+$1.00)'));
expect(getByLabelText('Ham (+$2.50)')).toBeDisabled();
expect(getByTestId('total').textContent).toBe('Total: $4.50');`,
      },
    ],
    hint: 'Store the checked ids. To keep them in option order, rebuild the list with `options.filter(...)` every time instead of pushing the clicked id onto the end.',
    explanation:
      'The state is the set of checked ids; the summary, the total and the disabled flags are all computed from it during render. A box is disabled when it is not checked and the limit has been reached, which automatically leaves the checked ones clickable. Disabling every box at the limit is the usual slip, and it traps the user with no way to change their mind. ' +
      'For the callback, order matters. Appending the clicked id (`[...selected, id]`) produces click order, so the parent receives `[ham, mush]` for one user and `[mush, ham]` for another with the same pizza. Rebuilding the list by filtering `options` gives a canonical order for free. ' +
      'Compute the next selection in the handler, then use that one value for both `setSelected` and `onChange`, so the parent is told exactly what will be rendered. Money stays in integer cents until it is formatted.',
    solution: `import React, { useState } from 'react';

const dollars = (cents) => '$' + (cents / 100).toFixed(2);

export default function ToppingPicker({ options, max = 3, basePrice = 0, onChange }) {
  const [selected, setSelected] = useState([]);

  const update = (next) => {
    setSelected(next);
    if (onChange) onChange(next);
  };

  const toggle = (id) => {
    const wasChecked = selected.includes(id);
    const next = options
      .map((option) => option.id)
      .filter((optionId) => (optionId === id ? !wasChecked : selected.includes(optionId)));
    update(next);
  };

  const full = selected.length >= max;
  const total = options.reduce(
    (sum, option) => (selected.includes(option.id) ? sum + option.price : sum),
    basePrice
  );

  return (
    <div>
      {options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <label key={option.id} style={{ display: 'block' }}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!checked && full}
              onChange={() => toggle(option.id)}
            />{' '}
            {option.label + ' (+' + dollars(option.price) + ')'}
          </label>
        );
      })}
      <p data-testid="summary">{selected.length} of {max} selected</p>
      <p data-testid="total">Total: {dollars(total)}</p>
      <button type="button" disabled={selected.length === 0} onClick={() => update([])}>
        Clear
      </button>
    </div>
  );
}
`,
  },

  {
    id: 'react-phone-input-mask',
    number: 67,
    title: 'Phone Number Input Mask',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`PhoneInput()\`, a controlled field that formats a 10-digit phone number while the user types. It takes no props.

- A text input labelled \`Phone\` with the placeholder \`(555) 123-4567\`. It starts empty.
- On every change, take the text of the field, keep only the digits 0-9 and keep at most the first 10 of them. The field then displays those digits formatted according to how many there are:
  - 0 digits: the empty string
  - 1 to 3 digits: an opening bracket and the digits, e.g. \`(55\`
  - 4 to 6 digits: e.g. \`(555) 1\` and \`(555) 123\`
  - 7 to 10 digits: e.g. \`(555) 123-4\` and \`(555) 123-4567\`
- \`<p data-testid="status">\` reads \`N/10 digits\` while the number is incomplete (for example \`3/10 digits\`) and \`Complete\` once there are 10 digits.

Store the digits, not the formatted text.`,
    componentName: 'PhoneInput',
    starter: `import React, { useState } from 'react';

export default function PhoneInput() {
  const [value, setValue] = useState('');

  // TODO: keep only digits (max 10) and display them as (555) 123-4567

  return (
    <div>
      <label>
        Phone{' '}
        <input type="text" placeholder="(555) 123-4567" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>
      <p data-testid="status">0/10 digits</p>
    </div>
  );
}
`,
    previewProps: {},
    tests: [
      {
        name: 'formats the number step by step',
        code: `const { getByLabelText } = render({});
const input = getByLabelText('Phone');
expect(input.value).toBe('');
expect(input.getAttribute('placeholder')).toBe('(555) 123-4567');
const cases = [['5', '(5'], ['555', '(555'], ['5551', '(555) 1'], ['555123', '(555) 123'], ['5551234', '(555) 123-4'], ['555123456', '(555) 123-456']];
for (const [typed, shown] of cases) {
  fireEvent.change(input, typed);
  expect(input.value).toBe(shown);
}`,
      },
      {
        name: 'a full number is formatted and reported as complete',
        code: `const { getByLabelText, getByTestId } = render({});
fireEvent.change(getByLabelText('Phone'), '5551234567');
expect(getByLabelText('Phone').value).toBe('(555) 123-4567');
expect(getByTestId('status').textContent).toBe('Complete');`,
      },
      {
        name: 'drops everything that is not a digit',
        code: `const { getByLabelText, getByTestId } = render({});
const input = getByLabelText('Phone');
fireEvent.change(input, '555.123.4567');
expect(input.value).toBe('(555) 123-4567');
fireEvent.change(input, '+1 (415) 555');
expect(input.value).toBe('(141) 555-5');
fireEvent.change(input, 'abc');
expect(input.value).toBe('');
expect(getByTestId('status').textContent).toBe('0/10 digits');`,
      },
      {
        name: 'ignores digits after the tenth',
        code: `const { getByLabelText, getByTestId } = render({});
const input = getByLabelText('Phone');
fireEvent.change(input, '55512345678999');
expect(input.value).toBe('(555) 123-4567');
expect(getByTestId('status').textContent).toBe('Complete');
fireEvent.change(input, '(555) 123-45670');
expect(input.value).toBe('(555) 123-4567');`,
      },
      {
        name: 'copes with deleting back through the punctuation',
        code: `const { getByLabelText } = render({});
const input = getByLabelText('Phone');
fireEvent.change(input, '(555) 123-45');
expect(input.value).toBe('(555) 123-45');
fireEvent.change(input, '(555) 123-');
expect(input.value).toBe('(555) 123');
fireEvent.change(input, '(555) ');
expect(input.value).toBe('(555');
fireEvent.change(input, '(');
expect(input.value).toBe('');`,
      },
      {
        name: 'counts the digits typed so far',
        code: `const { getByLabelText, getByTestId } = render({});
const input = getByLabelText('Phone');
expect(getByTestId('status').textContent).toBe('0/10 digits');
fireEvent.change(input, '555');
expect(getByTestId('status').textContent).toBe('3/10 digits');
fireEvent.change(input, '(555) 123-456');
expect(getByTestId('status').textContent).toBe('9/10 digits');
fireEvent.change(input, '(555) 123-4567');
expect(getByTestId('status').textContent).toBe('Complete');
fireEvent.change(input, '55512');
expect(getByTestId('status').textContent).toBe('5/10 digits');`,
      },
    ],
    hint: 'Keep the raw digits in state: `e.target.value.replace(/[^0-9]/g, \'\').slice(0, 10)`. A separate `format(digits)` function builds the display string from slices of it.',
    explanation:
      'A mask is easiest when the state is the clean value (digits only) and the formatted string is derived from it for display. The change handler strips every non-digit from whatever is in the field, including the punctuation the component added itself, and truncates to ten digits. Because the handler always starts from the full text of the field, typing, pasting and deleting all go through the same path. ' +
      'The formatter is three slices: the area code, the next three digits and the last four, with each piece of punctuation added only when there are digits to go after it. Returning the empty string for zero digits matters: a lone `(` in an empty field cannot be deleted by the user, since the next change would add it straight back. ' +
      'Forgetting `slice(0, 10)` lets extra digits spill onto the end of the last group. Storing the formatted text instead of the digits works until you need the real number, for example to count digits or submit it, and then you have to strip it all over again.',
    solution: `import React, { useState } from 'react';

function format(digits) {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '(' + digits;
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
}

export default function PhoneInput() {
  const [digits, setDigits] = useState('');

  const handleChange = (e) => {
    setDigits(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
  };

  return (
    <div>
      <label>
        Phone{' '}
        <input type="text" inputMode="tel" placeholder="(555) 123-4567" value={format(digits)} onChange={handleChange} />
      </label>
      <p data-testid="status">{digits.length === 10 ? 'Complete' : digits.length + '/10 digits'}</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-password-rule-checklist',
    number: 68,
    title: 'Live Password Checklist',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`PasswordSetup({ onSubmit })\`, a new-password form with a live checklist.

- Two inputs of \`type="password"\` labelled \`Password\` and \`Confirm password\`, both empty at first.
- Four rules, each rendered as an \`<li>\` with \`data-testid="rule-{key}"\`, \`data-met="true"\` or \`"false"\`, and this text:
  - \`rule-length\`: \`At least 8 characters\`
  - \`rule-digit\`: \`Contains a number\` (a digit 0-9)
  - \`rule-upper\`: \`Contains an uppercase letter\` (A-Z)
  - \`rule-match\`: \`Passwords match\`, met only when the two fields are equal **and** the password is not empty
- \`data-met\` is up to date after every keystroke.
- \`<p data-testid="strength">\` reads \`Strength: Weak\` when none or one of the first three rules is met, \`Strength: Fair\` when two are met and \`Strength: Strong\` when all three are met. The match rule does not count towards strength.
- A button labelled \`Save password\` is disabled until all four rules are met. Clicking it calls \`onSubmit(password)\` once.`,
    componentName: 'PasswordSetup',
    starter: `import React, { useState } from 'react';

export default function PasswordSetup({ onSubmit }) {
  const [password, setPassword] = useState('');

  // TODO: add the confirm field, derive the four rules and the strength, gate the button

  return (
    <div>
      <label>
        Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <ul>
        <li data-testid="rule-length" data-met="false">At least 8 characters</li>
      </ul>
      <button type="button" disabled>Save password</button>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: 'return { onSubmit: () => {} };',
    tests: [
      {
        name: 'starts with every rule unmet and the button disabled',
        code: `const { getByLabelText, getByTestId, getByRole } = render({ onSubmit: () => {} });
expect(getByLabelText('Password').value).toBe('');
expect(getByLabelText('Password').getAttribute('type')).toBe('password');
expect(getByLabelText('Confirm password').getAttribute('type')).toBe('password');
expect(getByTestId('rule-length').textContent).toBe('At least 8 characters');
expect(getByTestId('rule-digit').textContent).toBe('Contains a number');
expect(getByTestId('rule-upper').textContent).toBe('Contains an uppercase letter');
expect(getByTestId('rule-match').textContent).toBe('Passwords match');
for (const key of ['length', 'digit', 'upper', 'match']) expect(getByTestId('rule-' + key)).toHaveAttribute('data-met', 'false');
expect(getByTestId('strength').textContent).toBe('Strength: Weak');
expect(getByRole('button', { name: 'Save password' })).toBeDisabled();`,
      },
      {
        name: 'the rules and the strength update as the password is typed',
        code: `const { getByLabelText, getByTestId } = render({ onSubmit: () => {} });
const met = () => ['length', 'digit', 'upper'].map((key) => getByTestId('rule-' + key).getAttribute('data-met'));
fireEvent.change(getByLabelText('Password'), 'abcdefgh');
expect(met()).toEqual(['true', 'false', 'false']);
expect(getByTestId('strength').textContent).toBe('Strength: Weak');
fireEvent.change(getByLabelText('Password'), 'abcdefg1');
expect(met()).toEqual(['true', 'true', 'false']);
expect(getByTestId('strength').textContent).toBe('Strength: Fair');
fireEvent.change(getByLabelText('Password'), 'Abcdefg1');
expect(met()).toEqual(['true', 'true', 'true']);
expect(getByTestId('strength').textContent).toBe('Strength: Strong');
fireEvent.change(getByLabelText('Password'), 'A1');
expect(met()).toEqual(['false', 'true', 'true']);
expect(getByTestId('strength').textContent).toBe('Strength: Fair');
fireEvent.change(getByLabelText('Password'), 'abcdefg');
expect(met()).toEqual(['false', 'false', 'false']);`,
      },
      {
        name: 'the match rule needs equal, non-empty passwords',
        code: `const { getByLabelText, getByTestId } = render({ onSubmit: () => {} });
const match = () => getByTestId('rule-match').getAttribute('data-met');
expect(match()).toBe('false');
fireEvent.change(getByLabelText('Password'), 'Abcdefg1');
fireEvent.change(getByLabelText('Confirm password'), 'Abcdefg');
expect(match()).toBe('false');
fireEvent.change(getByLabelText('Confirm password'), 'Abcdefg1');
expect(match()).toBe('true');
fireEvent.change(getByLabelText('Password'), 'Abcdefg12');
expect(match()).toBe('false');
fireEvent.change(getByLabelText('Password'), '');
fireEvent.change(getByLabelText('Confirm password'), '');
expect(match()).toBe('false');`,
      },
      {
        name: 'the button is enabled only when all four rules are met',
        code: `const { getByLabelText, getByRole, getByTestId } = render({ onSubmit: () => {} });
const button = () => getByRole('button', { name: 'Save password' });
fireEvent.change(getByLabelText('Password'), 'abc');
fireEvent.change(getByLabelText('Confirm password'), 'abc');
expect(getByTestId('rule-match')).toHaveAttribute('data-met', 'true');
expect(button()).toBeDisabled();
fireEvent.change(getByLabelText('Password'), 'Abcdefg1');
expect(button()).toBeDisabled();
fireEvent.change(getByLabelText('Confirm password'), 'Abcdefg1');
expect(button()).not.toBeDisabled();
fireEvent.change(getByLabelText('Confirm password'), 'Abcdefg1x');
expect(button()).toBeDisabled();`,
      },
      {
        name: 'Save password hands the password to onSubmit',
        code: `const calls = [];
const { getByLabelText, getByRole } = render({ onSubmit: (pw) => calls.push(pw) });
fireEvent.change(getByLabelText('Password'), 'Tr1ckyPass');
fireEvent.change(getByLabelText('Confirm password'), 'Tr1ckyPass');
expect(calls).toEqual([]);
fireEvent.click(getByRole('button', { name: 'Save password' }));
expect(calls).toEqual(['Tr1ckyPass']);`,
      },
    ],
    hint: 'State is just the two strings. Build an object of four booleans during render and derive the strength and the disabled flag from it.',
    explanation:
      'Validation state is derived state. The two strings are the only things the user can change, so they are the only `useState` values; the four rule flags are plain booleans computed from them on each render (`password.length >= 8`, two regular-expression tests and an equality check). Keeping flags in state and updating them in handlers leads to a checklist that lags one keystroke behind or forgets to update when the other field changes. ' +
      'The match rule has a trap: two empty fields are equal, so `password === confirm` alone lights up the rule before the user has typed anything. It needs the extra `password !== \'\'` condition. ' +
      'Strength counts only the three content rules, and the button is disabled unless every flag is true. Because all of that is recomputed from the same two strings, editing the password after confirming it immediately un-meets the match rule and disables the button again.',
    solution: `import React, { useState } from 'react';

export default function PasswordSetup({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const rules = [
    { key: 'length', text: 'At least 8 characters', met: password.length >= 8 },
    { key: 'digit', text: 'Contains a number', met: /[0-9]/.test(password) },
    { key: 'upper', text: 'Contains an uppercase letter', met: /[A-Z]/.test(password) },
    { key: 'match', text: 'Passwords match', met: password !== '' && password === confirm },
  ];
  const score = rules.slice(0, 3).filter((rule) => rule.met).length;
  const strength = score === 3 ? 'Strong' : score === 2 ? 'Fair' : 'Weak';
  const allMet = rules.every((rule) => rule.met);

  return (
    <div>
      <label style={{ display: 'block' }}>
        Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <label style={{ display: 'block' }}>
        Confirm password <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      <ul>
        {rules.map((rule) => (
          <li
            key={rule.key}
            data-testid={'rule-' + rule.key}
            data-met={rule.met ? 'true' : 'false'}
            style={{ color: rule.met ? 'green' : 'gray' }}
          >
            {rule.text}
          </li>
        ))}
      </ul>
      <p data-testid="strength">Strength: {strength}</p>
      <button type="button" disabled={!allMet} onClick={() => onSubmit(password)}>
        Save password
      </button>
    </div>
  );
}
`,
  },

  {
    id: 'react-dynamic-invite-fields',
    number: 69,
    title: 'Dynamic Email Fields',
    difficulty: 'Medium',
    topic: 'Forms',
    statement: `Build \`InviteForm({ onSubmit, max = 5 })\`, a form with a growing list of email fields.

- Render a \`<form>\`. It starts with one empty text input. The inputs have the \`aria-label\`s \`Email 1\`, \`Email 2\` and so on, by position.
- Each input has a button with \`aria-label\` \`Remove email N\` (same numbering). It removes that row: the rows after it move up and are renumbered, and every remaining row keeps the text typed into it. While there is only one row, its remove button is disabled.
- A button labelled \`Add another\` appends an empty row. It is disabled once there are \`max\` rows.
- A submit button labelled \`Send invites\`, inside the form.
- On submit, prevent the default page reload, then collect the values that are not empty after trimming, trimmed, in row order:
  - if there is at least one, call \`onSubmit(emails)\` and make sure no alert is shown;
  - if there is none, do not call \`onSubmit\`, and show \`<p role="alert">Add at least one email</p>\`.
- Only \`Send invites\` may submit the form: give the add and remove buttons \`type="button"\`.`,
    componentName: 'InviteForm',
    starter: `import React, { useState } from 'react';

export default function InviteForm({ onSubmit, max = 5 }) {
  const [email, setEmail] = useState('');

  // TODO: turn the single field into a list of rows that can grow and shrink

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit([email]); }}>
      <input type="text" aria-label="Email 1" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="button" aria-label="Remove email 1" disabled>Remove</button>
      <button type="button">Add another</button>
      <button type="submit">Send invites</button>
    </form>
  );
}
`,
    previewProps: { max: 4 },
    previewSetup: 'return { onSubmit: () => {} };',
    tests: [
      {
        name: 'starts with a single empty row that cannot be removed',
        code: `const { getAllByRole, getByRole } = render({ onSubmit: () => {} });
const inputs = getAllByRole('textbox');
expect(inputs).toHaveLength(1);
expect(inputs[0]).toHaveAttribute('aria-label', 'Email 1');
expect(inputs[0].value).toBe('');
expect(getByRole('button', { name: 'Remove email 1' })).toBeDisabled();
expect(getByRole('button', { name: 'Add another' })).not.toBeDisabled();`,
      },
      {
        name: 'Add another appends rows up to the maximum without submitting',
        code: `const calls = [];
const { getAllByRole, getByRole, queryByRole } = render({ onSubmit: (emails) => calls.push(emails), max: 3 });
fireEvent.click(getByRole('button', { name: 'Add another' }));
expect(getAllByRole('textbox').map((i) => i.getAttribute('aria-label'))).toEqual(['Email 1', 'Email 2']);
expect(getByRole('button', { name: 'Remove email 1' })).not.toBeDisabled();
expect(getByRole('button', { name: 'Add another' })).not.toBeDisabled();
fireEvent.click(getByRole('button', { name: 'Add another' }));
expect(getAllByRole('textbox').map((i) => i.getAttribute('aria-label'))).toEqual(['Email 1', 'Email 2', 'Email 3']);
expect(getByRole('button', { name: 'Add another' })).toBeDisabled();
expect(calls).toEqual([]);
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'removing a row keeps the text of the other rows',
        code: `const { getAllByRole, getByRole, getByLabelText, queryByRole } = render({ onSubmit: () => {} });
fireEvent.click(getByRole('button', { name: 'Add another' }));
fireEvent.click(getByRole('button', { name: 'Add another' }));
fireEvent.change(getByLabelText('Email 1'), 'a@x.com');
fireEvent.change(getByLabelText('Email 2'), 'b@x.com');
fireEvent.change(getByLabelText('Email 3'), 'c@x.com');
fireEvent.click(getByRole('button', { name: 'Remove email 2' }));
expect(getAllByRole('textbox').map((i) => i.value)).toEqual(['a@x.com', 'c@x.com']);
expect(getAllByRole('textbox').map((i) => i.getAttribute('aria-label'))).toEqual(['Email 1', 'Email 2']);
expect(queryByRole('button', { name: 'Remove email 3' })).toBeNull();
fireEvent.click(getByRole('button', { name: 'Remove email 1' }));
expect(getAllByRole('textbox').map((i) => i.value)).toEqual(['c@x.com']);
expect(getByRole('button', { name: 'Remove email 1' })).toBeDisabled();
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'submits the trimmed, non-empty emails in row order',
        code: `const calls = [];
const { getByRole, getByLabelText, queryByRole } = render({ onSubmit: (emails) => calls.push(emails) });
fireEvent.click(getByRole('button', { name: 'Add another' }));
fireEvent.click(getByRole('button', { name: 'Add another' }));
fireEvent.change(getByLabelText('Email 1'), '  zoe@x.com ');
fireEvent.change(getByLabelText('Email 2'), '   ');
fireEvent.change(getByLabelText('Email 3'), 'ada@x.com');
fireEvent.submit(getByRole('button', { name: 'Send invites' }));
expect(calls).toEqual([['zoe@x.com', 'ada@x.com']]);
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'shows an alert instead of submitting when every field is blank',
        code: `const calls = [];
const { getByRole, getByLabelText, queryByRole } = render({ onSubmit: (emails) => calls.push(emails) });
expect(queryByRole('alert')).toBeNull();
fireEvent.change(getByLabelText('Email 1'), '   ');
fireEvent.submit(getByRole('button', { name: 'Send invites' }));
expect(calls).toEqual([]);
expect(getByRole('alert').textContent).toBe('Add at least one email');
fireEvent.change(getByLabelText('Email 1'), 'kai@x.com');
fireEvent.submit(getByRole('button', { name: 'Send invites' }));
expect(calls).toEqual([['kai@x.com']]);
expect(queryByRole('alert')).toBeNull();`,
      },
    ],
    hint: 'Keep an array of row objects, each with its own generated `id` and `value`. Use the id as the React key and remove rows with `filter`.',
    explanation:
      'A dynamic field list is an array in state with one entry per row. Each entry needs a stable identity that is independent of its position, so the rows are objects `{ id, value }` with an id taken from a counter kept in a ref. The labels and numbering come from the index at render time, but the React key is the id. ' +
      'Adding a row appends a new object; typing maps over the array and replaces one object; removing filters by id. Removing by the wrong thing is the common bug here: dropping the last element (`slice(0, -1)`) because "the list got shorter" throws away the wrong row\'s text. ' +
      'Buttons inside a form default to `type="submit"`, so the add and remove buttons must be `type="button"` or every click would also submit the form. ' +
      'The submit handler calls `preventDefault`, derives the cleaned list with `map(trim)` and `filter(Boolean)`, and either reports it or raises the alert. The alert flag is the only extra state.',
    solution: `import React, { useRef, useState } from 'react';

export default function InviteForm({ onSubmit, max = 5 }) {
  const nextId = useRef(1);
  const [rows, setRows] = useState([{ id: 0, value: '' }]);
  const [showAlert, setShowAlert] = useState(false);

  const addRow = () => {
    setRows([...rows, { id: nextId.current, value: '' }]);
    nextId.current += 1;
  };
  const changeRow = (id, value) => setRows(rows.map((row) => (row.id === id ? { ...row, value } : row)));
  const removeRow = (id) => setRows(rows.filter((row) => row.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    const emails = rows.map((row) => row.value.trim()).filter(Boolean);
    if (emails.length === 0) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    onSubmit(emails);
  };

  return (
    <form onSubmit={handleSubmit}>
      {rows.map((row, index) => (
        <div key={row.id} style={{ marginBottom: 4 }}>
          <input
            type="text"
            aria-label={'Email ' + (index + 1)}
            value={row.value}
            onChange={(e) => changeRow(row.id, e.target.value)}
          />{' '}
          <button
            type="button"
            aria-label={'Remove email ' + (index + 1)}
            disabled={rows.length === 1}
            onClick={() => removeRow(row.id)}
          >
            Remove
          </button>
        </div>
      ))}
      {showAlert && <p role="alert">Add at least one email</p>}
      <button type="button" disabled={rows.length >= max} onClick={addRow}>
        Add another
      </button>{' '}
      <button type="submit">Send invites</button>
    </form>
  );
}
`,
  },

  {
    id: 'react-nested-checkbox-tree',
    number: 70,
    title: 'Nested Checkbox Tree',
    difficulty: 'Hard',
    topic: 'Forms',
    statement: `Build \`PermissionTree({ nodes, onChange })\`, a tree of checkboxes. Each node is \`{ id, label, children }\`. A node with a non-empty \`children\` array is a **group**; any other node is a **leaf** (a single permission). Groups can nest to any depth, labels are unique, and \`onChange\` is optional.

Only the leaves hold real state: the component remembers which leaves are checked. Nothing is checked at first.

- Render every node (the whole tree is always visible) as an \`<input type="checkbox">\` inside a \`<label>\` whose text is the node's label.
- A leaf checkbox is checked when its leaf is checked. Clicking it toggles that leaf.
- A group checkbox reflects the leaves below it, at any depth: checked when all of them are checked, unchecked when none is, and "mixed" when only some are. A mixed checkbox is not checked.
- Every checkbox also carries \`aria-checked\`: \`"true"\`, \`"false"\` or, for a mixed group, \`"mixed"\`.
- Clicking a group checkbox: if all of its leaves are checked, uncheck all of them; otherwise (none or some checked) check all of them.
- \`<p data-testid="summary">\` reads \`N of M permissions selected\`, counting leaves only.
- After every change call \`onChange(ids)\` (if given) with the ids of the checked leaves in tree order, that is, the order in which a depth-first walk from the top meets them.`,
    componentName: 'PermissionTree',
    starter: `import React, { useState } from 'react';

function TreeNode({ node }) {
  // TODO: derive this checkbox from the checked leaves below it, and recurse into children
  return (
    <li>
      <label>
        <input type="checkbox" aria-checked="false" /> {node.label}
      </label>
      {node.children && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function PermissionTree({ nodes, onChange }) {
  return (
    <div>
      <ul>
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </ul>
      <p data-testid="summary">0 of 0 permissions selected</p>
    </div>
  );
}
`,
    previewProps: {
      nodes: [
        {
          id: 'content',
          label: 'Content',
          children: [
            {
              id: 'posts',
              label: 'Posts',
              children: [
                { id: 'posts.read', label: 'Read posts' },
                { id: 'posts.write', label: 'Write posts' },
              ],
            },
            { id: 'comments', label: 'Moderate comments' },
          ],
        },
        {
          id: 'billing',
          label: 'Billing',
          children: [
            { id: 'invoices', label: 'View invoices' },
            { id: 'refunds', label: 'Issue refunds' },
          ],
        },
      ],
    },
    tests: [
      {
        name: 'renders every node unchecked',
        code: `const { getAllByRole, getByLabelText, getByTestId } = render({ nodes: props.nodes });
const boxes = getAllByRole('checkbox');
expect(boxes).toHaveLength(8);
boxes.forEach((b) => { expect(b.checked).toBe(false); expect(b).toHaveAttribute('aria-checked', 'false'); });
expect(getByLabelText('Posts')).toBeTruthy();
expect(getByLabelText('Issue refunds')).toBeTruthy();
expect(getByTestId('summary').textContent).toBe('0 of 5 permissions selected');`,
      },
      {
        name: 'checking one leaf makes its ancestors mixed',
        code: `const { getByLabelText, getByTestId } = render({ nodes: props.nodes });
const state = (label) => getByLabelText(label).getAttribute('aria-checked');
fireEvent.click(getByLabelText('Read posts'));
expect(state('Read posts')).toBe('true');
expect(getByLabelText('Read posts').checked).toBe(true);
expect(state('Write posts')).toBe('false');
expect(state('Posts')).toBe('mixed');
expect(getByLabelText('Posts').checked).toBe(false);
expect(state('Content')).toBe('mixed');
expect(state('Billing')).toBe('false');
expect(getByTestId('summary').textContent).toBe('1 of 5 permissions selected');`,
      },
      {
        name: 'a group becomes checked when all its leaves are checked',
        code: `const { getByLabelText } = render({ nodes: props.nodes });
const state = (label) => getByLabelText(label).getAttribute('aria-checked');
fireEvent.click(getByLabelText('Read posts'));
fireEvent.click(getByLabelText('Write posts'));
expect(state('Posts')).toBe('true');
expect(getByLabelText('Posts').checked).toBe(true);
expect(state('Content')).toBe('mixed');
fireEvent.click(getByLabelText('Moderate comments'));
expect(state('Content')).toBe('true');
expect(getByLabelText('Content').checked).toBe(true);
fireEvent.click(getByLabelText('Write posts'));
expect(state('Posts')).toBe('mixed');
expect(state('Content')).toBe('mixed');
expect(getByLabelText('Content').checked).toBe(false);`,
      },
      {
        name: 'clicking a group checks or unchecks every leaf below it',
        code: `const { getByLabelText, getByTestId } = render({ nodes: props.nodes });
const state = (label) => getByLabelText(label).getAttribute('aria-checked');
fireEvent.click(getByLabelText('Content'));
for (const label of ['Content', 'Posts', 'Read posts', 'Write posts', 'Moderate comments']) expect(state(label)).toBe('true');
for (const label of ['Billing', 'View invoices', 'Issue refunds']) expect(state(label)).toBe('false');
expect(getByTestId('summary').textContent).toBe('3 of 5 permissions selected');
fireEvent.click(getByLabelText('Content'));
for (const label of ['Content', 'Posts', 'Read posts', 'Write posts', 'Moderate comments']) expect(state(label)).toBe('false');
expect(getByTestId('summary').textContent).toBe('0 of 5 permissions selected');`,
      },
      {
        name: 'clicking a mixed group checks the rest',
        code: `const { getByLabelText, getByTestId } = render({ nodes: props.nodes });
const state = (label) => getByLabelText(label).getAttribute('aria-checked');
fireEvent.click(getByLabelText('View invoices'));
expect(state('Billing')).toBe('mixed');
fireEvent.click(getByLabelText('Billing'));
expect(state('Billing')).toBe('true');
expect(state('View invoices')).toBe('true');
expect(state('Issue refunds')).toBe('true');
fireEvent.click(getByLabelText('Write posts'));
fireEvent.click(getByLabelText('Content'));
expect(state('Read posts')).toBe('true');
expect(state('Moderate comments')).toBe('true');
expect(getByTestId('summary').textContent).toBe('5 of 5 permissions selected');`,
      },
      {
        name: 'reports the checked leaf ids in tree order',
        code: `const calls = [];
const { getByLabelText } = render({ nodes: props.nodes, onChange: (ids) => calls.push(ids.slice()) });
fireEvent.click(getByLabelText('Issue refunds'));
fireEvent.click(getByLabelText('Posts'));
fireEvent.click(getByLabelText('Read posts'));
fireEvent.click(getByLabelText('Moderate comments'));
expect(calls).toEqual([
  ['refunds'],
  ['posts.read', 'posts.write', 'refunds'],
  ['posts.write', 'refunds'],
  ['posts.write', 'comments', 'refunds'],
]);`,
      },
    ],
    hint: 'Write `leafIds(node)`, which returns the ids of all leaves under a node. Every checkbox, leaf or group, can then be described the same way: count how many of its leaf ids are checked.',
    explanation:
      'The insight is that groups have no state of their own. If each group stored its own checked flag, every click would have to update the flags of its ancestors and descendants by hand, and they drift apart as soon as one path is missed. Instead, state is only the list of checked leaf ids, and a group\'s appearance is computed from the leaves beneath it. ' +
      'A recursive helper `leafIds(node)` returns the leaf ids under any node (for a leaf, just its own id). With it, leaves and groups share one rule: count how many of those ids are checked, giving none, all or some, which maps to `false`, `true` or `mixed`. Clicking sets all of those ids to checked unless they all already are, which covers the leaf toggle and the three group cases in one line. ' +
      'The next state is built by filtering the full depth-first list of leaf ids, so the result is always in tree order and can be passed straight to `onChange`. ' +
      'The tree itself is rendered by a component that calls itself for each child. Each render walks the subtree of every node, O(n × depth) for n nodes, which is fine for a permissions tree.',
    solution: `import React, { useState } from 'react';

function leafIds(node) {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(leafIds);
}

function TreeNode({ node, checked, onSet }) {
  const ids = leafIds(node);
  const count = ids.filter((id) => checked.includes(id)).length;
  const state = count === 0 ? 'false' : count === ids.length ? 'true' : 'mixed';
  const isGroup = Boolean(node.children && node.children.length > 0);

  return (
    <li style={{ listStyle: 'none' }}>
      <label>
        <input
          type="checkbox"
          checked={state === 'true'}
          aria-checked={state}
          onChange={() => onSet(ids, state !== 'true')}
        />{' '}
        {node.label}
      </label>
      {isGroup && (
        <ul>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} checked={checked} onSet={onSet} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function PermissionTree({ nodes, onChange }) {
  const [checked, setChecked] = useState([]);
  const allLeaves = nodes.flatMap(leafIds);

  const setLeaves = (ids, on) => {
    const next = allLeaves.filter((id) => (ids.includes(id) ? on : checked.includes(id)));
    setChecked(next);
    if (onChange) onChange(next);
  };

  return (
    <div>
      <ul style={{ paddingLeft: 0 }}>
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} checked={checked} onSet={setLeaves} />
        ))}
      </ul>
      <p data-testid="summary">{checked.length} of {allLeaves.length} permissions selected</p>
    </div>
  );
}
`,
  },

  {
    id: 'react-onboarding-wizard',
    number: 71,
    title: 'Multi-Step Wizard',
    difficulty: 'Hard',
    topic: 'Forms',
    statement: `Build \`OnboardingWizard({ onComplete })\`, a three-step form. Only the current step is in the DOM, but everything the user entered is remembered while they move back and forth.

- \`<h2 data-testid="step">\` reads \`Step 1 of 3: Account\`, \`Step 2 of 3: Profile\` or \`Step 3 of 3: Review\`.
- **Step 1, Account**: a text input labelled \`Email\`, empty at first.
- **Step 2, Profile**: a text input labelled \`Display name\` (empty at first) and a \`<select>\` labelled \`Role\` with the options \`Developer\`, \`Designer\` and \`Manager\` (value and text are the same; \`Developer\` is selected at first).
- **Step 3, Review**: \`<p data-testid="review-email">\` reading \`Email: {email}\`, \`<p data-testid="review-name">\` reading \`Display name: {name}\` and \`<p data-testid="review-role">\` reading \`Role: {role}\`. The email and the name are shown trimmed.
- Buttons: \`Next\` on steps 1 and 2, \`Finish\` on step 3, and \`Back\` on steps 2 and 3. There is no \`Back\` button on step 1.
- \`Next\` validates the current step. Step 1 needs an email that contains \`@\`; otherwise stay on the step and show \`<p role="alert">Enter a valid email</p>\`. Step 2 needs a display name that is not empty after trimming; otherwise stay and show \`<p role="alert">Display name is required</p>\`. A successful \`Next\` removes the alert, and so does \`Back\`.
- \`Back\` never validates and never loses data.
- \`Finish\` calls \`onComplete({ email, name, role })\` with the trimmed email and name, then replaces the whole wizard with \`<p data-testid="done">All set, {name}!</p>\`: no heading, fields or buttons remain.`,
    componentName: 'OnboardingWizard',
    starter: `import React, { useState } from 'react';

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);

  // TODO: keep all the answers here in the parent, validate on Next, add Back, Review and Finish

  return (
    <div>
      <h2 data-testid="step">Step 1 of 3: Account</h2>
      <label>
        Email <input type="text" />
      </label>
      <button type="button" onClick={() => setStep(step + 1)}>Next</button>
    </div>
  );
}
`,
    previewProps: {},
    previewSetup: 'return { onComplete: () => {} };',
    tests: [
      {
        name: 'starts on the Account step with no Back button',
        code: `const { getByTestId, getByLabelText, getByRole, queryByRole, getAllByRole } = render({ onComplete: () => {} });
expect(getByTestId('step').textContent).toBe('Step 1 of 3: Account');
expect(getByLabelText('Email').value).toBe('');
expect(getAllByRole('textbox')).toHaveLength(1);
expect(queryByRole('combobox')).toBeNull();
expect(queryByRole('button', { name: 'Back' })).toBeNull();
expect(queryByRole('button', { name: 'Finish' })).toBeNull();
expect(getByRole('button', { name: 'Next' })).toBeTruthy();`,
      },
      {
        name: 'Next refuses an email without @ and continues once it is valid',
        code: `const { getByTestId, getByLabelText, getByRole, queryByRole } = render({ onComplete: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada.example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('step').textContent).toBe('Step 1 of 3: Account');
expect(getByRole('alert').textContent).toBe('Enter a valid email');
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('step').textContent).toBe('Step 2 of 3: Profile');
expect(queryByRole('alert')).toBeNull();
expect(getByLabelText('Display name').value).toBe('');
expect(getByLabelText('Role').value).toBe('Developer');
expect(Array.from(getByLabelText('Role').querySelectorAll('option')).map((o) => o.value)).toEqual(['Developer', 'Designer', 'Manager']);
expect(getByRole('button', { name: 'Back' })).toBeTruthy();`,
      },
      {
        name: 'Back and Next keep everything that was entered',
        code: `const { getByTestId, getByLabelText, getByRole } = render({ onComplete: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.change(getByLabelText('Display name'), 'Ada');
fireEvent.change(getByLabelText('Role'), 'Designer');
fireEvent.click(getByRole('button', { name: 'Back' }));
expect(getByTestId('step').textContent).toBe('Step 1 of 3: Account');
expect(getByLabelText('Email').value).toBe('ada@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByLabelText('Display name').value).toBe('Ada');
expect(getByLabelText('Role').value).toBe('Designer');`,
      },
      {
        name: 'the Profile step requires a display name, and Back clears the alert',
        code: `const { getByTestId, getByLabelText, getByRole, queryByRole } = render({ onComplete: () => {} });
fireEvent.change(getByLabelText('Email'), 'ada@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.change(getByLabelText('Display name'), '   ');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('step').textContent).toBe('Step 2 of 3: Profile');
expect(getByRole('alert').textContent).toBe('Display name is required');
fireEvent.click(getByRole('button', { name: 'Back' }));
expect(getByTestId('step').textContent).toBe('Step 1 of 3: Account');
expect(queryByRole('alert')).toBeNull();
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('step').textContent).toBe('Step 2 of 3: Profile');
expect(queryByRole('alert')).toBeNull();`,
      },
      {
        name: 'Review shows the trimmed answers and Finish reports them once',
        code: `const calls = [];
const { getByTestId, queryByTestId, getByLabelText, getByRole, queryByRole } = render({ onComplete: (data) => calls.push(data) });
fireEvent.change(getByLabelText('Email'), ' ada@example.com ');
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.change(getByLabelText('Display name'), '  Ada L ');
fireEvent.change(getByLabelText('Role'), 'Manager');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('step').textContent).toBe('Step 3 of 3: Review');
expect(queryByRole('textbox')).toBeNull();
expect(queryByRole('button', { name: 'Next' })).toBeNull();
expect(getByTestId('review-email').textContent).toBe('Email: ada@example.com');
expect(getByTestId('review-name').textContent).toBe('Display name: Ada L');
expect(getByTestId('review-role').textContent).toBe('Role: Manager');
expect(calls).toEqual([]);
fireEvent.click(getByRole('button', { name: 'Finish' }));
expect(calls).toEqual([{ email: 'ada@example.com', name: 'Ada L', role: 'Manager' }]);
expect(getByTestId('done').textContent).toBe('All set, Ada L!');
expect(queryByTestId('step')).toBeNull();
expect(queryByRole('button')).toBeNull();`,
      },
      {
        name: 'answers can be changed after going back from Review',
        code: `const calls = [];
const { getByTestId, getByLabelText, getByRole } = render({ onComplete: (data) => calls.push(data) });
fireEvent.change(getByLabelText('Email'), 'kai@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.change(getByLabelText('Display name'), 'Kai');
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('review-role').textContent).toBe('Role: Developer');
fireEvent.click(getByRole('button', { name: 'Back' }));
expect(getByLabelText('Display name').value).toBe('Kai');
fireEvent.change(getByLabelText('Role'), 'Designer');
fireEvent.click(getByRole('button', { name: 'Back' }));
expect(getByLabelText('Email').value).toBe('kai@example.com');
fireEvent.click(getByRole('button', { name: 'Next' }));
fireEvent.click(getByRole('button', { name: 'Next' }));
expect(getByTestId('review-role').textContent).toBe('Role: Designer');
fireEvent.click(getByRole('button', { name: 'Finish' }));
expect(calls).toEqual([{ email: 'kai@example.com', name: 'Kai', role: 'Designer' }]);`,
      },
    ],
    hint: 'Lift every field into the top-level component as one `form` object, next to a `step` number. Steps then come and go without taking their values with them.',
    explanation:
      'A wizard unmounts the fields of every step except the current one. Anything stored inside a step, whether as local `useState` or in uncontrolled inputs, is destroyed when that step leaves the screen, so pressing Back shows empty fields. The fix is to lift the data: one `form` object and a `step` number live in the wizard itself, and each step is just controlled inputs reading from and writing to that object. ' +
      'Navigation is then simple. `Next` runs the validation for the current step and either sets an error message or clears it and increments the step. `Back` decrements and clears the error without validating, because the user should never be trapped on a step by its own validation. ' +
      'The review step and the final payload both use the trimmed values, computed once. A `done` flag switches to the confirmation after `onComplete` has been called, so the callback cannot fire twice. ' +
      'With more steps or fields the same shape scales well as a reducer, but two or three `useState` calls are enough here.',
    solution: `import React, { useState } from 'react';

const TITLES = ['Account', 'Profile', 'Review'];
const ROLES = ['Developer', 'Designer', 'Manager'];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', name: '', role: 'Developer' });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const email = form.email.trim();
  const name = form.name.trim();
  const setField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const next = () => {
    if (step === 1 && !email.includes('@')) return setError('Enter a valid email');
    if (step === 2 && name === '') return setError('Display name is required');
    setError('');
    setStep(step + 1);
  };

  const back = () => {
    setError('');
    setStep(step - 1);
  };

  const finish = () => {
    onComplete({ email, name, role: form.role });
    setDone(true);
  };

  if (done) return <p data-testid="done">All set, {name}!</p>;

  return (
    <div>
      <h2 data-testid="step">Step {step} of 3: {TITLES[step - 1]}</h2>

      {step === 1 && (
        <label>
          Email <input type="text" value={form.email} onChange={setField('email')} />
        </label>
      )}

      {step === 2 && (
        <div>
          <label>
            Display name <input type="text" value={form.name} onChange={setField('name')} />
          </label>{' '}
          <label>
            Role{' '}
            <select value={form.role} onChange={setField('role')}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 3 && (
        <div>
          <p data-testid="review-email">Email: {email}</p>
          <p data-testid="review-name">Display name: {name}</p>
          <p data-testid="review-role">Role: {form.role}</p>
        </div>
      )}

      {error && <p role="alert">{error}</p>}

      <div style={{ marginTop: 8 }}>
        {step > 1 && <button type="button" onClick={back}>Back</button>}{' '}
        {step < 3 ? (
          <button type="button" onClick={next}>Next</button>
        ) : (
          <button type="button" onClick={finish}>Finish</button>
        )}
      </div>
    </div>
  );
}
`,
  },

  // ───────────────────────────── Composition & Patterns ─────────────────────────────
  {
    id: 'react-page-layout-slots',
    number: 72,
    title: 'Page Layout with Optional Slots',
    difficulty: 'Easy',
    topic: 'Composition & Patterns',
    statement: `Build \`PageLayout({ header, sidebar, footer, children })\`, a layout with optional slots. Each prop is anything React can render (text or elements), or is left out.

- The root element has \`data-testid="layout"\` and contains everything else.
- \`header\`, \`sidebar\` and \`footer\` are rendered inside elements with \`data-testid="layout-header"\`, \`"layout-sidebar"\` and \`"layout-footer"\`. A slot whose prop is missing (\`undefined\` or \`null\`) must not leave an empty wrapper behind: that element is not rendered at all.
- \`children\` is rendered inside an element with \`data-testid="layout-main"\`, which is always present. If there are no children (\`undefined\` or \`null\`), the main area shows the text \`Nothing to show\` instead.
- The root has \`data-columns="2"\` when a sidebar is given and \`data-columns="1"\` otherwise.`,
    componentName: 'PageLayout',
    starter: `import React from 'react';

export default function PageLayout({ header, sidebar, footer, children }) {
  // TODO: render each slot only when it was provided, plus the fallback and data-columns
  return (
    <div data-testid="layout">
      <main data-testid="layout-main">{children}</main>
    </div>
  );
}
`,
    previewProps: {
      header: 'Acme Admin',
      sidebar: 'Dashboard · Orders · Settings',
      footer: 'Signed in as ada@example.com',
      children: 'Welcome back! You have 3 new orders.',
    },
    tests: [
      {
        name: 'renders every slot it is given inside the root',
        code: `const { getByTestId } = render({
  header: React.createElement('h1', null, 'Dashboard'),
  sidebar: 'Menu',
  footer: React.createElement('small', null, 'v1.2'),
  children: React.createElement('p', null, 'Hello there'),
});
const root = getByTestId('layout');
expect(within(getByTestId('layout-header')).getByRole('heading').textContent).toBe('Dashboard');
expect(getByTestId('layout-sidebar').textContent).toBe('Menu');
expect(getByTestId('layout-footer').textContent).toBe('v1.2');
expect(getByTestId('layout-main').textContent).toBe('Hello there');
for (const id of ['layout-header', 'layout-sidebar', 'layout-footer', 'layout-main']) expect(root.contains(getByTestId(id))).toBe(true);`,
      },
      {
        name: 'leaves no wrapper behind for a missing slot',
        code: `const { getByTestId, queryByTestId } = render({ children: 'Just the page' });
expect(getByTestId('layout-main').textContent).toBe('Just the page');
expect(queryByTestId('layout-header')).toBeNull();
expect(queryByTestId('layout-sidebar')).toBeNull();
expect(queryByTestId('layout-footer')).toBeNull();`,
      },
      {
        name: 'treats null like a missing slot',
        code: `const { getByTestId, queryByTestId } = render({ header: null, sidebar: null, footer: 'Footer text', children: 'Body' });
expect(queryByTestId('layout-header')).toBeNull();
expect(queryByTestId('layout-sidebar')).toBeNull();
expect(getByTestId('layout-footer').textContent).toBe('Footer text');
expect(getByTestId('layout')).toHaveAttribute('data-columns', '1');`,
      },
      {
        name: 'reports one or two columns depending on the sidebar',
        code: `const { getByTestId, queryByTestId, rerender } = render({ children: 'Body' });
expect(getByTestId('layout')).toHaveAttribute('data-columns', '1');
rerender({ sidebar: React.createElement('nav', null, 'Links'), children: 'Body' });
expect(getByTestId('layout')).toHaveAttribute('data-columns', '2');
expect(getByTestId('layout-sidebar').textContent).toBe('Links');
rerender({ header: 'Top', children: 'Body' });
expect(getByTestId('layout')).toHaveAttribute('data-columns', '1');
expect(queryByTestId('layout-sidebar')).toBeNull();
expect(getByTestId('layout-header').textContent).toBe('Top');`,
      },
      {
        name: 'shows a fallback when there are no children',
        code: `const { getByTestId, rerender } = render({ header: 'Top' });
expect(getByTestId('layout-main').textContent).toBe('Nothing to show');
rerender({ header: 'Top', children: null });
expect(getByTestId('layout-main').textContent).toBe('Nothing to show');
rerender({ header: 'Top', children: React.createElement('p', null, 'Real content') });
expect(getByTestId('layout-main').textContent).toBe('Real content');`,
      },
    ],
    hint: 'Elements are values, so a slot is just a prop you place in JSX. Guard each wrapper with `header != null && (...)`; the loose `!= null` covers both `undefined` and `null`.',
    explanation:
      'React elements are ordinary values, so a component can accept several of them through named props and decide where each one goes. That is the "slots" pattern: the layout owns the structure, the caller owns the content, and neither needs to know the other\'s details. `children` is simply the default slot. ' +
      'The detail that matters is conditional wrappers. Writing `<aside>{sidebar}</aside>` unconditionally leaves an empty `<aside>` in the page when no sidebar is passed, which still takes up a grid column and is announced as a landmark. Each wrapper is therefore rendered only when its prop is present. ' +
      'Use `!= null` rather than a truthiness check for the test: it treats `undefined` and `null` as missing but still renders legitimate falsy content such as the number `0`. The same check drives `data-columns` and the main-area fallback (`children ?? \'Nothing to show\'`).',
    solution: `import React from 'react';

export default function PageLayout({ header, sidebar, footer, children }) {
  const hasSidebar = sidebar != null;

  return (
    <div data-testid="layout" data-columns={hasSidebar ? '2' : '1'}>
      {header != null && <header data-testid="layout-header">{header}</header>}
      <div style={{ display: 'flex', gap: 16 }}>
        {hasSidebar && <aside data-testid="layout-sidebar">{sidebar}</aside>}
        <main data-testid="layout-main">{children != null ? children : 'Nothing to show'}</main>
      </div>
      {footer != null && <footer data-testid="layout-footer">{footer}</footer>}
    </div>
  );
}
`,
  },

  {
    id: 'react-compound-steps',
    number: 73,
    title: 'Compound Steps Indicator',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Implement a small compound component, \`<Steps>\` with \`<Steps.Step>\`, and use it in \`CheckoutProgress({ steps, current })\`. \`steps\` is an array of unique titles and \`current\` is the zero-based index of the step the user is on (it equals \`steps.length\` when everything is finished).

\`CheckoutProgress\` is already written in the starter and should keep this shape:

\`<Steps current={current}>{steps.map((title) => <Steps.Step key={title} title={title} />)}</Steps>\`

Notice that a \`Steps.Step\` is only given its \`title\`. \`Steps\` has to work out each child's position and pass the extra information down itself, for example with \`Children.map\` and \`cloneElement\`.

Required output:
- \`Steps\` renders an \`<ol>\` containing the steps and a \`<p data-testid="steps-summary">\`.
- Each \`Steps.Step\` renders an \`<li>\` reading \`{n}. {title}\`, with n starting at 1, e.g. \`2. Shipping\`.
- Each \`<li>\` has \`data-status\`: \`complete\` for the steps before \`current\`, \`current\` for the step at \`current\` and \`upcoming\` for the steps after it.
- Only the current step's \`<li>\` has an \`aria-current\` attribute, with the value \`step\`.
- The summary reads \`Step X of Y\` (X is \`current + 1\`, Y is the number of steps), or \`All steps complete\` when \`current\` equals the number of steps.`,
    componentName: 'CheckoutProgress',
    starter: `import React, { Children, cloneElement } from 'react';

function Steps({ current, children }) {
  // TODO: give every child its index and status, and render the summary
  return (
    <div>
      <ol>{children}</ol>
      <p data-testid="steps-summary" />
    </div>
  );
}

Steps.Step = function Step({ title }) {
  // TODO: use the extra props injected by <Steps>
  return <li>{title}</li>;
};

export default function CheckoutProgress({ steps, current }) {
  return (
    <Steps current={current}>
      {steps.map((title) => (
        <Steps.Step key={title} title={title} />
      ))}
    </Steps>
  );
}
`,
    previewProps: { steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 1 },
    tests: [
      {
        name: 'numbers the steps from 1',
        code: `const { getAllByRole } = render({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 1 });
expect(getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1. Cart', '2. Shipping', '3. Payment', '4. Review']);`,
      },
      {
        name: 'marks steps as complete, current or upcoming',
        code: `const { getAllByRole, rerender } = render({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 1 });
const statuses = () => getAllByRole('listitem').map((li) => li.getAttribute('data-status'));
expect(statuses()).toEqual(['complete', 'current', 'upcoming', 'upcoming']);
rerender({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 0 });
expect(statuses()).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
rerender({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 3 });
expect(statuses()).toEqual(['complete', 'complete', 'complete', 'current']);`,
      },
      {
        name: 'only the current step carries aria-current',
        code: `const { container } = render({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 1 });
const marked = container.querySelectorAll('[aria-current]');
expect(marked).toHaveLength(1);
expect(marked[0].getAttribute('aria-current')).toBe('step');
expect(marked[0].textContent).toBe('2. Shipping');`,
      },
      {
        name: 'the summary follows the current step',
        code: `const { getByTestId, rerender } = render({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 1 });
expect(getByTestId('steps-summary').textContent).toBe('Step 2 of 4');
rerender({ steps: ['Cart', 'Shipping', 'Payment', 'Review'], current: 3 });
expect(getByTestId('steps-summary').textContent).toBe('Step 4 of 4');
rerender({ steps: ['Sign up', 'Verify'], current: 0 });
expect(getByTestId('steps-summary').textContent).toBe('Step 1 of 2');`,
      },
      {
        name: 'handles the finished state',
        code: `const { container, getAllByRole, getByTestId } = render({ steps: ['Cart', 'Shipping', 'Payment'], current: 3 });
expect(getAllByRole('listitem').map((li) => li.getAttribute('data-status'))).toEqual(['complete', 'complete', 'complete']);
expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
expect(getByTestId('steps-summary').textContent).toBe('All steps complete');`,
      },
    ],
    hint: '`Children.map(children, (child, index) => cloneElement(child, { index, status }))` returns copies of the children with extra props; `Children.count(children)` gives the total for the summary.',
    explanation:
      'In a compound component the parent and its sub-components cooperate behind the caller\'s back. The caller writes a flat, readable list of `<Steps.Step title=... />`, and the parent supplies what each child cannot know by itself: its position and how that compares with `current`. ' +
      'Here the parent does it with `Children.map` and `cloneElement`. `Children.map` walks the children with their index, and `cloneElement(child, extraProps)` returns a copy of each element with the injected `index` and `status` merged into its props. The `Step` then only formats what it receives. `Children.count` provides the total for the summary. ' +
      'The edge is the finished state: when `current` equals the number of steps there is no current step, so every status is `complete`, nothing has `aria-current`, and the summary must switch wording instead of printing `Step 4 of 3`. ' +
      '`cloneElement` only reaches direct children; if steps might be wrapped in other elements, sharing the data through context is the sturdier variant of the same pattern.',
    solution: `import React, { Children, cloneElement } from 'react';

function Steps({ current, children }) {
  const total = Children.count(children);
  return (
    <div>
      <ol style={{ listStyle: 'none', padding: 0 }}>
        {Children.map(children, (child, index) =>
          cloneElement(child, {
            index,
            status: index < current ? 'complete' : index === current ? 'current' : 'upcoming',
          })
        )}
      </ol>
      <p data-testid="steps-summary">
        {current >= total ? 'All steps complete' : 'Step ' + (current + 1) + ' of ' + total}
      </p>
    </div>
  );
}

Steps.Step = function Step({ title, index, status }) {
  return (
    <li
      data-status={status}
      aria-current={status === 'current' ? 'step' : undefined}
      style={{ fontWeight: status === 'current' ? 'bold' : 'normal', opacity: status === 'upcoming' ? 0.6 : 1 }}
    >
      {index + 1}. {title}
    </li>
  );
};

export default function CheckoutProgress({ steps, current }) {
  return (
    <Steps current={current}>
      {steps.map((title) => (
        <Steps.Step key={title} title={title} />
      ))}
    </Steps>
  );
}
`,
  },

  {
    id: 'react-headless-selection',
    number: 74,
    title: 'Headless Selection with a Child Function',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`Selection({ initial = [], max, children })\`, a headless multi-select. It owns the selection state but has no UI of its own: \`children\` is a **function** that receives the selection API and returns the UI.

Render \`<div data-testid="selection">\` containing whatever \`children(api)\` returns, and call it on every render. \`api\` is an object with:

- \`selected\`: an array of the selected ids in the order they were selected (it starts as \`initial\`). Hand the caller a new array whenever the selection changes; never mutate the previous one.
- \`count\`: the number of selected ids.
- \`isSelected(id)\`: \`true\` or \`false\`.
- \`isFull\`: \`true\` when \`max\` is given and \`count\` has reached it; otherwise \`false\`.
- \`toggle(id)\`: removes the id if it is selected. If it is not selected, appends it, unless the selection is full, in which case nothing happens.
- \`clear()\`: empties the selection.

Tests pass a \`children\` function built with \`React.createElement\`, for example one button per id whose \`aria-pressed\` comes from \`isSelected\`.`,
    componentName: 'Selection',
    starter: `import React, { useState } from 'react';

export default function Selection({ initial = [], max, children }) {
  const [selected, setSelected] = useState(initial);

  // TODO: make every part of the api real, then pass it to children
  const api = {
    selected,
    count: 0,
    isSelected: (id) => false,
    isFull: false,
    toggle: (id) => {},
    clear: () => {},
  };

  return <div data-testid="selection">{children(api)}</div>;
}
`,
    previewProps: { initial: ['tea'], max: 2 },
    previewSetup:
      "return { children: (api) => React.createElement('div', null, ['coffee', 'tea', 'juice', 'water'].map((id) => React.createElement('button', { key: id, type: 'button', 'aria-pressed': api.isSelected(id) ? 'true' : 'false', onClick: () => api.toggle(id), style: { fontWeight: api.isSelected(id) ? 'bold' : 'normal', marginRight: 6 } }, id)), React.createElement('p', null, 'Picked ' + api.count + ': ' + (api.selected.join(', ') || 'nothing') + (api.isFull ? ' (full)' : '')), React.createElement('button', { type: 'button', onClick: () => api.clear() }, 'Clear')) };",
    tests: [
      {
        name: 'renders what the child function returns, starting from initial',
        code: `const ui = (api) => React.createElement('div', null,
  ['a', 'b', 'c'].map((id) => React.createElement('button', { key: id, type: 'button', 'aria-pressed': api.isSelected(id) ? 'true' : 'false', onClick: () => api.toggle(id) }, id)),
  React.createElement('p', { 'data-testid': 'out' }, api.selected.join(',') + '|' + api.count + '|' + String(api.isFull)));
const first = render({ children: ui });
expect(first.getByTestId('selection').contains(first.getByTestId('out'))).toBe(true);
expect(first.getByTestId('out').textContent).toBe('|0|false');
first.unmount();
const second = render({ initial: ['b'], children: ui });
expect(second.getByTestId('out').textContent).toBe('b|1|false');
expect(second.getByRole('button', { name: 'b' })).toHaveAttribute('aria-pressed', 'true');
expect(second.getByRole('button', { name: 'a' })).toHaveAttribute('aria-pressed', 'false');`,
      },
      {
        name: 'toggle adds in selection order and removes',
        code: `const ui = (api) => React.createElement('div', null,
  ['a', 'b', 'c'].map((id) => React.createElement('button', { key: id, type: 'button', 'aria-pressed': api.isSelected(id) ? 'true' : 'false', onClick: () => api.toggle(id) }, id)),
  React.createElement('p', { 'data-testid': 'out' }, api.selected.join(',') + '|' + api.count + '|' + String(api.isFull)));
const { getByRole, getByTestId } = render({ children: ui });
fireEvent.click(getByRole('button', { name: 'c' }));
fireEvent.click(getByRole('button', { name: 'a' }));
expect(getByTestId('out').textContent).toBe('c,a|2|false');
expect(getByRole('button', { name: 'c' })).toHaveAttribute('aria-pressed', 'true');
expect(getByRole('button', { name: 'b' })).toHaveAttribute('aria-pressed', 'false');
fireEvent.click(getByRole('button', { name: 'c' }));
expect(getByTestId('out').textContent).toBe('a|1|false');
expect(getByRole('button', { name: 'c' })).toHaveAttribute('aria-pressed', 'false');
fireEvent.click(getByRole('button', { name: 'c' }));
expect(getByTestId('out').textContent).toBe('a,c|2|false');`,
      },
      {
        name: 'a full selection ignores additions but still allows removals',
        code: `const ui = (api) => React.createElement('div', null,
  ['a', 'b', 'c'].map((id) => React.createElement('button', { key: id, type: 'button', onClick: () => api.toggle(id) }, id)),
  React.createElement('p', { 'data-testid': 'out' }, api.selected.join(',') + '|' + api.count + '|' + String(api.isFull)));
const { getByRole, getByTestId } = render({ max: 2, children: ui });
fireEvent.click(getByRole('button', { name: 'a' }));
expect(getByTestId('out').textContent).toBe('a|1|false');
fireEvent.click(getByRole('button', { name: 'b' }));
expect(getByTestId('out').textContent).toBe('a,b|2|true');
fireEvent.click(getByRole('button', { name: 'c' }));
expect(getByTestId('out').textContent).toBe('a,b|2|true');
fireEvent.click(getByRole('button', { name: 'a' }));
expect(getByTestId('out').textContent).toBe('b|1|false');
fireEvent.click(getByRole('button', { name: 'c' }));
expect(getByTestId('out').textContent).toBe('b,c|2|true');`,
      },
      {
        name: 'without max the selection is never full',
        code: `const ui = (api) => React.createElement('div', null,
  ['a', 'b', 'c', 'd'].map((id) => React.createElement('button', { key: id, type: 'button', onClick: () => api.toggle(id) }, id)),
  React.createElement('p', { 'data-testid': 'out' }, api.selected.join(',') + '|' + api.count + '|' + String(api.isFull)));
const { getByRole, getByTestId } = render({ children: ui });
['d', 'c', 'b', 'a'].forEach((id) => fireEvent.click(getByRole('button', { name: id })));
expect(getByTestId('out').textContent).toBe('d,c,b,a|4|false');`,
      },
      {
        name: 'clear empties the selection',
        code: `const ui = (api) => React.createElement('div', null,
  React.createElement('button', { type: 'button', onClick: () => api.toggle('x') }, 'x'),
  React.createElement('button', { type: 'button', onClick: () => api.clear() }, 'Clear'),
  React.createElement('p', { 'data-testid': 'out' }, api.selected.join(',') + '|' + api.count + '|' + String(api.isFull)));
const { getByRole, getByTestId } = render({ initial: ['p', 'q'], max: 3, children: ui });
fireEvent.click(getByRole('button', { name: 'x' }));
expect(getByTestId('out').textContent).toBe('p,q,x|3|true');
fireEvent.click(getByRole('button', { name: 'Clear' }));
expect(getByTestId('out').textContent).toBe('|0|false');
fireEvent.click(getByRole('button', { name: 'x' }));
expect(getByTestId('out').textContent).toBe('x|1|false');`,
      },
      {
        name: 'hands out a new array instead of mutating the old one',
        code: `const seen = [];
const ui = (api) => { seen.push(api.selected); return React.createElement('button', { type: 'button', onClick: () => api.toggle('a') }, 'toggle ' + api.count); };
const { getByRole } = render({ children: ui });
const before = seen[seen.length - 1];
fireEvent.click(getByRole('button'));
expect(getByRole('button').textContent).toBe('toggle 1');
const after = seen[seen.length - 1];
expect(after).toEqual(['a']);
expect(before).toEqual([]);
expect(after === before).toBe(false);`,
      },
    ],
    hint: 'Keep the array in `useState` and always replace it: `[...selected, id]` to add and `selected.filter(...)` to remove. Then call `children({ selected, count, isSelected, isFull, toggle, clear })` inside the wrapper.',
    explanation:
      'A headless component separates behaviour from markup. `Selection` knows the rules (toggle, limit, clear) and exposes them as an object; the caller\'s function decides whether that becomes buttons, chips or checkboxes. Because `children` is called during every render with fresh values, the caller\'s UI is always in step with the state. ' +
      'The rule that makes it work is immutability. React decides whether to re-render by comparing the new state with the old one. `selected.push(id); setSelected(selected)` hands React the same array object it already has, so it skips the render and the screen never changes, even though the array did. Adding with spread and removing with `filter` produce new arrays, which both triggers the render and keeps every array the caller has already received unchanged. ' +
      '`toggle` checks membership first, so removing is always possible, and only then applies the limit to additions. `isFull` is derived (`max !== undefined && selected.length >= max`), not stored.',
    solution: `import React, { useState } from 'react';

export default function Selection({ initial = [], max, children }) {
  const [selected, setSelected] = useState(initial);

  const isFull = max !== undefined && selected.length >= max;
  const isSelected = (id) => selected.includes(id);

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((x) => x !== id));
    } else if (!isFull) {
      setSelected([...selected, id]);
    }
  };

  const clear = () => setSelected([]);

  return (
    <div data-testid="selection">
      {children({ selected, count: selected.length, isSelected, isFull, toggle, clear })}
    </div>
  );
}
`,
  },

  {
    id: 'react-controllable-segmented-control',
    number: 75,
    title: 'Controlled or Uncontrolled Segmented Control',
    difficulty: 'Medium',
    topic: 'Composition & Patterns',
    statement: `Build \`SegmentedControl({ options, value, defaultValue, onChange })\` so that it works both **controlled** and **uncontrolled**, the way a native \`<input>\` does. \`options\` is an array of unique strings; \`onChange\` is optional.

- Render one \`<button>\` per option whose text is the option. The selected option's button has \`aria-pressed="true"\`; all the others have \`aria-pressed="false"\`.
- **Controlled** (the \`value\` prop is not \`undefined\`): the selected option is always \`value\`. Clicking another option calls \`onChange(option)\` but must not change what is displayed. The display changes only when the parent passes a new \`value\`.
- **Uncontrolled** (\`value\` is \`undefined\`): the component keeps the selection in its own state, starting from \`defaultValue\`. If that is missing too, nothing is selected at first. Clicking an option selects it and calls \`onChange(option)\`. Later changes to the \`defaultValue\` prop are ignored.
- In both modes, clicking the option that is already selected does nothing and does not call \`onChange\`.`,
    componentName: 'SegmentedControl',
    starter: `import React, { useState } from 'react';

export default function SegmentedControl({ options, value, defaultValue, onChange }) {
  // TODO: support both modes. Controlled: show \`value\`. Uncontrolled: own state from \`defaultValue\`.
  return (
    <div role="group">
      {options.map((option) => (
        <button key={option} type="button" aria-pressed="false">
          {option}
        </button>
      ))}
    </div>
  );
}
`,
    previewProps: { options: ['Day', 'Week', 'Month'], defaultValue: 'Week' },
    tests: [
      {
        name: 'uncontrolled: starts from defaultValue and updates itself',
        code: `const calls = [];
const { getByRole } = render({ options: ['Day', 'Week', 'Month'], defaultValue: 'Week', onChange: (v) => calls.push(v) });
const pressed = (name) => getByRole('button', { name }).getAttribute('aria-pressed');
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['false', 'true', 'false']);
fireEvent.click(getByRole('button', { name: 'Month' }));
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['false', 'false', 'true']);
expect(calls).toEqual(['Month']);`,
      },
      {
        name: 'uncontrolled: works with no defaultValue and no onChange',
        code: `const { getByRole } = render({ options: ['Day', 'Week', 'Month'] });
const pressed = (name) => getByRole('button', { name }).getAttribute('aria-pressed');
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['false', 'false', 'false']);
fireEvent.click(getByRole('button', { name: 'Day' }));
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['true', 'false', 'false']);`,
      },
      {
        name: 'controlled: a click reports the option but does not change the display',
        code: `const calls = [];
const { getByRole } = render({ options: ['Day', 'Week', 'Month'], value: 'Day', onChange: (v) => calls.push(v) });
const pressed = (name) => getByRole('button', { name }).getAttribute('aria-pressed');
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['true', 'false', 'false']);
fireEvent.click(getByRole('button', { name: 'Month' }));
expect(calls).toEqual(['Month']);
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['true', 'false', 'false']);`,
      },
      {
        name: 'controlled: follows the value prop',
        code: `const calls = [];
const onChange = (v) => calls.push(v);
const { getByRole, rerender } = render({ options: ['Day', 'Week', 'Month'], value: 'Day', onChange });
const pressed = (name) => getByRole('button', { name }).getAttribute('aria-pressed');
fireEvent.click(getByRole('button', { name: 'Week' }));
rerender({ options: ['Day', 'Week', 'Month'], value: 'Month', onChange });
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['false', 'false', 'true']);
rerender({ options: ['Day', 'Week', 'Month'], value: 'Day', onChange });
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['true', 'false', 'false']);
expect(calls).toEqual(['Week']);`,
      },
      {
        name: 'clicking the selected option does not call onChange',
        code: `const calls = [];
const onChange = (v) => calls.push(v);
const first = render({ options: ['Day', 'Week'], defaultValue: 'Week', onChange });
fireEvent.click(first.getByRole('button', { name: 'Week' }));
expect(calls).toEqual([]);
fireEvent.click(first.getByRole('button', { name: 'Day' }));
fireEvent.click(first.getByRole('button', { name: 'Day' }));
expect(calls).toEqual(['Day']);
first.unmount();
const second = render({ options: ['Day', 'Week'], value: 'Day', onChange });
fireEvent.click(second.getByRole('button', { name: 'Day' }));
expect(calls).toEqual(['Day']);`,
      },
      {
        name: 'uncontrolled: later defaultValue changes are ignored',
        code: `const { getByRole, rerender } = render({ options: ['Day', 'Week', 'Month'], defaultValue: 'Day' });
const pressed = (name) => getByRole('button', { name }).getAttribute('aria-pressed');
rerender({ options: ['Day', 'Week', 'Month'], defaultValue: 'Month' });
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['true', 'false', 'false']);
fireEvent.click(getByRole('button', { name: 'Week' }));
rerender({ options: ['Day', 'Week', 'Month'], defaultValue: 'Month' });
expect([pressed('Day'), pressed('Week'), pressed('Month')]).toEqual(['false', 'true', 'false']);`,
      },
    ],
    hint: 'Compute `const isControlled = value !== undefined` and `const selected = isControlled ? value : internal`. In the click handler, update the internal state only when not controlled, and call `onChange` either way.',
    explanation:
      'This is the contract every native form element follows, and reusable components are expected to follow it too. The question to settle is who owns the state. If the parent passes `value`, the parent owns it: the component renders that value and only *asks* for a change through `onChange`. If not, the component owns it and `defaultValue` is merely the starting point. ' +
      'The implementation keeps an internal `useState(defaultValue)` in both cases but reads from it only when uncontrolled: `selected = isControlled ? value : internal`. The click handler updates the internal state only in uncontrolled mode and calls `onChange` in both. ' +
      'The classic mistake is `useState(value)`. That copies the prop once at mount, so the component then shows its own copy: a controlled parent that rejects a change sees the control change anyway, and later updates to `value` are ignored. ' +
      'Because `useState` reads its argument only on the first render, later `defaultValue` changes are ignored without any extra code, which is exactly how `<input defaultValue>` behaves.',
    solution: `import React, { useState } from 'react';

export default function SegmentedControl({ options, value, defaultValue, onChange }) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;

  const select = (option) => {
    if (option === selected) return;
    if (!isControlled) setInternal(option);
    if (onChange) onChange(option);
  };

  return (
    <div role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === selected}
          onClick={() => select(option)}
          style={{ fontWeight: option === selected ? 'bold' : 'normal' }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
`,
  },
];
