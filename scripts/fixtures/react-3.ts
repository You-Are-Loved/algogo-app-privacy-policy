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
  'react-stored-draft-hook': `import React, { useState } from 'react';

// Bug: stores and reads the raw string, no JSON.
function useStoredState(storage, key, initialValue) {
  const [value, setValueState] = useState(() => {
    const raw = storage.getItem(key);
    return raw === null ? initialValue : raw;
  });

  function setValue(next) {
    setValueState(next);
    storage.setItem(key, next);
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
  'react-autosave-steady-interval': `import React, { useState, useEffect } from 'react';

export default function AutosaveNote({ save, everyMs = 2000 }) {
  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');

  // Bug: depending on text restarts the interval on every keystroke.
  useEffect(() => {
    const id = setInterval(() => {
      if (text === savedText) return;
      save(text);
      setSavedText(text);
    }, everyMs);
    return () => clearInterval(id);
  }, [text, savedText, everyMs]);

  return (
    <div>
      <textarea aria-label="Note" value={text} onChange={(e) => setText(e.target.value)} />
      <p data-testid="status">{text === savedText ? 'All changes saved' : 'Unsaved changes'}</p>
    </div>
  );
}
`,
  'react-click-outside-menu': `import React, { useState, useEffect } from 'react';

export default function OptionsMenu({ options, onSelect, onDismiss }) {
  const [open, setOpen] = useState(false);

  // Bug: every document click counts as "outside", including clicks on the menu itself.
  useEffect(() => {
    if (!open) return undefined;
    function onDocumentClick(event) {
      if (event.target.closest('button, [role="menuitem"]')) return;
      setOpen(false);
      if (onDismiss) onDismiss();
    }
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [open, onDismiss]);

  function choose(option) {
    setOpen(false);
    if (onSelect) onSelect(option);
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button type="button" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen((o) => !o)}>Options</button>
      {open && (
        <ul role="menu" style={{ listStyle: 'none', margin: 0, padding: 8 }}>
          {options.map((option) => (
            <li key={option} role="menuitem" onClick={() => choose(option)}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
  'react-lazy-initial-scores': `import React, { useState } from 'react';

export default function ScoreBoard({ createInitialScores }) {
  // Bug: the initial value is recomputed on every render.
  const [scores, setScores] = useState(createInitialScores());

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
  'react-load-more-feed': `import React, { useState, useEffect } from 'react';

export default function PostFeed({ loadPage }) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [status, setStatus] = useState('loading');
  const [done, setDone] = useState(false);

  function fetchPage(at) {
    setStatus('loading');
    loadPage(at).then(
      (page) => {
        // Bug: replaces the list with the newest page.
        setPosts(page.items);
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
  'react-refresh-keep-stale': `import React, { useState, useEffect } from 'react';

export default function QuoteCard({ load }) {
  const [quote, setQuote] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);

  function run() {
    // Bug: throws the old quote away whenever a request starts.
    setQuote(null);
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
      <button type="button" disabled={busy} onClick={run}>{busy ? 'Refreshing...' : 'Refresh'}</button>
    </div>
  );
}
`,
  'react-optimistic-delete-rollback': `import React, { useState } from 'react';

export default function BookmarkList({ initialBookmarks, deleteBookmark }) {
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [failedTitle, setFailedTitle] = useState(null);

  function remove(bookmark) {
    // Bug: rolls back to a snapshot of the whole list.
    const snapshot = bookmarks;
    setFailedTitle(null);
    setBookmarks(bookmarks.filter((b) => b.id !== bookmark.id));
    deleteBookmark(bookmark.id).catch(() => {
      setBookmarks(snapshot);
      setFailedTitle(bookmark.title);
    });
  }

  return (
    <div>
      {failedTitle !== null && <p role="alert">{'Could not delete ' + failedTitle}</p>}
      <ul>
        {bookmarks.map((b) => (
          <li key={b.id}>
            <span data-testid="title">{b.title}</span>{' '}
            <button type="button" aria-label={'Delete ' + b.title} onClick={() => remove(b)}>Delete</button>
          </li>
        ))}
      </ul>
      {bookmarks.length === 0 && <p>No bookmarks</p>}
      <p data-testid="count">{'Bookmarks: ' + bookmarks.length}</p>
    </div>
  );
}
`,
  'react-abortable-city-search': `import React, { useState, useEffect } from 'react';

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
        // Bug: the rejection caused by our own abort is reported as a failure.
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
  'react-door-state-machine': `import React, { useState } from 'react';

export default function DoorControl({ initialState = 'closed' }) {
  const [door, setDoor] = useState(initialState);
  const [moves, setMoves] = useState(0);

  function go(next) {
    setDoor(next);
    setMoves((m) => m + 1);
  }

  // Bug: "Open" is allowed from any state that is not already open, including locked.
  return (
    <div>
      <p data-testid="state">{'Door is ' + door}</p>
      <button type="button" disabled={door === 'open'} onClick={() => go('open')}>Open</button>
      <button type="button" disabled={door !== 'open'} onClick={() => go('closed')}>Close</button>
      <button type="button" disabled={door !== 'closed'} onClick={() => go('locked')}>Lock</button>
      <button type="button" disabled={door !== 'locked'} onClick={() => go('closed')}>Unlock</button>
      <p data-testid="moves">{'Moves: ' + moves}</p>
    </div>
  );
}
`,
  'react-playlist-queue-reducer': `import React, { useReducer } from 'react';

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
      // Bug: the index is only clamped, never shifted when an earlier track is removed.
      const queue = state.queue.filter((id) => id !== action.id);
      return { queue, current: Math.min(state.current, queue.length - 1) };
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
  'react-locale-context-fallback': `import React, { createContext, useContext, useState } from 'react';

const LocaleContext = createContext(null);

// Bug: no fallback to English.
function useTranslate() {
  const { locale, messages } = useContext(LocaleContext);
  return (key) => {
    const text = (messages[locale] || {})[key];
    return text === undefined ? key : text;
  };
}

function Text({ as: Tag, id }) {
  const t = useTranslate();
  return <Tag data-testid={id}>{t(id)}</Tag>;
}

export default function LocalizedApp({ messages, initialLocale = 'en' }) {
  const [locale, setLocale] = useState(initialLocale);
  return (
    <LocaleContext.Provider value={{ locale, messages }}>
      {Object.keys(messages).map((code) => (
        <button key={code} type="button" aria-pressed={code === locale ? 'true' : 'false'} onClick={() => setLocale(code)}>{code}</button>
      ))}
      <Text as="h1" id="greeting" />
      <Text as="p" id="farewell" />
      <Text as="p" id="tagline" />
    </LocaleContext.Provider>
  );
}
`,
  'react-toast-queue-context': `import React, { useState, useEffect, useRef } from 'react';

export default function ToastDemo({ duration = 3000, maxVisible = 3 }) {
  const [text, setText] = useState('');
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  // Bug: one shared timer that restarts whenever the list changes.
  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const timer = setTimeout(() => setToasts((list) => list.slice(1)), duration);
    return () => clearTimeout(timer);
  }, [toasts, duration]);

  function show() {
    const message = text.trim();
    if (message === '') return;
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message }].slice(-maxVisible));
  }

  return (
    <div>
      <input aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} />
      <button type="button" onClick={show}>Show toast</button>
      <p data-testid="toast-count">{'Toasts: ' + toasts.length}</p>
      {toasts.map((toast) => (
        <div role="status" key={toast.id}>
          <span data-testid="toast-message">{toast.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setToasts((list) => list.filter((t) => t.id !== toast.id))}>x</button>
        </div>
      ))}
    </div>
  );
}
`,
  'react-reveal-search-focus': `import React, { useState, useRef, useEffect } from 'react';

export default function SearchReveal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  // Bug: also runs on mount, so the Search button grabs focus as soon as the page loads.
  useEffect(() => {
    if (open) inputRef.current.focus();
    else buttonRef.current.focus();
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
  'react-one-time-code-boxes': `import React, { useState, useRef, useEffect } from 'react';

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
    // Bug: moves back but leaves the previous digit in place.
    if (event.key !== 'Backspace' || digits[index] !== '' || index === 0) return;
    inputs.current[index - 1].focus();
  }

  return (
    <div>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(node) => { inputs.current[i] = node; }}
          aria-label={'Digit ' + (i + 1)}
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
      <p data-testid="code">{'Code: ' + digits.map((d) => d || '_').join('')}</p>
    </div>
  );
}
`,
  'react-imperative-handle-pin-field': `import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const PinField = forwardRef(function PinField({ label }, ref) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Bug: the handle is created once, so getValue keeps the value from the first render.
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
  }), []);

  return (
    <div>
      <input ref={inputRef} aria-label={label} value={value} onChange={(e) => setValue(e.target.value)} />
      <p data-testid="length">{'Length: ' + value.length}</p>
    </div>
  );
});

export default PinField;
`,
  'react-memo-rows-render-spy': `import React, { useState, memo } from 'react';

const GuestRow = memo(function GuestRow({ guest, onToggle, onRowRender }) {
  onRowRender(guest.id);
  return (
    <li>
      <span data-testid={'status-' + guest.id}>{guest.name + ': ' + (guest.attending ? 'attending' : 'not attending')}</span>{' '}
      <button type="button" aria-label={'Toggle ' + guest.name} onClick={onToggle}>Toggle</button>
    </li>
  );
});

export default function GuestList({ initialGuests, onRowRender }) {
  const [guests, setGuests] = useState(initialGuests);
  const [note, setNote] = useState('');

  function toggle(id) {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, attending: !g.attending } : g)));
  }

  const attending = guests.filter((g) => g.attending).length;

  // Bug: memo is defeated by a new inline callback for every row on every render.
  return (
    <div>
      <input aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      <ul>
        {guests.map((guest) => (
          <GuestRow key={guest.id} guest={guest} onToggle={() => toggle(guest.id)} onRowRender={onRowRender} />
        ))}
      </ul>
      <p data-testid="summary">{'Attending: ' + attending + ' of ' + guests.length}</p>
    </div>
  );
}
`,
  'react-roving-tabindex-menu': `import React, { useState, useRef } from 'react';

