#ifdef GL_ES
precision mediump float;
#endif

#define SCREEN_CENTER 1. / 2.
#define SIDE_SHADING_AMP 1.7;

varying vec2 vTexCoord;

uniform bool u_show_textures;
uniform float u_textures_map_length;
uniform int u_shading_type;
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
   vec4 tex_color;
   vec2 uv = vTexCoord;
   vec2 st = vec2(1. - uv.x, uv.y);

   tex_color = texture2D(u_color_data, st);

   vec4 z_data = texture2D(u_z_buffer_data, st);
   float z_dist = z_data.x - z_data.y - z_data.z;
   float line_height = 1. - z_dist;
   float draw_start = SCREEN_CENTER - line_height / 2.;
   float draw_end = draw_start + line_height;
   float step = 1. / line_height;

   if(u_show_textures) {
      float tex_x = texture2D(u_texture_info_data, st).x;
      float tex_y = -draw_start * step + (step * st.y);

      tex_color = get_pixel_color(st, vec2(tex_x, tex_y));
   }

   if(u_shading_type == 1) {
      if(texture2D(u_texture_info_data, st).z * 255. == 1.) {
         tex_color.rgb /= SIDE_SHADING_AMP;
      }
   }

   if(u_shading_type == 2) {
      tex_color.rgb *= (line_height / 1.);
   }

   if(uv.y >= draw_start && uv.y <= draw_end)
      gl_FragColor = tex_color;
}