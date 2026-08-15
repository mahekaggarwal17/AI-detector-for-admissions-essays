import React from 'react';
import { Eye, ShieldAlert, Sparkles, FileText } from 'lucide-react';

export default function SentenceHighlighter({ sentenceHighlights, selectedSentenceId, onSelectSentence }) {
  if (!sentenceHighlights || sentenceHighlights.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 font-mono text-sm">
        No sentence analysis available yet. Analyze an essay to see sentence-by-sentence statistical highlighting.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-gray-900/60 border border-white/5 text-xs">
        <div className="flex items-center gap-2 font-medium text-gray-300">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>Interactive Visual Highlighter (Click any sentence to inspect visible evidence):</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Organic Human (&lt;35% AI)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Polished / Mixed (35-65% AI)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            High AI Risk (&gt;65% AI)
          </span>
        </div>
      </div>

      {/* Rendered Sentence Flow */}
      <div className="p-6 rounded-xl bg-gray-950/80 border border-white/10 text-gray-200 leading-relaxed font-sans text-base min-h-[160px] max-h-[480px] overflow-y-auto">
        {sentenceHighlights.map((s) => {
          const isSelected = selectedSentenceId === s.id;
          return (
            <span
              key={s.id}
              onClick={() => onSelectSentence(s.id)}
              className={`sentence-highlight ${s.highlight_color} ${isSelected ? 'selected' : ''}`}
              title={`Click to inspect Sentence #${s.id + 1} (${s.ai_probability}% AI Risk)`}
            >
              {s.text}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
}
