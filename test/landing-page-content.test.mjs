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
