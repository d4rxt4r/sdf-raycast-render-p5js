#ifdef GL_ES
precision mediump float;
#endif

#define TILE_HEGHT 64.0
#define TEX_WIDTH 64.0 * 14.2
#define TEX_HEIGHT 64.0 * 14.2
#define OPACITY_AMP 0.6

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform vec2 u_dir_vec;
uniform vec2 u_plane_vec;

uniform vec4 u_sprite_info;
uniform sampler2D u_z_buffer_data;
uniform sampler2D u_textures_map;
uniform float u_textures_map_length;

vec4 get_pixel_color(int tex_id, vec2 tex_pos) {
   vec2 mapped_tex_pos = vec2(tex_pos.x, (tex_pos.y / u_textures_map_length) + float(tex_id) / u_textures_map_length);
   vec4 res_color = texture2D(u_textures_map, vec2(mapped_tex_pos.x, mapped_tex_pos.y));
   if(length(res_color.rgb) == 0.) {
      res_color.a = 0.;
   }
   if(u_sprite_info.w == 1.) {
      res_color.a *= OPACITY_AMP;
   }
   return res_color;
}

void main() {
   vec2 uv = vTexCoord;
   vec2 st = vec2(uv.x, uv.y);

   float inv_det = 1. / (u_plane_vec.x * u_dir_vec.y - u_dir_vec.x * u_plane_vec.y);
   vec2 transform = vec2(
      inv_det * (u_dir_vec.y * u_sprite_info.x - u_dir_vec.x * u_sprite_info.y),
      inv_det * (u_plane_vec.y * -1. * u_sprite_info.x + u_plane_vec.x * u_sprite_info.y)
   );

   vec3 sprite_pos = vec3(
      abs(u_resolution.y / transform.y) * TILE_HEGHT,
      abs(u_resolution.y / transform.y) * TILE_HEGHT,
      (u_resolution.x / 2.) * (1. - transform.x / transform.y)
   );

   vec2 draw_start = vec2(
      -sprite_pos.x / 2. + sprite_pos.z,
      -sprite_pos.y / 2. + u_resolution.y / 2.
      ).xy / u_resolution;
   vec2 draw_end = vec2(
      sprite_pos.x / 2. + sprite_pos.z,
      sprite_pos.y / 2. + u_resolution.y / 2.
      ).xy / u_resolution;

   if(st.x > draw_start.x && st.x < draw_end.x) {
      float stripe = st.x * u_resolution.x;
      float z_dist = texture2D(u_z_buffer_data, st).x;

      float tex_x = ((256. * (stripe - (-sprite_pos.x / 2. + sprite_pos.z)) * TEX_WIDTH) / sprite_pos.x) / 256.;

      // if (transform_y > 0 && transform_y < z_buffer[stripe]) {
      if(transform.y > 0.) {
         if(st.y > draw_start.y && st.y < draw_end.y) {
            float y = st.y * u_resolution.y;
            float d = y * 256. - u_resolution.y * 128. + sprite_pos.y * 128.;
            float tex_y = ((d * TEX_HEIGHT) / sprite_pos.y / 256.);

            gl_FragColor = get_pixel_color(int(u_sprite_info.z), vec2(float(tex_x) / u_resolution.y, tex_y / u_resolution.y));
         }
      }
   }
}