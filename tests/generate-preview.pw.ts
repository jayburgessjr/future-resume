import { test, expect } from "@playwright/test";

test("Generate shows resume in Live Preview", async ({ page }) => {
  await page.goto("/builder"); // adjust route
  await page.getByRole("button", { name: /generate/i }).click();
  await expect(page.getByText(/Targeted résumé|Generated/i)).toBeVisible();
});
