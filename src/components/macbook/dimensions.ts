/**
 * MacBook dimensions and keyboard layout, ported 1:1 from the approved
 * artifact (`docs/reference/artifact-a/Hero.dc.html`, `_buildMac`, lines
 * 658-721). Shared by `MacBook.tsx`, `Keyboard.tsx` and `Lid.tsx` so the
 * same numbers aren't repeated — and risk drifting — across three files.
 */

/** Chassis width (artifact `W`). */
export const MAC_WIDTH = 3.0;
/** Base depth (artifact `D`). */
export const MAC_DEPTH = 2.08;
/** Base extrusion bevel (artifact `bt`). */
export const BASE_BEVEL = 0.014;
/** Base top surface height — `0.07` extrude depth + `bt * 2` (artifact `bT`, line 664). Every part resting "on" the base (keyboard, trackpad, hinge, lid pivot) is positioned relative to this. */
export const BASE_THICKNESS = 0.07 + BASE_BEVEL * 2;

/** Lid height (artifact `LH`). */
export const LID_HEIGHT = 2.04;
/** Lid extrusion bevel (artifact `lt`). */
export const LID_BEVEL = 0.01;

/**
 * Lid pivot, in the Mac group's local space (artifact line 704): raised
 * above the chassis surface rather than sitting flush with it, so the
 * closed lid's glass clears the keycaps instead of intersecting them — a
 * bug the artifact itself calls out as fixed by this exact offset.
 */
export const LID_PIVOT: readonly [number, number, number] = [0, BASE_THICKNESS + 0.02, -MAC_DEPTH / 2 + 0.03];

/** Hinge barrel position (artifact line 700). */
export const HINGE_POSITION: readonly [number, number, number] = [0, BASE_THICKNESS - 0.004, -MAC_DEPTH / 2 + 0.02];
/** Hinge barrel radius/length (artifact line 699: `CylinderGeometry(0.042, 0.042, 2.3, 20)`). */
export const HINGE_RADIUS = 0.042;
export const HINGE_LENGTH = 2.3;

/** Trackpad position (artifact line 698). */
export const TRACKPAD_POSITION: readonly [number, number, number] = [0, BASE_THICKNESS + 0.0007, 0.62];
export const TRACKPAD_SIZE: readonly [number, number] = [1.16, 0.7];

/**
 * Keyboard row layout (artifact lines 668-675): each row is a list of key
 * widths in keyboard "units" (`u`) plus the row's own depth (`d`). Summing
 * every row's unit count gives **77** keys total — the plan's own text
 * says "79"; the artifact's actual array literals (verified by counting
 * each row by hand against the source) give 77, and the real array is
 * what this file ports, not the plan's rounded prose.
 */
export const KEYBOARD_ROWS: ReadonlyArray<{ readonly u: readonly number[]; readonly d: number }> = [
  { u: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], d: 0.075 },
  { u: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], d: 0.14 },
  { u: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], d: 0.14 },
  { u: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75], d: 0.14 },
  { u: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], d: 0.14 },
  { u: [1, 1, 1, 1.25, 5.1, 1.25, 1, 1, 1, 1], d: 0.14 },
];

export const KEY_COUNT = KEYBOARD_ROWS.reduce((sum, row) => sum + row.u.length, 0);

/** Keyboard block total width (artifact `KW`) and gap between keys (artifact `gap`). */
export const KEYBOARD_WIDTH = 2.46;
export const KEY_GAP = 0.022;
/** Z position of the first row's center (artifact line 682: `z = -0.76`). */
export const KEYBOARD_Z_START = -0.76;

/** The well beneath the keyboard (artifact line 665). */
export const WELL_SIZE: readonly [number, number] = [2.6, 1.02];
export const WELL_POSITION: readonly [number, number, number] = [0, BASE_THICKNESS + 0.0008, -0.3];
