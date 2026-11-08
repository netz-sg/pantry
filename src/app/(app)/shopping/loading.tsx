import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32" aria-busy="true">
      <Skeleton className="h-9 w-40 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-28 rounded-md" />
      <Skeleton className="mt-8 h-6 w-36 rounded-md" />
      <Skeleton className="mt-3 h-40 w-full" />
      <Skeleton className="mt-8 h-6 w-28 rounded-md" />
      <Skeleton className="mt-3 h-28 w-full" />
    </div>
  );
}
