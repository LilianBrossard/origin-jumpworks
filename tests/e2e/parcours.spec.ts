import { expect, test } from "@playwright/test";

/* Parcours clés du site, en conditions réelles (site exporté). */

test("la racine choisit la langue du navigateur", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/fr\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("le lien d'évitement mène au contenu", async ({ page, isMobile }) => {
  test.skip(isMobile, "clavier");
  await page.goto("/fr/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Aller au contenu" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});

test("changer de langue garde la page et le thème choisi", async ({ page, isMobile }) => {
  await page.goto("/fr/credits/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  // Le premier groupe de thème visible (en-tête bureau ou menu mobile)
  await page.locator("label:visible", { hasText: "Clair" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page
    .getByRole("link", { name: isMobile ? "English" : "EN", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/en\/credits\/$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("la flotte se filtre et l'état reste dans l'URL", async ({ page }) => {
  await page.goto("/fr/fleet/");
  await page.getByRole("button", { name: "Course" }).click();
  await expect(page).toHaveURL(/range=racing/);
  await expect(page.getByText("3 vaisseaux")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(3);

  await page.reload();
  await expect(page.locator("article")).toHaveCount(3);
});

test("une fiche ouvre sa visionneuse au clavier et rend le focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "clavier");
  await page.goto("/fr/fleet/890-jump/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("890 Jump");

  const first = page.getByRole("button", { name: /Agrandir l'image 1 sur/ });
  await first.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/· 1 \//)).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText(/· 2 \//)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(first).toBeFocused();
});

test("le comparateur lit les vaisseaux dans l'URL", async ({ page }) => {
  await page.goto("/fr/compare/?ships=890-jump,m50");
  await expect(page.locator("#compare-0")).toHaveValue("890-jump");
  await expect(page.locator("#compare-1")).toHaveValue("m50");
  await expect(page.getByRole("table")).toContainText("210 m");
});

test("une adresse inconnue affiche la page 404", async ({ page }) => {
  const res = await page.goto("/fr/nulle-part/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Perdu dans le vide");
});

test("aucune page ne déborde horizontalement", async ({ page }) => {
  for (const url of [
    "/fr/",
    "/fr/fleet/",
    "/fr/fleet/600i-explorer/",
    "/fr/compare/?ships=x1,890-jump,85x",
    "/fr/credits/",
  ]) {
    await page.goto(url);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, url).toBeLessThanOrEqual(0);
  }
});

test("les apparitions au défilement fonctionnent après une navigation", async ({ page }) => {
  await page.goto("/fr/");
  await page.locator('a[href="/fr/fleet/300i/"]').first().click();
  await expect(page).toHaveURL(/\/fr\/fleet\/300i\/$/);
  const block = page.locator("#presentation").locator("..").locator("[data-reveal]").first();
  await block.scrollIntoViewIfNeeded();
  await expect(block).toHaveAttribute("data-revealed", "");
});
