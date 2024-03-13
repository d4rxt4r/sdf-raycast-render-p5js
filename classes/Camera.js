import { SHADING_TYPE, BLACK, PLAYER_SPEED, ROTATE_SPEED } from 'defaults';
import { deg_to_rad, sin, tan, int } from 'math_utils';

const FLOOR_TEXTURE = 4;
const CEILING_TEXTURE = 3;
const FLOOR_TEXT_AMP = 0.5;
const FLOOR_TEX_SIZE = 1 / FLOOR_TEXT_AMP;

const VIEW_PLANE_MAG = 30;

class RayCamera {
   constructor({ scene, viewport, options }) {
      this._scene = scene;
      this._viewport = viewport;
      this._options = options;

      // camera projection
      this._pos_vec = createVector(scene.w / 2, scene.h / 2);
      this._dir_vec = createVector(0, 1);
      this._plane_vec = createVector(0, this._plane_y);

      this._plane_center_vec = createVector(this._pos_vec.x, this._pos_vec.y);
      this._plane_display_start_vec = null;
      this._plane_display_end_vec = null;

      this._sprite_order = new Array(this._scene.sprites?.length || 0);
      this._sprite_distance = new Array(this._scene.sprites?.length || 0);

      this.calc_viewport();
   }

   calc_viewport() {
      this._start_ray_index = 0;
      this._last_ray_index = this._options.rays;
      this._plane_y = tan(deg_to_rad(this._options.fov) / 2) * VIEW_PLANE_MAG;

      this._view_buffer = createImage(this._options.rays + 1, this._scene.h);
      this._view_buffer.loadPixels();

      this._z_buffer = new Array(this._options.rays + 1);
   }

   setSprites(sprites) {
      this._scene.sprites = sprites || [];
      this._sprite_order = new Array(sprites?.length || 0);
      this._sprite_distance = new Array(sprites?.length || 0);
   }

   getOptions() {
      return this._options;
   }

   setOption(option, value) {
      if (option in this._options) {
         this._options[option] = value;
      }
   }

   /**
    * Handles camera movement.
    *
    * This function uses the `keyIsDown` function to check if a key is pressed, and if it is, it updates the camera's position and direction vector accordingly.
    *
    * @method move
    * @memberof RayCamera
    * @public
    */
   move() {
      if (keyIsDown(87)) {
         this._pos_vec.add(this._dir_vec.setMag(PLAYER_SPEED));
      }
      if (keyIsDown(83)) {
         this._pos_vec.sub(this._dir_vec.setMag(PLAYER_SPEED));
      }
      if (keyIsDown(65)) {
         this._dir_vec.rotate(-ROTATE_SPEED);
      }
      if (keyIsDown(68)) {
         this._dir_vec.rotate(ROTATE_SPEED);
      }
   }

   setPos(x, y) {
      this._pos_vec.x = x;
      this._pos_vec.y = y;
   }

   getPos() {
      return this._pos;
   }

   setOpt(option, value) {
      this._options[option] = value;
   }

