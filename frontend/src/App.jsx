import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Cpu,
  Activity,
  Zap,
} from 'lucide-react';

import DetectorView from './components/DetectorView';
import DatasetView from './components/DatasetView';
import EvaluationView from './components/EvaluationView';

const TICKER_ITEMS = [
  { icon: '⚡', label: '92.7% Accuracy' },
  { icon: '🛡️', label: '4.0% ESL False-Positive Rate' },
  { icon: '🔍', label: '150+ AI Phrase Markers' },
  { icon: '📊', label: '275 Essay Corpus' },
  { icon: '🧮', label: 'Zero LLM API Wrappers' },
  { icon: '🎓', label: 'Admissions Domain-Tuned' },
  { icon: '🔬', label: 'Sentence-Level Explainability' },
  { icon: '⚡', label: '93.8% Precision' },
  { icon: '📈', label: '0.962 ROC-AUC' },
  { icon: '🌍', label: 'ESL Non-Native Safeguard' },
];

const TABS = [
  { id: 'detector',    label: 'AI Detector',       Icon: Sparkles  },
  { id: 'dataset',     label: 'Corpus & Data',      Icon: Database  },
  { id: 'evaluation',  label: 'Honest Evaluation',  Icon: BarChart3 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [samples, setSamples] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [evalReport, setEvalReport] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/samples')
      .then(r => r.json()).then(d => setSamples(d.samples || []))
      .catch(() => {});
    fetch('http://127.0.0.1:8000/api/dataset')
      .then(r => r.json()).then(d => setDatasetInfo(d))
      .catch(() => {});
    fetch('http://127.0.0.1:8000/api/evaluation')
      .then(r => r.json()).then(d => setEvalReport(d))
      .catch(() => {});
  }, []);

  // Duplicated ticker items for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* ── Animated Background ── */}
      <div className="app-bg">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(2, 4, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        {/* Stat Ticker */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          padding: '6px 0',
          overflow: 'hidden',
        }}>
          <div className="ticker-wrapper">
            <div className="ticker-track" style={{ gap: '40px' }}>
              {tickerItems.map((item, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  fontSize: '0.72rem', color: 'var(--text-muted)',
                  fontWeight: 500, letterSpacing: '0.02em',
                }}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.08)', marginLeft: '12px' }}>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Nav Row */}
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          padding: '0 24px',
          height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <div className="animate-pulse-ring" style={{
              width: '42px', height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4)',
              padding: '2px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '10px',
                background: 'var(--bg-void)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap size={19} style={{ color: '#06b6d4' }} />
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.2rem', fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '10px',
                letterSpacing: '-0.01em',
              }}>
                <span>VERITAS</span>
                <span style={{
                  fontSize: '0.68rem', fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, padding: '2px 9px',
                  borderRadius: '9999px',
                  background: 'rgba(79,70,229,0.15)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.3)',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}>
                  AI Admissions Detector
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Statistical · Explainable · ESL-Safe
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Right Status Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '0.72rem', color: '#34d399', fontWeight: 600,
            flexShrink: 0,
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              animation: 'pulseRing 2s ease-in-out infinite',
            }} />
            Engine Active
          </div>
        </div>
      </header>

      {/* ── Page Hero (detector tab only) ── */}
      {activeTab === 'detector' && (
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          padding: '40px 24px 20px',
          textAlign: 'center',
          animation: 'slideUp 0.5s ease both',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', borderRadius: '9999px',
            background: 'rgba(79,70,229,0.1)',
            border: '1px solid rgba(99,102,241,0.25)',
            fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            marginBottom: '18px',
          }}>
            <Zap size={12} />
            <span>Statistical Language Model Engine — No LLM API Wrappers</span>
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800, letterSpacing: '-0.025em',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 40%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.15, marginBottom: '16px',
          }}>
            Detect AI in Admissions Essays.<br />
            <span style={{ fontWeight: 700, opacity: 0.85 }}>Sentence by Sentence.</span>
          </h1>
          <p style={{
            maxWidth: '560px', margin: '0 auto',
            color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7,
          }}>
            Token perplexity, burstiness index, syntactic uniformity, and 150+ AI phrase markers —
            all computed locally. Click any highlighted sentence to inspect the evidence.
          </p>
        </div>
      )}

      {/* ── Main Content ── */}
      <main style={{
        maxWidth: '1320px', margin: '0 auto',
        padding: activeTab === 'detector' ? '16px 24px' : '32px 24px',
      }}>
        {activeTab === 'detector' && <DetectorView samples={samples} />}
        {activeTab === 'dataset' && <DatasetView datasetInfo={datasetInfo} />}
        {activeTab === 'evaluation' && <EvaluationView evalReport={evalReport} />}
      </main>

      {/* ── Footer ── */}
      <footer style={{
        marginTop: '60px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '28px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.04em',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: 'rgba(99,102,241,0.6)', fontWeight: 700 }}>VERITAS</span>
          <span>·</span>
          <span>Statistical AI Detection Engine</span>
          <span>·</span>
          <span>Zero LLM Wrappers</span>
          <span>·</span>
          <span>ESL Safeguards Active</span>
          <span>·</span>
          <a href="https://veritas-theta-cyan.vercel.app" target="_blank" rel="noreferrer"
            style={{ color: 'rgba(99,102,241,0.7)', textDecoration: 'none' }}>
            Live Demo ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
