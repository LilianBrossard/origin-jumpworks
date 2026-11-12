import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de bout en bout sur le site exporté (`out/`), servi en local comme en production.
 * Navigateur : le Chrome installé sur la machine (aussi présent sur GitHub Actions),
 * pour ne rien télécharger.
 */
const PORT = 4174;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome",
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "bureau", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: `pnpm dlx serve@14.2.4 out -l ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
