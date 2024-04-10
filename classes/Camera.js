import { PLAYER_SPEED, ROTATE_SPEED } from 'const';
import { deg_to_rad, sin, tan, int, abs, map_range } from 'math_utils';
import {
   WHITE,
   BLACK,
   RED,
   GREEN,
   FRAG_FLOOR_COLOR,
   FRAG_CEILING_COLOR,
   TEX_HEIGHT,
   create_texture_from_array_buffer
} from 'textures';
import { SDFScene } from 'classes';

const BG_SHADER = 0;
const WALL_SHADER = 1;
const SPRITES_SHADER = 2;
const SPRITES_SHADER_2 = 3;
const FLOOR_TEXTURE = 3;
const FLOOR_TEXTURE_2 = 9;
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
 * @property {boolean} show_fps - Enable FPS counter.
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
      this._pos_vec = this._options.scene.get_center_vec();
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
       * The buffer for the floor.
       * @type {p5.Framebuffer}
       * @private
       */
      this._floor_buffer = null;
      /**
       * The buffer for the scene view.
       * @type {p5.Framebuffer}
       * @private
       */
      /**
       * The image buffer for the scene view.
       * @type {p5.Framebuffer}
       * @private
       */
      this._view_buffer = null;
      /**
       * The image buffer for the sprites in the scene.
       * @type {p5.Framebuffer}
       * @private
       */
      this._sprites_buffer = null;
      /**
       * Array to store the z-buffer.
       * @type {Uint8ClampedArray}
       */
      this._z_buffer = null;
      /**
       * Array to store the colors of the sprites in the scene.
       * @type {Uint8ClampedArray}
       */
      this._color_buffer = null;
      /**
       * Array to store the information about the textures in the scene.
       * @type {Uint8ClampedArray}
       */
      this._textures_info_buffer = null;
      /**
       * The buffer for the minimap.
       * @type {p5.Framebuffer}
       */
      this._minimap_buffer = null;

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

      if (!this._view_buffer) {
         this._view_buffer = createFramebuffer({
            depth: false,
            antialias: false,
            textureFiltering: NEAREST,
            format: FLOAT
         });

         this._floor_buffer = createFramebuffer({
            depth: false,
            antialias: false,
            textureFiltering: NEAREST,
            format: FLOAT
         });

         this._sprites_buffer = createFramebuffer({
            depth: false,
            antialias: false,
            textureFiltering: NEAREST,
            format: FLOAT
         });
      }

      this._z_buffer = new Uint8ClampedArray(this._viewport.width * 4);
      this._color_buffer = new Uint8ClampedArray(this._viewport.width * 4);
      this._textures_info_buffer = new Uint8ClampedArray(this._viewport.width * 4);
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
         this._pos_vec.add(p5.Vector.setMag(this._dir_vec, PLAYER_SPEED * deltaTime));
      }
      if (keyIsDown(83)) {
         this._pos_vec.sub(p5.Vector.setMag(this._dir_vec, PLAYER_SPEED * deltaTime));
      }
      if (keyIsDown(65)) {
         this._dir_vec.rotate(-ROTATE_SPEED * deltaTime);
      }
      if (keyIsDown(68)) {
         this._dir_vec.rotate(ROTATE_SPEED * deltaTime);
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
    * Renders the floor.
    *
    * @param {Array} draw_buffer
    * @private
    */
   _render_floor(draw_buffer) {
      const floor_texture = this._options.scene.textures.list[FLOOR_TEXTURE];
      const floor_texture_2 = this._options.scene.textures.list[FLOOR_TEXTURE_2];
      const ceiling_texture = this._options.scene.textures.list[CEILING_TEXTURE];

      const background_shader = this._options.scene.shaders[BG_SHADER];

      background_shader.setUniform('u_floor_color', FRAG_FLOOR_COLOR);
      background_shader.setUniform('u_ceiling_color', FRAG_CEILING_COLOR);
      background_shader.setUniform('u_floor_texture', floor_texture.image_data);
      background_shader.setUniform('u_floor_texture2', floor_texture_2.image_data);
      background_shader.setUniform('u_ceiling_texture', ceiling_texture.image_data);
      background_shader.setUniform('u_resolution', [this._viewport.width, this._viewport.height]);
      background_shader.setUniform('u_dir_vec', [this._dir_vec.x, this._dir_vec.y]);
      background_shader.setUniform('u_pos_vec', [this._pos_vec.x, this._pos_vec.y]);
      background_shader.setUniform('u_plane_vec', [this._plane_vec.x, this._plane_vec.y]);
      background_shader.setUniform('u_show_textures', this._options.show_textures);

      draw_buffer.draw(() => {
         shader(background_shader);
         noStroke();
         rect(0, 0, draw_buffer.width, draw_buffer.height);
      });
   }

   /**
    * Renders the walls.
    *
    * @param {Array} draw_buffer
    * @private
    */
   _render_walls(draw_buffer) {
      const walls_shader = this._options.scene.shaders[WALL_SHADER];

      walls_shader.setUniform('u_color_data', create_texture_from_array_buffer(this._color_buffer));
      walls_shader.setUniform('u_z_buffer_data', create_texture_from_array_buffer(this._z_buffer));
      walls_shader.setUniform('u_texture_info_data', create_texture_from_array_buffer(this._textures_info_buffer));
      walls_shader.setUniform('u_resolution', [this._viewport.width, this._viewport.height]);
      walls_shader.setUniform('u_textures_map', this._options.scene.textures.image);
      walls_shader.setUniform('u_textures_map_length', this._options.scene.textures.list.length);
      walls_shader.setUniform('u_show_textures', this._options.show_textures);
      walls_shader.setUniform('u_shading_type', this._options.shading_type);

      draw_buffer.draw(() => {
         shader(walls_shader);
         clear();
         noStroke();
         rect(0, 0, draw_buffer.width, draw_buffer.height);
      });
   }

   /**
    * Renders the sprites.
    *
    * @private
    */
   _render_sprites(draw_buffer) {
      for (let i = 0; i < this._sprite_order.length; i++) {
         const shader_id = (i & 1) === 0 ? SPRITES_SHADER : SPRITES_SHADER_2;
         const sprites_shader = this._options.scene.shaders[shader_id];

         sprites_shader.setUniform('u_z_buffer_data', create_texture_from_array_buffer(this._z_buffer));
         sprites_shader.setUniform('u_resolution', [this._viewport.width, this._viewport.height]);
         sprites_shader.setUniform('u_plane_vec', [this._plane_vec.x, this._plane_vec.y]);
         sprites_shader.setUniform('u_dir_vec', [this._dir_vec.x, this._dir_vec.y]);
         sprites_shader.setUniform('u_textures_map', this._options.scene.textures.image);
         sprites_shader.setUniform('u_textures_map_length', this._options.scene.textures.list.length);

         const sprite = this._options.scene.sprites[this._sprite_order[i]];
         sprites_shader.setUniform('u_sprite_info', [
            sprite.x - this._pos_vec.x,
            sprite.y - this._pos_vec.y,
            sprite.texture_id,
            sprite.translucent
         ]);

         draw_buffer.draw(() => {
            shader(sprites_shader);
            noStroke();
            clear();
            rect(0, 0, draw_buffer.width, draw_buffer.height);
         });
         image(draw_buffer, 0, 0, this._options.scene.width, this._options.scene.height);
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
    * @private
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
         clear();
         this._render_camera(camera_pos_x, camera_pos_y, size_factor, ray_collisions);
         this._options.scene.render(size_factor);
      });

      const mm_size = this._options.mm_size;

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
    * @private
    */
   _render(ray_collisions) {
      // shapes must be filled otherwise shaders wont be drawn
      fill(BLACK);
      // actually renders ceiling too
      this._render_floor(this._floor_buffer);
      this._render_walls(this._view_buffer);

      translate(-this._options.scene.width / 2, -this._options.scene.height / 2);
      image(this._floor_buffer, 0, 0, this._options.scene.width, this._options.scene.height);
      image(this._view_buffer, 0, 0, this._options.scene.width, this._options.scene.height);

      if (this._options.show_sprites) {
         this._render_sprites(this._sprites_buffer);
      }

      noFill();

      if (this._options.show_fps) {
         fill(BLACK);
         noStroke();
         rect(windowWidth - 110, 5, 80, 20);
         fill(GREEN);
         textFont(this._options.scene.fonts.inconsolata, 16);
         textStyle(BOLD);
         text(`FPS: ${round(frameRate())}`, windowWidth - 100, 20);
         noFill();
      }

      this._render_minimap(this._options.mm_scale, ray_collisions);
   }

   /**
    * Performs the ray marching process to determine the scene collisions.
    *
    * @param {BaseObject[]} scene_objects - The scene objects to check for collisions.
    */
   march(scene_objects) {
      // this._minimap_buffer && this._minimap_buffer.draw(() => background(BLACK));

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

            if (total_ray_distance > this._options.scene.width || total_ray_distance > this._options.scene.height) {
               wall_collision_data.distance = Infinity;
               total_ray_distance = Infinity;
               wall_collision_data.color = GREEN;
               wall_collision_data.half_color = RED;
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
         const [r, g, b] = wall_collision_data.color;
         this._color_buffer[ray * 4] = r;
         this._color_buffer[ray * 4 + 1] = g;
         this._color_buffer[ray * 4 + 2] = b;
         this._color_buffer[ray * 4 + 3] = 255;

         this._textures_info_buffer[ray * 4] = map_range(wall_collision_data.tex_x_pos || 0, 0, TEX_HEIGHT, 0, 255);
         this._textures_info_buffer[ray * 4 + 1] = wall_collision_data.texture_id || 0;
         this._textures_info_buffer[ray * 4 + 2] = wall_collision_data.is_side_hit;
         this._textures_info_buffer[ray * 4 + 3] = 255;

         const world_line_height = this._options.fisheye_correction ? perp_distance : total_ray_distance;
         const z_buffer_line_height =
            (this._options.scene.height / world_line_height) * this._options.scene.tile_height;

         this._z_buffer[ray * 4] = 255 - map_range(z_buffer_line_height, 0, this._viewport.height, 0, 255);
         this._z_buffer[ray * 4 + 1] = this._z_buffer[ray * 4];
         this._z_buffer[ray * 4 + 1] = this._z_buffer[ray * 4];
         this._z_buffer[ray * 4 + 3] = 255;

         ray_collisions.push({
            ...wall_collision_data,
            distance: total_ray_distance,
            perp_distance
         });
      }

      this._render(ray_collisions);
   }
}
