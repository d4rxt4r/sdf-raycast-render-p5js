import { FRAME_RATE, WIDTH, HEIGHT, MAX_STEPS, ACCURACY } from 'const';
import { preload_textures } from 'textures';
import { GUI, SDFScene, RayCamera } from 'classes';
import { LEVEL_LIST } from 'levels';
import { round } from 'math_utils';

const fonts = { inconsolata: loadFont('lib/Inconsolata.otf') };
const textures = await preload_textures();

const UserUI = new GUI();

const Scene = new SDFScene({
   id: UserUI.get('level_select'),
   width: WIDTH,
   height: HEIGHT,
   level_data: LEVEL_LIST[UserUI.get('level_select')],
   textures,
   fonts
});

const Camera = new RayCamera({
   scene: Scene,
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
});

function setup() {
   frameRate(FRAME_RATE);
   createCanvas(WIDTH, HEIGHT, WEBGL);

   UserUI.hook({
      type: 'custom',
      name: 'level_select',
      getter: () => Scene.id,
      setter: (value) => {
         Scene.change_level({
            width: WIDTH,
            height: HEIGHT,
            level_data: LEVEL_LIST[value],
            id: value
         });
         Camera.set_sprites(Scene.sprites);
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
   Camera.march(Scene.objects);
   UserUI.update();

   if (keyIsPressed) {
      Camera.move();
   }

   if (UserUI.get('show_fps')) {
      fill(100, 255, 0);
      noStroke();
      textFont(fonts.inconsolata, 16);
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
