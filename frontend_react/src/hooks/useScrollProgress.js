import { useEffect, useState } from 'react';

// Returns the id of the section currently in view and how far down the page
// the visitor has scrolled (0 at the top, 1 at the bottom).
export default function useScrollProgress(ids) {
  const [state, setState] = useState({ active: ids[0], progress: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      let active = ids[0];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) active = id;
      });
      // At the very bottom, the last section is the active one even if it is short.
      if (progress > 0.995) active = ids[ids.length - 1];
      setState((prev) => (prev.active === active && prev.progress === progress ? prev : { active, progress }));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return state;
}
