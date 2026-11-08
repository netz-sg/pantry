import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-5 my-4 flex flex-col items-start rounded-[16px] border border-dashed border-separator bg-[radial-gradient(600px_220px_at_0%_0%,var(--tint-soft),transparent_70%)] px-6 py-10 md:mx-12 md:px-10 md:py-14">
      <span
        aria-hidden
        className="mb-5 grid size-12 place-items-center rounded-full bg-fill text-tint [&_svg]:size-6"
      >
        {icon}
      </span>
      <h2 className="headline text-[1.9rem] md:text-[2.4rem]">{title}</h2>
      {text ? <p className="mt-3 max-w-prose text-callout leading-relaxed text-label-2">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
