import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("explains what creators can sell and what buyers keep", () => {
  assert.match(page, /More than a file delivery/);
  assert.match(page, /Templates, presets, courses, guides, downloads, and more/);
  assert.match(page, /latest version, license, and setup notes/);
});

test("shows the creator workflow from product to buyer library", () => {
  assert.match(page, /From your product to their library/);
  assert.match(page, /01\s*<\/span><h3>Publish once\.<\/h3>/);
  assert.match(page, /02\s*<\/span><h3>Deliver a real home\.<\/h3>/);
  assert.match(page, /03\s*<\/span><h3>Keep the relationship alive\.<\/h3>/);
});

test("answers early-access questions with accessible disclosure controls before the final CTA", () => {
  const faqStart = page.indexOf('<section class="faq"');
  const ctaStart = page.indexOf('<section class="cta"');

  assert.ok(faqStart > page.indexOf('<section class="statement"'));
  assert.ok(faqStart < ctaStart);
  assert.match(page, /<section class="faq" aria-labelledby="faq-title">/);
  assert.match(page, /<h2 id="faq-title">Questions, answered\.<\/h2>/);
  assert.equal((page.match(/<details>/g) || []).length, 5);
  assert.match(page, /<summary>What is Navolume\?<\/summary>/);
  assert.match(page, /<summary>Who is it for\?<\/summary>/);
  assert.match(page, /<summary>What can creators sell\?<\/summary>/);
  assert.match(page, /<summary>What does early access mean\?<\/summary>/);
  assert.match(page, /<summary>Will I get a confirmation email\?<\/summary>/);
  assert.match(page, /<details>\s*<summary>What is Navolume\?<\/summary><p>A home for creators to sell digital products and for customers to keep what they buy\.<\/p>\s*<\/details>/);
  assert.match(page, /\.faq details:focus-within\{[^}]*border-color:var\(--lime\)/);
  assert.match(page, /\.faq summary:focus-visible\{[^}]*outline:2px solid var\(--lime\)/);
});

test("smoothly transitions theme colors while respecting reduced-motion preferences", () => {
  assert.match(page, /html\.theme-transitioning,html\.theme-transitioning \*\{transition:background-color \.25s ease,color \.25s ease,border-color \.25s ease,box-shadow \.25s ease\}/);
  assert.match(page, /@media\(prefers-reduced-motion:reduce\)\{html\.theme-transitioning,html\.theme-transitioning \*\{transition:none\}\}/);
  assert.match(page, /classList\.add\('theme-transitioning'\)/);
  assert.match(page, /classList\.remove\('theme-transitioning'\)/);
});

test("adds subtle landing-page motion while honoring reduced-motion preferences", () => {
  assert.match(page, /@keyframes hero-rise\{from\{opacity:0;transform:translateY\(18px\)\}to\{opacity:1;transform:translateY\(0\)\}\}/);
  assert.match(page, /\.hero>\*\{animation:hero-rise \.7s cubic-bezier\(\.2,\.8,\.2,1\) both\}/);
  assert.match(page, /\.product-frame\{[^}]*animation:preview-float 6s ease-in-out infinite/);
  assert.match(page, /\.product-type:hover,\.workflow-step:hover,\.principle:hover\{transform:translateY\(-5px\)/);
  assert.match(page, /@media\(prefers-reduced-motion:reduce\)\{[^}]*\.hero>\*,\.product-frame\{animation:none/);
});

test("carries the selected site theme into the buyer-library preview", () => {
  assert.match(page, /:root\{[^}]*--preview-surface:#10151c;[^}]*--preview-text:#f3f1e9/);
  assert.match(page, /:root\[data-theme="light"\]\{[^}]*--preview-surface:#e9ede6;[^}]*--preview-text:#1a2520/);
  assert.match(page, /\.app\{[^}]*background:var\(--preview-surface\);color:var\(--preview-text\)/);
  assert.match(page, /\.app-top\{[^}]*background:var\(--preview-top\)/);
  assert.match(page, /\.preview-nav\{[^}]*background:var\(--preview-nav\)/);
});

test("keeps the hero actions inside the single-column tablet layout", () => {
  assert.match(page, /@media\(max-width:800px\)[^@]*\.actions\{display:block\}/);
  assert.match(page, /@media\(max-width:800px\)[^@]*\.quiet-link\{margin-top:12px\}/);
});

test("uses consistent inline SVG theme icons and a custom-styled email field on mobile browsers", () => {
  assert.match(page, /class="theme-icon theme-icon-moon"/);
  assert.match(page, /class="theme-icon theme-icon-sun"/);
  assert.doesNotMatch(page, /aria-hidden="true">☾/);
  assert.match(page, /\.theme-icon\{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1\.8\}/);
  assert.match(page, /\.signup input\{[^}]*appearance:none;-webkit-appearance:none;/);
  assert.match(page, /\.signup input\{[^}]*background:var\(--surface-alt\)/);
  assert.match(page, /\.signup input\{[^}]*box-shadow:inset 0 1px 0 rgba\(255,255,255,\.05\)/);
  assert.match(page, /\.signup input::placeholder\{color:var\(--muted\);opacity:1\}/);
  assert.match(page, /\.signup input:focus\{border-color:var\(--lime\);[^}]*box-shadow:0 0 0 4px rgba\(196,255,122,\.12\)/);
  assert.match(page, /\.signup input\{[^}]*font:14px Manrope,Arial,sans-serif/);
});

test("keeps hero controls aligned and gives the two-column hero enough room", () => {
  assert.match(page, /\.actions\{display:grid;grid-template-columns:minmax\(0,480px\) auto;align-items:start/);
  assert.match(page, /\.quiet-link\{margin-top:23px\}/);
  assert.match(page, /@media\(max-width:1200px\)\{\.hero\{grid-template-columns:1fr;gap:74px\}/);
  assert.match(page, /\.hero \.product-frame\{max-width:760px;width:100%;margin:auto\}/);
});


test("offers an accessible seller dashboard preview alongside the buyer library", () => {
  assert.match(page, /class="preview-mode-toggle" role="group" aria-label="Preview mode"/);
  assert.match(page, /data-preview-mode="buyer"/);
  assert.match(page, /data-preview-mode="seller"/);
  assert.match(page, /id="seller-preview" hidden/);
  assert.match(page, /Seller overview/);
  assert.match(page, /Total sales/);
  assert.match(page, /Revenue this month/);
  assert.match(page, /aria-label="Sales over the last seven days"/);
  assert.match(page, /previewModeButtons\.forEach/);
  assert.match(page, /sellerPreview\.hidden = mode !== 'seller'/);
});

test("supports keyboard navigation and visible focus in buyer-preview tabs", () => {
  assert.match(page, /role="tablist" aria-orientation="vertical"/);
  assert.match(page, /id="tab-library" tabindex="0"/);
  assert.match(page, /id="tab-updates" tabindex="-1"/);
  assert.match(page, /id="tab-receipts" tabindex="-1"/);
  assert.match(page, /\.preview-tab:focus-visible\{[^}]*outline:2px solid var\(--lime\);outline-offset:2px/);
  assert.match(page, /const activatePreviewTab = \(tab\) =>/);
  assert.match(page, /item\.setAttribute\('tabindex', selected \? '0' : '-1'\)/);
  assert.match(page, /\['ArrowDown', 'ArrowRight'\]/);
  assert.match(page, /\['ArrowUp', 'ArrowLeft'\]/);
  assert.match(page, /event\.key === 'Home'/);
  assert.match(page, /event\.key === 'End'/);
  assert.match(page, /nextTab\.focus\(\)/);
});
