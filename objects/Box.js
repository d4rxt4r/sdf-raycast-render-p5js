import BaseObject from './Base.js';
import { ACCURACY } from 'const';
import { map_range, max, sqrt, abs } from 'math_utils';

class SDFBox extends BaseObject {
   constructor(x, y, width, height, color, textures, texture_id) {
      super(x, y);

      this._w = width;
      this._h = height;
      this._color = color;
      this._side_color = this._color.map((l, i) => (i === 3 ? l : l / 2));
      this._texture_id = texture_id;
      this._texture = textures[texture_id];
   }

   collide(cx, cy) {
      const dx = max(0, this.x - cx, cx - (this.x + this._w));
      const dy = max(0, this.y - cy, cy - (this.y + this._h));
      const is_side_hit = dx >= dy;

      let tex_x_pos;
      const d = sqrt(dx * dx + dy * dy);

      if (d <= ACCURACY * 10) {
         tex_x_pos = map_range(
            is_side_hit ? abs(this.y - cy) : abs(this.x - cx),
            0,
            is_side_hit ? this._h : this._w,
            0,
            this._texture.w - 1,
            true
         );
      }

      return {
         distance: d,
         is_side_hit,
         color: this._color,
         half_color: this._side_color,
         tex_x_pos,
         texture_id: this._texture_id
      };
   }

   /**
    * Render the box object.
    *
    * @param {number} [size_factor=1] - The size factor to scale the rendering.
    * @return {void} This function does not return a value.
    */
   render(size_factor = 1) {
      noStroke();
      fill(this._color);
      const x = this.x * size_factor;
      const y = this.y * size_factor;
      const w = this._w * size_factor;
      const h = this._h * size_factor;
      rect(x, y, w, h);
      if (this._texture) {
         image(this._texture.data, x, y, w, h);
      }
   }

   /**
    * Generate a random box object.
    *
    * @param {number} w - The width of the box.
    * @param {number} h - The height of the box.
    * @return {SDFBox} The generated box object.
    */
   static gen(w, h) {
      return new SDFBox(random(20, w - 20), random(20, h - 20), random(15, 50), random(15, 50));
   }
}

export default SDFBox;
