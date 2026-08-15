import React, { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Sparkles, Trash2, Loader2,
  AlertCircle, BookOpen, ArrowRight, Copy, Check, X
} from 'lucide-react';
import SentenceHighlighter from './SentenceHighlighter';
import ExplainabilityPanel from './ExplainabilityPanel';

const CAT_TAG = {
  'Human':       'tag-green',
  'AI':          'tag-red',
  'Hybrid':      'tag-amber',
  'ESL':         'tag-cyan',
  'Adversarial': 'tag-accent',
};
function catTag(cat = '') {
  const k = Object.keys(CAT_TAG).find(k => cat.includes(k));
  return CAT_TAG[k] || 'tag-default';
}

export default function DetectorView({ samples }) {
  const [essay, setEssay]           = useState('');
  const [analyzing, setAnalyzing]   = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const [selId, setSelId]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const [activeSample, setActive]   = useState(null);
  const [copied, setCopied]         = useState(false);
  const fileRef  = useRef(null);

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const selSentence = result?.sentence_highlights?.find(s => s.id === selId);

  const analyze = async (text) => {
    const t = text !== undefined ? text : essay;
    if (!t || t.length < 20) { setError('Paste an essay with at least 2–3 sentences.'); return; }
    setAnalyzing(true); setError(''); setSelId(null); setResult(null);
    try {
      const r = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t }),
      });
      if (!r.ok) throw new Error();
      setResult(await r.json());
    } catch {
      setError('Failed to connect to backend. Ensure FastAPI is running on port 8000.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSample = (s) => {
    setEssay(s.text); setActive(s.id); analyze(s.text);
  };

  const uploadFile = (file) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = (e) => { const t = e.target.result; setEssay(t); setActive(null); analyze(t); };
    fr.readAsText(file);
  };

  const clear = () => { setEssay(''); setResult(null); setError(''); setSelId(null); setActive(null); };
  const copy  = () => { if (!essay) return; navigator.clipboard.writeText(essay); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  useEffect(() => { if (samples?.length && !essay) loadSample(samples[0]); }, [samples]);

  return (
    <div className="section anim-fade-up" style={{ paddingTop: 48 }}>

      {/* Two-column layout */}
      <div className="detector-layout">

        {/* ── Left: Input Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sample essays */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={15} color="var(--fg-3)" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-2)' }}>
                    Benchmark Essays
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--fg-3)' }}>
                    {samples?.length || 5} samples
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--fg-3)' }}>Click to scan</span>
              </div>

              <div className="sample-list">
                {samples?.map((s) => (
                  <button
                    key={s.id}
                    className={`sample-item ${activeSample === s.id ? 'active' : ''}`}
                    onClick={() => loadSample(s)}
                  >
                    <span className="sample-item-title">{s.title}</span>
                    <span className={`tag ${catTag(s.category || '')}`} style={{ flexShrink: 0 }}>
                      {s.category}
                    </span>
                    <ArrowRight size={13} color="var(--fg-3)" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Essay editor */}
          <div className="card" style={{ flexGrow: 1 }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="var(--fg-3)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-2)' }}>
                  Essay Input
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {essay && (
                  <button className="btn-icon" onClick={copy} title="Copy">
                    {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
                  </button>
                )}
                <label className="btn-icon" style={{ cursor: 'pointer' }} title="Upload file">
                  <Upload size={14} />
                  <input
                    ref={fileRef} type="file" accept=".txt,.md"
                    style={{ display: 'none' }}
                    onChange={(e) => uploadFile(e.target.files[0])}
                  />
                </label>
                {essay && (
                  <button className="btn-icon" onClick={clear} title="Clear">
                    <Trash2 size={14} color="var(--red)" />
                  </button>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div
              style={{ padding: 20, position: 'relative' }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]); }}
            >
              <textarea
                value={essay}
                onChange={(e) => { setEssay(e.target.value); setActive(null); }}
                placeholder="Paste a college admissions essay here, or drag & drop a .txt file…"
                rows={13}
                className="essay-area"
                style={{
                  borderColor: dragOver ? 'var(--accent)' : undefined,
                  boxShadow: dragOver ? '0 0 0 3px var(--accent-s)' : undefined,
                }}
              />

              {/* Word count */}
              <div style={{
                position: 'absolute', bottom: 30, right: 30,
                fontSize: '0.72rem', color: 'var(--fg-3)',
                background: 'var(--bg-1)', padding: '3px 10px',
                borderRadius: 'var(--r-pill)', border: '1px solid var(--line)',
                pointerEvents: 'none',
              }}>
                <span className="mono">{words}</span> words
              </div>

              {dragOver && (
                <div style={{
                  position: 'absolute', inset: 20, borderRadius: 'var(--r-lg)',
                  background: 'rgba(124,108,252,0.08)',
                  border: '2px dashed var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem',
                }}>
                  <Upload size={18} /> Drop essay to scan
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                margin: '0 20px 16px', padding: '12px 16px',
                background: 'var(--red-s)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center',
                gap: 10, fontSize: '0.8125rem', color: 'var(--red)',
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Action bar */}
            <div style={{
              padding: '16px 20px', borderTop: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            }}>
              <button
                className="btn btn-primary"
                onClick={() => analyze()}
                disabled={analyzing || !essay.trim()}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                    Computing…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Run Scan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: Results Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {result ? (
            <>
              {/* Sentence heatmap */}
              <div className="card card-pad">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-2)' }}>
                    Sentence Heatmap
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--fg-3)' }}>
                    {result.sentence_highlights?.length} sentences · click to inspect
                  </span>
                </div>
                <SentenceHighlighter
                  sentenceHighlights={result.sentence_highlights}
                  selectedSentenceId={selId}
                  onSelectSentence={(id) => setSelId(id === selId ? null : id)}
                />
              </div>

              {/* Analysis panel */}
              <ExplainabilityPanel
                analysisData={result}
                selectedSentence={selSentence}
              />
            </>
          ) : (
            /* Empty state */
            <div className="card card-pad" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center',
              minHeight: 360, gap: 20,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--r-xl)',
                background: 'var(--accent-b)', border: '1px solid rgba(124,108,252,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={30} color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>
                  Forensic Deck
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--fg-3)', lineHeight: 1.7, maxWidth: 320 }}>
                  Select a benchmark essay or paste your own to generate sentence-level
                  perplexity heat maps, burstiness metrics, and ESL safety scores.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Perplexity', 'Burstiness', 'Entropy', 'AI Markers', 'ESL Shield'].map(t => (
                  <span key={t} className="tag tag-default">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
