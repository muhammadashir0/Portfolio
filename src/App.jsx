import { useEffect, useRef, useState } from 'react';
import VectorParticleCanvas from './components/VectorParticleCanvas.jsx';
import BuildTour from './components/BuildTour.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import {
  ArrowDown, ArrowUpRight, Check, ChevronRight,
  Copy, Database, Download, ExternalLink, Github,
  Linkedin, MapPin, Menu, Search, ShieldCheck, X,
} from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL;

const LINKS = {
  github: 'https://github.com/muhammadashir0',
  linkedin: 'https://de.linkedin.com/in/muhammadashir1',
  email: 'ashirali0998@gmail.com',
  profile: 'https://datascienceportfol.io/ashirali0998',
};

const navItems = [
  ['01', 'Home', 'home'],
  ['02', 'About', 'about'],
  ['03', 'Flagships', 'projects'],
  ['04', 'Matrix', 'matrix'],
  ['05', 'Contact', 'contact'],
];

const layers = [
  {
    id: '01', name: 'Signed mandate', subtitle: 'Authority & identity',
    title: 'Cryptographically bounded authority',
    text: 'A human or organization signs a mandate that defines exactly what an agent may do. Agent identity binding prevents that authority from being reused by another actor.',
    tags: ['HMAC prototype', 'Agent binding', 'Expiry controls'],
  },
  {
    id: '02', name: 'Policy engine', subtitle: 'Deterministic controls',
    title: 'Every intent meets explicit policy',
    text: 'Policy-as-code verifies value, cumulative spend, currency, geography, merchant, purpose, expiry, and velocity before any authorization can be issued.',
    tags: ['Fail closed', 'Scope checks', 'Replay safety'],
  },
  {
    id: '03', name: 'Human challenge', subtitle: 'Oversight by design',
    title: 'Higher-risk intent pauses for approval',
    text: 'When a payment crosses an approval threshold, the exact intent is challenged rather than silently authorized. Automation never outruns accountable human judgment.',
    tags: ['Approval threshold', 'Intent bound', 'Human oversight'],
  },
  {
    id: '04', name: 'Audit journal', subtitle: 'Verifiable evidence',
    title: 'A tamper-evident record of every decision',
    text: 'Authorizations, denials, and approval challenges enter a hash-chained journal. Idempotency keys return the original decision and protect against duplicate execution.',
    tags: ['Hash chain', 'Reason codes', 'Idempotency'],
  },
];

const projects = [
  {
    id: '01', category: 'fintech', label: 'Agentic finance',
    title: 'MandatePay', subtitle: 'Authorization firewall for agentic payments',
    description: 'Signed mandates, deterministic policy, human approval, and verifiable audit events for machine-initiated payments.',
    stack: ['Python', 'MCP', 'Policy engine'],
    url: 'https://github.com/muhammadashir0/mandatepay', type: 'github',
  },
  {
    id: '02', category: 'ai', label: 'Responsible AI',
    title: 'RegLedger AI', subtitle: 'Evidence-first compliance intelligence',
    description: 'Explainable transaction triage, grounded policy retrieval, and a tamper-evident audit journal with human oversight.',
    stack: ['Python', 'RAG', 'Audit chain'],
    url: 'https://github.com/muhammadashir0/regledger-ai', type: 'github',
  },
  {
    id: '03', category: 'ai', label: 'Graph machine learning',
    title: 'Europulse', subtitle: 'Fraud detection for European FinTech',
    description: 'A dual-stream fraud architecture combining graph attention networks, behavioral signals, and explainable reason codes.',
    stack: ['PyTorch', 'GAT', 'FastAPI'],
    url: 'https://github.com/muhammadashir0/europulse-fraud-guard', type: 'github',
  },
  {
    id: '04', category: 'ai', label: 'AI assurance',
    title: 'CertifAI', subtitle: 'Automated ML model auditing',
    description: 'A model-auditing concept for evaluating fairness, explainability, robustness, and performance against responsible-AI benchmarks.',
    stack: ['TensorFlow', 'XAI', 'Scikit-learn'],
    url: 'https://www.datascienceportfol.io/ashirali0998/projects/0', type: 'external',
  },
  {
    id: '05', category: 'data', label: 'Exploratory analysis',
    title: 'Netflix EDA', subtitle: 'Content patterns through data',
    description: 'Data cleaning, analysis, and visualization exploring content formats, production countries, release years, and audience ratings.',
    stack: ['Pandas', 'NumPy', 'Matplotlib'],
    url: 'https://github.com/muhammadashir0/netflix-eda', type: 'github',
  },
  {
    id: '06', category: 'data', label: 'Web engineering',
    title: 'Saith Hanif Rice Mills', subtitle: 'A complete business web presence',
    description: 'A responsive company website designed and built for Saith Hanif Rice Mills in Jhabran, Pakistan.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    url: 'https://muhammadashir0.github.io/jhabran-rice-mill/', type: 'external',
  },
];

