import React, { useEffect, useState } from 'react';
import { AiFillGithub } from 'react-icons/ai';
import { HiExternalLink } from 'react-icons/hi';
import { motion } from 'framer-motion';

import { AppWrap, MotionWrap } from '../../wrapper';
import { urlFor, client } from '../../client';
import './SideProjects.scss';

const filters = ['All', 'UI/UX', 'Web App', 'Mobile App', 'React JS'];
const tapeColor = { All: 'a', 'UI/UX': 'd', 'Web App': 'b', 'Mobile App': 'c', 'React JS': 'a' };

// Personal web projects, loaded from Sanity ("works" documents).
const SideProjects = () => {
  const [works, setWorks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    client
      .fetch('*[_type == "works"]')
      .then((data) => {
        if (cancelled) return;
        setWorks(Array.isArray(data) ? data : []);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  const shown = activeFilter === 'All'
    ? works
    : works.filter((w) => Array.isArray(w.tags) && w.tags.includes(activeFilter));

  return (
    <>
      <div className="section__head">
        <p className="eyebrow">Side projects · personal, outside work</p>
        <h2 className="head-text">Things I build <span>for fun</span></h2>
        <p className="lede">Web projects I make in my own time to learn front-end and back-end development.</p>
      </div>

      <div className="sp__filters" role="group" aria-label="Filter projects">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`sp__filter tape tape--${tapeColor[f]} ${activeFilter === f ? 'is-active' : ''}`}
            aria-pressed={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {status === 'loading' && <p className="p-text">Loading projects…</p>}
      {status === 'error' && <p className="p-text">Projects couldn&apos;t be loaded right now. Please try again later.</p>}
      {status === 'ready' && shown.length === 0 && <p className="p-text">No projects in this category yet.</p>}

      <motion.ul className="sp__grid" key={activeFilter} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        {shown.map((w) => (
          <li className="sp__item card" key={w._id || w.title}>
            {w.imgUrl && (
              <div className="sp__img">
                <img src={urlFor(w.imgUrl).width(640).url()} alt="" loading="lazy" />
              </div>
            )}
            <div className="sp__body">
              {Array.isArray(w.tags) && w.tags[0] && <p className="sp__tag">{w.tags[0]}</p>}
              <h3 className="bold-text">{w.title}</h3>
              {w.description && <p className="p-text">{w.description}</p>}
              <div className="sp__links">
                {w.projectLink && (
                  <a href={w.projectLink} target="_blank" rel="noreferrer">
                    <HiExternalLink aria-hidden="true" />
                    Live
                    <span className="sr-only"> demo of {w.title}</span>
                  </a>
                )}
                {w.codeLink && (
                  <a href={w.codeLink} target="_blank" rel="noreferrer">
                    <AiFillGithub aria-hidden="true" />
                    Code
                    <span className="sr-only"> for {w.title}</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </motion.ul>
    </>
  );
};

export default AppWrap(MotionWrap(SideProjects), 'projects');
