import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32" aria-busy="true">
      <Skeleton className="h-9 w-40 rounded-lg" />
      <Skeleton className="mt-5 h-11 w-full rounded-[12px]" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/3] rounded-[18px]" />
            <Skeleton className="mt-2 h-4 w-3/4 rounded-md" />
            <Skeleton className="mt-1.5 h-3 w-1/2 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
