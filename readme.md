FIXME:

[ ] fix wall height and remove setting

[ ] is_side_hit is wrong than looking straight up/down/left/right
[ ] side textures are drown black from certain perspectives (x-axis)
[ ] triangles 31, 32 stopped working somehow
[ ] sprites size is discrete, use floats?
[ ] sprites x = 0 are not drawn
[ ] sprites are not drawn ar x-res > 50% wtf lol

Possible performance improvements:

[x] use native JS call for Maths functions
(sin, cos, max, etc..)
[x] 2. don't construct p5.Color objects than array of values can be used
(use [r, g, b, a] instead of color(r, g, b, a))
[x] cache all graphics, resize pixels only on width/height change
(getImageData is slow)
[x] set p5.Image.pixels instead of p5.Image.set()
(set is slow)
[ ] remove unnecessary push()'s and pop()'s
[ ] redraw on changes? (https://p5js.org/reference/#/p5/redraw)
[ ] try vertical floor casting
[ ] try Fast Inverse Sqrt instead of sqrt() for dist functions

TODO:

-  add minimap
-  add side shading to all objects
-  add texture to all objects
-  make entities a class to give them modify attrs
-  add transparent textures
-  implement distance-based texture shading
-  add collisions
-  implement DDA to compare to SDF
-  add walls, floors and ceilings variable heights
-  connect nearest boxes to one object
-  add more complex shapes
-  resize window events
