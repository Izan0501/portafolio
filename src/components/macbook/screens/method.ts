/**
 * The "método" chapter's screen. Verified against the artifact's own
 * dispatch (`Hero.dc.html`, `_screens`, line 1496):
 * `if (id === 'hero' || id === 'open') mode = 'boot'` — both the `hero`
 * and `open` chapters draw the exact same `boot` screen. There is no
 * separate "método" draw in the source to port; this file re-exports
 * `boot.ts` rather than inventing a second screen that doesn't exist in
 * the approved artifact.
 */
export { drawBoot as drawMethod, bootScreenKey as methodScreenKey, type DrawBootParams as DrawMethodParams } from "./boot";
