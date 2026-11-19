import React from 'react';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { caseStudies } from '../../data/profile';
import './Work.scss';

// Professional work only. Personal web projects live in the Side projects section.
const Work = () => (
  <>
    <div className="section__head">
      <p className="eyebrow">Work</p>
      <h2 className="head-text">Selected <span>work</span></h2>
      <p className="lede">Problems I&apos;ve worked on as an engineer, from test benches to car dashboards.</p>
    </div>

    <ol className="cases">
      {caseStudies.map((c, i) => (
        <motion.li
          key={c.title}
          className="case card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: 'easeOut' }}
        >
          <p className={`tape tape--${c.color}`}>
            {c.org} · {c.years}
          </p>
          <h3 className="bold-text">{c.title}</h3>
          <p className="p-text">{c.body}</p>
          <ul className="case__tools" aria-label="Tools and standards">
            {c.tools.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </motion.li>
      ))}
    </ol>
  </>
);

export default AppWrap(MotionWrap(Work), 'work', 'section--wall');
