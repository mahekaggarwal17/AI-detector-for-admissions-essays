import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Database, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  GraduationCap,
  Layers
} from 'lucide-react';

import DetectorView from './components/DetectorView';
import DatasetView from './components/DatasetView';
import EvaluationView from './components/EvaluationView';

export default function App() {
  const [activeTab, setActiveTab] = useState('detector'); // 'detector', 'dataset', 'evaluation'
  const [samples, setSamples] = useState([]);
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [evalReport, setEvalReport] = useState(null);

  useEffect(() => {
    // Fetch initial backend resources
    fetch('http://127.0.0.1:8000/api/samples')
      .then(res => res.json())
      .then(data => setSamples(data.samples || []))
      .catch(err => console.error('Error fetching samples:', err));

    fetch('http://127.0.0.1:8000/api/dataset')
      .then(res => res.json())
      .then(data => setDatasetInfo(data))
      .catch(err => console.error('Error fetching dataset:', err));

    fetch('http://127.0.0.1:8000/api/evaluation')
      .then(res => res.json())
      .then(data => setEvalReport(data))
      .catch(err => console.error('Error fetching evaluation:', err));
  }, []);

  return (
    <div className="min-h-screen pb-16">
      {/* Top Header Navbar */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>VERITAS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  Admissions AI Detector
                </span>
              </h1>
              <p className="text-[11px] text-gray-400">Statistical & Explainable Detection Engine</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 p-1 bg-gray-900/80 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('detector')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'detector'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Detector</span>
            </button>

            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'dataset'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Corpus & Data</span>
            </button>

            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Honest Evaluation</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'detector' && (
          <DetectorView samples={samples} />
        )}

        {activeTab === 'dataset' && (
          <DatasetView datasetInfo={datasetInfo} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView evalReport={evalReport} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-gray-500 font-mono">
        Veritas AI Admissions Detector &bull; Statistical Language Model Engine &bull; No LLM Wrappers &bull; ESL Safeguards Active
      </footer>
    </div>
  );
}
