import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Photo } from '@/components/ui/photo';
import { Clock } from 'lucide-react';
import { Dot } from '@/components/ui/status';
import type { RecipeSummary } from '@/server/services/recipes';
import { FavoriteButton } from './favorite-button';

/** Fotokarte im Raster mit Titel, Zeit und Vorratsstatus. */
export async function RecipeCard({ recipe, priority }: { recipe: RecipeSummary; priority?: boolean }) {
  const t = await getTranslations('recipes.card');
  const tc = await getTranslations('common');
  const status =
    recipe.ingredientCount === 0
      ? null
      : recipe.missingCount === 0
        ? t('allThere')
        : recipe.missingCount === 1
          ? t('missingOne', { name: recipe.missing[0] ?? '' })
          : t('missingMany', { count: recipe.missingCount });

  return (
    <li className="relative min-w-0">
      <Link href={`/recipes/${recipe.id}`} className="group block rounded-[10px] outline-offset-4">
        <div className="overflow-hidden rounded-[10px]">
          <Photo
            path={recipe.imagePath}
            alt=""
            seed={recipe.title}
            priority={priority}
            className="aspect-video w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <span className="mt-2.5 line-clamp-2 text-callout leading-snug font-semibold">{recipe.title}</span>
        <span className="mt-0.5 flex items-center gap-3 text-footnote text-label-2">
          {recipe.totalMinutes ? (
            <span className="tabular inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {tc('minutes', { count: recipe.totalMinutes })}
            </span>
          ) : null}
          {status ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Dot tone={recipe.missingCount ? 'warn' : 'ok'} />
              <span className="truncate">{status}</span>
            </span>
          ) : null}
        </span>
      </Link>
      <div className="absolute top-2 right-2">
        <FavoriteButton id={recipe.id} value={recipe.isFavorite} />
      </div>
    </li>
  );
}
