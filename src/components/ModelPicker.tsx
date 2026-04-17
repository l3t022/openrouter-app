'use client';

import { useState, useEffect, useRef } from 'react';
import { OpenRouterModel } from '@/types';
import { formatPrice } from '@/lib/utils';

interface ModelPickerProps {
  label: string;
  models: OpenRouterModel[];
  value: string;
  onChange: (id: string) => void;
}

export function ModelPicker({ label, models, value, onChange }: ModelPickerProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search
    ? models.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase())
      )
    : models;

  const selected = models.find((m) => m.id === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pick = (id: string) => {
    onChange(id);
    setSearch('');
    setOpen(false);
  };

  return (
    <div className="model-group" ref={ref}>
      <label>{label}</label>
      <div className="picker-wrapper">
        <div className="picker-input-row" onClick={() => setOpen(true)}>
          <input
            className="picker-input"
            type="text"
            placeholder={selected ? selected.name : 'Search or select a model…'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          <span className="picker-arrow">{open ? '▲' : '▼'}</span>
        </div>

        {selected && !open && (
          <div className="picker-badge">
            <span>{selected.name}</span>
            <span className="picker-price">{formatPrice(selected.pricing.prompt)}</span>
            <button
              className="picker-clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            >
              ✕
            </button>
          </div>
        )}

        {open && (
          <ul className="picker-list">
            {filtered.length === 0 && (
              <li className="picker-empty">No models found for "{search}"</li>
            )}
            {filtered.slice(0, 80).map((m) => (
              <li
                key={m.id}
                className={`picker-item ${m.id === value ? 'picker-item--selected' : ''}`}
                onMouseDown={() => pick(m.id)}
              >
                <span className="picker-item-name">{m.name}</span>
                <span className="picker-item-price">{formatPrice(m.pricing.prompt)}</span>
              </li>
            ))}
            {filtered.length > 80 && (
              <li className="picker-empty">
                {filtered.length - 80} more — refine your search
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}