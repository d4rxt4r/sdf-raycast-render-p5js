import { TARGET_FPS, WIDTH, HEIGHT, MAX_STEPS, ACCURACY } from 'const';
import { BLACK, GREEN, preload_textures } from 'textures';
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
   mm_size: UserUI.get('mm_size'),
   mm_scale: UserUI.get('mm_scale'),
   fisheye_correction: UserUI.get('fisheye_correction'),
   debug_rays: UserUI.get('debug_rays'),
   debug_sdf: UserUI.get('debug_sdf'),
   shading_type: UserUI.get('shading_type'),
   show_textures: UserUI.get('show_textures'),
   show_sprites: UserUI.get('show_sprites')
});

function setup() {
   frameRate(UserUI.get('target_fps') || TARGET_FPS);
   createCanvas(WIDTH, HEIGHT, WEBGL);

   UserUI.hook({
      type: 'custom',
      name: 'level_select',
      getter: () => Scene.id,
      setter: (value) => {
         Scene.change_level({
            width: windowWidth,
            height: windowHeight,
            level_data: LEVEL_LIST[value],
            id: value
         });
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
   UserUI.hook({ type: 'option', name: 'mm_size', object: Camera, getter: 'get_option', setter: 'set_option' });
   UserUI.hook({ type: 'option', name: 'mm_scale', object: Camera, getter: 'get_option', setter: 'set_option' });

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
      fill(BLACK);
      noStroke();
      rect(windowWidth - 110, 5, 80, 20);
      fill(GREEN);
      textFont(fonts.inconsolata, 16);
      textStyle(BOLD);
      text(`FPS: ${round(frameRate())}`, windowWidth - 100, 20);
   }
}

function keyPressed() {
   if (keyCode === 72) {
      UserUI.toggle();
   }
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
   Scene.width = windowWidth;
   Scene.height = windowHeight;
   Camera.calc_viewport();
}

setup();
window.draw = draw;
window.keyPressed = keyPressed;
window.windowResized = windowResized;
