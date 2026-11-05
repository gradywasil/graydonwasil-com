import { useState, type FormEvent } from 'react';
import photo from '../assets/fun/graydon.webp';
import { EMAIL, GITHUB } from '../data/site';

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function Hello() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const ready = name.trim().length > 0 && /.+@.+\..+/.test(email) && msg.trim().length > 3;

  /** Same message as a mailto, so a failed send never costs someone their words. */
  const mailtoHref = `mailto:${EMAIL}?subject=${encodeURIComponent(
    `Message from ${name || 'the website'}`,
  )}&body=${encodeURIComponent(`${msg}\n\nFrom: ${name} (${email})`)}`;

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) { setTouched(true); return; }
    // With no endpoint configured the form hands off to the visitor's mail
    // client rather than pretending to deliver.
    if (!CONTACT_ENDPOINT) { window.location.href = mailtoHref; setStatus('sent'); return; }
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message: msg }),
      });
      if (!res.ok) throw new Error(`Endpoint responded ${res.status}`);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => { setStatus('idle'); setTouched(false); setName(''); setEmail(''); setMsg(''); };

  return (
    <section className="world world-hello" id="hello" aria-labelledby="hello-title">
      <div className="hello-grid">
        <div className="hello-me">
          <figure className="polaroid">
            <img src={photo} alt="Graydon Wasil" width="600" height="840" loading="lazy" />
            <figcaption>the human behind Gurpy</figcaption>
          </figure>
          <div>
            <h2 id="hello-title" className="hello-title">Hi, I&rsquo;m Graydon.</h2>
            <p>
              I became a developer by solving my own problems: a spreadsheet that quietly became an
              app, a Max for Live delay I couldn&rsquo;t find, a database for a toy-car collection
              that outgrew my notes. Now it&rsquo;s Android apps and games.
            </p>
            <p>
              I like the whole stack, the awkward edge cases, and making things people want to poke
              at. Off the clock I&rsquo;m hanging out with my son, negotiating with a sourdough
              starter, and waiting impatiently for Enter the Gungeon&nbsp;2.
            </p>
            <p className="hello-links">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>
        </div>

        <div className="note-card">
          {status === 'sent' ? (
            <div className="note-done" aria-live="polite">
              <h3>Thanks! That&rsquo;s on its way.</h3>
              <p>I read every message and usually reply within a day.</p>
              <button type="button" className="chunky-btn chunky-ink" onClick={reset}>Write another</button>
            </div>
          ) : status === 'error' ? (
            <div className="note-done" aria-live="assertive">
              <h3>That didn&rsquo;t reach my inbox.</h3>
              <p>Your message is still here. Try again, or open it in your email app.</p>
              <div className="note-actions">
                <a className="chunky-btn chunky-orange" href={mailtoHref}>Open in email</a>
                <button type="button" className="chunky-btn chunky-ink" onClick={() => setStatus('idle')}>Try again</button>
              </div>
            </div>
          ) : (
            <form onSubmit={send} noValidate>
              <h3>Say hi</h3>
              <p className="note-sub">Hiring, a project, a bug in one of my games. It all goes to my inbox.</p>
              <div className="note-row">
                <label>
                  <span>Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <label>
                  <span>Email</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </label>
              </div>
              <label>
                <span>Message</span>
                <textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
              </label>
              <div className="note-actions">
                <button type="submit" className="chunky-btn chunky-orange" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send it'}
                </button>
                <span className="note-hint" data-warn={touched && !ready ? 'true' : undefined} aria-live="polite">
                  {touched && !ready ? 'Add your name, email, and a short message.' : 'I read every one.'}
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
