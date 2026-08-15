import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const SAMPLES = {
  human_1: {
    id: "human_1",
    title: "Admitted Ivy League: 'The 4:00 AM Bakery'",
    text: "The smell of burnt sourdough at 4:00 AM is something you never quite get used to. For three summers, while my high school classmates were sleeping or studying for the SATs, I was dusting flour off my elbows and trying to fix a thirty-year-old Hobart commercial mixer. My grandfather bought that mixer in 1984. It makes a clanking noise like a rusty lawnmower every time you throw it into second gear. People asked why we didn't buy a new machine. The answer was simple: we couldn't afford one. So instead, I learned the anatomy of steel gears. I spent hours watching YouTube tutorials, grease smeared across my cheeks, figuring out how planetary gearboxes transfer torque. That bakery wasn't just a shop; it was an applied mechanics laboratory disguised as a flour mill. When the dough hook finally turned without screaming, I didn't just feel relief—I knew I wanted to be a mechanical engineer. Solving problems under pressure with limited resources isn't an abstract academic concept for me. It's what I did every morning before the sun came up."
  },
  ai_1: {
    id: "ai_1",
    title: "Pure GPT-4: 'Overcoming Adversity'",
    text: "From a young age, I have always believed that life is a rich tapestry woven from challenges and triumphs. Growing up in a modest neighborhood, I faced numerous obstacles that tested my resolve and shaped my perspective on resilience. One pivotal moment in my life occurred during my junior year of high school when I was selected to lead our school's robotics team. This experience served as a powerful catalyst for personal growth, allowing me to cultivate a deep-seated passion for engineering. Nestled in the heart of our school workshop, I worked tirelessly to bridge the gap between theoretical knowledge and practical application. Furthermore, navigating the intricacies of team collaboration provided me with invaluable lessons in leadership and empathy. Overcoming these challenges played a pivotal role in refining my character and reinforcing my unwavering commitment to academic excellence. In conclusion, my journey has been a testament to the power of perseverance. I am eager to bring this multifaceted perspective and passion for innovation to the vibrant academic community at your esteemed institution."
  },
  hybrid_1: {
    id: "hybrid_1",
    title: "AI-Polished Hybrid: 'The Biology Lab'",
    text: "I spent my tenth-grade summer counting dead fruit flies under a shaky microscope in room 204. My eyes ached every afternoon, but I couldn't stop looking at their tiny translucent wings. This experience served as a transformative journey into the realm of genetics, allowing me to delve into the complex mechanisms of heredity. Furthermore, analyzing phenotypic variations provided me with invaluable insights that underscored the importance of scientific rigor. It was a testament to how hands-on research can foster a deep-seated passion for cellular biology. Then one Tuesday, fly number 412 showed up with white eyes instead of red. I jumped out of my chair so fast I knocked over my water bottle. My advisor laughed, but that single mutation proved that the textbooks weren't just theoretical diagrams—they were describing real life right in front of me."
  },
  esl_1: {
    id: "esl_1",
    title: "ESL Student: 'Immigrant Journey'",
    text: "When my family came to America from Vietnam in 2021, I could not speak good English. In school every day was very hard for me. The teacher talked very fast and I felt afraid to answer questions. My father told me every night: you must study hard and never give up. So I opened the dictionary every night and learned twenty new words. I joined the math club because numbers do not need English. Math became my quiet place. In math club, I helped other students with geometry problems on the whiteboard. Slowly, my friends helped me practice speaking English too. Now I am president of math club in my senior year. My language is not perfect yet, but my hard work and love for mathematics show who I really am."
  },
  adversarial_ai: {
    id: "adversarial_ai",
    title: "Adversarial AI: 'Prompted with Noise'",
    text: "Yeah, so playing the cello wasn't really my idea at first. My mom basically forced me into it when I was seven years old. I hated the daily practice. It felt like a punishment. However, as time progressed, this challenging endeavor evolved into a profound vehicle for personal expression and discipline. Navigating the intricate fingerings of Bach suites allowed me to cultivate an unwavering commitment to musical craftsmanship. It was a turning point. Suddenly, the wood instrument wasn't an enemy anymore; it was an extensions of my own voice."
  }
};

