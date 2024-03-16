import { max } from 'math_utils';
import BaseObject from './Base.js';

class SDFTriangle extends BaseObject {
   constructor(x, y, a, b, c, sign) {
      super(x, y);
      this.a = a;
      this.b = b;

      this.ax = x;
      this.ay = y;
      this.bx = x + a;
      this.by = y;
      this.cx = x;
      this.cy = y + b;

      this.abWidth = abs(b);
      this.bcWidth = abs(dist(this.bx, this.by, this.cx, this.cy));
      this.caWidth = abs(a);

      this.sign = sign ?? 1;

      if (c) {
         this._color = c;
      }
   }

   getDistanceToSide(x1, y1, x2, y2, cx, cy, sideWidth) {
      return ((y2 - y1) * cx - (x2 - x1) * cy + x2 * y1 - y2 * x1) / sideWidth;
   }

   collide(cx, cy) {
      const abDistance =
         this.getDistanceToSide(this.ax, this.ay, this.bx, this.by, cx, cy, abs(this.abWidth)) * this.sign;

      const bcDistance =
         this.getDistanceToSide(this.bx, this.by, this.cx, this.cy, cx, cy, abs(this.bcWidth)) * this.sign;

      const caDistance =
         this.getDistanceToSide(this.cx, this.cy, this.ax, this.ay, cx, cy, abs(this.caWidth)) * this.sign;

      const d = max(abDistance, bcDistance, caDistance);

      return {
         distance: d,
         color: this._color
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
      return new SDFTriangle(random(20, w - 20), random(20, h - 20), random(-20, 20), random(-20, 20));
   }
}

export default SDFTriangle;
