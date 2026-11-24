import React from 'react';

// SVG bodies for the rail figures. RopeNav poses them every frame through `parts`,
// so these never re-render while scrolling.

const bind = (parts, key) => (el) => {
  // eslint-disable-next-line no-param-reassign
  parts.current[key] = el;
};

export const Climber = ({ parts }) => (
  <div className="rope__climber" ref={bind(parts, 'root')} aria-hidden="true">
    <svg viewBox="0 0 40 60" width="40" height="60" focusable="false">
      <g ref={bind(parts, 'body')}>
        <path ref={bind(parts, 'lf')} className="fig__limb" />
        <path ref={bind(parts, 'rf')} className="fig__limb" />
        <line ref={bind(parts, 'torso')} className="fig__shirt" x1="20" y1="18" x2="20" y2="30" />
        <rect className="fig__harness" x="15" y="30.5" width="10" height="4" rx="2" />
        <path ref={bind(parts, 'lh')} className="fig__limb" />
        <path ref={bind(parts, 'rh')} className="fig__limb" />
        <circle ref={bind(parts, 'head')} className="fig__head" cx="20" cy="10" r="5" />
      </g>
    </svg>
  </div>
);

export const Belayer = ({ parts }) => (
  <div className="rope__belayer" ref={bind(parts, 'root')} aria-hidden="true">
    <svg viewBox="0 0 30 50" width="36" height="60" focusable="false">
      <path ref={bind(parts, 'tail')} className="fig__rope" />
      <path ref={bind(parts, 'lf')} className="fig__limb" />
      <path ref={bind(parts, 'rf')} className="fig__limb" />
      <line ref={bind(parts, 'torso')} className="fig__shirt fig__shirt--belay" x1="15" y1="14" x2="15" y2="26" />
      <circle className="fig__device" cx="15" cy="28" r="2.2" />
      <path ref={bind(parts, 'lh')} className="fig__limb" />
      <path ref={bind(parts, 'rh')} className="fig__limb" />
      <circle ref={bind(parts, 'head')} className="fig__head" cx="15" cy="7" r="4" />
    </svg>
  </div>
);
