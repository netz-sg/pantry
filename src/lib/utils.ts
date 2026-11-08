import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Eigene Schriftgrößen und Radien bekannt machen, sonst hält twMerge text-footnote für eine Farbe
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['large-title', 'title', 'title-2', 'body', 'callout', 'subhead', 'footnote', 'caption'] },
      ],
      rounded: [{ rounded: ['card', 'hero'] }],
      shadow: [{ shadow: ['glass', 'elevated'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function totalMinutes(r: {
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  restMinutes?: number | null;
}) {
  return (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0) + (r.restMinutes ?? 0);
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('') || '?'
  );
}

export function mediaUrl(imagePath: string | null | undefined) {
  return imagePath ? `/media/${imagePath}` : null;
}
