/** @type {import('next').NextConfig} */
const repoName = "arjun-neupane-academic-hub";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? `/${repoName}` : "";

const nextConfig = {
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: isGithubPages,
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
