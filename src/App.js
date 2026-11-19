import React from 'react';
import { MotionConfig } from 'framer-motion';

import { About, Climbing, Experience, Footer, Header, SideProjects, Work } from './container';
import { Navbar, RopeNav, SiteFooter } from './components';
import './App.scss';

// Testimonials are hidden until there are real quotes to show.
// To bring them back, import Testimonial from './container' and place <Testimonial /> after <Climbing />.
const App = () => (
  <MotionConfig reducedMotion="user">
    <div className="app">
      <Navbar />
      <main>
        <Header />
        <About />
        <Work />
        <SideProjects />
        <Experience />
        <Climbing />
        <Footer />
      </main>
      <SiteFooter />
      <RopeNav />
    </div>
  </MotionConfig>
);

export default App;
