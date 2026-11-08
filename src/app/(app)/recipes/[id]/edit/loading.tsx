import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div
      className="max-w-3xl px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32"
      aria-busy="true"
    >
      <Skeleton className="h-9 w-48 rounded-lg" />
      <Skeleton className="mt-5 h-28 w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}
