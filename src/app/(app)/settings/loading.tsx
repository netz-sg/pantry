import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32" aria-busy="true">
      <Skeleton className="mx-1 h-9 w-48 rounded-lg" />
      <Skeleton className="mt-5 h-[5.5rem] w-full" />
      <Skeleton className="mt-8 h-28 w-full" />
      <Skeleton className="mt-8 h-40 w-full" />
    </div>
  );
}
