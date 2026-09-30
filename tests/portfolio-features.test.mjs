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

test("supports admin-managed skills and consent-based access history", () => {
  assert.match(component, /SKILL_TYPE = "Skill"/);
  assert.match(component, /submitSkill/);
  assert.match(component, /Access history/);
  assert.match(component, /portfolio_full_ip_consent_v1/);
  assert.match(component, /https:\/\/ipapi\.co\/json\//);
  assert.match(component, /ipAddress/);
  assert.match(component, /approximateLocation/);
  assert.match(component, /SUBMISSION_MARKER/);
  assert.match(component, /parseStoredSubmission/);
  assert.match(component, /visitorDetails/);
  assert.match(component, /Cookies & visitor privacy/);
  assert.match(component, /Exact GPS is not requested/);
  assert.match(component, /full public IP/);
  assert.doesNotMatch(component, /data_consent/);
});

test("loads portfolio images without avoidable mobile work", () => {
  assert.match(component, /loading="lazy"/);
  assert.match(component, /decoding="async"/);
  assert.match(component, /optimizeImage/);
});

test("page entrance keeps login and editor dialogs anchored to the viewport", () => {
  const entrance = css.match(/@keyframes page-enter\s*\{([\s\S]*?)\n\}/)?.[1];

  assert.ok(entrance, "preserves the page entrance animation");
  assert.match(entrance, /opacity:\s*0/);
  assert.match(entrance, /opacity:\s*1/);
  assert.doesNotMatch(entrance, /\b(?:transform|translate|filter|perspective):/);
  assert.match(css, /\.modal-backdrop\s*\{\s*position:\s*fixed;/);
});

test("phone layouts keep all six destinations and readable controls", () => {
  const dock = component.match(/<nav className="mobile-bottom-nav"[\s\S]*?<\/nav>/)?.[0];

  assert.ok(dock, "preserves the mobile navigation");
  for (const view of ["home", "about", "works", "skills", "feedback", "contact"]) {
    assert.ok(dock.includes(`showMobileView("${view}")`), `${view} stays accessible`);
  }
  assert.match(component, /mobile-brand-copy/);
  assert.match(component, /window\.history\.replaceState\(null, "", destination\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /--mobile-dock-clearance/);
  assert.match(css, /min-height:\s*52px;\s*font-size:\s*1rem;/);
});

test("mobile dialogs lock background scrolling and keep keyboard focus inside", () => {
  assert.match(component, /document\.body\.style\.overflow = "hidden"/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /event\.shiftKey && document\.activeElement === first/);
  assert.match(component, /document\.body\.style\.overflow = previousOverflow/);
});
