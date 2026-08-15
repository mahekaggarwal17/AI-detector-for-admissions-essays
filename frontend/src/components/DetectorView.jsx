import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Trash2, Loader2,
  AlertCircle, BookOpen, Cpu, ArrowRight, X,
} from 'lucide-react';
import SentenceHighlighter from './SentenceHighlighter';
import ExplainabilityPanel from './ExplainabilityPanel';

const CATEGORY_COLORS = {
  'Human':    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  'AI':       { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)',  text: '#fb7185' },
  'Hybrid':   { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  'ESL':      { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' },
  'Adversarial': { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc' },
};

function getCategoryStyle(category = '') {
  const key = Object.keys(CATEGORY_COLORS).find(k => category.includes(k));
  return CATEGORY_COLORS[key] || { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)', text: 'var(--text-secondary)' };
}

export default function DetectorView({ samples }) {
  const [essayText, setEssayText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const charCount = essayText.length;
  const selectedSentence = analysisResult?.sentence_highlights?.find(s => s.id === selectedSentenceId);

  const analyzeText = async (textToAnalyze) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : essayText;
    if (!text || text.length < 20) {
      setErrorMessage('Please paste an essay with at least 2–3 sentences (min 20 characters).');
      return;
    }
    setAnalyzing(true);
    setErrorMessage('');
    setSelectedSentenceId(null);
    setAnalysisResult(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('API failed');
      setAnalysisResult(await response.json());
    } catch {
      setErrorMessage('Failed to connect to backend. Make sure FastAPI is running on :8000.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = (sample) => {
    setEssayText(sample.text);
    setActiveSampleId(sample.id);
    analyzeText(sample.text);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setEssayText(text);
      analyzeText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  useEffect(() => {
    if (samples && samples.length > 0 && !essayText) {
      handleLoadSample(samples[0]);
    }
  }, [samples]);

  const clearAll = () => {
    setEssayText('');
    setAnalysisResult(null);
    setErrorMessage('');
    setSelectedSentenceId(null);
    setActiveSampleId(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
      className="detector-grid">
      <style>{`
        @media (max-width: 1024px) {
          .detector-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Left Column ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Sample Essays */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={13} style={{ color: '#a5b4fc' }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Benchmark Samples
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to load & analyze</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} className="stagger-children">
            {samples?.map((s) => {
              const catStyle = getCategoryStyle(s.category || '');
              const isActive = activeSampleId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleLoadSample(s)}
                  className={`sample-chip ${analyzing && activeSampleId === s.id ? 'loading' : ''}`}
                  style={{
                    background: isActive ? catStyle.bg : 'rgba(255,255,255,0.04)',
                    borderColor: isActive ? catStyle.border : 'rgba(255,255,255,0.06)',
                    animation: 'slideUp 0.4s ease both',
                  }}
                >
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 600,
                    color: isActive ? catStyle.text : 'var(--text-primary)',
                    lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}>
                    {s.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      padding: '1px 7px', borderRadius: '9999px',
                      background: catStyle.bg, color: catStyle.text,
                      border: `1px solid ${catStyle.border}`,
                    }}>
                      {s.category}
                    </span>
                    <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Essay Input */}
        <div className="glass-panel-glow" style={{ padding: '20px', flexGrow: 1 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={15} style={{ color: '#a5b4fc' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Essay Editor
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label
                className="btn-secondary"
                style={{ cursor: 'pointer', padding: '6px 11px', fontSize: '0.75rem' }}
                title="Upload .txt file"
              >
                <Upload size={13} />
                <span>Upload .txt</span>
                <input
                  ref={fileInputRef}
                  type="file" accept=".txt,.md"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>
              {essayText && (
                <button
                  className="btn-ghost"
                  onClick={clearAll}
                  title="Clear"
                  style={{ padding: '6px 10px', color: 'var(--neon-rose)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Drag-Drop + Textarea */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
          >
            <textarea
              ref={textareaRef}
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste a college admissions essay here, or drag & drop a .txt file…"
              rows={14}
              className="essay-textarea"
              style={{
                borderColor: dragOver ? 'rgba(99,102,241,0.5)' : undefined,
                boxShadow: dragOver ? '0 0 0 3px rgba(99,102,241,0.1)' : undefined,
              }}
            />
            {/* Word / Char Counter */}
            <div style={{
              position: 'absolute', bottom: '12px', right: '12px',
              display: 'flex', gap: '10px', alignItems: 'center',
              fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)',
              background: 'rgba(2,4,8,0.8)',
              padding: '4px 10px', borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }}>
              <span style={{ color: wordCount > 0 ? 'var(--text-secondary)' : undefined }}>{wordCount} words</span>
              <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
              <span>{charCount} chars</span>
            </div>

            {/* Drag Overlay */}
            {dragOver && (
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '12px',
                background: 'rgba(79,70,229,0.1)',
                border: '2px dashed rgba(99,102,241,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: '#a5b4fc', fontWeight: 600, gap: '8px',
              }}>
                <Upload size={18} /> Drop to upload
              </div>
            )}
          </div>

          {/* Error */}
          {errorMessage && (
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.8rem', color: '#fb7185',
              animation: 'slideIn 0.3s ease both',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {errorMessage}
            </div>
          )}

          {/* Footer row */}
          <div style={{
            marginTop: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.72rem', color: 'var(--text-muted)',
            }}>
              <Cpu size={12} style={{ color: 'rgba(99,102,241,0.6)' }} />
              Local statistical engine · no data sent to cloud
            </div>
            <button
              className="btn-primary"
              onClick={() => analyzeText()}
              disabled={analyzing || !essayText.trim()}
            >
              {analyzing ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Analyze Essay
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Right Column ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {analysisResult ? (
          <>
            {/* Sentence Highlighter */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={13} style={{ color: '#a5b4fc' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sentence-Level Highlights
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click sentence to inspect</span>
              </div>
              <SentenceHighlighter
                sentenceHighlights={analysisResult.sentence_highlights}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={(id) => setSelectedSentenceId(id === selectedSentenceId ? null : id)}
              />
            </div>

            {/* Explainability Dashboard */}
            <ExplainabilityPanel
              analysisData={analysisResult}
              selectedSentence={selectedSentence}
            />
          </>
        ) : (
          /* Empty State */
          <div className="glass-panel" style={{
            padding: '60px 32px',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
            animation: 'fadeIn 0.5s ease both',
          }}>
            <div className="animate-float" style={{
              width: '72px', height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.1))',
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={32} style={{ color: '#a5b4fc' }} />
            </div>
            <div>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.25rem', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: '10px',
              }}>
                Statistical Detection Workbench
              </h3>
              <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)',
                maxWidth: '340px', lineHeight: 1.7,
              }}>
                Paste an admissions essay or load a benchmark sample on the left.
                The engine will analyze token perplexity, sentence burstiness,
                syntactic uniformity, and AI phrase density — highlighting each sentence with evidence.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Perplexity & Surprisal', 'Burstiness Index', 'AI Phrase Density', 'ESL Safeguard'].map(t => (
                <span key={t} className="badge badge-info" style={{ fontSize: '0.68rem' }}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
