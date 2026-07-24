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
