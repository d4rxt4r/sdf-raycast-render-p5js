p5.disableFriendlyErrors = true;

import { GUI } from 'GUI';
import { SDFScene } from 'Scene';
import { RayCamera } from 'Camera';
import { USE_WEBGL, WIDTH, HEIGHT, MAX_STEPS, ACCURACY, WIDGETS } from 'defaults';
import { LEVEL_LIST } from 'levels';
import { preload_textures, TEXTURES_LIST } from 'textures';

await preload_textures();

// REACTIVE GUI
const UserUI = new GUI(0, 20, WIDGETS);
UserUI.hook(
   'level_select',
   () => Scene.id,
   (value) => {
      Scene.reInit({
         screen_width: WIDTH,
         screen_height: HEIGHT,
         level_data: LEVEL_LIST[value],
         id: value
      });
      Camera.setSprites(Scene.getSprites());
      Camera.setPos(...Scene.getCenter());
   }
);
UserUI.hook(
   'debug_rays',
   () => Camera.getOptions().debug_rays,
   (value) => Camera.setOption('debug_rays', value)
);
UserUI.hook(
   'debug_sdf',
   () => Camera.getOptions().debug_sdf,
   (value) => Camera.setOption('debug_sdf', value)
);
UserUI.hook(
   'fisheye_correction',
   () => Camera.getOptions().fisheye_correction,
   (value) => Camera.setOption('fisheye_correction', value)
);
UserUI.hook(
   'shading_type',
   () => Camera.getOptions().shading_type,
   (value) => Camera.setOption('shading_type', Number(value))
);
UserUI.hook(
   'wall_height',
   () => Camera.getOptions().wall_height_amp,
   (value) => Camera.setOption('wall_height_amp', Number(value))
);
UserUI.hook(
   'textures',
   () => Camera.getOptions().show_textures,
   (value) => Camera.setOption('show_textures', value)
);
UserUI.hook(
   'sprites',
   () => Camera.getOptions().show_sprites,
   (value) => Camera.setOption('show_sprites', value)
);
UserUI.hook(
   'max_rays',
   () => Camera.getOptions().rays,
   (value) => {
      Camera.setOption('rays', Number(value));
      Camera.calc_viewport();
   }
);
UserUI.hook(
   'fov',
   () => Camera.getOptions().fov,
   (value) => {
      Camera.setOption('fov', Number(value));
      Camera.calc_viewport();
   }
);

const Scene = new SDFScene({
   screen_width: WIDTH,
   screen_height: HEIGHT,
   level_data: LEVEL_LIST[UserUI.get('level_select')],
   id: UserUI.get('level_select')
});

const Camera = new RayCamera({
   scene: {
      w: WIDTH,
      h: HEIGHT,
      sprites: Scene.getSprites(),
      textures: TEXTURES_LIST
   },
   viewport: {
      w: WIDTH,
      h: HEIGHT
   },
   options: {
      accuracy: ACCURACY,
      steps: MAX_STEPS,
      rays: UserUI.get('max_rays'),
      fov: UserUI.get('fov'),
      wall_height_amp: UserUI.get('wall_height'),
      fisheye_correction: UserUI.get('fisheye_correction'),
      debug_rays: UserUI.get('debug_rays'),
      debug_sdf: UserUI.get('debug_sdf'),
      shading_type: UserUI.get('shading_type'),
      show_textures: UserUI.get('textures'),
      show_sprites: UserUI.get('sprites')
   }
});

function setup() {
   // noCursor();
   createCanvas(WIDTH, HEIGHT, USE_WEBGL ? WEBGL2 : P2D);
}

function draw() {
   background(0);

   Scene.render();
   Camera.march(Scene.getObjects());
   UserUI.update();

   if (keyIsPressed) {
      Camera.move(keyCode);
   }

   if (UserUI.get('show_fps')) {
      push();
      fill(100, 255, 0);
      noStroke();
      textFont('Courier New', 16);
      textStyle(BOLD);
      text(`FPS: ${round(frameRate())}`, WIDTH - 100, 20);
      pop();
   }
}

setup();
window.draw = draw;

// FIXME:
// 1. is_side_hit is wrong than looking straight up/down/left/right
// 2. side textures are drown black from certain perspectives
// 3. triangles 31, 32 stopped working somehow
// 4. floor and ceiling moves with different speed relative to walls
// 5. sprites size is discrete, use floats?
//    sprites x = 0 are not drawn
//    sprites are not drawn ar x-res > 50% wtf lol

// Possible performance improvements:
// 1. use native JS call for Maths functions
//    (sin, cos, max, etc..)
// 2. don't construct p5.Color objects than array of values can be used
//    (use [r, g, b, a] instead of color(r, g, b, a))
// 3. try Fast Inverse Sqrt instead of sqrt() for dist functions
// ̶4̶.̶ ̶c̶a̶c̶h̶e̶ ̶a̶l̶l̶ ̶g̶r̶a̶p̶h̶i̶c̶s̶,̶ ̶r̶e̶s̶i̶z̶e̶ ̶p̶i̶x̶e̶l̶s̶ ̶o̶n̶l̶y̶ ̶o̶n̶ ̶w̶i̶d̶t̶h̶/̶h̶e̶i̶g̶h̶t̶ ̶c̶h̶a̶n̶g̶e̶s̶
// ̶ ̶ ̶ ̶(̶g̶e̶t̶I̶m̶a̶g̶e̶D̶a̶t̶a̶ ̶i̶s̶ ̶s̶l̶o̶w̶)̶
// 4.1 set p5.Image.pixels instead of p5.Image.set()
//    (set is slow)
// ̶4̶.̶2̶ ̶a̶l̶s̶o̶ ̶c̶a̶c̶h̶e̶ ̶a̶n̶y̶ ̶a̶r̶r̶a̶y̶s̶ ̶o̶f̶ ̶g̶i̶v̶e̶n̶ ̶l̶e̶n̶g̶t̶h̶
// ̶ ̶ ̶ ̶ ̶(̶r̶e̶u̶s̶e̶ ̶a̶s̶ ̶m̶u̶c̶h̶ ̶a̶s̶ ̶p̶o̶s̶s̶i̶b̶l̶e̶ ̶t̶o̶ ̶a̶v̶o̶i̶d̶ ̶G̶C̶)̶
// 5. redraw on changes? (https://p5js.org/reference/#/p5/redraw)
// 6. remove unnecessary push()'s and pop()'s

// TODO:
// - add side shading to all objects
// - add texture to all objects
// - implement distance-based texture shading
// - adaptive wall height
// - add hotkeys to menu
// - rewrite GUI's hook() for simple fields changes

// 1. add collisions
// 2. implement DDA to compare to SDF
// 3. add walls, floors and ceilings variable heights
// 4. connect nearest boxes to one object
// 5. make entities a class to give them modify attrs
// 6. add more complex shapes
