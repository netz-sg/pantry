'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

/** Schlagworte als Chips. Enter oder Komma fügt hinzu, Rücktaste im leeren Feld entfernt das letzte. */
export function TagInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
}) {
  const t = useTranslations('recipes.form');
  const [text, setText] = useState('');

  const add = (raw: string) => {
    const tag = raw.replace(/^#/, '').trim().slice(0, 40);
    if (!tag) return;
    if (!value.some((v) => v.toLowerCase() === tag.toLowerCase()) && value.length < 30)
      onChange([...value, tag]);
    setText('');
  };

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-[12px] bg-fill p-1.5 focus-within:ring-2 focus-within:ring-tint/50">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-8 items-center gap-0.5 rounded-full bg-surface pl-3 text-footnote font-semibold shadow-[inset_0_0_0_0.5px_var(--separator)]"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== tag))}
            aria-label={t('removeTag', { tag })}
            className="grid size-8 place-items-center rounded-full text-label-2 hover:text-label"
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={text}
        list={`${id}-list`}
        onChange={(e) => {
          const v = e.target.value;
          if (v.endsWith(',')) add(v.slice(0, -1));
          else setText(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add(text);
          } else if (e.key === 'Backspace' && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(text)}
        placeholder={value.length ? '' : t('tagsPlaceholder')}
        enterKeyHint="done"
        className="h-8 min-w-32 flex-1 bg-transparent px-2 text-body text-label outline-none placeholder:text-label-3"
      />
      <datalist id={`${id}-list`}>
        {suggestions
          .filter((s) => !value.includes(s))
          .map((s) => (
            <option key={s} value={s} />
          ))}
      </datalist>
    </div>
  );
}
