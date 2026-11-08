import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div aria-busy="true">
      <Skeleton className="bleed h-[460px] rounded-none md:h-[560px]" />
      <div className="px-5 pt-6 md:px-12">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-1/2 rounded-md" />
        <Skeleton className="mt-6 h-14 w-full rounded-[16px]" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </div>
  );
}
