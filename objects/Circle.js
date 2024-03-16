import BaseObject from './Base.js';

class SDFCircle extends BaseObject {
   constructor(x, y, r, c) {
      super(x, y);

      this.r = r;
      if (c) {
         this._color = c;
      }
   }

   collide(cx, cy) {
      const d = dist(cx, cy, this.x, this.y) - this.r;

      return {
         distance: d > 0 ? d : 0,
         color: this._color
      };
   }

   render(size_factor = 1) {
      noStroke();
      fill(this._color);
      circle(this.x * size_factor, this.y * size_factor, this.r * 2 * size_factor);
   }

   static gen(w, h) {
      return new SDFCircle(random(20, w - 20), random(20, h - 20), random(5, 20));
   }
}

export default SDFCircle;