const filters = [
  ['all', 'All systems'], ['ai', 'AI & ML'], ['fintech', 'FinTech'], ['data', 'Data & web'],
];

function Brand() {
  return <a className="brand" href="#home" aria-label="Muhammad Ashir, back to home">
    <span className="brand-mark">MA</span>
    <span className="brand-copy">AI SYSTEMS<br />DATA SCIENCE</span>
  </a>;
}

function SectionHeading({ eyebrow, title, description, index }) {
  return <div className="section-heading reveal">
    <div className="section-kicker"><span>{index}</span>{eyebrow}</div>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>;
}

function ProjectLink({ project, children, className = '' }) {
  return <a className={className} href={project.url} target="_blank" rel="noreferrer">
    {children}
    <span className="sr-only"> (opens in a new tab)</span>
  </a>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeLayer, setActiveLayer] = useState(0);
  const [filter, setFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const copyTimer = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('js');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    navItems.forEach(([, , id]) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${LINKS.email}`;
    }
  };

  const currentLayer = layers[activeLayer];
  const filteredProjects = filter === 'all' ? projects : projects.filter((p) => p.category === filter);

  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <VectorParticleCanvas />
    <BuildTour />
    <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} projects={projects} layers={layers} />
    <div className="noise" aria-hidden="true" />
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <Brand />
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
          <div className="mobile-nav-head"><Brand /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
          {navItems.map(([number, label, id]) => <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            <span>{number}</span>{label}
          </a>)}
          <a className="mobile-resume" href={`${BASE_URL}muhammad-ashir-cv.pdf`} download>Download CV <Download size={16} /></a>
        </nav>
        <div className="header-actions">
          <span className="availability"><i /> Available for opportunities</span>
          <button className="command-trigger" onClick={() => setSearchOpen(true)} aria-label="Open command search"><Search size={13} /><span>SEARCH</span><kbd>⌘K</kbd></button>
          <a className="cv-link" href={`${BASE_URL}muhammad-ashir-cv.pdf`} download>CV <Download size={13} /></a>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu /></button>
        </div>
      </div>
    </header>

    <main id="main">
      <section id="home" className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-word" aria-hidden="true">PORTFOLIO</div>
        <div className="hero-grid">
          <div className="hero-intro">
            <div className="hello">Hello, I’m</div>
            <h1 id="hero-title">ASHIR<span>.</span></h1>
            <div className="role"><span /> AI SYSTEMS ENGINEER & DATA SCIENTIST</div>
            <p className="hero-summary">Engineering responsible AI and resilient financial systems—from grounded LLM workflows to cryptographic guardrails for autonomous payments.</p>
            <div className="hero-buttons">
              <a className="button button-primary" href="#contact">Initiate contact <ArrowUpRight size={16} /></a>
              <a className="button button-ghost" href="#projects">Explore architecture <ArrowDown size={15} /></a>
            </div>
            <div className="hero-stats">
              <div><strong>02<span>+</span></strong><span>Years<br />experience</span></div>
              <div><strong>40<span>%</span></strong><span>Database<br />performance</span></div>
              <div><strong>M<span>.</span>Sc</strong><span>Data Science<br />candidate</span></div>
            </div>
          </div>

          <div className="portrait-wrap">
            <div className="portrait-offset" aria-hidden="true" />
            <div className="portrait-frame">
              <img src={`${BASE_URL}muhammad-ashir-full.png`} alt="Muhammad Ashir, Data Scientist and AI Systems Engineer" />
              <div className="portrait-scan" aria-hidden="true" />
              <span className="corner top-left" /><span className="corner top-right" />
              <span className="corner bottom-left" /><span className="corner bottom-right" />
            </div>
            <div className="portrait-caption"><span><i /> SYSTEM ONLINE</span><span>ILMENAU / DE</span></div>
          </div>

          <div className="specializations" aria-label="Core specializations">
            {[
              ['01', 'Financial AI', 'Explainable risk, RAG systems, and accountable decision support.'],
              ['02', 'Agentic infrastructure', 'Signed authority, policy-as-code, and secure MCP tooling.'],
              ['03', 'Data engineering', 'Oracle, ETL optimization, and reliable analytical workflows.'],
            ].map(([n, title, text]) => <div className="specialization" key={n}>
              <span className="spec-number">{n}.</span><div><h3>{title}</h3><p>{text}</p></div>
            </div>)}
            <div className="location"><MapPin size={13} /> Germany <span>·</span> Open to Europe</div>
          </div>
        </div>
      </section>

      <section id="about" className="about section-shell section-space">
        <div className="section-index">// 01.00 SEC_ABOUT <span>[ 01 / 05 ]</span></div>
        <SectionHeading index="01 /" eyebrow="Engineer profile" title="Background & Philosophy" />
        <div className="about-grid">
          <div className="about-copy reveal">
            <p>I’m <strong>Muhammad Ashir</strong>—a data scientist and software engineer working where machine intelligence meets regulated financial infrastructure. My path spans enterprise banking systems in Pakistan and advanced data science in Germany.</p>
            <p>At <strong>CubeBytes Solutions</strong> and <strong>Bootlogix</strong>, I optimized Oracle-based systems, redesigned ETL workflows, supported KYC modernization, and improved database performance by <strong>40%</strong>. Today, my M.Sc. at <strong>Technische Universität Ilmenau</strong> deepens my focus on machine learning, statistical modeling, and data-driven systems.</p>
            <blockquote>“Build intelligence that can explain itself, infrastructure that fails safely, and automation that keeps humans accountable.”</blockquote>
          </div>
          <div className="principles reveal">
            {[
              ['01', 'Evidence before output', 'Ground every score and generated answer in inspectable evidence.'],
              ['02', 'Deterministic guardrails', 'Make authority explicit, testable, and bounded by design.'],
              ['03', 'Human accountability', 'Use automation to strengthen—not obscure—responsible decisions.'],
            ].map(([n, title, text]) => <div className="principle" key={n}>
              <span>{n}</span><div><h3>{title}</h3><p>{text}</p></div>
            </div>)}
          </div>
        </div>

      </section>

      <section id="projects" className="projects section-shell section-space">
        <SectionHeading index="02 /" eyebrow="Architectural showcase" title="Flagship Deployments" description="Open-source systems designed around real constraints: delegated authority, explainable decisions, and resilient data workflows." />
        <article className="feature-project reveal">
          <div className="feature-topline"><span className="project-label"><i /> CORE INFRASTRUCTURE</span><span>PROJECT_001 / 2026</span></div>
          <div className="feature-title-row">
            <div><h3>MandatePay <span>— Agent Payment Authorization Firewall</span></h3><p>A research-grade control plane between AI agents and payment rails. Every machine-initiated payment is checked against signed human authority before execution.</p></div>
            <a href="https://github.com/muhammadashir0/mandatepay" target="_blank" rel="noreferrer" className="round-link" aria-label="View MandatePay on GitHub"><Github /></a>
          </div>
          <div className="feature-metrics">
            {[['01', 'Signed human mandate'], ['08+', 'Deterministic policy dimensions'], ['04', 'Layered control architecture'], ['100%', 'Fail-closed philosophy']].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
          <div className="architecture">
            <div className="architecture-heading"><span>AUTHORIZATION STACK</span><small>Select a layer to inspect</small></div>
            <div className="layer-tabs" role="tablist" aria-label="MandatePay architecture layers">
              {layers.map((layer, index) => <button key={layer.id} role="tab" aria-selected={activeLayer === index} aria-controls="layer-panel" className={activeLayer === index ? 'active' : ''} onClick={() => setActiveLayer(index)}>
                <span>L{layer.id}</span>{layer.name}<ChevronRight size={13} />
              </button>)}
            </div>
            <div className="layer-panel" id="layer-panel" role="tabpanel" key={currentLayer.id}>
              <div><span className="mono-label">LAYER {currentLayer.id} // {currentLayer.subtitle}</span><h4>{currentLayer.title}</h4><p>{currentLayer.text}</p><div className="tag-row">{currentLayer.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
              <div className={`architecture-diagram diagram-${activeLayer}`} aria-hidden="true">
                <div className="node node-a"><span>{activeLayer === 0 ? 'HUMAN' : activeLayer === 1 ? 'INTENT' : activeLayer === 2 ? 'RISK' : 'EVENT'}</span></div>
                <div className="flow-line"><i /><i /><i /></div>
                <div className="node node-b"><ShieldCheck size={24} /><span>{activeLayer === 2 ? 'APPROVE' : 'VERIFY'}</span></div>
                <div className="flow-line second"><i /><i /><i /></div>
                <div className="node node-c"><span>{activeLayer === 3 ? 'CHAIN' : 'DECISION'}</span></div>
              </div>
            </div>
          </div>
        </article>

        <div className="secondary-projects">
          <article className="secondary-project reveal">
            <div className="project-card-top"><span className="project-label">02 / RESPONSIBLE AI</span><a href="https://github.com/muhammadashir0/regledger-ai" target="_blank" rel="noreferrer" aria-label="View RegLedger AI on GitHub"><Github size={20} /></a></div>
            <h3>RegLedger AI <span>— Compliance copilot</span></h3>
            <p>Evidence-first financial-crime intelligence that connects transparent risk signals, policy-grounded retrieval, and a hash-chained audit journal.</p>
            <ul><li>Explainable 0–100 transaction risk signals</li><li>Provider-optional LLM with deterministic offline fallback</li><li>Cited policy evidence and human-readable controls</li></ul>
            <div className="mini-workflow" aria-label="RegLedger AI workflow"><span>TRANSACTION</span><ChevronRight /><span>EVIDENCE</span><ChevronRight /><span>HUMAN REVIEW</span></div>
            <div className="tag-row"><span>Python</span><span>RAG</span><span>Audit chain</span></div>
          </article>
          <article className="secondary-project reveal">
            <div className="project-card-top"><span className="project-label">03 / GRAPH INTELLIGENCE</span><a href="https://github.com/muhammadashir0/europulse-fraud-guard" target="_blank" rel="noreferrer" aria-label="View Europulse Fraud Guard on GitHub"><Github size={20} /></a></div>
            <h3>Europulse <span>— Fraud graph engine</span></h3>
            <p>A clear-box fraud-detection concept for European FinTech, combining relational intelligence and behavioral signals to expose coordinated attacks.</p>
            <ul><li>Graph Attention Networks for mule-network detection</li><li>Behavioral stream for coercion and APP-fraud signals</li><li>Human-readable XAI reason codes</li></ul>
            <div className="graph-visual" aria-hidden="true"><i /><i /><i /><i /><i /><span /><span /><span /><span /></div>
            <div className="tag-row"><span>PyTorch</span><span>GAT</span><span>FastAPI</span></div>
          </article>
          <article className="secondary-project reveal">
            <div className="project-card-top"><span className="project-label">04 / AI ASSURANCE</span><a href="https://www.datascienceportfol.io/ashirali0998/projects/0" target="_blank" rel="noreferrer" aria-label="View CertifAI case study"><ExternalLink size={19} /></a></div>
            <h3>CertifAI <span>— Model auditing</span></h3>
            <p>An automated auditing platform for evaluating machine-learning models against ethical and performance benchmarks.</p>
            <ul><li>Fairness and bias evaluation across sensitive attributes</li><li>Explainability and model-stability assessment</li><li>Robustness checks for critical AI systems</li></ul>
            <div className="audit-visual" aria-hidden="true"><span>FAIRNESS</span><i /><span>XAI</span><i /><span>ROBUSTNESS</span></div>
            <div className="tag-row"><span>TensorFlow</span><span>XAI</span><span>Scikit-learn</span></div>
          </article>
        </div>
      </section>

      <section id="matrix" className="matrix section-shell section-space">
        <SectionHeading index="03 /" eyebrow="Engineering index" title="The Systems Matrix" description="A selected index of AI assurance, financial infrastructure, data analysis, and web engineering work." />
        <div className="matrix-toolbar reveal">
          <div className="filters" role="group" aria-label="Filter projects">{filters.map(([id, label]) => <button key={id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)} aria-pressed={filter === id}>{label}<span>{id === 'all' ? projects.length : projects.filter((p) => p.category === id).length}</span></button>)}</div>
          <span className="matrix-count">SHOWING {String(filteredProjects.length).padStart(2, '0')} SYSTEMS</span>
        </div>
        <div className="project-grid" aria-live="polite">
          {filteredProjects.map((project) => <ProjectLink project={project} className="matrix-card" key={project.id}>
            <div className="matrix-card-top"><span>{project.label}</span><span>SYS_{project.id}</span></div>
            <div className="matrix-card-icon">{project.type === 'github' ? <Github size={20} /> : <ExternalLink size={20} />}<ArrowUpRight size={17} /></div>
            <h3>{project.title}</h3><h4>{project.subtitle}</h4><p>{project.description}</p>
            <div className="tag-row">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </ProjectLink>)}
        </div>

      </section>

      <section id="contact" className="contact section-shell section-space">
        <div className="contact-inner reveal">
          <div className="contact-cross" aria-hidden="true">+</div>
          <span className="section-kicker"><span>05 /</span> Direct channel</span>
          <h2>Let’s Architect Something<br /><span>Extraordinary.</span></h2>
          <p>Interested in responsible AI, financial infrastructure, or data-driven products? I’m open to working student roles, internships, and ambitious collaborations.</p>
          <div className="contact-email"><a href={`mailto:${LINKS.email}`}>{LINKS.email}</a><button className="button button-primary" onClick={copyEmail}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy email'}</button></div>
          <div className="social-links">
            <a href={LINKS.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub <ArrowUpRight size={13} /></a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn <ArrowUpRight size={13} /></a>
            <a href={LINKS.profile} target="_blank" rel="noreferrer"><Database size={17} /> Data portfolio <ArrowUpRight size={13} /></a>
          </div>
          <div className="contact-status"><i /> CURRENTLY BASED IN ILMENAU, GERMANY <span>·</span> OPEN TO COLLABORATION</div>
        </div>
      </section>
    </main>

    <footer className="site-footer section-shell"><Brand /><p>© {new Date().getFullYear()} Muhammad Ashir. Designed with intent. Built with React.</p><a href="#home">Back to top <ArrowUpRight size={14} /></a></footer>
  </>;
}

export default App;
