import React, { useState } from 'react';
import {
  Download,
  FileCode,
  BookOpen,
  ShieldCheck,
  Hash,
  ExternalLink,
  Check,
  Search,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'metrics' | 'meta' | 'phonetic'>('all');

  const dictionaryEntries = [
    {
      field: 'WER',
      category: 'metrics',
      type: 'Float (%)',
      formula: '100 × (S + D + I) / N',
      denominator: 'N (Total Reference Words)',
      range: '[0.0, ∞) unclamped',
      description: 'Word Error Rate. Percentage of substitutions, deletions, and insertions relative to reference words. Unclamped above 100% per NIST SCTK standard.',
    },
    {
      field: 'MER',
      category: 'metrics',
      type: 'Float (%)',
      formula: '100 × (S + D + I) / (H + S + D + I)',
      denominator: 'Total Alignment Edit Positions',
      range: '[0.0, 100.0]',
      description: 'Match Error Rate. Percentage of non-hit alignment operations relative to total edit steps, bounded strictly between 0 and 100%.',
    },
    {
      field: 'ΔWER',
      category: 'metrics',
      type: 'Float (pp)',
      formula: 'WER_reconstruction - WER_GT',
      denominator: 'N/A (Difference in %)',
      range: '(-∞, +∞)',
      description: 'Ground-truth relative WER change in percentage points. Positive values indicate elevated recognizer errors following neural resynthesis.',
    },
    {
      field: 'PESQ',
      category: 'metrics',
      type: 'Float (MOS-LQO)',
      formula: 'ITU-T P.862 / P.862.1 wideband mapping',
      denominator: 'Per-utterance frame pairs',
      range: '[1.0, 4.5]',
      description: 'Perceptual Evaluation of Speech Quality. Standard intrusive psychoacoustic model comparing neural resynthesis to aligned GT.',
    },
    {
      field: 'STOI',
      category: 'metrics',
      type: 'Float',
      formula: 'Short-Time Objective Intelligibility correlation',
      denominator: '1/3-octave band frames',
      range: '[0.0, 1.0]',
      description: 'Short-Time Objective Intelligibility. Correlates short-time temporal envelopes between degraded/reconstructed and reference speech.',
    },
    {
      field: 'LSD',
      category: 'metrics',
      type: 'Float (dB)',
      formula: 'Mean log-spectral distance across STFT frames',
      denominator: 'Frequency bins & time frames',
      range: '[0.0, ∞) dB',
      description: 'Log-Spectral Distance. Root-mean-square spectral deviation computed between reference and synthesized magnitude spectrograms.',
    },
    {
      field: 'MCD',
      category: 'metrics',
      type: 'Float (dB)',
      formula: '(10√2 / ln 10) × ||c_ref - c_syn||_2',
      denominator: '13-dimensional MFCC vectors',
      range: '[0.0, ∞) dB',
      description: 'Mel-Cepstral Distortion. Euclidean distance between first 13 mel-cepstral coefficients (excluding c0 energy coefficient).',
    },
    {
      field: 'F0 RMSE',
      category: 'metrics',
      type: 'Float (cents)',
      formula: '1200 × |log2(F0_syn / F0_ref)| on voiced frames',
      denominator: 'Mutual voiced frame count',
      range: '[0.0, ∞) cents',
      description: 'Voiced fundamental frequency root-mean-square error measured in cents (100 cents = 1 semitone) via harvest/pyin pitch tracking.',
    },
    {
      field: 'D (Rescue)',
      category: 'metrics',
      type: 'Float (estimand)',
      formula: 'P_recon - P_orig',
      denominator: 'Target evaluation occurrences',
      range: '[-1.0, +1.0]',
      description: 'Context rescue estimand: target recognition accuracy change when expanding presentation from isolated audio crop to full sentence context.',
    },
    {
      field: 'PER',
      category: 'phonetic',
      type: 'Float (%)',
      formula: '100 × (S_ph + D_ph + I_ph) / N_ph',
      denominator: 'Reference phone count (CMUDict)',
      range: '[0.0, ∞) %',
      description: 'Phone Error Rate derived from ASR hypothesis text converted to ARPAbet via G2P. ASR proxy, not independent human panel.',
    },
    {
      field: 'model_id',
      category: 'meta',
      type: 'String',
      formula: 'Identifier: M0 (GT), M1–M14 (Neural)',
      denominator: 'Allowlist of 15 systems',
      range: 'M0..M14',
      description: 'Unique configuration code. Griffin-Lim is strictly excluded across public releases and data tables.',
    },
    {
      field: 'corpus',
      category: 'meta',
      type: 'String',
      formula: 'LJSpeech | LibriTTS | VCTK | Free_ST | pooled',
      denominator: '4 benchmark corpora',
      range: 'Categorical',
      description: 'Source corpus identifier. Balanced evaluation across single-speaker and multi-speaker speech corpora at 22.05 kHz.',
    },
  ];

  const downloads = [
    {
      name: 'Macro Evaluation Metrics (CSV)',
      filename: 'macro_metrics.csv',
      path: './data/macro_metrics.csv',
      size: '4.5 KB',
      format: 'CSV',
      description: 'Pooled benchmark metrics across 120,000 speech files for M0 GT and 14 neural vocoders (WER, MER, ΔWER, PESQ, STOI, LSD, MCD, F0).',
    },
    {
      name: 'Macro Evaluation Metrics (JSON)',
      filename: 'macro_metrics.json',
      path: './data/macro_metrics.json',
      size: '11 KB',
      format: 'JSON',
      description: 'Complete structured JSON array with 95% confidence intervals and standard errors for all evaluated metrics.',
    },
    {
      name: 'Corpus-Stratified Metrics (JSON)',
      filename: 'corpus_metrics.json',
      path: './data/corpus_metrics.json',
      size: '20 KB',
      format: 'JSON',
      description: '56 stratified rows decomposing PESQ, STOI, LSD, and ΔWER across each of the 4 benchmark corpora individually.',
    },
    {
      name: 'Neural Vocoder Registry (JSON)',
      filename: 'models.json',
      path: './data/models.json',
      size: '5.7 KB',
      format: 'JSON',
      description: 'Architectural specifications, conditioning frontends, diffusion/sampling steps, and sample rates for all 15 systems.',
    },
    {
      name: 'Phonetic Analysis Tables (JSON)',
      filename: 'phonetics_data.json',
      path: './data/phonetics_data.json',
      size: '41 KB',
      format: 'JSON',
      description: 'Underlying data for publication figures F01–F20 (phone inventories, durations, confusions, bootstrap CIs, LSD hierarchy, fade ledger).',
    },
    {
      name: 'Screening Protocol Data (JSON)',
      filename: 'protocol_data.json',
      path: './data/protocol_data.json',
      size: '3.9 KB',
      format: 'JSON',
      description: 'Benchmark data for Tables 1, 2, 4, 5, and 6 (ASR diagnostics, context rescue estimand D, screening budgets, logistic predictors).',
    },
    {
      name: 'Target Examples Registry (JSON)',
      filename: 'target_examples.json',
      path: './data/target_examples.json',
      size: '22 KB',
      format: 'JSON',
      description: '24 verified target occurrence examples with transcript contexts, physical timestamps, and multi-ASR hypothesis outcomes.',
    },
  ];

  const checksums = [
    { file: 'models.json', sha256: '85d183c7c72555450e1c196c2dc0036d0d655974650665b0f4704f4a8493a9dd' },
    { file: 'macro_metrics.json', sha256: '38898118f8835f9aded9ff2feb8e8601ffbc36d383e867e2dfea657c26a7d198' },
    { file: 'phonetics_data.json', sha256: 'd386bc25368bd707b725cd4f2251b4c0a979f829c5405faeab74068ad3f69d2e' },
  ];

  const filteredEntries = dictionaryEntries.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Research Resources & Open Data</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
          Complete metric definitions, statistical scoring integrity specifications, verified JSON/CSV data downloads, and reproducibility cryptographic checksums for the Did The Word Survive? benchmark.
        </p>
      </div>

      {/* Downloads Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-500" />
              Verified Demo Exports & Tables
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Self-contained, browser-consumable datasets. Strict allowlist enforced (M0 GT + M1–M14 neural vocoders).
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
            Verified Dataset
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {downloads.map((dl) => (
            <div key={dl.filename} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">{dl.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                    {dl.format}
                  </span>
                  <span className="text-[10px] text-slate-400">{dl.size}</span>
                </div>
                <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">{dl.description}</p>
                <div className="text-[10px] font-mono text-slate-400">Path: {dl.path}</div>
              </div>

              <a
                href={dl.path}
                download={dl.filename}
                className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-sky-600 dark:hover:bg-sky-400 hover:text-white rounded-lg text-xs font-semibold transition-colors shadow-sm self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {dl.filename}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Data Dictionary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                Interactive Data Dictionary & Metric Formulas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact scoring formulas, denominators, and bounds applied across all benchmark evaluations.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search dictionary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            {(['all', 'metrics', 'meta', 'phonetic'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Field / Metric</th>
                <th className="py-2.5 px-4">Type & Range</th>
                <th className="py-2.5 px-4">Mathematical Formula</th>
                <th className="py-2.5 px-4">Denominator</th>
                <th className="py-2.5 px-4">Description & Scoring Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEntries.map((row) => (
                <tr key={row.field} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{row.field}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    <div>{row.type}</div>
                    <div className="text-[10px] text-slate-400">{row.range}</div>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-sky-600 dark:text-sky-400 font-medium">{row.formula}</td>
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{row.denominator}</td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed max-w-sm">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Integrity & Methodology Notes */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Statistical Integrity & Scoring Principles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Unclamped Error Rates</h4>
            <p>
              In compliance with NIST speech recognition scoring standards, word error rates are calculated as $100 \times (S + D + I) / N$ without artificial truncation or clamping at 100%. Extreme acoustic degradation producing insertion loops correctly reflects real error penalties.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Micro-Averaged Pooling</h4>
            <p>
              Reported pooled macro metrics represent true micro-averages computed by summing edit counts $(\sum S + \sum D + \sum I)$ across all utterances and dividing by the total pooled reference words $(\sum N)$, avoiding unweighted skew from variable utterance lengths.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Cluster Multiplicity Retention</h4>
            <p>
              Bootstrap uncertainty estimates (such as F12 Phone Error Rate CIs) preserve utterance and speaker cluster sampling multiplicities, avoiding optimistic variance suppression caused by deduplicated cluster draws.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">Strict Griffin–Lim Exclusion</h4>
            <p>
              Legacy Griffin–Lim phase retrieval is strictly excluded from this benchmark and public repository via an explicit allowlist (M0 GT + M1–M14 neural vocoders), keeping the scientific comparison focused purely on contemporary neural vocoding paradigms.
            </p>
          </div>
        </div>
      </div>

      {/* Cryptographic Checksums */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-sky-500" />
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Cryptographic SHA-256 Checksums</h4>
        </div>
        <div className="space-y-2">
          {checksums.map((cs) => (
            <div key={cs.file} className="flex flex-col sm:flex-row justify-between text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono">
              <span className="font-semibold text-slate-900 dark:text-white">{cs.file}</span>
              <span className="text-slate-500 dark:text-slate-400 break-all select-all">{cs.sha256}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
