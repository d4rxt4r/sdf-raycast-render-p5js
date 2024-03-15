import { FRAME_RATE, USE_WEBGL, WIDTH, HEIGHT, MAX_STEPS, ACCURACY } from 'defaults';
import { TEXTURES_LIST, preload_textures } from 'textures';
import { GUI, SDFScene, RayCamera } from 'classes';
import { LEVEL_LIST } from 'levels';
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
      resolution: UserUI.get('resolution'),
      fov: UserUI.get('fov'),
      fisheye_correction: UserUI.get('fisheye_correction'),
      debug_rays: UserUI.get('debug_rays'),
      debug_sdf: UserUI.get('debug_sdf'),
      shading_type: UserUI.get('shading_type'),
      show_textures: UserUI.get('show_textures'),
      show_sprites: UserUI.get('show_sprites')
   }
});

function setup() {
   frameRate(FRAME_RATE);
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
         Camera.set_sprites(Scene.get_sprites());
         Camera.set_pos(Scene.get_center_vec());
      }
   });
   UserUI.hook({
      type: 'custom',
      name: 'resolution',
      getter: () => Camera.get_option('resolution'),
      setter: (value) => {
         Camera.set_option('resolution', value);
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
   UserUI.hook({ type: 'option', name: 'show_textures', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'show_sprites', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'debug_rays', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'debug_sdf', object: Camera, getter: 'get_option', setter: 'set_option' });

   UserUI.hook({
      type: 'button',
      name: 'reset player position',
      handler: () => {
         Camera.set_pos(Scene.get_center_vec());
      }
   });
}

function draw() {
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
