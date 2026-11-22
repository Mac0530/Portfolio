import React, { useState } from 'react';
import { BsMoon, BsSun } from 'react-icons/bs';

// Dark is the default; light applies only after the visitor picks it.
const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

const ThemeToggle = () => {
  const [theme, setTheme] = useState(currentTheme);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      // Storage can be blocked; the choice then lasts for this visit only.
    }
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? <BsSun aria-hidden="true" /> : <BsMoon aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
