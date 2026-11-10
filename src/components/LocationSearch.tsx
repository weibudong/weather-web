import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { POPULAR_LOCATIONS } from '../app/constants';
import type { Location, RemoteData } from '../domain/types';
import { countryFlag } from '../utils/format';
import { Icon } from './Icons';

interface Props {
  query: string;
  search: RemoteData<Location[]>;
  recents: Location[];
  onQueryChange: (query: string) => void;
  onSelect: (location: Location) => void;
  onRetry: () => void;
  onClearRecents: () => void;
}

function subtitle(location: Location): string {
  return [location.admin1, location.country].filter(Boolean).join(' · ') || '全球';
}

/** 搜索容器：拥有「下拉是否展开 / 键盘焦点」这类纯 UI 状态，商业数据全部由 props 传入 */
export function LocationSearch({
  query,
  search,
  recents,
  onQueryChange,
  onSelect,
  onRetry,
  onClearRecents,
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isQueryMode = query.trim().length >= 2;
  const results = search.kind === 'success' ? search.data : [];
  const options = isQueryMode ? results : recents;

  useEffect(() => setHighlighted(-1), [query, search.kind, results.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const choose = (location: Location) => {
    onSelect(location);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        setHighlighted((index) => Math.min(index + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlighted((index) => Math.max(index - 1, 0));
        break;
      case 'Enter': {
        const picked = highlighted >= 0 ? options[highlighted] : results[0];
        if (picked) {
          event.preventDefault();
          choose(picked);
        }
        break;
      }
      case 'Escape':
        setOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const renderRow = (location: Location, index: number) => (
    <li
      key={location.id}
      id={`loc-option-${index}`}
      role="option"
      aria-selected={index === highlighted}
      className={`loc-option${index === highlighted ? ' is-active' : ''}`}
      onMouseEnter={() => setHighlighted(index)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => choose(location)}
    >
      <span className="loc-option__flag" aria-hidden="true">
        {countryFlag(location.countryCode)}
      </span>
      <span className="loc-option__text">
        <strong>{location.name}</strong>
        <small>{subtitle(location)}</small>
      </span>
      <Icon name="chevron" size={16} />
    </li>
  );

  return (
    <div className="search" ref={rootRef}>
      <div className={`search__field${open ? ' is-open' : ''}`}>
        <Icon name="search" size={20} className="search__icon" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label="搜索地点"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="location-listbox"
          aria-activedescendant={highlighted >= 0 ? `loc-option-${highlighted}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="搜索城市或地区，例如：东京、London、巴黎…"
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {search.kind === 'loading' && <span className="spinner" aria-label="搜索中" />}
        {query && (
          <button
            type="button"
            className="icon-btn"
            aria-label="清除搜索"
            onClick={() => {
              onQueryChange('');
              inputRef.current?.focus();
            }}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {open && (
        <div className="search__panel">
          {isQueryMode ? (
            <>
              <div className="search__section-title">
                <Icon name="compass" size={14} /> 搜索结果
              </div>
              {search.kind === 'loading' && (
                <div className="search__skeleton" aria-hidden="true">
                  {[0, 1, 2].map((item) => (
                    <div className="skeleton skeleton--row" key={item} />
                  ))}
                </div>
              )}
              {search.kind === 'error' && (
                <div className="search__error" role="alert">
                  <Icon name="alert" size={18} />
                  <span>{search.error.message}</span>
                  {search.error.retryable && (
                    <button type="button" className="text-btn" onClick={onRetry}>
                      重试
                    </button>
                  )}
                </div>
              )}
              {search.kind === 'success' &&
                (results.length > 0 ? (
                  <ul className="loc-list" id="location-listbox" role="listbox" aria-label="地点搜索结果">
                    {results.map(renderRow)}
                  </ul>
                ) : (
                  <p className="search__hint">找不到「{query.trim()}」，试试其他关键字或英文名称。</p>
                ))}
              {search.kind === 'idle' && <p className="search__hint">正在准备搜索…</p>}
            </>
          ) : (
            <>
              {recents.length > 0 && (
                <section className="search__section">
                  <div className="search__section-title">
                    <Icon name="clock" size={14} /> 最近查看
                    <button
                      type="button"
                      className="text-btn text-btn--muted"
                      onClick={onClearRecents}
                    >
                      <Icon name="trash" size={13} /> 清除
                    </button>
                  </div>
                  <ul className="loc-list" id="location-listbox" role="listbox" aria-label="最近查看的地点">
                    {recents.map(renderRow)}
                  </ul>
                </section>
              )}
              <section className="search__section">
                <div className="search__section-title">
                  <Icon name="sparkles" size={14} /> 热门城市
                </div>
                <div className="popular-grid">
                  {POPULAR_LOCATIONS.map((location) => (
                    <button
                      type="button"
                      className="popular-chip"
                      key={location.id}
                      onClick={() => choose(location)}
                    >
                      <span aria-hidden="true">{countryFlag(location.countryCode)}</span>
                      {location.name}
                    </button>
                  ))}
                </div>
              </section>
              <p className="search__hint">输入至少 2 个字即可搜索全世界城市</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
