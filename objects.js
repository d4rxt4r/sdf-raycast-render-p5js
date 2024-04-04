import SDFBox from './objects/Box.js';
import SDFCircle from './objects/Circle.js';
import SDFTriangle from './objects/Triangle.js';

import { WHITE, GREEN } from 'textures';

function gen_obj(type, col, row, tile_width, tile_height, textures) {
   if (!type) {
      throw new Error('Unrecognized Object Type');
   }

   const texture_id = String(type).length > 1 ? Number(String(type).substring(1)) : 0;

   if (Number(String(type).charAt(0)) === 1) {
      return new SDFBox({
         x: col * tile_width,
         y: row * tile_height,
         width: tile_width,
         height: tile_height,
         color: GREEN,
         textures,
         texture_id
      });
   }

   if (type === 2) {
      return new SDFCircle({
         x: col * tile_width + tile_width / 2,
         y: row * tile_height + tile_height / 2,
         r: (tile_width + tile_height) / 10
         //color: WHITE
      });
   }

   if (Number(String(type).charAt(0)) === 3) {
      const sign = [31, 32].includes(type) ? -1 : 1;

      if (type === 30) {
         return new SDFTriangle({
            x: col * tile_width,
            y: row * tile_height,
            ab_dist: tile_width,
            ac_dist: tile_height,
            color: WHITE,
            textures,
            texture_id
         });
      }

      if (type === 31) {
         return new SDFTriangle({
            x: col * tile_width + tile_width,
            y: row * tile_height,
            ab_dist: -tile_width,
            ac_dist: tile_height,
            color: WHITE,
            sign,
            textures,
            texture_id
         });
      }

      if (type === 32) {
         return new SDFTriangle({
            x: col * tile_width,
            y: row * tile_height + tile_height,
            ab_dist: tile_width,
            ac_dist: -tile_height,
            color: WHITE,
            sign: -1,
            textures,
            texture_id
         });
      }

      return new SDFTriangle({
         x: col * tile_width + tile_width,
         y: row * tile_height + tile_height,
         ab_dist: -tile_width,
         ac_dist: -tile_height,
         color: WHITE,
         textures,
         texture_id
      });
   }
}

export { gen_obj };
export { SDFBox, SDFCircle, SDFTriangle };
