import React, { useState } from 'react';
import {
  PhoneticsData,
  PhoneOccurrence,
  PhoneticClass,
  PhoneDuration,
  ErrorDecomposition,
  BootstrapPerCI,
} from '../types';
import {
  Volume2,
  AlertTriangle,
  Info,
  Maximize2,
  X,
  Layers,
  Activity,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';

interface PhoneticsViewProps {
  phoneticsData: PhoneticsData | null;
}

export const PhoneticsView: React.FC<PhoneticsViewProps> = ({ phoneticsData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'expected' | 'proxy' | 'validated' | 'gallery'>('expected');
  const [selectedFigure, setSelectedFigure] = useState<string | null>(null);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [confusionFilter, setConfusionFilter] = useState('');

  if (!phoneticsData) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Activity className="animate-spin w-6 h-6 mr-3 text-sky-600" />
        <span>Loading phonetic datasets...</span>
      </div>
    );
  }

  // Publication figures list with audit annotations and metadata
  const figures = [
    { id: 'F01', title: 'F01: Alignment Coverage & Manifest Availability', file: 'F01_coverage_heatmap.png', category: 'Inventory', table: 'T_F01', note: 'Audited: Evaluates coverage across 4 corpora and 15 configurations (M0 GT + M1–M14 neural vocoders).' },
    { id: 'F02', title: 'F02: Reference Phone Occurrence Inventory (Pooled)', file: 'F02_phone_occurrence_bars.png', category: 'Inventory', table: 'T_F02', note: 'ARPAbet 39-phone inventory distribution across 8,000 reference utterances.' },
    { id: 'F03', title: 'F03: Phone Occurrence Distribution by Voice Context', file: 'F03_phone_by_corpus_heatmap.png', category: 'Inventory', table: 'T_F03', note: 'Cross-context frequency heatmap across Controlled Studio, Multi-Speaker Diverse, Multi-Accent Regional, and Non-Native / L2 Accented.' },
    { id: 'F04', title: 'F04: Broad Phonetic Class Proportions', file: 'F04_phonetic_class_distributions.png', category: 'Inventory', table: 'T_F04', note: 'Token proportions across Vowels, Stops/Plosives, Fricatives, Nasals, and Approximants.' },
    { id: 'F05', title: 'F05: Reference Phone Duration Distributions', file: 'F05_phone_duration_distributions.png', category: 'Inventory', table: 'T_F05', note: 'MFA-derived phone duration quartiles (P25, median, P75) in milliseconds.' },
    { id: 'F06', title: 'F06: Biphone Transition Probability Matrix', file: 'F06_phone_bigram_heatmap.png', category: 'Inventory', table: 'T_F06', note: 'Empirical phone-to-phone bigram transitions in reference transcripts.' },
    { id: 'F07', title: 'F07: Target Selection Phonetic Composition', file: 'F07_target_selection_composition.png', category: 'Protocol', table: 'T_F07', note: 'Acoustic screening target word characteristics compared to general corpus vocabulary.' },
    { id: 'F08', title: 'F08: Vowel Stress Category Distribution', file: 'F08_stress_category_distributions.png', category: 'Inventory', table: 'T_F08', note: 'Stress levels (Primary 1, Secondary 2, Unstressed 0) and mean durations.' },
    { id: 'F09', title: 'F09: ASR-Derived Phone Confusion Matrix', file: 'F09_confusion_matrices.png', category: 'Error Analysis', table: 'T_F09', note: 'ASR–G2P text proxy confusion matrix. Not listener-perceived error counts.' },
    { id: 'F10', title: 'F10: Phone Error Counts by System & Phoneme', file: 'F10_phone_by_system_error_heatmap.png', category: 'Error Analysis', table: 'T_F10', note: 'Edit counts across 14 neural systems, derived from recognized hypothesis transcripts.' },
    { id: 'F11', title: 'F11: System Phone Error Decomposition (S / D / I)', file: 'F11_system_error_decomposition.png', category: 'Error Analysis', table: 'T_F11', note: 'Decomposition of substitutions, deletions, and insertions across M1–M14.' },
    { id: 'F12', title: 'F12: Bootstrap 95% CIs for Phone Error Rates', file: 'F12_delta_per_ci.png', category: 'Error Analysis', table: 'T_F12', note: 'Audited: Cluster-resampled bootstrap CIs retaining sample multiplicities.' },
    { id: 'F13', title: 'F13: Phone Reference Frequency vs Error Rate', file: 'F13_frequency_vs_error_rate.png', category: 'Error Analysis', table: 'T_F13', note: 'Frequency of phone occurrences vs G2P-derived phone edit rates.' },
    { id: 'F14', title: 'F14: Phonetic Class Error Rates', file: 'F14_phonetic_class_error_rates.png', category: 'Error Analysis', table: 'T_F14', note: 'Error rate comparisons across manner of articulation classes.' },
    { id: 'F15', title: 'F15: Word Duration vs Recognizer Loss Rate', file: 'F15_phone_duration_vs_error.png', category: 'Acoustics', table: 'T_F15', note: 'Audited: Word-level duration quantiles vs recognizer miss rates (screening signal).' },
    { id: 'F16', title: 'F16: Vowel Formant Space (F1 / F2 Reference)', file: 'F16_vowel_formant_space.png', category: 'Acoustics', table: 'T_F16', note: 'Audited: Reference vowel formant grid coordinates for IPA vowel space.' },
    { id: 'F17', title: 'F17: Voiced-Frame F0 RMSE Pitch Deviations', file: 'F17_f0_pitch_distributions.png', category: 'Acoustics', table: 'T_F17', note: 'Voiced frame pitch deviation in cents with standard deviations across neural systems.' },
    { id: 'F18', title: 'F18: Phonetic Class LSD Hierarchy', file: 'F18_phonetic_lsd_hierarchy.png', category: 'Acoustics', table: 'T_F18', note: 'Log-spectral distance (dB) ranked: Plosives > Fricatives > Vowels > Nasals.' },
    { id: 'F19', title: 'F19: Paired Waveform & Spectrogram Diagnostics', file: 'F19_waveform_spectrogram_examples.png', category: 'Acoustics', table: 'T_F19', note: 'Utterance LJ016-0169 target word "as" alignment and spectral reproduction.' },
    { id: 'F20', title: 'F20: Crop Padding & Fade Mask Diagnostic Ledger', file: 'F20_crop_fade_diagnostics.png', category: 'Protocol', table: 'T_F20', note: 'Audited: 150 ms boundary padding and fade overlap risk analysis.' },
  ];

  // Filtering for phone occurrences
  const filteredPhones = (phoneticsData.phone_occurrences || []).filter((p: PhoneOccurrence) => {
    const phone = p.base_phone || p.phone || '';
    const matchesSearch = phone.toLowerCase().includes(phoneSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Scope and Methodological Clarity Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <p className="font-semibold mb-1">Methodological Distinction: Alignment vs Proxy vs Perceptual Validation</p>
            <p className="leading-relaxed">
              MFA forced alignment is <strong>transcript-constrained</strong>: it determines temporal boundaries for intended words and phones, but does <strong>not</strong> independently detect phonetic substitutions or deletions. ASR-derived phone sequences reflect composite speech-recognition and G2P operations. Neither proxy establishes what human listeners heard.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('expected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSubTab === 'expected'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. Expected-Phone Alignment (MFA)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('proxy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSubTab === 'proxy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. ASR-Derived Phone Proxy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('validated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSubTab === 'validated'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>3. Audio-Validated Phone Errors</span>
          <span className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">Pending</span>
        </button>

        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSubTab === 'gallery'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Publication Figure Gallery (F01–F20)</span>
        </button>
      </div>

      {/* SUB-VIEW 1: Expected-Phone Alignment */}
      {activeSubTab === 'expected' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-sky-500" />
              Expected-Phone Alignment (Transcript-Constrained MFA)
            </h3>
            <p className="leading-relaxed">
              Derived using Montreal Forced Aligner v3 with pretrained English acoustic models and CMUDict pronunciation dictionary (10 ms frame shift).
              Alignments establish physical time intervals for intended phonetic segments across GT and 14 neural vocoders.
              Denominators represent verified reference phone occurrences across the 8,000 utterances.
            </p>
          </div>

          {/* Phonetic Classes Summary */}
          {phoneticsData.phonetic_classes && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {phoneticsData.phonetic_classes.map((cls: PhoneticClass, idx: number) => {
                const name = cls.phone_class || cls.class_name || `Class ${idx + 1}`;
                const pct = cls.Percentage ?? cls.token_pct ?? 0;
                const count = cls.Count ?? cls.token_count ?? 0;
                const types = cls.phone_types || (
                  name === 'Vowel' ? '/i, u, ae, ow, ah, ih, er.../' :
                  name === 'Plosive' ? '/p, b, t, d, k, g/' :
                  name === 'Fricative' ? '/s, z, f, v, th, sh.../' :
                  name === 'Nasal' ? '/m, n, ng/' :
                  name === 'Approximant' ? '/l, r, w, y/' :
                  name === 'Affricate' ? '/ch, jh/' : ''
                );
                return (
                  <div key={name} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{name}</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {typeof pct === 'number' ? pct.toFixed(1) : pct}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {typeof count === 'number' ? Math.round(count).toLocaleString() : count} tokens
                    </div>
                    {types && (
                      <div className="text-[11px] font-mono text-slate-400 mt-2 truncate" title={types}>
                        {types}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Phone Occurrence Inventory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Reference Phone Occurrence Inventory (ARPAbet 39)</h4>
                <p className="text-xs text-slate-500">Total tokens across 8,000 pooled speech files with cross-corpus distributions.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter phone (e.g. AH, S, T)..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Phone (ARPAbet)</th>
                    <th className="py-2.5 px-3 text-right">Pooled Count</th>
                    <th className="py-2.5 px-3 text-right">Pooled %</th>
                    <th className="py-2.5 px-3 text-right">Controlled Studio</th>
                    <th className="py-2.5 px-3 text-right">Multi-Speaker Diverse</th>
                    <th className="py-2.5 px-3 text-right">Multi-Accent Regional</th>
                    <th className="py-2.5 px-3 text-right">Non-Native / L2 Accented</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPhones.map((p, idx) => {
                    const phoneName = p.base_phone || p.phone || `P${idx}`;
                    const count = p.Count ?? p.pooled_count ?? 0;
                    const pct = p.Percentage ?? p.pooled_pct ?? 0;
                    return (
                      <tr key={phoneName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-white">{phoneName}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {typeof count === 'number' ? Math.round(count).toLocaleString() : count}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-medium text-sky-600 dark:text-sky-400">
                          {typeof pct === 'number' ? pct.toFixed(2) : pct}%
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">{p.LJSpeech_count != null ? p.LJSpeech_count.toLocaleString() : '-'}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">{p.LibriTTS_count != null ? p.LibriTTS_count.toLocaleString() : '-'}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">{p.VCTK_count != null ? p.VCTK_count.toLocaleString() : '-'}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">{p.Free_ST_count != null ? p.Free_ST_count.toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                  {filteredPhones.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No phone matches "{phoneSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phone Duration Quartiles */}
          {phoneticsData.phone_durations && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">MFA-Derived Reference Phone Durations (ms)</h4>
              <p className="text-xs text-slate-500 mb-4">Duration statistics (mean, median, P25, P75) derived from ground-truth forced alignment.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
                {phoneticsData.phone_durations.slice(0, 24).map((d: PhoneDuration, idx: number) => {
                  const phoneName = d.base_phone || d.phone || `P${idx + 1}`;
                  const count = d.count ?? d.n_tokens ?? 0;
                  const median = d['50%'] ?? d.median_ms ?? (d.mean ? Math.round(d.mean) : 0);
                  const p25 = d['25%'] ?? d.p25_ms ?? 0;
                  const p75 = d['75%'] ?? d.p75_ms ?? 0;
                  const mean = d.mean ?? d.mean_ms ?? 0;
                  const std = d.std ?? d.std_ms ?? 0;
                  return (
                    <div key={phoneName} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{phoneName}</span>
                        <span className="text-xs text-slate-400">{typeof count === 'number' ? Math.round(count).toLocaleString() : count} tokens</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Median (IQR):</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {typeof median === 'number' ? Math.round(median) : median} ms [{typeof p25 === 'number' ? Math.round(p25) : p25}–{typeof p75 === 'number' ? Math.round(p75) : p75}]
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Mean ± Std:</span>
                          <span className="font-mono">
                            {typeof mean === 'number' ? mean.toFixed(1) : mean} ± {typeof std === 'number' ? std.toFixed(1) : std} ms
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vowel Stress & Target Composition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phoneticsData.vowel_stress && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Vowel Stress Distribution (Table T_F08)</h4>
                <div className="space-y-3">
                  {phoneticsData.vowel_stress.map((s: any, idx: number) => {
                    const label = s.stress_label || s.stress_category || `Stress ${idx + 1}`;
                    const count = s.count ?? s.token_count ?? 0;
                    const mean = s.mean ?? s.mean_duration_ms ?? 0;
                    return (
                      <div key={label} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                          <span>{label}</span>
                          <span className="font-mono">{typeof count === 'number' ? Math.round(count).toLocaleString() : count} tokens</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Mean duration: <span className="font-mono font-semibold">{typeof mean === 'number' ? mean.toFixed(1) : mean} ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {phoneticsData.target_composition && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Target Selection Composition (Table T_F07)</h4>
                <p className="text-xs text-slate-500 mb-3">Feature distributions of target words selected for acoustic anomaly inspection.</p>
                <div className="space-y-2 text-xs">
                  {phoneticsData.target_composition.map((tc: any, idx: number) => {
                    const feat = tc['Unnamed: 0'] || tc.feature || `Feature ${idx + 1}`;
                    const targetPct = tc['Target Study Subset (%)'] ?? tc.target_pct ?? 0;
                    const genPct = tc['Reference Cohort (%)'] ?? tc.general_pct ?? 0;
                    return (
                      <div key={feat} className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">
                            {typeof targetPct === 'number' ? targetPct.toFixed(1) : targetPct}% target
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            ({typeof genPct === 'number' ? genPct.toFixed(1) : genPct}% baseline)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ASR-Derived Phone Proxy */}
      {activeSubTab === 'proxy' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">
                <p className="font-semibold mb-1">ASR-Derived Phone Proxy Notice</p>
                <p className="leading-relaxed">
                  These metrics and confusion mappings are derived by passing recognized transcript text through CMUDict G2P conversion.
                  Errors reflect joint speech-recognizer decoding (acoustic model + language model) and G2P dictionary lookup.
                  They represent an operational proxy for intelligibility breakdown, <strong>not</strong> an independent acoustic phone transcription.
                </p>
              </div>
            </div>
          </div>

          {/* System Phone Error Decomposition */}
          {phoneticsData.error_decomposition && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-semibold text-slate-900 dark:text-white">ASR-Derived Phone Error Decomposition by Neural Vocoder</h4>
                <p className="text-xs text-slate-500">Substitutions, Deletions, Insertions, and Total Phone Error Rate (PER %) across M1–M14.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">System</th>
                      <th className="py-2.5 px-4 text-right">Substitutions</th>
                      <th className="py-2.5 px-4 text-right">Deletions</th>
                      <th className="py-2.5 px-4 text-right">Insertions</th>
                      <th className="py-2.5 px-4 text-right">Total PER (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {phoneticsData.error_decomposition.map((row: ErrorDecomposition) => (
                      <tr key={row.System} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.System}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {typeof row.Substitutions === 'number' ? row.Substitutions.toFixed(2) : row.Substitutions}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {typeof row.Deletions === 'number' ? row.Deletions.toFixed(2) : row.Deletions}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          {typeof row.Insertions === 'number' ? row.Insertions.toFixed(2) : row.Insertions}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {typeof row.Total_PER === 'number' ? row.Total_PER.toFixed(2) : row.Total_PER}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bootstrap PER 95% CIs */}
          {phoneticsData.bootstrap_per_ci && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Bootstrap 95% Confidence Intervals for PER (Table T_F12)</h4>
              <p className="text-xs text-slate-500 mb-4">
                Audited implementation: Clustered bootstrap resampling retaining utterance multiplicities across M1–M14.
              </p>

              <div className="space-y-2">
                {phoneticsData.bootstrap_per_ci.map((b: BootstrapPerCI) => (
                  <div key={b.System} className="flex items-center text-xs gap-3">
                    <span className="w-32 font-semibold text-slate-800 dark:text-slate-200 shrink-0 truncate">{b.System}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-4 rounded relative overflow-hidden flex items-center">
                      <div
                        className="bg-indigo-500/30 dark:bg-indigo-400/30 h-full absolute"
                        style={{
                          left: `${Math.max(0, (b.CI_Low / 15) * 100)}%`,
                          width: `${Math.max(1, ((b.CI_High - b.CI_Low) / 15) * 100)}%`,
                        }}
                      />
                      <div
                        className="w-1.5 h-3 bg-indigo-600 dark:bg-indigo-400 absolute rounded-sm"
                        style={{ left: `${Math.max(0, (b.Mean_PER / 15) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-300 shrink-0 text-right w-36">
                      {b.Mean_PER.toFixed(2)}% [{b.CI_Low.toFixed(2)}–{b.CI_High.toFixed(2)}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phonetic LSD Hierarchy & Acoustic Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {phoneticsData.phonetic_lsd_hierarchy && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Phonetic Class LSD Hierarchy (Table T_F18)</h4>
                <p className="text-xs text-slate-500 mb-3">Log-spectral distance (dB) ranked by phonetic manner of articulation.</p>
                <div className="space-y-2">
                  {phoneticsData.phonetic_lsd_hierarchy.map((h: any) => {
                    const lsd = h['Mean LSD (dB)'];
                    const se = h['SE'];
                    return (
                      <div key={h['Phone Class']} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{h['Phone Class']}</span>
                          <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                            {typeof lsd === 'number' ? lsd.toFixed(2) : lsd} dB
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                          <span>SE: ±{typeof se === 'number' ? se.toFixed(3) : se} dB</span>
                          <span>95% CI: [{h['95% CI Range'] || ''}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {phoneticsData.fade_overlap_summary && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Crop Padding & Fade Diagnostic Ledger (Table T_F20)</h4>
                <p className="text-xs text-slate-500 mb-3">Target boundary padding and acoustic fade mask overlap analysis.</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Total Acoustic Targets Evaluated:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{phoneticsData.fade_overlap_summary.total_targets}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Targets with ≥150 ms Natural Padding:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{phoneticsData.fade_overlap_summary.clipped_150ms_padding}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Potential Fade Overlap Risk (Edge Targets):</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{phoneticsData.fade_overlap_summary.fade_mask_overlap_54}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Mean Left / Right Clearance:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {phoneticsData.fade_overlap_summary.mean_left_padding_s}s / {phoneticsData.fade_overlap_summary.mean_right_padding_s}s
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Audio-Validated Phone Errors (Honest Empty State) */}
      {activeSubTab === 'validated' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Narrow Phonetic Human Validation Panel Pending
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              In accordance with research methodology integrity standards, independent acoustic phone error counts (human narrow phonetic transcription panel) are currently in progress. 
              MFA forced alignment provides timing boundaries, and ASR provides text proxy hypotheses, but neither constitutes a ground-truth independent listener phone transcription.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: Field awaiting empirical human annotation verification</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-xs sm:text-sm">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Annotation Protocol Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Listener Panel</div>
                <p>3 trained phonetic annotators conducting blind IPA transcriptions of isolated target segments.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Stimulus Presentation</div>
                <p>Triple-blind presentation of GT vs Neural reconstructions with calibrated sound levels.</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">Agreement Metric</div>
                <p>Inter-annotator Fleiss' Kappa on phone boundary placement and phonetic category shifts.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: Publication Figure Gallery (F01–F20) */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Publication Figures Gallery (F01–F20)</h3>
              <p className="text-xs text-slate-500">All 20 verified manuscript figures with audit annotations and underlying data tables.</p>
            </div>
            <div className="text-xs text-slate-500">
              Click any figure card to inspect at high resolution.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {figures.map((fig) => (
              <div
                key={fig.id}
                onClick={() => setSelectedFigure(fig.file)}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={`./figures/${fig.file}`}
                    alt={fig.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                  </div>
                  <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {fig.id}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {fig.table}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">{fig.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{fig.note}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="font-medium text-sky-600 dark:text-sky-400">{fig.category}</span>
                    <span>Table {fig.table}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for viewing high-res figure */}
      {selectedFigure && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {figures.find((f) => f.file === selectedFigure)?.title}
                </h4>
                <p className="text-xs text-slate-500">
                  {figures.find((f) => f.file === selectedFigure)?.note}
                </p>
              </div>
              <button
                onClick={() => setSelectedFigure(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
              <img
                src={`./figures/${selectedFigure}`}
                alt="Selected figure enlarged"
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 flex justify-between items-center">
              <span>Source Table: {figures.find((f) => f.file === selectedFigure)?.table}</span>
              <button
                onClick={() => setSelectedFigure(null)}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded font-medium text-xs"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
