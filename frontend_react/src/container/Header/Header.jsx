import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';

import { AppWrap } from '../../wrapper';
import { images } from '../../constants';
import { ClimbingWall, SocialMedia } from '../../components';
import { person } from '../../data/profile';
import './Header.scss';

const Header = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="hero">
      <motion.div
        className="hero__copy"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {person.openToWork && (
          <a href="#contact" className="hero__open">
            <i aria-hidden="true" />
            Open to new roles
          </a>
        )}

        <div className="hero__id">
          <div className="hero__avatar">
            <img src={images.profile} alt={`Portrait of ${person.fullName}`} width="487" height="466" />
          </div>
          <div>
            <p className="hero__hi">Hello, I&apos;m</p>
            <h1 className={`hero__name ${sent ? 'is-sent' : ''}`.trim()}>{person.firstName}</h1>
          </div>
        </div>

        <p className="hero__meta">{person.fullName} · {person.location}</p>

        <ul className="hero__tags" aria-label="Focus areas">
          {person.roleTags.map((t) => (
            <li key={t.label} className={`tape tape--${t.color}`}>{t.label}</li>
          ))}
        </ul>

        <p className="hero__summary">{person.summary}</p>
        <p className="hero__climb">Off the test bench, I&apos;m on the bouldering wall.</p>

        <div className="hero__cta">
          <a href="#work" className="btn">
            See my work
            <HiArrowRight aria-hidden="true" />
          </a>
          <a href="#contact" className="btn btn--ghost">Get in touch</a>
        </div>

        <SocialMedia />
      </motion.div>

      <div className="hero__wall">
        <ClimbingWall onSent={setSent} />
      </div>
    </div>
  );
};

export default AppWrap(Header, 'home', 'section--hero');
