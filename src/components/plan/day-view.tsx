'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { Check, Plus, Utensils } from 'lucide-react';
import { Group, GroupLabel, RowButton } from '@/components/ui/list';
import { Photo } from '@/components/ui/photo';
import { cn } from '@/lib/utils';
import { entryTitle, noon, SLOTS, type AddTarget, type BoardEntry } from './types';

/** Handy und Tablet. Tageswähler oben, darunter die Mahlzeiten des gewählten Tages. */
export function DayView({
  days,
  today,
  entries,
  day,
  onDay,
  onAdd,
  onEdit,
  hideList,
  className,
}: {
  days: string[];
  today: string;
  entries: BoardEntry[];
  day: string;
  onDay: (d: string) => void;
  onAdd: (t: AddTarget) => void;
  onEdit: (id: string) => void;
  hideList?: boolean;
  className?: string;
}) {
  const t = useTranslations('plan');
  const tc = useTranslations('common');
  const f = useFormatter();
  const dayLong = (d: string) => f.dateTime(noon(d), { weekday: 'long', day: 'numeric', month: 'long' });
  const ofDay = entries.filter((e) => e.date === day);

  return (
    <div className={className}>
      <div role="group" aria-label={t('day.picker')} className="mx-5 mt-2 grid grid-cols-7 gap-1.5 md:mx-12">
        {days.map((d) => {
          const selected = d === day;
          const isToday = d === today;
          const count = entries.filter((e) => e.date === d).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onDay(d)}
              aria-pressed={selected}
              aria-current={isToday ? 'date' : undefined}
              aria-label={count ? t('day.withCount', { date: dayLong(d), count }) : dayLong(d)}
              className={cn(
                'flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-full py-2 transition-colors active:scale-[0.97]',
                selected ? 'bg-tint text-on-tint' : 'bg-surface shadow-elevated hover:bg-fill/50',
              )}
            >
              <span
                className={cn(
                  'text-caption font-semibold uppercase',
                  selected ? 'text-on-tint' : isToday ? 'text-tint' : 'text-label-2',
                )}
              >
                {f.dateTime(noon(d), { weekday: 'short' })}
              </span>
              <span className={cn('tabular text-callout font-semibold', !selected && isToday && 'text-tint')}>
                {f.dateTime(noon(d), { day: 'numeric' })}
              </span>
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  count ? (selected ? 'bg-on-tint' : 'bg-tint') : 'bg-transparent',
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {hideList ? null : (
        <section aria-label={dayLong(day)}>
          <h2 className="mx-5 mt-6 text-title-2 font-bold md:mx-12">
            {day === today ? t('today') : f.dateTime(noon(day), { weekday: 'long' })}
          </h2>
          <p className="mx-5 text-subhead text-label-2 md:mx-12">
            {f.dateTime(noon(day), { day: 'numeric', month: 'long' })}
          </p>
          {SLOTS.map((slot) => {
            const items = ofDay.filter((e) => e.slot === slot);
            const slotName = tc(`slots.${slot}`);
            return (
              <div key={slot}>
                <GroupLabel className="mt-5">{slotName}</GroupLabel>
                <Group>
                  {items.map((e) => {
                    const title = entryTitle(e) ?? t('entry.untitled');
                    return (
                      <RowButton
                        key={e.id}
                        onClick={() => onEdit(e.id)}
                        disabled={e.pending}
                        indent="none"
                        className={cn(e.cooked && 'opacity-60')}
                        icon={
                          e.recipe ? (
                            <Photo
                              path={e.recipe.imagePath}
                              alt=""
                              seed={e.recipe.title}
                              className="size-14 rounded-[12px]"
                            />
                          ) : (
                            <span
                              className="grid size-14 place-items-center rounded-[12px] bg-fill text-label-2"
                              aria-hidden
                            >
                              <Utensils className="size-5" />
                            </span>
                          )
                        }
                        title={<span className="font-semibold">{title}</span>}
                        subtitle={[
                          tc('servings', { count: e.servings }),
                          e.recipe?.totalMinutes ? tc('minutes', { count: e.recipe.totalMinutes }) : null,
                          e.note,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                        end={
                          e.cooked ? (
                            <span className="flex items-center gap-1 text-footnote font-semibold text-green">
                              <Check className="size-4" strokeWidth={3} aria-hidden /> {t('entry.cooked')}
                            </span>
                          ) : undefined
                        }
                        chevron
                      />
                    );
                  })}
                  <RowButton
                    onClick={() => onAdd({ date: day, slot })}
                    indent="none"
                    icon={
                      <span className="flex w-14 justify-center" aria-hidden>
                        <span
                          className={cn(
                            'grid place-items-center rounded-[12px] border-2 border-dashed border-separator text-tint',
                            items.length ? 'size-9' : 'size-14',
                          )}
                        >
                          <Plus className="size-5" />
                        </span>
                      </span>
                    }
                    title={
                      <span className="text-tint">
                        {items.length ? t('day.addMore') : t('day.add', { slot: slotName })}
                      </span>
                    }
                  />
                </Group>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
