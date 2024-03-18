import { PLAYER_SPEED, ROTATE_SPEED } from 'const';
import { deg_to_rad, sin, tan, int, abs, map_range } from 'math_utils';
import {
   WHITE,
   BLACK,
   RED,
   GREEN,
   BLUE,
   SHADING_TYPE,
   FLOOR_COLOR,
   CEILING_COLOR,
   get_image_pixel,
   set_image_pixel,
   average_colors,
   lerp_colors
} from 'textures';
import { SDFScene } from 'classes';

const FLOOR_TEXTURE = 3;
const FLOOR_TEXTURE2 = 9;
const CEILING_TEXTURE = 4;
const CAMERA_PLANE_DISTANCE = 50;

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
 * @property {number} mm_size - The size of the minimap.
 * @property {number} mm_scale - The scale of the minimap.
 */

/* The RayCamera class represents a class for the raycasting camera. */
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
      this._sprite_order = null;
      /**
       * Array to store the distance of sprites from the camera.
       * @type {Array}
       */
      this._sprite_distance = null;
      /**
       * Array to store the z-buffer.
       * @type {Array}
       */
      this._z_buffer = null;
      /**
       * The buffer for the minimap.
       * @type {p5.Framebuffer}
       */
      this._minimap_buffer = null;

      this.calc_viewport();
      this._sort_sprites();
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

      this._sort_sprites();
   }

   /**
    * Sets the position of the camera.
    *
    * @param {p5.Vector} pos_vec - new position of the camera.
    */
   set_pos(pos_vec) {
      this._pos_vec = pos_vec;
      this._sort_sprites();
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
   }

   /**
    * Sorts the sprites based on their distance from the camera.
    *
    * @private
    */
   _sort_sprites() {
      const sprites = this._options.scene.sprites;
      const { x: pos_x, y: pos_y } = this._pos_vec;

      this._sprite_distance = Array.from({ length: sprites.length }, (_, i) => {
         const { x, y } = sprites[i];
         const dx = pos_x - x;
         const dy = pos_y - y;
         return dx * dx + dy * dy;
      });

      this._sprite_order = Array.from(this._sprite_distance.keys());
      this._sprite_order.sort((a, b) => this._sprite_distance[b] - this._sprite_distance[a]);
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

         if (!isFinite(distance)) {
            continue;
         }

         const world_line_height = (this._options.scene.height / distance) * this._options.scene.tile_height;
         const line_height = int(map_range(world_line_height, 0, this._options.scene.height, 0, this._viewport.height));

         let draw_start = int(-line_height / 2 + this._viewport.height / 2);
         draw_start = draw_start < 0 ? 0 : draw_start;
         let draw_end = draw_start + line_height;
         draw_end = draw_end >= this._viewport.height ? this._viewport.height : draw_end;

         if (this._options.show_textures) {
            const texture = this._options.scene.textures[line_data.texture_id ?? 0];
            const step = (1.0 * texture.h) / line_height;

            const tex_x = int(line_data.tex_x_pos);
            let tex_pos = (draw_start - this._viewport.height / 2 + line_height / 2) * step;

            for (let y = draw_start; y < draw_end; y++) {
               const tex_y = int(tex_pos) & (texture.h - 1);
               tex_pos += step;

               let display_texture =
                  this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit
                     ? texture.half_raw_pixels
                     : texture.raw_pixels;

               const tex_color = display_texture[texture.h * tex_y + tex_x];

               if (!tex_color) {
                  console.error('TEXTURE BAD', tex_x, tex_y, texture.h);
                  return;
               }

               set_image_pixel(collisions_count - scanLine - 1, y, tex_color, view_buffer.pixels, this._viewport.width);
            }
         } else {
            let wall_color = line_data.color;
            if (this._options.shading_type === SHADING_TYPE.DISTANCE) {
               wall_color = lerp_colors(line_data.color, BLACK, line_data.distance / this._options.scene.width);
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

         z_buffer[collisions_count - scanLine - 1] = line_data.perp_distance;
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
      for (let i = 0; i < this._options.scene.sprites.length; i++) {
         const sprite = this._options.scene.sprites[this._sprite_order[i]];
         const sprite_x = sprite.x - this._pos_vec.x;
         const sprite_y = sprite.y - this._pos_vec.y;

         const inv_det = 1 / (this._plane_vec.x * this._dir_vec.y - this._dir_vec.x * this._plane_vec.y);
         const transform_x = inv_det * (this._dir_vec.y * sprite_x - this._dir_vec.x * sprite_y);
         const transform_y = inv_det * (this._plane_vec.y * -1 * sprite_x + this._plane_vec.x * sprite_y);
         //                                                  ^ idk y i need to inverse it here

         const width = this._viewport.width;
         const height = this._viewport.height;

         const sprite_screen_x = (width / 2) * (1 - transform_x / transform_y);

         const _sprite_width = abs(this._options.scene.height / transform_y) * this._options.scene.tile_width;
         const _sprite_height = abs(this._options.scene.height / transform_y) * this._options.scene.tile_height;

         const sprite_width = map_range(_sprite_width, 0, this._options.scene.width, 0, this._viewport.width);
         const sprite_height = map_range(_sprite_height, 0, this._options.scene.height, 0, this._viewport.height);

         let draw_start_x = int(-sprite_width / 2 + sprite_screen_x);
         if (draw_start_x < 0) draw_start_x = 0;
         let draw_start_y = int(-sprite_height / 2 + height / 2);
         if (draw_start_y < 0) draw_start_y = 0;

         let draw_end_x = int(sprite_width / 2 + sprite_screen_x);
         if (draw_end_x >= width) draw_end_x = width;
         let draw_end_y = int(sprite_height / 2 + height / 2);
         if (draw_end_y >= height) draw_end_y = height;

         const texture = this._options.scene.textures[sprite.texture_id];
         for (let stripe = draw_start_x; stripe < draw_end_x; stripe++) {
            let tex_x = int(
               int((256 * (stripe - (-sprite_width / 2 + sprite_screen_x)) * texture.w) / sprite_width) / 256
            );

            if (tex_x < 0) {
               tex_x = 0;
            }

            if (transform_y > 0 && transform_y < z_buffer[stripe]) {
               for (let y = draw_start_y; y < draw_end_y; y++) {
                  const d = y * 256 - height * 128 + sprite_height * 128;
                  let tex_y = int((d * texture.h) / sprite_height / 256);
                  if (tex_y < 0) {
                     tex_y = 0;
                  }
                  const clr = texture.raw_pixels[texture.w * tex_y + tex_x];

                  const [r, g, b, a] = clr || [0, 0, 0, 0];
                  if (r + g + b === 0 || a === 0) {
                     continue;
                  }

                  if (sprite.translucent) {
                     const old_color = get_image_pixel(stripe, y, view_buffer.pixels, this._viewport.width);
                     const new_color = average_colors(old_color, clr);
                     set_image_pixel(stripe, y, new_color, view_buffer.pixels, this._viewport.width);
                  } else {
                     set_image_pixel(stripe, y, clr, view_buffer.pixels, this._viewport.width);
                  }

               }
            }
         }
      }
   }

   /**
    * Renders the camera on the canvas.
    *
    * @private
    */
   _render_camera(x_pos, y_pos, size_factor, ray_collisions) {
      const dir_vec = this._dir_vec.copy();
      const plane_vec = this._plane_vec.copy();
      const plane_center_vec = this._plane_center_vec.copy();
      plane_center_vec.add(dir_vec);

      if (this._options.debug_rays) {
         stroke(...RED, 255 / 4);
         fill(...RED, 255);

         const ray_dir = createVector(x_pos, y_pos);

         for (let ray = 0; ray < this._viewport.width; ray++) {
            const camera_x = (2 * ray) / this._viewport.width - 1;
            let distance = ray_collisions[ray].distance;
            if (!isFinite(distance)) {
               distance = windowWidth;
            }
            ray_dir.x = this._dir_vec.x + this._plane_vec.x * camera_x;
            ray_dir.y = this._dir_vec.y + this._plane_vec.y * camera_x;
            ray_dir.setMag(distance * size_factor);
            ray_dir.x += x_pos;
            ray_dir.y += y_pos;

            line(x_pos, y_pos, ray_dir.x, ray_dir.y);
         }
      }

      dir_vec.setMag(CAMERA_PLANE_DISTANCE);
      plane_vec.mult(CAMERA_PLANE_DISTANCE);
      plane_center_vec.add(dir_vec);

      const camera_plane_start_x = (plane_center_vec.x - plane_vec.x) * size_factor;
      const camera_plane_start_y = (plane_center_vec.y - plane_vec.y) * size_factor;

      const camera_plane_end_x = (plane_center_vec.x + plane_vec.x) * size_factor;
      const camera_plane_end_y = (plane_center_vec.y + plane_vec.y) * size_factor;

      stroke(GREEN);
      fill(...GREEN, 255 / 10);
      triangle(x_pos, y_pos, camera_plane_start_x, camera_plane_start_y, camera_plane_end_x, camera_plane_end_y);
      fill(WHITE);
      stroke(WHITE);

      circle(x_pos, y_pos, 10);
   }

   /**
    * Renders a minimap of the scene and displays it on the canvas.
    *
    * @param {number} sizeFactor - the scale factor to resize the scene for the minimap.
    */
   _render_minimap(size_factor, ray_collisions) {
      if (!this._minimap_buffer) {
         this._minimap_buffer = createFramebuffer({
            depth: false
         });
      }

      const camera_pos_x = this._pos_vec.x * size_factor;
      const camera_pos_y = this._pos_vec.y * size_factor;

      this._minimap_buffer.draw(() => {
         this._render_camera(camera_pos_x, camera_pos_y, size_factor, ray_collisions);
         this._options.scene.render(size_factor);
      });

      const mm_size = this._options.mm_size;

      noFill();
      stroke(GREEN);
      rect(0, 0, mm_size, mm_size);

      image(
         this._minimap_buffer,
         0,
         0,
         mm_size,
         mm_size,
         camera_pos_x - mm_size / 2 + this._options.scene.width / 2,
         camera_pos_y - mm_size / 2 + this._options.scene.height / 2,
         mm_size,
         mm_size
      );
   }

   /**
    * Renders the current view buffer based on the given ray collisions.
    *
    * @param {Array} ray_collisions - The ray collisions array.
    */
   _render(ray_collisions) {
      // this._view_buffer.pixels.fill(...WHITE);

      // actually renders ceiling too
      this._render_floor(this._view_buffer);
      this._render_walls(ray_collisions, this._view_buffer, this._z_buffer);
      if (this._options.show_sprites) {
         this._render_sprites(ray_collisions, this._view_buffer, this._z_buffer);
      }

      this._view_buffer.updatePixels();

      translate(-this._options.scene.width / 2, -this._options.scene.height / 2);
      image(this._view_buffer, 0, 0, this._options.scene.width, this._options.scene.height);

      this._render_minimap(this._options.mm_scale, ray_collisions);
   }

   /**
    * Performs the ray marching process to determine the scene collisions.
    *
    * @param {BaseObject[]} scene_objects - The scene objects to check for collisions.
    */
   march(scene_objects) {
      this._minimap_buffer && this._minimap_buffer.draw(() => background(BLACK));

      this._calc_projection_plane();

      const ray_collisions = [];
      const ray_step_vec = {
         x: 0,
         y: 0
      };
      const ray_dir = this._dir_vec.copy();

      let total_ray_distance;
      let wall_collision_data = {
         distance: Infinity,
         color: GREEN,
         half_color: RED
      };

      for (let ray = 0; ray < this._viewport.width; ray++) {
         const camera_x = (2 * ray) / this._viewport.width - 1;
         ray_dir.x = this._dir_vec.x + this._plane_vec.x * camera_x;
         ray_dir.y = this._dir_vec.y + this._plane_vec.y * camera_x;

         ray_step_vec.x = this._pos_vec.x;
         ray_step_vec.y = this._pos_vec.y;

         total_ray_distance = 0;

         for (let i = 0; i < this._options.steps; i++) {
            let min_wall_distance = Infinity;

            for (const object of scene_objects) {
               const collision = object.collide(ray_step_vec.x, ray_step_vec.y);

               if (collision.distance < min_wall_distance) {
                  min_wall_distance = collision.distance;
                  wall_collision_data = collision;
               }

               if (min_wall_distance <= this._options.accuracy) {
                  wall_collision_data = collision;
                  break;
               }
            }

            if (this._options.debug_sdf && this._minimap_buffer) {
               this._minimap_buffer.draw(() => {
                  if (i > 0 || (!i && !ray)) {
                     noFill();
                     stroke(...GREEN, 255 / 4);
                     circle(
                        ray_step_vec.x * this._options.mm_scale,
                        ray_step_vec.y * this._options.mm_scale,
                        wall_collision_data.distance * 2
                     );
                  }
               });
            }

            total_ray_distance += wall_collision_data.distance ?? 0;
            ray_dir.setMag(total_ray_distance);

            const next_ray_step_x = ray_dir.x + this._pos_vec.x;
            const next_ray_step_y = ray_dir.y + this._pos_vec.y;

            ray_step_vec.x = next_ray_step_x;
            ray_step_vec.y = next_ray_step_y;

            this._options.debug_sdf &&
               this._minimap_buffer &&
               this._minimap_buffer.draw(() => {
                  circle(ray_step_vec.x * this._options.mm_scale, ray_step_vec.y * this._options.mm_scale, 5);
               });

            if (total_ray_distance > this._options.scene.width || total_ray_distance > this._options.scene.height) {
               wall_collision_data.distance = Infinity;
               total_ray_distance = Infinity;
            }

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

      this._render(ray_collisions);
   }
}
