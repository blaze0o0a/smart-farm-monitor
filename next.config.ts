import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    // source-map 완전히 비활성화
    config.devtool = false
    return config
  },
}

export default nextConfig
