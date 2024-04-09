const TEX_WIDTH = 64;
const TEX_HEIGHT = 64;
const TEXTURE_RESOLUTION_SCALE = 8;

const SHADING_TYPE = {
   NONE: 0,
   SIDE: 1,
   DISTANCE: 2
};

const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const FLOOR_COLOR = [200, 200, 200];
const CEILING_COLOR = [100, 100, 100];
const FRAG_FLOOR_COLOR = FLOOR_COLOR.map((l) => l / 255);
const FRAG_CEILING_COLOR = CEILING_COLOR.map((l) => l / 255);

const TEX_PATHS = [
   'textures/empty.png',
   'textures/redbrick.png',
   'textures/eagle.png',
   'textures/mossy.png',
   'textures/wood.png',
   'textures/colorstone.png',
   'textures/pillar.png',
   'textures/barrel.png',
   'textures/greenlight.png',
   'textures/greystone.png',
   'textures/purplestone.png'
];

const TEX_SHADERS = [
   ['shaders/position.vert', 'shaders/background.frag'],
   ['shaders/position.vert', 'shaders/walls.frag'],
   ['shaders/position.vert', 'shaders/sprites.frag'],
   ['shaders/position.vert', 'shaders/sprites.frag']
];

const TEXTURES_LIST = [];

const TEX_XOR_GREEN = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xor_color = ((x * 256) / tex_w) ^ ((y * 256) / tex_h);
   const hex_color = 256 * xor_color;
   const clr = [hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff];
   tex.set(x, y, color(clr));
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_YELLOW_GRAD = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xy_color = (y * 128) / tex_h + (x * 128) / tex_w;
   const hex_color = 256 * xy_color + 65536 * xy_color;
   const clr = [hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff];
   tex.set(x, y, color(clr));
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_GENS = [TEX_XOR_GREEN, TEX_YELLOW_GRAD];

function gen_tex(tex_w, tex_h, tex_func) {
   const raw_pixels = [];
   const image_data = createImage(tex_w, tex_h);
   image_data.loadPixels();

   for (let x = 0; x < tex_w; x++) {
      for (let y = 0; y < tex_h; y++) {
         tex_func(image_data, x, y, tex_w, tex_h, raw_pixels);
      }
   }

   image_data.updatePixels();
   image_data.resize(tex_w * TEXTURE_RESOLUTION_SCALE, tex_h * TEXTURE_RESOLUTION_SCALE);

   return {
      w: tex_w,
      h: tex_h,
      image_data
   };
}

function gen_tex_from_img(tex_w, tex_h, image_data) {
   image_data.loadPixels();
   image_data.resize(tex_w * TEXTURE_RESOLUTION_SCALE, tex_h * TEXTURE_RESOLUTION_SCALE);
   image_data.updatePixels();

   return {
      w: tex_w,
      h: tex_h,
      image_data
   };
}

async function preload_textures() {
   const tex_images = [];
   for (const path of TEX_PATHS) {
      tex_images.push(
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

   const textures_list = [];
   textures_list.push(
      ...tex_images.map((image_data) => gen_tex_from_img(TEX_WIDTH, TEX_HEIGHT, image_data)),
      ...TEX_GENS.map((tex_gen) => gen_tex(TEX_WIDTH, TEX_HEIGHT, tex_gen))
   );

   const data = textures_list.map((tex) => {
      return tex.image_data.pixels;
   });

   const raw_tex_pixels = new Uint8ClampedArray(
      data.reduce((acc, pixels_array) => {
         const totalLength = acc.length + pixels_array.length;
         const result = new Uint8ClampedArray(totalLength);
         result.set(acc, 0);
         result.set(pixels_array, acc.length);
         return result;
      }, new Uint8ClampedArray([]))
   );
   const texture_map_image = new ImageData(
      raw_tex_pixels,
      TEX_HEIGHT * TEXTURE_RESOLUTION_SCALE,
      TEX_WIDTH * TEXTURE_RESOLUTION_SCALE * textures_list.length
   );

   return { list: textures_list, image: texture_map_image };
}

async function preloadShaders() {
   const shaders = [];

   for (const [vertPath, fragPath] of TEX_SHADERS) {
      shaders.push(
         await new Promise((resolve, reject) => {
            loadShader(
               vertPath,
               fragPath,
               (result) => {
                  resolve(result);
               },
               () => reject(`Error while loading ${vertPath}`, `Error while loading ${fragPath}`)
            );
         })
      );
   }

   return shaders;
}

/**
 * Creates a texture from the given array buffer.
 *
 * @param {ArrayBuffer} array_buffer - The array buffer containing pixel data.
 * @param {number} [image_width=array_buffer.length / 4] - The width of the image in pixels.
 * @return {p5.Texture} The texture created from the array buffer.
 */
function create_texture_from_array_buffer(array_buffer, image_width = array_buffer.length / 4) {
   const image_data = new ImageData(array_buffer, image_width);
   return new p5.Texture(window._renderer, image_data, {});
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

/**
 * Interpolates between two colors using a linear interpolation.
 *
 * @param {number[]} color_a - An array of four numbers representing the red, green, blue, and alpha values of the first color.
 * @param {number[]} color_b - An array of four numbers representing the red, green, blue, and alpha values of the second color.
 * @returns {number[]} An array of four numbers representing the interpolated red, green, blue, and alpha values.
 */
function average_colors(color_a, color_b) {
   const result = [
      ~~((color_a[0] + color_b[0]) / 2),
      ~~((color_a[1] + color_b[1]) / 2),
      ~~((color_a[2] + color_b[2]) / 2),
      255
   ];

   return result;
}

/**
 * Interpolates between two colors using a linear interpolation.
 *
 * @param {number[]} color1 - An array of four numbers representing the red, green, blue, and alpha values of the first color.
 * @param {number[]} color2 - An array of four numbers representing the red, green, blue, and alpha values of the second color.
 * @param {number} t - A number between 0 and 1 representing the interpolation factor.
 * @returns {number[]} An array of four numbers representing the interpolated red, green, blue, and alpha values of the colors.
 */
function lerp_colors(color1, color2, t) {
   const color = [0, 0, 0, 255];
   color[0] = color1[0] + (color2[0] - color1[0]) * t;
   color[1] = color1[1] + (color2[1] - color1[1]) * t;
   color[2] = color1[2] + (color2[2] - color1[2]) * t;
   return color;
}

export {
   SHADING_TYPE,
   BLACK,
   WHITE,
   RED,
   GREEN,
   BLUE,
   FLOOR_COLOR,
   CEILING_COLOR,
   FRAG_FLOOR_COLOR,
   FRAG_CEILING_COLOR,
   TEX_WIDTH,
   TEX_HEIGHT,
   TEX_PATHS,
   TEXTURES_LIST,
   preload_textures,
   preloadShaders,
   create_texture_from_array_buffer,
   get_pixel_index,
   get_image_pixel,
   set_image_pixel,
   average_colors,
   lerp_colors
};
