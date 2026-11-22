// Site content taken from Ray Mark Guevarra's CV.
// Edit this file to change the text on the site. Side projects still come from Sanity.

export const person = {
  firstName: 'Mark',
  fullName: 'Ray Mark Guevarra',
  location: 'Yamato City, Kanagawa, Japan',
  openToWork: true,
  summary:
    'System test and validation engineer with 12 years in embedded software for cars and payment devices. I validate ECU software, certify payment devices against EMV, NFC Forum and FeliCa, and work with customers in English and Japanese.',
  roleTags: [
    { label: 'Test & validation', color: 'a' },
    { label: 'Automotive embedded', color: 'b' },
    { label: 'Payment certification', color: 'c' },
  ],
  email: 'markguevarra0530@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/ray-mark-guevarra-7898b3b7/',
    facebook: 'https://www.facebook.com/raymark.guevarra.3/about_overview/',
    twitter: 'https://twitter.com/CryptoMarkG1',
  },
};

export const services = [
  {
    title: 'Test & Validation',
    color: 'a',
    description:
      'Test plans and specifications; unit, integration, system and functional testing; requirement-based validation, defect tracking and root-cause analysis.',
  },
  {
    title: 'Automotive Embedded',
    color: 'b',
    description:
      'ECU validation on HILS/LABCAR, CAN and LIN, UDS diagnostics, ECU reprogramming and MISRA-C code verification across the V-model.',
  },
  {
    title: 'Payment Device Certification',
    color: 'c',
    description:
      'L1/L2 testing of POS terminals, mobile phones and contactless cards against EMV, NFC Forum and FeliCa specifications.',
  },
  {
    title: 'Automated Test Benches',
    color: 'd',
    description:
      'NI and Keolabs benches driven by DENSO and FANUC 6-axis robots, including monthly metrology, recalibration and new bench set-up.',
  },
];

export const languages = [
  { name: 'English', level: 'Fluent' },
  { name: 'Japanese', level: 'Business level' },
  { name: 'Filipino', level: 'Native' },
];

// Professional case studies for the Work section. Only details already on the CV.
export const caseStudies = [
  {
    org: 'FIME Japan',
    years: '2022–2026',
    color: 'c',
    title: 'Robot-automated payment test benches',
    body:
      'Ran L1/L2 certification tests for POS terminals, phones and contactless cards on NI and Keolabs benches driven by DENSO and FANUC 6-axis robots, which removed the positioning error of placing cards by hand. Owned the monthly metrology checks and set up a new FANUC bench from scratch for another team.',
    tools: ['EMV', 'NFC Forum', 'FeliCa', 'FANUC', 'Keolabs'],
  },
  {
    org: 'Bosch, via TechnoPro Engineering',
    years: '2018–2020',
    color: 'b',
    title: 'ECU validation on HILS, plus a report generator',
    body:
      'Validated ECU software on HILS/LABCAR, including PVERF signal validation and CAN/tester release checks with UDS diagnostics. Built an Excel VBA tool that imported CAN data and generated the test report automatically, replacing manual copying into Excel for the team.',
    tools: ['CANoe', 'CAPL', 'ETAS INCA', 'IBM DOORS', 'Excel VBA'],
  },
  {
    org: 'Denso Techno Philippines',
    years: '2014–2017',
    color: 'b',
    title: 'Meter display software for 3D head-up displays',
    body:
      'Developed meter panel display software in C for automotive 3D head-up displays, from specification differences through implementation, evidence and code review, and tested the HUD on real hardware.',
    tools: ['C', 'CANoe', 'CANdelaStudio', 'MATLAB/Simulink'],
  },
  {
    org: 'Toyo Kanetsu, via TechnoPro Engineering',
    years: '2020–2021',
    color: 'a',
    title: 'Airport self bag drop systems',
    body:
      'Built baggage-handling simulations in AutoMod and supported UAT. Maintained and modified Self Bag Drop systems on site: network set-up, Linux administration and log analysis for system-level debugging.',
    tools: ['AutoMod', 'Linux', 'TCP/IP'],
  },
];

// Earliest first. The career route is drawn bottom (earliest) to top (latest).
export const experience = [
  { dates: 'Oct 2012 – Oct 2014', role: 'Embedded Software Engineer (QA)', org: 'Denso Techno Philippines', place: 'Philippines' },
  { dates: 'Nov 2014 – Feb 2017', role: 'Embedded Software Engineer (Developer)', org: 'Denso Techno Philippines', place: 'Philippines' },
  { dates: 'May 2017 – Feb 2018', role: 'Software Engineer', org: 'Equitable Computer Services', place: 'Philippines' },
  { dates: 'Mar 2018 – Jan 2020', role: 'Embedded Software Engineer', org: 'TechnoPro Engineering, at Bosch', place: 'Yokohama' },
  { dates: 'May 2020 – Oct 2021', role: 'Software Engineer', org: 'TechnoPro Engineering, at Toyo Kanetsu', place: 'Japan' },
  { dates: 'Jan 2022 – Apr 2022', role: 'PC Test Engineer', org: 'Pasona Tech, at Ubiqom Holdings', place: 'Japan' },
  { dates: 'Aug 2022 – Jul 2026', role: 'Lab Test Engineer', org: 'FIME Japan', place: 'Tokyo' },
];

export const skillGroups = [
  { name: 'Automotive tools', color: 'b', items: ['CANoe', 'CANalyzer', 'CAPL', 'CANdelaStudio', 'ETAS INCA', 'LABCAR / HILS', 'IBM DOORS'] },
  { name: 'Protocols & standards', color: 'c', items: ['CAN', 'LIN', 'UDS', 'EMV', 'NFC Forum', 'FeliCa', 'MISRA-C'] },
  { name: 'Languages & tools', color: 'a', items: ['C / Embedded C', 'C++', 'Excel VBA', 'Python', 'MATLAB / Simulink', 'Linux', 'Git', 'JIRA', 'Wireshark'] },
  { name: 'Web (side projects)', color: 'd', items: ['HTML / CSS', 'SCSS', 'React', 'Node JS'] },
];

// Off the Wall section. Empty fields are hidden on the site.
// Add photos by importing them (e.g. import boulder1 from '../assets/climbing/boulder1.jpg')
// and listing them as { src: boulder1, alt: 'Describe the photo' }.
export const climbing = {
  intro:
    "When I'm not at a test bench, I'm at the bouldering gym. A boulder problem works a lot like a failing test: read it, try a sequence, see where it breaks, adjust, and go again until it sends.",
  facts: [
    { label: 'Climbing since', value: '' },
    { label: 'Home gym', value: '' },
    { label: 'Favorite style', value: '' },
    { label: 'Current project', value: '' },
  ],
  photos: [],
};
