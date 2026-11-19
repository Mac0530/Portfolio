import React, { useEffect, useState } from 'react';
import { HiMenuAlt4, HiX } from 'react-icons/hi';
import { motion } from 'framer-motion';

import sections from '../../constants/sections';
import useScrollProgress from '../../hooks/useScrollProgress';
import ThemeToggle from '../ThemeToggle';
import './Navbar.scss';

const ids = sections.map((s) => s.id);
const links = sections.filter((s) => s.id !== 'home');

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { active } = useScrollProgress(ids);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="nav">
      <div className="nav__inner">
        <a href="#home" className="nav__logo" aria-label="Mark G., back to top">
          <span className="nav__logo-hold" aria-hidden="true" />
          Mark G.
        </a>

        <nav aria-label="Main">
          <ul className="nav__links">
            {links.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={active === s.id ? 'is-active' : ''}
                  aria-current={active === s.id ? 'true' : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <ThemeToggle />
          <button
            type="button"
            className="nav__menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <HiMenuAlt4 aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="nav__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <motion.div
            id="mobile-menu"
            className="nav__drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <button type="button" className="nav__close" onClick={() => setOpen(false)} aria-label="Close menu" autoFocus>
              <HiX aria-hidden="true" />
            </button>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={() => setOpen(false)}>{s.label}</a>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </header>
  );
};

export default Navbar;
