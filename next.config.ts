import type { NextConfig } from "next";

// 브라우저는 언제나 같은 출처의 /api만 부르고, Next가 API 서버로 넘긴다(rewrites).
// rewrites는 빌드 때 정해지므로 YEOUN_API_ORIGIN을 바꾸면 web을 다시 빌드해야 한다.
const apiOrigin = (process.env.YEOUN_API_ORIGIN || "http://localhost:8000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // 잠든 API(Render 무료)가 깨어나는 데 1분 가까이 걸릴 수 있다
    proxyTimeout: 120_000,
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
