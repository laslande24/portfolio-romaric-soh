import { defineConfig, devices } from "@playwright/test";

/*
  The suite runs against a production build (`npm test` builds first, see
  pretest) on a port of its own: the dev server injects its overlay into the
  page, which nobody visiting the site loads, and 3000 can stay open meanwhile.
  The server is plain node, not npm, so it stops with the run on Windows too.
*/
const PORT = 3200;

export default defineConfig({
  testDir: "./tests",
  // The 3D tour plus an axe scan runs ~30 s on SwiftShader
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // WebGL in headless Chromium goes through SwiftShader
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    // A server left on this port would serve an older build
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
