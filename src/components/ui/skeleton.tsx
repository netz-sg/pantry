import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-card', className)} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div
      className="px-5 pt-[calc(env(safe-area-inset-top)+1.75rem)] md:px-12 md:pt-32"
      aria-busy="true"
      aria-label="Wird geladen"
    >
      <Skeleton className="h-9 w-40 rounded-lg" />
      <Skeleton className="mt-6 h-64 w-full" />
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square max-md:hidden" />
        <Skeleton className="aspect-square max-md:hidden" />
      </div>
    </div>
  );
}
