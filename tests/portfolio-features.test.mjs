import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(
  new URL("../app/portfolio.tsx", import.meta.url),
  "utf8",
);
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const layout = await readFile(
  new URL("../app/layout.tsx", import.meta.url),
  "utf8",
);

test("keeps mobile navigation state-driven and touch-stable", () => {
  assert.match(component, /mobile-bottom-nav/);
  assert.match(component, /showMobileView/);
  assert.match(css, /mobile-panel:not\(\.is-active\)/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /overscroll-behavior-y:\s*none/);
});

test("supports persistent light and dark themes", () => {
  assert.match(component, /portfolio_theme/);
  assert.match(css, /data-theme="light"/);
  assert.match(layout, /localStorage\.getItem\("portfolio_theme"\)/);
});

test("supports admin-managed skills and private access history", () => {
  assert.match(component, /SKILL_TYPE = "Skill"/);
  assert.match(component, /submitSkill/);
  assert.match(component, /Access history/);
  assert.match(component, /No IP addresses or exact/);
});

test("loads portfolio images without avoidable mobile work", () => {
  assert.match(component, /loading="lazy"/);
  assert.match(component, /decoding="async"/);
  assert.match(component, /optimizeImage/);
});
