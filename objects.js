import SDFBox from './objects/Box.js';
import SDFCircle from './objects/Circle.js';
import SDFTriangle from './objects/Triangle.js';

function gen_obj(type, col, row, tileWidth, tileHeight) {
   if (!type) {
      throw new Error('Unrecognized Object Type');
   }

   if (Number(String(type).charAt(0)) === 1) {
      const tex_id = String(type).length > 1 ? Number(String(type).substring(1)) : 0;

      return new SDFBox(col * tileWidth, row * tileHeight, tileWidth, tileHeight, color(255), tex_id);
   }

   if (type === 2) {
      return new SDFCircle(
         col * tileWidth + tileWidth / 2,
         row * tileHeight + tileHeight / 2,
         (tileWidth + tileHeight) / 10,
         // color(255)
      );
   }

   if (type === 30) {
      return new SDFTriangle(
         col * tileWidth,
         row * tileHeight,
         tileWidth,
         tileHeight,
         color(255)
      );
   }

   if (type === 31) {
      return new SDFTriangle(
         col * tileWidth + tileWidth,
         row * tileHeight,
         -tileWidth,
         tileHeight,
         color(255),
         null,
         -1
      );
   }

   if (type === 32) {
      return new SDFTriangle(
         col * tileWidth,
         row * tileHeight + tileHeight,
         tileWidth,
         -tileHeight,
         color(255),
         null,
         -1
      );
   }

   if (type === 33) {
      return new SDFTriangle(
         col * tileWidth + tileWidth,
         row * tileHeight + tileHeight,
         -tileWidth,
         -tileHeight,
         color(255)
      );
   }
}

export { gen_obj };
export { SDFBox, SDFCircle, SDFTriangle };
