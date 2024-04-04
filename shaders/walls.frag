#ifdef GL_ES
precision mediump float;
#endif

#define TEX_HEIGHT 64.
#define SCREEN_CENTER 1. / 2.

varying vec2 vTexCoord;

uniform bool u_show_textures;
uniform sampler2D u_color_data;
uniform sampler2D u_z_buffer_data;
uniform sampler2D u_texture_data;
uniform sampler2D u_void_texture;

void main() {
   vec2 uv = vTexCoord;
   vec4 tex_color;

   vec2 st = vec2(1. - uv.x, uv.y);
   tex_color = texture2D(u_color_data, st);
   float z_dist = texture2D(u_z_buffer_data, st).x;

   float line_height = 1. - z_dist;
   float draw_start = SCREEN_CENTER - line_height / 2.;
   float draw_end = draw_start + line_height;

   float step = 1. / line_height;

   if(u_show_textures) {
      float tex_x = texture2D(u_texture_data, st).x;
      float tex_y = -draw_start * step + step * st.y;

      tex_color = texture2D(u_void_texture, vec2(tex_x, tex_y));
   }

   if(uv.y >= draw_start && uv.y <= draw_end)
      gl_FragColor = tex_color;
}