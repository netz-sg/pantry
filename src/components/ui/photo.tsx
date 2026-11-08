import { UtensilsCrossed } from 'lucide-react';
import { cn, mediaUrl } from '@/lib/utils';

/** Rezeptfoto, sonst eine dunkle Fläche mit warmem Schein und Besteck-Symbol. */
export function Photo({
  path,
  alt,
  seed: _seed,
  className,
  priority,
}: {
  path?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  priority?: boolean;
}) {
  const url = mediaUrl(path);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('bg-fill object-cover', className)}
      />
    );
  }
  return (
    <div
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })}
      className={cn(
        'grid place-items-center bg-surface bg-[radial-gradient(circle_at_25%_15%,var(--tint-soft),transparent_65%)] text-label-3',
        className,
      )}
    >
      <UtensilsCrossed className="size-[20%] max-h-11 max-w-11" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

/** Weicher Farbschein des Fotos unter einer großen Bildkarte, wie bei Apple TV. */
export function PhotoGlow({ path, className }: { path?: string | null; className?: string }) {
  const url = mediaUrl(path);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-8 top-10 -bottom-8 -z-10 h-[calc(100%-1rem)] w-[calc(100%-4rem)] scale-95 rounded-[40px] object-cover opacity-55 blur-3xl saturate-150 dark:opacity-40',
        className,
      )}
    />
  );
}
