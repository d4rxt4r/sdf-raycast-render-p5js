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
      Camera.move();
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
