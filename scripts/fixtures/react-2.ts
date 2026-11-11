export { problems } from '../../src/data/more/react-2';

// Plausible WRONG implementations: each must fail at least one test of its problem.
export const traps: Record<string, string> = {
  // truthiness check: a sale price of 0 is treated as "no sale"
  'react-price-tag-sale': `
function PriceTag({ price, salePrice, currency = '$' }) {
  const format = (cents) => currency + (cents / 100).toFixed(2);
  if (!salePrice || salePrice >= price) return <span data-testid="price">{format(price)}</span>;
  const percent = Math.round(((price - salePrice) / price) * 100);
  return (
    <span>
      <strong data-testid="price">{format(salePrice)}</strong>
      <s data-testid="original">{format(price)}</s>
      <em data-testid="savings">Save {percent}%</em>
    </span>
  );
}
`,
  // never clamps the value
  'react-progress-meter': `
function ProgressBar({ value, max = 100, label }) {
  const percent = Math.round((value / max) * 100);
  const status = value === 0 ? 'Not started' : value >= max ? 'Complete' : 'In progress';
  return (
    <div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <div data-testid="fill" style={{ width: Math.min(100, Math.max(0, percent)) + '%' }} />
      </div>
      <span data-testid="percent">{percent}%</span>
      <span data-testid="status">{status}</span>
    </div>
  );
}
`,
  // separator after every item, including the last
  'react-breadcrumb-trail': `
function Breadcrumbs({ items }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index === items.length - 1 ? <span aria-current="page">{item.label}</span> : <a href={item.href}>{item.label}</a>}
          <span aria-hidden="true">/</span>
        </Fragment>
      ))}
    </nav>
  );
}
`,
  // counts direct children instead of files at every depth
  'react-recursive-file-tree': `
function Folder({ node }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{node.name}</button>
      <span data-testid={'count-' + node.name}>({node.children.length})</span>
      {open && node.children.length === 0 && <p data-testid="empty">Empty folder</p>}
      {open && node.children.length > 0 && <TreeList nodes={node.children} />}
    </li>
  );
}
function TreeList({ nodes }) {
  return (
    <ul>
      {nodes.map((node) => Array.isArray(node.children)
        ? <Folder key={node.name} node={node} />
        : <li key={node.name} data-testid="file">{node.name}</li>)}
    </ul>
  );
}
function FileTree({ nodes }) {
  return <TreeList nodes={nodes} />;
}
`,
  // >= instead of >: text exactly at the limit gets truncated
  'react-read-more-toggle': `
function ReadMore({ text, limit = 80 }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length >= limit;
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
};
