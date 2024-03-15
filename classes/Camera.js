import { SHADING_TYPE, BLACK, PLAYER_SPEED, ROTATE_SPEED, FLOOR_COLOR, CEILING_COLOR, WHITE } from 'defaults';
import { deg_to_rad, sin, tan, int, abs, map_range } from 'math_utils';
import { get_image_pixel, set_image_pixel, average_colors } from 'textures';

const FLOOR_TEXTURE = 2;
const FLOOR_TEXTURE2 = 8;
const CEILING_TEXTURE = 3;

class RayCamera {
   constructor({ scene, viewport, options }) {
      this._scene = scene;
      this._viewport = viewport;
      this._options = options;

      // camera projection
      this._pos_vec = createVector(scene.w / 2, scene.h / 2);
      this._dir_vec = createVector(0, -1);
      this._plane_vec = createVector(0, this._plane_y);

      this._plane_center_vec = createVector(this._pos_vec.x, this._pos_vec.y);
      this._plane_display_start_vec = null;
      this._plane_display_end_vec = null;

      this._sprite_order = new Array(this._scene.sprites?.length || 0);
      this._sprite_distance = new Array(this._scene.sprites?.length || 0);

      this.calc_viewport();
   }

   /**
    * Calculate the viewport dimensions based on the scene dimensions and resolution options.
    */
   calc_viewport() {
      this._viewport = {
         w: int(this._scene.w * (this._options.resolution / 100)),
         h: int(this._scene.h * (this._options.resolution / 100))
      };
      this._plane_y = tan(deg_to_rad(this._options.fov) / 2);
      this._height_amp = 100;

      this._view_buffer = createImage(this._viewport.w, this._viewport.h);
      this._view_buffer.loadPixels();
      this._z_buffer = new Array(this._viewport.w);
   }

   /**
    * Sets the sprites to be rendered by the camera.
    * @param {Array} sprites - An array of Sprite objects to be rendered by the camera.
    * @returns {void}
    */
   set_sprites(sprites) {
      this._scene.sprites = sprites || [];
      this._sprite_order = new Array(sprites?.length || 0);
      this._sprite_distance = new Array(sprites?.length || 0);
   }

   /**
    * Get an option by its name.
    * @param {string} name The name of the option to get.
    * @returns {any} The option value, or undefined if the option is not set.
    */
   get_option(name) {
      return this._options?.[name];
   }

   /**
    * Sets the value of an option.
    * @param {string} option - The name of the option to set.
    * @param {any} value - The value to set for the option.
    * @returns {void}
    */
   set_option(option, value) {
      if (option in this._options) {
         this._options[option] = value;
      }
   }

   /**
    * Handles camera movement.
    * @description This function uses the `keyIsDown` function to check if a key is pressed, and if it is, it updates the camera's position and direction vector accordingly.
    * @returns {void}
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

   set_pos(pos_vec) {
      this._pos_vec = pos_vec;
   }

   get_pos() {
      return this._pos;
   }

   /**
    * Displays the camera on the canvas.
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

   // REVIEW: optimize vectors math
   _calc_projection_plane() {
      this._plane_vec.x = 0;
      this._plane_vec.y = this._plane_y;

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
    * @private
    */
   _sort_sprites() {
      this._sprite_distance.sort((a, b) => a - b);
      this._sprite_order.sort((a, b) => this._sprite_distance.indexOf(a) - this._sprite_distance.indexOf(b));
   }

