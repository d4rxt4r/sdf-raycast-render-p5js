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

   render() {
      noStroke();
      fill(this._color);
      circle(this.x, this.y, this.r * 2);
   }

   static gen(w, h) {
      return new SDFCircle(random(20, w - 20), random(20, h - 20), random(5, 20));
   }
}

export default SDFCircle;
