import React from 'react';
import { BsTwitter } from 'react-icons/bs';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

import { person } from '../data/profile';

const items = [
  { href: person.links.linkedin, label: 'LinkedIn', Icon: FaLinkedinIn },
  { href: person.links.facebook, label: 'Facebook', Icon: FaFacebookF },
  { href: person.links.twitter, label: 'Twitter', Icon: BsTwitter },
];

const SocialMedia = ({ className = '' }) => (
  <ul className={`social ${className}`.trim()}>
    {items.map(({ href, label, Icon }) => (
      <li key={label}>
        <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
          <Icon aria-hidden="true" />
        </a>
      </li>
    ))}
  </ul>
);

export default SocialMedia;
