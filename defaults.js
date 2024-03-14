new p5();

const FRAME_RATE = 60;
const USE_WEBGL = true;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const PLAYER_SPEED = 5;
const ROTATE_SPEED = 0.04;

const TEX_WIDTH = 128;
const TEX_HEIGHT = 128;

const FOV = 90;
const TARGET_FPS = 60;
const FOG = 200;
const MAX_STEPS = 100;
const RESOLUTION = 100;

const ACCURACY = 0.01;

const WALL_HEIGHT_AMP = 0.02;

const SHADING_TYPE = {
   NONE: 0,
   SIDE: 1,
   DISTANCE: 2
};

const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const FLOOR_COLOR = [200, 200, 200];
const CEILING_COLOR = [100, 100, 100];

export {
   FRAME_RATE,
   USE_WEBGL,
   WIDTH,
   HEIGHT,
   TEX_HEIGHT,
   TEX_WIDTH,
   FOG,
   FOV,
   TARGET_FPS,
   MAX_STEPS,
   ACCURACY,
   WALL_HEIGHT_AMP,
   SHADING_TYPE,
   BLACK,
   WHITE,
   FLOOR_COLOR,
   CEILING_COLOR,
   PLAYER_SPEED,
   ROTATE_SPEED,
   RESOLUTION
};
