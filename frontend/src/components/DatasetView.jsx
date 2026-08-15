import React, { useEffect, useState } from 'react';
import { Database, Binary, ShieldCheck, Layers } from 'lucide-react';

/* ── SVG Donut Chart ── */
function DonutChart({ segments }) {
  const size = 180, strokeWidth = 22, radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  const slices = segments.map((seg) => {
    const dashArray = (seg.pct / 100) * circumference;
    const dashOffset = circumference - dashArray;
    const slice = { ...seg, dashArray, dashOffset: animated ? circumference - dashArray : circumference, currentOffset: offset };
    offset += dashArray;
    return slice;
  });

  const total = segments.reduce((acc, s) => acc + s.count, 0);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          {slices.map((s) => (
            <filter key={`glow-${s.label}`} id={`glow-${s.label}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Segments */}
        {slices.map((s) => (
          <circle
            key={s.label}
            cx={size/2} cy={size/2} r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dashArray} ${circumference}`}
            strokeDashoffset={circumference - s.currentOffset}
            strokeLinecap="round"
            filter={`url(#glow-${s.label})`}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.2,0.64,1)',
              transformOrigin: `${size/2}px ${size/2}px`,
            }}
          />
        ))}
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
          {total}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Essays</div>
      </div>
    </div>
  );
}

const FORMULA_CARDS = [
  {
    num: '1', label: 'Token Perplexity & Surprisal', color: '#06b6d4',
    formula: 'PPL(X) = exp( -1/N · ∑ ln P(wᵢ | w₁…wᵢ₋₁) )',
    desc: 'Machine prose minimizes surprisal by picking high-likelihood tokens, producing low, uniform perplexities.',
  },
  {
    num: '2', label: 'Goh-Barabasi Burstiness Index', color: '#9333ea',
    formula: 'B = (σ − μ) / (σ + μ)  ∈ [−1, +1]',
    desc: 'Human text shows B > −0.15 (variable rhythms). AI prose shows B < −0.35 (monotonously uniform).',
  },
  {
    num: '3', label: 'Shannon Vocabulary Entropy', color: '#f59e0b',
    formula: 'H(X) = − ∑ p(xᵢ) · log₂ p(xᵢ)',
    desc: 'Evaluates vocabulary concentration and Type-Token Ratio (TTR) normalized by root word count.',
  },
  {
    num: '4', label: 'ESL Protection Safeguard', color: '#10b981',
    formula: 'ESL_Factor = f(CV_burst, 1/Density_AI, ESL_Markers)',
    desc: 'Adjusts raw AI score downward when sentence burstiness is high and AI buzzwords are absent.',
  },
];

const CORPUS_SEGMENTS = [
  { label: 'Human',   count: 100, pct: 36.4, color: '#10b981' },
  { label: 'Pure AI', count: 100, pct: 36.4, color: '#f43f5e' },
  { label: 'Hybrid',  count: 50,  pct: 18.2, color: '#f59e0b' },
  { label: 'ESL',     count: 25,  pct:  9.1, color: '#a5b4fc' },
];

export default function DatasetView({ datasetInfo }) {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Banner ── */}
      <div className="glass-panel-glow" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '13px',
            background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Database size={22} style={{ color: '#a5b4fc' }} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: '8px',
            }}>
              Admissions Benchmark Corpus
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Our dataset consists of <strong style={{ color: 'var(--text-primary)' }}>275 college admissions essays</strong> sourced
              from authentic admitted student repositories, synthetic AI generation across multiple models (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3),
              human–AI polished hybrid essays, and non-native English (ESL) student essays.
            </p>
          </div>
        </div>
      </div>

      {/* ── Donut Chart + Stats ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
        }}>
          <Layers size={16} style={{ color: '#a5b4fc' }} />
          Corpus Composition
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <DonutChart segments={CORPUS_SEGMENTS} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, minWidth: '260px' }}>
            {CORPUS_SEGMENTS.map((seg) => (
              <div key={seg.label} style={{
                padding: '14px 16px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${seg.color}33`,
                animation: 'slideUp 0.4s ease both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color, boxShadow: `0 0 8px ${seg.color}` }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{seg.label}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: seg.color, lineHeight: 1 }}>
                  {seg.count}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{seg.pct}% of corpus</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Corpus Table ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          Category Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Count</th>
                <th>Source / Origin</th>
                <th>Role in Calibration</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Human Admissions',   color: '#10b981', count: 100, source: 'Public admitted Ivy League & State university personal statements (2018–2023)', role: 'Establishes baseline human burstiness, high perplexity distributions, and organic storytelling rhythms.' },
                { label: 'Pure AI Generated',  color: '#f43f5e', count: 100, source: 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, Llama 3 — zero-shot and few-shot prompts', role: 'Provides positive examples of flat surprisal profiles, uniform length distributions, and AI transition clichés.' },
                { label: 'AI-Polished Hybrid', color: '#f59e0b', count: 50,  source: 'Human-authored narratives edited at sentence/paragraph level using ChatGPT', role: 'Simulates real-world student editing, calibrating sentence-level localized probability scoring.' },
                { label: 'ESL Student Essays', color: '#a5b4fc', count: 25,  source: 'International applicants writing in English as a second language', role: 'Critical test set to validate ESL Protection Safeguard metrics and eliminate false-positive bias.' },
              ].map((row) => (
                <tr key={row.label}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: row.color }}>{row.label}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--text-primary)' }}>
                    {row.count}
                  </td>
                  <td style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>{row.source}</td>
                  <td style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mathematical Formulas ── */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px',
        }}>
          <Binary size={16} style={{ color: '#c084fc' }} />
          Algorithmic Methodology & Formulas
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {FORMULA_CARDS.map((f, i) => (
            <div key={f.num} style={{
              padding: '18px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${f.color}22`,
              animation: `slideUp 0.4s ease ${i * 0.08}s both`,
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: f.color, marginBottom: '8px' }}>
                {f.num}. {f.label}
              </div>
              <div className="formula-block" style={{ color: `${f.color}dd`, marginBottom: '10px', fontSize: '0.78rem' }}>
                {f.formula}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scope & Limitations ── */}
      <div className="glass-panel" style={{
        padding: '20px 22px',
        borderLeft: '3px solid rgba(245,158,11,0.6)',
        background: 'rgba(245,158,11,0.03)',
      }}>
        <h3 style={{
          fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
        }}>
          <ShieldCheck size={15} style={{ color: '#fbbf24' }} />
          Dataset Scope & Limitations
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Calibrated domain:</strong> High school and undergraduate college admissions personal statements
          (Common App, UC Insights, supplemental prompts). Performs with high accuracy on personal storytelling and reflective prose.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Out-of-domain risk:</strong> Technical STEM research papers, legal briefs, or poetry naturally contain low vocabulary entropy
          and rigid passive-voice syntax — which could trigger false-positive AI flags without domain adaptation.
        </p>
      </div>
    </div>
  );
}
