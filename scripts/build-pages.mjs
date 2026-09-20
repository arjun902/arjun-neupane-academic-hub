import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  GITHUB_PAGES: "true",
  NEXT_OUTPUT: "export",
  NEXT_PUBLIC_BASE_PATH: "/arjun-neupane-academic-hub",
  NEXT_PUBLIC_SITE_URL: "https://arjun902.github.io/arjun-neupane-academic-hub",
};
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  { stdio: "inherit", env },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
