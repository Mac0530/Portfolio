// Two-segment limb: returns the elbow/knee point that lets the limb reach the target.
// `bend` (+1 or -1) picks which side the joint folds to.
export function joint(a, t, l1, l2, bend) {
  const dx = t.x - a.x;
  const dy = t.y - a.y;
  let d = Math.hypot(dx, dy);
  d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(d, l1 + l2 - 0.01));
  const base = Math.atan2(dy, dx);
  const c = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const ang = Math.acos(Math.max(-1, Math.min(1, c)));
  const th = base + bend * ang;
  return { x: a.x + l1 * Math.cos(th), y: a.y + l1 * Math.sin(th) };
}

// Points along a limb from its root through the joint to the target, as an SVG path.
export function limbPath(a, t, l1, l2, bend) {
  const j = joint(a, t, l1, l2, bend);
  const f = (v) => v.toFixed(1);
  return `M${f(a.x)} ${f(a.y)}L${f(j.x)} ${f(j.y)}L${f(t.x)} ${f(t.y)}`;
}
