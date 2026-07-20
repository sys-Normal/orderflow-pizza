import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 메뉴 이미지는 자주 바뀌지 않는다는 전제로 장기 캐시한다.
        // 같은 파일명으로 이미지를 덮어쓰면 캐시 기간 동안 옛 이미지가 보일 수 있으니,
        // 교체 시에는 파일명을 바꿔서 올릴 것.
        source: "/menu/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
