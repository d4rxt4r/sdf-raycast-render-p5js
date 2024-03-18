/* Represents a base object with an x and y position and a color. */
class BaseObject {
   /**
    * Constructs a new BaseObject.
    *
+    * @param {Object} options - The options for the object.
+    * @param {number} options.x - The x position of the object.
+    * @param {number} options.y - The y position of the object.
    */
   constructor({ x, y }) {
      /**
       * The x position of the object.
       * @type {number}
       */
      this.x = x;

      /**
       * The y position of the object.
       * @type {number}
       */
      this.y = y;

      /**
       * The color of the object.
       * @type {Array.<number>}
       * @private
       */
      this._color = [random(256), random(256), random(256)];
   }

   get _side_color() {
      if (!this._color) {
         return null;
      }
      return this._color.map((l, i) => (i === 3 ? l : l / 2));
   }

   /**
    * Checks for collision with another object.
    * MUST BE IMPLEMENTED in a child class.
    *
    * @throws {Error} Throws an error if not implemented.
    */
   collide() {
      throw new Error('collide() MUST BE IMPLEMENTED in ' + this.constructor.name);
   }

   /**
    * Renders the object.
    * MUST BE IMPLEMENTED in a child class.
    *
    * @throws {Error} Throws an error if not implemented.
    */
   render() {
      throw new Error('render() MUST BE IMPLEMENTED in' + this.constructor.name);
   }

   /**
    * Generates a new object.
    * MUST BE IMPLEMENTED in a child class.
    *
    * @throws {Error} Throws an error if not implemented.
    * @static
    */
   static gen() {
      throw new Error('gen() MUST BE IMPLEMENTED in', this.constructor.name);
   }
}

export default BaseObject;
