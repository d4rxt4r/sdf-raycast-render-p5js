References

-  [Lode's Computer Graphics Tutorial - Raycasting](https://lodev.org/cgtutor/raycasting.html)
-  [p5.js](https://p5js.org/reference/)

Known Bugs a.k.a
FIXME

-  [ ] textures skewing if player too close

       possible solution: use -128/128 height data

-  [ ] texture misalignment
-  [x] reimplement shading in shaders
-  [ ] blurry textures
-  [ ] gui buttons broken after GUI toggle
-  [ ] is_side_hit is wrong than looking straight up/down/left/right

Possible performance improvements:

-  [ ] use WebGL Framebuffers to draw graphics
-  [ ] calculations in separate web workers
-  [ ] remove unnecessary p5.push()'s and p5.pop()'s
-  [ ] redraw on changes? (https://p5js.org/reference/#/p5/redraw)

TODO List:

-  [ ] floor shadow
-  [ ] separate render class and ray camera
-  [ ] add side shading to all objects
-  [ ] add texture to all objects
-  [ ] make sprites a class to give them modify attrs
-  [ ] add transparent textures
-  [ ] implement distance-based texture shading
-  [ ] add collisions
-  [ ] implement DDA to compare to SDF
-  [ ] add walls, floors and ceilings variable heights
-  [ ] connect nearest boxes to one object
-  [ ] add more complex shapes
-  [ ] add skybox
