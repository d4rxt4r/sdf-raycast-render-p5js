import { gen_obj } from 'objects';
import { TEX_WIDTH, TEX_HEIGHT } from 'textures';

/**
 * @typedef {Object} SDFSceneOptions
 *
 * @property {number} id - the id of the level
 * @property {number} width - the width of the level
 * @property {number} height - the height of the level
 * @property {Object} level_data - the data containing raw_data and sprites for the level
 * @property {Object} textures - the textures for the level
 * @property {Array} shaders
 * @property {Object} fonts
 */

/*  The SDFScene class represents a class containing all information about objects and sprites for the level. */
export class SDFScene {
   /**
    * Constructs a new SDFScene.
    *
    * @param {SDFSceneOptions} options - the options for the SDFScene.
    */
   constructor(options) {
      /**
       * The id of the level.
       * @type {number}
       */
      this.id = 0;
      /**
       * The width of the level.
       * @type {number}
       */
      this.width = 0;
      /**
       * The height of the level.
       * @type {number}
       */
      this.height = 0;
      /**
       * The width of a tile in the level.
       * @type {number}
       */
      this.tile_width = TEX_WIDTH;
      /**
       * The height of a tile in the level.
       * @type {number}
       */
      this.tile_height = TEX_HEIGHT;
      /**
       * The sprites for the level.
       * @type {Array.<Object>}
       */
      this.sprites = [];
      /**
       * The objects in the level.
       * @type {Array.<Object>}
       */
      this.objects = [];
      /**
       * The textures for the level.
       * @type {Object}
       */
      this.textures = options.textures;
      /**
       * The shaders for the level.
       * @type {Array}
       */
      this.shaders = options.shaders;
      /**
       * The fonts for the level.
       * @type {Object}
       */
      this.fonts = options.fonts;
      /**
       * The raw data for the level.
       * @type {Array.<Object>}
       * @private
       */
      this._raw_data = [];

      this._init(options);
   }

   /**
    * Initialize the level with the specified width, height, level data, and id.
    *
    * @param {SDFSceneOptions} options - the options for the SDFScene.
    * @private
    */
   _init(options) {
      const { id, width, height, level_data } = options;
      const { data = [], entities = [] } = level_data;

      this.id = id;
      this.width = width;
      this.height = height;
      this.sprites = structuredClone(entities);
      this._raw_data = structuredClone(data);

      this._spawn_objects();
      this._set_sprites_scene_coordinates();
   }

   /**
    * Spawn objects based on the raw data.
    *
    * @private
    */
   _spawn_objects() {
      this.objects = [];
      for (let row = 0; row < this._raw_data.length; row++) {
         for (let col = 0; col < this._raw_data[row].length; col++) {
            const type = this._raw_data[row][col];
            if (type) {
               this.objects.push(gen_obj(type, col, row, this.tile_width, this.tile_height, this.textures.list));
            }
         }
      }
   }

   /**
    * Sets the scene coordinates for all sprites.
    *
    * @private
    */
   _set_sprites_scene_coordinates() {
      this.sprites.forEach((sprites) => {
         sprites.x = (sprites.x - 1) * this.tile_width + this.tile_width / 2;
         sprites.y = (sprites.y - 1) * this.tile_height + this.tile_height / 2;
      });
   }

   /**
    * Change the level of the scene.
    *
    * @param {Array} raw_map - The raw map data for the new level.
    */
   change_level(raw_map) {
      this._init(raw_map);
   }

   /**
    * Get the center vector of the scene.
    *
    * @return {p5.Vector} The center vector of the scene.
    */
   get_center_vec() {
      return createVector(this._width / 2, this._height / 2);
   }

   /**
    * Renders all objects and sprites in the scene.
    *
    * @param {number} [size_factor=1] - The scaling factor to apply to the size of the objects and sprites.
    */
   render(size_factor = 1) {
      this.objects.forEach((object) => object.render(size_factor));
      this.sprites.forEach((sprite) => {
         fill(0, 0, 255);
         circle(sprite.x * size_factor, sprite.y * size_factor, 10);
      });
   }
}
