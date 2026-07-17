import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 演示资产均为本地定尺寸图片。Vinext 本地预览没有 Cloudflare
  // ASSETS/IMAGES 绑定，因此直接提供原图，避免进入 /_vinext/image。
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
