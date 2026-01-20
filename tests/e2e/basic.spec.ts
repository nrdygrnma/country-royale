import { expect, test } from "@playwright/test";

test.describe("Navigation and Basic Pages", () => {
  test("should load the home page and show hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero-header")).toContainText(
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
    await expect(page.getByTestId("docs-header")).toContainText(
      "Documentation",
    );
  });

  test("should navigate to admin countries page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Admin" }).hover();
    await page.waitForSelector('[data-slot="content"][data-state="open"]');
    await page.locator('a[href="/admin/countries"]').click();

    await expect(page).toHaveURL("/admin/countries");
    await expect(page.getByTestId("countries-header")).toContainText(
      "Countries Management",
    );
  });

  test("should navigate to admin criteria page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Admin" }).click();
    await page.getByRole("link", { name: "Criteria Library" }).click();
    await expect(page).toHaveURL("/admin/criteria");
    await expect(page.getByTestId("criteria-library-header")).toContainText(
      "Criteria Library",
    );
  });
});

test.describe("Session Workflow", () => {
  test("should complete a full session workflow", async ({ page }) => {
    // 1. Create session
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "What are you comparing?" })
      .click();
    await page
      .getByRole("textbox", { name: "What are you comparing?" })
      .fill("Test Session");
    await page.getByRole("button", { name: "Get Started" }).click();

    // Should be on countries page
    await expect(page).toHaveURL(/\/sessions\/.*\/countries/);
    await expect(page.getByTestId("session-countries-header")).toContainText(
      "Pick countries",
    );

    // 2. Select countries
    // Use the search and select menu
    await page.getByRole("button", { name: "Show popup" }).click();
    await page.getByRole("combobox", { name: "Search…" }).fill("Portugal");
    await page.getByRole("option", { name: "Portugal" }).click();
    await page.getByRole("button", { name: "Show popup" }).click();
    await page.getByRole("combobox", { name: "Search…" }).fill("Spain");
    await page.getByRole("option", { name: "Spain" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    // 3. Define criteria
    await expect(page).toHaveURL(/\/sessions\/.*\/criteria/);
    await page.getByTestId("session-criteria-header").click();
    await page.getByText("Quick Presets").click();
    await page.getByText("Quick Presets").click();
    await page
      .getByRole("button", { name: "Digital Nomad 7 criteria" })
      .click();
    await page.getByRole("heading", { name: "Apply Preset?" }).click();
    await page.getByRole("button", { name: "Replace Criteria" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    const nomadButton = page.getByRole("button", { name: "Digital Nomad" });
    if (await nomadButton.isVisible()) {
      await nomadButton.click();
      await page.getByRole("button", { name: "Continue" }).click();
    } else {
      // Fallback: just click continue if criteria already exist or add one manually
      await page.getByRole("button", { name: "Continue" }).click();
    }

    // 4. Scoring
    await expect(page).toHaveURL(/\/sessions\/.*\/scoring/);
    await expect(page.getByTestId("session-scoring-header")).toContainText(
      "Scoring",
    );

    // Score countries
    // In manual mode, we have buttons 1-10
    const scoreButtons = page
      .getByRole("button")
      .filter({ hasText: /^[1-9]$|^10$/ });
    if ((await scoreButtons.count()) >= 2) {
      await scoreButtons.nth(0).click();
      await scoreButtons.nth(1).click();
    }

    await page.getByRole("button", { name: "See results" }).click();

    // 5. Results
    await expect(page).toHaveURL(/\/sessions\/.*\/results/);
    await expect(page.getByTestId("session-results-header")).toContainText(
      "Results",
    );
    await expect(page.getByText("Overall Champion")).toBeVisible();
  });
});
