const TEST_LEVEL_0 = {
   data: [
      [0, 0, 110, 111, 19, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 11, 0, 0, 0, 11, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
   ],
   entities: [
      {
         x: 4,
         y: 2,
         texture_id: 8,
         name: 'light',
         translucent: true
      },
      {
         x: 3,
         y: 2,
         texture_id: 9,
         name: 'light',
         translucent: true
      },
      {
         x: 5,
         y: 2,
         texture_id: 9,
         name: 'light',
         translucent: true
      }
   ]
};

const TEST_LEVEL_02 = {
   data: [
      [1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
   ]
};

const TEST_LEVEL_11 = {
   data: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 33, 0, 32, 0],
      [0, 0, 0, 11, 0, 11, 0],
      [0, 0, 0, 31, 0, 30, 0],
      [0, 0, 0, 0, 0, 0, 0]
   ]
};

const TEST_LEVEL_01 = {
   data: [
      [11, 11, 11, 111, 11, 11, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 11, 11, 11, 11, 11, 11]
   ],
   entities: [
      {
         x: 3,
         y: 2,
         texture_id: 6,
         name: 'column'
      },
      {
         x: 4,
         y: 2,
         texture_id: 6,
         name: 'column'
      },
      {
         x: 5,
         y: 2,
         texture_id: 6,
         name: 'column'
      },

      {
         x: 3,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },
      {
         x: 4,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },
      {
         x: 5,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },

      {
         x: 3,
         y: 3,
         texture_id: 8,
         name: 'light',
         translucent: true
      },
      {
         x: 5,
         y: 3,
         texture_id: 8,
         name: 'light',
         translucent: true
      },
      {
         x: 3,
         y: 5,
         texture_id: 8,
         name: 'light',
         translucent: true
      },
      {
         x: 5,
         y: 5,
         texture_id: 8,
         name: 'light',
         translucent: true
      }
   ]
};

const TEST_LEVEL_2 = {
   data: [
      [11, 11, 11, 12, 11, 11, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 0, 11, 0, 11, 0, 11],
      [12, 0, 11, 0, 11, 0, 12],
      [11, 0, 11, 0, 11, 0, 11],
      [11, 0, 0, 0, 0, 0, 11],
      [11, 11, 11, 12, 11, 11, 11]
   ],
   entities: [
      {
         x: 3,
         y: 2,
         texture_id: 6,
         name: 'column'
      },
      {
         x: 4,
         y: 2,
         texture_id: 6,
         name: 'column'
      },
      {
         x: 5,
         y: 2,
         texture_id: 6,
         name: 'column'
      },

      {
         x: 3,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },
      {
         x: 4,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },
      {
         x: 5,
         y: 6,
         texture_id: 7,
         name: 'barrel'
      },

      {
         x: 2,
         y: 2,
         texture_id: 8,
         name: 'light'
      },
      {
         x: 5,
         y: 6,
         texture_id: 8,
         name: 'light'
      },
      {
         x: 2,
         y: 6,
         texture_id: 8,
         name: 'light'
      },
      {
         x: 6,
         y: 6,
         texture_id: 8,
         name: 'light'
      }
   ]
};

const TEST_LEVEL_10 = {
   data: [
      [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11],
      [11, 30, 0, 0, 31, 11, 30, 0, 0, 2, 31, 11],
      [11, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 11],
      [11, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 11],
      [11, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 11],
      [11, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 11],
      [11, 32, 0, 0, 0, 0, 0, 0, 0, 2, 33, 11],
      [11, 11, 11, 11, 32, 0, 33, 11, 11, 11, 11, 11]
   ]
};

const TEST_LEVEL_19 = {
   data: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2],
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1]
   ]
};

const LEVELS = [TEST_LEVEL_02, TEST_LEVEL_0, TEST_LEVEL_11, TEST_LEVEL_01, TEST_LEVEL_2, TEST_LEVEL_10];

function createLevelSelect(x, y) {
   const levelSelect = createSelect();
   levelSelect.position(x, y);
   LEVELS.forEach((_, i) => levelSelect.option(`${i} level`, i));
   levelSelect.selected('0 level');

   return levelSelect;
}

export { LEVELS as LEVEL_LIST, createLevelSelect };
