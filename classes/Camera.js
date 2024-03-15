import { PLAYER_SPEED, ROTATE_SPEED } from 'const';
import { deg_to_rad, sin, tan, int, abs, map_range } from 'math_utils';
import {
   WHITE,
   BLACK,
   SHADING_TYPE,
   FLOOR_COLOR,
   CEILING_COLOR,
   // get_image_pixel,
   set_image_pixel
} from 'textures';
import { SDFScene } from 'classes';

const FLOOR_TEXTURE = 2;
const FLOOR_TEXTURE2 = 8;
const CEILING_TEXTURE = 3;

/**
 * @typedef {Object} RayCameraOptions
 *
 * @property {SDFScene} scene - The scene object.
 * @property {number} accuracy - The accuracy of the raycast.
 * @property {number} steps - The maximum number of steps in the raycast.
 * @property {number} resolution - The resolution of viewport.
 * @property {number} fov - The field of view of the camera.
 * @property {number} fisheye_correction - Enable correction factor for the fisheye effect.
 * @property {boolean} debug_rays - Enable debug rays.
 * @property {boolean} debug_sdf - Enable debug SDF.
 * @property {string} shading_type - The shading type of the objects.
 * @property {boolean} show_textures - Enable texture mapping.
 * @property {boolean} show_sprites - Enable sprite rendering.
 */

export class RayCamera {
   /**
    * Constructs a new RayCamera object.
    *
    * @param {RayCameraOptions} options - The options for constructing the RayCamera.
    */
   constructor(options) {
      /**
       * The options for the RayCamera.
       * @type {RayCameraOptions}
       */
      this._options = options;
      /**
       * The position of the camera.
       * @type {p5.Vector}
       */
      this._pos_vec = createVector(this._options.scene.width / 2, this._options.scene.height / 2);
      /**
       * The direction of the camera.
       * @type {p5.Vector}
       */
      this._dir_vec = createVector(0, -1);
      /**
       * The plane vector of the camera.
       * @type {p5.Vector}
       */
      this._plane_vec = createVector(0, this._plane_y);
      /**
       * The vector representing the center of the plane.
       * @type {p5.Vector}
       */
      this._plane_center_vec = createVector(this._pos_vec.x, this._pos_vec.y);
      /**
       * The vector representing the start of the plane display.
       * @type {p5.Vector}
       */
      this._plane_display_start_vec = null;
      /**
       * The vector representing the end of the plane display.
       * @type {p5.Vector}
       */
      this._plane_display_end_vec = null;
      /**
       * Array to store the order of sprites in the scene.
       * @type {Array}
       */
      this._sprite_order = new Array(this._options.scene.sprites?.length || 0);
      /**
       * Array to store the distance of sprites from the camera.
       * @type {Array}
       */
      this._sprite_distance = new Array(this._options.scene.sprites?.length || 0);
      /**
       * Array to store the z-buffer.
       * @type {Array}
       */
      this._z_buffer = null;

      this.calc_viewport();
   }

   /**
    * Calculate the viewport dimensions based on the scene dimensions and resolution options.
    */
   calc_viewport() {
      this._viewport = {
         width: int(this._options.scene.width * (this._options.resolution / 100)),
         height: int(this._options.scene.height * (this._options.resolution / 100))
      };
      this._plane_y = tan(deg_to_rad(this._options.fov) / 2);

      this._view_buffer = createImage(this._viewport.width, this._viewport.height);
      this._view_buffer.loadPixels();
      this._z_buffer = new Array(this._viewport.w);
   }

   /**
    * Set the sprites to be rendered by the camera.
    *
    * @param {Object[]} sprites - An array of sprites to be rendered by the camera.
    */
   set_sprites(sprites) {
      this._sprite_order = new Array(sprites?.length || 0);
      this._sprite_distance = new Array(sprites?.length || 0);
   }

   /**
    * Get an option by its name.
    *
    * @param {string} name The name of the option to get.
    * @returns {any} The option value, or undefined if the option is not set.
    */
   get_option(name) {
      return this._options?.[name];
   }

