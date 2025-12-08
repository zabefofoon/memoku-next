import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '.'),
  },
  /* config options here */
  experimental: {
    viewTransition: true,
  },
}

export default nextConfig
