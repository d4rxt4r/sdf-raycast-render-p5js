import { max, abs, map_range } from 'math_utils';
import BaseObject from './Base.js';

class SDFTriangle extends BaseObject {
   constructor({ x, y, ab_dist, ac_dist, color, sign, textures, texture_id }) {
      super({ x, y, color });

      this.ab_dist = ab_dist;
      this.ac_dist = ac_dist;

      this.ax = x;
      this.ay = y;

      //       ax
      this.bx = x + ab_dist;
      //       ay
      this.by = y;

      //       ax
      this.cx = x;
      //       ay
      this.cy = y + ac_dist;

      this.ab_dist = abs(ab_dist);
      this.ac_dist = abs(ac_dist);
      this.bc_dist = dist(this.bx, this.by, this.cx, this.cy);

      this._sign = sign ?? 1;
      this._texture_id = texture_id;
      this._texture = textures ? textures[texture_id] : null;
   }

   getDistanceToSide(x1, y1, x2, y2, cx, cy, sideWidth) {
      return ((y2 - y1) * cx - (x2 - x1) * cy + x2 * y1 - y2 * x1) / sideWidth;
   }

   collide(cx, cy) {
      const abDistance = this.getDistanceToSide(this.ax, this.ay, this.bx, this.by, cx, cy, this.ab_dist) * this._sign;
      const caDistance = this.getDistanceToSide(this.cx, this.cy, this.ax, this.ay, cx, cy, this.ac_dist) * this._sign;
      const bcDistance = this.getDistanceToSide(this.bx, this.by, this.cx, this.cy, cx, cy, this.bc_dist) * this._sign;

      const is_side_hit = caDistance >= abDistance && caDistance >= bcDistance;
      const ab_ca_max = max(abDistance, caDistance);
      const d = max(ab_ca_max, bcDistance);

      const side_dist = is_side_hit ? abs(abDistance) : abs(caDistance);
      const side_len = is_side_hit ? this.ab_dist : this.ac_dist;

      const tex_x_pos = map_range(side_dist, 0, side_len, 0, this._texture.w - 1, true);

      return {
         distance: d,
         color: this._color,
         half_color: this._side_color,
         tex_x_pos,
         is_side_hit
      };
   }

   render(size_factor = 1) {
      noStroke();
      fill(this._color);
      triangle(
         this.ax * size_factor,
         this.ay * size_factor,
         this.bx * size_factor,
         this.by * size_factor,
         this.cx * size_factor,
         this.cy * size_factor
      );
   }

   static gen(w, h) {
      return new SDFTriangle({
         x: random(20, w - 20),
         y: random(20, h - 20),
         ab_dist: random(-20, 20),
         ac_dist: random(-20, 20)
      });
   }
}

export default SDFTriangle;
