import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, X } from 'lucide-react';

const AGENTS = [
  ['ARCH', '#38bdf8'], ['DATA', '#60a5fa'], ['AI', '#22d3ee'], ['API', '#818cf8'],
  ['UI', '#f472b6'], ['SYS', '#34d399'], ['ML', '#a78bfa'], ['SEC', '#fb7185'],
  ['DBA', '#fbbf24'], ['ETL', '#2dd4bf'], ['UX', '#4ade80'], ['QA', '#e879f9'],
  ['DEV', '#93c5fd'], ['OPS', '#f97316'],
];

const TARGETS = [
  '.hero-word', '.hello', '.hero h1', '.role', '.hero-summary', '.hero-buttons .button',
  '.hero-stats > div', '.portrait-frame', '.portrait-caption', '.specialization', '.location',
  '.section-index', '.section-heading .section-kicker', '.section-heading h2', '.section-heading > p',
  '.about-copy > p', '.about-copy blockquote', '.principle',
  '.feature-topline', '.feature-title-row h3', '.feature-title-row p', '.round-link',
  '.feature-metrics > div', '.flagship-screen', '.architecture-heading', '.layer-tabs button',
  '.layer-panel > div:first-child', '.architecture-diagram', '.secondary-project .project-card-top',
  '.secondary-project .project-preview', '.secondary-project h3', '.secondary-project > p',
  '.secondary-project li', '.secondary-project .tag-row', '.matrix-toolbar', '.matrix-card',
  '.contact-inner .section-kicker', '.contact-inner h2', '.contact-inner > p', '.contact-email',
  '.social-links a', '.contact-status',
].join(',');

