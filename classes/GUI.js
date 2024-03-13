import { WIDTH, SHADING_TYPE, FOV, TARGET_FPS, MAX_RAYS, WALL_HEIGHT_AMP } from 'defaults';
import { LEVEL_LIST } from 'levels';

/**
 * Adds a label to an element.
 * @param {p5.Element} element - The element to which the label should be added.
 * @param {string} label - The text to display as the label.
 * @returns {p5.Element} The wrapping element that contains the label and the original element.
 */
function addLabel(element, label) {
   const wrap = createDiv().style('display', 'flex').style('align-items', 'center').style('gap', '8px');
   element.parent(wrap);
   createSpan(label).parent(wrap);

   return wrap;
}

/**
 * Creates a slider with a label.
 * @param {number} start - The starting value of the slider.
 * @param {number} end - The ending value of the slider.
 * @param {number} current - The current value of the slider.
 * @param {string} label - The text label to display next to the slider.
 * @param {number} [step=1] - The step size of the slider.
 * @returns {object} - An object containing the slider and the wrapper element.
 */
function createSliderWithLabel(start, end, current, label, step = 1) {
   const slider = createSlider(start, end, current, step);
   const wrap = addLabel(slider, label);
   slider.size(150);

   return { wrap, slider };
}

const WIDGETS = [
   {
      name: 'level_select',
      prop: 'value',
      create(root, value = '0') {
         const el = createSelect();
         LEVEL_LIST.forEach((_, i) => el.option(`${i} level`, i));

         el.selected(value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'target_fps',
      prop: 'value',
      create(root, value = TARGET_FPS) {
         const { wrap, slider } = createSliderWithLabel(1, 140, value, 'max FPS');
         wrap.parent(root);

         return slider;
      }
   },
   {
      name: 'fov',
      prop: 'value',
      create(root, value = FOV) {
         const { wrap, slider } = createSliderWithLabel(1, 180, value, 'FOV');
         wrap.parent(root);

         return slider;
      }
   },
   {
      name: 'rays',
      prop: 'value',
      create(root, value = MAX_RAYS) {
         const { wrap, slider } = createSliderWithLabel(1, WIDTH, value, 'x-axis resolution');
         wrap.parent(root);

         return slider;
      }
   },
   {
      name: 'wall_height_amp',
      prop: 'value',
      create(root, value = WALL_HEIGHT_AMP) {
         const { wrap, slider } = createSliderWithLabel(0.01, 1, value, 'wall height', 0.01);
         wrap.parent(root);

         return slider;
      }
   },
   {
      name: 'shading_type',
      prop: 'value',
      create(root, value = WALL_HEIGHT_AMP) {
         const select = createSelect();
         select.size(150);

         select.option('no shading', SHADING_TYPE.NONE);
         select.option('side shading', SHADING_TYPE.SIDE);
         select.option('distance-based shading', SHADING_TYPE.DISTANCE);

         select.selected(value);

         const wrap = addLabel(select, 'shading type');
         wrap.parent(root);

         return select;
      }
   },
   {
      name: 'fisheye_correction',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('fisheye correction', value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'show_textures',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('show textures', value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'show_sprites',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('show sprites', value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'show_fps',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('show FPS', value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'debug_rays',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('show rays', value);
         el.parent(root);

         return el;
      }
   },
   {
      name: 'debug_sdf',
      prop: 'checked',
      create(root, value = false) {
         const el = createCheckbox('show SDF', value);
         el.parent(root);

         return el;
      }
   }
];

class GUI {
   constructor() {
      this._root = null;
      this._widgets = [];
      this._widget_gap = 12;

      this._hooks = [];

      try {
         this._user_data = JSON.parse(localStorage.getItem('UserUIData'));
      } catch {
         this._user_data = [];
      }

      this._position = this._user_data.position ?? { x: 10, y: 10 };

      this.create(WIDGETS);
   }

   /**
    * Creates the root of the Debug Menu and adds it to the P5.js canvas.
    * @private
    * @return {void}
    */
   _create_root() {
      this._root = createDiv()
         .position(this._position.x, this._position.y)
         .style('background', 'white')
         .style('padding', this._widget_gap + 'px')
         .style('display', 'flex')
         .style('flex-direction', 'column')
         .style('gap', this._widget_gap + 'px')
         .style('border-radius', '8px')
         .style('border', '1px solid black');

      createDiv('Debug Menu').parent(this._root).draggable(this._root);
   }

   /**
    * Creates the widgets and adds them to the GUI.
    * @param {Array} widgets - An array of widget objects.
    * @returns {void}
    */
   create(widgets) {
      cursor();
      this._create_root();

      this._widgets = [];

      for (let i = 0; i < widgets.length; i++) {
         const widget = widgets[i];
         const widget_name = widget.name;
         const widget_value = this._user_data[widget_name];

         const _inst = widgets[i].create(this._root, widget_value);

         this._widgets.push({
            name: widget_name,
            value: _inst[widget.prop](),
            valueProp: widgets[i].prop,
            _inst
         });
      }
   }

   /**
    * Toggles the display of the GUI.
    *
    * If the GUI is currently visible, it will be removed from the page.
    * If it is not visible, it will be created and added to the page.
    *
    * @returns {void}
    */
   toggle() {
      if (this._root) {
         noCursor();
         this._root.remove();
         this._root = null;
      } else {
         this.create(WIDGETS);
      }
   }

   /**
    * Retrieves the value of the widget with the specified name.
    * @param {string} name - The name of the widget whose value to retrieve.
    * @returns {boolean|number} The value of the widget.
    */
   get(name) {
      const value = this._widgets.find((w) => w.name === name)?.value;

      if (typeof value === 'boolean') {
         return value;
      }
      return typeof value === 'boolean' ? value : Number(value);
   }

   /**
    * Hooks an option or a custom function to be able to get and set its value.
    * @param {Object} options - The options object.
    * @param {string} options.type - The type of the hook: 'option' or 'custom'.
    * @param {string} options.name - The name of the option or custom hook.
    * @param {Object} [options.object] - The object to get and set the option from. Required if type is 'option'.
    * @param {string | Function} [options.getter] - The getter function name to get the option value or the custom getter function.
    * @param {string | Function} [options.setter] - The setter function name to set the option value or the custom setter function.
    */
   hook({ type = 'option', name, object, getter = 'get', setter = 'set' }) {
      if (type === 'option') {
         if (!object) {
            throw new Error('Object not provided');
         }

         this._hooks.push({
            name,
            getter: () => {
               return object[getter](name);
            },
            setter: (value) => {
               object[setter](name, value);
            }
         });
      }

      if (type === 'custom') {
         if (!getter || !setter) {
            throw new Error('Getter or setter not provided');
         }

         this._hooks.push({
            name,
            getter,
            setter
         });
      }
   }

   /**
    * Updates the GUI.
    *
    * If the root widget is available, this function checks if any widget value has changed.
    * If a widget value changes, it updates the widget value and calls the setter function for the corresponding hook.
    * If any widget value changes, it serializes the GUI.
    *
    * @returns {void}
    */
   update() {
      if (this._root) {
         let isChanged = false;

         for (const widget of this._widgets) {
            if (widget.value !== widget._inst[widget.valueProp]()) {
               widget.value = widget._inst[widget.valueProp]();

               const hook = this._hooks.find((hook) => hook.name === widget.name);
               if (hook && hook.getter !== widget.value) {
                  hook.setter(this.get(widget.name));
               }

               isChanged = true;
            }
         }

         if (this._position.x !== this._root.position().x || this._position.y !== this._root.position().y) {
            this._position = this._root.position();
            isChanged = true;
         }

         if (isChanged) {
            this._serialize();
         }
      }
   }

   /**
    * Serializes the widget data and stores it in the local storage.
    * @private
    * @returns {void}
    */
   _serialize() {
      const ui_data = {};
      this._widgets.forEach((widget) => {
         const { name, value, ...props } = widget;
         ui_data[name] = value;
      });

      ui_data['position'] = {
         x: this._position.x,
         y: this._position.y
      };

      this._user_data = ui_data;

      localStorage.setItem('UserUIData', JSON.stringify(ui_data));
   }
}

export { GUI };
