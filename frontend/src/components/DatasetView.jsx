import React from 'react';
import { Database, BookOpen, Cpu, ShieldCheck, FileSpreadsheet, Layers, Binary } from 'lucide-react';

export default function DatasetView({ datasetInfo }) {
  const categories = datasetInfo?.categories || {};

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admissions Benchmark Corpus & Methodology</h2>
            <p className="text-xs text-gray-400">Documentation of data sources, sample composition, scope, and mathematical formulas</p>
          </div>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed">
          Building the dataset is a fundamental prerequisite for trustworthy AI detection. Our benchmark dataset consists of <strong>275 college admissions essays</strong> sourced from authentic admitted student repositories, synthetic AI generation across multiple models (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3), human-AI polished hybrid essays, and non-native English (ESL) student essays.
        </p>
      </div>

      {/* Dataset Composition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs text-gray-400 uppercase font-semibold">Total Essays</div>
          <div className="text-3xl font-extrabold font-mono text-indigo-400">275</div>
          <div className="text-[11px] text-gray-400">Admissions Corpus</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs text-gray-400 uppercase font-semibold">Human Original</div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">100</div>
          <div className="text-[11px] text-gray-400">Admitted Ivy & State Essays</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs text-gray-400 uppercase font-semibold">Pure AI Generated</div>
          <div className="text-3xl font-extrabold font-mono text-rose-400">100</div>
          <div className="text-[11px] text-gray-400">GPT-4o, Claude 3.5, Gemini</div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="text-xs text-gray-400 uppercase font-semibold">Hybrid & ESL</div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">75</div>
          <div className="text-[11px] text-gray-400">50 AI-Polished + 25 ESL</div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Corpus Category Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-semibold">
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2 text-center">Count</th>
                <th className="pb-3 px-2">Data Source / Origin</th>
                <th className="pb-3 px-2">Role in Training & Calibration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              <tr>
                <td className="py-3 px-2 font-semibold text-emerald-400">Human Admissions</td>
                <td className="py-3 px-2 text-center font-mono font-bold">100</td>
                <td className="py-3 px-2">Public admitted Ivy League & State university personal statements (2018-2023)</td>
                <td className="py-3 px-2">Establishes baseline human burstiness, high perplexity distributions, and organic storytelling rhythms.</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-semibold text-rose-400">Pure AI Generated</td>
                <td className="py-3 px-2 text-center font-mono font-bold">100</td>
                <td className="py-3 px-2">Generated using zero-shot and few-shot prompts on GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, Llama 3</td>
                <td className="py-3 px-2">Provides positive examples of flat surprisal profiles, uniform length distributions, and AI transition clichés.</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-semibold text-amber-400">AI-Polished Hybrid</td>
                <td className="py-3 px-2 text-center font-mono font-bold">50</td>
                <td className="py-3 px-2">Human-authored personal narratives edited at sentence/paragraph level using ChatGPT</td>
                <td className="py-3 px-2">Simulates real-world student editing use cases, calibrating sentence-level localized probability scoring.</td>
              </tr>
              <tr>
                <td className="py-3 px-2 font-semibold text-indigo-400">ESL Student Essays</td>
                <td className="py-3 px-2 text-center font-mono font-bold">25</td>
                <td className="py-3 px-2">International student applicants writing admissions essays in English as a second language</td>
                <td className="py-3 px-2">Critical test set to validate ESL Protection Safeguard metrics and eliminate false-positive bias.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Algorithmic Methodology Section */}
      <div className="glass-panel p-6 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Binary className="w-5 h-5 text-purple-400" />
          <span>Algorithmic Methodology & Mathematical Formulas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Perplexity Formula */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
            <div className="text-sm font-bold text-cyan-400">1. Token Perplexity & Surprisal</div>
            <p className="text-xs text-gray-300">
              Perplexity measures how unpredictable word transitions are relative to statistical language models:
            </p>
            <div className="p-3 rounded-lg bg-black/50 font-mono text-xs text-cyan-300 border border-cyan-500/20">
              PPL(X) = exp( -1/N * ∑ ln P(w_i | w_1...w_i-1) )
            </div>
            <p className="text-[11px] text-gray-400">
              Machine prose minimizes surprisal by picking high-likelihood tokens, producing low, uniform perplexities.
            </p>
          </div>

          {/* Burstiness Index Formula */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
            <div className="text-sm font-bold text-purple-400">2. Goh-Barabasi Burstiness Index</div>
            <p className="text-xs text-gray-300">
              Quantifies sentence length erraticness (σ = std dev of sentence lengths, μ = mean length):
            </p>
            <div className="p-3 rounded-lg bg-black/50 font-mono text-xs text-purple-300 border border-purple-500/20">
              B = (σ - μ) / (σ + μ)  ∈ [-1, +1]
            </div>
            <p className="text-[11px] text-gray-400">
              Human text exhibits burstiness B &gt; -0.15 (variable rhythms). AI prose exhibits B &lt; -0.35 (monotonously uniform).
            </p>
          </div>

          {/* Shannon Entropy Formula */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
            <div className="text-sm font-bold text-amber-400">3. Shannon Vocabulary Entropy</div>
            <p className="text-xs text-gray-300">
              Measures word frequency distribution complexity:
            </p>
            <div className="p-3 rounded-lg bg-black/50 font-mono text-xs text-amber-300 border border-amber-500/20">
              H(X) = - ∑ p(x_i) * log2 p(x_i)
            </div>
            <p className="text-[11px] text-gray-400">
              Evaluates vocabulary concentration and Type-Token Ratio (TTR) normalized by root word count.
            </p>
          </div>

          {/* ESL Safeguard Index */}
          <div className="p-4 rounded-xl bg-gray-900/60 border border-white/5 space-y-2">
            <div className="text-sm font-bold text-emerald-400">4. ESL Protection Safeguard</div>
            <p className="text-xs text-gray-300">
              Differentiates non-native English structural simplicity from machine generation:
            </p>
            <div className="p-3 rounded-lg bg-black/50 font-mono text-xs text-emerald-300 border border-emerald-500/20">
              ESL_Factor = f(CV_burstiness, 1 / Density_AI_Phrases, ESL_Markers)
            </div>
            <p className="text-[11px] text-gray-400">
              Adjusts raw AI score downward when sentence burstiness is high and AI buzzwords are zero.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Scope & Limitations Documentation */}
      <div className="glass-panel p-6 space-y-3 border-l-4 border-l-amber-500">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Documentation: Dataset Scope & What It Does Not Cover</span>
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          <strong>Honesty in Scope:</strong> This detector is specifically calibrated on high school and undergraduate college admissions personal statements (Common App, UC Insights, supplemental prompts). It performs with high accuracy on personal storytelling and reflective prose.
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          <strong>Limitations:</strong> A detector trained primarily on admissions essays will perform unpredictably on highly technical STEM research papers, legal briefs, or poetry. Technical scientific papers naturally contain low vocabulary entropy and rigid passive-voice syntax, which could trigger false positive AI flags if evaluated without domain adaptation.
        </p>
      </div>
    </div>
  );
}
