import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import SentenceHighlighter from './SentenceHighlighter';
import ExplainabilityPanel from './ExplainabilityPanel';

export default function DetectorView({ samples, onSelectSample }) {
  const [essayText, setEssayText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);

  // Auto-analyze when sample essay is loaded
  const handleLoadSample = (sample) => {
    setEssayText(sample.text);
    analyzeText(sample.text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setEssayText(text);
        analyzeText(text);
      };
      reader.readAsText(file);
    }
  };

  const analyzeText = async (textToAnalyze) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : essayText;
    if (!text || text.strip?.() === '' || text.length < 20) {
      setErrorMessage('Please paste an essay with at least 2-3 sentences (minimum 20 characters).');
      return;
    }

    setAnalyzing(true);
    setErrorMessage('');
    setSelectedSentenceId(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Analysis API request failed.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to connect to local backend detector engine. Make sure FastAPI server is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Select first sample by default on mount if empty
  useEffect(() => {
    if (samples && samples.length > 0 && !essayText) {
      handleLoadSample(samples[0]);
    }
  }, [samples]);

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const charCount = essayText.length;

  const selectedSentence = analysisResult?.sentence_highlights?.find(s => s.id === selectedSentenceId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Text Input & Pre-loaded Samples */}
      <div className="lg:col-span-6 space-y-6">
        {/* Sample Essays Launcher */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Load Pre-Loaded Admissions Benchmark Samples:</span>
            </h3>
            <span className="text-[11px] text-gray-400">Click any sample to test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {samples?.map((s) => (
              <button
                key={s.id}
                onClick={() => handleLoadSample(s)}
                className="p-3 rounded-lg bg-gray-900/60 border border-white/5 text-left hover:border-indigo-500/50 hover:bg-gray-800/80 transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                  {s.title}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                  <span>{s.category}</span>
                  <span className="text-indigo-400 font-medium">Load & Analyze &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Essay Input Card */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Admissions Essay Input Editor</span>
            </div>

            <div className="flex items-center gap-2">
              {/* File Upload */}
              <label className="btn-secondary text-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt</span>
                <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
              </label>

              {/* Clear Button */}
              <button
                onClick={() => { setEssayText(''); setAnalysisResult(null); setErrorMessage(''); }}
                className="btn-secondary text-xs text-rose-400 hover:text-rose-300"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste college admissions essay here..."
              rows={14}
              className="w-full p-4 rounded-xl bg-gray-950/80 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all font-sans text-sm leading-relaxed resize-y"
            />

            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-gray-400 flex gap-3 pointer-events-none bg-gray-900/80 px-2.5 py-1 rounded-md border border-white/5">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Local statistical feature extraction (Zero LLM wrapper APIs)</span>
            </div>

            <button
              onClick={() => analyzeText()}
              disabled={analyzing || !essayText.trim()}
              className="btn-primary"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Statistics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Essay Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Sentence Visualizer & Explainability Dashboard */}
      <div className="lg:col-span-6 space-y-6">
        {analysisResult ? (
          <>
            {/* Interactive Sentence Visualizer */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Sentence-Level AI Highlighting</span>
                </h3>
                <span className="text-xs text-gray-400">Click sentence to inspect evidence</span>
              </div>

              <SentenceHighlighter
                sentenceHighlights={analysisResult.sentence_highlights}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={(id) => setSelectedSentenceId(id === selectedSentenceId ? null : id)}
              />
            </div>

            {/* Explainability Report ("Why It Thinks So") */}
            <ExplainabilityPanel
              analysisData={analysisResult}
              selectedSentence={selectedSentence}
            />
          </>
        ) : (
          <div className="glass-panel p-12 text-center space-y-4 text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Statistical AI Detection Workbench</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Paste an admissions essay or click a pre-loaded sample on the left. The engine will extract token perplexities, sentence length burstiness, syntactic rhythm uniformity, and AI phrase density to highlight machine-generated passages with visible evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
