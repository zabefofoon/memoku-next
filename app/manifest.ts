// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Memoku',
    short_name: 'Memoku',
    description: 'Personal task manager',
    start_url: '/', // basePath 쓰면 그에 맞춰 변경
    display: 'fullscreen',
    background_color: '#f3f4f6',
    theme_color: 'transparent',
    icons: [
      { src: '/images/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
      { src: '/images/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