   /**
    * Sets the value of an option.
    *
    * @param {string} option - The name of the option to set.
    * @param {any} value - The value to set for the option.
    */
   set_option(option, value) {
      if (option in this._options) {
         this._options[option] = value;
      }
   }

   /**
    * Handles camera movement.
    */
   move() {
      if (keyIsDown(87)) {
         this._pos_vec.add(p5.Vector.setMag(this._dir_vec, PLAYER_SPEED));
      }
      if (keyIsDown(83)) {
         this._pos_vec.sub(p5.Vector.setMag(this._dir_vec, PLAYER_SPEED));
      }
      if (keyIsDown(65)) {
         this._dir_vec.rotate(-ROTATE_SPEED);
      }
      if (keyIsDown(68)) {
         this._dir_vec.rotate(ROTATE_SPEED);
      }
   }

   /**
    * Sets the position of the camera.
    *
    * @param {p5.Vector} pos_vec - new position of the camera.
    */
   set_pos(pos_vec) {
      this._pos_vec = pos_vec;
   }

   /**
    * Get the position of the camera.
    *
    * @returns {p5.Vector}
    */
   get_pos() {
      return this._pos;
   }

   /**
    * Displays the camera on the canvas.
    *
    * @private
    */
   _display_camera() {
      push();

      fill(WHITE);
      stroke(WHITE);
      circle(this._pos_vec.x, this._pos_vec.y, 10);

      stroke(0, 0, 255);
      line(this._pos_vec.x, this._pos_vec.y, this._plane_display_end_vec.x, this._plane_display_end_vec.y);
      line(this._pos_vec.x, this._pos_vec.y, this._plane_display_start_vec.x, this._plane_display_start_vec.y);
      line(
         this._plane_display_start_vec.x,
         this._plane_display_start_vec.y,
         this._plane_display_end_vec.x,
         this._plane_display_end_vec.y
      );

      pop();
   }

   /**
    * Calculates the projection plane of the camera.
    *
    * @private
    */
   _calc_projection_plane() {
      this._plane_vec.x = 0;
      this._plane_vec.y = this._plane_y;

      // REVIEW: optimize vectors math
      const plane_angle = this._plane_vec.angleBetween(this._dir_vec);
      this._plane_vec.setHeading(plane_angle);

      this._plane_center_vec.x = this._pos_vec.x;
      this._plane_center_vec.y = this._pos_vec.y;
      this._plane_center_vec.add(this._dir_vec);

      this._plane_display_start_vec = p5.Vector.sub(this._plane_center_vec, this._plane_vec);
      this._plane_display_end_vec = p5.Vector.add(this._plane_center_vec, this._plane_vec);
   }

   /**
    * Sorts the sprites based on their distance from the camera.
    *
    * @private
    */
   _sort_sprites() {
      this._sprite_distance.sort((a, b) => a - b);
      this._sprite_order.sort((a, b) => this._sprite_distance.indexOf(a) - this._sprite_distance.indexOf(b));
   }

   /**
    * Calculates the floor direction based on the direction vector and plane vector.
    *
    * @return {Object} Object containing start and end direction coordinates
    * @private
    */
   _get_floor_dir() {
      const { x: dirX, y: dirY } = this._dir_vec;
      const { x: planeX, y: planeY } = this._plane_vec;

      const start_dir_x = dirX + planeX;
      const start_dir_y = dirY + planeY;

      const end_dir_x = dirX - planeX;
      const end_dir_y = dirY - planeY;

      return { start_dir_x, start_dir_y, end_dir_x, end_dir_y };
   }

