import SDFBox from './objects/Box.js';
import SDFCircle from './objects/Circle.js';
import SDFTriangle from './objects/Triangle.js';

import { WHITE } from 'textures';

function gen_obj(type, col, row, tile_width, tile_height, textures) {
   if (!type) {
      throw new Error('Unrecognized Object Type');
   }

   if (Number(String(type).charAt(0)) === 1) {
      const tex_id = String(type).length > 1 ? Number(String(type).substring(1)) : 0;

      return new SDFBox(col * tile_width, row * tile_height, tile_width, tile_height, WHITE, textures, tex_id);
   }

   if (type === 2) {
      return new SDFCircle(
         col * tile_width + tile_width / 2,
         row * tile_height + tile_height / 2,
         (tile_width + tile_height) / 10
         // WHITE
      );
   }

   if (type === 30) {
      return new SDFTriangle(col * tile_width, row * tile_height, tile_width, tile_height, WHITE);
   }

   if (type === 31) {
      return new SDFTriangle(col * tile_width + tile_width, row * tile_height, -tile_width, tile_height, WHITE, -1);
   }

   if (type === 32) {
      return new SDFTriangle(col * tile_width, row * tile_height + tile_height, tile_width, -tile_height, WHITE, -1);
   }

   if (type === 33) {
      return new SDFTriangle(
         col * tile_width + tile_width,
         row * tile_height + tile_height,
         -tile_width,
         -tile_height,
         WHITE
      );
   }
}

export { gen_obj };
export { SDFBox, SDFCircle, SDFTriangle };
