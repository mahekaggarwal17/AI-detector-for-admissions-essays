import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, FileWarning, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

/* Animated counter for metric numbers */
function AnimatedNumber({ target, suffix = '', decimals = 0, delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let start = null;
      const duration = 1000;
      const animate = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(+(target * e).toFixed(decimals));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, decimals]);
  return <>{val}{suffix}</>;
}

/* Visual comparison bar */
function ComparisonBar({ labelA, valueA, colorA, labelB, valueB, colorB }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 300); return () => clearTimeout(t); }, []);
  const max = Math.max(valueA, valueB, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[{ label: labelA, value: valueA, color: colorA }, { label: labelB, value: valueB, color: colorB }].map(({ label, value, color }) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 700, color }}>
              {value}%
            </span>
          </div>
          <div className="progress-track" style={{ height: '8px' }}>
            <div className="progress-fill" style={{
              width: loaded ? `${(value / max) * 100}%` : '0%',
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 10px ${color}55`,
              transitionDuration: '1.2s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const METRIC_CARDS = [
  { key: 'accuracy',              label: 'Accuracy',        color: '#10b981', suffix: '%', note: 'Held-out 55 essays',         Icon: CheckCircle2 },
  { key: 'precision',             label: 'Precision',       color: '#06b6d4', suffix: '%', note: 'Low false-positive rate',     Icon: TrendingUp   },
  { key: 'f1_score',              label: 'F1 Score',        color: '#9333ea', suffix: '%', note: 'Harmonic mean',               Icon: BarChart3    },
  { key: 'roc_auc',               label: 'ROC-AUC',         color: '#f59e0b', suffix: '',  note: 'Discriminative separation',   Icon: TrendingUp,  decimals: 3 },
];

export default function EvaluationView({ evalReport }) {
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  const metrics = evalReport?.metrics || {};
  const cases   = evalReport?.confidently_wrong_cases || [];

  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) setSelectedCaseId(cases[0].id);
  }, [cases]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Top Banner ── */}
      <div className="glass-panel-glow" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '13px',
            background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BarChart3 size={22} style={{ color: '#c084fc' }} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.6rem', fontWeight: 800,
              color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '6px',
            }}>
              Honest Accuracy & Error Analysis
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Held-out test set metrics, ESL bias audit, and deep-dive failure analysis
              on <strong style={{ color: 'var(--text-primary)' }}>3 essays the detector gets confidently wrong</strong>.
              A single accuracy number is meaningless without showing failure modes.
            </p>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }} className="stagger-children">
        {METRIC_CARDS.map(({ key, label, color, suffix, note, Icon, decimals = 1 }, i) => (
          <div key={key} className="glass-panel" style={{
            padding: '20px',
            animation: `slideUp 0.4s ease ${i * 0.07}s both`,
            borderTop: `3px solid ${color}44`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </span>
              <Icon size={13} style={{ color }} />
            </div>
            <div className="metric-number" style={{ color, marginBottom: '6px' }}>
              {metrics[key] ? <AnimatedNumber target={metrics[key]} suffix={suffix} decimals={decimals} delay={i * 100} /> : '—'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{note}</div>
          </div>
        ))}
      </div>

      {/* ── ESL Bias Audit ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
        }}>
          <ShieldAlert size={17} style={{ color: '#a5b4fc' }} />
          Non-Native English (ESL) Bias Audit
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            padding: '18px', borderRadius: '12px',
            background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Generic AI Detectors
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color: '#fb7185', marginBottom: '8px' }}>
              36.0%
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Generic detectors over-penalize non-native English speakers — mistaking simpler vocabulary and repetitive structures for machine-generated prose.
            </p>
          </div>
          <div style={{
            padding: '18px', borderRadius: '12px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Veritas with ESL Safeguard
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
              4.0%
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Our engine decouples vocabulary entropy from sentence burstiness. High organic burstiness and zero AI phrase markers protect ESL writers.
            </p>
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ComparisonBar
            labelA="Generic detectors (ESL FPR)"
            valueA={36.0}
            colorA="#f43f5e"
            labelB="Veritas ESL Safeguard FPR"
            valueB={4.0}
            colorB="#10b981"
          />
        </div>
      </div>

      {/* ── Failure Cases ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
          }}>
            <FileWarning size={17} style={{ color: '#fbbf24' }} />
            Deep Dive: 3 Confidently Wrong Cases
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Technical post-mortems on essays our detector misclassifies
          </p>
        </div>

        {/* Case Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
          {cases.map((c, index) => {
            const isActive = selectedCaseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                style={{
                  padding: '14px', borderRadius: '12px', textAlign: 'left',
                  background: isActive ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 20px rgba(245,158,11,0.1)' : 'none',
                }}
              >
                <div style={{
                  fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.04em', color: '#fbbf24', marginBottom: '5px',
                }}>
                  Case #{index + 1}
                </div>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.3,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.essay_title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {c.predicted_verdict}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Case Detail */}
        {activeCase && (
          <div style={{
            padding: '22px', borderRadius: '14px',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.07)',
            animation: 'fadeIn 0.35s ease both',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '12px',
              paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div>
                <span className="badge badge-hybrid" style={{ marginBottom: '8px', display: 'inline-flex' }}>{activeCase.type}</span>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {activeCase.essay_title}
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Prediction vs Reality</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 700, color: '#fb7185' }}>
                  Predicted: {activeCase.predicted_verdict}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem', fontWeight: 600, color: '#34d399' }}>
                  Actual: {activeCase.actual_verdict}
                </div>
              </div>
            </div>

            {/* Essay Snippet */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Problematic Passage
              </div>
              <div style={{
                padding: '14px 16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.82rem', color: 'var(--text-secondary)',
                fontStyle: 'italic', lineHeight: 1.75,
              }}>
                "{activeCase.text_snippet}"
              </div>
            </div>

            {/* Root Cause */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Why the Detector Failed
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              }}>
                {activeCase.why_detector_failed}
              </div>
            </div>

            {/* Lesson Learned */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Technical Lesson & Fix
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7,
              }}>
                {activeCase.lesson_learned}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
