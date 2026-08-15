import React from 'react';
import { 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  FileSearch,
  Sparkles,
  Info
} from 'lucide-react';

export default function ExplainabilityPanel({ analysisData, selectedSentence }) {
  if (!analysisData) return null;

  const { overall_ai_probability, overall_verdict, subscores, stats, esl_safeguard, evidence_summary } = analysisData;

  return (
    <div className="space-y-6">
      {/* Top Header: Verdict & Score Summary */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Verdict Classification</span>
              {overall_ai_probability >= 70 ? (
                <span className="badge badge-ai">Likely AI-Generated</span>
              ) : overall_ai_probability >= 38 ? (
                <span className="badge badge-hybrid">Mixed / AI-Polished</span>
              ) : (
                <span className="badge badge-human">Organic Human-Written</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {overall_verdict}
            </h2>
            <p className="text-sm text-gray-400">
              {evidence_summary?.sentence_distribution}
            </p>
          </div>

          {/* Probability Gauge Box */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-gray-900/80 border border-white/10">
            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono tracking-tight" style={{
                color: overall_ai_probability >= 70 ? '#fb7185' : overall_ai_probability >= 38 ? '#fbbf24' : '#34d399'
              }}>
                {overall_ai_probability}%
              </div>
              <div className="text-xs font-medium text-gray-400">AI Probability Score</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-gray-800 flex items-center justify-center relative overflow-hidden"
              style={{
                borderColor: overall_ai_probability >= 70 ? 'rgba(244, 63, 94, 0.3)' : overall_ai_probability >= 38 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'
              }}>
              <Zap className="w-6 h-6" style={{
                color: overall_ai_probability >= 70 ? '#f43f5e' : overall_ai_probability >= 38 ? '#f59e0b' : '#10b981'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Sentence Inspector Panel (If sentence clicked) */}
      {selectedSentence && (
        <div className="glass-panel p-6 border-l-4 border-l-indigo-500 bg-indigo-950/20 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <FileSearch className="w-4 h-4" />
              <span>Inspecting Sentence #{selectedSentence.id + 1}</span>
            </div>
            <span className={`badge ${
              selectedSentence.highlight_color === 'red' ? 'badge-ai' : selectedSentence.highlight_color === 'yellow' ? 'badge-hybrid' : 'badge-human'
            }`}>
              {selectedSentence.ai_probability}% AI Risk
            </span>
          </div>

          <p className="text-sm font-medium text-white mb-4 bg-gray-900/60 p-3 rounded-lg border border-white/5 italic">
            "{selectedSentence.text}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-gray-900/60 border border-white/5">
              <div className="text-gray-400 mb-1">Sentence Perplexity</div>
              <div className="text-sm font-bold font-mono text-cyan-400">{selectedSentence.perplexity}</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-white/5">
              <div className="text-gray-400 mb-1">Low-Surprisal Ratio</div>
              <div className="text-sm font-bold font-mono text-purple-400">{(selectedSentence.low_surprisal_ratio * 100).toFixed(0)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/60 border border-white/5">
              <div className="text-gray-400 mb-1">Matched AI Phrases</div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {selectedSentence.triggers.length > 0 ? selectedSentence.triggers.join(', ') : 'None'}
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-300 flex items-start gap-2 bg-indigo-900/20 p-2.5 rounded-lg border border-indigo-500/20">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Evidence:</strong> {selectedSentence.reason}</span>
          </div>
        </div>
      )}

      {/* Subscores Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Perplexity Subscore */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Perplexity & Surprisal</span>
            <span className="font-mono font-bold text-cyan-400">{subscores.perplexity_score}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subscores.perplexity_score}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">
            Avg Perplexity: <span className="text-white font-mono">{stats.overall_perplexity}</span> (SD: {stats.perplexity_std_dev})
          </div>
        </div>

        {/* Burstiness Subscore */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Burstiness & Rhythm</span>
            <span className="font-mono font-bold text-purple-400">{subscores.burstiness_score}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subscores.burstiness_score}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">
            Length CV: <span className="text-white font-mono">{stats.coefficient_of_variation}</span> (Index: {stats.burstiness_index})
          </div>
        </div>

        {/* Syntactic Uniformity */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Syntactic Uniformity</span>
            <span className="font-mono font-bold text-amber-400">{subscores.syntactic_score}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subscores.syntactic_score}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">
            Entropy: <span className="text-white font-mono">{stats.shannon_entropy} bits</span> (TTR: {stats.ttr})
          </div>
        </div>

        {/* AI Phrase Density */}
        <div className="glass-panel p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>AI Buzzword Markers</span>
            <span className="font-mono font-bold text-rose-400">{subscores.ai_phrase_score}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-rose-500 h-2 rounded-full transition-all duration-500" style={{ width: `${subscores.ai_phrase_score}%` }}></div>
          </div>
          <div className="text-[11px] text-gray-400">
            Density: <span className="text-white font-mono">{stats.ai_phrase_density}</span> per 100 words
          </div>
        </div>
      </div>

      {/* Detailed Evidence Observations ("Why It Thinks So") */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span>Why It Thinks So: Visible Evidence Breakdown</span>
        </h3>

        <div className="space-y-3">
          {evidence_summary?.key_observations?.map((obs, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-900/60 border border-white/5 flex items-start gap-4">
              <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                obs.status === 'AI Indicator' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                obs.status === 'Human Indicator' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {obs.status === 'AI Indicator' ? <AlertTriangle className="w-5 h-5" /> :
                 obs.status === 'Human Indicator' ? <CheckCircle2 className="w-5 h-5" /> :
                 <ShieldCheck className="w-5 h-5" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-white">{obs.category}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    obs.status === 'AI Indicator' ? 'bg-rose-950 text-rose-300' :
                    obs.status === 'Human Indicator' ? 'bg-emerald-950 text-emerald-300' :
                    'bg-indigo-950 text-indigo-300'
                  }`}>
                    {obs.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {obs.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ESL Protection Banner */}
      {esl_safeguard && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">ESL Non-Native Protection Safeguard</span>
              <span className="text-gray-300">{esl_safeguard.explanation}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-mono font-bold text-indigo-300">{esl_safeguard.esl_confidence}% Confidence</div>
            <div className="text-[10px] text-gray-400">ESL Safeguard Index</div>
          </div>
        </div>
      )}
    </div>
  );
}