   /**
    * Calculates the floor direction based on the direction vector and plane vector.
    * @return {Object} Object containing start and end direction coordinates
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

   _render_floor(ray_collisions, view_buffer) {
      let x_pos, y_pos;
      let cell_x, cell_y;
      let tex_x, tex_y;
      let ceiling_y;
      let floor_texture, floor_color, ceiling_color;

      floor_texture = this._scene.textures[FLOOR_TEXTURE];
      const ceiling_texture = this._scene.textures[CEILING_TEXTURE];

      const { start_dir_x, start_dir_y, end_dir_x, end_dir_y } = this._get_floor_dir();

      const start_x = this._pos_vec.x / floor_texture.w;
      const start_y = this._pos_vec.y / floor_texture.h;

      // vertical position of the camera
      const z_pos = this._viewport.h / 2;

      for (let y = int(z_pos); y < this._viewport.h; y++) {
         ceiling_y = this._viewport.h - 1 - y;

         if (this._options.show_textures) {
            // current y position compared to the center of the screen (the horizon)
            const horizon_height = int(y - z_pos);
            // horizontal distance from the camera to the floor for the current row.
            // 0.5 is the z position exactly in the middle between floor and ceiling.
            const row_dist = z_pos / horizon_height;

            // calculate the real world step vector we have to add for each x (parallel to camera plane)
            // adding step by step avoids multiplications with a weight in the inner loop
            const step_x = (row_dist * (end_dir_x - start_dir_x)) / this._viewport.w;
            const step_y = (row_dist * (end_dir_y - start_dir_y)) / this._viewport.w;

            // real world coordinates of the leftmost column. This will be updated as we step to the right.
            x_pos = start_x + row_dist * start_dir_x;
            y_pos = start_y + row_dist * start_dir_y;

            for (let x = 0; x < this._viewport.w; x++) {
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
                  floor_color = this._scene.textures[FLOOR_TEXTURE].half_raw_pixels[floor_texture.h * tex_y + tex_x];
               } else {
                  floor_color = this._scene.textures[FLOOR_TEXTURE2].half_raw_pixels[ceiling_texture.h * tex_y + tex_x];
               }

               set_image_pixel(x, y, floor_color, view_buffer.pixels, this._viewport.w);
               set_image_pixel(x, ceiling_y, ceiling_color, view_buffer.pixels, this._viewport.w);
            }
         } else {
            for (let x = 0; x < ray_collisions.length; x++) {
               // const ceiling_color =
               set_image_pixel(x, y, FLOOR_COLOR, view_buffer.pixels, this._viewport.w);
               set_image_pixel(x, ceiling_y, CEILING_COLOR, view_buffer.pixels, this._viewport.w);
            }
         }
      }
   }

   _render_walls(ray_collisions, view_buffer, z_buffer) {
      const collisions_count = ray_collisions.length;

      for (let scanLine = 0; scanLine < collisions_count; scanLine++) {
         const line_data = ray_collisions[scanLine];
         const distance = this._options.fisheye_correction ? line_data.perp_distance : line_data.distance;

         const line_height = int(this._viewport.h / (distance / this._height_amp));

         let draw_start = int(-line_height / 2 + this._viewport.h / 2);
         if (draw_start < 0) draw_start = 0;
         let draw_end = draw_start + line_height;
         if (draw_end >= this._viewport.h) draw_end = this._viewport.h - 1;

         if (this._options.show_textures) {
            if (!(line_data.texture_id !== undefined && line_data.texture_id !== null)) {
               console.error('MISSING TEXTURE');
               return;
            }

            const texture = this._scene.textures[line_data.texture_id];
            const step = (1.0 * texture.h) / line_height;

            const tex_x = int(line_data.tex_x_pos);
            let tex_pos = (draw_start - this._viewport.h / 2 + line_height / 2) * step;

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

               set_image_pixel(collisions_count - scanLine - 1, y, tex_color, view_buffer.pixels, this._viewport.w);
            }
         } else {
            let wall_color = line_data.color;
            if (this._options.shading_type === SHADING_TYPE.DISTANCE) {
               wall_color = lerpColor(line_data.color, BLACK, line_data.distance / this._viewport.h);
            }
            if (this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit) {
               wall_color = line_data.half_color;
            }

            for (let y = draw_start; y < draw_end; y++) {
               set_image_pixel(collisions_count - scanLine - 1, y, wall_color, view_buffer.pixels, this._viewport.w);
            }
         }

         z_buffer[collisions_count - scanLine] = line_data.perp_distance;
      }
   }

   _render_sprites(ray_collisions, view_buffer, z_buffer) {
      const numSprites = this._scene.sprites.length;
      for (let i = 0; i < numSprites; i++) {
         this._sprite_order[i] = i;
         this._sprite_distance[i] =
            (this._pos_vec.x - this._scene.sprites[i].x) * (this._pos_vec.x - this._scene.sprites[i].x) +
            (this._pos_vec.y - this._scene.sprites[i].y) * (this._pos_vec.y - this._scene.sprites[i].y);
      }

      this._sort_sprites();

      for (let i = 0; i < numSprites; i++) {
         const sprite = this._scene.sprites[this._sprite_order[i]];
         const sprite_x = sprite.x - this._pos_vec.x;
         const sprite_y = sprite.y - this._pos_vec.y;

         const inv_det = 1 / (this._plane_vec.x * this._dir_vec.y - this._dir_vec.x * this._plane_vec.y);
         const transform_x = inv_det * (this._dir_vec.y * sprite_x - this._dir_vec.x * sprite_y);
         const transform_y = inv_det * (this._plane_vec.y * sprite_x * -1 + this._plane_vec.x * sprite_y);
         //                                                             ^ idk y i need to inverse it here

         const width = ray_collisions.length - 1;
         const height = this._viewport.h;

         const sprite_screen_x = int((width / 2) * (1 - transform_x / transform_y));
         const sprite_height = abs(int(height / transform_y));

         let draw_start_y = int(-sprite_height / 2 + height / 2);
         if (draw_start_y < 0) draw_start_y = 0;
         let draw_end_y = int(sprite_height / 2 + height / 2);
         if (draw_end_y >= height) draw_end_y = height - 1;

         const _sprite_width = abs(int(height / transform_y));
         const sprite_width = int(map_range(_sprite_width, 0, this._viewport.w, 0, width));
         let draw_start_x = int(-sprite_width / 2 + sprite_screen_x);
         if (draw_start_x < 0) draw_start_x = 0;
         let draw_end_x = int(sprite_width / 2 + sprite_screen_x);
         if (draw_end_x >= width) draw_end_x = width;

         const texture = this._scene.textures[sprite.texture_id];
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

                  const old_color = get_image_pixel(stripe, y, view_buffer.pixels, this._viewport.w);
                  // view_buffer.set(stripe, y, clr);
                  set_image_pixel(stripe, y, clr, view_buffer.pixels, this._viewport.w);
                  // const new_color = average_colors(old_color, clr);
                  // set_image_pixel(stripe, y, new_color, view_buffer.pixels, this._viewport.w);
               }
            }
         }
      }
   }

   /**
    * Renders the current view buffer based on the given ray collisions.
    * @param {Array} ray_collisions - The ray collisions array.
    */
   render(ray_collisions) {
      this._view_buffer.pixels.fill(0);
      // actually renders ceiling too
      this._render_floor(ray_collisions, this._view_buffer);
      this._render_walls(ray_collisions, this._view_buffer, this._z_buffer);
      if (this._options.show_sprites) {
         this._render_sprites(ray_collisions, this._view_buffer, this._z_buffer);
      }
      this._view_buffer.updatePixels();

      image(this._view_buffer, 0, 0, this._scene.w, this._scene.h);
   }

