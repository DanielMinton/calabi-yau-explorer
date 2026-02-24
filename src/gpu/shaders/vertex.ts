/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
export const vertexShaderCode = /* wgsl */ `
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

struct VertexInput {
  @location(0) position : vec3<f32>,
  @location(1) normal : vec3<f32>,
};

struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) world_normal : vec3<f32>,
  @location(1) world_position : vec3<f32>,
};

@vertex
fn main(input : VertexInput) -> VertexOutput {
  var output : VertexOutput;

  let world_pos = u.model * vec4<f32>(input.position, 1.0);
  let normal_mat = mat3x3<f32>(
    u.model[0].xyz,
    u.model[1].xyz,
    u.model[2].xyz,
  );

  // Cursor gravitational pull — displace vertices toward cursor in world space
  var displaced = world_pos.xyz;
  let cursor_strength = u.cursor.w;
  if (cursor_strength > 0.001) {
    let cursor_world = u.cursor.xyz;
    let to_cursor = cursor_world - world_pos.xyz;
    let dist = length(to_cursor);
    // Inverse-square falloff with a soft radius
    let influence = cursor_strength * 0.15 / (dist * dist + 0.3);
    displaced = displaced + normalize(to_cursor) * influence;
  }

  output.world_position = displaced;
  output.world_normal = normalize(normal_mat * input.normal);
  output.clip_position = u.projection * u.view * vec4<f32>(displaced, 1.0);

  return output;
}
`;
