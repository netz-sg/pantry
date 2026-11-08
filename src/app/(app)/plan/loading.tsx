import { Skeleton } from '@/components/ui/skeleton';

/** Platzhalter für Wochenplan, Raster am Desktop, Tageswähler am Handy. */
export default function Loading() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32" aria-busy="true">
      <Skeleton className="h-10 w-52 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-40 rounded-md" />
      <div className="mt-5 grid grid-cols-7 gap-1.5 lg:hidden">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-48 w-full lg:hidden" />
      <div className="mt-6 grid grid-cols-7 gap-2 max-lg:hidden">
        {Array.from({ length: 21 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-[16px]" />
        ))}
      </div>
    </div>
  );
}
