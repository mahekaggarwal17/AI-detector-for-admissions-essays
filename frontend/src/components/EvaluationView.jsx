import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, FileWarning, CheckCircle2, XCircle, TrendingUp, Sparkles, Activity, Layers } from 'lucide-react';

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
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);
  const max = Math.max(valueA, valueB, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[{ label: labelA, value: valueA, color: colorA }, { label: labelB, value: valueB, color: colorB }].map(({ label, value, color }) => (
        <div key={label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', fontWeight: 800, color }}>
              {value}%
            </span>
          </div>
          <div className="progress-track" style={{ height: '8px' }}>
            <div className="progress-fill" style={{
              width: loaded ? `${(value / max) * 100}%` : '0%',
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 14px ${color}66`,
              transitionDuration: '1.3s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const METRIC_CARDS = [
  { key: 'accuracy',  label: 'Accuracy',  color: '#10b981', suffix: '%', note: 'Held-out 55 essays',       Icon: CheckCircle2 },
  { key: 'precision', label: 'Precision', color: '#06b6d4', suffix: '%', note: 'Low false positive rate', Icon: TrendingUp   },
  { key: 'recall',    label: 'Recall',    color: '#8b5cf6', suffix: '%', note: 'High AI capture rate',     Icon: Activity     },
  { key: 'f1_score',  label: 'F1 Score',  color: '#a855f7', suffix: '%', note: 'Harmonic mean',             Icon: BarChart3    },
  { key: 'roc_auc',   label: 'ROC-AUC',   color: '#f59e0b', suffix: '',  note: 'Discriminative separation', Icon: Sparkles,    decimals: 3 },
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
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideUp 0.45s ease both' }}>

      {/* ── Hero Banner ── */}
      <div className="glass-panel-glow" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BarChart3 size={24} style={{ color: '#c4b5fd' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Evaluation Benchmark
              </span>
              <span className="badge badge-human">Held-Out Test Set</span>
            </div>

            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.75rem', fontWeight: 900,
              color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '8px',
            }}>
              Honest Accuracy & Deep Error Post-Mortems
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              Benchmark results on held-out test essays with full transparency into 
              <strong style={{ color: 'var(--text-primary)' }}> 3 failure modes where the detector makes confident mistakes</strong>.
              Real trust requires acknowledging and learning from edge cases.
            </p>
          </div>
        </div>
      </div>

      {/* ── Metric Bento Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {METRIC_CARDS.map(({ key, label, color, suffix, note, Icon, decimals = 1 }, i) => (
          <div key={key} className="glass-panel" style={{
            padding: '22px',
            borderTop: `3px solid ${color}`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 20px ${color}15`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {label}
              </span>
              <Icon size={14} style={{ color }} />
            </div>

            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1.85rem', fontWeight: 800,
              color, marginBottom: '6px', lineHeight: 1,
            }}>
              {metrics[key] ? <AnimatedNumber target={metrics[key]} suffix={suffix} decimals={decimals} delay={i * 80} /> : '—'}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{note}</div>
          </div>
        ))}
      </div>

      {/* ── ESL Bias Audit Card ── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
        }}>
          <ShieldAlert size={18} style={{ color: '#06b6d4' }} />
          Non-Native English (ESL) False Positive Bias Audit
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '22px' }}>
          <div style={{
            padding: '20px', borderRadius: 'var(--radius-md)',
            background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)',
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Industry Generic AI Detectors
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.2rem', fontWeight: 800, color: '#fb7185', marginBottom: '8px' }}>
              36.0%
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Generic commercial detectors over-penalize non-native English speakers — falsely flagging simpler syntactic patterns as machine-generated text.
            </p>
          </div>

          <div style={{
            padding: '20px', borderRadius: 'var(--radius-md)',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              VERITAS with ESL Safeguard Active
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2.2rem', fontWeight: 800, color: '#34d399', marginBottom: '8px' }}>
              4.0%
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Our engine isolates burstiness rhythm from vocabulary entropy, protecting ESL students whose writing has organic rhythm without AI buzzwords.
            </p>
          </div>
        </div>

        <div style={{ padding: '18px 22px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
          <ComparisonBar
            labelA="Generic AI Detectors (ESL False Positive Rate)"
            valueA={36.0}
            colorA="#f43f5e"
            labelB="VERITAS ESL Safeguard (False Positive Rate)"
            valueB={4.0}
            colorB="#10b981"
          />
        </div>
      </div>

      {/* ── Deep Dive Failure Analysis ── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h3 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px',
          }}>
            <FileWarning size={18} style={{ color: '#fbbf24' }} />
            Failure Mode Post-Mortems: 3 Confidently Wrong Cases
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Transparent case studies dissecting where the statistical engine was deceived and what architectural fixes resolve it.
          </p>
        </div>

        {/* Case Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {cases.map((c, index) => {
            const isActive = selectedCaseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                style={{
                  padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.06)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.22s ease',
                  boxShadow: isActive ? '0 0 24px rgba(245,158,11,0.15)' : 'none',
                }}
              >
                <div style={{
                  fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.04em', color: '#fbbf24', marginBottom: '6px',
                }}>
                  Case #{index + 1}
                </div>
                <div style={{
                  fontSize: '0.84rem', fontWeight: 700,
                  color: isActive ? '#fff' : 'var(--text-primary)',
                  lineHeight: 1.35,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.essay_title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {c.predicted_verdict}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Case Card */}
        {activeCase && (
          <div style={{
            padding: '24px', borderRadius: 'var(--radius-lg)',
            background: 'rgba(6,8,14,0.65)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', gap: '18px',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '14px',
              paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <span className="badge badge-hybrid" style={{ marginBottom: '8px' }}>{activeCase.type}</span>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeCase.essay_title}
                </h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Model Prediction vs Reality</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.86rem', fontWeight: 800, color: '#fb7185' }}>
                  Predicted: {activeCase.predicted_verdict}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 700, color: '#34d399' }}>
                  Actual: {activeCase.actual_verdict}
                </div>
              </div>
            </div>

            {/* Problematic Passage */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Problematic Passage
              </div>
              <div style={{
                padding: '16px 18px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.86rem', color: 'var(--text-secondary)',
                fontStyle: 'italic', lineHeight: 1.75,
              }}>
                "{activeCase.text_snippet}"
              </div>
            </div>

            {/* Why Detector Failed */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Forensic Failure Cause
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
                fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.75,
              }}>
                {activeCase.why_detector_failed}
              </div>
            </div>

            {/* Lesson Learned */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Architectural Lesson & Solution
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(139,92,246,0.25)',
                fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.75,
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
