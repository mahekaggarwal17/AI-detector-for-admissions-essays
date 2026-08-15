import React from 'react';
import { Eye, Layers } from 'lucide-react';

const LEGEND = [
  { color: 'green',  dot: '#10b981', label: 'Organic Human',   range: '<35% AI',   badge: 'sentence-green' },
  { color: 'yellow', dot: '#f59e0b', label: 'Polished / Mixed', range: '35–65%',   badge: 'sentence-yellow' },
  { color: 'red',    dot: '#f43f5e', label: 'High AI Risk',    range: '>65% AI',   badge: 'sentence-red' },
];

export default function SentenceHighlighter({ sentenceHighlights, selectedSentenceId, onSelectSentence }) {
  if (!sentenceHighlights || sentenceHighlights.length === 0) {
    return (
      <div style={{
        padding: '36px 20px', textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif",
      }}>
        Analyze an essay to see sentence-by-sentence statistical highlighting.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Legend Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {LEGEND.map(({ color, dot, label, range }) => (
            <div key={color} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.74rem',
            }}>
              <div style={{
                background: dot,
                boxShadow: `0 0 10px ${dot}`,
                width: '8px', height: '8px',
                borderRadius: '50%',
              }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-muted)', fontSize: '0.7rem',
              }}>
                ({range})
              </span>
            </div>
          ))}
        </div>

        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          Interactive Forensic Mode
        </span>
      </div>

      {/* Rendered Sentences Container */}
      <div style={{
        padding: '22px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(6, 8, 14, 0.65)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'var(--text-primary)',
        lineHeight: 2,
        fontSize: '0.94rem',
        minHeight: '160px',
        maxHeight: '480px',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif",
      }}>
        {sentenceHighlights.map((s, idx) => {
          const isSelected = selectedSentenceId === s.id;
          const colorClass = s.highlight_color === 'red' ? 'sentence-red' : s.highlight_color === 'yellow' ? 'sentence-yellow' : 'sentence-green';
          return (
            <span
              key={s.id}
              onClick={() => onSelectSentence(s.id)}
              className={`sentence-span ${colorClass} ${isSelected ? 'selected' : ''}`}
              title={`Sentence #${s.id + 1} · ${s.ai_probability}% AI risk · Click to inspect`}
            >
              {s.text}{' '}
            </span>
          );
        })}
      </div>

      {/* Stats Summary Strip */}
      <div style={{
        display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace",
        color: 'var(--text-muted)', padding: '0 4px',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            {sentenceHighlights.filter(s => s.highlight_color === 'green').length} Organic Human
          </span>
          <span>·</span>
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>
            {sentenceHighlights.filter(s => s.highlight_color === 'yellow').length} Polished
          </span>
          <span>·</span>
          <span style={{ color: '#fb7185', fontWeight: 600 }}>
            {sentenceHighlights.filter(s => s.highlight_color === 'red').length} High AI Risk
          </span>
        </div>
        <span>{sentenceHighlights.length} Total Sentences Scanned</span>
      </div>
    </div>
  );
}
