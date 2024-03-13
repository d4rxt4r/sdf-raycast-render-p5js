import { GUI } from 'GUI';
import { SDFScene } from 'Scene';
import { RayCamera } from 'Camera';
import { USE_WEBGL, WIDTH, HEIGHT, MAX_STEPS, ACCURACY } from 'defaults';
import { LEVEL_LIST } from 'levels';
import { preload_textures, TEXTURES_LIST } from 'textures';
import { round } from 'math_utils';

await preload_textures();

// REACTIVE GUI
const UserUI = new GUI();

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
      sprites: Scene.get_sprites(),
      textures: TEXTURES_LIST
   },
   viewport: {
      w: WIDTH,
      h: HEIGHT
   },
   options: {
      accuracy: ACCURACY,
      steps: MAX_STEPS,
      rays: UserUI.get('rays'),
      fov: UserUI.get('fov'),
      wall_height_amp: UserUI.get('wall_height_amp'),
      fisheye_correction: UserUI.get('fisheye_correction'),
      debug_rays: UserUI.get('debug_rays'),
      debug_sdf: UserUI.get('debug_sdf'),
      shading_type: UserUI.get('shading_type'),
      show_textures: UserUI.get('show_textures'),
      show_sprites: UserUI.get('show_sprites')
   }
});

function setup() {
   createCanvas(WIDTH, HEIGHT, USE_WEBGL ? WEBGL2 : P2D);

   UserUI.hook({
      type: 'custom',
      name: 'level_select',
      getter: () => Scene.id,
      setter: (value) => {
         Scene.change_level({
            screen_width: WIDTH,
            screen_height: HEIGHT,
            level_data: LEVEL_LIST[value],
            id: value
         });
         Camera.setSprites(Scene.get_sprites());
         Camera.setPos(Scene.get_center_vec());
      }
   });
   UserUI.hook({
      type: 'custom',
      name: 'rays',
      getter: () => Camera.get_option('rays'),
      setter: (value) => {
         Camera.set_option('rays', value);
         Camera.calc_viewport();
      }
   });
   UserUI.hook({
      type: 'custom',
      name: 'fov',
      getter: () => Camera.get_option('fov'),
      setter: (value) => {
         Camera.set_option('fov', value);
         Camera.calc_viewport();
      }
   });
   UserUI.hook({
      type: 'custom',
      name: 'target_fps',
      getter: () => UserUI.get('target_fps'),
      setter: (value) => {
         frameRate(value);
      }
   });

   UserUI.hook({
      type: 'option',
      name: 'fisheye_correction',
      object: Camera,
      getter: 'get_option',
      setter: 'set_option'
   });
   UserUI.hook({ type: 'option', name: 'shading_type', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'wall_height_amp', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'show_textures', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'show_sprites', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'debug_rays', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'debug_sdf', object: Camera, getter: 'get_option', setter: 'set_option' });

   UserUI.hook({
      type: 'button',
      name: 'reset',
      handler: () => {
         Camera.setPos(Scene.get_center_vec());
      }
   });
}

function draw() {
   background(0);

   // Scene.render();
   Camera.march(Scene.get_objects());

   UserUI.update();

   if (keyIsPressed) {
      Camera.move();
   }

   if (UserUI.get('show_fps')) {
      fill(100, 255, 0);
      noStroke();
      textFont('Courier New', 16);
      textStyle(BOLD);
      text(`FPS: ${round(frameRate())}`, WIDTH - 100, 20);
   }
}

function keyPressed() {
   if (keyCode === 72) {
      UserUI.toggle();
   }
}

setup();
window.draw = draw;
window.keyPressed = keyPressed;
