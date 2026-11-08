import Link from 'next/link';
import { SectionTitle } from '@/components/ui/page-header';
import { Photo } from '@/components/ui/photo';

/** Waagerechte Reihe breiter Fotokarten, wie bei Streamingdiensten. */
export function PosterRow({
  title,
  link,
  items,
}: {
  title: string;
  link?: { href: string; label: string };
  items: { id: string; title: string; imagePath?: string | null; meta?: string }[];
}) {
  if (!items.length) return null;
  return (
    <section>
      <SectionTitle
        action={
          link ? (
            <Link href={link.href} className="text-subhead text-label-2 hover:text-label">
              {link.label}
            </Link>
          ) : undefined
        }
      >
        {title}
      </SectionTitle>
      <ul className="no-scrollbar row-bleed flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
        {items.map((r) => (
          <li key={r.id} className="w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[280px]">
            <Link href={`/recipes/${r.id}`} className="group block">
              <div className="overflow-hidden rounded-[10px]">
                <Photo
                  path={r.imagePath}
                  alt=""
                  seed={r.title}
                  className="aspect-video w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-2 line-clamp-1 font-semibold">{r.title}</p>
              {r.meta ? <p className="line-clamp-1 text-footnote text-label-2">{r.meta}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
