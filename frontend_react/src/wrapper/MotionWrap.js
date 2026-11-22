import React from 'react';
import { motion } from 'framer-motion';

// Fades a section's content up into place the first time it scrolls into view.
const MotionWrap = (Component, classNames = '') => function HOC() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`motion-wrap ${classNames}`.trim()}
    >
      <Component />
    </motion.div>
  );
};

export default MotionWrap;
