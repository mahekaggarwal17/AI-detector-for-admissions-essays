import React, { useEffect, useState } from 'react';
import { Database, Layers, Binary, ShieldCheck, Search } from 'lucide-react';

/* ── Donut Chart ── */
function Donut({ segments }) {
  const size = 160, sw = 20, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 200); return () => clearTimeout(t); }, []);

  let off = 0;
  const slices = segments.map((s) => {
    const dash = (s.pct / 100) * circ;
    const sl = { ...s, dash, off };
    off += dash;
    return sl;
  });
  const total = segments.reduce((a, s) => a + s.count, 0);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={sw} />
        {slices.map((s) => (
          <circle
            key={s.label}
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${s.dash} ${circ}`}
            strokeDashoffset={go ? circ - s.off : circ}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out)', transitionDelay: `${slices.indexOf(s) * 0.1}s` }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--fg)', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--fg-3)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>essays</div>
      </div>
    </div>
  );
}

const SEGMENTS = [
  { label: 'Organic Human',      count: 100, pct: 36.4, color: 'var(--green)' },
  { label: 'Pure AI-Generated',  count: 100, pct: 36.4, color: 'var(--red)'   },
  { label: 'AI-Polished Hybrid', count: 50,  pct: 18.2, color: 'var(--amber)' },
  { label: 'ESL Non-Native',     count: 25,  pct:  9.1, color: 'var(--cyan)'  },
];

const ROWS = [
  { label: 'Human Admissions',   color: 'var(--green)', count: 100, source: 'Ivy League & State university personal statements (2018–2023)',     role: 'Baseline: high perplexity, organic burstiness, authentic storytelling.' },
  { label: 'Pure AI Generated',  color: 'var(--red)',   count: 100, source: 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, Llama 3 — zero/few-shot',    role: 'Positive examples: flat surprisal, uniform length, AI transition clichés.' },
  { label: 'AI-Polished Hybrid', color: 'var(--amber)', count: 50,  source: 'Human essays sentence-edited with ChatGPT',                         role: 'Real-world calibration: localised sentence-level AI probability scoring.' },
  { label: 'ESL Student Essays', color: 'var(--cyan)',  count: 25,  source: 'International applicants writing in English as a second language',    role: 'ESL Protection Safeguard validation — eliminates false-positive bias.' },
];

const FORMULAS = [
  { n: '01', label: 'Token Perplexity & Surprisal',  color: 'var(--cyan)',   formula: 'PPL(X) = exp( −1/N · ∑ ln P(wᵢ | w₁…wᵢ₋₁) )',      desc: 'AI prose minimises surprisal, producing unnaturally flat, low-perplexity curves.' },
  { n: '02', label: 'Goh-Barabasi Burstiness Index', color: 'var(--accent)', formula: 'B = (σ − μ) / (σ + μ)  ∈ [−1, +1]',                  desc: 'Human narrative B > −0.15 (rhythmic fluctuations). AI prose B < −0.35 (monotone lengths).' },
  { n: '03', label: 'Shannon Vocabulary Entropy',    color: 'var(--amber)',  formula: 'H(X) = − ∑ p(xᵢ) · log₂ p(xᵢ)',                      desc: 'Measures lexical richness (Guiraud index TTR) to decouple ESL simplicity from robotic uniformity.' },
  { n: '04', label: 'ESL Non-Native Safeguard',      color: 'var(--green)',  formula: 'ESL_Factor = f(CV_burst, 1/Density_AI, Idiomatic)',    desc: 'Suppresses false-positive penalties for international applicants with natural human burstiness.' },
];

export default function DatasetView() {
  const [search, setSearch] = useState('');
  const filtered = ROWS.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase()) ||
    r.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* ── Hero section ── */}
      <div className="section anim-fade-up" style={{ paddingTop: 72 }}>
        <div className="section-label">Corpus Intelligence</div>
        <h2 className="section-title">Calibrated Benchmark Corpus</h2>
        <p className="section-sub">
          275 curated admissions essays spanning Ivy League human writing, frontier LLM
          outputs (GPT-4o, Claude 3.5, Gemini 1.5), AI-polished hybrid drafts, and
          non-native ESL essays for bias elimination.
        </p>
      </div>

      {/* ── Composition ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card card-pad-lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
            <Layers size={15} color="var(--fg-3)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Corpus Composition
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 52, flexWrap: 'wrap' }}>
            <Donut segments={SEGMENTS} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1, minWidth: 260 }}>
              {SEGMENTS.map((s) => (
                <div key={s.label} style={{
                  padding: '16px 18px', borderRadius: 'var(--r-lg)',
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-2)' }}>{s.label}</span>
                  </div>
                  <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>
                    {s.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--fg-3)' }}>{s.pct}% of corpus</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Table ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card card-pad-lg">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={15} color="var(--fg-3)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Category Details
              </span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-2)', padding: '7px 14px',
              borderRadius: 'var(--r-pill)', border: '1px solid var(--line)',
            }}>
              <Search size={13} color="var(--fg-3)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter…"
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--fg)', fontSize: '0.8125rem', width: 140,
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Category', 'Count', 'Source & Lineage', 'Calibration Objective'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: '0.7rem', fontWeight: 700, color: 'var(--fg-3)',
                      textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.label} style={{ borderBottom: '1px solid var(--line-s)' }}>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: row.color }}>{row.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg)' }}>{row.count}</span>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.8125rem', color: 'var(--fg-2)', lineHeight: 1.6 }}>{row.source}</td>
                    <td style={{ padding: '14px', fontSize: '0.8125rem', color: 'var(--fg-3)', lineHeight: 1.6 }}>{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Formulas ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Binary size={15} color="var(--fg-3)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Statistical NLP Formulas
          </span>
        </div>
        <div className="grid-2">
          {FORMULAS.map((f) => (
            <div key={f.n} className="card card-pad">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: f.color }}>{f.label}</span>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--fg-3)' }}>FORMULA {f.n}</span>
              </div>
              <div className="mono" style={{
                fontSize: '0.8125rem', padding: '10px 14px',
                background: 'var(--bg)', borderRadius: 'var(--r-md)',
                border: '1px solid var(--line)', color: 'var(--fg)',
                marginBottom: 12, overflowX: 'auto', whiteSpace: 'nowrap',
              }}>
                {f.formula}
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--fg-3)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scope callout ── */}
      <div className="section" style={{ paddingTop: 0, paddingBottom: 80 }}>
        <div className="card card-pad" style={{ borderLeft: '3px solid var(--amber)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <ShieldCheck size={15} color="var(--amber)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg)' }}>Domain Scope & Ethical Safeguards</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-2)', lineHeight: 1.75, marginBottom: 8 }}>
            <strong style={{ color: 'var(--fg)' }}>Calibrated for:</strong> College admissions personal statements
            (Common App, Coalition, UC Insights). The engine expects first-person narrative,
            reflective insight, and natural human length variance.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-2)', lineHeight: 1.75 }}>
            <strong style={{ color: 'var(--fg)' }}>ESL Protection:</strong> Generic detectors heavily penalise
            non-native English learners. Our safeguard decouples low vocabulary complexity from
            machine generation by rewarding organic sentence burstiness.
          </p>
        </div>
      </div>
    </div>
  );
}
