References

-  [Lode's Computer Graphics Tutorial - Raycasting](https://lodev.org/cgtutor/raycasting.html)
-  [p5.js](https://p5js.org/reference/)

Known Bugs a.k.a
FIXME

-  [ ] sprites are not drawn ar x-res > 50% wtf lol
-  [ ] sprites size is discrete, use floats?
-  [x] sprites sorting is not working properly
-  [ ] is_side_hit is wrong than looking straight up/down/left/right

Possible performance improvements:

-  [ ] calculate sprites order only on player movement 
-  [x] use p5.Graphics instead of p5.Image
-  [x] use WebGL Framebuffers to draw graphics
-  [x] use native JS call for Maths functions
       (sin, cos, max, etc..)
-  [x] 2. don't construct p5.Color objects than array of values can be used
      (use [r, g, b, a] instead of color(r, g, b, a))
-  [x] cache all graphics, resize pixels only on width/height change
       (getImageData is slow)
-  [x] set p5.Image.pixels instead of p5.Image.set()
       (set is slow)
-  [ ] remove unnecessary push()'s and pop()'s
-  [ ] redraw on changes? (https://p5js.org/reference/#/p5/redraw)
-  [ ] try vertical floor casting
-  [ ] try Fast Inverse Sqrt instead of sqrt() for dist functions

TODO List:
- [x] add minimap
- [ ] add side shading to all objects
- [ ] add texture to all objects
- [ ] make entities a class to give them modify attrs
- [ ] add transparent textures
- [ ] implement distance-based texture shading
- [ ] add collisions
- [ ] implement DDA to compare to SDF
- [ ] add walls, floors and ceilings variable heights
- [ ] connect nearest boxes to one object
- [ ] add more complex shapes
- [x] resize window events
