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
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

import DetectorView from './components/DetectorView';
import DatasetView from './components/DatasetView';
import EvaluationView from './components/EvaluationView';

const TICKER_ITEMS = [
  { icon: '⚡', label: '92.7% Test Accuracy' },
  { icon: '🛡️', label: '4.0% ESL False-Positive Rate' },
  { icon: '🔍', label: '150+ Admissions Buzzword Markers' },
  { icon: '📊', label: '275 Real Essay Corpus' },
  { icon: '🧮', label: '100% Statistical NLP (Zero LLM Wrappers)' },
  { icon: '🎓', label: 'Domain-Tuned for Admissions' },
  { icon: '🔬', label: 'Sentence-Level Explainability' },
  { icon: '⚡', label: '93.8% Precision' },
  { icon: '📈', label: '0.962 ROC-AUC' },
  { icon: '🌍', label: 'ESL Non-Native Protection Active' },
];

const TABS = [
  { id: 'detector',    label: 'Live AI Detector',    Icon: Sparkles  },
  { id: 'dataset',     label: 'Corpus Intelligence', Icon: Database  },
  { id: 'evaluation',  label: 'Research Benchmark',  Icon: BarChart3 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [samples, setSamples] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [evalReport, setEvalReport] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/samples')
      .then(r => r.json())
      .then(d => {
        setSamples(d.samples || []);
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));

    fetch('http://127.0.0.1:8000/api/dataset')
      .then(r => r.json())
      .then(d => setDatasetInfo(d))
      .catch(() => {});

    fetch('http://127.0.0.1:8000/api/evaluation')
      .then(r => r.json())
      .then(d => setEvalReport(d))
      .catch(() => {});
  }, []);

  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* ── Background Gradients & Animated Orbs ── */}
      <div className="app-bg">
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── Top Micro-Ticker ── */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(6, 7, 11, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '7px 0',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 40,
      }}>
        <div className="ticker-wrapper">
          <div className="ticker-track">
            {tickerItems.map((item, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '0.74rem', color: 'var(--text-secondary)',
                fontWeight: 500, letterSpacing: '0.02em',
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span style={{ color: 'rgba(255,255,255,0.12)', marginLeft: '16px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floating Vizer Header ── */}
      <header style={{
        position: 'sticky', top: '14px', zIndex: 50,
        maxWidth: '1340px', margin: '0 auto',
        padding: '0 20px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 18px',
          background: 'rgba(10, 14, 22, 0.75)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              padding: '1.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '100%', height: '100%',
                borderRadius: '10px',
                background: 'var(--bg-void)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GraduationCap size={18} style={{ color: '#06b6d4' }} />
              </div>
            </div>
            <div>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.15rem', fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', gap: '8px',
                letterSpacing: '-0.02em',
              }}>
                <span>VERITAS</span>
                <span style={{
                  fontSize: '0.62rem', fontFamily: "'Inter', sans-serif",
                  fontWeight: 700, padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  v2.0 PRO
                </span>
              </div>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="vizer-nav-capsule">
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

          {/* Right Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              background: backendOnline ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
              border: backendOnline ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(244,63,94,0.3)',
              fontSize: '0.72rem',
              color: backendOnline ? '#34d399' : '#fb7185',
              fontWeight: 600,
            }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: backendOnline ? '#10b981' : '#f43f5e',
                boxShadow: backendOnline ? '0 0 10px #10b981' : '0 0 10px #f43f5e',
                animation: 'pulseRing 2s ease-in-out infinite',
              }} />
              <span>{backendOnline ? 'Engine Online' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Vizer Hero Section (for Detector Tab) ── */}
      {activeTab === 'detector' && (
        <section style={{
          maxWidth: '1320px', margin: '0 auto',
          padding: '48px 24px 24px',
          textAlign: 'center',
          animation: 'slideUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) both',
        }}>
          {/* Glowing Top Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: 'var(--radius-pill)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 0 24px rgba(139, 92, 246, 0.15)',
            fontSize: '0.75rem', color: '#c4b5fd', fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            <Sparkles size={13} style={{ color: '#06b6d4' }} />
            <span>Explainable Admissions AI Detection · Zero LLM API Wrappers</span>
          </div>

          {/* Main Display Headline */}
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
            fontWeight: 900, letterSpacing: '-0.035em',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #a5b4fc 70%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.12,
            marginBottom: '18px',
          }}>
            Detect AI in Admissions Essays.<br />
            <span style={{ fontWeight: 800, opacity: 0.9 }}>With Sentence-by-Sentence Forensics.</span>
          </h1>

          <p style={{
            maxWidth: '640px', margin: '0 auto 28px',
            color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.75,
          }}>
            Pure statistical NLP engine combining <strong>Goh-Barabasi burstiness</strong>, 
            <strong> token surprisal perplexity</strong>, <strong>lexical entropy</strong>, and 
            <strong> 150+ admissions cliché markers</strong> with built-in <strong>ESL non-native safeguard</strong>.
          </p>

          {/* Hero Bento Highlights Pill Row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', flexWrap: 'wrap', marginBottom: '8px'
          }}>
            {[
              { icon: '🎯', label: 'Sentence-Level Highlight Map' },
              { icon: '🛡️', label: 'ESL Non-Native Protection' },
              { icon: '🧮', label: 'Deterministic Linguistic Math' },
              { icon: '⚡', label: 'Instant Offline Inference' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem', color: 'var(--text-secondary)',
                fontWeight: 500,
              }}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Main View Container ── */}
      <main style={{
        maxWidth: '1320px', margin: '0 auto',
        padding: activeTab === 'detector' ? '12px 24px' : '36px 24px',
      }}>
        {activeTab === 'detector' && <DetectorView samples={samples} />}
        {activeTab === 'dataset' && <DatasetView datasetInfo={datasetInfo} />}
        {activeTab === 'evaluation' && <EvaluationView evalReport={evalReport} />}
      </main>

      {/* ── Vizer Studio Footer ── */}
      <footer style={{
        marginTop: '70px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(6, 8, 14, 0.7)',
        backdropFilter: 'blur(20px)',
        padding: '36px 24px',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
      }}>
        <div style={{
          maxWidth: '1320px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={15} style={{ color: '#fff' }} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>VERITAS AI</strong>
              <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Admissions Essay Statistical Detection Engine
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            fontSize: '0.78rem', color: 'var(--text-secondary)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: '#10b981' }} />
              Zero LLM Wrappers
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={13} style={{ color: '#06b6d4' }} />
              ESL Safe
            </span>
            <a
              href="https://github.com/mahekaggarwal17/AI-detector-for-admissions-essays"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                color: '#a5b4fc', textDecoration: 'none', fontWeight: 600,
              }}
            >
              GitHub Repository <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
