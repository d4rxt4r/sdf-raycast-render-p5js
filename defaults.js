import { LEVEL_LIST } from 'levels';
import { deg_to_rad } from 'math_utils';

new p5();

const FRAME_RATE = 60;
const USE_WEBGL = true;

frameRate(FRAME_RATE);
colorMode(RGB, 255, 255, 255, 1);

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const PLAYER_SPEED = 5;
const ROTATE_SPEED = 0.04;

const TEX_WIDTH = 128;
const TEX_HEIGHT = 128;

const FOV = 90;
const FOG = 200;
const MAX_STEPS = 100;
const MAX_RAYS = 120;
const ROT_ANGLE = deg_to_rad(FOV) / (MAX_RAYS - 1);

const ACCURACY = 0.01;

const WALL_HEIGHT_AMP = 0.02;

const SHADING_TYPE = {
   NONE: 0,
   SIDE: 1,
   DISTANCE: 2
};

const BLACK = color(0);

const WIDGETS = [
   {
      name: 'level_select',
      prop: 'value',
      create(x, y, value = '0') {
         const el = createSelect();
         el.position(x, y);
         LEVEL_LIST.forEach((_, i) => el.option(`${i} level`, i));
         el.selected(value);

         return el;
      }
   },
   {
      name: 'fov',
      prop: 'value',
      create(x, y, value = FOV) {
         const el = createSlider(1, 360, value);
         el.size(150);
         el.position(x, y);

         const label = createSpan('FOV');
         label.position(x + 160, y);

         return el;
      }
   },
   {
      name: 'max_rays',
      prop: 'value',
      create(x, y, value = MAX_RAYS) {
         const el = createSlider(1, WIDTH, value);
         el.size(150);
         el.position(x, y);

         const label = createSpan('x-axis resolution');
         label.position(x + 160, y);

         return el;
      }
   },
   {
      name: 'wall_height',
      prop: 'value',
      create(x, y, value = WALL_HEIGHT_AMP) {
         const el = createSlider(0.01, 1, value, 0.01);
         el.size(150);
         el.position(x, y);

         const label = createSpan('wall height');
         label.position(x + 160, y);

         return el;
      }
   },
   {
      name: 'shading_type',
      prop: 'value',
      create(x, y, value = WALL_HEIGHT_AMP) {
         const el = createSelect();
         el.size(150);
         el.position(x, y);

         el.option('no shading', SHADING_TYPE.NONE);
         el.option('side shading', SHADING_TYPE.SIDE);
         el.option('distance-based shading', SHADING_TYPE.DISTANCE);

         el.selected(value);

         const label = createSpan('shading type');
         label.position(x + 160, y);

         return el;
      }
   },
   {
      name: 'fisheye_correction',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('fisheye correction', value);
         el.position(x, y);

         return el;
      }
   },
   {
      name: 'textures',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('show textures', value);
         el.position(x, y);

         return el;
      }
   },
   {
      name: 'sprites',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('show sprites', value);
         el.position(x, y);

         return el;
      }
   },
   {
      name: 'show_fps',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('show FPS', value);
         el.position(x, y);

         return el;
      }
   },
   {
      name: 'debug_rays',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('show rays', value);
         el.position(x, y);

         return el;
      }
   },
   {
      name: 'debug_sdf',
      prop: 'checked',
      create(x, y, value = false) {
         const el = createCheckbox('show SDF', value);
         el.position(x, y);

         return el;
      }
   }
];

export {
   FRAME_RATE,
   USE_WEBGL,
   WIDTH,
   HEIGHT,
   TEX_HEIGHT,
   TEX_WIDTH,
   FOG,
   FOV,
   MAX_RAYS,
   MAX_STEPS,
   ROT_ANGLE,
   ACCURACY,
   WALL_HEIGHT_AMP,
   SHADING_TYPE,
   BLACK,
   WIDGETS,
   PLAYER_SPEED,
   ROTATE_SPEED
};
