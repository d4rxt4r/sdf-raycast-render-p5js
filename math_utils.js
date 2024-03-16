/**
 * Maps a value from one range to another.
 *
 * @param {number} value - The value to be mapped.
 * @param {number} current_low - The lower bound of the current range.
 * @param {number} current_high - The upper bound of the current range.
 * @param {number} target_low - The lower bound of the target range.
 * @param {number} target_high - The upper bound of the target range.
 * @return {number} The mapped value.
 */
function map_range(value, current_low, current_high, target_low, target_high) {
   return target_low + ((target_high - target_low) * (value - current_low)) / (current_high - current_low);
}

/**
 * Converts an angle from degrees to radians.
 *
 * @param {number} deg - The angle in degrees.
 * @return {number} The angle in radians.
 */
function deg_to_rad(deg) {
   return deg * (Math.PI / 180);
}

/**
 * Rounds a number down to the nearest integer.
 *
 * @param {number} float - The number to round down.
 * @return {number} The rounded down integer.
 */
function int(float) {
   if (float === Number.POSITIVE_INFINITY) {
      return 1;
   }
   if (float === Number.NEGATIVE_INFINITY) {
      return -1;
   }

   return Math.trunc(float);
}

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const abs = Math.abs;
const round = Math.round;
const max = Math.max;
const sqrt = Math.sqrt;

export { deg_to_rad, map_range, sin, tan, cos, max, sqrt, int, abs, round };
