/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
/** Full-screen quad vertex shader for starfield background. */
export const starfieldVertexCode = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) uv : vec2<f32>,
};

@vertex
fn main(@builtin(vertex_index) vi : u32) -> VertexOutput {
  // Full-screen triangle (3 verts cover the entire screen)
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0),
  );
  var output : VertexOutput;
  output.position = vec4<f32>(pos[vi], 0.0, 1.0);
  output.uv = pos[vi] * 0.5 + 0.5;
  return output;
}
`;

/** Procedural starfield fragment shader with parallax. */
export const starfieldFragmentCode = /* wgsl */ `
struct StarUniforms {
  yaw : f32,
  pitch : f32,
  time : f32,
  _pad : f32,
};

@group(0) @binding(0) var<uniform> su : StarUniforms;

// Hash function for pseudo-random star placement
fn hash(p : vec2<f32>) -> f32 {
  let h = dot(p, vec2<f32>(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

fn starLayer(uv : vec2<f32>, scale : f32, brightness : f32) -> f32 {
  let grid = floor(uv * scale);
  let f = fract(uv * scale);

  var stars = 0.0;
  // Check 3x3 neighborhood for smoother result
  for (var y = -1; y <= 1; y++) {
    for (var x = -1; x <= 1; x++) {
      let neighbor = vec2<f32>(f32(x), f32(y));
      let cell = grid + neighbor;
      let rand = hash(cell);
      let rand2 = hash(cell + vec2<f32>(37.0, 91.0));

      // Star position within cell
      let star_pos = neighbor + vec2<f32>(hash(cell + vec2<f32>(1.0, 0.0)), rand2) - f;
      let dist = length(star_pos);

      // Only show ~15% of cells as stars
      if (rand > 0.85) {
        let size = 0.02 + rand * 0.02;
        let twinkle = 0.7 + 0.3 * sin(su.time * (1.0 + rand * 3.0) + rand * 6.28);
        let star = smoothstep(size, 0.0, dist) * brightness * twinkle;
        stars += star;
      }
    }
  }
  return stars;
}

@fragment
fn main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
  // Apply subtle parallax based on camera yaw/pitch
  let parallax1 = vec2<f32>(su.yaw * 0.02, su.pitch * 0.02);
  let parallax2 = vec2<f32>(su.yaw * 0.04, su.pitch * 0.04);
  let parallax3 = vec2<f32>(su.yaw * 0.01, su.pitch * 0.01);

  // Three layers at different depths
  var stars = 0.0;
  stars += starLayer(uv + parallax1, 80.0, 0.4);
  stars += starLayer(uv + parallax2, 160.0, 0.2);
  stars += starLayer(uv + parallax3, 40.0, 0.6);

  // Very subtle blue-ish tint for background stars
  let color = vec3<f32>(0.7, 0.8, 1.0) * stars;

  // Dark background base
  let bg = vec3<f32>(0.039, 0.039, 0.059);
  return vec4<f32>(bg + color, 1.0);
}
`;
