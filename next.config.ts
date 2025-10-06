import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '.'),
  },
  experimental: {
    viewTransition: true,
  },
  /* config options here */
}

export default nextConfig
