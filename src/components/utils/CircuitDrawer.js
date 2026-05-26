// CircuitDrawer.js - SVG Circuit drawing helpers

/**
 * Returns the SVG path for a resistor symbol centered at (0,0) and oriented vertically.
 * Length is 40px.
 */
export function getResistorPath(length = 40) {
  const half = length / 2;
  const step = length / 6;
  return `M 0 -${half} L 0 -${step * 2} L -5 -${step * 1.5} L 5 -${step * 0.5} L -5 ${step * 0.5} L 5 ${step * 1.5} L 0 ${step * 2} L 0 ${half}`;
}

/**
 * Returns the SVG path for a capacitor symbol centered at (0,0) and oriented vertically.
 */
export function getCapacitorPaths() {
  return {
    line1: 'M 0 -20 L 0 -4',
    plate1: 'M -10 -4 L 10 -4',
    plate2: 'M -10 4 L 10 4',
    line2: 'M 0 4 L 0 20',
  };
}

/**
 * Returns the SVG path for a Zener Diode symbol centered at (0,0) and oriented vertically (pointing down/anode at bottom).
 */
export function getZenerPaths() {
  return {
    triangle: 'M -8 -6 L 8 -6 L 0 6 Z',
    cathode: 'M -8 6 L 0 6 L 0 8 M 0 6 L 8 6 L 8 4', // Zener bent line
    leads: 'M 0 -15 L 0 -6 M 0 6 L 0 15',
  };
}

/**
 * Returns paths for an Op-Amp (Error Amplifier) centered at (0,0).
 */
export function getOpAmpPaths() {
  return {
    body: 'M -25 -25 L 25 0 L -25 25 Z',
    inMinus: 'M -35 -12 L -25 -12',
    inPlus: 'M -35 12 L -25 12',
    out: 'M 25 0 L 35 0',
  };
}

/**
 * Returns paths for an NPN BJT Transistor centered at (0,0).
 */
export function getNpnPaths() {
  return {
    circle: 'M 0 0 m -20, 0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0',
    base: 'M -10 -10 L -10 10',
    leadB: 'M -20 0 L -10 0',
    collector: 'M -10 -5 L 10 -15 L 10 -25',
    emitter: 'M -10 5 L 10 15 L 10 25',
    arrow: 'M 5 10 L 10 15 L 4 16 Z', // Arrow on emitter
  };
}

/**
 * Helper to calculate particle positions along a multi-segment wire path.
 * @param {Array<[number, number]>} points - Array of [x, y] coordinates defining the wire path.
 * @param {number} time - Clock time.
 * @param {number} speed - Moving speed in pixels per second.
 * @param {number} spacing - Spacing between particles in pixels.
 * @returns {Array<[number, number]>} - Array of current [x, y] coordinates of the particles.
 */
export function getParticlesOnPath(points, time, speed, spacing = 30) {
  if (points.length < 2 || speed === 0) return [];

  // Calculate segment lengths and total length
  const segments = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ p1, p2, dx, dy, startLen: totalLength, len });
    totalLength += len;
  }

  // Animate offset
  // If speed is negative, particles flow backwards
  const offset = (time * speed) % spacing;

  const particles = [];
  let currentOffset = offset < 0 ? offset + spacing : offset;

  while (currentOffset < totalLength) {
    // Find which segment this offset falls into
    const seg = segments.find(s => currentOffset >= s.startLen && currentOffset <= s.startLen + s.len);
    if (seg) {
      const t = (currentOffset - seg.startLen) / seg.len;
      const x = seg.p1[0] + t * seg.dx;
      const y = seg.p1[1] + t * seg.dy;
      particles.push([x, y]);
    }
    currentOffset += spacing;
  }

  return particles;
}
