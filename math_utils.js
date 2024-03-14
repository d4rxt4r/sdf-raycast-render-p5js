function map_range(value, low1, high1, low2, high2) {
   return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function deg_to_rad(deg) {
   return deg * (Math.PI / 180);
}

function int(float) {
   if (float === 1 / 0) {
      return 1;
   }
   if (float === -1 / 0) {
      return -1;
   }

   return 0 | float;
}

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const abs = Math.abs;
const round = Math.round;
const max = Math.max;
const sqrt = Math.sqrt;

export { deg_to_rad, map_range, sin, tan, cos, max, sqrt, int, abs, round };
