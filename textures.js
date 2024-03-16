const TEX_WIDTH = 128;
const TEX_HEIGHT = 128;

const SHADING_TYPE = {
   NONE: 0,
   SIDE: 1,
   DISTANCE: 2
};

const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const GREEN = [0, 255, 0];
const FLOOR_COLOR = [200, 200, 200];
const CEILING_COLOR = [100, 100, 100];

const TEX_PATHS = [
   'textures/redbrick.png',
   'textures/eagle.png',
   'textures/mossy.png',
   'textures/wood.png',
   'textures/colorstone.png',
   'textures/pillar.png',
   'textures/barrel.png',
   'textures/greenlight.png',
   'textures/greystone.png'
];

const TEX_IMAGES = [];
const TEXTURES_LIST = [];

const TEX_RED_CROSS = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const clr = [x != y && x != tex_w - y ? 255 : 0, 0, 0];
   tex.set(x, y, color(...clr));
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_XOR_GREEN = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xor_color = ((x * 256) / tex_w) ^ ((y * 256) / tex_h);
   const hex_color = 256 * xor_color;
   const clr = [hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff];
   tex.set(x, y, color(...clr));
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_YELLOW_GRAD = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xy_color = (y * 128) / tex_h + (x * 128) / tex_w;
   const hex_color = 256 * xy_color + 65536 * xy_color;
   const clr = [hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff];
   tex.set(x, y, color(...clr));
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_GENS = [TEX_RED_CROSS, TEX_XOR_GREEN, TEX_YELLOW_GRAD];

function gen_tex(tex_w, tex_h, tex_func) {
   const raw_pixels = [];
   const tex = createImage(tex_w, tex_h);
   tex.loadPixels();

   for (let x = 0; x < tex_w; x++) {
      for (let y = 0; y < tex_h; y++) {
         tex_func(tex, x, y, tex_w, tex_h, raw_pixels);
      }
   }

   tex.updatePixels();

   const half_raw_pixels = raw_pixels.map((pixel) => pixel.map((l, i) => (i === 3 ? l : l / 2)));

   return {
      w: tex_w,
      h: tex_h,
      data: tex,
      raw_pixels,
      half_raw_pixels
   };
}

function gen_tex_from_img(tex_w, tex_h, image_data) {
   const raw_pixels = [];
   const tex = createGraphics(tex_w, tex_h, WEBGL);

   tex.translate(-tex_w / 2, -tex_h / 2);
   tex.image(image_data, 0, 0, tex_w, tex_h);
   tex.loadPixels();

   const d = tex.pixelDensity();

   for (let x = 0; x < tex_w; x++) {
      for (let y = 0; y < tex_h; y++) {
         const i = 4 * d * (y * d * tex_w + x);

         const clr = [tex.pixels[i], tex.pixels[i + 1], tex.pixels[i + 2]];
         raw_pixels[tex_h * y + x] = clr;
      }
   }

   const half_raw_pixels = raw_pixels.map((pixel) => pixel.map((l, i) => (i === 3 ? l : l / 2)));

   return {
      w: tex_w,
      h: tex_h,
      data: image_data,
      raw_pixels,
      half_raw_pixels
   };
}

async function preload_textures() {
   for (const path of TEX_PATHS) {
      TEX_IMAGES.push(
         await new Promise((resolve, reject) => {
            loadImage(
               path,
               (result) => {
                  resolve(result);
               },
               () => reject(`Error while loading ${path}`)
            );
         })
      );
   }

   TEXTURES_LIST.length = 0;
   TEXTURES_LIST.push(
      ...TEX_IMAGES.map((image_data) => gen_tex_from_img(TEX_WIDTH, TEX_HEIGHT, image_data)),
      ...TEX_GENS.map((tex_gen) => gen_tex(TEX_WIDTH, TEX_HEIGHT, tex_gen))
   );

   return TEXTURES_LIST;
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

function get_image_pixel(x, y, image_data, image_width) {
   const r_index = get_pixel_index(x, y, image_width, 0);

   return [image_data[r_index], image_data[r_index + 1], image_data[r_index + 2], image_data[r_index + 3]];
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
function set_image_pixel(x, y, color, image_data, image_width) {
   const [r, g, b, a = 255] = color;
   const r_index = get_pixel_index(x, y, image_width, 0);

   image_data[r_index] = r;
   image_data[r_index + 1] = g;
   image_data[r_index + 2] = b;
   image_data[r_index + 3] = a;
}

function average_colors(color_a, color_b) {
   return [
      ~~((color_a[0] + color_b[0]) / 2),
      ~~((color_a[1] + color_b[1]) / 2),
      ~~((color_a[2] + color_b[2]) / 2),
      255
   ];
}

export {
   SHADING_TYPE,
   BLACK,
   WHITE,
   GREEN,
   FLOOR_COLOR,
   CEILING_COLOR,
   TEX_WIDTH,
   TEX_HEIGHT,
   TEX_PATHS,
   TEX_IMAGES,
   TEXTURES_LIST,
   preload_textures,
   get_pixel_index,
   get_image_pixel,
   set_image_pixel,
   average_colors
};
