class GUI {
   constructor(x, y, widgets) {
      this._x = x;
      this._y = y;

      this._widgets = [];
      this._widget_gap = 40;

      this._pad = 20;

      this._hooks = [];

      this.create(widgets);
   }

   create(widgets) {
      this._widgets = [];

      let user_data;
      try {
         user_data = JSON.parse(localStorage.getItem('UserUIData'));
      } catch {
         user_data = null;
      }

      for (let i = 0; i < widgets.length; i++) {
         const widget = widgets[i];
         const widget_name = widget.name;
         const widget_value = user_data ? user_data.find((w) => w.name === widget_name)?.value : null;

         this._widgets.push({
            name: widget_name,
            value: widget_value,
            valueProp: widgets[i].prop,
            _inst: widgets[i].create(this._x + this._pad, this._y + this._widget_gap * i, widget_value)
         });
      }
   }

   get(name) {
      const value = this._widgets.find((w) => w.name === name)?.value;

      if (typeof value === 'boolean') {
         return value;
      }
      return typeof value === 'boolean' ? value : Number(value);
   }

   hook(name, getter, setter) {
      this._hooks.push({
         name,
         getter,
         setter
      });
   }

   update() {
      let isChanged = false;

      for (const widget of this._widgets) {
         if (widget.value !== widget._inst[widget.valueProp]()) {
            widget.value = widget._inst[widget.valueProp]();

            const hook = this._hooks.find((hook) => hook.name === widget.name);
            if (hook && hook.getter !== widget.value) {
               hook.setter(widget.value);
            }

            isChanged = true;
         }
      }
      if (isChanged) {
         this.serialize();
      }

      rect(this._x, this._y - this._pad, this._x + 300, this._y + this._widget_gap * this._widgets.length);
   }

   serialize() {
      const ui_data = this._widgets.map((widget) => {
         const { name, value, ...props } = widget;

         return {
            name,
            value
         };
      });

      localStorage.setItem('UserUIData', JSON.stringify(ui_data));
   }
}

export { GUI };
