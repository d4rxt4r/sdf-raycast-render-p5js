import { gen_obj } from 'objects';
import { round } from 'math_utils';

class SDFScene {
   constructor(options) {
      this.init(options);
   }

   init({ screen_width, screen_height, level_data, id }) {
      this._id = id;

      const { data: raw_data = [], entities = [] } = level_data;
      this._raw_data = [...raw_data];
      this._entities = [...entities];

      this._width = this._raw_data[0].length;
      this._height = this._raw_data.length;

      this.tile_width = screen_width / this._width;
      this.tile_height = screen_height / this._height;

      this._objects = [];
      this._spawn_objects();
      this._set_entities_scene_coordinates();
   }

   get id() {
      return this._id;
   }

   _spawn_objects() {
      this._objects = [];
      for (let row = 0; row < this._height; row++) {
         for (let col = 0; col < this._width; col++) {
            const type = this._raw_data[row][col];
            if (type) {
               this._objects.push(gen_obj(type, col, row, this.tile_width, this.tile_height));
            }
         }
      }
   }

   _set_entities_scene_coordinates() {
      this._entities.forEach((entity) => {
         entity.x = (entity.x - 1) * this.tile_width + this.tile_width / 2;
         entity.y = (entity.y - 1) * this.tile_height + this.tile_height / 2;
      });
   }

   change_level(rawMap) {
      this.init(rawMap);
      this._spawn_objects();
   }

   get_objects() {
      return this._objects;
   }

   get_sprites() {
      return this._entities;
   }

   get_center_vec() {
      return createVector(round((this._width * this.tile_width) / 2), round((this._height * this.tile_height) / 2));
   }

   render() {
      push();

      this._objects.forEach((object) => object.render());

      this._entities.forEach((entity) => {
         fill(0, 0, 255);
         circle(entity.x, entity.y, 10);
      });

      pop();
   }
}

export { SDFScene };
