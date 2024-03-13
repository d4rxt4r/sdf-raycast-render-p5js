import { TEX_WIDTH, TEX_HEIGHT } from 'defaults';
import { int } from 'math_utils';

const TEX_RED_CROSS = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const clr = color(x != y && x != tex_w - y ? 255 : 0, 0, 0);
   tex.set(x, y, clr);
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_XOR_GREEN = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xor_color = ((x * 256) / tex_w) ^ ((y * 256) / tex_h);
   const hex_color = 256 * xor_color;
   const clr = color(hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff);
   tex.set(x, y, clr);
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_YELLOW_GRAD = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   const xy_color = (y * 128) / tex_h + (x * 128) / tex_w;
   const hex_color = 256 * xy_color + 65536 * xy_color;
   const clr = color(hex_color >> 16, (hex_color >> 8) & 0xff, hex_color & 0xff);
   tex.set(x, y, clr);
   raw_pixels[tex_h * y + x] = clr;
};

const TEX_IRON_BLOCK = (tex, x, y, tex_w, tex_h, raw_pixels) => {
   let clr;

   const x_gap = int(tex_h / 24);
   const y_gap = int(tex_w / 24);

   clr = color(200);
   if (x <= x_gap || x >= tex_h - x_gap || y <= y_gap || y >= tex_w - y_gap) {
      clr = color(160);
   } else if (y % (y_gap * 6) < y_gap) {
      clr = color(175);
   } else if ((y % (y_gap * 6)) - y_gap * 1 < y_gap) {
      clr = color(180);
   } else if ((y % (y_gap * 6)) - y_gap * 2 < y_gap) {
      clr = color(195);
   }

   tex.set(x, y, clr);
   raw_pixels[tex_h * y + x] = clr;
};

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

   const half_raw_pixels = raw_pixels.map((pixel) => pixel.levels.map((l, i) => (i === 3 ? l : l / 2)));

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
   const tex = createGraphics(tex_w, tex_h);

   tex.fill(255);
   tex.circle(tex_w / 2, tex_h / 2, 10);

   tex.image(image_data, 0, 0, tex_w, tex_h);
   tex.loadPixels();

   const d = tex.pixelDensity();

   for (let x = 0; x < tex_w; x++) {
      for (let y = 0; y < tex_h; y++) {
         const i = 4 * d * (y * d * tex_w + x);

         const rgb = [tex.pixels[i], tex.pixels[i + 1], tex.pixels[i + 2]];
         const clr = [...rgb, 255];

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
}

const TEX_PATHS = [
   'textures/redbrick.png',
   'textures/eagle.png',
   'textures/mossy.png',
   'textures/wood.png',
   'textures/colorstone.png',
   'textures/pillar.png',
   'textures/barrel.png',
   'textures/greenlight.png'
];
const TEX_GENS = [TEX_IRON_BLOCK, TEX_RED_CROSS, TEX_XOR_GREEN, TEX_YELLOW_GRAD];
const TEX_IMAGES = [];
const TEXTURES_LIST = [];

export { TEX_PATHS, TEX_IMAGES, TEXTURES_LIST, preload_textures };
