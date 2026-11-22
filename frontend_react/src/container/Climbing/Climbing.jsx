import React from 'react';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { climbing } from '../../data/profile';
import './Climbing.scss';

// "Off the Wall": the bouldering section. Facts and photos appear once they are
// filled in src/data/profile.js.
const Climbing = () => {
  const facts = climbing.facts.filter((f) => f.value);

  return (
    <>
      <div className="climb">
        <div className="section__head">
          <p className="eyebrow">Off the wall</p>
          <h2 className="head-text">Bouldering is <span>my reset</span></h2>
          <p className="lede">{climbing.intro}</p>
        </div>

        <div className="climb__terms card" aria-label="Climbing words used on this site">
          <p className="eyebrow">Climbing words on this site</p>
          <dl>
            <div><dt>Problem</dt><dd>A short boulder route, set with holds of one color.</dd></div>
            <div><dt>Topo</dt><dd>A map of a route. My experience is drawn as one.</dd></div>
            <div><dt>Send</dt><dd>Climbing a problem from start to top without falling.</dd></div>
            <div><dt>Quickdraw</dt><dd>The clips on a lead rope. On a wide screen, they mark the sections at the right edge of this page.</dd></div>
          </dl>
        </div>
      </div>

      {facts.length > 0 && (
        <ul className="climb__facts">
          {facts.map((f) => (
            <li key={f.label} className="card">
              <p className="eyebrow">{f.label}</p>
              <p className="bold-text">{f.value}</p>
            </li>
          ))}
        </ul>
      )}

      {climbing.photos.length > 0 && (
        <ul className="climb__photos">
          {climbing.photos.map((p, i) => (
            <motion.li
              key={p.alt}
              initial={{ opacity: 0, y: 24, rotate: i % 2 ? 1.5 : -1.5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <img src={p.src} alt={p.alt} loading="lazy" />
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
};

export default AppWrap(MotionWrap(Climbing), 'climbing');
