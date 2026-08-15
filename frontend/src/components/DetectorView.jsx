import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Trash2, Loader2,
  AlertCircle, BookOpen, Cpu, ArrowRight, X,
  ShieldCheck, Activity, BarChart3, Zap, Layers,
  Copy, Check
} from 'lucide-react';
import SentenceHighlighter from './SentenceHighlighter';
import ExplainabilityPanel from './ExplainabilityPanel';

const CATEGORY_COLORS = {
  'Human':       { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', badge: 'badge-human' },
  'AI':          { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.3)',  text: '#fb7185', badge: 'badge-ai' },
  'Hybrid':      { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', badge: 'badge-hybrid' },
  'ESL':         { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.3)',  text: '#22d3ee', badge: 'badge-esl' },
  'Adversarial': { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', badge: 'badge-info' },
};

function getCategoryStyle(category = '') {
  const key = Object.keys(CATEGORY_COLORS).find(k => category.includes(k));
  return CATEGORY_COLORS[key] || { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.15)', text: 'var(--text-secondary)', badge: 'badge' };
}

export default function DetectorView({ samples }) {
  const [essayText, setEssayText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState(null);
  const [copied, setCopied] = useState(false);
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
      setActiveSampleId(null);
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

  const handleCopy = () => {
    if (!essayText) return;
    navigator.clipboard.writeText(essayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '22px' }}
      className="detector-grid">
      <style>{`
        @media (max-width: 1060px) {
          .detector-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Left Column: Editor & Benchmark Chips ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Benchmark Chips Card */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={14} style={{ color: '#c4b5fd' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Benchmark Essays
                </span>
                <span style={{ marginLeft: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  5 Ground Truth Samples
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to load & scan</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {samples?.map((s) => {
              const catStyle = getCategoryStyle(s.category || '');
              const isActive = activeSampleId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleLoadSample(s)}
                  className={`sample-chip ${isActive ? 'active' : ''} ${analyzing && activeSampleId === s.id ? 'loading' : ''}`}
                  style={{
                    animation: 'slideUp 0.35s ease both',
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}>
                    {s.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '4px' }}>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                      background: catStyle.bg, color: catStyle.text,
                      border: `1px solid ${catStyle.border}`,
                    }}>
                      {s.category}
                    </span>
                    <ArrowRight size={12} style={{ color: isActive ? '#c4b5fd' : 'var(--text-muted)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Essay Editor Studio Frame */}
        <div className="glass-panel-glow" style={{ padding: '24px', flexGrow: 1, position: 'relative' }}>
          {/* Top Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '10px',
                background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FileText size={14} style={{ color: '#22d3ee' }} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Essay Forensic Editor
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {essayText && (
                <button
                  className="btn-secondary"
                  onClick={handleCopy}
                  title="Copy essay"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <label
                className="btn-secondary"
                style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.75rem' }}
                title="Upload .txt or .md file"
              >
                <Upload size={12} />
                <span>Import File</span>
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
                  title="Clear text"
                  style={{ padding: '6px 10px', color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Textarea with Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{ position: 'relative' }}
          >
            <textarea
              ref={textareaRef}
              value={essayText}
              onChange={(e) => {
                setEssayText(e.target.value);
                setActiveSampleId(null);
              }}
              placeholder="Paste a college admissions essay here, or drag & drop a .txt / .md file…"
              rows={15}
              className="essay-textarea"
              style={{
                borderColor: dragOver ? 'rgba(139,92,246,0.8)' : undefined,
                boxShadow: dragOver ? '0 0 0 4px rgba(139,92,246,0.2)' : undefined,
              }}
            />

            {/* Bottom Meta Stats Indicator */}
            <div style={{
              position: 'absolute', bottom: '14px', right: '14px',
              display: 'flex', gap: '12px', alignItems: 'center',
              fontSize: '0.72rem', fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)',
              background: 'rgba(6, 8, 14, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '5px 12px', borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(255,255,255,0.08)',
              pointerEvents: 'none',
            }}>
              <span style={{ color: wordCount > 0 ? 'var(--text-secondary)' : undefined }}>
                <strong>{wordCount}</strong> words
              </span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span>{charCount} chars</span>
            </div>

            {/* Drag Overlay */}
            {dragOver && (
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(99,102,241,0.18)',
                backdropFilter: 'blur(10px)',
                border: '2px dashed rgba(139,92,246,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.95rem', color: '#c4b5fd', fontWeight: 700, gap: '10px',
              }}>
                <Upload size={20} /> Drop essay file to scan
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              marginTop: '14px', padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '0.82rem', color: '#fb7185',
              animation: 'slideIn 0.3s ease both',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {errorMessage}
            </div>
          )}

          {/* Action Row */}
          <div style={{
            marginTop: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.74rem', color: 'var(--text-muted)',
            }}>
              <Cpu size={13} style={{ color: 'rgba(139,92,246,0.7)' }} />
              <span>Statistical Language Model · 100% Deterministic</span>
            </div>

            <button
              className="btn-primary"
              onClick={() => analyzeText()}
              disabled={analyzing || !essayText.trim()}
            >
              {analyzing ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Computing Forensics…</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Statistical Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Right Column: Forensic Results Deck ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {analysisResult ? (
          <>
            {/* Sentence-Level Heatmap Panel */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '10px',
                    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Layers size={14} style={{ color: '#c4b5fd' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Sentence-Level Forensic Heatmap
                    </span>
                    <span style={{ marginLeft: '8px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {analysisResult?.sentence_highlights?.length || 0} Sentences
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Click to inspect signal</span>
              </div>

              <SentenceHighlighter
                sentenceHighlights={analysisResult.sentence_highlights}
                selectedSentenceId={selectedSentenceId}
                onSelectSentence={(id) => setSelectedSentenceId(id === selectedSentenceId ? null : id)}
              />
            </div>

            {/* Explainability & Subscores Deck */}
            <ExplainabilityPanel
              analysisData={analysisResult}
              selectedSentence={selectedSentence}
            />
          </>
        ) : (
          /* Empty State Showcase */
          <div className="glass-panel" style={{
            padding: '70px 36px',
            textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
            animation: 'fadeIn 0.5s ease both',
          }}>
            <div style={{
              width: '80px', height: '80px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 35px rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={36} style={{ color: '#c4b5fd' }} />
            </div>

            <div>
              <h3 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.35rem', fontWeight: 800,
                color: 'var(--text-primary)', marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}>
                Statistical Forensic Command Deck
              </h3>
              <p style={{
                fontSize: '0.88rem', color: 'var(--text-secondary)',
                maxWidth: '380px', lineHeight: 1.75, margin: '0 auto',
              }}>
                Paste an admissions essay or select one of the curated benchmark essays on the left.
                The engine will generate sentence-level perplexity heat maps, Goh-Barabasi burstiness metrics,
                and ESL safety adjustments.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                'Perplexity & Surprisal',
                'Goh-Barabasi Burstiness',
                'Shannon Entropy',
                '150+ Admissions Markers',
                'ESL Safeguard Shield'
              ].map(t => (
                <span key={t} className="badge badge-esl" style={{ fontSize: '0.7rem' }}>{t}</span>
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
