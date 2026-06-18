const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();

  // Default (no override, geo-detect fails on localhost -> USD default)
  let page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const defaultPrice = await page.locator("#pricing .gradient-text").first().textContent();
  console.log("Homepage pricing card (default):", defaultPrice);
  await page.screenshot({ path: "verify-home-default.png", fullPage: false });

  // Switch CountrySelector to Japan and re-check
  await page.selectOption("#pricing select", "JP");
  await page.waitForTimeout(1500);
  const jpPrice = await page.locator("#pricing .gradient-text").first().textContent();
  const jpRef = await page.locator("#pricing").textContent();
  console.log("Homepage pricing card (Japan):", jpPrice);
  console.log("Contains USD reference line:", jpRef.includes("USD"));
  await page.screenshot({ path: "verify-home-japan.png", fullPage: false });
  await page.close();

  // Checkout page default
  page = await browser.newPage();
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const checkoutDefault = await page.locator(".gradient-text").first().textContent();
  const payBtnDefault = await page.locator("button.btn-primary").textContent();
  console.log("Checkout price (default):", checkoutDefault, "| button:", payBtnDefault.trim());
  await page.screenshot({ path: "verify-checkout-default.png", fullPage: false });

  // Checkout switched to Japan
  await page.selectOption("select", "JP");
  await page.waitForTimeout(1500);
  const checkoutJp = await page.locator(".gradient-text").first().textContent();
  const payBtnJp = await page.locator("button.btn-primary").textContent();
  console.log("Checkout price (Japan):", checkoutJp, "| button:", payBtnJp.trim());
  await page.screenshot({ path: "verify-checkout-japan.png", fullPage: false });

  console.log("console errors check passed (no throw)");
  await browser.close();
})().catch((err) => {
  console.error("VERIFY FAILED:", err);
  process.exit(1);
});
