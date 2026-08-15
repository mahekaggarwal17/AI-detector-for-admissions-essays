import React from 'react';

const LEGEND = [
  { cls: 's-green', dot: 'var(--green)', label: 'Human',   range: '< 35%' },
  { cls: 's-amber', dot: 'var(--amber)', label: 'Mixed',   range: '35–65%' },
  { cls: 's-red',   dot: 'var(--red)',   label: 'High AI', range: '> 65%' },
];

export default function SentenceHighlighter({ sentenceHighlights, selectedSentenceId, onSelectSentence }) {
  if (!sentenceHighlights?.length) {
    return (
      <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--fg-3)', fontSize: '0.875rem' }}>
        Analyze an essay to view the sentence-level heatmap.
      </div>
    );
  }

  const greens  = sentenceHighlights.filter(s => s.highlight_color === 'green').length;
  const yellows = sentenceHighlights.filter(s => s.highlight_color === 'yellow').length;
  const reds    = sentenceHighlights.filter(s => s.highlight_color === 'red').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {LEGEND.map(({ cls, dot, label, range }) => (
          <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
            <span style={{ color: 'var(--fg-2)', fontWeight: 500 }}>{label}</span>
            <span className="mono" style={{ color: 'var(--fg-3)', fontSize: '0.7rem' }}>{range}</span>
          </div>
        ))}
        <span className="mono" style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-3)' }}>
          {sentenceHighlights.length} sentences
        </span>
      </div>

      {/* Sentence text */}
      <div className="sentence-block">
        {sentenceHighlights.map((s) => {
          const cls = s.highlight_color === 'red' ? 's-red' : s.highlight_color === 'yellow' ? 's-amber' : 's-green';
          return (
            <span
              key={s.id}
              className={`s-span ${cls} ${selectedSentenceId === s.id ? 'selected' : ''}`}
              onClick={() => onSelectSentence(s.id)}
              title={`#${s.id + 1} · ${s.ai_probability}% AI risk`}
            >
              {s.text}{' '}
            </span>
          );
        })}
      </div>

      {/* Counts strip */}
      <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem' }}>
        <span className="mono" style={{ color: 'var(--green)' }}>{greens} human</span>
        <span style={{ color: 'var(--fg-3)' }}>·</span>
        <span className="mono" style={{ color: 'var(--amber)' }}>{yellows} mixed</span>
        <span style={{ color: 'var(--fg-3)' }}>·</span>
        <span className="mono" style={{ color: 'var(--red)' }}>{reds} high AI</span>
      </div>
    </div>
  );
}
