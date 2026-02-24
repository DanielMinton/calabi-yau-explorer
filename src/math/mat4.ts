/**
 * Calabi-Yau Explorer
 * Author: Daniel Minton
 */
/** Column-major 4×4 matrix stored as Float32Array(16). */
export type Mat4 = Float32Array;

export function create(): Mat4 {
  return new Float32Array(16);
}

/** Create a 4×4 identity matrix. */
export function identity(): Mat4 {
  const m = create();
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

/** Create a perspective projection matrix (column-major). */
export function perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number
): Mat4 {
  const m = create();
  const f = 1.0 / Math.tan(fovY / 2);
  const rangeInv = 1.0 / (near - far);

  m[0] = f / aspect;
  m[5] = f;
  m[10] = far * rangeInv;
  m[11] = -1;
  m[14] = near * far * rangeInv;
  return m;
}

/** Create a view matrix looking from `eye` toward `target`. */
export function lookAt(
  eye: [number, number, number],
  target: [number, number, number],
  up: [number, number, number]
): Mat4 {
  const zx = eye[0] - target[0];
  const zy = eye[1] - target[1];
  const zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz);
  const fz = [zx / len, zy / len, zz / len];

  // cross(up, fz)
  const xx = up[1] * fz[2] - up[2] * fz[1];
  const xy = up[2] * fz[0] - up[0] * fz[2];
  const xz = up[0] * fz[1] - up[1] * fz[0];
  len = Math.hypot(xx, xy, xz);
  const fx = [xx / len, xy / len, xz / len];

  // cross(fz, fx)
  const fy = [
    fz[1] * fx[2] - fz[2] * fx[1],
    fz[2] * fx[0] - fz[0] * fx[2],
    fz[0] * fx[1] - fz[1] * fx[0],
  ];

  const m = create();
  m[0] = fx[0]; m[1] = fy[0]; m[2] = fz[0]; m[3] = 0;
  m[4] = fx[1]; m[5] = fy[1]; m[6] = fz[1]; m[7] = 0;
  m[8] = fx[2]; m[9] = fy[2]; m[10] = fz[2]; m[11] = 0;
  m[12] = -(fx[0] * eye[0] + fx[1] * eye[1] + fx[2] * eye[2]);
  m[13] = -(fy[0] * eye[0] + fy[1] * eye[1] + fy[2] * eye[2]);
  m[14] = -(fz[0] * eye[0] + fz[1] * eye[1] + fz[2] * eye[2]);
  m[15] = 1;
  return m;
}

/** Create a rotation matrix around the Y axis. */
export function rotateY(angle: number): Mat4 {
  const m = identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}

/** Create a rotation matrix around the X axis. */
export function rotateX(angle: number): Mat4 {
  const m = identity();
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}

/** Multiply two 4×4 matrices (column-major): out = a × b. */
export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = create();
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}
