import React, { useState } from 'react';
import { HiOutlineMail, HiOutlineDuplicate } from 'react-icons/hi';
import { FaLinkedinIn } from 'react-icons/fa';

import { AppWrap, MotionWrap } from '../../wrapper';
import { person } from '../../data/profile';
import './Footer.scss';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// public/contact.php on the web host emails each message to the site owner.
const CONTACT_ENDPOINT = '/contact.php';

const Contact = () => {
  const [formData, setFormData] = useState({ username: '', email: '', message: '', company: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | rate
  const [copied, setCopied] = useState(false);

  const { username, email, message } = formData;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = 'Please enter your name.';
    else if (username.trim().length > 100) next.username = 'Please keep your name under 100 characters.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address, like name@example.com.';
    if (!message.trim()) next.message = 'Please write a short message.';
    else if (message.trim().length > 5000) next.message = 'Please keep your message under 5,000 characters.';
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('sending');
    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: username.trim(),
        email: email.trim(),
        message: message.trim(),
        company: formData.company,
      }),
    })
      .then((res) => res.json().catch(() => ({})).then((body) => ({ res, body })))
      .then(({ res, body }) => {
        if (res.ok && body.ok) setStatus('sent');
        else if (res.status === 429) setStatus('rate');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  };

  const copyEmail = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(person.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <>
      <div className="section__head">
        <p className="eyebrow">Contact</p>
        <h2 className="head-text">Coffee, a chat, or <span>a session at the gym</span></h2>
        <p className="lede">
          I&apos;m open to test and validation roles in automotive, payments and embedded systems. Send a message
          and I&apos;ll reply by email.
        </p>
      </div>

      <div className="contact">
        <div className="contact__cards">
          <div className="contact__card card">
            <HiOutlineMail aria-hidden="true" />
            <div>
              <p className="eyebrow">Email</p>
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </div>
            <button type="button" className="contact__copy" onClick={copyEmail} aria-label="Copy email address">
              <HiOutlineDuplicate aria-hidden="true" />
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="contact__card card">
            <FaLinkedinIn aria-hidden="true" />
            <div>
              <p className="eyebrow">LinkedIn</p>
              <a href={person.links.linkedin} target="_blank" rel="noreferrer">Ray Mark Guevarra</a>
            </div>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="contact__done card" role="status">
            <span className="contact__puff" aria-hidden="true">
              <i /><i /><i /><i /><i /><i />
            </span>
            <h3 className="bold-text">Sent! Thanks for getting in touch.</h3>
            <p className="p-text">I&apos;ll reply to {email.trim()} as soon as I can.</p>
          </div>
        ) : (
          <form className="contact__form card" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                type="text"
                name="username"
                autoComplete="name"
                value={username}
                onChange={handleChangeInput}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'contact-name-err' : undefined}
              />
              {errors.username && <p className="field__err" id="contact-name-err">{errors.username}</p>}
            </div>
            <div className="field">
              <label htmlFor="contact-email">Your email</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={handleChangeInput}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-err' : undefined}
              />
              {errors.email && <p className="field__err" id="contact-email-err">{errors.email}</p>}
            </div>
            <div className="field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows="6"
                value={message}
                onChange={handleChangeInput}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-err' : undefined}
              />
              {errors.message && <p className="field__err" id="contact-message-err">{errors.message}</p>}
            </div>
            {/* Spam trap: hidden from people, bots tend to fill it in. */}
            <div className="field field--trap" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input
                id="contact-company"
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company}
                onChange={handleChangeInput}
              />
            </div>
            {status === 'error' && (
              <p className="field__err" role="alert">
                Your message didn&apos;t go through. Please try again, or email me at {person.email}.
              </p>
            )}
            {status === 'rate' && (
              <p className="field__err" role="alert">
                Too many messages from your connection in the last hour. Please try again later, or email me at
                {' '}
                {person.email}.
              </p>
            )}
            <button type="submit" className="btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send it'}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default AppWrap(MotionWrap(Contact), 'contact', 'section--wall');
