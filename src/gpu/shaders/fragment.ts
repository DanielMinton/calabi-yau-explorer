/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
export const fragmentShaderCode = /* wgsl */ `
struct Uniforms {
  model : mat4x4<f32>,
  view : mat4x4<f32>,
  projection : mat4x4<f32>,
  color : vec4<f32>,
  lightDir : vec4<f32>,
  cursor : vec4<f32>,
  opacity : vec4<f32>,
};

@group(0) @binding(0) var<uniform> u : Uniforms;

struct FragmentInput {
  @location(0) world_normal : vec3<f32>,
  @location(1) world_position : vec3<f32>,
};

@fragment
fn main(input : FragmentInput) -> @location(0) vec4<f32> {
  let normal = normalize(input.world_normal);
  let light_dir = normalize(u.lightDir.xyz);

  // Ambient
  let ambient = 0.15;

  // Diffuse (two-sided lighting)
  let ndotl = dot(normal, light_dir);
  let diffuse = max(abs(ndotl), 0.0) * 0.7;

  // Specular (Blinn-Phong)
  let view_dir = normalize(-input.world_position);
  let half_dir = normalize(light_dir + view_dir);
  let spec_angle = max(abs(dot(normal, half_dir)), 0.0);
  let specular = pow(spec_angle, 32.0) * 0.3;

  let base_color = u.color.xyz;
  let final_color = base_color * (ambient + diffuse) + vec3<f32>(specular);

  // Cursor proximity glow
  let cursor_strength = u.cursor.w;
  var glow = 0.0;
  if (cursor_strength > 0.001) {
    let to_cursor = u.cursor.xyz - input.world_position;
    let dist = length(to_cursor);
    glow = cursor_strength * 0.4 / (dist * dist + 0.5);
  }

  let lit = final_color + vec3<f32>(glow * 0.3, glow * 0.5, glow * 0.8);
  return vec4<f32>(lit, u.opacity.x);
}
`;
