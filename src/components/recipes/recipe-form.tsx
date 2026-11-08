'use client';

import { useRef, useState, useTransition, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/field';
import { PageHeader } from '@/components/ui/page-header';
import { Segmented } from '@/components/ui/segmented';
import { Stepper } from '@/components/ui/stepper';
import { importRecipeFromUrl, saveRecipe } from '@/server/actions/recipes';
import {
  NEW_CATEGORY,
  toPayload,
  toState,
  type FormInitial,
  type FormState,
  type IngRow,
  type StepRow,
} from './form-state';
import { IngredientEditor } from './ingredient-editor';
import { PhotoInput, type PhotoState } from './photo-input';
import { StepEditor } from './step-editor';
import { TagInput } from './tag-input';

type Errors = Record<string, string[] | undefined>;

function Section({ title, children, plain }: { title: string; children: ReactNode; plain?: boolean }) {
  return (
    <section className="mt-6">
      <h2 className="mx-1 mb-2 text-footnote font-semibold text-label-2">{title}</h2>
      {plain ? (
        children
      ) : (
        <div className="grid gap-4 rounded-card border border-separator bg-surface p-4">{children}</div>
      )}
    </section>
  );
}

/** Formular für neue und bestehende Rezepte, mit Import aus einem Link. */
export function RecipeForm({
  recipeId,
  initial,
  imagePath,
  categories,
  tagSuggestions,
  showImport,
  focusImport,
  cancelHref,
}: {
  recipeId?: string;
  initial: FormInitial;
  imagePath: string | null;
  categories: { id: string; name: string }[];
  tagSuggestions: string[];
  showImport?: boolean;
  focusImport?: boolean;
  cancelHref: string;
}) {
  const t = useTranslations('recipes.form');
  const locale = useLocale();
  const router = useRouter();
  const seq = useRef(0);
  const nextKey = () => `n${++seq.current}`;

  const [form, setForm] = useState<FormState>(() => toState(initial, (k, i) => `${k}${i}`, locale));
  const [photo, setPhoto] = useState<PhotoState>({
    file: null,
    preview: null,
    remove: false,
    importUrl: null,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, startImport] = useTransition();

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setIngredients = (fn: (rows: IngRow[]) => IngRow[]) =>
    setForm((f) => ({ ...f, ingredients: fn(f.ingredients) }));
  const setSteps = (fn: (rows: StepRow[]) => StepRow[]) => setForm((f) => ({ ...f, steps: fn(f.steps) }));
  const err = (k: string) => errors[k]?.[0];

  const doImport = (e: FormEvent) => {
    e.preventDefault();
    const url = importUrl.trim();
    if (!/^https?:\/\/\S+\.\S+/i.test(url)) {
      setImportError(t('import.invalid'));
      return;
    }
    setImportError(null);
    startImport(async () => {
      const res = await importRecipeFromUrl(url);
      if (!res.ok) {
        setImportError(res.error.message);
        return;
      }
      const { input, imageUrl } = res.data;
      const catName = input.categoryName?.trim() ?? '';
      const match = catName
        ? categories.find((c) => c.name.toLowerCase() === catName.toLowerCase())
        : undefined;
      setForm(
        toState(
          {
            ...input,
            categoryId: match ? match.id : catName ? NEW_CATEGORY : '',
            categoryName: match ? '' : catName,
          },
          () => nextKey(),
          locale,
        ),
      );
      setPhoto({ file: null, preview: null, remove: false, importUrl: imageUrl });
      setErrors({});
      setFormError(null);
      toast.success(t('import.done'));
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (recipeId) fd.set('id', recipeId);
    fd.set('data', JSON.stringify(toPayload(form)));
    if (photo.file) fd.set('image', photo.file);
    else if (photo.importUrl) fd.set('imageUrl', photo.importUrl);
    else if (photo.remove) fd.set('removeImage', '1');
    startSave(async () => {
      const res = await saveRecipe(fd);
      if (res && !res.ok) {
        setErrors(res.error.fieldErrors ?? {});
        setFormError(res.error.fieldErrors ? t('error') : res.error.message);
        toast.error(res.error.message);
      }
    });
  };

  const cancel = () => {
    if (window.history.length > 1) router.back();
    else router.push(cancelHref);
  };

  // Enter in einem einzeiligen Feld soll nicht sofort sichern
  const blockEnter = (e: KeyboardEvent<HTMLFormElement>) => {
    const el = e.target as HTMLElement;
    if (e.key === 'Enter' && el instanceof HTMLInputElement && el.type !== 'submit' && el.type !== 'button')
      e.preventDefault();
  };

  const levels = [
    { value: '', label: t('difficultyNone') },
    { value: '1', label: t('levels.1') },
    { value: '2', label: t('levels.2') },
    { value: '3', label: t('levels.3') },
  ];

  return (
    <div className="max-w-[960px] pb-8">
      <PageHeader
        title={recipeId ? t('editTitle') : t('newTitle')}
        actions={
          <>
            <Button type="button" variant="plain" onClick={cancel} className="h-11 px-2">
              {t('cancel')}
            </Button>
            <Button type="submit" form="recipe-form" disabled={saving} className="h-11">
              {saving ? t('saving') : t('save')}
            </Button>
          </>
        }
      />

      <div className="px-5 md:px-12">
        {showImport ? (
          <form
            onSubmit={doImport}
            noValidate
            className="mt-3 rounded-card border border-tint/30 bg-tint-soft p-4"
            aria-busy={importing}
          >
            <Field
              label={t('import.label')}
              htmlFor="import-url"
              error={importError ?? undefined}
              hint={t('import.hint')}
            >
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Link2
                    className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-tint"
                    aria-hidden
                  />
                  <Input
                    id="import-url"
                    type="url"
                    inputMode="url"
                    autoComplete="off"
                    autoFocus={focusImport}
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder={t('import.placeholder')}
                    aria-invalid={importError ? true : undefined}
                    aria-describedby={importError ? 'import-url-error' : undefined}
                    className="bg-raised pl-10"
                  />
                </div>
                <Button type="submit" disabled={importing} className="h-11">
                  {importing ? t('importing') : t('import.submit')}
                </Button>
              </div>
            </Field>
          </form>
        ) : null}

        <form id="recipe-form" onSubmit={submit} onKeyDown={blockEnter} noValidate>
          {formError ? (
            <p
              role="alert"
              className="mt-4 rounded-[14px] bg-red-soft px-4 py-3 text-subhead font-medium text-red"
            >
              {formError}
            </p>
          ) : null}

          <Section title={t('basics')}>
            <Field label={t('title')} htmlFor="r-title" error={err('title')}>
              <Input
                id="r-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={t('titlePlaceholder')}
                maxLength={200}
                required
                aria-invalid={err('title') ? true : undefined}
                aria-describedby={err('title') ? 'r-title-error' : undefined}
              />
            </Field>
            <Field label={t('description')} htmlFor="r-desc" error={err('description')}>
              <Textarea
                id="r-desc"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                maxLength={4000}
                rows={2}
                className="min-h-16"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('category')} htmlFor="r-cat" error={err('categoryId') ?? err('categoryName')}>
                <Select
                  id="r-cat"
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                >
                  <option value="">{t('noCategory')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>{t('newCategory')}</option>
                </Select>
              </Field>
              {form.categoryId === NEW_CATEGORY ? (
                <Field label={t('newCategoryName')} htmlFor="r-catname">
                  <Input
                    id="r-catname"
                    value={form.categoryName}
                    onChange={(e) => set('categoryName', e.target.value)}
                    maxLength={60}
                    autoFocus={!form.categoryName}
                  />
                </Field>
              ) : null}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="px-1 text-subhead font-semibold text-label-2">{t('servings')}</span>
              <Stepper
                value={form.servings}
                onChange={(v) => set('servings', v)}
                min={1}
                max={100}
                label={t('servings')}
              />
            </div>
            <Field label={t('tags')} htmlFor="r-tags">
              <TagInput
                id="r-tags"
                value={form.tags}
                onChange={(v) => set('tags', v)}
                suggestions={tagSuggestions}
              />
            </Field>
          </Section>

          <Section title={t('photo')}>
            <PhotoInput
              value={photo}
              onChange={setPhoto}
              existing={imagePath}
              seed={form.title || 'Rezept'}
            />
          </Section>

          <Section title={t('times')}>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ['prep', 'prepMinutes'],
                  ['cook', 'cookMinutes'],
                  ['rest', 'restMinutes'],
                ] as const
              ).map(([k, ek]) => (
                <Field key={k} label={t(k)} htmlFor={`r-${k}`} error={err(ek)}>
                  <Input
                    id={`r-${k}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={form[k]}
                    onChange={(e) => set(k, e.target.value)}
                    className="tabular"
                    aria-invalid={err(ek) ? true : undefined}
                  />
                </Field>
              ))}
            </div>
            <div className="grid gap-1.5">
              <span className="px-1 text-footnote font-semibold text-label-2">{t('difficulty')}</span>
              <Segmented
                label={t('difficulty')}
                value={form.difficulty}
                onChange={(v) => set('difficulty', v)}
                items={levels}
                className="[&_button]:h-9"
              />
            </div>
          </Section>

          <Section title={t('ingredients')} plain>
            <IngredientEditor
              rows={form.ingredients}
              setRows={setIngredients}
              nextKey={nextKey}
              error={err('ingredients')}
            />
          </Section>

          <Section title={t('steps')} plain>
            <StepEditor rows={form.steps} setRows={setSteps} nextKey={nextKey} error={err('steps')} />
          </Section>

          <Section title={t('nutrition')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ['calories', 'numeric'],
                  ['protein', 'decimal'],
                  ['fat', 'decimal'],
                  ['carbs', 'decimal'],
                ] as const
              ).map(([k, mode]) => (
                <Field key={k} label={t(k)} htmlFor={`r-${k}`} error={err(k)}>
                  <Input
                    id={`r-${k}`}
                    inputMode={mode}
                    value={form[k]}
                    onChange={(e) => set(k, e.target.value)}
                    className="tabular"
                    aria-invalid={err(k) ? true : undefined}
                  />
                </Field>
              ))}
            </div>
          </Section>

          <Section title={t('more')}>
            <Field label={t('source')} htmlFor="r-source" error={err('sourceUrl')}>
              <Input
                id="r-source"
                type="url"
                inputMode="url"
                value={form.sourceUrl}
                onChange={(e) => set('sourceUrl', e.target.value)}
                placeholder={t('sourcePlaceholder')}
                aria-invalid={err('sourceUrl') ? true : undefined}
                aria-describedby={err('sourceUrl') ? 'r-source-error' : undefined}
              />
            </Field>
            <Field label={t('notes')} htmlFor="r-notes" error={err('notes')}>
              <Textarea
                id="r-notes"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('notesPlaceholder')}
                maxLength={4000}
                rows={4}
              />
            </Field>
          </Section>

          <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="lg" onClick={cancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" size="lg" disabled={saving} className="sm:min-w-40">
              {saving ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
