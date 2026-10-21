import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { ModelInfo, CorpusInfo, RecognizerInfo, MacroMetric, CorpusMetric, TargetExample } from '../types';
import {
  Play, Pause, Volume2, VolumeX,
  CheckCircle2, XCircle, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown,
  Sliders, RefreshCw, Music, BarChart3, Mic2
} from 'lucide-react';

interface CompareViewProps {
  models: ModelInfo[];
  corpora: CorpusInfo[];
  recognizers: RecognizerInfo[];
  macroMetrics: Record<string, MacroMetric>;
  corpusMetrics: CorpusMetric[];
  targetExamples: TargetExample[];
}

// Model display info
const MODEL_META: Record<string, { name: string; color: string }> = {
  M0:  { name: 'GT (Reference)', color: '#14213D' },
  M1:  { name: 'RNDVoC',        color: '#F294C8' },
  M2:  { name: 'Flow2GAN',      color: '#88DFF2' },
  M3:  { name: 'VOCOS',         color: '#64BF56' },
  M4:  { name: 'BridgeVoC',     color: '#F2C53D' },
  M5:  { name: 'PeriodWave-Turbo', color: '#F65936' },
  M6:  { name: 'ComVo-Base',    color: '#B57BED' },
  M7:  { name: 'BigVGAN-v2',    color: '#F294C8' },
  M8:  { name: 'BigVGAN-Base',  color: '#88DFF2' },
  M9:  { name: 'ComVo-Large',   color: '#64BF56' },
  M10: { name: 'WaveFM',        color: '#F2C53D' },
  M11: { name: 'HiFi-GAN',      color: '#F65936' },
  M12: { name: 'FreeV',         color: '#B57BED' },
  M13: { name: 'RFWave',        color: '#F294C8' },
  M14: { name: 'PeriodWave',    color: '#88DFF2' },
};

export interface TargetStimulusInfo {
  id: string;
  corpus: string;
  corpusLabel: string;
  word: string;
  durationMs: number;
  xmin: number;
  xmax: number;
  phonemes: string;
  transcript: string;
}

export const TARGET_STIMULI: TargetStimulusInfo[] = [
  {
    id: 'LJ016-0169',
    corpus: 'LJSpeech',
    corpusLabel: 'Controlled Studio',
    word: 'as',
    durationMs: 170,
    xmin: 0.0,
    xmax: 0.17,
    phonemes: '/æ z/',
    transcript: '...as more humane principles were introduced into prison management.',
  },
  {
    id: 'LJ011-0139',
    corpus: 'LJSpeech',
    corpusLabel: 'Controlled Studio',
    word: 'this',
    durationMs: 210,
    xmin: 0.0,
    xmax: 0.21,
    phonemes: '/ð ɪ s/',
    transcript: 'This was one of the most remarkable cases...',
  },
  {
    id: '7134_67200_000014_000001',
    corpus: 'LibriTTS',
    corpusLabel: 'Multi-Speaker Diverse',
    word: 'doll',
    durationMs: 270,
    xmin: 0.0,
    xmax: 0.27,
    phonemes: '/d ɑ l/',
    transcript: '...the doll was very pretty.',
  },
  {
    id: '1752_16632_000035_000004',
    corpus: 'LibriTTS',
    corpusLabel: 'Multi-Speaker Diverse',
    word: 'even',
    durationMs: 430,
    xmin: 0.04,
    xmax: 0.47,
    phonemes: '/i v ə n/',
    transcript: 'Even so, there was little hope.',
  },
  {
    id: 'p240_006',
    corpus: 'VCTK',
    corpusLabel: 'Multi-Accent Regional',
    word: 'when',
    durationMs: 200,
    xmin: 0.92,
    xmax: 1.12,
    phonemes: '/w ɛ n/',
    transcript: 'When the sunlight strikes raindrops in the air...',
  },
  {
    id: 'f0003_us_f0003_00128',
    corpus: 'Free_ST',
    corpusLabel: 'Non-Native / L2 Accented',
    word: 'real',
    durationMs: 250,
    xmin: 2.32,
    xmax: 2.57,
    phonemes: '/r i l/',
    transcript: '...a real danger that...',
  },
  {
    id: 'm0001_us_m0001_00104',
    corpus: 'Free_ST',
    corpusLabel: 'Non-Native / L2 Accented',
    word: 'tomatoes',
    durationMs: 880,
    xmin: 4.11,
    xmax: 4.99,
    phonemes: '/t ə m eɪ t oʊ z/',
    transcript: '...fresh tomatoes at the market...',
  },
];

