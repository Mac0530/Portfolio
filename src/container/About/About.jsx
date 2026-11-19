import React from 'react';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { services, languages } from '../../data/profile';
import './About.scss';

const About = () => (
  <>
    <div className="section__head">
      <p className="eyebrow">About</p>
      <h2 className="head-text">I find the bug <span>before your customer does</span></h2>
      <p className="lede">
        Twelve years testing and building embedded software, from car meter panels and ECUs at Denso and Bosch to
        payment-device certification at FIME Japan.
      </p>
    </div>

    <div className="about__grid">
      {services.map((s) => (
        <motion.article
          key={s.title}
          className="about__card card"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span className={`about__hold about__hold--${s.color}`} aria-hidden="true" />
          <h3 className="bold-text">{s.title}</h3>
          <p className="p-text">{s.description}</p>
        </motion.article>
      ))}
    </div>

    <div className="about__langs">
      <p className="eyebrow">Languages</p>
      <ul>
        {languages.map((l) => (
          <li key={l.name}>
            <strong>{l.name}</strong>
            <span>{l.level}</span>
          </li>
        ))}
      </ul>
    </div>
  </>
);

export default AppWrap(MotionWrap(About), 'about');