export default function ActionMenu({ actions, onAction }) {
  const firstEnabled = actions.findIndex((action) => !action.disabled);
  const [active, setActive] = useState(firstEnabled);
  const nodes = useRef([]);

  function moveTo(index) {
    setActive(index);
    if (nodes.current[index]) nodes.current[index].focus();
  }

  // Bug: steps through every index, so focus can land on a disabled item.
  function onKeyDown(event) {
    const count = actions.length;
    if (event.key === 'ArrowDown') moveTo((active + 1) % count);
    else if (event.key === 'ArrowUp') moveTo((active - 1 + count) % count);
    else if (event.key === 'Home') moveTo(0);
    else if (event.key === 'End') moveTo(count - 1);
  }

  function onClick(action, index) {
    if (action.disabled) return;
    setActive(index);
    if (onAction) onAction(action.label);
  }

  return (
    <div role="menu" onKeyDown={onKeyDown}>
      {actions.map((action, i) => (
        <button
          key={action.label}
          ref={(node) => { nodes.current[i] = node; }}
          type="button"
          role="menuitem"
          tabIndex={i === active ? 0 : -1}
          aria-disabled={action.disabled ? 'true' : undefined}
          onClick={() => onClick(action, i)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
`,
  'react-listbox-active-descendant': `import React, { useState, useId } from 'react';

export default function OptionListbox({ label, options, onChange }) {
  const baseId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const optionId = (index) => baseId + '-option-' + index;

  // Bug: one variable for both "active" and "selected", so arrowing selects.
  function go(index) {
    setActiveIndex(index);
    if (onChange) onChange(options[index]);
  }

  function onKeyDown(event) {
    const last = options.length - 1;
    if (event.key === 'ArrowDown') go(Math.min(last, activeIndex + 1));
    else if (event.key === 'ArrowUp') go(Math.max(0, activeIndex - 1));
    else if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(last);
  }

  return (
    <div>
      <ul role="listbox" tabIndex={0} aria-label={label} aria-activedescendant={optionId(activeIndex)} onKeyDown={onKeyDown}>
        {options.map((option, i) => (
          <li
            key={option}
            id={optionId(i)}
            role="option"
            aria-selected={i === activeIndex ? 'true' : 'false'}
            data-active={i === activeIndex ? 'true' : undefined}
            onClick={() => go(i)}
          >
            {option}
          </li>
        ))}
      </ul>
      <p data-testid="value">{'Selected: ' + options[activeIndex]}</p>
    </div>
  );
}
`,
  'react-combobox-autocomplete': `import React, { useState, useId } from 'react';

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
    // Bug: the active index is not reset when the text (and so the list) changes.
    setText(event.target.value);
    setOpen(true);
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
    if (event.key === 'ArrowDown') setActiveIndex((activeIndex + 1) % count);
    else if (event.key === 'ArrowUp') setActiveIndex(activeIndex <= 0 ? count - 1 : activeIndex - 1);
    else if (event.key === 'Enter') {
      if (activeIndex === -1 || !suggestions[activeIndex]) return;
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
        <ul role="listbox">
          {suggestions.map((option, i) => (
            <li key={option} id={optionId(i)} role="option" aria-selected={i === activeIndex ? 'true' : 'false'} onClick={() => choose(option)}>
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
  'react-dialog-focus-trap': `import React, { useState, useRef, useEffect, useId } from 'react';

export default function DeleteConfirm({ itemName, onConfirm }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  // Bug: focus goes into the dialog but is never returned to the trigger.
  useEffect(() => {
    if (open) cancelRef.current.focus();
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
      <button type="button" onClick={() => setOpen(true)}>{'Delete ' + itemName}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onKeyDown}>
          <h2 id={titleId}>{'Delete ' + itemName + '?'}</h2>
          <button type="button" ref={cancelRef} onClick={() => setOpen(false)}>Cancel</button>{' '}
          <button type="button" ref={confirmRef} onClick={confirm}>Confirm</button>
        </div>
      )}
    </div>
  );
}
`,
};
