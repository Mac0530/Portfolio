import { limbPath } from '../../utils/limbs';

// Poses for the two rail figures. Coordinates are in each figure's SVG viewBox:
// the climber is 40x60 with the harness at (20, 33); the belayer is 30x50 with
// the belay device at (15, 28). Both are seen from behind, facing the wall.

const TAU = Math.PI * 2;
const pt = (x, y) => ({ x, y });

// ---- Climber ----

export const climberPoses = {
  // Reach-and-step cycle. phi advances with scroll, so stopping freezes the move.
  climb(phi) {
    const a = Math.sin(TAU * phi);
    return {
      lh: pt(10.5, 5 - 5 * a),
      rh: pt(29.5, 5 + 5 * a),
      lf: pt(13, 50 + 4 * a),
      rf: pt(27, 50 - 4 * a),
      by: 1.2 * Math.cos(2 * TAU * phi),
    };
  },
  // Sitting in the harness, hands on the rope, walking the feet down the wall.
  lower(phi) {
    const b = Math.sin(TAU * phi);
    return { lh: pt(18.5, 9), rh: pt(21, 1), lf: pt(7, 43 + 3 * b), rf: pt(33, 43 - 3 * b), by: 1 };
  },
  // Top of the route.
  sent() {
    return { lh: pt(7, 1), rh: pt(33, 1), lf: pt(14, 52), rf: pt(26, 52), by: -1 };
  },
  // Off the wall: arms flailing, legs dangling.
  fall(t) {
    const w = Math.sin(t * 28);
    return { lh: pt(3, 9 + 3 * w), rh: pt(37, 9 - 3 * w), lf: pt(14, 53), rf: pt(27, 51 + 2 * w), by: 0 };
  },
};

// Right hand pulling rope up to the quickdraw at the harness.
export const CLIP_HAND = pt(21.5, 27);

export function drawClimber(parts, P) {
  const sL = pt(14, 18 + P.by);
  const sR = pt(26, 18 + P.by);
  const hL = pt(17, 32);
  const hR = pt(23, 32);
  parts.lh.setAttribute('d', limbPath(sL, P.lh, 9.5, 9.5, -1));
  parts.rh.setAttribute('d', limbPath(sR, P.rh, 9.5, 9.5, 1));
  parts.lf.setAttribute('d', limbPath(hL, P.lf, 10.5, 10.5, 1));
  parts.rf.setAttribute('d', limbPath(hR, P.rf, 10.5, 10.5, -1));
  parts.torso.setAttribute('y1', (18 + P.by).toFixed(1));
  parts.head.setAttribute('cy', (10 + P.by).toFixed(1));
  parts.body.setAttribute('transform', `rotate(${P.rot.toFixed(2)} 20 33)`);
}

// ---- Belayer ----

export const belayerPoses = {
  idle() {
    return { lh: pt(13, 7), rh: pt(19.5, 26), lf: pt(8.5, 47.5), rf: pt(21.5, 47.5), by: 0 };
  },
  // Paying out: guide hand pulls rope up, brake hand feeds it into the device.
  pay(phi) {
    const c = Math.sin(TAU * phi);
    return { lh: pt(13.5, 6 + 3 * c), rh: pt(17.5, 25 - 2.5 * c), lf: pt(8.5, 47.5), rf: pt(21.5, 47.5), by: 0 };
  },
  // Lowering: brake hand low on the hip, sitting back a little.
  take() {
    return { lh: pt(13, 11), rh: pt(20.5, 28), lf: pt(8, 47.5), rf: pt(22, 47.5), by: 1.2 };
  },
  // Catching a fall: pulled up off the ground, both hands on the rope.
  catch() {
    return { lh: pt(14.5, 2), rh: pt(16.5, 20), lf: pt(11, 48), rf: pt(19, 48), by: -0.5 };
  },
};

export function drawBelayer(parts, P) {
  const sL = pt(10, 14 + P.by);
  const sR = pt(20, 14 + P.by);
  const hL = pt(12.5, 27);
  const hR = pt(17.5, 27);
  parts.lh.setAttribute('d', limbPath(sL, P.lh, 7.5, 7.5, -1));
  parts.rh.setAttribute('d', limbPath(sR, P.rh, 7.5, 7.5, 1));
  parts.lf.setAttribute('d', limbPath(hL, P.lf, 10.5, 10.5, 1));
  parts.rf.setAttribute('d', limbPath(hR, P.rf, 10.5, 10.5, -1));
  parts.torso.setAttribute('y1', (14 + P.by).toFixed(1));
  parts.head.setAttribute('cy', (7 + P.by).toFixed(1));
  // Brake strand: from the device, through the brake hand, down to the rope pile.
  parts.tail.setAttribute('d', `M15 28L${P.rh.x.toFixed(1)} ${P.rh.y.toFixed(1)}Q26 44 25 50`);
}

// Weighted average of several poses. `entries` is a list of [weight, pose].
export function blendPoses(entries) {
  let total = 0;
  const out = { lh: pt(0, 0), rh: pt(0, 0), lf: pt(0, 0), rf: pt(0, 0), by: 0 };
  entries.forEach(([w, p]) => {
    if (w <= 0) return;
    total += w;
    ['lh', 'rh', 'lf', 'rf'].forEach((k) => {
      out[k].x += p[k].x * w;
      out[k].y += p[k].y * w;
    });
    out.by += p.by * w;
  });
  if (total > 0) {
    ['lh', 'rh', 'lf', 'rf'].forEach((k) => {
      out[k].x /= total;
      out[k].y /= total;
    });
    out.by /= total;
  }
  return out;
}

export const lerpPt = (a, b, t) => pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
