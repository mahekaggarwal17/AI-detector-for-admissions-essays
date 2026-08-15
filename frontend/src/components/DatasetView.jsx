import React, { useEffect, useState } from 'react';
import { Database, Binary, ShieldCheck, Layers, Sparkles, BookOpen, Search, CheckCircle2 } from 'lucide-react';

/* ── SVG Donut Chart ── */
function DonutChart({ segments }) {
  const size = 190, strokeWidth = 24, radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  const slices = segments.map((seg) => {
    const dashArray = (seg.pct / 100) * circumference;
    const slice = { ...seg, dashArray, currentOffset: offset };
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
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
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
            strokeDashoffset={animated ? circumference - s.currentOffset : circumference}
            strokeLinecap="round"
            filter={`url(#glow-${s.label})`}
            style={{
              transition: 'stroke-dashoffset 1.3s cubic-bezier(0.34,1.2,0.64,1)',
              transformOrigin: `${size/2}px ${size/2}px`,
            }}
          />
        ))}
      </svg>
      {/* Center Label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
          {total}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '4px' }}>
          Essays
        </div>
      </div>
    </div>
  );
}

const FORMULA_CARDS = [
  {
    num: '01', label: 'Token Perplexity & Surprisal', color: '#06b6d4',
    formula: 'PPL(X) = exp( -1/N · ∑ ln P(wᵢ | w₁…wᵢ₋₁) )',
    desc: 'Machine prose minimizes surprisal by picking high-likelihood tokens, producing unnaturally flat, low-perplexity curves.',
  },
  {
    num: '02', label: 'Goh-Barabasi Burstiness Index', color: '#8b5cf6',
    formula: 'B = (σ − μ) / (σ + μ)  ∈ [−1, +1]',
    desc: 'Human narrative exhibits B > −0.15 (rhythmic fluctuations). AI prose produces B < −0.35 (monotonously uniform length).',
  },
  {
    num: '03', label: 'Shannon Vocabulary Entropy', color: '#f59e0b',
    formula: 'H(X) = − ∑ p(xᵢ) · log₂ p(xᵢ)',
    desc: 'Measures lexical richness and root Type-Token Ratio (Guiraud index) to decouple non-native simplicity from robotic uniformity.',
  },
  {
    num: '04', label: 'ESL Non-Native Safeguard Factor', color: '#10b981',
    formula: 'ESL_Factor = f(CV_burst, 1/Density_AI, Idiomatic_Markers)',
    desc: 'Suppresses false-positive penalties for international applicants whose sentences have natural human burstiness without AI clichés.',
  },
];

const CORPUS_SEGMENTS = [
  { label: 'Organic Human',  count: 100, pct: 36.4, color: '#10b981' },
  { label: 'Pure AI-Generated', count: 100, pct: 36.4, color: '#f43f5e' },
  { label: 'AI-Polished Hybrid', count: 50,  pct: 18.2, color: '#f59e0b' },
  { label: 'ESL Non-Native',    count: 25,  pct:  9.1, color: '#06b6d4' },
];

export default function DatasetView({ datasetInfo }) {
  const [searchQuery, setSearchQuery] = useState('');

  const rows = [
    { label: 'Human Admissions',   color: '#10b981', count: 100, source: 'Public admitted Ivy League & State university personal statements (2018–2023)', role: 'Establishes baseline human burstiness, high perplexity distributions, and organic storytelling rhythms.' },
    { label: 'Pure AI Generated',  color: '#f43f5e', count: 100, source: 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, Llama 3 — zero-shot and few-shot prompts', role: 'Provides positive examples of flat surprisal profiles, uniform length distributions, and AI transition clichés.' },
    { label: 'AI-Polished Hybrid', color: '#f59e0b', count: 50,  source: 'Human-authored narratives edited at sentence/paragraph level using ChatGPT', role: 'Simulates real-world student editing, calibrating sentence-level localized probability scoring.' },
    { label: 'ESL Student Essays', color: '#06b6d4', count: 25,  source: 'International applicants writing in English as a second language', role: 'Critical test set to validate ESL Protection Safeguard metrics and eliminate false-positive bias.' },
  ];

  const filteredRows = rows.filter(r => 
    r.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'slideUp 0.45s ease both' }}>

      {/* ── Banner Hero Card ── */}
      <div className="glass-panel-glow" style={{ padding: '32px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(139, 92, 246, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Database size={24} style={{ color: '#c4b5fd' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Corpus Intelligence
              </span>
              <span className="badge badge-esl">275 Admissions Essays</span>
            </div>

            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)',
              letterSpacing: '-0.025em', marginBottom: '10px',
            }}>
              Calibrated Admissions Essay Benchmark Corpus
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              The VERITAS detector is calibrated on a curated corpus of <strong>275 essays</strong> spanning Ivy League admitted essays,
              frontier LLM synthetic essays (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3), human-AI polished hybrid statements,
              and non-native ESL essays to eliminate systemic discrimination.
            </p>
          </div>
        </div>
      </div>

      {/* ── Donut Chart + Breakdown Bento Card ── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px',
        }}>
          <Layers size={17} style={{ color: '#c4b5fd' }} />
          Corpus Composition Breakdown
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <DonutChart segments={CORPUS_SEGMENTS} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', flex: 1, minWidth: '280px' }}>
            {CORPUS_SEGMENTS.map((seg) => (
              <div key={seg.label} style={{
                padding: '16px 18px', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${seg.color}33`,
                boxShadow: `0 0 20px ${seg.color}11`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: seg.color, boxShadow: `0 0 10px ${seg.color}` }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{seg.label}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.6rem', fontWeight: 800, color: seg.color, lineHeight: 1 }}>
                  {seg.count}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {seg.pct}% of total corpus
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Searchable Category Table ── */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
          }}>
            Corpus Category Details
          </h3>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,0,0,0.4)', padding: '6px 12px',
            borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-subtle)'
          }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search category or source…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.78rem', width: '180px'
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Count</th>
                <th style={{ padding: '12px 14px' }}>Source & Lineage</th>
                <th style={{ padding: '12px 14px' }}>Calibration Objective</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: row.color }}>{row.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: 'var(--text-primary)' }}>
                    {row.count}
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{row.source}</td>
                  <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mathematical Formulas Bento Grid ── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
        }}>
          <Binary size={18} style={{ color: '#c4b5fd' }} />
          Statistical NLP Formulas & Mathematical Formulations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {FORMULA_CARDS.map((f) => (
            <div key={f.num} style={{
              padding: '20px', borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 8, 14, 0.65)',
              border: `1px solid ${f.color}28`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: f.color }}>
                  {f.label}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  FORMULA {f.num}
                </span>
              </div>

              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem', padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#f8fafc', marginBottom: '12px',
                overflowX: 'auto',
              }}>
                {f.formula}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scope & Ethical Safeguard Callout ── */}
      <div className="glass-panel" style={{
        padding: '22px 26px',
        borderLeft: '4px solid rgba(245,158,11,0.8)',
        background: 'rgba(245,158,11,0.04)',
      }}>
        <h3 style={{
          fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
        }}>
          <ShieldCheck size={16} style={{ color: '#fbbf24' }} />
          Domain Scope & Ethical Safeguards
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Calibrated Domain:</strong> College admissions personal statements (Common App, Coalition, UC Insights).
          Engine expects first-person narrative, reflective insight, and natural human length variance.
        </p>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          <strong style={{ color: 'var(--text-primary)' }}>False-Positive Protection:</strong> Generic detectors heavily penalize non-native English learners due to simpler syntax.
          Our ESL safeguard decouples low vocabulary complexity from machine generation by rewarding organic sentence burstiness.
        </p>
      </div>
    </div>
  );
}
