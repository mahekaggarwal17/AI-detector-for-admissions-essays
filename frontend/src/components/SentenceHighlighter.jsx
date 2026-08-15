import React from 'react';

const LEGEND = [
  { color: 'green',  dot: '#10b981', label: 'Organic Human',    range: '<35% AI' },
  { color: 'yellow', dot: '#f59e0b', label: 'Polished / Mixed', range: '35–65%' },
  { color: 'red',    dot: '#f43f5e', label: 'High AI Risk',     range: '>65% AI' },
];

export default function SentenceHighlighter({ sentenceHighlights, selectedSentenceId, onSelectSentence }) {
  if (!sentenceHighlights || sentenceHighlights.length === 0) {
    return (
      <div style={{
        padding: '32px', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
      }}>
        Analyze an essay to see sentence-by-sentence statistical highlighting.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: '14px', padding: '10px 14px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {LEGEND.map(({ color, dot, label, range }) => (
          <div key={color} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            fontSize: '0.72rem',
          }}>
            <div className="glow-dot" style={{
              background: dot,
              boxShadow: `0 0 8px ${dot}`,
              width: '7px', height: '7px',
            }} />
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)', fontSize: '0.68rem',
            }}>
              {range}
            </span>
          </div>
        ))}
      </div>

      {/* Rendered Sentences */}
      <div style={{
        padding: '20px',
        borderRadius: '14px',
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'var(--text-primary)',
        lineHeight: 1.85,
        fontSize: '0.9rem',
        minHeight: '140px',
        maxHeight: '460px',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif",
      }}>
        {sentenceHighlights.map((s, idx) => {
          const isSelected = selectedSentenceId === s.id;
          return (
            <span
              key={s.id}
              onClick={() => onSelectSentence(s.id)}
              className={`sentence-highlight ${s.highlight_color} ${isSelected ? 'selected' : ''}`}
              style={{ animationDelay: `${idx * 0.04}s` }}
              title={`Sentence #${s.id + 1} · ${s.ai_probability}% AI risk · Click to inspect`}
            >
              {s.text}{' '}
            </span>
          );
        })}
      </div>

      {/* Stats footer */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-muted)',
      }}>
        <span>
          {sentenceHighlights.filter(s => s.highlight_color === 'green').length} human
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
        <span>
          {sentenceHighlights.filter(s => s.highlight_color === 'yellow').length} mixed
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
        <span>
          {sentenceHighlights.filter(s => s.highlight_color === 'red').length} AI
        </span>
        <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
        <span>{sentenceHighlights.length} total sentences</span>
      </div>
    </div>
  );
}
