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

/**
 * Calculates the index of a pixel in an image given its x, y coordinates and channel number.
 * @param {number} x - The x coordinate of the pixel.
 * @param {number} y - The y coordinate of the pixel.
 * @param {number} image_width - The width of the image.
 * @param {number} channel - The channel number (0-3) of the pixel.
 * @returns {number} The index of the pixel in the image array.
 */
function get_pixel_index(x, y, image_width, channel) {
   return (y * image_width + x) * 4 + channel;
}

/**
 * Sets the pixel value of an image at a specific location.
 *
 * @param {number} x - The x coordinate of the pixel to set.
 * @param {number} y - The y coordinate of the pixel to set.
 * @param {number[]} color - An array of four numbers representing the red, green, blue, and alpha values of the pixel.
 * @param {number} image_width - The width of the image.
 * @param {number[]} image_data - The image data as an array of numbers.
 */
function set_image_pixel(x, y, color, image_width, image_data) {
   const [r, g, b, a] = color;
   const r_index = get_pixel_index(x, y, image_width, 0);

   image_data[r_index] = r;
   image_data[r_index + 1] = g;
   image_data[r_index + 2] = b;
   image_data[r_index + 3] = a;
}

const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;

const abs = Math.abs;
const round = Math.round;
const max = Math.max;
const sqrt = Math.sqrt;

export { deg_to_rad, map_range, sin, tan, cos, max, sqrt, int, abs, round, get_pixel_index, set_image_pixel };
