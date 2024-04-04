#ifdef GL_ES
precision mediump float;
#endif

#define TEX_WIDTH 64.0
#define TEX_HEIGHT 64.0
#define SHADE_AMP 0.6

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform vec3 u_floor_color;
uniform vec3 u_ceiling_color;
uniform vec2 u_pos_vec;
uniform vec2 u_dir_vec;
uniform vec2 u_plane_vec;

uniform bool u_show_textures;

uniform sampler2D u_ceiling_texture;
uniform sampler2D u_floor_texture;
uniform sampler2D u_floor_texture2;

void main() {
   vec2 uv = vTexCoord;

   bool isTopHalf = uv.y > 0.5;

   if(!u_show_textures) {
      gl_FragColor = vec4(isTopHalf ? u_ceiling_color : u_floor_color, 1.);
      return;
   }

   float x = uv.x * u_resolution.x;
   float y;
   y = isTopHalf ? uv.y * u_resolution.y : u_resolution.y - uv.y * u_resolution.y;

   float rayDirX1 = u_dir_vec.x - u_plane_vec.x;
   float rayDirY1 = u_dir_vec.y - u_plane_vec.y;
   float rayDirX0 = u_dir_vec.x + u_plane_vec.x;
   float rayDirY0 = u_dir_vec.y + u_plane_vec.y;

   float p = y - (u_resolution.y / 2.0);

   float posZ = 0.5 * float(u_resolution.y);

   float rowDistance = posZ / p;

   float floorStepX = rowDistance * (rayDirX1 - rayDirX0) / u_resolution.x;
   float floorStepY = rowDistance * (rayDirY1 - rayDirY0) / u_resolution.x;

   float floorX = (u_pos_vec.x / TEX_WIDTH) + (rowDistance) * rayDirX0 + (floorStepX * x);
   float floorY = (u_pos_vec.y / TEX_HEIGHT) + (rowDistance) * rayDirY0 + (floorStepY * x);

   int cellX = int(floorX);
   int cellY = int(floorY);

   float tx = abs(floorX - float(cellX));
   float ty = abs(floorY - float(cellY));

   bool isSecondTile = mod(float(cellX + cellY), 2.) == 0.;

   vec4 floorColor;
   vec4 ceilingColor;

   if(uv.y > 0.5) {
      if(isSecondTile) {
         floorColor = texture2D(u_floor_texture2, vec2(tx, ty));
      } else {
         floorColor = texture2D(u_floor_texture, vec2(tx, ty));
      }

      gl_FragColor = vec4(floorColor.rgb *= SHADE_AMP, 1.);
   } else {
      ceilingColor = texture2D(u_ceiling_texture, vec2(tx, ty));
      gl_FragColor = vec4(ceilingColor.rgb *= SHADE_AMP, 1.);
   }
}
