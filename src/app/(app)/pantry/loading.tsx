import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32" aria-busy="true">
      <Skeleton className="h-9 w-36 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-44 rounded-md" />
      <Skeleton className="mt-5 h-11 w-full rounded-[12px]" />
      <div className="mt-4 grid grid-cols-2 gap-3 md:max-w-xl">
        <Skeleton className="h-[76px]" />
        <Skeleton className="h-[76px]" />
      </div>
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
