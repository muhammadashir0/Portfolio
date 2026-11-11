import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';

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
  '.feature-metrics > div', '.architecture-heading', '.layer-tabs button', '.layer-panel > div:first-child',
  '.architecture-diagram', '.secondary-project .project-card-top', '.secondary-project h3',
  '.secondary-project > p', '.secondary-project li', '.secondary-project .tag-row',
  '.matrix-toolbar', '.matrix-card', '.contact-inner .section-kicker', '.contact-inner h2',
  '.contact-inner > p', '.contact-email', '.social-links a', '.contact-status',
].join(',');

export default function BuildTour() {
  const [tourKey, setTourKey] = useState(0);
  const [active, setActive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [sound, setSound] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState({ done: 0, total: 0, scanning: true });
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);
  const soundRef = useRef(sound);
  const audioRef = useRef(null);
  const skipRef = useRef(null);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  const clickTone = () => {
    if (!soundRef.current) return;
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const audio = audioRef.current;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 480 + Math.random() * 180;
      gain.gain.setValueAtTime(0.018, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.045);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + 0.05);
    } catch { /* Audio is optional. */ }
  };

  useEffect(() => {
    let disposed = false;
    let finished = false;
    let done = 0;
    const targets = [...document.querySelectorAll(TARGETS)].filter((el, index, all) => all.indexOf(el) === index);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setProgress({ done: 0, total: targets.length, scanning: !reducedMotion });
    setActive(!reducedMotion);
    setPaused(false);

    if (reducedMotion) {
      setProgress({ done: targets.length, total: targets.length, scanning: false });
      return undefined;
    }

    targets.forEach((el) => el.classList.add('tour-pending'));
    const stage = document.createElement('div');
    stage.className = 'tour-stage';
    stage.setAttribute('aria-hidden', 'true');
    document.body.appendChild(stage);

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms / speedRef.current));
    const checkpoint = async () => { while (pausedRef.current && !finished && !disposed) await wait(120); };
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    };
    const add = (className, bounds, html = '') => {
      const node = document.createElement('div');
      node.className = className;
      if (bounds) Object.assign(node.style, { left: `${bounds.x}px`, top: `${bounds.y}px`, width: `${bounds.width || bounds.w}px`, height: `${bounds.height || bounds.h}px` });
      node.innerHTML = html;
      stage.appendChild(node);
      return node;
    };

    const cursors = AGENTS.map(([name, color], index) => {
      const el = add('tour-cursor', null, `<svg viewBox="0 0 16 20" width="16" height="20"><path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" fill="${color}" stroke="white" stroke-width="1.1"/></svg><span style="background:${color}">${name}</span>`);
      el.style.transform = `translate(${window.innerWidth * (0.08 + (index % 7) * 0.12)}px,${window.scrollY + window.innerHeight - 45 - Math.floor(index / 7) * 28}px)`;
      return { el, color, name };
    });

    const updateProgress = () => setProgress({ done, total: targets.length, scanning: false });
    const revealImmediately = (el) => {
      el.classList.remove('tour-pending', 'tour-typing', 'tour-in');
      el.style.opacity = '';
    };

    const build = async (agent, el, agentIndex) => {
      if (finished || disposed || el.dataset.tourDone) { if (el.dataset.tourDone) return; }
      await checkpoint();
      const bounds = box(el);
      if (!bounds.w || !bounds.h) { revealImmediately(el); return; }
      const ghost = add('tour-ghost', bounds);
      agent.el.style.opacity = '1';
      agent.el.style.transform = `translate(${bounds.x + Math.min(Math.max(bounds.w - 10, 12), 30)}px,${bounds.y + Math.min(Math.max(bounds.h - 8, 10), 24)}px)`;
      await wait(280);
      if (finished || disposed) return;
      const selection = add('tour-selection', bounds, `<i></i><i></i><i></i><i></i><em>${Math.round(bounds.w)} × ${Math.round(bounds.h)}</em><b style="background:${agent.color}">${agent.name}</b>`);
      selection.style.setProperty('--agent-color', agent.color);
      const isText = /^(H1|H2|H3|H4|P|BLOCKQUOTE|LI)$/.test(el.tagName);
      el.classList.remove('tour-pending');
      el.classList.add(isText ? 'tour-typing' : 'tour-in');
      if (el.classList.contains('portrait-frame')) el.classList.add('tour-portrait-active');
      clickTone();
      await wait(isText ? 520 : 390);
      const mark = add('tour-mark', { x: bounds.x + bounds.w - 6, y: bounds.y - 6, width: 12, height: 12 });
      mark.style.color = agent.color;
      ghost.remove(); selection.remove();
      setTimeout(() => mark.remove(), 800);
      setTimeout(() => { el.classList.remove('tour-in', 'tour-typing', 'tour-portrait-active'); }, 650);
      el.dataset.tourDone = 'true';
      done += 1;
      updateProgress();
      if (agentIndex % 3 === 0) await wait(70);
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      targets.forEach((el) => { revealImmediately(el); delete el.dataset.tourDone; });
      stage.remove();
      setActive(false);
      setPaused(false);
      setProgress((p) => ({ ...p, done: targets.length, scanning: false }));
      window.dispatchEvent(new Event('portfolio:burst'));
    };
    skipRef.current = finish;

    (async () => {
      await wait(550);
      setProgress({ done: 0, total: targets.length, scanning: false });
      let cursorIndex = 0;
      for (let i = 0; i < targets.length; i += 4) {
        if (finished || disposed) break;
        await checkpoint();
        const batch = targets.slice(i, i + 4).filter((el) => !el.dataset.tourDone);
        if (!batch.length) continue;
        const first = batch[0];
        const rect = first.getBoundingClientRect();
        if (rect.top < 105 || rect.bottom > window.innerHeight - 105) {
          first.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await wait(520);
        }
        await Promise.all(batch.map((el) => {
          const agent = cursors[cursorIndex % cursors.length];
          const currentIndex = cursorIndex;
          cursorIndex += 1;
          return build(agent, el, currentIndex);
        }));
      }
      if (!finished && !disposed) {
        document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await wait(650);
        finish();
      }
    })();

    return () => {
      disposed = true;
      finished = true;
      targets.forEach((el) => { revealImmediately(el); delete el.dataset.tourDone; });
      stage.remove();
      skipRef.current = null;
    };
  }, [tourKey]);

  if (!active) {
    return <button className="tour-replay" onClick={() => { setProgress({ done: 0, total: 0, scanning: true }); setActive(true); setTourKey((key) => key + 1); }}><RotateCcw size={13} /> Replay build tour</button>;
  }

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return <div className="tour-hud" role="status" aria-live="polite">
    <div className="tour-agents" aria-hidden="true">{AGENTS.slice(0, 7).map(([name, color]) => <i key={name} style={{ background: color }}>{name[0]}</i>)}</div>
    <strong>14</strong><span>agents</span><span className="tour-separator" />
    <span className="tour-progress-label">{progress.scanning ? 'Scanning page…' : <><b>{progress.done}</b> / {progress.total} layers</>}</span>
    <span className="tour-progress"><i style={{ width: `${percent}%` }} /></span>
    <button className="tour-control" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Resume tour' : 'Pause tour'}>{paused ? <Play size={12} /> : <Pause size={12} />}</button>
    <button className="tour-speed" onClick={() => setSpeed((value) => value === 1 ? 1.5 : value === 1.5 ? 2 : 1)} aria-label="Change tour speed">{speed}×</button>
    <button className="tour-control tour-sound" onClick={() => setSound((value) => !value)} aria-label={sound ? 'Mute tour sounds' : 'Enable tour sounds'}>{sound ? <Volume2 size={13} /> : <VolumeX size={13} />}<span>{sound ? 'Sound on' : 'Tap for sound'}</span></button>
    <button className="tour-skip" onClick={() => skipRef.current?.()}>Skip <X size={12} /></button>
  </div>;
}
