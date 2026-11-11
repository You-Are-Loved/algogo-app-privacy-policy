export { problems } from '../../src/data/more/react-3';

export const traps: Record<string, string> = {
  'react-network-status-badge': `import React, { useState, useEffect, useRef } from 'react';

export default function NetworkBadge({ initialOnline = true, onChange }) {
  const [online, setOnline] = useState(initialOnline);
  const onlineRef = useRef(initialOnline);

  useEffect(() => {
    function update(next) {
      if (onlineRef.current === next) return;
      onlineRef.current = next;
      setOnline(next);
      if (onChange) onChange(next);
    }
    // Bug: listeners are never removed.
    window.addEventListener('online', () => update(true));
    window.addEventListener('offline', () => update(false));
  }, []);

  return (
    <div>
      <p data-testid="status">{online ? 'Online' : 'Offline'}</p>
      {!online && <p role="alert">You are offline. Changes will sync later.</p>}
    </div>
  );
}
`,
  'react-store-cart-badge': `import React, { useState, useEffect } from 'react';

export default function CartBadge({ store }) {
  const [snapshot, setSnapshot] = useState(() => store.getState());

  // Bug: subscribes to the first store only and never unsubscribes.
  useEffect(() => {
    store.subscribe(() => {
      setSnapshot(store.getState());
    });
  }, []);

  const items = snapshot.items;
  return (
    <div>
      <span data-testid="count">{items.length}</span>
      {items.length === 0 ? <p>Cart is empty</p> : <p>{'Last added: ' + items[items.length - 1]}</p>}
    </div>
  );
}
`,
  'react-global-keyboard-shortcuts': `import React, { useState, useEffect } from 'react';

export default function ShortcutList({ items, onSelect }) {
  const [index, setIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Bug: the listener is attached once and keeps the index from the first render.
  useEffect(() => {
    function onKeyDown(event) {
      const tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (event.key === 'j' && index < items.length - 1) {
        setIndex(index + 1);
        if (onSelect) onSelect(items[index + 1]);
      } else if (event.key === 'k' && index > 0) {
        setIndex(index - 1);
        if (onSelect) onSelect(items[index - 1]);
      } else if (event.key === '?') setShowHelp((shown) => !shown);
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
  'react-previous-price-trend': `import React, { useRef, useEffect } from 'react';

// Bug: the textbook usePrevious tracks the previous RENDER, not the previous distinct value.
function usePreviousDistinct(value) {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
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
  'react-media-query-layout': `import React, { useState } from 'react';

// Bug: reads the query once and never listens for changes.
export default function ResponsiveNav({ matchMedia }) {
  const [isMobile] = useState(() => matchMedia('(max-width: 600px)').matches);
  return <p data-testid="layout">{isMobile ? 'Mobile layout' : 'Desktop layout'}</p>;
}
`,
};
