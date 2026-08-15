import React, { useEffect, useState } from 'react';
import {
  Activity, BarChart3, ShieldCheck, Zap,
  AlertTriangle, CheckCircle2, FileSearch, Info,
  Sparkles, Compass, Eye
} from 'lucide-react';

/* ── Animated circular gauge ── */
function CircularGauge({ value = 0, size = 160 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const offset = circumference - (displayed / 100) * circumference;

  const color = value >= 70 ? '#f43f5e' : value >= 38 ? '#f59e0b' : '#10b981';
  const glow  = value >= 70 ? 'rgba(244,63,94,0.5)' : value >= 38 ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)';
  const label = value >= 70 ? 'Likely AI' : value >= 38 ? 'Mixed / Polished' : 'Human';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="gauge-track"
          strokeWidth="11"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="gauge-circle"
          stroke={color}
          strokeWidth="11"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#gauge-glow)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1), stroke 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: size * 0.22, fontWeight: 800,
          color, lineHeight: 1,
          textShadow: `0 0 24px ${glow}`,
        }}>
          {displayed}%
        </div>
        <div style={{ fontSize: size * 0.095, color: 'var(--text-muted)', fontWeight: 700, marginTop: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Animated progress bar ── */
function AnimatedBar({ value = 0, color = '#6366f1', delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 150);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="progress-track" style={{ height: '7px' }}>
      <div className="progress-fill" style={{
        width: `${width}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        transitionDelay: `${delay}ms`,
        boxShadow: `0 0 14px ${color}66`,
      }} />
    </div>
  );
}

const SUBSCORE_CONFIG = [
  { key: 'perplexity_score',  label: 'Perplexity & Surprisal', color: '#06b6d4', Icon: Activity,  statFn: (s) => `Mean PPL: ${s.overall_perplexity} · SD: ${s.perplexity_std_dev}` },
  { key: 'burstiness_score',  label: 'Burstiness & Rhythm',   color: '#8b5cf6', Icon: BarChart3, statFn: (s) => `CV: ${s.coefficient_of_variation} · Burst Index: ${s.burstiness_index}` },
  { key: 'syntactic_score',   label: 'Syntactic Uniformity',  color: '#f59e0b', Icon: Zap,       statFn: (s) => `Entropy: ${s.shannon_entropy} bits · TTR: ${s.ttr}` },
  { key: 'ai_phrase_score',   label: 'Admissions AI Markers', color: '#f43f5e', Icon: AlertTriangle, statFn: (s) => `Density: ${s.ai_phrase_density} per 100 words` },
];

export default function ExplainabilityPanel({ analysisData, selectedSentence }) {
  if (!analysisData) return null;

  const { overall_ai_probability, overall_verdict, confidence_score, subscores, stats, esl_safeguard, evidence_summary } = analysisData;
  const prob = overall_ai_probability ?? 0;
  const verdictBadge = prob >= 70 ? 'badge-ai' : prob >= 38 ? 'badge-hybrid' : 'badge-human';
  const verdictText  = prob >= 70 ? 'Likely AI-Generated' : prob >= 38 ? 'Mixed / AI-Polished' : 'Organic Human-Written';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.45s cubic-bezier(0.25, 1, 0.5, 1) both' }}>

      {/* ── Verdict Hero Card ── */}
      <div className="glass-panel-glow" style={{ padding: '26px', position: 'relative', overflow: 'hidden' }}>
        {/* Background Ambient Aura */}
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '220px', height: '220px', borderRadius: '50%',
          background: prob >= 70 ? 'rgba(244,63,94,0.08)' : prob >= 38 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '22px' }}>
          {/* Left Summary Text */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Master Verdict
              </span>
              <span className={`badge ${verdictBadge}`}>{verdictText}</span>
            </div>

            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.5rem', fontWeight: 900,
              color: 'var(--text-primary)', lineHeight: 1.2,
              letterSpacing: '-0.025em',
              marginBottom: '10px',
            }}>
              {overall_verdict}
            </h2>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '10px' }}>
              {evidence_summary?.sentence_distribution}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.74rem', color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span>Confidence: <strong>{confidence_score}%</strong></span>
              {esl_safeguard?.is_esl_candidate && (
                <>
                  <span>·</span>
                  <span style={{ color: '#22d3ee', fontWeight: 700 }}>ESL Shield Applied ({esl_safeguard.adjustment_factor}x)</span>
                </>
              )}
            </div>
          </div>

          {/* Right Circular Gauge */}
          <CircularGauge value={prob} size={152} />
        </div>
      </div>

      {/* ── Selected Sentence Forensic Inspector ── */}
      {selectedSentence && (
        <div className="glass-panel" style={{
          padding: '20px', animation: 'slideIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) both',
          borderLeft: '4px solid rgba(139,92,246,0.8)',
          background: 'rgba(99,102,241,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FileSearch size={14} />
              <span>Sentence #{selectedSentence.id + 1} Forensic Breakdown</span>
            </div>
            <span className={`badge ${selectedSentence.highlight_color === 'red' ? 'badge-ai' : selectedSentence.highlight_color === 'yellow' ? 'badge-hybrid' : 'badge-human'}`}>
              {selectedSentence.ai_probability}% AI Risk
            </span>
          </div>

          <p style={{
            fontSize: '0.88rem', color: 'var(--text-primary)',
            background: 'rgba(6,8,14,0.6)',
            padding: '14px 16px', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontStyle: 'italic', marginBottom: '14px',
            lineHeight: 1.75,
          }}>
            "{selectedSentence.text}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Perplexity Score', value: selectedSentence.perplexity, color: '#06b6d4' },
              { label: 'Low-Surprisal Tokens', value: `${(selectedSentence.low_surprisal_ratio * 100).toFixed(0)}%`, color: '#8b5cf6' },
              { label: 'AI Phrase Markers', value: selectedSentence.triggers?.length > 0 ? selectedSentence.triggers.slice(0, 2).join(', ') : 'None', color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>{label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 800, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '12px', padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(139,92,246,0.25)',
            fontSize: '0.8rem', color: 'var(--text-secondary)',
            display: 'flex', gap: '10px', alignItems: 'flex-start',
          }}>
            <Info size={14} style={{ color: '#c4b5fd', flexShrink: 0, marginTop: '2px' }} />
            <span><strong style={{ color: 'var(--text-primary)' }}>Forensic Evidence:</strong> {selectedSentence.reason}</span>
          </div>
        </div>
      )}

      {/* ── Subscore Signal Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {SUBSCORE_CONFIG.map(({ key, label, color, Icon, statFn }, idx) => (
          <div key={key} className="glass-panel" style={{ padding: '18px', animation: `slideUp 0.4s ease ${idx * 0.08}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{label}</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.88rem', fontWeight: 800, color,
              }}>
                {subscores?.[key]}%
              </span>
            </div>
            <AnimatedBar value={subscores?.[key] || 0} color={color} delay={idx * 100} />
            <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats && statFn(stats)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Evidence Observations Panel ── */}
      <div className="glass-panel" style={{ padding: '22px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.05rem', fontWeight: 800,
          color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '16px',
        }}>
          <ShieldCheck size={17} style={{ color: '#c4b5fd' }} />
          Linguistic Evidence Summary
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {evidence_summary?.key_observations?.map((obs, i) => (
            <div key={i} className="evidence-card">
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {obs.category}
                  </span>
                  <span className={`badge ${obs.status.includes('AI') ? 'badge-ai' : obs.status.includes('Safeguard') ? 'badge-esl' : 'badge-human'}`} style={{ fontSize: '0.65rem' }}>
                    {obs.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {obs.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
