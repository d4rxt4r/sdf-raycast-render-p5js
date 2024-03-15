import { FOV, TARGET_FPS, RESOLUTION } from 'const';
import { LEVEL_LIST } from 'levels';
import { SHADING_TYPE } from 'textures';

/**
 * @typedef ElementWithLabel
 *
 * @property {p5.Element} wrap - The wrapping element that contains the label and the original element.
 * @property {p5.Element} value_label - The label element.
 */

/**
 * Adds a label to an element.
 *
 * @param {p5.Element} element - The element to which the label should be added.
 * @param {string} label - The text to display as the label.
 * @param {number} current_value - The current value of the slider.
 * @returns {ElementWithLabel} The wrapping element that contains the label and the original element.
 */
function addLabel(element, label, current_value) {
   const wrap = createDiv().style('display', 'flex').style('align-items', 'center').style('gap', '8px');

   let value_label;
   if (current_value) {
      value_label = createSpan(current_value).size(30).parent(wrap);
   }
   element.parent(wrap);
   createSpan(label).parent(wrap);

   return { wrap, value_label };
}

/**
 * @typedef SliderWithLabel
 *
 * @property {p5.Element} wrap
 * @property {p5.Element} slider
 * @property {p5.Element} value_label
 */

/**
 * Creates a slider with a label.
 *
 * @param {number} start - The starting value of the slider.
 * @param {number} end - The ending value of the slider.
 * @param {number} current - The current value of the slider.
 * @param {string} label - The text label to display next to the slider.
 * @param {number} [step=1] - The step size of the slider.
 * @returns {SliderWithLabel}
 */
function createSliderWithLabel(start, end, current, label, step = 1) {
   const slider = createSlider(start, end, current, step);
   const { wrap, value_label } = addLabel(slider, label, current);

   slider.size(150);

   return { wrap, slider, value_label };
}

/**
 * Creates a user button with the given name and event handler.
 *
 * @param {string} name - The name of the button
 * @param {function} handler - The event handler for the button
 * @return {p5.Element} The created button
 */
function createUserButton(name, handler) {
   const button = createButton(name);
   button.mousePressed(handler);

   return button;
}

/**
 * @typedef Widget
 *
 * @property {string} name - The name of the widget
 * @property {string} prop - The getter property of the widget
 * @property {function} create - The function to create the widget
 * @param {p5.Element} root - The root element of the widget
 * @param {any} [value] - The initial value of the widget
 */