   /**
    * Renders the floor.
    *
    * @param {Array} view_buffer
    * @private
    */
   _render_floor(view_buffer) {
      let x_pos, y_pos;
      let cell_x, cell_y;
      let tex_x, tex_y;
      let ceiling_y;
      let floor_texture, floor_color, ceiling_color;

      floor_texture = this._options.scene.textures[FLOOR_TEXTURE];
      const ceiling_texture = this._options.scene.textures[CEILING_TEXTURE];

      const { start_dir_x, start_dir_y, end_dir_x, end_dir_y } = this._get_floor_dir();

      const start_x = this._pos_vec.x / floor_texture.w;
      const start_y = this._pos_vec.y / floor_texture.h;

      // vertical position of the camera
      const z_pos = this._viewport.height / 2;

      for (let y = int(z_pos); y < this._viewport.height; y++) {
         ceiling_y = this._viewport.height - 1 - y;

         if (this._options.show_textures) {
            // current y position compared to the center of the screen (the horizon)
            const horizon_height = int(y - z_pos);
            // horizontal distance from the camera to the floor for the current row.
            // 0.5 is the z position exactly in the middle between floor and ceiling.
            const row_dist = z_pos / horizon_height;

            // calculate the real world step vector we have to add for each x (parallel to camera plane)
            // adding step by step avoids multiplications with a weight in the inner loop
            const step_x = (row_dist * (end_dir_x - start_dir_x)) / this._viewport.width;
            const step_y = (row_dist * (end_dir_y - start_dir_y)) / this._viewport.width;

            // real world coordinates of the leftmost column. This will be updated as we step to the right.
            x_pos = start_x + row_dist * start_dir_x;
            y_pos = start_y + row_dist * start_dir_y;

            for (let x = 0; x < this._viewport.width; x++) {
               // the cell coord is got from the integer parts of x_pos and y_pos
               cell_x = int(x_pos);
               cell_y = int(y_pos);

               // get the texture coordinate from the fractional part
               tex_x = int(floor_texture.w * (x_pos - cell_x)) & (floor_texture.w - 1);
               tex_y = int(floor_texture.h * (y_pos - cell_y)) & (floor_texture.h - 1);

               x_pos += step_x;
               y_pos += step_y;

               ceiling_color = ceiling_texture.half_raw_pixels[ceiling_texture.h * tex_y + tex_x];
               if ((cell_x + cell_y) % 2 === 0) {
                  floor_color =
                     this._options.scene.textures[FLOOR_TEXTURE].half_raw_pixels[floor_texture.h * tex_y + tex_x];
               } else {
                  floor_color =
                     this._options.scene.textures[FLOOR_TEXTURE2].half_raw_pixels[ceiling_texture.h * tex_y + tex_x];
               }

               set_image_pixel(x, y, floor_color, view_buffer.pixels, this._viewport.width);
               set_image_pixel(x, ceiling_y, ceiling_color, view_buffer.pixels, this._viewport.width);
            }
         } else {
            for (let x = 0; x < this._viewport.width; x++) {
               set_image_pixel(x, y, FLOOR_COLOR, view_buffer.pixels, this._viewport.width);
               set_image_pixel(x, ceiling_y, CEILING_COLOR, view_buffer.pixels, this._viewport.width);
            }
         }
      }
   }

   /**
    * Renders the walls.
    *
    * @param {Array} ray_collisions
    * @param {Array} view_buffer
    * @param {Array} z_buffer
    * @private
    */
   _render_walls(ray_collisions, view_buffer, z_buffer) {
      const collisions_count = this._viewport.width;

      for (let scanLine = 0; scanLine < collisions_count; scanLine++) {
         const line_data = ray_collisions[scanLine];
         const distance = this._options.fisheye_correction ? line_data.perp_distance : line_data.distance;

         const world_line_height = (this._options.scene.height / distance) * this._options.scene.tile_height;
         const line_height = int(map(world_line_height, 0, this._options.scene.height, 0, this._viewport.height));

         let draw_start = int(-line_height / 2 + this._viewport.height / 2);
         draw_start = draw_start < 0 ? 0 : draw_start;
         let draw_end = draw_start + line_height;
         draw_end = draw_end >= this._viewport.height ? this._viewport.height - 1 : draw_end;

         if (this._options.show_textures) {
            if (line_data.texture_id === undefined || line_data.texture_id === null) {
               continue;
            }

            const texture = this._options.scene.textures[line_data.texture_id];
            const step = (1.0 * texture.h) / line_height;

            const tex_x = int(line_data.tex_x_pos);
            let tex_pos = (draw_start - this._viewport.height / 2 + line_height / 2) * step;

            for (let y = draw_start; y < draw_end; y++) {
               const texY = int(tex_pos) & (texture.h - 1);
               tex_pos += step;

               let display_texture =
                  this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit
                     ? texture.half_raw_pixels
                     : texture.raw_pixels;

               const tex_color = display_texture[texture.h * texY + tex_x];

               if (!tex_color) {
                  console.error('TEXTURE BAD');
                  return;
               }

               set_image_pixel(collisions_count - scanLine - 1, y, tex_color, view_buffer.pixels, this._viewport.width);
            }
         } else {
            let wall_color = line_data.color;
            if (this._options.shading_type === SHADING_TYPE.DISTANCE) {
               wall_color = lerpColor(line_data.color, BLACK, line_data.distance / this._viewport.height);
            }
            if (this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit) {
               wall_color = line_data.half_color;
            }

            for (let y = draw_start; y < draw_end; y++) {
               set_image_pixel(
                  collisions_count - scanLine - 1,
                  y,
                  wall_color,
                  view_buffer.pixels,
                  this._viewport.width
               );
            }
         }

         z_buffer[collisions_count - scanLine] = line_data.perp_distance;
      }
   }

