import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/klub',
    name: 'Gladiator Gym',
    short_name: 'Gladiator',
    description: 'Členská aplikácia Gladiator Gym Lučenec',
    start_url: '/klub',
    scope: '/klub',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    lang: 'sk',
    dir: 'ltr',
    categories: ['fitness', 'health', 'sports'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
