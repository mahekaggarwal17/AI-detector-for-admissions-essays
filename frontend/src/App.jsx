import React, { useState, useEffect } from 'react';
import { Sparkles, Database, BarChart3, GraduationCap, ExternalLink } from 'lucide-react';
import DetectorView from './components/DetectorView';
import DatasetView from './components/DatasetView';
import EvaluationView from './components/EvaluationView';

const TABS = [
  { id: 'detector',   label: 'Live Detector',      Icon: Sparkles  },
  { id: 'dataset',    label: 'Corpus',              Icon: Database  },
  { id: 'evaluation', label: 'Benchmark',           Icon: BarChart3 },
];

export default function App() {
  const [tab, setTab]             = useState('detector');
  const [samples, setSamples]     = useState([]);
  const [datasetInfo, setDataset] = useState(null);
  const [evalReport, setEval]     = useState(null);
  const [online, setOnline]       = useState(null); // null = unknown

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/samples')
      .then(r => r.json())
      .then(d => { setSamples(d.samples || []); setOnline(true); })
      .catch(() => setOnline(false));

    fetch('http://127.0.0.1:8000/api/dataset')
      .then(r => r.json()).then(setDataset).catch(() => {});

    fetch('http://127.0.0.1:8000/api/evaluation')
      .then(r => r.json()).then(setEval).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Navbar ── */}
      <nav className="nav">
        <div className="nav-inner">

          {/* Logo */}
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <GraduationCap size={17} color="#fff" />
            </div>
            <span className="nav-logo-name">VERITAS</span>
          </div>

          {/* Tabs */}
          <div className="nav-tabs">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`nav-tab ${tab === id ? 'active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="nav-status">
            <span
              className="status-dot"
              style={{
                background: online === null ? '#a1a1aa' : online ? '#22c55e' : '#ef4444',
              }}
            />
            {online === null ? 'Connecting…' : online ? 'Engine online' : 'Offline'}
          </div>
        </div>
      </nav>

      {/* ── Hero (only on Detector tab) ── */}
      {tab === 'detector' && (
        <div className="hero anim-fade-up">
          <div className="hero-eyebrow">Statistical NLP · Zero LLM Wrappers</div>
          <h1 className="hero-title">
            Detect AI in<br />Admissions Essays.<br />
            <em>With proof.</em>
          </h1>
          <p className="hero-sub">
            Pure statistical engine using Goh-Barabasi burstiness, token perplexity,
            lexical entropy, and 150+ admissions cliché markers — with built-in
            ESL non-native safeguard.
          </p>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-value mono">92.7%</div>
              <div className="hero-stat-label">Test accuracy</div>
            </div>
            <div className="hero-stat-divider" />
            <div>
              <div className="hero-stat-value mono">4.0%</div>
              <div className="hero-stat-label">ESL false-positive rate</div>
            </div>
            <div className="hero-stat-divider" />
            <div>
              <div className="hero-stat-value mono">275</div>
              <div className="hero-stat-label">Essays in corpus</div>
            </div>
            <div className="hero-stat-divider" />
            <div>
              <div className="hero-stat-value mono">0.962</div>
              <div className="hero-stat-label">ROC-AUC score</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        {tab === 'detector'   && <DetectorView samples={samples} />}
        {tab === 'dataset'    && <DatasetView datasetInfo={datasetInfo} />}
        {tab === 'evaluation' && <EvaluationView evalReport={evalReport} />}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="nav-logo-icon" style={{ width: 26, height: 26 }}>
              <GraduationCap size={14} color="#fff" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg-2)' }}>
              VERITAS — Admissions Essay Statistical Detector
            </span>
          </div>
          <div className="footer-links">
            <span>100% Statistical NLP</span>
            <span>ESL-Safe</span>
            <a
              href="https://github.com/mahekaggarwal17/AI-detector-for-admissions-essays"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)' }}
            >
              GitHub <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
