import React from 'react';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { experience, skillGroups, person } from '../../data/profile';
import './Experience.scss';

// Career drawn as a climbing topo: earliest role at the bottom, latest at the top.
const Experience = () => {
  const latestFirst = [...experience].reverse();

  return (
    <>
      <div className="section__head">
        <p className="eyebrow">Experience</p>
        <h2 className="head-text">The route <span>so far</span></h2>
        <p className="lede">Twelve years, read from the bottom up like a climbing topo.</p>
      </div>

      <div className="exp">
        <div className="card exp__route">
          <motion.span
            className="exp__line"
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <ol className="exp__list" aria-label="Career, most recent first">
            {person.openToWork && (
              <li className="exp__item exp__item--next">
                <span className="exp__dot" aria-hidden="true" />
                <div>
                  <p className="exp__dates">Next</p>
                  <p className="exp__role">Open to new roles</p>
                  <p className="exp__org">
                    Test &amp; validation · automotive · payments · <a href="#contact">Get in touch</a>
                  </p>
                </div>
              </li>
            )}
            {latestFirst.map((e) => (
              <li className="exp__item" key={`${e.dates}-${e.role}`}>
                <span className="exp__dot" aria-hidden="true" />
                <div>
                  <p className="exp__dates">{e.dates}</p>
                  <p className="exp__role">{e.role}</p>
                  <p className="exp__org">{e.org} · {e.place}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="exp__skills">
          <h3 className="bold-text">Skill wall</h3>
          {skillGroups.map((g) => (
            <div className="exp__group" key={g.name}>
              <p className="exp__group-name">
                <span className={`exp__swatch exp__swatch--${g.color}`} aria-hidden="true" />
                {g.name}
              </p>
              <ul>
                {g.items.map((s) => (
                  <li key={s} className={`hold hold--${g.color}`}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppWrap(MotionWrap(Experience), 'experience', 'section--wall');
