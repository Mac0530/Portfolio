import React, { useEffect, useRef } from 'react';

import sections from '../../constants/sections';
import useScrollProgress from '../../hooks/useScrollProgress';
import { Belayer, Climber } from './Figures';
import {
  CLIP_HAND, belayerPoses, blendPoses, climberPoses, drawBelayer, drawClimber, lerpPt,
} from './poses';
import './RopeNav.scss';

const ids = sections.map((s) => s.id);
const LAST = sections.length - 1;

// How far below the rail the belay device sits (matches .rope__belayer in the SCSS:
// 14px gap + device at y=28 of a 50-unit viewBox drawn 60px tall).
const DEVICE_DROP = 48;
// Scrolling up faster than this (px/s) pulls the climber off the wall.
const FALL_SPEED = 2200;
// Fall timeline, in seconds: free fall, then the rope catches and bounces.
const FALL_DROP_T = 0.26;
const FALL_END_T = 1.1;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function readTarget() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
}

// Desktop-only progress rail: a rope with one quickdraw per section.
// A climber leads up the rope as the visitor scrolls down, clipping each draw,
// and is lowered when they scroll back up. A belayer manages the rope at the base.
// Scrolling up very fast makes the climber fall and the belayer catch them.
const RopeNav = () => {
  const { active } = useScrollProgress(ids);
  const railRef = useRef(null);
  const ropeRef = useRef(null);
  const drawRefs = useRef([]);
  const climber = useRef({});
  const belayer = useRef({});

  useEffect(() => {
    const rail = railRef.current;
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let H = rail.clientHeight;
    let frame = 0;

    const start = readTarget();
    const s = {
      t: performance.now(),
      pos: start, // displayed progress, eased toward the scroll position
      posVel: 0,
      lastY: window.scrollY,
      yVel: 0,
      dir: 1,
      dirAt: 0,
      clipIdx: Math.floor(start * LAST + 1e-3),
      clipUntil: 0,
      shownClipped: -1,
      fall: null,
      cooldownUntil: 0,
      w: { climb: 1, lower: 0, sent: 0, fall: 0, clip: 0 },
      bw: { idle: 1, pay: 0, take: 0, catch: 0 },
      bphase: 0,
    };

    const tick = (now) => {
      frame = 0;
      const dt = clamp((now - s.t) / 1000, 0.001, 0.05);
      s.t = now;
      // Rail is display:none on narrow screens. (offsetParent is always null for
      // fixed elements, so check for layout boxes instead.)
      if (!rail.getClientRects().length) return;
      if (!H) H = rail.clientHeight;

      const reduce = reduceQuery.matches;
      const target = readTarget();
      const y = window.scrollY;
      s.yVel += ((y - s.lastY) / dt - s.yVel) * Math.min(1, dt * 12);
      s.lastY = y;

      // A fast flick upward: the climber comes off, unless they are near the ground.
      if (!reduce && !s.fall && now > s.cooldownUntil && s.yVel < -FALL_SPEED && s.pos > 0.6 / LAST) {
        const clipP = Math.floor(s.pos * LAST + 1e-3) / LAST;
        const drop = Math.min((H / LAST) * 1.3, 2 * (s.pos - clipP) * H + 16);
        s.fall = { t0: now, drop };
      }

      const prev = s.pos;
      let offset = 0;
      let rot = 0;
      let lift = 0;
      let fallT = 0;
      if (s.fall) {
        fallT = (now - s.fall.t0) / 1000;
        const { drop } = s.fall;
        if (fallT < FALL_DROP_T) {
          const k = fallT / FALL_DROP_T;
          offset = drop * k * k;
          rot = 14 * k;
        } else if (fallT < FALL_END_T) {
          const u = fallT - FALL_DROP_T;
          offset = drop + 9 * Math.exp(-5 * u) * Math.sin(16 * u); // rope stretch
          rot = 14 * Math.exp(-4 * u) * Math.cos(9 * u); // swing back to the wall
          lift = 9 * (1 - Math.exp(-14 * u)) * Math.exp(-3.2 * u); // belayer pulled up
        } else {
          // Caught: the climber now simply hangs lower on the rope.
          s.pos = Math.max(0, s.pos - drop / H);
          s.fall = null;
          s.cooldownUntil = now + 1500;
        }
      } else {
        s.pos += (target - s.pos) * (reduce ? 1 : Math.min(1, dt * 9));
        if (Math.abs(target - s.pos) < 1e-5) s.pos = target;
        s.posVel += ((s.pos - prev) / dt - s.posVel) * Math.min(1, dt * 10);
      }
      if (s.fall) s.posVel = 0;

      // Which way is the climber going?
      let mode;
      if (s.fall) {
        mode = 'fall';
      } else if (s.posVel > 0.01) {
        mode = 'climb';
        s.dir = 1;
        s.dirAt = now;
      } else if (s.posVel < -0.01) {
        mode = 'lower';
        s.dir = -1;
        s.dirAt = now;
      } else {
        mode = s.dir === -1 && now - s.dirAt < 600 ? 'lower' : 'climb';
      }
      if (mode === 'climb' && s.pos > 0.985) mode = 'sent';

      // Clip each quickdraw on the way past it.
      const idx = Math.floor(s.pos * LAST + 1e-3);
      if (idx > s.clipIdx && s.posVel > 0 && !reduce) s.clipUntil = now + 450;
      s.clipIdx = idx;
      if (idx !== s.shownClipped) {
        drawRefs.current.forEach((li, i) => li && li.classList.toggle('is-clipped', i <= idx));
        s.shownClipped = idx;
      }

      // Ease between poses.
      const ease = reduce ? 1 : Math.min(1, dt * 10);
      const clipping = mode === 'climb' && now < s.clipUntil;
      Object.keys(s.w).forEach((k) => {
        const goal = k === 'clip' ? Number(clipping) : Number(k === mode);
        s.w[k] += (goal - s.w[k]) * ease;
      });
      const moving = Math.abs(s.posVel) > 0.01;
      let bmode = 'idle';
      if (s.fall) bmode = fallT > FALL_DROP_T * 0.8 ? 'catch' : 'take';
      else if (moving) bmode = mode === 'lower' ? 'take' : 'pay';
      Object.keys(s.bw).forEach((k) => {
        s.bw[k] += (Number(k === bmode) - s.bw[k]) * ease;
      });
      if (!reduce && bmode === 'pay') s.bphase += dt * 1.6;

      const phi = reduce ? 0.3 : s.pos * LAST * 1.5;
      const P = blendPoses([
        [s.w.climb, climberPoses.climb(phi)],
        [s.w.lower, climberPoses.lower(phi)],
        [s.w.sent, climberPoses.sent()],
        [s.w.fall, climberPoses.fall(now / 1000)],
      ]);
      if (s.w.clip > 0.001) P.rh = lerpPt(P.rh, CLIP_HAND, s.w.clip);
      P.rot = rot;
      drawClimber(climber.current, P);

      const B = blendPoses([
        [s.bw.idle, belayerPoses.idle()],
        [s.bw.pay, belayerPoses.pay(s.bphase)],
        [s.bw.take, belayerPoses.take()],
        [s.bw.catch, belayerPoses.catch()],
      ]);
      drawBelayer(belayer.current, B);

      // Place the figures and run the rope from the belay device to the harness.
      const posPx = s.pos * H - offset;
      climber.current.root.style.transform = `translate3d(0, ${(-posPx).toFixed(1)}px, 0)`;
      belayer.current.root.style.transform = `translate3d(0, ${(-lift).toFixed(1)}px, 0)`;
      ropeRef.current.style.bottom = `${(lift - DEVICE_DROP).toFixed(1)}px`;
      ropeRef.current.style.height = `${Math.max(0, posPx + DEVICE_DROP - lift).toFixed(1)}px`;

      // Stop the loop once everything has come to rest; the next scroll restarts it.
      const atRest = (weights, goalOf) => Object.keys(weights)
        .every((k) => Math.abs(weights[k] - goalOf(k)) < 1e-3);
      const settled = !s.fall
        && s.pos === target
        && Math.abs(s.posVel) < 1e-4
        && Math.abs(s.yVel) < 1
        && now > s.clipUntil + 300
        && now - s.dirAt > 700
        && atRest(s.w, (k) => (k === 'clip' ? 0 : Number(k === mode)))
        && atRest(s.bw, (k) => Number(k === bmode));
      if (!settled) frame = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!frame) {
        s.t = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const onResize = () => {
      H = rail.clientHeight;
      kick();
    };

    kick();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', onResize);
    if (reduceQuery.addEventListener) reduceQuery.addEventListener('change', kick);
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', onResize);
      if (reduceQuery.removeEventListener) reduceQuery.removeEventListener('change', kick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className="rope" ref={railRef} aria-label="Section progress">
      <div className="rope__line" ref={ropeRef} aria-hidden="true" />
      <ul>
        {sections.map((s, i) => (
          <li
            key={s.id}
            ref={(el) => { drawRefs.current[i] = el; }}
            style={{ bottom: `${(i / LAST) * 100}%` }}
          >
            <a
              href={`#${s.id}`}
              className={active === s.id ? 'is-here' : ''}
              aria-current={active === s.id ? 'true' : undefined}
            >
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <Belayer parts={belayer} />
      <Climber parts={climber} />
    </nav>
  );
};

export default RopeNav;
