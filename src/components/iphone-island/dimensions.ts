/**
 * iPhone dimensions, ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `_buildPhone`, lines 725-745).
 * Shared by `IPhonePro.tsx` and its screen/texture modules.
 */

/** Body width/height (artifact `PW`/`PH`). */
export const PHONE_WIDTH = 0.74;
export const PHONE_HEIGHT = 1.52;
/** Body extrusion depth and bevel (artifact `d`/`bv`). */
export const PHONE_DEPTH = 0.05;
export const PHONE_BEVEL = 0.014;

/** Screen cutout size (artifact `SW`/`SH`) — smaller than the body, the bezel showing around it. */
export const SCREEN_WIDTH = 0.69;
export const SCREEN_HEIGHT = 1.47;
/** Screen mesh Z offset from the body's front face. */
export const SCREEN_Z = PHONE_DEPTH / 2 + PHONE_BEVEL + 0.0011;
/** Front glass Z offset — sits just in front of the body, behind the screen. */
export const FRONT_GLASS_Z = PHONE_DEPTH / 2 + PHONE_BEVEL + 0.0004;

/** Camera plate (artifact line 739-740). */
export const CAMERA_PLATE_SIZE = 0.31;
export const CAMERA_PLATE_RADIUS = 0.075;
export const CAMERA_PLATE_POSITION: readonly [number, number, number] = [0.17, 0.56, -(PHONE_DEPTH / 2 + PHONE_BEVEL) - 0.003];

/** The 3 camera lenses (artifact line 742-743): XY positions, shared Z. */
export const LENS_RADIUS_TOP = 0.046;
export const LENS_RADIUS_BOTTOM = 0.05;
export const LENS_DEPTH = 0.022;
export const LENS_Z = -(PHONE_DEPTH / 2 + PHONE_BEVEL) - 0.013;
export const LENS_POSITIONS_XY: ReadonlyArray<readonly [number, number]> = [
  [0.11, 0.62],
  [0.11, 0.5],
  [0.23, 0.56],
];

/** The 4 side buttons (artifact line 744-745): [x, y, lengthScale] — one shared `BoxGeometry(0.012, 1, 0.022)`, stretched along Y per button. */
export const BUTTON_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
  [PHONE_WIDTH / 2 + PHONE_BEVEL + 0.003, 0.3, 0.16],
  [-(PHONE_WIDTH / 2 + PHONE_BEVEL + 0.003), 0.38, 0.1],
  [-(PHONE_WIDTH / 2 + PHONE_BEVEL + 0.003), 0.24, 0.1],
  [-(PHONE_WIDTH / 2 + PHONE_BEVEL + 0.003), 0.55, 0.05],
];
