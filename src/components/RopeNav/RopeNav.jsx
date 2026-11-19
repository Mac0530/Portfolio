import React from 'react';

import sections from '../../constants/sections';
import useScrollProgress from '../../hooks/useScrollProgress';
import './RopeNav.scss';

const ids = sections.map((s) => s.id);

// Desktop-only progress rail: a rope with one quickdraw per section.
// The marker climbs the rope as the visitor scrolls down the page.
const RopeNav = () => {
  const { active, progress } = useScrollProgress(ids);
  const last = sections.length - 1;

  return (
    <nav className="rope" aria-label="Section progress">
      <ul>
        {sections.map((s, i) => (
          <li key={s.id} style={{ bottom: `${(i / last) * 100}%` }}>
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
      <div className="rope__me" style={{ bottom: `${progress * 100}%` }} aria-hidden="true" />
    </nav>
  );
};

export default RopeNav;
