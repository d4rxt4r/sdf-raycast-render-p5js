FIXME:

1. is_side_hit is wrong than looking straight up/down/left/right
2. side textures are drown black from certain perspectives
3. triangles 31, 32 stopped working somehow
4. sprites size is discrete, use floats?
5. sprites x = 0 are not drawn
6. sprites are not drawn ar x-res > 50% wtf lol

Possible performance improvements:

1. use native JS call for Maths functions
   (sin, cos, max, etc..)
2. don't construct p5.Color objects than array of values can be used
   (use [r, g, b, a] instead of color(r, g, b, a))
3. try Fast Inverse Sqrt instead of sqrt() for dist functions
4. cache all graphics, resize pixels only on width/height change
   (getImageData is slow)
5. set p5.Image.pixels instead of p5.Image.set()
   (set is slow)
6. redraw on changes? (https://p5js.org/reference/#/p5/redraw)
7. remove unnecessary push()'s and pop()'s

TODO:

-  add side shading to all objects
-  add texture to all objects
-  implement distance-based texture shading
-  adaptive wall height
-  add hotkeys to menu
-  rewrite GUI's hook() for simple fields changes
-  add collisions
-  implement DDA to compare to SDF
-  add walls, floors and ceilings variable heights
-  connect nearest boxes to one object
-  make entities a class to give them modify attrs
-  add more complex shapes
