import BaseObject from './Base.js';
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

      if (d <= 0.01) {
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

   render() {
      noStroke();
      fill(this._color);
      rect(this.x, this.y, this._w, this._h);
      if (this._texture) {
         image(this._texture.data, this.x, this.y, this._w, this._h);
      }
   }

   static gen(w, h) {
      return new SDFBox(random(20, w - 20), random(20, h - 20), random(15, 50), random(15, 50));
   }
}

export default SDFBox;
