#ifdef GL_ES
precision mediump float;
#endif

#define SCREEN_CENTER 1. / 2.

varying vec2 vTexCoord;

uniform bool u_show_textures;
uniform float u_textures_map_length;
uniform vec2 u_resolution;
uniform sampler2D u_color_data;
uniform sampler2D u_z_buffer_data;
uniform sampler2D u_texture_info_data;
uniform sampler2D u_textures_map;

vec4 get_pixel_color(vec2 _st, vec2 tex_pos) {
   int tex_id = int(texture2D(u_texture_info_data, _st).y * 255.);
   vec2 mapped_tex_pos = vec2(tex_pos.x, (tex_pos.y / u_textures_map_length) + float(tex_id) / u_textures_map_length);
   return texture2D(u_textures_map, vec2(mapped_tex_pos.x, mapped_tex_pos.y));
}

void main() {
   vec2 uv = vTexCoord;
   vec4 tex_color;

   float x = uv.x * u_resolution.x;
   float y = uv.y * u_resolution.y;

   vec2 st = vec2(1. - uv.x, uv.y);
   tex_color = texture2D(u_textures_map, vec2(st.x, st.y / 14. + 10. / 14.));
   float z_dist = texture2D(u_z_buffer_data, st).x;

   float line_height = 1. - z_dist;
   float draw_start = SCREEN_CENTER - line_height / 2.;
   float draw_end = draw_start + line_height;

   float step = 1. / line_height;

   if(u_show_textures) {
      float tex_x = texture2D(u_texture_info_data, st).x;
      float tex_y = -draw_start * step + (step * st.y);

      tex_color = get_pixel_color(st, vec2(tex_x, tex_y));
   }

   if(uv.y >= draw_start && uv.y <= draw_end)
      gl_FragColor = tex_color;
}