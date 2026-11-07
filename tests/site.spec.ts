import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const chapters = {
  en: ["Laufwort", "Redekunst-Challenge", "7SETS", "PortfolioOS", "Aéro", "AFREETECH", "QTA TECH", "Bachelor of Engineering", "Goethe-Zertifikat B2", "Write to me"],
  fr: ["Laufwort", "Redekunst-Challenge", "7SETS", "PortfolioOS", "Aéro", "AFREETECH", "QTA TECH", "Bachelor of Engineering", "Goethe-Zertifikat B2", "Écris-moi"],
};
const studies = [
  ["redekunst-challenge", "Redekunst-Challenge"],
  ["laufwort", "Laufwort"],
  ["7sets", "7SETS"],
  ["portfolio-os", "PortfolioOS"],
  ["aero", "Aéro"],
] as const;

/** Fails the test on any uncaught error in the page. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function expectAccessible(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([]);
}

for (const lang of ["en", "fr"] as const) {
  test(`${lang}: the tour walks every chapter and ends on contact`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(`/${lang}?tour=3d`);
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 20_000 });
    await expect(page.locator("main h2")).toHaveText(chapters[lang]);
    for (const id of ["work", "about", "contact"]) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator('#contact a[href^="mailto:"]')).toHaveAttribute("href", "mailto:sohromaric30@gmail.com");
    await expectAccessible(page);
    expect(errors).toEqual([]);
  });
}

test("reduced motion gets the lite tour: no WebGL, the same chapters", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto("/en");
  await expect(page.locator("main h2")).toHaveText(chapters.en);
  // The lite tour shows still captures of the devices
  await expect(page.locator("[data-stop] img").first()).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expectAccessible(page);
  expect(errors).toEqual([]);
  await context.close();
});

for (const [slug, name] of studies) {
  test(`case study ${slug} in both languages, linked to the next one`, async ({ page }) => {
    for (const lang of ["en", "fr"]) {
      const response = await page.goto(`/${lang}/work/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(name);
      await expect(page.locator(`article nav a[href^="/${lang}/work/"]`)).toHaveCount(1);
    }
    await expectAccessible(page);
  });
}

test("case studies and CV stay readable in the dark", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  for (const path of ["/fr/work/laufwort", "/fr/cv"]) {
    await page.goto(path);
    await expectAccessible(page);
  }
  await context.close();
});

for (const lang of ["en", "fr"]) {
  test(`${lang}: the CV prints on one A4 sheet`, async ({ page, browserName }, info) => {
    test.skip(browserName !== "chromium" || info.project.name !== "desktop", "PDF output is Chromium desktop only");
    await page.goto(`/${lang}/cv`);
    // Measured in the site's faces, as anyone printing it sees them
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ preferCSSPageSize: true });
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)).toHaveLength(1);
  });
}

test("the root redirects to the visitor's language", async ({ browser }) => {
  const page = await browser.newPage({ locale: "fr-FR", extraHTTPHeaders: { "accept-language": "fr-FR,fr;q=0.9" } });
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr$/);
  await page.close();
});

test("an unknown page answers 404", async ({ page }) => {
  const response = await page.goto("/en/nothing-here");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Nothing on the bench here");
});
