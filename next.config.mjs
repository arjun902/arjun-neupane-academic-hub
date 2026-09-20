/** @type {import('next').NextConfig} */
const repoName = "arjun-neupane-academic-hub";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const isStaticExport = process.env.NEXT_OUTPUT === "export";
const isProduction = process.env.NODE_ENV === "production";
const basePath = isGithubPages ? `/${repoName}` : "";

const securityHeaders = [
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" }
];

const nextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: isGithubPages || isStaticExport,
    formats: ["image/avif", "image/webp"]
  },
  ...(isStaticExport || !isProduction ? {} : { async headers() { return [{ source: "/(.*)", headers: securityHeaders }]; } })
};

export default nextConfig;
