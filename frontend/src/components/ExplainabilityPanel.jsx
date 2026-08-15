import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, BarChart3, ShieldCheck, Zap,
  AlertTriangle, CheckCircle2, FileSearch, Info,
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
  const glow  = value >= 70 ? 'rgba(244,63,94,0.4)' : value >= 38 ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)';
  const label = value >= 70 ? 'Likely AI' : value >= 38 ? 'Mixed' : 'Human';

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="gauge-track"
          strokeWidth="10"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          className="gauge-circle"
          stroke={color}
          strokeWidth="10"
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
          fontSize: size * 0.22, fontWeight: 700,
          color, lineHeight: 1,
          textShadow: `0 0 20px ${glow}`,
        }}>
          {displayed}%
        </div>
        <div style={{ fontSize: size * 0.1, color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
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
    const t = setTimeout(() => setWidth(value), delay + 200);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{
        width: `${width}%`,
        background: `linear-gradient(90deg, ${color}aa, ${color})`,
        transitionDelay: `${delay}ms`,
        boxShadow: `0 0 12px ${color}55`,
      }} />
    </div>
  );
}

const SUBSCORE_CONFIG = [
  { key: 'perplexity_score',  label: 'Perplexity & Surprisal', color: '#06b6d4', Icon: Activity,  statFn: (s) => `Avg PPL: ${s.overall_perplexity} (SD: ${s.perplexity_std_dev})` },
  { key: 'burstiness_score',  label: 'Burstiness & Rhythm',   color: '#9333ea', Icon: BarChart3, statFn: (s) => `CV: ${s.coefficient_of_variation} · B-Index: ${s.burstiness_index}` },
  { key: 'syntactic_score',   label: 'Syntactic Uniformity',  color: '#f59e0b', Icon: Zap,       statFn: (s) => `Entropy: ${s.shannon_entropy} bits · TTR: ${s.ttr}` },
  { key: 'ai_phrase_score',   label: 'AI Buzzword Markers',   color: '#f43f5e', Icon: AlertTriangle, statFn: (s) => `Density: ${s.ai_phrase_density} per 100 words` },
];

export default function ExplainabilityPanel({ analysisData, selectedSentence }) {
  if (!analysisData) return null;

  const { overall_ai_probability, overall_verdict, subscores, stats, esl_safeguard, evidence_summary } = analysisData;
  const prob = overall_ai_probability ?? 0;
  const verdictColor = prob >= 70 ? '#fb7185' : prob >= 38 ? '#fbbf24' : '#34d399';
  const verdictBadge = prob >= 70 ? 'badge-ai' : prob >= 38 ? 'badge-hybrid' : 'badge-human';
  const verdictText  = prob >= 70 ? 'Likely AI-Generated' : prob >= 38 ? 'Mixed / AI-Polished' : 'Organic Human-Written';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'slideUp 0.45s ease both' }}>

      {/* ── Verdict Hero Card ── */}
      <div className="glass-panel-glow" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* BG accent */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: prob >= 70 ? 'rgba(244,63,94,0.06)' : prob >= 38 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left: Text */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Verdict
              </span>
              <span className={`badge ${verdictBadge}`}>{verdictText}</span>
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.4rem', fontWeight: 800,
              color: 'var(--text-primary)', lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '8px',
            }}>
              {overall_verdict}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {evidence_summary?.sentence_distribution}
            </p>
          </div>

          {/* Right: Circular Gauge */}
          <CircularGauge value={prob} size={148} />
        </div>
      </div>

      {/* ── Selected Sentence Inspector ── */}
      {selectedSentence && (
        <div className="glass-panel" style={{
          padding: '18px', animation: 'slideIn 0.3s ease both',
          borderLeft: '3px solid rgba(99,102,241,0.6)',
          background: 'rgba(79,70,229,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <FileSearch size={13} />
              Sentence #{selectedSentence.id + 1}
            </div>
            <span className={`badge ${selectedSentence.highlight_color === 'red' ? 'badge-ai' : selectedSentence.highlight_color === 'yellow' ? 'badge-hybrid' : 'badge-human'}`}>
              {selectedSentence.ai_probability}% AI Risk
            </span>
          </div>

          <p style={{
            fontSize: '0.85rem', color: 'var(--text-primary)',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px 14px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.05)',
            fontStyle: 'italic', marginBottom: '12px',
            lineHeight: 1.7,
          }}>
            "{selectedSentence.text}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {[
              { label: 'Perplexity', value: selectedSentence.perplexity, color: '#06b6d4' },
              { label: 'Low-Surprisal', value: `${(selectedSentence.low_surprisal_ratio * 100).toFixed(0)}%`, color: '#9333ea' },
              { label: 'AI Phrases', value: selectedSentence.triggers.length > 0 ? selectedSentence.triggers.slice(0,2).join(', ') : 'None', color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', fontWeight: 700, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '10px', padding: '10px 12px',
            borderRadius: '8px',
            background: 'rgba(79,70,229,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            fontSize: '0.78rem', color: 'var(--text-secondary)',
            display: 'flex', gap: '8px', alignItems: 'flex-start',
          }}>
            <Info size={13} style={{ color: '#a5b4fc', flexShrink: 0, marginTop: '1px' }} />
            <span><strong style={{ color: 'var(--text-primary)' }}>Evidence:</strong> {selectedSentence.reason}</span>
          </div>
        </div>
      )}

      {/* ── Subscores ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {SUBSCORE_CONFIG.map(({ key, label, color, Icon, statFn }, idx) => (
          <div key={key} className="glass-panel" style={{ padding: '16px', animation: `slideUp 0.4s ease ${idx * 0.08}s both` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={13} style={{ color }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85rem', fontWeight: 700, color,
              }}>
                {subscores[key]}%
              </span>
            </div>
            <AnimatedBar value={subscores[key]} color={color} delay={idx * 100} />
            <div style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              {stats && statFn(stats)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Evidence Observations ── */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1rem', fontWeight: 700,
          color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '14px',
        }}>
          <ShieldCheck size={16} style={{ color: '#a5b4fc' }} />
          Why It Thinks So
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="stagger-children">
          {evidence_summary?.key_observations?.map((obs, idx) => {
            const isAI    = obs.status === 'AI Indicator';
            const isHuman = obs.status === 'Human Indicator';
            const [bg, border, textColor, IconComp] = isAI
              ? ['rgba(244,63,94,0.08)', 'rgba(244,63,94,0.2)', '#fb7185', AlertTriangle]
              : isHuman
              ? ['rgba(16,185,129,0.08)', 'rgba(16,185,129,0.2)', '#34d399', CheckCircle2]
              : ['rgba(99,102,241,0.08)', 'rgba(99,102,241,0.2)', '#a5b4fc', ShieldCheck];
            return (
              <div key={idx} className="evidence-card" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '9px',
                  background: bg, border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconComp size={15} style={{ color: textColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{obs.category}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '1px 7px', borderRadius: '4px',
                      background: bg, color: textColor, border: `1px solid ${border}`,
                    }}>
                      {obs.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obs.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ESL Safeguard ── */}
      {esl_safeguard && (
        <div style={{
          padding: '16px 18px',
          borderRadius: '14px',
          background: 'rgba(79,70,229,0.06)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          flexWrap: 'wrap',
          animation: 'fadeIn 0.5s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShieldCheck size={17} style={{ color: '#a5b4fc' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                ESL Non-Native Protection Active
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {esl_safeguard.explanation}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: '#a5b4fc' }}>
              {esl_safeguard.esl_confidence}%
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>ESL Index</div>
          </div>
        </div>
      )}
    </div>
  );
}
