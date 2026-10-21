import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { InteractiveEvaluatorView } from './components/InteractiveEvaluatorView';
import { WaveformAnalysisView } from './components/WaveformAnalysisView';
import { CompareView } from './components/CompareView';
import { PhoneticsView } from './components/PhoneticsView';
import { AsrModelsView } from './components/AsrModelsView';
import { ProtocolView } from './components/ProtocolView';
import { ResourcesView } from './components/ResourcesView';
import { Footer } from './components/Footer';
import { AccessibilityWidget } from './components/AccessibilityWidget';
import {
  TabType,
  ModelInfo,
  CorpusInfo,
  RecognizerInfo,
  MacroMetric,
  CorpusMetric,
  PhoneticsData,
  ProtocolData,
  TargetExample,
} from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedUtteranceId, setSelectedUtteranceId] = useState<string | null>(null);

  // Default: check localStorage or current classList
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Keep DOM class and localStorage in sync with isDark state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [corpora, setCorpora] = useState<CorpusInfo[]>([]);
  const [recognizers, setRecognizers] = useState<RecognizerInfo[]>([]);
  const [macroMetrics, setMacroMetrics] = useState<Record<string, MacroMetric>>({});
  const [corpusMetrics, setCorpusMetrics] = useState<CorpusMetric[]>([]);
  const [phoneticsData, setPhoneticsData] = useState<PhoneticsData | null>(null);
  const [protocolData, setProtocolData] = useState<ProtocolData | null>(null);
  const [targetExamples, setTargetExamples] = useState<TargetExample[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const VALID_TABS: TabType[] = [
    'overview',
    'evaluator',
    'waveform',
    'compare',
    'phonetics',
    'asr',
    'protocol',
    'resources'
  ];

  // Hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        setActiveTab('overview');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Synchronize document title
  useEffect(() => {
    const tabTitles: Record<TabType, string> = {
      overview: 'Overview',
      evaluator: 'Interactive Evaluator',
      waveform: 'SPSS & Waveform Analysis',
      compare: 'Vocoder Comparison',
      phonetics: 'Phonetic Vulnerability',
      asr: 'ASR Models',
      protocol: 'Evaluation Protocol',
      resources: 'Data & Resources',
    };
    document.title = `Did The Word Survive? · ${tabTitles[activeTab] || 'Benchmark'}`;
  }, [activeTab]);

  const handleTabChange = (tab: TabType, utteranceId?: string) => {
    if (utteranceId) {
      setSelectedUtteranceId(utteranceId);
    }
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load all data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [m, c, r, mm, cm, ph, pr, te] = await Promise.all([
          fetch('./data/models.json'),
          fetch('./data/corpora.json'),
          fetch('./data/recognizers.json'),
          fetch('./data/macro_metrics.json'),
          fetch('./data/corpus_metrics.json'),
          fetch('./data/phonetics_data.json'),
          fetch('./data/protocol_data.json'),
          fetch('./data/target_examples.json'),
        ]);
        if (!m.ok || !mm.ok) throw new Error('Failed to load primary manifest.');
        const [mD, cD, rD, mmD, cmD, phD, prD, teD] = await Promise.all([
          m.json(), c.json(), r.json(), mm.json(), cm.json(), ph.json(), pr.json(), te.json(),
        ]);
        setModels(mD);
        setCorpora(cD);
        setRecognizers(rD);
        setMacroMetrics(mmD);
        setCorpusMetrics(cmD);
        setPhoneticsData(phD);
        setProtocolData(prD);
        setTargetExamples(teD);
      } catch (err: any) {
        setLoadError(err.message || 'Error loading data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const [homeResetTrigger, setHomeResetTrigger] = useState<number>(0);

  const handleLogoClick = () => {
    setActiveTab('overview');
    window.location.hash = 'overview';
    setHomeResetTrigger((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFF] dark:bg-[#0D1117] text-[#14213D] dark:text-[#E6F0F8] transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab)}
        onLogoClick={handleLogoClick}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 anim-fade-in">
            <div className="w-12 h-12 rounded-full border-4 border-[#88DFF2] border-t-[#F294C8] animate-spin" />
            <p className="text-sm font-medium text-[#5A7086] dark:text-[#7A9BB8]">
              Loading 120,000-waveform benchmark…
            </p>
          </div>
        )}

        {loadError && !isLoading && (
          <div className="bg-[#F65936]/10 border border-[#F65936]/30 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 anim-scale-in">
            <AlertCircle className="w-8 h-8 text-[#F65936] mx-auto mb-3" />
            <h3 className="font-bold text-[#F65936] mb-1">Dataset Load Error</h3>
            <p className="text-xs text-[#5A7086] mb-4">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F65936] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="anim-fade-up">
            {activeTab === 'overview' && (
              <OverviewView
                models={models}
                corpora={corpora}
                corpusMetrics={corpusMetrics}
                macroMetrics={macroMetrics}
                onNavigate={handleTabChange}
                homeResetTrigger={homeResetTrigger}
              />
            )}
            {activeTab === 'evaluator' && <InteractiveEvaluatorView />}
            {activeTab === 'waveform' && (
              <WaveformAnalysisView
                selectedUtteranceId={selectedUtteranceId}
                onSelectUtterance={(id) => setSelectedUtteranceId(id)}
              />
            )}
            {activeTab === 'compare' && (
              <CompareView
                models={models}
                corpora={corpora}
                recognizers={recognizers}
                macroMetrics={macroMetrics}
                corpusMetrics={corpusMetrics}
                targetExamples={targetExamples}
              />
            )}
            {activeTab === 'phonetics' && <PhoneticsView phoneticsData={phoneticsData} />}
            {activeTab === 'asr' && <AsrModelsView />}
            {activeTab === 'protocol' && <ProtocolView protocolData={protocolData} />}
            {activeTab === 'resources' && <ResourcesView />}
          </div>
        )}
      </main>

      <Footer currentTab={activeTab} onSelectTab={(tab) => handleTabChange(tab)} />
      <AccessibilityWidget
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSetTheme={(dark) => setIsDark(dark)}
      />
    </div>
  );
};

export default App;