   /**
    * Renders the sprites.
    *
    * @param {Array} ray_collisions
    * @param {Array} view_buffer
    * @param {Array} z_buffer
    * @private
    */
   _render_sprites(ray_collisions, view_buffer, z_buffer) {
      const numSprites = this._options.scene.sprites.length;
      for (let i = 0; i < numSprites; i++) {
         this._sprite_order[i] = i;
         this._sprite_distance[i] =
            (this._pos_vec.x - this._options.scene.sprites[i].x) *
               (this._pos_vec.x - this._options.scene.sprites[i].x) +
            (this._pos_vec.y - this._options.scene.sprites[i].y) * (this._pos_vec.y - this._options.scene.sprites[i].y);
      }

      this._sort_sprites();

      for (let i = 0; i < numSprites; i++) {
         const sprite = this._options.scene.sprites[this._sprite_order[i]];
         const sprite_x = sprite.x - this._pos_vec.x;
         const sprite_y = sprite.y - this._pos_vec.y;

         const inv_det = 1 / (this._plane_vec.x * this._dir_vec.y - this._dir_vec.x * this._plane_vec.y);
         const transform_x = inv_det * (this._dir_vec.y * sprite_x - this._dir_vec.x * sprite_y);
         const transform_y = inv_det * (this._plane_vec.y * sprite_x * -1 + this._plane_vec.x * sprite_y);
         //                                                             ^ idk y i need to inverse it here

         const width = ray_collisions.length - 1;
         const height = this._viewport.height;

         const sprite_screen_x = int((width / 2) * (1 - transform_x / transform_y));
         const sprite_height = abs(int(height / transform_y));

         let draw_start_y = int(-sprite_height / 2 + height / 2);
         if (draw_start_y < 0) draw_start_y = 0;
         let draw_end_y = int(sprite_height / 2 + height / 2);
         if (draw_end_y >= height) draw_end_y = height - 1;

         const _sprite_width = abs(int(height / transform_y));
         const sprite_width = int(map_range(_sprite_width, 0, this._viewport.width, 0, width));
         let draw_start_x = int(-sprite_width / 2 + sprite_screen_x);
         if (draw_start_x < 0) draw_start_x = 0;
         let draw_end_x = int(sprite_width / 2 + sprite_screen_x);
         if (draw_end_x >= width) draw_end_x = width;

         const texture = this._options.scene.textures[sprite.texture_id];
         for (let stripe = draw_start_x; stripe <= draw_end_x; stripe++) {
            const tex_x = int(
               int((256 * (stripe - (-sprite_width / 2 + sprite_screen_x)) * texture.w) / sprite_width) / 256
            );

            if (transform_y > 0 && stripe >= 0 && stripe <= height && transform_y < z_buffer[stripe]) {
               for (let y = draw_start_y; y < draw_end_y; y++) {
                  const d = y * 256 - height * 128 + sprite_height * 128;
                  const tex_y = int((d * texture.h) / sprite_height / 256);
                  const clr = texture.raw_pixels[texture.w * tex_y + tex_x];

                  const [r, g, b, a] = clr || [0, 0, 0, 0];
                  if (r + g + b === 0 || a === 0) {
                     continue;
                  }

                  set_image_pixel(stripe, y, clr, view_buffer.pixels, this._viewport.width);

                  // const old_color = get_image_pixel(stripe, y, view_buffer.pixels, this._viewport.width);
                  // const new_color = average_colors(old_color, clr);
                  // set_image_pixel(stripe, y, new_color, view_buffer.pixels, this._viewport.width);
               }
            }
         }
      }
   }

