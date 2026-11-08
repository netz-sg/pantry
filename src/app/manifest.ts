import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pantry',
    short_name: 'Pantry',
    description: 'Rezepte, Wochenplan, Einkaufsliste und Vorrat an einem Ort.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f4f4f6',
    theme_color: '#f4f4f6',
    lang: 'de',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Einkaufsliste', url: '/shopping' },
      { name: 'Wochenplan', url: '/plan' },
      { name: 'Neues Rezept', url: '/recipes/new' },
    ],
  };
}