   /**
    * Displays the camera on the canvas.
    * @private
    */
   _display_camera() {
      push();

      fill(255);
      stroke(255);
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

   _calc_projection_plane() {
      // REVIEW: setMag is kinda slow
      this._dir_vec.setMag(VIEW_PLANE_MAG);

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

   _sort_sprites() {
      const sprites = new Array(this._scene.sprites.length);
      for (let i = 0; i < this._scene.sprites.length; i++) {
         sprites[i] = {
            first: this._sprite_distance[i],
            second: this._sprite_order[i]
         };
      }
      sprites.sort((a, b) => a.first - b.first);
      for (let i = 0; i < this._scene.sprites.length; i++) {
         this._sprite_distance[i] = sprites[this._scene.sprites.length - i - 1].first;
         this._sprite_order[i] = sprites[this._scene.sprites.length - i - 1].second;
      }
   }

   _render_floor(ray_collisions, view_buffer) {
      const floor_texture = this._scene.textures[FLOOR_TEXTURE];
      const ceiling_texture = this._scene.textures[CEILING_TEXTURE];

      const start_dir_x = ((this._dir_vec.x + this._plane_vec.x) * FLOOR_TEX_SIZE) / VIEW_PLANE_MAG;
      const start_dir_y = ((this._dir_vec.y + this._plane_vec.y) * FLOOR_TEX_SIZE) / VIEW_PLANE_MAG;

      const end_dir_x = ((this._dir_vec.x - this._plane_vec.x) * FLOOR_TEX_SIZE) / VIEW_PLANE_MAG;
      const end_dir_y = ((this._dir_vec.y - this._plane_vec.y) * FLOOR_TEX_SIZE) / VIEW_PLANE_MAG;

      const start_tex_x = (this._pos_vec.x / floor_texture.w) * FLOOR_TEX_SIZE;
      const start_tex_y = (this._pos_vec.y / floor_texture.h) * FLOOR_TEX_SIZE;

      let tex_x, tex_y;
      let cell_x, cell_y;
      let tx, ty;

      for (let y = 0; y < this._viewport.h; y++) {
         const horizon_height = int(y - this._viewport.h / 2);
         const z_pos = this._viewport.h / 2;
         const row_dist = z_pos / horizon_height;

         const tex_step_x = (row_dist * (end_dir_x - start_dir_x)) / ray_collisions.length;
         const tex_step_y = (row_dist * (end_dir_y - start_dir_y)) / ray_collisions.length;

         tex_x = start_tex_x + row_dist * start_dir_x;
         tex_y = start_tex_y + row_dist * start_dir_y;

         for (let x = 0; x <= ray_collisions.length; x++) {
            cell_x = int(tex_x);
            cell_y = int(tex_y);

            tx = int(floor_texture.w * (tex_x - cell_x)) & (floor_texture.w - 1);
            ty = int(floor_texture.h * (tex_y - cell_y)) & (floor_texture.h - 1);

            tex_x += tex_step_x;
            tex_y += tex_step_y;

            const floor_color = floor_texture.half_raw_pixels[floor_texture.h * ty + tx];
            view_buffer.set(x, y, floor_color);

            const ceiling_color = ceiling_texture.half_raw_pixels[ceiling_texture.h * ty + tx];
            view_buffer.set(x, this._viewport.h - y - 1, ceiling_color);
         }
      }
   }

   _render_walls(ray_collisions, view_buffer, z_buffer) {
      const collisions_count = ray_collisions.length;
      for (let scanLine = 0; scanLine < collisions_count; scanLine++) {
         const line_data = ray_collisions[scanLine];
         const distance = this._options.fisheye_correction ? line_data.perp_distance : line_data.distance;

         const line_height = int((this._scene.h / distance) * (this._scene.h * this._options.wall_height_amp));
         let draw_start = int(-line_height / 2 + this._scene.h / 2);
         if (draw_start < 0) draw_start = 0;
         let draw_end = draw_start + line_height;
         if (draw_end >= this._scene.h) draw_end = this._scene.h - 1;

         if (this._options.show_textures && line_data.texture_id !== undefined && line_data.texture_id !== null) {
            const texture = this._scene.textures[line_data.texture_id];
            const step = (1.0 * texture.h) / line_height;

            const tex_x = int(line_data.tex_x_pos);
            let tex_pos = (draw_start - this._scene.h / 2 + line_height / 2) * step;

            for (let y = draw_start; y < draw_end; y++) {
               const texY = int(tex_pos) & (texture.h - 1);
               tex_pos += step;

               let display_texture =
                  this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit
                     ? texture.half_raw_pixels
                     : texture.raw_pixels;

               const tex_color = display_texture[texture.h * texY + tex_x];
               view_buffer.set(collisions_count - scanLine - 1, y, tex_color);
            }
         } else {
            let wall_color = line_data.color;
            if (this._options.shading_type === SHADING_TYPE.DISTANCE) {
               wall_color = lerpColor(line_data.color, BLACK, distance / this._scene.h);
            }
            if (this._options.shading_type === SHADING_TYPE.SIDE && line_data.is_side_hit) {
               wall_color = line_data.half_color;
            }

            for (let y = draw_start; y < draw_end; y++) {
               view_buffer.set(collisions_count - scanLine - 1, y, wall_color);
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

         const inv_det =
            (1.0 / (this._plane_vec.x * this._dir_vec.y - this._dir_vec.x * this._plane_vec.y)) * VIEW_PLANE_MAG;
         const transform_x = inv_det * (this._dir_vec.y * sprite_x - this._dir_vec.x * sprite_y);
         const transform_y = inv_det * (this._plane_vec.y * sprite_x * -1 + this._plane_vec.x * sprite_y);
         //                                                             ^ idk y i need to inverse it here

         const width = ray_collisions.length - 1;
         const height = this._scene.h;

         const sprite_screen_x = int((width / 2) * (1 - transform_x / transform_y));
         const sprite_height = abs(int(height / transform_y)) * (this._scene.h * this._options.wall_height_amp);

         let draw_start_y = int(-sprite_height / 2 + height / 2);
         if (draw_start_y < 0) draw_start_y = 0;
         let draw_end_y = int(sprite_height / 2 + height / 2);
         if (draw_end_y >= height) draw_end_y = height - 1;

         const _sprite_width = abs(int(height / transform_y)) * (this._viewport.h * this._options.wall_height_amp);
         const sprite_width = int(map(_sprite_width, 0, this._scene.w, 0, width));
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

                  view_buffer.set(stripe, y, clr);
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

      if (this._options.show_textures) {
         // actually renders ceiling too
         this._render_floor(ray_collisions, this._view_buffer);
      }
      this._render_walls(ray_collisions, this._view_buffer, this._z_buffer);
      if (this._options.show_sprites) {
         this._render_sprites(ray_collisions, this._view_buffer, this._z_buffer);
      }

      this._view_buffer.updatePixels();

      push();
      // translate(0, this._scene.h);
      image(this._view_buffer, 0, 0, this._viewport.w, this._viewport.h);
      pop();
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

      for (let ray = this._start_ray_index; ray <= this._last_ray_index; ray++) {
         const camera_x = (2 * ray) / this._options.rays - 1;
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
               if ((ray === this._start_ray_index || ray === this._last_ray_index - 1) && i) {
                  stroke(0, 255, 0, 1);
                  text(`${i}`, ray_step_vec.x, ray_step_vec.y);
               }

               pop();
            }

            total_ray_distance += wall_collision_data.distance;
            ray_dir.setMag(total_ray_distance);

            const next_ray_step_x = ray_dir.x + this._pos_vec.x;
            const next_ray_step_y = ray_dir.y + this._pos_vec.y;

            if (this._options.debug_rays || ray === this._start_ray_index || ray === this._last_ray_index - 1) {
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
