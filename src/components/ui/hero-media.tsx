import { HERO_GLOW } from './hero-glow';
import { Photo } from './photo';

/**
 * Hintergrund großer Bildflächen. Foto und Abdunklung laufen gemeinsam weich in den
 * Seitenhintergrund aus, dadurch gibt es keine harte Kante und keinen grauen Schleier.
 * Dunkel wird nur hinter dem Text, also links.
 */
export function HeroMedia({
  path,
  alt,
  className,
}: {
  path?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`hero-media absolute inset-0 -z-10 overflow-hidden ${className ?? ''}`}>
      {path ? (
        <Photo
          path={path}
          alt={alt}
          seed=""
          priority
          className="absolute inset-0 size-full scale-105 object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0" style={{ background: HERO_GLOW }} />
      )}
      {path ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(900px 560px at 10% 52%, rgba(0,0,0,0.62), transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.12) 45%, transparent 70%)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-40"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent)' }}
          />
        </>
      ) : null}
    </div>
  );
}