export default function BuildTour() {
  const [tourKey, setTourKey] = useState(0);
  const [active, setActive] = useState(true);
  const [building, setBuilding] = useState(false);
  const [sound, setSound] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const speedRef = useRef(speed);
  const soundRef = useRef(sound);
  const audioRef = useRef(null);
  const skipRef = useRef(null);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  const clickTone = () => {
    if (!soundRef.current) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audio = audioRef.current;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 520 + Math.random() * 140;
      gain.gain.setValueAtTime(0.012, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.035);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + 0.04);
    } catch { /* Sound is optional. */ }
  };

  useEffect(() => {
    let disposed = false;
    let finished = false;
    let pumping = false;
    let done = 0;
    let queue = [];
    let cursorIndex = 0;
    let hideTimer;
    const targets = [...document.querySelectorAll(TARGETS)].filter((el, index, all) => all.indexOf(el) === index);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setProgress({ done: 0, total: targets.length });
    setActive(!reducedMotion);
    setBuilding(false);

    if (reducedMotion) {
      setProgress({ done: targets.length, total: targets.length });
      return undefined;
    }

    targets.forEach((el) => el.classList.add('tour-pending'));
    const stage = document.createElement('div');
    stage.className = 'tour-stage';
    stage.setAttribute('aria-hidden', 'true');
    document.body.appendChild(stage);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms / speedRef.current));
    const box = (el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.left + window.scrollX, y: rect.top + window.scrollY, w: rect.width, h: rect.height };
    };
    const add = (className, bounds, html = '') => {
      const node = document.createElement('div');
      node.className = className;
      if (bounds) Object.assign(node.style, { left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.w}px`, height: `${bounds.h}px` });
      node.innerHTML = html;
      stage.appendChild(node);
      return node;
    };
    const cursors = AGENTS.map(([name, color]) => {
      const el = add('tour-cursor', null, `<svg viewBox="0 0 16 20" width="15" height="18"><path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" fill="${color}" stroke="white" stroke-width="1.1"/></svg><span style="background:${color}">${name}</span>`);
      el.style.opacity = '0';
      return { el, color, name };
    });

    const finish = () => {
      if (finished) return;
      finished = true;
      observer.disconnect();
      clearTimeout(hideTimer);
      targets.forEach((el) => {
        el.classList.remove('tour-pending', 'tour-typing', 'tour-in', 'tour-portrait-active');
        delete el.dataset.tourDone;
      });
      stage.remove();
      setBuilding(false);
      setActive(false);
      setProgress((current) => ({ ...current, done: targets.length }));
      window.dispatchEvent(new Event('portfolio:burst'));
    };
    skipRef.current = finish;

    const complete = (el) => {
      if (!el.isConnected || el.dataset.tourDone) return;
      el.dataset.tourDone = 'true';
      el.classList.remove('tour-pending', 'tour-typing');
      setTimeout(() => el.classList.remove('tour-in', 'tour-portrait-active'), 420);
      done += 1;
      setProgress({ done, total: targets.length });
      if (done >= targets.length) finish();
    };

    const build = async (agent, el) => {
      if (finished || disposed || el.dataset.tourDone) return;
      const initialRect = el.getBoundingClientRect();
      if (!el.isConnected || initialRect.bottom < 0 || initialRect.top > window.innerHeight) { complete(el); return; }
      const bounds = box(el);
      if (!bounds.w || !bounds.h) { complete(el); return; }
      const ghost = add('tour-ghost', bounds);
      agent.el.style.opacity = '1';
      agent.el.style.transform = `translate(${bounds.x + Math.min(Math.max(bounds.w - 10, 12), 26)}px,${bounds.y + Math.min(Math.max(bounds.h - 8, 10), 20)}px)`;
      await wait(150);
      if (finished || disposed || el.dataset.tourDone) { ghost.remove(); return; }
      const currentRect = el.getBoundingClientRect();
      if (!el.isConnected || currentRect.bottom < 0 || currentRect.top > window.innerHeight) {
        ghost.remove(); agent.el.style.opacity = '0'; complete(el); return;
      }
      const selection = add('tour-selection', bounds, `<i></i><i></i><i></i><i></i><em>${Math.round(bounds.w)} × ${Math.round(bounds.h)}</em><b style="background:${agent.color}">${agent.name}</b>`);
      selection.style.setProperty('--agent-color', agent.color);
      const isText = /^(H1|H2|H3|H4|P|BLOCKQUOTE|LI)$/.test(el.tagName);
      el.classList.remove('tour-pending');
      el.classList.add(isText ? 'tour-typing' : 'tour-in');
      if (el.classList.contains('portrait-frame')) el.classList.add('tour-portrait-active');
      clickTone();
      await wait(isText ? 350 : 260);
      ghost.remove(); selection.remove(); agent.el.style.opacity = '0';
      if (!finished && !disposed) complete(el);
    };

    const pump = async () => {
      if (pumping || finished || disposed) return;
      pumping = true;
      clearTimeout(hideTimer);
      setBuilding(true);
      while (queue.length && !finished && !disposed) {
        const batch = queue.splice(0, 7);
        await Promise.all(batch.map((el, index) => {
          const agent = cursors[cursorIndex % cursors.length];
          cursorIndex += 1;
          return new Promise((resolve) => setTimeout(() => build(agent, el).then(resolve), index * 35 / speedRef.current));
        }));
      }
      cursors.forEach((cursor) => { cursor.el.style.opacity = '0'; });
      pumping = false;
      if (!finished) hideTimer = setTimeout(() => setBuilding(false), 350);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.tourDone) return;
        observer.unobserve(entry.target);
        if (!queue.includes(entry.target)) queue.push(entry.target);
      });
      queue.sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
      pump();
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.01 });
    targets.forEach((el) => observer.observe(el));

    let ticking = false;
    const onScroll = () => {
      if (ticking || finished) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        targets.forEach((el) => {
          if (el.dataset.tourDone || !el.isConnected || el.getBoundingClientRect().bottom >= 0) return;
          observer.unobserve(el);
          queue = queue.filter((queued) => queued !== el);
          complete(el);
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      disposed = true;
      finished = true;
      clearTimeout(hideTimer);
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      targets.forEach((el) => {
        el.classList.remove('tour-pending', 'tour-typing', 'tour-in', 'tour-portrait-active');
        delete el.dataset.tourDone;
      });
      stage.remove();
      skipRef.current = null;
    };
  }, [tourKey]);

  if (!active) {
    return <button className="tour-replay" onClick={() => { setProgress({ done: 0, total: 0 }); setActive(true); setTourKey((key) => key + 1); }}><RotateCcw size={12} /> Replay build tour</button>;
  }

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return <div className={`tour-hud ${building ? 'is-building' : ''}`} role="status" aria-hidden={!building}>
    <span className="tour-live-dot" />
    <span className="tour-progress-label">Building <b>{String(progress.done).padStart(2, '0')}</b><span> / {progress.total}</span></span>
    <span className="tour-progress"><i style={{ width: `${percent}%` }} /></span>
    <button className="tour-speed" onClick={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 2 : 1)} aria-label="Change tour speed">{speed}×</button>
    <button className="tour-control" onClick={() => setSound((value) => !value)} aria-label={sound ? 'Mute tour sounds' : 'Enable tour sounds'}>{sound ? <Volume2 size={12} /> : <VolumeX size={12} />}</button>
    <button className="tour-skip" onClick={() => skipRef.current?.()} aria-label="Skip construction tour"><X size={12} /></button>
  </div>;
}
