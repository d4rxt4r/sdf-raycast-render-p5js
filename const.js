new p5();

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const PLAYER_SPEED = 3;
const ROTATE_SPEED = 0.05;

const TARGET_FPS = 60;
const RESOLUTION = 100;
const FOV = 90;
const MAX_STEPS = 100;
const ACCURACY = 0.01;

const MINIMAP_SIZE = 300;
const MINIMAP_SCALE = 0.3;

export {
   WIDTH,
   HEIGHT,
   FOV,
   TARGET_FPS,
   MAX_STEPS,
   ACCURACY,
   PLAYER_SPEED,
   ROTATE_SPEED,
   RESOLUTION,
   MINIMAP_SIZE,
   MINIMAP_SCALE
};
