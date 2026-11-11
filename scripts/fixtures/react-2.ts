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

  // commits (and clamps) on every keystroke instead of on blur
  'react-quantity-picker-bounds': `
function QuantityPicker({ min = 1, max = 10, initial }) {
  const [quantity, setQuantity] = useState(initial === undefined ? min : initial);
  const set = (n) => setQuantity(Math.min(max, Math.max(min, n)));
  return (
    <div>
      <button type="button" aria-label="Decrease quantity" disabled={quantity <= min} onClick={() => set(quantity - 1)}>-</button>
      <input
        type="text"
        aria-label="Quantity"
        value={quantity}
        onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) set(n); }}
      />
      <button type="button" aria-label="Increase quantity" disabled={quantity >= max} onClick={() => set(quantity + 1)}>+</button>
      <p data-testid="committed">In cart: {quantity}</p>
    </div>
  );
}
`,
  // Backspace removes the last tag even while the input still has text
  'react-tag-input': `
function TagInput({ initialTags = [], max = 5 }) {
  const [tags, setTags] = useState(initialTags);
  const [text, setText] = useState('');
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const tag = text.trim().toLowerCase();
      if (tag === '' || tags.includes(tag)) return;
      setTags([...tags, tag]);
      setText('');
    } else if (e.key === 'Backspace') {
      setTags(tags.slice(0, -1));
    }
  };
  return (
    <div>
      <ul>
        {tags.map((tag) => (
          <li key={tag}>{tag} <button type="button" aria-label={'Remove ' + tag} onClick={() => setTags(tags.filter((t) => t !== tag))}>x</button></li>
        ))}
      </ul>
      <input placeholder="Add a tag" value={text} disabled={tags.length >= max} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} />
      <p data-testid="count">{tags.length}/{max}</p>
    </div>
  );
}
`,
  // edits the item in place while typing, so Cancel has nothing to discard
  'react-inline-edit-rows': `
function EditableList({ items: initialItems, onRename }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState(null);
  const rename = (id, name) => setItems(items.map((it) => (it.id === id ? { ...it, name } : it)));
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} data-testid={'row-' + item.id}>
          {item.id === editingId ? (
            <>
              <input type="text" aria-label="Name" value={item.name} onChange={(e) => rename(item.id, e.target.value)} />
              <button type="button" disabled={item.name.trim() === ''} onClick={() => { const n = item.name.trim(); rename(item.id, n); if (onRename) onRename(item.id, n); setEditingId(null); }}>Save</button>
              <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <span>{item.name}</span>
              <button type="button" aria-label={'Edit ' + item.name} onClick={() => setEditingId(item.id)}>Edit</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
`,
  // appends to the whole history: the redo entries are never discarded
  'react-undo-redo-history': `
function ColorHistory({ colors, initial, limit = 5 }) {
  const [state, setState] = useState({ history: [initial === undefined ? colors[0] : initial], index: 0 });
  const { history, index } = state;
  const current = history[index];
  const pick = (color) => {
    if (color === current) return;
    let next = history.concat(color);
    if (next.length > limit) next = next.slice(next.length - limit);
    setState({ history: next, index: next.length - 1 });
  };
  return (
    <div>
      {colors.map((color) => (
        <button key={color} type="button" aria-pressed={color === current} onClick={() => pick(color)}>{color}</button>
      ))}
      <p data-testid="current">Current: {current}</p>
      <p data-testid="position">Step {index + 1} of {history.length}</p>
      <button type="button" disabled={index === 0} onClick={() => setState({ history, index: index - 1 })}>Undo</button>
      <button type="button" disabled={index === history.length - 1} onClick={() => setState({ history, index: index + 1 })}>Redo</button>
    </div>
  );
}
`,
  // checks for a full board before checking for a winner
  'react-tic-tac-toe': `
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
function findWin(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return { winner: squares[a], line: [a, b, c] };
  }
  return null;
}
function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const win = findWin(squares);
  const filled = squares.filter(Boolean).length;
  const next = filled % 2 === 0 ? 'X' : 'O';
  const status = filled === 9 ? 'Draw' : win ? 'Winner: ' + win.winner : 'Next player: ' + next;
  const handleClick = (i) => {
    if (win || squares[i]) return;
    const copy = squares.slice();
    copy[i] = next;
    setSquares(copy);
  };
  return (
    <div>
      <p data-testid="status">{status}</p>
      {squares.map((value, i) => (
        <button key={i} type="button" aria-label={'Square ' + (i + 1)} data-winning={win && win.line.includes(i) ? 'true' : undefined} onClick={() => handleClick(i)}>{value}</button>
      ))}
      <button type="button" onClick={() => setSquares(Array(9).fill(null))}>Reset</button>
    </div>
  );
}
`,

  // never caps the visible count: the summary overshoots on the last click
  'react-show-more-list': `
function ShowMoreList({ items, step = 3 }) {
  const [count, setCount] = useState(step);
  if (items.length === 0) return <p>Nothing here yet</p>;
  const hidden = items.length - count;
  return (
    <div>
      <ul>{items.slice(0, count).map((item) => <li key={item}>{item}</li>)}</ul>
      <p data-testid="summary">Showing {count} of {items.length}</p>
      {hidden > 0 && <button type="button" onClick={() => setCount(count + step)}>Show more ({hidden})</button>}
    </div>
  );
}
`,
  // builds "high to low" by reversing "low to high", which also reverses the ties
  'react-job-board-filter-sort': `
function JobBoard({ jobs }) {
  const [team, setTeam] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const byTitle = (a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0);
  const teams = Array.from(new Set(jobs.map((job) => job.team))).sort();
  let visible = jobs.filter((job) => (team === 'all' || job.team === team) && (!remoteOnly || job.remote));
  if (sortBy === 'title') visible.sort(byTitle);
  else {
    visible.sort((a, b) => a.salary - b.salary || byTitle(a, b));
    if (sortBy === 'salary-desc') visible.reverse();
  }
  return (
    <div>
      <label>Team <select value={team} onChange={(e) => setTeam(e.target.value)}>
        <option value="all">All</option>
        {teams.map((name) => <option key={name} value={name}>{name}</option>)}
      </select></label>
      <label><input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} /> Remote only</label>
      <label>Sort by <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="title">Title</option>
        <option value="salary-desc">Salary: high to low</option>
        <option value="salary-asc">Salary: low to high</option>
      </select></label>
      {visible.length === 0 ? <p>No jobs match</p> : (
        <ul>{visible.map((job) => <li key={job.id}>{job.title + ' ($' + job.salary + 'k)'}</li>)}</ul>
      )}
      <p data-testid="count">Showing {visible.length} of {jobs.length}</p>
    </div>
  );
}
`,
  // dense ranking (1, 2, 2, 3) instead of competition ranking (1, 2, 2, 4)
  'react-leaderboard-ranks': `
function Leaderboard({ players, currentUser, top }) {
  if (players.length === 0) return <p>No scores yet</p>;
  const sorted = [...players].sort((a, b) => b.score - a.score || (a.name < b.name ? -1 : 1));
  let rank = 0;
  let last = null;
  const ranked = sorted.map((p) => {
    if (p.score !== last) { rank += 1; last = p.score; }
    return { ...p, rank };
  });
  let rows = top === undefined ? ranked : ranked.slice(0, top);
  const me = ranked.find((r) => r.name === currentUser);
  if (me && !rows.includes(me)) rows = [...rows, me];
  return (
    <ol>
      {rows.map((row) => (
        <li key={row.name} aria-current={row.name === currentUser ? 'true' : undefined}>{row.rank}. {row.name} - {row.score} pts</li>
      ))}
    </ol>
  );
}
`,
  // keeps two arrays and appends moved items, so columns follow move order
  'react-transfer-list': `
function TransferList({ items, initialChosen = [], onChange }) {
  const [left, setLeft] = useState(items.filter((i) => !initialChosen.includes(i.id)));
  const [right, setRight] = useState(items.filter((i) => initialChosen.includes(i.id)));
  const [checked, setChecked] = useState([]);
  const toggle = (id) => setChecked(checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id]);
  const isChecked = (item) => checked.includes(item.id);
  const toRight = () => {
    const moving = left.filter(isChecked);
    const next = [...right, ...moving];
    setLeft(left.filter((i) => !isChecked(i)));
    setRight(next);
    setChecked(checked.filter((id) => !moving.some((m) => m.id === id)));
    if (onChange) onChange(next.map((i) => i.id));
  };
  const toLeft = () => {
    const moving = right.filter(isChecked);
    const next = right.filter((i) => !isChecked(i));
    setLeft([...left, ...moving]);
    setRight(next);
    setChecked(checked.filter((id) => !moving.some((m) => m.id === id)));
    if (onChange) onChange(next.map((i) => i.id));
  };
  const column = (testId, title, list) => (
    <div data-testid={testId}>
      <h3>{title} ({list.length})</h3>
      <ul>
        {list.map((item) => (
          <li key={item.id}><label><input type="checkbox" checked={isChecked(item)} onChange={() => toggle(item.id)} /> {item.label}</label></li>
        ))}
      </ul>
    </div>
  );
  return (
    <div>
      {column('available', 'Available', left)}
      <button type="button" disabled={!left.some(isChecked)} onClick={toRight}>Move to chosen</button>
      <button type="button" disabled={!right.some(isChecked)} onClick={toLeft}>Move to available</button>
      {column('chosen', 'Chosen', right)}
    </div>
  );
}
`,
  // no guard on the people count: 0 people divides by zero
  'react-tip-calculator': `
function TipCalculator() {
  const [bill, setBill] = useState('');
  const [percent, setPercent] = useState('15');
  const [people, setPeople] = useState('1');
  const safeBill = Math.max(0, Number(bill) || 0);
  const tip = (safeBill * Number(percent)) / 100;
  const total = safeBill + tip;
  const perPerson = total / Number(people);
  return (
    <div>
      <label>Bill <input type="text" value={bill} onChange={(e) => setBill(e.target.value)} /></label>
      <label>Tip <select value={percent} onChange={(e) => setPercent(e.target.value)}>
        <option value="10">10%</option><option value="15">15%</option><option value="20">20%</option>
      </select></label>
      <label>People <input type="text" value={people} onChange={(e) => setPeople(e.target.value)} /></label>
      <p data-testid="tip">Tip: {'$' + tip.toFixed(2)}</p>
      <p data-testid="total">Total: {'$' + total.toFixed(2)}</p>
      <p data-testid="per-person">Per person: {'$' + perPerson.toFixed(2)}</p>
    </div>
  );
}
`,

  // appends the clicked id, so onChange reports click order
  'react-topping-picker-limit': `
function ToppingPicker({ options, max = 3, basePrice = 0, onChange }) {
  const [selected, setSelected] = useState([]);
  const dollars = (cents) => '$' + (cents / 100).toFixed(2);
  const update = (next) => { setSelected(next); if (onChange) onChange(next); };
  const toggle = (id) => update(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const full = selected.length >= max;
  const total = options.reduce((sum, o) => (selected.includes(o.id) ? sum + o.price : sum), basePrice);
  return (
    <div>
      {options.map((o) => (
        <label key={o.id} style={{ display: 'block' }}>
          <input type="checkbox" checked={selected.includes(o.id)} disabled={!selected.includes(o.id) && full} onChange={() => toggle(o.id)} /> {o.label + ' (+' + dollars(o.price) + ')'}
        </label>
      ))}
      <p data-testid="summary">{selected.length} of {max} selected</p>
      <p data-testid="total">Total: {dollars(total)}</p>
      <button type="button" disabled={selected.length === 0} onClick={() => update([])}>Clear</button>
    </div>
  );
}
`,
  // strips non-digits but never limits the number to ten digits
  'react-phone-input-mask': `
function format(digits) {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '(' + digits;
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
}
function PhoneInput() {
  const [digits, setDigits] = useState('');
  return (
    <div>
      <label>Phone <input type="text" placeholder="(555) 123-4567" value={format(digits)} onChange={(e) => setDigits(e.target.value.replace(/[^0-9]/g, ''))} /></label>
      <p data-testid="status">{digits.length >= 10 ? 'Complete' : digits.length + '/10 digits'}</p>
    </div>
  );
}
`,
  // two empty fields count as "matching"
  'react-password-rule-checklist': `
function PasswordSetup({ onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const rules = [
    { key: 'length', text: 'At least 8 characters', met: password.length >= 8 },
    { key: 'digit', text: 'Contains a number', met: /[0-9]/.test(password) },
    { key: 'upper', text: 'Contains an uppercase letter', met: /[A-Z]/.test(password) },
    { key: 'match', text: 'Passwords match', met: password === confirm },
  ];
  const score = rules.slice(0, 3).filter((r) => r.met).length;
  const strength = score === 3 ? 'Strong' : score === 2 ? 'Fair' : 'Weak';
  return (
    <div>
      <label>Password <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <label>Confirm password <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
      <ul>
        {rules.map((r) => <li key={r.key} data-testid={'rule-' + r.key} data-met={r.met ? 'true' : 'false'}>{r.text}</li>)}
      </ul>
      <p data-testid="strength">Strength: {strength}</p>
      <button type="button" disabled={!rules.every((r) => r.met)} onClick={() => onSubmit(password)}>Save password</button>
    </div>
  );
}
`,
  // "remove" always drops the last row
  'react-dynamic-invite-fields': `
function InviteForm({ onSubmit, max = 5 }) {
  const [values, setValues] = useState(['']);
  const [showAlert, setShowAlert] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    const emails = values.map((v) => v.trim()).filter(Boolean);
    if (emails.length === 0) { setShowAlert(true); return; }
    setShowAlert(false);
    onSubmit(emails);
  };
  return (
    <form onSubmit={handleSubmit}>
      {values.map((value, index) => (
        <div key={index}>
          <input type="text" aria-label={'Email ' + (index + 1)} value={value} onChange={(e) => setValues(values.map((v, i) => (i === index ? e.target.value : v)))} />
          <button type="button" aria-label={'Remove email ' + (index + 1)} disabled={values.length === 1} onClick={() => setValues(values.slice(0, -1))}>Remove</button>
        </div>
      ))}
      {showAlert && <p role="alert">Add at least one email</p>}
      <button type="button" disabled={values.length >= max} onClick={() => setValues([...values, ''])}>Add another</button>
      <button type="submit">Send invites</button>
    </form>
  );
}
`,
  // every node stores its own flag: groups are not derived from their leaves
  'react-nested-checkbox-tree': `
function allIds(node) {
  return [node.id].concat((node.children || []).flatMap(allIds));
}
function leafIds(node) {
  if (!node.children || node.children.length === 0) return [node.id];
  return node.children.flatMap(leafIds);
}
function TreeNode({ node, checked, onToggle }) {
  const on = checked.includes(node.id);
  return (
    <li>
      <label><input type="checkbox" checked={on} aria-checked={on ? 'true' : 'false'} onChange={() => onToggle(node, !on)} /> {node.label}</label>
      {node.children && node.children.length > 0 && (
        <ul>{node.children.map((child) => <TreeNode key={child.id} node={child} checked={checked} onToggle={onToggle} />)}</ul>
      )}
    </li>
  );
}
function PermissionTree({ nodes, onChange }) {
  const [checked, setChecked] = useState([]);
  const leaves = nodes.flatMap(leafIds);
  const toggle = (node, on) => {
    const ids = allIds(node);
    const next = on ? Array.from(new Set(checked.concat(ids))) : checked.filter((id) => !ids.includes(id));
    setChecked(next);
    if (onChange) onChange(leaves.filter((id) => next.includes(id)));
  };
  return (
    <div>
      <ul>{nodes.map((node) => <TreeNode key={node.id} node={node} checked={checked} onToggle={toggle} />)}</ul>
      <p data-testid="summary">{leaves.filter((id) => checked.includes(id)).length} of {leaves.length} permissions selected</p>
    </div>
  );
}
`,
};
