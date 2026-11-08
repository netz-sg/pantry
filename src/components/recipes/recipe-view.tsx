'use client';

import { useState, useTransition, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormatter, useTranslations } from 'next-intl';
import { CalendarPlus, CheckCheck, Pencil, Play, Printer, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { buttonVariants } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Stepper } from '@/components/ui/stepper';
import { callAction } from '@/lib/action-client';
import { cn } from '@/lib/utils';
import { addAllToShopping, addMissingToShopping, markRecipeCooked } from '@/server/actions/recipes';
import { CookedSheet } from './cooked-sheet';
import { IngredientList } from './ingredient-list';
import { PlanSheet } from './plan-sheet';
import { TimerButton } from './timers';
import { scaleStatus, type ViewIngredient, type ViewStep } from './types';

type Pane = 'ing' | 'steps';

/** Interaktiver Teil der Rezeptseite. Portionen, Zutaten mit Vorrat, Schritte, Aktionen. */
export function RecipeView({
  id,
  baseServings,
  initialServings,
  ingredients,
  steps,
  today,
  children,
}: {
  id: string;
  baseServings: number;
  initialServings: number;
  ingredients: ViewIngredient[];
  steps: ViewStep[];
  today: string;
  children?: ReactNode;
}) {
  const t = useTranslations('recipes.detail');
  const tt = useTranslations('recipes.timer');
  const tk = useTranslations('recipes.cookedSheet');
  const format = useFormatter();
  const router = useRouter();
  const [servings, setServings] = useState(initialServings);
  const [pane, setPane] = useState<Pane>('ing');
  const [planOpen, setPlanOpen] = useState(false);
  const [cookedOpen, setCookedOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const factor = servings / baseServings;

  const missing = ingredients
    .map((i) => ({ i, s: scaleStatus(i, factor) }))
    .filter(({ s }) => s.status === 'missing' || s.status === 'partial')
    .map(({ i }) => i.name);
  const names =
    missing.length > 3 ? [...missing.slice(0, 2), t('andMore', { count: missing.length - 2 })] : missing;

  const toShopping = { label: t('toShopping'), onClick: () => router.push('/shopping') };
  const addMissing = () =>
    startTransition(async () => {
      const n = await callAction(addMissingToShopping(id, servings));
      if (n !== undefined)
        toast.success(t('addedMissing', { count: n }), n ? { action: toShopping } : undefined);
    });
  const addAll = () =>
    startTransition(async () => {
      const n = await callAction(addAllToShopping(id, servings));
      if (n !== undefined) toast.success(t('addedAll', { count: n }), n ? { action: toShopping } : undefined);
    });

  const actions: { key: string; label: string; icon: ReactNode; onClick?: () => void; href?: string }[] = [
    { key: 'plan', label: t('toPlan'), icon: <CalendarPlus />, onClick: () => setPlanOpen(true) },
    { key: 'cooked', label: t('cooked'), icon: <CheckCheck />, onClick: () => setCookedOpen(true) },
    { key: 'shop', label: t('addAllShort'), icon: <ShoppingCart />, onClick: addAll },
    { key: 'print', label: t('print'), icon: <Printer />, onClick: () => window.print() },
    { key: 'edit', label: t('edit'), icon: <Pencil />, href: `/recipes/${id}/edit` },
  ];

  return (
    <>
      <div
        role="group"
        aria-label={t('actions')}
        className="no-print no-scrollbar -mx-5 mb-5 flex gap-1 overflow-x-auto border-b border-separator px-3 pb-3 md:mx-0 md:px-0 [&>*:first-child]:md:-ml-2.5"
      >
        {actions.map((a) => {
          const cls =
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full pr-3 pl-2.5 text-tint transition-colors hover:bg-tint-soft disabled:opacity-50 [&_svg]:size-[17px]';
          const label = <span className="text-subhead font-medium whitespace-nowrap">{a.label}</span>;
          return a.href ? (
            <Link key={a.key} href={a.href} className={cls}>
              {a.icon}
              {label}
            </Link>
          ) : (
            <button
              key={a.key}
              type="button"
              onClick={a.onClick}
              disabled={a.key === 'shop' && (pending || !ingredients.length)}
              className={cls}
              title={a.key === 'shop' ? t('addAll') : undefined}
            >
              {a.icon}
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex items-center justify-between py-1">
        <span className="text-callout font-medium">{t('servings')}</span>
        <span className="no-print">
          <Stepper value={servings} onChange={setServings} min={1} max={100} label={t('servings')} />
        </span>
        <span className="tabular hidden text-callout font-semibold print:inline">{servings}</span>
      </div>

      <Segmented
        label={t('view')}
        value={pane}
        onChange={setPane}
        items={[
          { value: 'ing', label: t('ingredients') },
          { value: 'steps', label: t('steps') },
        ]}
        className="no-print mb-3.5 lg:hidden"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <section aria-labelledby="ing-title" className={cn(pane !== 'ing' && 'max-lg:hidden print:!block')}>
          <h2 id="ing-title" className="headline mb-3 text-[1.375rem] max-lg:sr-only print:!not-sr-only">
            {t('ingredients')}
          </h2>
          {ingredients.length ? (
            <>
              <IngredientList ingredients={ingredients} factor={factor} />
              {missing.length ? (
                <div className="no-print mt-3 flex items-center gap-3 rounded-[12px] bg-tint-soft py-3 pr-3 pl-3.5 text-subhead leading-snug">
                  <p className="min-w-0 flex-1">
                    {t('missingCallout', {
                      items: format.list(names, { type: 'conjunction' }),
                      count: missing.length,
                      servings,
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={addMissing}
                    disabled={pending}
                    className={buttonVariants({ size: 'sm', className: 'h-9' })}
                  >
                    {t('addMissing')}
                  </button>
                </div>
              ) : (
                <p className="no-print mt-3 px-1 text-footnote text-label-2">
                  {t('allThereCallout', { servings })}
                </p>
              )}
            </>
          ) : (
            <p className="text-subhead text-label-2">{t('noIngredients')}</p>
          )}
        </section>

        <section
          aria-labelledby="steps-title"
          className={cn(pane !== 'steps' && 'max-lg:hidden print:!block')}
        >
          <h2 id="steps-title" className="headline mb-3 text-[1.375rem] max-lg:sr-only print:!not-sr-only">
            {t('steps')}
          </h2>
          {steps.length ? (
            <ol className="grid gap-5">
              {steps.map((s, i) => (
                <li key={s.id} className="grid grid-cols-[22px_1fr] gap-2 print:break-inside-avoid">
                  <span className="tabular pt-px text-callout text-label-3" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="sr-only">{t('stepNumber', { n: i + 1 })}</span>
                    <p className="text-callout leading-[1.6] whitespace-pre-line">{s.text}</p>
                    {s.timerSeconds ? (
                      <div className="mt-2">
                        <TimerButton
                          timerKey={`${id}:${s.id}`}
                          seconds={s.timerSeconds}
                          label={tt('stepLabel', { n: i + 1 })}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-subhead text-label-2">{t('noSteps')}</p>
          )}
        </section>
      </div>

      {children}

      <div className="no-print sticky bottom-[max(env(safe-area-inset-bottom),16px)] z-20 mt-6 flex gap-2.5 md:bottom-6 md:mx-auto md:max-w-md">
        <Link
          href={`/recipes/${id}/cook?servings=${servings}`}
          className={buttonVariants({ size: 'lg', className: 'h-[54px] flex-1 shadow-glass' })}
        >
          <Play className="fill-current" />
          {t('startCooking')}
        </Link>
        <button
          type="button"
          onClick={() => setPlanOpen(true)}
          aria-label={t('toPlan')}
          className="grid size-[54px] shrink-0 place-items-center rounded-full bg-ink text-on-ink shadow-glass"
        >
          <CalendarPlus className="size-[22px]" />
        </button>
      </div>

      <PlanSheet open={planOpen} onOpenChange={setPlanOpen} recipeId={id} servings={servings} today={today} />
      <CookedSheet
        open={cookedOpen}
        onOpenChange={setCookedOpen}
        servings={servings}
        title={tk('title')}
        description={tk('description')}
        submitLabel={tk('submit')}
        onSubmit={async ({ servings: n, deduct }) => {
          const res = await callAction(markRecipeCooked(id, n, deduct), { success: tk('done') });
          if (res) setCookedOpen(false);
        }}
      />
    </>
  );
}
