import React from 'react';

// Wraps a section's content in a full-width <section> with a centered inner column.
const AppWrap = (Component, idName, classNames = '') => function HOC() {
  return (
    <section id={idName} className={`section ${classNames}`.trim()} data-section={idName}>
      <div className="section__inner">
        <Component />
      </div>
    </section>
  );
};

export default AppWrap;
