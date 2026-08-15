import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, AlertTriangle, Zap, ShieldCheck, FileSearch, Info, CheckCircle2 } from 'lucide-react';

/* ── Circular Gauge ── */
function Gauge({ value = 0 }) {
  const r = 52, circ = 2 * Math.PI * r;
  const [disp, setDisp] = useState(0);

  useEffect(() => {
    let start = null;
    const dur = 1100;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(value * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  const offset = circ - (disp / 100) * circ;
  const color = value >= 70 ? 'var(--red)' : value >= 38 ? 'var(--amber)' : 'var(--green)';
  const label = value >= 70 ? 'Likely AI' : value >= 38 ? 'Mixed' : 'Human';

  return (
    <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
      <svg width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={65} cy={65} r={r} className="gauge-track" strokeWidth={9} />
        <circle
          cx={65} cy={65} r={r}
          className="gauge-arc"
          stroke={color}
          strokeWidth={9}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s var(--ease-out), stroke 0.5s', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700, color, lineHeight: 1 }}>
          {disp}%
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--fg-3)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Animated bar ── */
function Bar({ value = 0, color = 'var(--accent)', delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), delay + 100); return () => clearTimeout(t); }, [value, delay]);
  return (
    <div className="bar-track">
      <div className="bar-fill" style={{ width: `${w}%`, background: color, transitionDelay: `${delay}ms` }} />
    </div>
  );
}

const SUBSCORES = [
  { key: 'perplexity_score',  label: 'Perplexity & Surprisal', color: 'var(--cyan)',   Icon: Activity },
  { key: 'burstiness_score',  label: 'Burstiness & Rhythm',    color: 'var(--accent)', Icon: BarChart3 },
  { key: 'syntactic_score',   label: 'Syntactic Uniformity',   color: 'var(--amber)',  Icon: Zap },
  { key: 'ai_phrase_score',   label: 'AI Cliché Markers',      color: 'var(--red)',    Icon: AlertTriangle },
];

function StatLine({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--fg-3)' }}>{label}</span>
      <span className="mono" style={{ color: 'var(--fg-2)', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function ExplainabilityPanel({ analysisData, selectedSentence }) {
  if (!analysisData) return null;
  const { overall_ai_probability: prob = 0, overall_verdict, confidence_score,
          subscores, stats, esl_safeguard, evidence_summary } = analysisData;

  const verdictClass = prob >= 70 ? 'tag-red' : prob >= 38 ? 'tag-amber' : 'tag-green';
  const verdictText  = prob >= 70 ? 'Likely AI-Generated' : prob >= 38 ? 'Mixed / AI-Polished' : 'Organic Human-Written';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s var(--ease-out) both' }}>

      {/* ── Verdict Card ── */}
      <div className="card">
        <div className="card-accent-line" style={{
          background: prob >= 70 ? 'var(--red)' : prob >= 38 ? 'var(--amber)' : 'var(--green)',
        }} />
        <div className="card-pad" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Gauge value={prob} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Verdict
              </span>
              <span className={`tag ${verdictClass}`}>{verdictText}</span>
            </div>
            <h3 style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: '1.25rem', fontWeight: 700,
              color: 'var(--fg)', lineHeight: 1.25, marginBottom: 10,
            }}>
              {overall_verdict}
            </h3>
            <p style={{ fontSize: '0.8375rem', color: 'var(--fg-2)', lineHeight: 1.65, marginBottom: 10 }}>
              {evidence_summary?.sentence_distribution}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.775rem', color: 'var(--fg-3)' }}>
              <span className="mono">Confidence: <strong style={{ color: 'var(--fg-2)' }}>{confidence_score}%</strong></span>
              {esl_safeguard?.is_esl_candidate && (
                <>
                  <span>·</span>
                  <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                    ESL Shield ×{esl_safeguard.adjustment_factor}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Selected Sentence Inspector ── */}
      {selectedSentence && (
        <div className="card card-pad anim-fade-in" style={{
          borderLeft: '3px solid var(--accent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <FileSearch size={13} /> Sentence #{selectedSentence.id + 1} Breakdown
            </div>
            <span className={`tag ${selectedSentence.highlight_color === 'red' ? 'tag-red' : selectedSentence.highlight_color === 'yellow' ? 'tag-amber' : 'tag-green'}`}>
              {selectedSentence.ai_probability}% AI Risk
            </span>
          </div>

          <p style={{
            fontSize: '0.875rem', color: 'var(--fg-2)', fontStyle: 'italic',
            lineHeight: 1.75, marginBottom: 14,
            padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--r-md)',
            border: '1px solid var(--line)',
          }}>
            "{selectedSentence.text}"
          </p>

          <div className="grid-3" style={{ gap: 10, marginBottom: 12 }}>
            {[
              { label: 'Perplexity', value: selectedSentence.perplexity },
              { label: 'Low-Surprisal Ratio', value: `${(selectedSentence.low_surprisal_ratio * 100).toFixed(0)}%` },
              { label: 'Triggers', value: selectedSentence.triggers?.length > 0 ? selectedSentence.triggers.slice(0, 2).join(', ') : 'None' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                background: 'var(--bg-1)', border: '1px solid var(--line)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--fg-3)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
                <div className="mono" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--accent-b)', fontSize: '0.8125rem', color: 'var(--fg-2)',
          }}>
            <Info size={13} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <span><strong style={{ color: 'var(--fg)' }}>Evidence:</strong> {selectedSentence.reason}</span>
          </div>
        </div>
      )}

      {/* ── Subscores ── */}
      <div className="card card-pad">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 }}>
          Signal Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {SUBSCORES.map(({ key, label, color, Icon }, i) => (
            <div key={key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--fg-2)' }}>{label}</span>
                </div>
                <span className="mono" style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{subscores?.[key]}%</span>
              </div>
              <Bar value={subscores?.[key] || 0} color={color} delay={i * 90} />
            </div>
          ))}
        </div>

        {stats && (
          <>
            <div className="divider" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StatLine label="Mean Perplexity" value={stats.overall_perplexity} />
              <StatLine label="Perplexity Std Dev" value={stats.perplexity_std_dev} />
              <StatLine label="Burstiness CV" value={stats.coefficient_of_variation} />
              <StatLine label="Shannon Entropy" value={`${stats.shannon_entropy} bits`} />
              <StatLine label="Type-Token Ratio" value={stats.ttr} />
              <StatLine label="AI Phrase Density" value={`${stats.ai_phrase_density}/100 words`} />
            </div>
          </>
        )}
      </div>

      {/* ── Evidence observations ── */}
      {evidence_summary?.key_observations?.length > 0 && (
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
            <ShieldCheck size={15} color="var(--fg-3)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Linguistic Evidence
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {evidence_summary.key_observations.map((obs, i) => (
              <div key={i} className="data-row">
                <CheckCircle2 size={14} color="var(--fg-3)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg)' }}>{obs.category}</span>
                    <span className={`tag ${obs.status.includes('AI') ? 'tag-red' : obs.status.includes('Safeguard') ? 'tag-cyan' : 'tag-green'}`} style={{ fontSize: '0.65rem' }}>
                      {obs.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--fg-3)', lineHeight: 1.6 }}>{obs.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
