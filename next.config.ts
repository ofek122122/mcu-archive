import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Hosts allowed for `Movie.posterUrl`. Local files under /public/posters
     * need no entry here. Add a host before pointing posters at it, or
     * next/image will refuse to optimize the URL.
     */
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/images/**" },
    ],
  },
};

export default nextConfig;
