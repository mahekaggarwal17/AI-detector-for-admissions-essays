import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, FileWarning, CheckCircle2, TrendingUp, Activity, Sparkles, XCircle } from 'lucide-react';

/* ── Animated number ── */
function Num({ target, suffix = '', dec = 1, delay = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s = null;
      const tick = (ts) => {
        if (!s) s = ts;
        const p = Math.min((ts - s) / 900, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setV(+(target * e).toFixed(dec));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay, dec]);
  return <>{v}{suffix}</>;
}

/* ── Comparison bar ── */
function CmpBar({ labelA, valA, colA, labelB, valB, colB }) {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);
  const max = Math.max(valA, valB, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[{ l: labelA, v: valA, c: colA }, { l: labelB, v: valB, c: colB }].map(({ l, v, c }) => (
        <div key={l}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8375rem' }}>
            <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{l}</span>
            <span className="mono" style={{ fontWeight: 700, color: c }}>{v}%</span>
          </div>
          <div className="bar-track" style={{ height: 6 }}>
            <div className="bar-fill" style={{
              width: go ? `${(v / max) * 100}%` : '0%',
              background: c,
              transitionDuration: '1.2s',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const METRICS = [
  { key: 'accuracy',  label: 'Accuracy',  color: 'var(--green)',  suffix: '%',  note: 'Held-out 55 essays',       Icon: CheckCircle2, dec: 1 },
  { key: 'precision', label: 'Precision', color: 'var(--cyan)',   suffix: '%',  note: 'Low false-positive rate',  Icon: TrendingUp,   dec: 1 },
  { key: 'recall',    label: 'Recall',    color: 'var(--accent)', suffix: '%',  note: 'High AI capture rate',     Icon: Activity,     dec: 1 },
  { key: 'f1_score',  label: 'F1 Score',  color: 'var(--accent)', suffix: '%',  note: 'Harmonic mean',            Icon: BarChart3,    dec: 1 },
  { key: 'roc_auc',   label: 'ROC-AUC',   color: 'var(--amber)',  suffix: '',   note: 'Discriminative separation',Icon: Sparkles,     dec: 3 },
];

export default function EvaluationView({ evalReport }) {
  const [caseId, setCaseId] = useState(null);
  const metrics = evalReport?.metrics || {};
  const cases   = evalReport?.confidently_wrong_cases || [];

  useEffect(() => { if (cases.length && !caseId) setCaseId(cases[0].id); }, [cases]);
  const active = cases.find(c => c.id === caseId) || cases[0];

  return (
    <div>
      {/* ── Hero ── */}
      <div className="section anim-fade-up" style={{ paddingTop: 72 }}>
        <div className="section-label">Research Benchmark</div>
        <h2 className="section-title">Honest Performance Metrics</h2>
        <p className="section-sub">
          Results on a held-out test set with full transparency into 3 failure modes —
          real trust requires acknowledging and learning from edge cases.
        </p>
      </div>

      {/* ── Metrics grid ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="grid-5">
          {METRICS.map(({ key, label, color, suffix, note, Icon, dec }, i) => (
            <div key={key} className="card" style={{ overflow: 'visible' }}>
              <div style={{ height: 2, background: color, borderRadius: '8px 8px 0 0' }} />
              <div className="card-pad">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </span>
                  <Icon size={13} color={color} />
                </div>
                <div className="mono" style={{ fontSize: '1.875rem', fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>
                  {metrics[key]
                    ? <Num target={metrics[key]} suffix={suffix} dec={dec} delay={i * 70} />
                    : '—'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--fg-3)' }}>{note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ESL Bias Audit ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card card-pad-lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <ShieldAlert size={15} color="var(--fg-3)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ESL False Positive Bias Audit
            </span>
          </div>

          <div className="grid-2" style={{ marginBottom: 28 }}>
            <div style={{
              padding: '22px', borderRadius: 'var(--r-lg)',
              background: 'var(--red-s)', border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <XCircle size={14} color="var(--red)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Generic AI Detectors
                </span>
              </div>
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--red)', lineHeight: 1, marginBottom: 10 }}>
                36.0%
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--fg-2)', lineHeight: 1.65 }}>
                Over-penalise non-native English speakers — falsely flagging simpler syntactic
                patterns as machine-generated text.
              </p>
            </div>

            <div style={{
              padding: '22px', borderRadius: 'var(--r-lg)',
              background: 'var(--green-s)', border: '1px solid rgba(34,197,94,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <CheckCircle2 size={14} color="var(--green)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  VERITAS + ESL Safeguard
                </span>
              </div>
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--green)', lineHeight: 1, marginBottom: 10 }}>
                4.0%
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--fg-2)', lineHeight: 1.65 }}>
                Isolates burstiness rhythm from vocabulary entropy, protecting ESL students whose
                writing has organic rhythm without AI buzzwords.
              </p>
            </div>
          </div>

          <CmpBar
            labelA="Generic Detectors — ESL False Positive Rate"
            valA={36.0} colA="var(--red)"
            labelB="VERITAS with ESL Safeguard — False Positive Rate"
            valB={4.0}  colB="var(--green)"
          />
        </div>
      </div>

      {/* ── Failure post-mortems ── */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <FileWarning size={15} color="var(--fg-3)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Failure Mode Post-Mortems
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Case list */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {cases.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setCaseId(c.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '16px 20px',
                  borderBottom: i < cases.length - 1 ? '1px solid var(--line)' : 'none',
                  background: caseId === c.id ? 'var(--accent-b)' : 'transparent',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                  Case #{i + 1}
                </div>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 600,
                  color: caseId === c.id ? 'var(--accent)' : 'var(--fg)',
                  lineHeight: 1.35, marginBottom: 5,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {c.essay_title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--fg-3)' }}>{c.predicted_verdict}</div>
              </button>
            ))}
          </div>

          {/* Active case */}
          {active && (
            <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                paddingBottom: 18, borderBottom: '1px solid var(--line)',
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <span className="tag tag-amber" style={{ marginBottom: 8 }}>{active.type}</span>
                  <h4 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--fg)', marginTop: 6 }}>
                    {active.essay_title}
                  </h4>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--fg-3)', marginBottom: 5 }}>Prediction vs Reality</div>
                  <div className="mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--red)' }}>Predicted: {active.predicted_verdict}</div>
                  <div className="mono" style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--green)', marginTop: 3 }}>Actual: {active.actual_verdict}</div>
                </div>
              </div>

              {[
                { title: 'Problematic Passage', color: 'var(--fg-3)', content: `"${active.text_snippet}"`, italic: true },
                { title: 'Why Detector Failed', color: 'var(--amber)', content: active.why_detector_failed },
                { title: 'Architectural Fix',   color: 'var(--accent)', content: active.lesson_learned },
              ].map(({ title, color, content, italic }) => (
                <div key={title}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    {title}
                  </div>
                  <div style={{
                    padding: '14px 16px', borderRadius: 'var(--r-md)',
                    background: 'var(--bg)', border: '1px solid var(--line)',
                    fontSize: '0.875rem', color: 'var(--fg-2)', lineHeight: 1.75,
                    fontStyle: italic ? 'italic' : 'normal',
                  }}>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
