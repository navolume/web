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
