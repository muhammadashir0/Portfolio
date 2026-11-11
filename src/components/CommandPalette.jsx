import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FileDown, Search, X } from 'lucide-react';

export default function CommandPalette({ open, onClose, projects, layers }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const items = useMemo(() => [
    { type: 'SECTION', title: 'Background & Philosophy', description: 'Profile, experience, and engineering principles', href: '#about' },
    { type: 'SECTION', title: 'Flagship Deployments', description: 'MandatePay, RegLedger AI, Europulse, and CertifAI', href: '#projects' },
    { type: 'SECTION', title: 'The Systems Matrix', description: 'Filter the complete engineering index', href: '#matrix' },
    { type: 'SECTION', title: 'Direct Contact', description: 'Email, GitHub, LinkedIn, and data portfolio', href: '#contact' },
    { type: 'DOCUMENT', title: 'Download Muhammad Ashir’s CV', description: 'Professional experience, education, and selected projects', href: `${import.meta.env.BASE_URL}muhammad-ashir-cv.pdf`, download: true },
    ...layers.map((layer) => ({ type: 'ARCHITECTURE', title: layer.title, description: layer.text, href: '#projects' })),
    ...projects.map((project) => ({ type: 'SYSTEM', title: project.title, description: project.description, href: project.url, external: true })),
  ], [projects, layers]);

  if (!open) return null;
  const normalized = query.trim().toLowerCase();
  const results = items.filter((item) => !normalized || `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(normalized)).slice(0, 8);
  const select = (item) => {
    onClose();
    if (item.external) { window.open(item.href, '_blank', 'noopener,noreferrer'); return; }
    if (item.download) { const link = document.createElement('a'); link.href = item.href; link.download = ''; link.click(); return; }
    document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="command-modal" role="dialog" aria-modal="true" aria-label="Command search">
      <div className="command-input"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search systems, layers, sections…" aria-label="Search portfolio" /><button onClick={onClose} aria-label="Close command search"><X size={17} /></button></div>
      <div className="command-results">
        {results.length ? results.map((item, index) => <button key={`${item.title}-${index}`} onClick={() => select(item)}>
          <div><span>{item.type}</span><strong>{item.title}</strong><p>{item.description}</p></div>
          {item.download ? <FileDown size={16} /> : <ArrowRight size={16} />}
        </button>) : <div className="command-empty">NO MATCHING SYSTEMS FOR “{query}”</div>}
      </div>
      <div className="command-footer"><span>[ESC] CLOSE · [CTRL / ⌘ K] TOGGLE</span><span>MA COMMAND INDEX</span></div>
    </div>
  </div>;
}