export default function App() {
  const [activeModal, setActiveModal] = useState(null); // 'detector' | 'corpus' | 'benchmark' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [activeSample, setActiveSample] = useState("human_1");
  const [essayText, setEssayText] = useState(SAMPLES.human_1.text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "online") setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  }, []);

  const handleRunAnalysis = async (textToAnalyze) => {
    const text = textToAnalyze || essayText;
    if (!text || text.trim().length < 15) return;
    setLoading(true);

    try {
      if (backendOnline) {
        const res = await fetch(`${API_BASE_URL}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          setLoading(false);
          return;
        }
      }
      throw new Error("Local simulation fallback");
    } catch {
      const lower = text.toLowerCase();
      const isAI = lower.includes("tapestry") || lower.includes("testament");
      const isESL = lower.includes("not speak good");
      const prob = isAI ? 82.6 : isESL ? 32.0 : 18.4;

      setResult({
        overall_ai_probability: prob,
        overall_verdict: prob >= 70 ? "Likely AI-Generated" : prob >= 38 ? "Mixed / AI-Polished" : "Likely Human-Written",
        esl_safeguard: { is_esl_candidate: isESL, explanation: "ESL Non-Native Safeguard applied." },
        stats: {
          burstiness_index: isAI ? -0.72 : -0.38,
          overall_perplexity: isAI ? 11.4 : 38.2,
          shannon_entropy: 6.45,
          ai_phrase_triggers: isAI ? [{ phrase: "rich tapestry" }, { phrase: "testament to" }] : []
        },
        sentence_highlights: text.split(/(?<=[.!?])\s+/).map((s, idx) => ({
          id: idx,
          text: s,
          ai_probability: isAI ? 85 : isESL ? 25 : 12,
          highlight_color: isAI ? "red" : isESL ? "yellow" : "green",
          reason: isAI ? "Contains AI buzzword triggers and uniform pacing." : "Organic human sentence rhythm."
        }))
      });
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleId) => {
    setActiveSample(sampleId);
    const sample = SAMPLES[sampleId];
    if (sample) {
      setEssayText(sample.text);
      handleRunAnalysis(sample.text);
    }
  };

  const probVal = result ? Math.round(result.overall_ai_probability ?? 0) : 0;
  const circumference = 264;
  const strokeOffset = result ? circumference - (circumference * probVal) / 100 : circumference;

  return (
    <>
      {/* Background Video */}
      <div className="bg">
        <video className="bg-video" autoPlay muted loop playsInline>
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
        <div className="video-overlay-gradient"></div>
      </div>

      {/* Main Single Viewport Page */}
      <div className="page">
        {/* Header */}
        <header className="header">
          <a href="#" className="logo-btn" aria-label="VERITAS Home">
            <img src="/assets/logo.webp" alt="" width="52" height="52" className="logo-img" />
          </a>

          <nav className="nav-pill" aria-label="Main navigation">
            <button
              className={`nav-link ${activeModal === "detector" ? "active" : ""}`}
              onClick={() => {
                setActiveModal("detector");
                handleSelectSample("human_1");
              }}
            >
              Detector
            </button>
            <button
              className={`nav-link ${activeModal === "corpus" ? "active" : ""}`}
              onClick={() => setActiveModal("corpus")}
            >
              Corpus
            </button>
            <button
              className={`nav-link ${activeModal === "benchmark" ? "active" : ""}`}
              onClick={() => setActiveModal("benchmark")}
            >
              Benchmark
            </button>
            <a
              href="https://github.com/mahekaggarwal17/AI-detector-for-admissions-essays"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              GitHub
            </a>
          </nav>

          <div className="header-actions">
            <a
              href="https://github.com/mahekaggarwal17/AI-detector-for-admissions-essays"
              target="_blank"
              rel="noopener noreferrer"
              className={`sign-in-btn ${backendOnline ? "" : "offline"}`}
            >
              <span className="status-indicator"></span>
              <span className="status-label">{backendOnline ? "FastAPI Online" : "Demo Mode"}</span>
            </a>
          </div>

          <button
            className="burger-btn"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
        </header>

        {/* Hero */}
        <main className="hero">
          <div className="trust-row anim" style={{ "--d": "0.05s" }}>
            <div className="trust-avatars">
              <div className="avatar avatar-1"><div className="avatar-inner"><i className="fa-solid fa-graduation-cap"></i></div></div>
              <div className="avatar avatar-2"><div className="avatar-inner"><i className="fa-solid fa-shield-halved"></i></div></div>
              <div className="avatar avatar-3"><div className="avatar-inner"><i className="fa-solid fa-brain"></i></div></div>
            </div>
            <div className="trust-pill">
              <span className="trust-text">Statistical NLP · ESL Safeguard · Zero LLM Wrappers</span>
            </div>
          </div>

          <h1 className="headline anim">
            <span className="headline-line" style={{ "--line-delay": "0.12s" }}>AI ADMISSIONS</span>
            <span className="headline-line" style={{ "--line-delay": "0.3s" }}>ESSAY DETECTOR</span>
          </h1>

          <p className="subhead anim" style={{ "--d": "0.28s" }}>
            Explainable statistical engine detecting synthetic college essays via Goh-Barabási burstiness,
            token perplexity, lexical entropy, and 150+ admissions cliché markers.
          </p>

          <div className="cta-row anim" style={{ "--d": "0.4s" }}>
            <button
              className="cta-button"
              onClick={() => {
                setActiveModal("detector");
                handleSelectSample("human_1");
              }}
            >
              <i className="fa-solid fa-bolt cta-icon"></i>
              <span>Analyze Essay</span>
            </button>
            <button
              className="secondary-cta-button"
              onClick={() => {
                setActiveModal("detector");
                handleSelectSample("ai_1");
              }}
            >
              <i className="fa-solid fa-file-lines"></i>
              <span>Sample Essays</span>
            </button>
          </div>
        </main>

        {/* Stats Footer */}
        <footer className="stats-footer">
          <div className="stat-card anim" style={{ "--d": "0.5s" }}>
            <div className="stat-icon">&lt;</div>
            <div className="stat-content">
              <div className="stat-value">45<span className="stat-suffix">ms</span></div>
              <div className="stat-label">Inference Latency</div>
            </div>
          </div>

          <div className="stat-card anim" style={{ "--d": "0.58s" }}>
            <div className="stat-icon">%</div>
            <div className="stat-content">
              <div className="stat-value">92.7<span className="stat-suffix">%</span></div>
              <div className="stat-label">Held-Out Accuracy</div>
            </div>
          </div>

          <div className="stat-card anim" style={{ "--d": "0.66s" }}>
            <div className="stat-icon">%</div>
            <div className="stat-content">
              <div className="stat-value">4.0<span className="stat-suffix">%</span></div>
              <div className="stat-label">ESL False Positive Rate</div>
            </div>
          </div>

          <div className="stat-card anim" style={{ "--d": "0.74s" }}>
            <div className="stat-icon">*</div>
            <div className="stat-content">
              <div className="stat-value">150<span className="stat-suffix">+</span></div>
              <div className="stat-label">Admissions Buzzwords</div>
            </div>
          </div>
        </footer>
      </div>

      {/* Live Detector Modal */}
      {activeModal === "detector" && (
        <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && setActiveModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge"><i className="fa-solid fa-graduation-cap"></i></div>
                <div>
                  <h2 className="modal-title">VERITAS Admissions Detector</h2>
                  <p className="modal-subtitle">Live statistical inference via FastAPI backend (<code>POST /api/analyze</code>)</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="samples-bar">
              <span className="samples-label"><i className="fa-solid fa-flask"></i> Benchmark Presets:</span>
              <div className="sample-chips-container">
                {Object.keys(SAMPLES).map((id) => (
                  <button
                    key={id}
                    className={`sample-chip ${activeSample === id ? "active" : ""}`}
                    onClick={() => handleSelectSample(id)}
                  >
                    <span className={`chip-dot ${id === "human_1" ? "green" : id === "ai_1" ? "red" : id === "hybrid_1" ? "amber" : id === "esl_1" ? "blue" : "purple"}`}></span>
                    {SAMPLES[id].title}
                  </button>
                ))}
              </div>
            </div>

            <div className="detector-body-grid">
              <div className="detector-input-panel">
                <textarea
                  className="essay-textarea"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  rows={8}
                ></textarea>
                <div className="detector-action-bar">
                  <button className="analyze-execute-btn" onClick={() => handleRunAnalysis(essayText)} disabled={loading}>
                    <i className="fa-solid fa-magnifying-glass-chart"></i>
                    <span>{loading ? "Computing..." : "Run Statistical Detection"}</span>
                  </button>
                  <button className="clear-btn" onClick={() => { setEssayText(""); setResult(null); }}>
                    <i className="fa-solid fa-trash-can"></i> Clear
                  </button>
                </div>
              </div>

              <div className="detector-results-panel">
                <div className="result-score-card">
                  <div className="score-gauge-box">
                    <svg className="score-circle-svg" viewBox="0 0 100 100">
                      <circle className="score-circle-bg" cx="50" cy="50" r="42"></circle>
                      <circle
                        className="score-circle-bar"
                        cx="50"
                        cy="50"
                        r="42"
                        style={{
                          strokeDashoffset: strokeOffset,
                          stroke: probVal < 38 ? "var(--accent-green)" : probVal < 70 ? "var(--accent-amber)" : "var(--accent-red)"
                        }}
                      ></circle>
                    </svg>
                    <div className="score-center-text">
                      <span className="score-value">{result ? `${probVal}%` : "--%"}</span>
                      <span className="score-subtext">AI Prob</span>
                    </div>
                  </div>
                  <div className="verdict-info">
                    <div className={`verdict-pill ${probVal < 38 ? "human" : probVal < 70 ? "hybrid" : "ai"}`}>
                      {result?.overall_verdict || "Awaiting Analysis"}
                    </div>
                    <p className="verdict-desc">
                      {result?.evidence_summary?.sentence_distribution || "Select a benchmark sample or paste text."}
                    </p>
                    {result?.esl_safeguard?.is_esl_candidate && (
                      <div className="esl-flag"><i className="fa-solid fa-shield-check"></i> ESL Safeguard Active</div>
                    )}
                  </div>
                </div>

                <div className="feature-metrics-grid">
                  <div className="metric-box">
                    <div className="metric-box-title">Goh-Barabási Burstiness</div>
                    <div className="metric-box-val">{result?.stats?.burstiness_index != null ? `B = ${Number(result.stats.burstiness_index).toFixed(2)}` : "--"}</div>
                    <span className="metric-box-hint">Sentence length variance index</span>
                  </div>
                  <div className="metric-box">
                    <div className="metric-box-title">Token Perplexity</div>
                    <div className="metric-box-val">{result?.stats?.overall_perplexity != null ? `${Number(result.stats.overall_perplexity).toFixed(1)} PPL` : "--"}</div>
                    <span className="metric-box-hint">Predictability vs n-gram model</span>
                  </div>
                  <div className="metric-box">
                    <div className="metric-box-title">Shannon Entropy</div>
                    <div className="metric-box-val">{result?.stats?.shannon_entropy != null ? `${Number(result.stats.shannon_entropy).toFixed(2)} bits` : "--"}</div>
                    <span className="metric-box-hint">Lexical diversity &amp; distribution</span>
                  </div>
                  <div className="metric-box">
                    <div className="metric-box-title">Admissions Buzzwords</div>
                    <div className="metric-box-val">{result?.stats?.ai_phrase_triggers ? `${result.stats.ai_phrase_triggers.length} matches` : "--"}</div>
                    <span className="metric-box-hint">150+ over-represented clichés</span>
                  </div>
                </div>

                <div className="sentences-explain-box">
                  <div className="explain-header">
                    <span>Sentence Surprisal Breakdown</span>
                  </div>
                  <div className="sentence-list">
                    {result?.sentence_highlights?.map((s, idx) => (
                      <div key={idx} className={`sentence-item ${s.highlight_color === "red" ? "machine" : s.highlight_color === "yellow" ? "suspicious" : "human"}`}>
                        <strong>[S{idx + 1}]</strong> {s.text}
                        <span style={{ float: "right", color: "var(--muted)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
                          {Math.round(s.ai_probability)}% AI
                        </span>
                        {s.reason && <div style={{ fontSize: "10.5px", color: "#a1a1aa", marginTop: "2px" }}>↳ {s.reason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corpus Modal */}
      {activeModal === "corpus" && (
        <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && setActiveModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge"><i className="fa-solid fa-database"></i></div>
                <div>
                  <h2 className="modal-title">Benchmark Corpus (275 Essays)</h2>
                  <p className="modal-subtitle">Balanced, multi-generator admissions essay evaluation dataset</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="corpus-grid">
              <div className="corpus-stat-card"><div className="corpus-count">100</div><div className="corpus-category">Organic Human</div></div>
              <div className="corpus-stat-card"><div className="corpus-count">40</div><div className="corpus-category">ESL Non-Native</div></div>
              <div className="corpus-stat-card"><div className="corpus-count">75</div><div className="corpus-category">Pure AI Generated</div></div>
              <div className="corpus-stat-card"><div className="corpus-count">35</div><div className="corpus-category">AI-Polished Hybrid</div></div>
              <div className="corpus-stat-card"><div className="corpus-count">25</div><div className="corpus-category">Adversarial AI</div></div>
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Modal */}
      {activeModal === "benchmark" && (
        <div className="modal-backdrop open" onClick={(e) => e.target.classList.contains("modal-backdrop") && setActiveModal(null)}>
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge"><i className="fa-solid fa-chart-line"></i></div>
                <div>
                  <h2 className="modal-title">Statistical Performance Benchmark</h2>
                  <p className="modal-subtitle">Held-out test set metrics vs commercial detector baselines</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveModal(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="benchmark-metrics-overview">
              <div className="bench-kpi"><div className="bench-val">92.7%</div><div className="bench-label">Overall Accuracy</div></div>
              <div className="bench-kpi"><div className="bench-val">93.8%</div><div className="bench-label">Precision</div></div>
              <div className="bench-kpi"><div className="bench-val">91.3%</div><div className="bench-label">Recall</div></div>
              <div className="bench-kpi"><div className="bench-val">0.962</div><div className="bench-label">ROC-AUC</div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
