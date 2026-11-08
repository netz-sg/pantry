'use client';

import { useEffect, useState } from 'react';

/**
 * Zustand der Navigation beim Scrollen.
 * scrolled ist wahr, sobald die Seite nicht mehr ganz oben steht, dann wird die Navigation kleiner.
 * away ist wahr, wenn weiter unten nach unten gescrollt wird, dann gleitet sie weg.
 * Beim Hochscrollen kommt sie zurück.
 */
export function useScrollNav() {
  const [state, setState] = useState({ scrolled: false, away: false });
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const dy = y - last;
      last = y;
      setState((prev) => {
        const scrolled = y > 24;
        let away = prev.away;
        if (y < 480) away = false;
        else if (dy > 6) away = true;
        else if (dy < -6) away = false;
        return prev.scrolled === scrolled && prev.away === away ? prev : { scrolled, away };
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return state;
}
