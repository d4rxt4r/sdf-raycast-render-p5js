class BaseObject {
   constructor(x, y) {
      this.x = x;
      this.y = y;

      this._color = color(random(256), random(256), random(256));
   }

   collide() {
      throw new Error('collide() MUST BE IMPLEMENTED in ' + this.constructor.name);
   }
   render() {
      throw new Error('render() MUST BE IMPLEMENTED in' + this.constructor.name);
   }
   static gen() {
      throw new Error('gen() MUST BE IMPLEMENTED in', this.constructor.name);
   }
}

export default BaseObject;