   /**
    * Performs the ray marching process to determine the scene collisions.
    * @param {BaseObject[]} scene_objects - The scene objects to check for collisions.
    */
   march(scene_objects) {
      this._calc_projection_plane();

      const ray_collisions = [];
      const ray_step_vec = createVector();

      let total_ray_distance;
      let wall_collision_data = {};

      for (let ray = 0; ray < this._viewport.w; ray++) {
         const camera_x = (2 * ray) / this._viewport.w - 1;
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

               if (min_wall_distance > this._scene.w || min_wall_distance > this._scene.h) {
                  wall_collision_data = {
                     distance: 400,
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
               if ((ray === 0 || ray === this._viewport.w - 1) && i) {
                  stroke(0, 255, 0, 1);
                  text(`${i}`, ray_step_vec.x, ray_step_vec.y);
               }

               pop();
            }

            total_ray_distance += wall_collision_data.distance;
            ray_dir.setMag(total_ray_distance);

            const next_ray_step_x = ray_dir.x + this._pos_vec.x;
            const next_ray_step_y = ray_dir.y + this._pos_vec.y;

            if (this._options.debug_rays || ray === 0 || ray === this._viewport.w - 1) {
               push();

               stroke(0, 255, 0, 0.4);
               line(ray_step_vec.x, ray_step_vec.y, next_ray_step_x, next_ray_step_y);

               pop();
            }

            ray_step_vec.x = next_ray_step_x;
            ray_step_vec.y = next_ray_step_y;

            if (
               wall_collision_data.distance <= this._options.accuracy ||
               wall_collision_data.distance > this._scene.w ||
               wall_collision_data.distance > this._scene.h
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

export { RayCamera };
