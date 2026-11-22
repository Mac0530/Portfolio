import React from 'react';

import SocialMedia from './SocialMedia';
import { person } from '../data/profile';

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="site-footer__inner">
      <p>© {new Date().getFullYear()} {person.fullName}. All rights reserved.</p>
      <SocialMedia />
    </div>
  </footer>
);

export default SiteFooter;