   /**
    * Renders the current view buffer based on the given ray collisions.
    *
    * @param {Array} ray_collisions - The ray collisions array.
    */
   render(ray_collisions) {
      this._view_buffer.pixels.fill(0);
      // actually renders ceiling too
      this._render_floor(this._view_buffer);
      this._render_walls(ray_collisions, this._view_buffer, this._z_buffer);
      if (this._options.show_sprites) {
         this._render_sprites(ray_collisions, this._view_buffer, this._z_buffer);
      }
      this._view_buffer.updatePixels();

      image(this._view_buffer, 0, 0, this._options.scene.width, this._options.scene.height);
   }

   /**
    * Performs the ray marching process to determine the scene collisions.
    *
    * @param {BaseObject[]} scene_objects - The scene objects to check for collisions.
    */
   march(scene_objects) {
      this._calc_projection_plane();

      const ray_collisions = [];
      const ray_step_vec = createVector();

      let total_ray_distance;
      let wall_collision_data = {};

      for (let ray = 0; ray < this._viewport.width; ray++) {
         const camera_x = (2 * ray) / this._viewport.width - 1;
         const ray_dir = createVector(
            this._dir_vec.x + this._plane_vec.x * camera_x,
            this._dir_vec.y + this._plane_vec.y * camera_x
         );

         ray_step_vec.x = this._pos_vec.x;
         ray_step_vec.y = this._pos_vec.y;

         total_ray_distance = 0;

         for (let i = 0; i <= this._options.steps; i++) {
            let min_wall_distance = Infinity;

            for (const object of scene_objects) {
               const collision = object.collide(
                  ray_step_vec.x,
                  ray_step_vec.y,
                  this._options.shading_type === SHADING_TYPE.SIDE
               );

               if (collision.distance < min_wall_distance) {
                  min_wall_distance = collision.distance;
                  wall_collision_data = collision;
               }

               if (min_wall_distance > this._options.scene.width || min_wall_distance > this._options.scene.h) {
                  wall_collision_data = {
                     distance: this._options.scene.width,
                     color: BLACK,
                     half_color: BLACK
                  };
               }

               if (min_wall_distance <= this._options.accuracy) {
                  break;
               }
            }

            if (this._options.debug_sdf) {
               push();

               noFill();
               if (i > 0 || (!i && !ray)) {
                  stroke(0, 255, 0, 0.4);
                  circle(ray_step_vec.x, ray_step_vec.y, wall_collision_data.distance * 2);
               }
               if ((ray === 0 || ray === this._viewport.width - 1) && i) {
                  stroke(0, 255, 0, 1);
                  text(`${i}`, ray_step_vec.x, ray_step_vec.y);
               }

               pop();
            }

            total_ray_distance += wall_collision_data.distance;
            ray_dir.setMag(total_ray_distance);

            const next_ray_step_x = ray_dir.x + this._pos_vec.x;
            const next_ray_step_y = ray_dir.y + this._pos_vec.y;

            if (this._options.debug_rays) {
               push();

               stroke(0, 255, 0, 0.4);
               line(ray_step_vec.x, ray_step_vec.y, next_ray_step_x, next_ray_step_y);

               pop();
            }

            ray_step_vec.x = next_ray_step_x;
            ray_step_vec.y = next_ray_step_y;

            if (
               wall_collision_data.distance <= this._options.accuracy ||
               wall_collision_data.distance > this._options.scene.width ||
               wall_collision_data.distance > this._options.scene.height
            ) {
               break;
            }
         }

         const ray_angle = ray_dir.angleBetween(this._plane_vec);
         const perp_distance = abs(total_ray_distance * sin(ray_angle));

         ray_collisions.push({
            ...wall_collision_data,
            distance: total_ray_distance,
            perp_distance
         });
      }

      this.render(ray_collisions);
      // this.display_camera();
   }
}