/** @type {Widget[]} */
const WIDGETS = [
   {
      name: 'level_select',
      prop: 'value',
      create(root, value = '0') {
         const widget = createSelect();
         LEVEL_LIST.forEach((_, i) => widget.option(`${i} level`, i));

         widget.selected(value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'target_fps',
      prop: 'value',
      create(root, value = TARGET_FPS) {
         const { wrap, slider: widget, value_label } = createSliderWithLabel(1, 140, value, 'max FPS');
         wrap.parent(root);

         return { widget, value_label };
      }
   },
   {
      name: 'resolution',
      prop: 'value',
      create(root, value = RESOLUTION) {
         const { wrap, slider: widget, value_label } = createSliderWithLabel(1, 100, value, 'render resolution');
         wrap.parent(root);

         return { widget, value_label };
      }
   },
   {
      name: 'fov',
      prop: 'value',
      create(root, value = FOV) {
         const { wrap, slider: widget, value_label } = createSliderWithLabel(1, 180, value, 'FOV');
         wrap.parent(root);

         return { widget, value_label };
      }
   },
   {
      name: 'shading_type',
      prop: 'value',
      create(root, value = SHADING_TYPE.NONE) {
         const widget = createSelect();
         widget.size(150);

         widget.option('no shading', SHADING_TYPE.NONE);
         widget.option('side shading', SHADING_TYPE.SIDE);
         widget.option('distance-based shading', SHADING_TYPE.DISTANCE);

         widget.selected(value);

         const { wrap } = addLabel(widget, 'shading type');
         wrap.parent(root);

         return { widget };
      }
   },
   {
      name: 'fisheye_correction',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('fisheye correction', value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'show_textures',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('show textures', value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'show_sprites',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('show sprites', value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'show_fps',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('show FPS', value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'debug_rays',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('show rays', value);
         widget.parent(root);

         return { widget };
      }
   },
   {
      name: 'debug_sdf',
      prop: 'checked',
      create(root, value = false) {
         const widget = createCheckbox('show SDF', value);
         widget.parent(root);

         return { widget };
      }
   }
];

/**
 * @typedef Hook
 *
 * @property {string} name - The name of the hook
 * @property {string} type - The type of the hook
 * @property {function} getter - The getter function of the hook
 * @property {function} setter - The setter function of the hook
 */

/**
 * @typedef Position
 *
 * @property {number} x - The x position
 * @property {number} y - The y position
 */

/* The GUI class represents a user interface for controlling various options and settings. */
export class GUI {
   /**
    * Creates a new instance of the GUI class.
    */
   constructor() {
      /**
       * @type {p5.Element} The root element of the GUI.
       * @private
       */
      this._root = null;
      /**
       * @type {Widget[]} The array of widgets in the GUI.
       * @private
       */
      this._widgets = [];
      /**
       * @type {number} The gap between widgets in the GUI.
       * @private
       */
      this._widget_gap = 12;

      /**
       * @type {Hook[]} The array of hooks in the GUI.
       * @private
       */
      this._hooks = [];

      try {
         /**
          * @type {Object} The user data stored in the local storage.
          * @private
          */
         this._user_data = JSON.parse(localStorage.getItem('UserUIData'));
      } catch {
         this._user_data = {
            position: { x: 10, y: 10 }
         };
      }

      /**
       * @type {Position} The position of the GUI.
       * @private
       */
      this._position = this._user_data?.position || { x: 10, y: 10 };

      this.create(WIDGETS);
   }

   /**
    * Creates the root of the Debug Menu and adds it to the P5.js canvas.
    *
    * @private
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
    * Serializes the widget data and stores it in the local storage.
    *
    * @private
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

   /**
    * Creates the widgets and adds them to the GUI.
    *
    * @param {Widget[]} widgets - An array of Widget.
    */
   create(widgets) {
      cursor();
      this._create_root();

      this._widgets = [];

      for (let i = 0; i < widgets.length; i++) {
         const widget = widgets[i];
         const widget_name = widget.name;
         const widget_value = this._user_data[widget_name];

         const { widget: _inst, value_label } = widgets[i].create(this._root, widget_value);

         this._widgets.push({
            name: widget_name,
            value: _inst[widget.prop](),
            value_prop: widgets[i].prop,
            value_label,
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
    *
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
    *
    * @param {Object} options - The options object.
    * @param {string} options.type - The type of the hook: 'option' or 'custom'.
    * @param {string} options.name - The name of the option or custom hook.
    * @param {Object} [options.object] - The object to get and set the option from. Required if type is 'option'.
    * @param {string | Function} [options.getter] - The getter function name to get the option value or the custom getter function.
    * @param {string | Function} [options.setter] - The setter function name to set the option value or the custom setter function.
    * @param {function} [options.handler] - The handler function to be called. Required if type is 'button'.
    */
   hook({ type = 'option', name, object, getter = 'get', setter = 'set', handler = null }) {
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

      if (type === 'button') {
         if (!handler) {
            throw new Error('Handler not provided');
         }

         createUserButton(name, handler).parent(this._root);
      }
   }

   /**
    * Updates the GUI.
    *
    * If the root widget is available, this function checks if any widget value has changed.
    * If a widget value changes, it updates the widget value and calls the setter function for the corresponding hook.
    * If any widget value changes, it serializes the GUI.
    *
    */
   update() {
      if (this._root) {
         let isChanged = false;

         for (const widget of this._widgets) {
            if (widget.value !== widget._inst[widget.value_prop]()) {
               widget.value = widget._inst[widget.value_prop]();

               const hook = this._hooks.find((hook) => hook.name === widget.name);
               if (hook && hook.getter !== widget.value) {
                  const new_value = this.get(widget.name);
                  hook.setter(new_value);
                  widget?.value_label?.html(new_value);
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
}
