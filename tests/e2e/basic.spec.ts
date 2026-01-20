import { expect, test } from "@playwright/test";

test.describe("Navigation and Basic Pages", () => {
  test("should load the home page and show hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h2")).toContainText(
      "Discover your perfect match.",
    );
    // Check for "What are you comparing?" if no sessions exist
    await expect(
      page.getByPlaceholder("What are you comparing?"),
    ).toBeVisible();
  });

  test("should navigate to docs page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Docs" }).click();
    await expect(page).toHaveURL("/docs");
    await expect(page.locator("h1")).toContainText("Documentation");
  });

  test("should navigate to admin countries page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("link", { name: "Countries" }).click();
    await expect(page).toHaveURL("/admin/countries");
    await expect(page.locator("h1")).toContainText("Countries Management");
  });

  test("should navigate to admin criteria page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("link", { name: "Criteria Library" }).click();
    await expect(page).toHaveURL("/admin/criteria");
    await expect(page.locator("h1")).toContainText("Criteria Library");
  });
});

test.describe("Session Workflow", () => {
  test("should complete a full session workflow", async ({ page }) => {
    // 1. Create session
    await page.goto("/");
    await page.getByPlaceholder("What are you comparing?").fill("Test Session");
    await page.getByRole("button", { name: "Get Started" }).click();

    // Should be on countries page
    await expect(page).toHaveURL(/\/sessions\/.*\/countries/);
    await expect(page.locator("h1")).toContainText("Pick countries");

    // 2. Select countries
    // Use the search and select menu
    await page.getByPlaceholder("Search and add countries...").click();
    await page.keyboard.type("Portugal");
    await page.keyboard.press("Enter");

    await page.getByPlaceholder("Search and add countries...").click();
    await page.keyboard.type("Spain");
    await page.keyboard.press("Enter");

    await page.getByRole("button", { name: "Continue" }).click();

    // 3. Define criteria
    await expect(page).toHaveURL(/\/sessions\/.*\/criteria/);
    await expect(page.locator("h1")).toContainText("Criteria");

    // Add a preset (Digital Nomad) - check if this button exists
    // The button might have text like "Digital Nomad"
    const nomadButton = page.getByRole("button", { name: "Digital Nomad" });
    if (await nomadButton.isVisible()) {
      await nomadButton.click();
      await page.getByRole("button", { name: "Start scoring" }).click();
    } else {
      // Fallback: just click continue if criteria already exist or add one manually
      await page.getByRole("button", { name: "Start scoring" }).click();
    }

    // 4. Scoring
    await expect(page).toHaveURL(/\/sessions\/.*\/scoring/);
    await expect(page.locator("h1")).toContainText("Scoring");

    // Score countries
    // In manual mode, we have buttons 1-10
    const scoreButtons = page
      .locator("button")
      .filter({ hasText: /^[1-9]$|^10$/ });
    if ((await scoreButtons.count()) >= 2) {
      await scoreButtons.nth(0).click();
      await scoreButtons.nth(1).click();
    }

    await page.getByRole("button", { name: "See results" }).click();

    // 5. Results
    await expect(page).toHaveURL(/\/sessions\/.*\/results/);
    await expect(page.locator("h1")).toContainText("Results");
    await expect(page.getByText("The Winner")).toBeVisible();
  });
});
