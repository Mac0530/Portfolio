import React, { useEffect, useRef, useState } from 'react';
import { BsPauseFill, BsPlayFill } from 'react-icons/bs';

import './ClimbingWall.scss';

const NS = 'http://www.w3.org/2000/svg';

// Small seeded random generator so the wall looks the same on every visit.
function rng(seed) {
  let s = seed;
  return function next() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Irregular rounded shape for a climbing hold.
function blob(cx, cy, r, rand, n = 7) {
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.4;
    const rr = r * (0.72 + rand() * 0.42);
    pts.push([cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr * 0.9]);
  }
  const f = (v) => v.toFixed(1);
  const p0 = pts[n - 1];
  const p1 = pts[0];
  let d = `M${f((p0[0] + p1[0]) / 2)} ${f((p0[1] + p1[1]) / 2)}`;
  for (let i = 0; i < n; i += 1) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    d += ` Q${f(p[0])} ${f(p[1])} ${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`;
  }
  return `${d}Z`;
}

// Two-segment limb: returns the elbow/knee point that lets the limb reach the target.
function joint(a, t, l1, l2, bend) {
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

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

const ClimbingWall = ({ onSent }) => {
  const svgRef = useRef(null);
  const pausedRef = useRef(false);
  const onSentRef = useRef(onSent);
  const [paused, setPaused] = useState(false);
  const [sent, setSent] = useState(false);
  const [reduced] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  onSentRef.current = onSent;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const mk = (tag, attrs, parent = svg) => {
      const el = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
      parent.appendChild(el);
      return el;
    };

    // Wall: plywood panels with T-nut bolt holes
    const defs = mk('defs', {});
    const pat = mk('pattern', { id: 'cw-tnuts', width: 30, height: 30, patternUnits: 'userSpaceOnUse' }, defs);
    mk('circle', { cx: 15, cy: 15, r: 1.6, class: 'cw-tnut' }, pat);
    mk('rect', { x: 0, y: 0, width: 600, height: 540, class: 'cw-bg' });
    mk('rect', { x: 0, y: 0, width: 600, height: 540, fill: 'url(#cw-tnuts)' });
    [200, 400].forEach((x) => mk('line', { x1: x, y1: 0, x2: x, y2: 540, class: 'cw-seam' }));
    [180, 360].forEach((y) => mk('line', { x1: 0, y1: y, x2: 600, y2: y, class: 'cw-seam' }));

    // Other routes on the wall, kept out of the climbing corridor
    const R = rng(7);
    const cls = ['cw-hold-b', 'cw-hold-c', 'cw-hold-d'];
    let placed = 0;
    let guard = 0;
    while (placed < 26 && guard < 500) {
      guard += 1;
      const x = 20 + R() * 560;
      const y = 20 + R() * 500;
      if (!(x > 205 && x < 400) && !(x < 190 && y > 440)) {
        mk('path', { d: blob(x, y, 7 + R() * 8, R), class: cls[placed % 3] });
        placed += 1;
      }
    }

    // The blue route
    const H = [];
    const jit = [0, 6, -8, 4, -4, 8, -6, 2, 0];
    for (let k = 0; k < 9; k += 1) H.push({ x: (k % 2 === 0 ? 268 : 338) + jit[k], y: 500 - k * 48 });
    H[8].x = 303;
    const chalk = [];
    const RR = rng(21);
    H.forEach((h, k) => {
      mk('path', { d: blob(h.x, h.y, k === 8 ? 19 : 12, RR), class: 'cw-hold-a' });
      chalk.push(mk('ellipse', { cx: h.x, cy: h.y - 3, rx: k === 8 ? 11 : 6, ry: k === 8 ? 4 : 3, class: 'cw-chalk' }));
    });
    // Start and top tape, as gyms mark them
    [3, 4].forEach((k) => mk('rect', { x: H[k].x - 13, y: H[k].y + 14, width: 26, height: 5, rx: 1, class: 'cw-tape' }));
    mk('text', { x: H[3].x + 22, y: H[3].y + 20, class: 'cw-tape-label' }).textContent = 'START';
    mk('rect', { x: H[8].x - 16, y: H[8].y + 20, width: 32, height: 5, rx: 1, class: 'cw-tape' });
    mk('text', { x: H[8].x + 24, y: H[8].y + 26, class: 'cw-tape-label' }).textContent = 'TOP';

    // Route card, like the ones posted at the base of a gym problem
    const rc = mk('g', { transform: 'translate(18 468)' });
    mk('rect', { x: 0, y: 0, width: 172, height: 56, rx: 6, class: 'cw-card' }, rc);
    mk('text', { x: 12, y: 22, class: 'cw-card-t' }, rc).textContent = 'BLUE · "CAREER"';
    mk('text', { x: 12, y: 40, class: 'cw-card-s' }, rc).textContent = 'Setter: Mark · 12 years';

    // "SENT" tag shown when the climber tops out
    const sentTag = mk('g', { class: 'cw-sent', transform: `translate(${H[8].x - 34} ${H[8].y - 74})` });
    mk('rect', { x: 0, y: 0, width: 68, height: 22, rx: 4, class: 'cw-sent-bg' }, sentTag);
    mk('text', { x: 34, y: 15, 'text-anchor': 'middle', class: 'cw-sent-t' }, sentTag).textContent = 'SENT';

    // Climber
    const g = mk('g', { class: 'cw-climber' });
    const limbs = {};
    ['lf', 'rf', 'lh', 'rh'].forEach((k) => {
      limbs[k] = mk('polyline', { class: 'cw-limb', 'stroke-width': k[1] === 'f' ? 10 : 8 }, g);
    });
    const torso = mk('line', { class: 'cw-limb', 'stroke-width': 16 }, g);
    const bag = mk('rect', { width: 10, height: 12, rx: 3, class: 'cw-bag' }, g);
    const head = mk('circle', { r: 11, class: 'cw-head' }, g);
    const puffG = mk('g', {});

    const grip = (k, s) => (k === 8 ? { x: H[8].x + s * 9, y: H[8].y - 4 } : { x: H[k].x, y: H[k].y - 4 });
    const foot = (k, s) => ({ x: H[k].x + s * 2, y: H[k].y - 8 });
    const side = { lh: -1, rh: 1, lf: -1, rf: 1 };
    const at = (k) => (k === 'lh' || k === 'rh' ? grip : foot);
    const startIdx = { lh: 4, rh: 3, lf: 0, rf: 1 };
    // Each move: one hand and the opposite foot go up together
    const moves = [{ rh: 5, lf: 2 }, { lh: 6, rf: 3 }, { rh: 7, lf: 4 }, { lh: 8, rf: 5 }, { rh: 8 }];
    let P = {};
    const placeAt = (idx) => {
      P = {};
      Object.keys(idx).forEach((k) => { P[k] = at(k)(idx[k], side[k]); });
    };

    const pt = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const draw = () => {
      const hm = { x: (P.lh.x + P.rh.x) / 2, y: (P.lh.y + P.rh.y) / 2 };
      const fm = { x: (P.lf.x + P.rf.x) / 2, y: (P.lf.y + P.rf.y) / 2 };
      const st = { x: hm.x, y: hm.y + 44 };
      const ht = { x: fm.x, y: fm.y - 56 };
      const dx = st.x - ht.x;
      const dy = st.y - ht.y;
      const len = Math.hypot(dx, dy);
      let ux = 0;
      let uy = -1;
      if (len > 1) { ux = dx / len; uy = dy / len; }
      const T = Math.max(34, Math.min(72, len));
      const c = { x: (st.x + ht.x) / 2, y: (st.y + ht.y) / 2 };
      const sh = { x: c.x + (ux * T) / 2, y: c.y + (uy * T) / 2 };
      const hip = { x: c.x - (ux * T) / 2, y: c.y - (uy * T) / 2 };
      const px = -uy;
      const py = ux;
      const sL = { x: sh.x - px * 12, y: sh.y - py * 12 };
      const sR = { x: sh.x + px * 12, y: sh.y + py * 12 };
      const hL = { x: hip.x - px * 8, y: hip.y - py * 8 };
      const hR = { x: hip.x + px * 8, y: hip.y + py * 8 };
      limbs.lh.setAttribute('points', [sL, joint(sL, P.lh, 38, 38, -1), P.lh].map(pt).join(' '));
      limbs.rh.setAttribute('points', [sR, joint(sR, P.rh, 38, 38, 1), P.rh].map(pt).join(' '));
      limbs.lf.setAttribute('points', [hL, joint(hL, P.lf, 44, 44, 1), P.lf].map(pt).join(' '));
      limbs.rf.setAttribute('points', [hR, joint(hR, P.rf, 44, 44, -1), P.rf].map(pt).join(' '));
      torso.setAttribute('x1', sh.x);
      torso.setAttribute('y1', sh.y);
      torso.setAttribute('x2', hip.x);
      torso.setAttribute('y2', hip.y);
      head.setAttribute('cx', sh.x + ux * 19);
      head.setAttribute('cy', sh.y + uy * 19);
      bag.setAttribute('x', hip.x - 5 + px * 2);
      bag.setAttribute('y', hip.y - 2);
    };

    const setChalk = (ks) => chalk.forEach((el, i) => { el.style.opacity = ks.includes(i) ? '0.75' : '0'; });
    const markSent = (on) => {
      sentTag.classList.toggle('is-on', on);
      setSent(on);
      if (onSentRef.current) onSentRef.current(on);
    };

    if (reduced) {
      placeAt({ lh: 8, rh: 8, lf: 4, rf: 5 });
      draw();
      setChalk([3, 4, 5, 6, 7, 8]);
      markSent(true);
      return () => { while (svg.firstChild) svg.removeChild(svg.firstChild); };
    }

    // Clock that only runs while playing and on screen
    let alive = true;
    let visible = true;
    let clock = 0;
    let last = null;
    let raf = 0;
    const waiters = new Set();
    const frame = (ts) => {
      if (!alive) return;
      if (last !== null && !pausedRef.current && visible) clock += Math.min(50, ts - last);
      last = ts;
      waiters.forEach((w) => w(clock));
      raf = requestAnimationFrame(frame);
    };
    const wait = (ms) => new Promise((res) => {
      const end = clock + ms;
      const w = (c) => { if (c >= end) { waiters.delete(w); res(); } };
      waiters.add(w);
    });
    const tween = (ms, fn) => new Promise((res) => {
      const s = clock;
      const w = (c) => {
        const t = Math.min(1, (c - s) / ms);
        fn(t);
        if (t >= 1) { waiters.delete(w); res(); }
      };
      waiters.add(w);
    });

    const move = async (m) => {
      const from = {};
      const to = {};
      Object.keys(m).forEach((k) => { from[k] = { ...P[k] }; to[k] = at(k)(m[k], side[k]); });
      await tween(720, (t) => {
        const e = ease(t);
        const s = Math.sin(Math.PI * e);
        Object.keys(m).forEach((k) => {
          const hand = k[1] === 'h';
          P[k] = {
            x: from[k].x + (to[k].x - from[k].x) * e + side[k] * (hand ? 10 : 6) * s,
            y: from[k].y + (to[k].y - from[k].y) * e - (hand ? 0 : 10) * s,
          };
        });
        draw();
      });
      Object.keys(m).forEach((k) => { if (k[1] === 'h') chalk[m[k]].style.opacity = '0.75'; });
    };

    const puff = async () => {
      const r = rng(Math.floor(clock) + 3);
      const parts = [];
      for (let i = 0; i < 12; i += 1) {
        parts.push({
          c: mk('circle', { cx: H[8].x, cy: H[8].y, r: 2, class: 'cw-puff' }, puffG),
          a: r() * Math.PI * 2,
          d: 18 + r() * 26,
          s: 4 + r() * 6,
        });
      }
      await tween(950, (t) => {
        parts.forEach((p) => {
          p.c.setAttribute('cx', H[8].x + Math.cos(p.a) * p.d * t);
          p.c.setAttribute('cy', H[8].y - 6 + Math.sin(p.a) * p.d * t * 0.7 - 8 * t);
          p.c.setAttribute('r', 2 + p.s * t);
          p.c.style.opacity = String(0.9 * (1 - t));
        });
      });
      parts.forEach((p) => p.c.remove());
    };

    const loop = async () => {
      for (let first = true; alive; first = false) {
        placeAt(startIdx);
        draw();
        setChalk([3, 4]);
        markSent(false);
        // eslint-disable-next-line no-await-in-loop
        if (!first) await tween(400, (t) => { g.style.opacity = String(t); });
        // eslint-disable-next-line no-await-in-loop
        await wait(500);
        for (let i = 0; i < moves.length && alive; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          await move(moves[i]);
          // eslint-disable-next-line no-await-in-loop
          await wait(240);
        }
        if (!alive) return;
        markSent(true);
        // eslint-disable-next-line no-await-in-loop
        await puff();
        // eslint-disable-next-line no-await-in-loop
        await wait(2400);
        // eslint-disable-next-line no-await-in-loop
        await tween(450, (t) => { g.style.opacity = String(1 - t); });
      }
    };

    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
      io.observe(svg);
    }

    placeAt(startIdx);
    draw();
    setChalk([3, 4]);
    raf = requestAnimationFrame(frame);
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      waiters.clear();
      if (io) io.disconnect();
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    };
  }, [reduced]);

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  };

  return (
    <figure className="cw">
      <svg
        ref={svgRef}
        viewBox="0 0 600 540"
        role="img"
        aria-label="Animated climber ascending a blue route on a bouldering wall and reaching the top hold"
      />
      <figcaption className="cw__bar">
        <span className="cw__state" aria-hidden="true">{sent ? 'Sent ✓' : 'Climbing…'}</span>
        {reduced ? (
          <span className="cw__state">Animation off (reduced motion)</span>
        ) : (
          <button type="button" className="cw__btn" onClick={togglePause} aria-pressed={paused}>
            {paused ? <BsPlayFill aria-hidden="true" /> : <BsPauseFill aria-hidden="true" />}
            {paused ? 'Play' : 'Pause'}
          </button>
        )}
      </figcaption>
    </figure>
  );
};

export default ClimbingWall;
