import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  serverExternalPackages: ["knex", "better-sqlite3"],
  partialPrefetching: true,
};

export default nextConfig;