type SortField = 'id' | 'wer' | 'delta_wer' | 'pesq' | 'f0_rmse_cents' | 'lsd';

export const CompareView: React.FC<CompareViewProps> = ({
  models,
  corpora,
  recognizers,
  macroMetrics,
  corpusMetrics,
  targetExamples,
}) => {
  const [activeSection, setActiveSection] = useState<'table' | 'audio' | 'words'>('table');
  const [selectedCorpus, setSelectedCorpus] = useState('pooled');
  const [sortField, setSortField] = useState<SortField>('delta_wer');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedUtteranceId, setSelectedUtteranceId] = useState<string>('LJ016-0169');
  const [selectedAudioVocoderKey, setSelectedAudioVocoderKey] = useState('flow2gan');
  const [audioPlayMode, setAudioPlayMode] = useState<'full' | 'short'>('full');
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState('as');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStimulus = useMemo(
    () => TARGET_STIMULI.find(s => s.id === selectedUtteranceId) || TARGET_STIMULI[0],
    [selectedUtteranceId]
  );

  // --- Table rows (Strictly bound to selected corpus) ---
  const tableRows = useMemo(() => {
    const isPooled = selectedCorpus === 'pooled';

    const rows = models.map((m) => {
      if (isPooled) {
        const macro = macroMetrics[m.key] || {} as Partial<MacroMetric>;
        return {
          id: m.id,
          key: m.key,
          name: m.short_name || m.name,
          full_name: m.name,
          is_reference: m.is_reference,
          wer: macro.wer ?? null,
          delta_wer: macro.delta_wer ?? null,
          pesq: macro.pesq ?? null,
          stoi: macro.stoi ?? null,
          lsd: macro.lsd ?? null,
          f0_rmse_cents: macro.f0_rmse_cents ?? null,
          is_corpus_specific: false,
        };
      } else {
        // Find matching corpus metric row
        const cm = corpusMetrics.find(
          (c) =>
            (c.corpus.toLowerCase() === selectedCorpus.toLowerCase()) &&
            (c.model_id === m.id || c.key === m.key)
        );
        const macro = macroMetrics[m.key] || {} as Partial<MacroMetric>;

        // Reference speech baseline WER for each corpus
        const refWerByCorpus: Record<string, number> = {
          LJSpeech: 6.39,
          LibriTTS: 11.64,
          VCTK: 13.26,
          Free_ST: 4.85,
        };

        return {
          id: m.id,
          key: m.key,
          name: m.short_name || m.name,
          full_name: m.name,
          is_reference: m.is_reference,
          wer: m.is_reference ? (refWerByCorpus[selectedCorpus] ?? 5.94) : (cm?.wer ?? macro.wer ?? null),
          delta_wer: m.is_reference ? 0.0 : (cm?.delta_wer ?? null),
          pesq: m.is_reference ? 4.50 : (cm?.pesq ?? null),
          stoi: m.is_reference ? 1.00 : (cm?.stoi ?? null),
          lsd: m.is_reference ? 0.00 : (cm?.lsd ?? null),
          f0_rmse_cents: null, // Evaluated pooled across 120k cohort
          is_corpus_specific: true,
        };
      }
    });

    rows.sort((a, b) => {
      const af = a[sortField as keyof typeof a] as number | null;
      const bf = b[sortField as keyof typeof b] as number | null;
      if (af == null && bf == null) return 0;
      if (af == null) return 1;
      if (bf == null) return -1;
      return sortAsc ? (af as number) - (bf as number) : (bf as number) - (af as number);
    });

    return rows;
  }, [models, macroMetrics, corpusMetrics, selectedCorpus, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(field === 'pesq' ? false : true); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortAsc ? <ArrowUp className="w-3 h-3 text-[#F294C8]" /> : <ArrowDown className="w-3 h-3 text-[#F294C8]" />;
  };

  // --- Audio player ---
  const gtModel = models.find(m => m.is_reference);
  const neuralModels = models.filter(m => m.is_neural);

  // Stop audio on change of utterance, vocoder, or play mode
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
      setActiveAudioId(null);
    }
  }, [selectedUtteranceId, selectedAudioVocoderKey, audioPlayMode]);

  const playAudio = useCallback((id: string, src: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.ontimeupdate = null;
    }
    if (activeAudioId === id) {
      setActiveAudioId(null);
      return;
    }
    const audio = new Audio(src);
    audioRef.current = audio;

    if (audioPlayMode === 'short') {
      audio.currentTime = currentStimulus.xmin;
      audio.ontimeupdate = () => {
        if (audio.currentTime >= currentStimulus.xmax) {
          audio.pause();
          audio.ontimeupdate = null;
          setActiveAudioId(null);
        }
      };
    }

    audio.play().catch(() => {});
    audio.onended = () => setActiveAudioId(null);
    setActiveAudioId(id);
  }, [activeAudioId, audioPlayMode, currentStimulus]);

  const selectedVocoderModel = models.find(m => m.key === selectedAudioVocoderKey);
  const gtSrc = `./audio/${currentStimulus.id}_gt.wav`;
  const recoSrc = `./audio/${currentStimulus.id}_${selectedAudioVocoderKey}.wav`;

  // Build F0/PESQ comparison bar chart data (Dynamically updates with selectedCorpus!)
  const barChartData = useMemo(() => {
    return neuralModels.map(m => {
      const row = tableRows.find(r => r.key === m.key);
      const mm = macroMetrics[m.key] || {} as Partial<MacroMetric>;
      return {
        id: m.id,
        key: m.key,
        name: m.short_name || m.name,
        pesq: row?.pesq ?? mm.pesq ?? 0,
        wer: row?.wer ?? mm.wer ?? 0,
        f0: row?.f0_rmse_cents ?? mm.f0_rmse_cents ?? 0,
        delta_wer: row?.delta_wer ?? mm.delta_wer ?? 0,
      };
    }).sort((a, b) => b.pesq - a.pesq);
  }, [neuralModels, tableRows, macroMetrics]);

  // --- Word recognition grid ---
  const availableWords = useMemo(() => {
    const ws = new Set(targetExamples.map(e => e.target_word));
    return Array.from(ws);
  }, [targetExamples]);

  const wordGrid = useMemo(() => {
    const entries = targetExamples.filter(e => e.target_word === selectedWord);
    // Map by model_id
    const byModel: Record<string, TargetExample> = {};
    entries.forEach(e => { byModel[e.model_id] = e; });
    return byModel;
  }, [targetExamples, selectedWord]);

  return (
    <div className="space-y-6 anim-fade-up">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'table', label: '📊 Benchmark Table', color: '#F294C8' },
          { id: 'audio', label: '🎧 Audio Comparison', color: '#88DFF2' },
          { id: 'words', label: '🗣 Word Recognition Grid', color: '#64BF56' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeSection === s.id
                ? 'text-[#14213D] border-transparent shadow-sm'
                : 'bg-white dark:bg-[#161B22] border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:border-opacity-80'
            }`}
            style={activeSection === s.id ? { backgroundColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ==================== SECTION 1: Benchmark Table ==================== */}
      {activeSection === 'table' && (
        <div className="anim-scale-in space-y-4">
          {/* Corpus filter */}
          <div className="bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'pooled', label: '🌐 Pooled (All 4 Contexts)' },
                { id: 'LJSpeech', label: 'Controlled Studio' },
                { id: 'LibriTTS', label: 'Multi-Speaker Diverse' },
                { id: 'VCTK', label: 'Multi-Accent Regional' },
                { id: 'Free_ST', label: 'Non-Native / L2 Accented' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorpus(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    selectedCorpus === c.id
                      ? 'border-[#0284C7] bg-[#88DFF2] text-[#0D1B2A] font-bold shadow-xs ring-2 ring-[#88DFF2]/50 scale-[1.02]'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22] text-[#5A7086] dark:text-[#7A9BB8] hover:border-[#88DFF2]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-[#5A7086] dark:text-[#7A9BB8] font-mono">
              {selectedCorpus === 'pooled'
                ? '✦ 120,000 evaluated waveforms · 8,000 per model'
                : `Voice Context: ${
                    selectedCorpus === 'LJSpeech' ? 'Controlled Studio (LJSpeech · 2,000 utts)' :
                    selectedCorpus === 'LibriTTS' ? 'Multi-Speaker Diverse (LibriTTS · 2,000 utts)' :
                    selectedCorpus === 'VCTK' ? 'Multi-Accent Regional (VCTK · 1,999 utts)' :
                    selectedCorpus === 'Free_ST' ? 'Non-Native / L2 Accented (Free_ST · 2,000 utts)' : selectedCorpus
                  }`}
            </div>
          </div>

          {/* Active Voice Context Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/40 dark:from-[#1A2332] dark:to-[#0D1117] border border-[#88DFF2]/40 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64BF56] animate-pulse" />
              <span className="text-xs font-bold text-[#14213D] dark:text-white">
                Active Benchmark Filter:{' '}
                <span className="text-[#0284C7] dark:text-[#88DFF2]">
                  {selectedCorpus === 'pooled'
                    ? 'Pooled Cross-Corpus Evaluation (120,000 Waveforms · 8,000 Utterances per Model)'
                    : selectedCorpus === 'LJSpeech'
                    ? 'Controlled Studio: LJSpeech (Single US Female Speaker · 2,000 Utterances · 22.05 kHz)'
                    : selectedCorpus === 'LibriTTS'
                    ? 'Multi-Speaker Diverse: LibriTTS (247 US Speakers · 2,000 Utterances · 24 kHz)'
                    : selectedCorpus === 'VCTK'
                    ? 'Multi-Accent Regional: VCTK (109 Regional British/English Speakers · 1,999 Utterances · 48 kHz)'
                    : 'Non-Native / L2 Accented: Free_ST (445 Mandarin-Accented Speakers · 2,000 Utterances · 16 kHz)'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8]">
                {tableRows.length} Systems Sorted by {sortField.toUpperCase()} ({sortAsc ? 'Ascending ↑' : 'Descending ↓'})
              </span>
            </div>
          </div>

          {/* Main table */}
          <div className="bg-white dark:bg-[#161B22] rounded-2xl border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="border-b border-[#D6EDF8] dark:border-[#2A3F54] bg-[#F0F8FF] dark:bg-[#1A2332]">
                  <tr>
                    <th className="py-3 px-4 font-bold text-[#14213D] dark:text-[#E6F0F8] w-8">ID</th>
                    <th className="py-3 px-4 font-bold text-[#14213D] dark:text-[#E6F0F8]">Vocoder / System</th>
                    <th
                      className="py-3 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('wer')}
                      title="Sort by Word Error Rate"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        WER (↓) <SortIcon field="wer" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('delta_wer')}
                      title="Sort by ΔWER"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        ΔWER (↓) <SortIcon field="delta_wer" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('pesq')}
                      title="Sort by PESQ"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        PESQ (↑) <SortIcon field="pesq" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('lsd')}
                      title="Sort by Log-Spectral Distance"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        LSD dB (↓) <SortIcon field="lsd" />
                      </div>
                    </th>
                    <th
                      className="py-3 px-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      onClick={() => handleSort('f0_rmse_cents')}
                      title="Sort by F0 RMSE"
                    >
                      <div className="flex items-center gap-1 font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        F0 RMSE ¢ (↓) <SortIcon field="f0_rmse_cents" />
                      </div>
                    </th>
                    <th className="py-3 px-3 font-bold text-[#14213D] dark:text-[#E6F0F8]">PESQ Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D6EDF8] dark:divide-[#2A3F54]">
                  {tableRows.map((row, i) => {
                    const isGT = row.is_reference;
                    const meta = MODEL_META[row.id] || { color: '#88DFF2' };
                    const pesqMax = 4.5;
                    const pesqPct = row.pesq ? (row.pesq / pesqMax) * 100 : 0;
                    const deltaColor = (row.delta_wer ?? 0) > 0.3 ? '#F65936' : (row.delta_wer ?? 0) > 0.05 ? '#F2C53D' : '#64BF56';

                    return (
                      <tr
                        key={row.key}
                        className={`hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] transition-colors ${isGT ? 'bg-[#88DFF2]/8 dark:bg-[#88DFF2]/5' : ''}`}
                        style={{ animationDelay: `${i * 0.03}s` }}
                      >
                        <td className="py-2.5 px-4">
                          <span
                            className="inline-flex items-center justify-center w-8 h-6 rounded text-[10px] font-black text-white"
                            style={{ backgroundColor: meta.color }}
                          >
                            {row.id}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#14213D] dark:text-[#E6F0F8]">
                          {row.full_name}
                          {isGT && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-[#88DFF2]/30 text-[#14213D]">Reference</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold" style={{ color: isGT ? '#14213D' : '#5A7086' }}>
                          {row.wer != null ? `${row.wer.toFixed(2)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold" style={{ color: isGT ? '#14213D' : deltaColor }}>
                          {isGT ? '-' : row.delta_wer != null ? `+${row.delta_wer.toFixed(2)} pp` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold" style={{ color: isGT ? '#14213D' : row.pesq && row.pesq > 4.0 ? '#64BF56' : row.pesq && row.pesq > 3.5 ? '#F2C53D' : '#F65936' }}>
                          {row.pesq != null ? row.pesq.toFixed(3) : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold" style={{ color: isGT ? '#14213D' : '#5A7086' }}>
                          {row.lsd != null ? `${row.lsd.toFixed(2)} dB` : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                          {row.f0_rmse_cents != null ? `${(row.f0_rmse_cents as number).toFixed(1)} ¢` : '-'}
                        </td>
                        <td className="py-2.5 px-3 w-32">
                          {row.pesq != null && (
                            <div className="h-3 bg-[#D6EDF8] dark:bg-[#2A3F54] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pesqPct}%`, backgroundColor: meta.color }}
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual PESQ + WER dynamic charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] rounded-2xl p-5">
              <h4 className="font-bold text-sm text-[#14213D] dark:text-[#E6F0F8] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#88DFF2]" /> PESQ Score by Vocoder (↑)
                </span>
                <span className="text-[11px] font-mono text-[#0284C7] dark:text-[#88DFF2]">
                  {selectedCorpus === 'pooled' ? 'Pooled 120k' : selectedCorpus}
                </span>
              </h4>
              <div className="space-y-2">
                {barChartData.map(d => (
                  <div key={d.key} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-[#5A7086] dark:text-[#7A9BB8] truncate font-medium">{d.name}</span>
                    <div className="flex-1 h-4 bg-[#F0F8FF] dark:bg-[#1A2332] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 flex items-center px-2"
                        style={{ width: `${(d.pesq / 4.5) * 100}%`, backgroundColor: MODEL_META[d.id]?.color || '#88DFF2' }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono font-bold text-[#14213D] dark:text-[#E6F0F8]">
                      {d.pesq.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] rounded-2xl p-5">
              <h4 className="font-bold text-sm text-[#14213D] dark:text-[#E6F0F8] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-[#F294C8]" /> Word Error Rate WER % (↓)
                </span>
                <span className="text-[11px] font-mono text-[#F294C8]">
                  {selectedCorpus === 'pooled' ? 'Pooled 120k' : selectedCorpus}
                </span>
              </h4>
              <div className="space-y-2">
                {barChartData
                  .slice()
                  .sort((a, b) => a.wer - b.wer)
                  .map(d => (
                    <div key={d.key} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-[#5A7086] dark:text-[#7A9BB8] truncate font-medium">{d.name}</span>
                      <div className="flex-1 h-4 bg-[#F0F8FF] dark:bg-[#1A2332] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, (d.wer / 16) * 100)}%`,
                            backgroundColor: d.wer < 6 ? '#64BF56' : d.wer < 11 ? '#F2C53D' : '#F65936',
                          }}
                        />
                      </div>
                      <span className="w-14 text-right font-mono font-bold text-[#14213D] dark:text-[#E6F0F8]">
                        {d.wer.toFixed(2)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION 2: Audio Comparison ==================== */}
      {activeSection === 'audio' && (
        <div className="anim-scale-in space-y-6">
          <div className="bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#88DFF230' }}>
                <Music className="w-5 h-5 text-[#88DFF2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#14213D] dark:text-[#E6F0F8]">Audio Pairwise Comparison</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2]">
                    {currentStimulus.corpusLabel}
                  </span>
                </div>
                <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
                  Utterance <span className="font-mono font-bold">{currentStimulus.id}</span> · Target word: <span className="font-mono font-bold text-[#F65936]">"{currentStimulus.word}"</span> ({currentStimulus.phonemes}) · Duration: <span className="font-semibold">{currentStimulus.durationMs} ms</span>
                </p>
                <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] italic mt-0.5 truncate max-w-xl">
                  "{currentStimulus.transcript}"
                </p>
              </div>
            </div>

            {/* Stimulus Selector Strip */}
            <div className="mb-4">
              <div className="text-[11px] font-bold text-[#5A7086] dark:text-[#7A9BB8] mb-1.5 uppercase tracking-wider">
                Select Utterance Stimulus Across Corpora:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_STIMULI.map((stim) => {
                  const isSelected = selectedUtteranceId === stim.id;
                  return (
                    <button
                      key={stim.id}
                      onClick={() => setSelectedUtteranceId(stim.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#88DFF2] text-[#14213D] border-[#88DFF2] font-bold shadow-sm'
                          : 'bg-white dark:bg-[#161B22] border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:border-[#88DFF2]/60'
                      }`}
                    >
                      <span className="font-mono text-[10px] uppercase opacity-75">{stim.corpus}:</span>
                      <span>"{stim.word}"</span>
                      <span className="text-[10px] opacity-60 font-mono">({stim.durationMs}ms)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playback Mode (Full vs Target Segment) */}
            <div className="flex items-center gap-2 mb-5 bg-[#F0F8FF] dark:bg-[#1A2332] p-2 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] w-fit flex-wrap">
              <span className="text-xs font-bold text-[#14213D] dark:text-[#E6F0F8] px-1">Audio Mode:</span>
              <button
                onClick={() => setAudioPlayMode('full')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  audioPlayMode === 'full'
                    ? 'bg-[#14213D] text-white dark:bg-[#88DFF2] dark:text-[#14213D] shadow-sm'
                    : 'text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#14213D]'
                }`}
              >
                Full Utterance
              </button>
              <button
                onClick={() => setAudioPlayMode('short')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  audioPlayMode === 'short'
                    ? 'bg-[#F294C8] text-[#14213D] shadow-sm font-bold'
                    : 'text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#14213D]'
                }`}
              >
                Target Word Segment ("{currentStimulus.word}" · {currentStimulus.durationMs}ms)
              </button>
            </div>

            {/* Vocoder selector */}
            <div className="mb-6">
              <div className="text-[11px] font-bold text-[#5A7086] dark:text-[#7A9BB8] mb-1.5 uppercase tracking-wider">
                Select Vocoder Model to Compare Against M0 (Ground Truth):
              </div>
              <div className="flex flex-wrap gap-2">
                {neuralModels.map(m => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedAudioVocoderKey(m.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedAudioVocoderKey === m.key
                        ? 'border-[#F294C8] text-[#14213D] font-bold shadow-sm'
                        : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:border-[#F294C8]/50'
                    }`}
                    style={selectedAudioVocoderKey === m.key ? { backgroundColor: '#F294C8' } : {}}
                  >
                    {MODEL_META[m.id]?.name || m.short_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-up audio players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GT */}
              <div className="bg-[#F0F8FF] dark:bg-[#1A2332] rounded-xl p-5 border border-[#88DFF2]/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: '#14213D' }}>M0</span>
                  <div>
                    <div className="font-bold text-xs text-[#14213D] dark:text-[#E6F0F8]">Ground Truth (GT)</div>
                    <div className="text-[10px] text-[#5A7086]">22.05 kHz · Reference</div>
                  </div>
                </div>

                {/* Waveform viz placeholder */}
                <div className="h-12 bg-white dark:bg-[#161B22] rounded-lg mb-3 overflow-hidden flex items-end gap-0.5 px-2 py-1">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${20 + Math.abs(Math.sin(i * 0.7 + 1) * 30)}%`,
                        backgroundColor: '#88DFF2',
                        opacity: activeAudioId === 'gt' ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => playAudio('gt', gtSrc)}
                  className="w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all text-white"
                  style={{ backgroundColor: '#88DFF2', color: '#14213D' }}
                >
                  {activeAudioId === 'gt' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {activeAudioId === 'gt' ? 'Pause GT' : 'Play GT'}
                </button>
              </div>

              {/* Neural vocoder */}
              <div className="bg-[#FFF5FC] dark:bg-[#1A2332] rounded-xl p-5 border border-[#F294C8]/40">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-[#14213D]"
                    style={{ backgroundColor: '#F294C8' }}
                  >
                    {selectedVocoderModel?.id || 'M?'}
                  </span>
                  <div>
                    <div className="font-bold text-xs text-[#14213D] dark:text-[#E6F0F8]">{selectedVocoderModel?.name}</div>
                    <div className="text-[10px] text-[#5A7086]">{selectedVocoderModel?.sample_rate} kHz · Neural</div>
                  </div>
                </div>

                <div className="h-12 bg-white dark:bg-[#161B22] rounded-lg mb-3 overflow-hidden flex items-end gap-0.5 px-2 py-1">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${15 + Math.abs(Math.sin(i * 0.65 + 2) * 35)}%`,
                        backgroundColor: '#F294C8',
                        opacity: activeAudioId === 'neural' ? 1 : 0.5,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => playAudio('neural', recoSrc)}
                  className="w-full py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: '#F294C8', color: '#14213D' }}
                >
                  {activeAudioId === 'neural' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {activeAudioId === 'neural' ? 'Pause Neural' : 'Play Neural'}
                </button>
              </div>
            </div>

            {/* PESQ / F0 comparison badges */}
            {selectedVocoderModel && macroMetrics[selectedVocoderModel.key] && (() => {
              const mm = macroMetrics[selectedVocoderModel.key];
              const gtMm = macroMetrics['gt'];
              return (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'WER', val: `${mm.wer?.toFixed(2)}%`, ref: `GT: ${gtMm?.wer?.toFixed(2)}%`, color: '#88DFF2' },
                    { label: 'ΔWER', val: `+${mm.delta_wer?.toFixed(2)} pp`, ref: 'vs GT', color: (mm.delta_wer ?? 0) < 0.1 ? '#64BF56' : '#F2C53D' },
                    { label: 'PESQ', val: mm.pesq?.toFixed(3), ref: 'Ref: 4.500', color: '#F294C8' },
                    { label: 'F0 RMSE', val: `${mm.f0_rmse_cents?.toFixed(1)} ¢`, ref: 'Pitch accuracy', color: '#F2C53D' },
                  ].map(b => (
                    <div key={b.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: b.color + '22', border: `1px solid ${b.color}55` }}>
                      <div className="text-[10px] font-semibold text-[#5A7086] dark:text-[#7A9BB8] mb-0.5">{b.label}</div>
                      <div className="text-base font-black" style={{ color: b.color }}>{b.val}</div>
                      <div className="text-[10px] text-[#5A7086] dark:text-[#7A9BB8]">{b.ref}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================== SECTION 3: Word Recognition Grid ==================== */}
      {activeSection === 'words' && (
        <div className="anim-scale-in space-y-4">
          <div className="bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] rounded-2xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h3 className="font-bold text-[#14213D] dark:text-[#E6F0F8] flex items-center gap-2">
                  <span className="text-lg">🗣</span>
                  Word Recognition Comparison Across All 14 Vocoders
                </h3>
                <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
                  Select a word to see which vocoders correctly preserved it vs which ones lost it.
                  <span className="ml-2 font-semibold" style={{ color: '#64BF56' }}>✓ = Correctly recognized</span>
                  <span className="ml-2 font-semibold" style={{ color: '#F65936' }}>✗ = Recognition lost</span>
                </p>
              </div>
              <div className="flex gap-2">
                {availableWords.map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWord(w)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all border ${
                      selectedWord === w
                        ? 'text-[#14213D] border-transparent'
                        : 'border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:border-[#64BF56]/50'
                    }`}
                    style={selectedWord === w ? { backgroundColor: '#64BF56' } : {}}
                  >
                    "{w}"
                  </button>
                ))}
              </div>
            </div>

            {/* Grid: one row per vocoder */}
            <div className="space-y-2">
              {/* GT row */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#88DFF218' }}>
                <div className="flex items-center gap-2 w-40">
                  <span className="w-8 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white" style={{ backgroundColor: '#14213D' }}>M0</span>
                  <span className="text-xs font-bold text-[#14213D] dark:text-[#E6F0F8]">GT Reference</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#64BF56' }} />
                    <span className="text-xs text-[#5A7086]">Whisper ✓</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#64BF56' }} />
                    <span className="text-xs text-[#5A7086]">Wav2Vec2 ✓</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#64BF56', color: '#14213D' }}>
                    Baseline
                  </span>
                </div>
              </div>

              {/* Neural vocoder rows */}
              {neuralModels.map((m, i) => {
                const ex = wordGrid[m.id];
                const hasData = !!ex;
                const whisperOk = ex ? ex.recon_rec_whisper : null;
                const w2vOk = ex ? ex.recon_rec_w2v : null;
                const bothOk = whisperOk && w2vOk;
                const bothFail = hasData && !whisperOk && !w2vOk;
                const partial = hasData && (whisperOk !== w2vOk);
                const meta = MODEL_META[m.id];
                const bgColor = bothOk ? '#64BF5612' : bothFail ? '#F6593612' : partial ? '#F2C53D12' : '#F0F8FF';

                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: bgColor,
                      animationDelay: `${i * 0.04}s`,
                      borderLeft: `3px solid ${meta?.color || '#88DFF2'}`,
                    }}
                  >
                    {/* Model badge */}
                    <div className="flex items-center gap-2 w-40">
                      <span
                        className="w-8 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white shrink-0"
                        style={{ backgroundColor: meta?.color || '#88DFF2', color: '#14213D' }}
                      >
                        {m.id}
                      </span>
                      <span className="text-xs font-semibold text-[#14213D] dark:text-[#E6F0F8] truncate">
                        {meta?.name || m.short_name}
                      </span>
                    </div>

                    {/* Recognition outcomes */}
                    {hasData ? (
                      <div className="flex items-center gap-4 flex-1 flex-wrap">
                        {/* Whisper */}
                        <div className="flex items-center gap-1.5">
                          {whisperOk
                            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#64BF56' }} />
                            : <XCircle className="w-5 h-5 shrink-0" style={{ color: '#F65936' }} />
                          }
                          <span className="text-xs text-[#5A7086]">Whisper</span>
                        </div>

                        {/* Wav2Vec2 */}
                        <div className="flex items-center gap-1.5">
                          {w2vOk
                            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#64BF56' }} />
                            : <XCircle className="w-5 h-5 shrink-0" style={{ color: '#F65936' }} />
                          }
                          <span className="text-xs text-[#5A7086]">Wav2Vec2</span>
                        </div>

                        {/* Status badge */}
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: bothOk ? '#64BF56' : bothFail ? '#F65936' : '#F2C53D',
                            color: '#14213D',
                          }}
                        >
                          {bothOk ? '✓ Both preserved' : bothFail ? '✗ Both lost' : '⚡ Partial'}
                        </span>

                        {/* Hypothesis snippet */}
                        {ex.w2v_hypothesis && (
                          <span className="text-[10px] font-mono text-[#5A7086] dark:text-[#7A9BB8] hidden sm:block truncate max-w-48" title={ex.w2v_hypothesis}>
                            "{ex.w2v_hypothesis.slice(0, 40)}{ex.w2v_hypothesis.length > 40 ? '…' : ''}"
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                        <span className="px-2 py-0.5 rounded-full bg-[#D6EDF8] dark:bg-[#2A3F54] text-[10px]">
                          No target occurrence recorded for "{selectedWord}"
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 p-3 rounded-xl bg-[#F0F8FF] dark:bg-[#1A2332] border border-[#D6EDF8] dark:border-[#2A3F54] text-xs text-[#5A7086] dark:text-[#7A9BB8]">
              <strong className="text-[#14213D] dark:text-[#E6F0F8]">Note:</strong> This grid shows verified target word occurrences from the 24-example acoustic inspection subset.
              "Both preserved" = both Whisper and Wav2Vec2 correctly decoded the word in the neural reconstruction.
              "Both lost" = neither ASR correctly decoded it after reconstruction.
              Only models with recorded target occurrence data are shown with outcomes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
