import React from 'react';
import { ProtocolData } from '../types';
import {
  Workflow,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Database,
  BarChart,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface ProtocolViewProps {
  protocolData: ProtocolData | null;
}

export const ProtocolView: React.FC<ProtocolViewProps> = ({ protocolData }) => {
  if (!protocolData) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <span>Loading protocol documentation...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Overview */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Research & Screening Protocol</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
          Complete methodological specifications for the 120,000-waveform neural vocoder benchmark, Montreal Forced Aligner timing constraints, two-ASR consensus screening, context rescue evaluation (D estimand), and statistical logistic regression.
        </p>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-sky-500" />
          End-to-End Benchmark Pipeline Flow
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">Step 1</span>
                <Database className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Voice Context Curation</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                4 diverse voice contexts (Controlled Studio, Multi-Speaker Diverse, Multi-Accent Regional, Non-Native / L2 Accented) totaling 8,000 utterances, 802 speakers at 22.05 kHz.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">Step 2</span>
                <Sparkles className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Neural Synthesis</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Conditioned resynthesis across 14 neural vocoders (M1–M14) generating 112,000 waveforms + 8,000 GT references.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">Step 3</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">MFA Alignment</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Montreal Forced Aligner v2 (10 ms frame shift) constrained by verified reference text to derive physical phone timings.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Step 4</span>
                <BarChart className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Consensus Screening</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Two-ASR ensemble (Wav2Vec2 acoustic diagnostic + Whisper autoregressive LM) flags anomalous target loss events.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:purple-950 text-purple-700 dark:text-purple-300">Step 5</span>
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Perceptual & Context Study</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Measurement of context rescue (D estimand) and planned triple-blind narrow phonetic panel verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Corpus Inventory & Intersection (Table 1) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Table 1: Benchmark Corpus Inventory & Cross-System Intersection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Balanced coverage across single-speaker and multi-speaker datasets with standard 22.05 kHz analysis rate.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Corpus</th>
                <th className="py-2.5 px-4 text-right">Utterances</th>
                <th className="py-2.5 px-4 text-right">Speakers</th>
                <th className="py-2.5 px-4 text-right">Sample Rate</th>
                <th className="py-2.5 px-4 text-right">Intersected Audio</th>
                <th className="py-2.5 px-4">Dialect / Accent Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {protocolData.tab1_inventory.map((row) => (
                <tr key={row.corpus} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${row.corpus === 'Total Pooled' ? 'bg-slate-50/80 dark:bg-slate-800/30 font-bold' : ''}`}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.corpus}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.utterances.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.speakers.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.fs}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium">{row.intersected.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">{row.accent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASR Screening Diagnostics (Table 4) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Table 4: Diagnostic Performance of ASR Screening Strategies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates ability to isolate acoustic anomalies against gold human word recognition errors.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded">
              Acoustic Diagnostic Filter
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Screening Strategy</th>
                <th className="py-2.5 px-4">Architecture Type</th>
                <th className="py-2.5 px-4 text-right">Sensitivity</th>
                <th className="py-2.5 px-4 text-right">Specificity</th>
                <th className="py-2.5 px-4 text-right">Precision</th>
                <th className="py-2.5 px-4 text-right">False Alarm Rate</th>
                <th className="py-2.5 px-4 text-right">Missed Loss Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {protocolData.tab4_asr_screening.map((row) => (
                <tr key={row.asr} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${row.asr.includes('Consensus') ? 'bg-sky-50/40 dark:bg-sky-950/20 font-bold' : ''}`}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.asr}</td>
                  <td className="py-2.5 px-4 text-slate-500">{row.type}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{(row.sensitivity * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{(row.specificity * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-sky-600 dark:text-sky-400">{(row.precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">{(row.false_alarm * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">{(row.missed_loss * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Key Diagnostic Insight:</strong> Whisper-tiny's autoregressive language model frequently compensates for and repairs acoustically corrupted target words via language prior (0% sensitivity to acoustic loss in isolated screening), while pure CTC Wav2Vec2 isolates phonetic breakdowns. Two-ASR Consensus achieves 100% precision and 0% false alarms.
        </div>
      </div>

      {/* Context Rescue Effect & Logistic Predictors (Tables 2 & 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 2: Context Rescue Estimand D */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Table 2: Context Rescue Effect (D Estimand)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Target accuracy gain when presentation shifts from isolated clip to full utterance context: D = P_recon - P_orig.
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Corpus</th>
                  <th className="py-2.5 px-4 text-right">Targets</th>
                  <th className="py-2.5 px-4 text-right">Isolated</th>
                  <th className="py-2.5 px-4 text-right">Full Context</th>
                  <th className="py-2.5 px-4 text-right">Rescue (D)</th>
                  <th className="py-2.5 px-4 text-right">95% CI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {protocolData.tab2_context_rescue.map((row) => (
                  <tr key={row.corpus} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${row.corpus.includes('Pooled') ? 'bg-slate-50 dark:bg-slate-800/30 font-bold' : ''}`}>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.corpus}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.targets.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{(row.p_orig * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{(row.p_recon * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">+{row.d_estimand.toFixed(3)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.ci}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            * Note: Short vs full context presentation varies both acoustic coarticulation and sentence semantics jointly.
          </div>
        </div>

        {/* Table 6: Logistic Predictors of Acoustic Loss */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Table 6: Logistic Regression on Target Loss Events
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Linguistic and positional predictors of neural vocoder target degradation events.
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Predictor</th>
                  <th className="py-2.5 px-4 text-right">Coefficient (β)</th>
                  <th className="py-2.5 px-4 text-right">SE</th>
                  <th className="py-2.5 px-4 text-right">Odds Ratio</th>
                  <th className="py-2.5 px-4 text-right">95% CI</th>
                  <th className="py-2.5 px-4 text-right">p-value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {protocolData.tab6_linguistic_predictors.map((row) => (
                  <tr key={row.predictor} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">{row.predictor}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.beta.toFixed(3)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.se.toFixed(3)}</td>
                    <td className={`py-2.5 px-4 text-right font-mono font-bold ${row.significant ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {row.odds_ratio.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">{row.ci}</td>
                    <td className={`py-2.5 px-4 text-right font-mono font-semibold ${row.significant ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {row.p}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            <strong>Key Finding:</strong> Syllable coda position significantly elevates loss risk (OR = 2.484, p &lt; 0.001), indicating terminal consonant vulnerability in neural vocoders.
          </div>
        </div>
      </div>

      {/* Screening Budget (Table 5) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Table 5: Screening Yield Across Listener Annotation Budgets (Precision@K)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Target anomaly recovery under constrained human inspection budgets (K = 25, 50, 100 targets).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Screening Strategy</th>
                <th className="py-2.5 px-4 text-right">Top-25 Yield</th>
                <th className="py-2.5 px-4 text-right">Precision@25</th>
                <th className="py-2.5 px-4 text-right">Top-50 Yield</th>
                <th className="py-2.5 px-4 text-right">Precision@50</th>
                <th className="py-2.5 px-4 text-right">Top-100 Yield</th>
                <th className="py-2.5 px-4 text-right">Precision@100</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {protocolData.tab5_screening_budget.map((row) => (
                <tr key={row.method} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${row.method.includes('Proposed') ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-bold' : ''}`}>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{row.method}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.top25} / 25</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{(row.prec25 * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.top50} / 50</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{(row.prec50 * 100).toFixed(0)}%</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{row.top100} / 100</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-sky-600 dark:text-sky-400">{(row.prec100 * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclosures & Scientific Integrity Card */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Methodological Disclosures & Evaluation Boundaries
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
            Scientific Integrity Protocol
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          {/* Disclosure 1: MFA */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                MFA is Not an Acoustic Phone Recognizer
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono">
                Boundary
              </span>
            </div>
            <p className="leading-relaxed">
              Forced alignment aligns intended text to audio; phone error matrices derived from text represent ASR-G2P proxies, not narrow phonetic listening transcripts.
            </p>
          </div>

          {/* Disclosure 2: Human Evaluation Pending */}
          <div className="p-4 bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-500/60 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                Audio-Validated Phone Transcriptions
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black tracking-wide uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                ⏳ Pending Human Evaluation
              </span>
            </div>
            <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
              Narrow phonetic annotations by human phonetician panels were not collected for this cohort and are marked as honest empty states.
            </p>
            <div className="pt-1.5 border-t border-amber-300/40 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300">
              Perceptual MUSHRA multi-listener trials and 3-phonetician blind IPA validation are currently in progress.
            </div>
          </div>

          {/* Disclosure 3: Complete Pipeline */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Complete Pipeline Comparisons
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                System Scope
              </span>
            </div>
            <p className="leading-relaxed">
              Vocoders operate with differing native conditioning frontends (mel-spectrogram parameters, hop sizes); differences reflect complete pipeline performance rather than isolated architectural causality.
            </p>
          </div>

          {/* Disclosure 4: Griffin-Lim */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Griffin–Lim Strict Exclusion
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                M0–M14 Allowlist
              </span>
            </div>
            <p className="leading-relaxed">
              The legacy phase-retrieval baseline is excluded from public reporting and selectors following the strict evaluation boundary.
            </p>
          </div>

          {/* Disclosure 5: Reproducibility */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Reproducibility & Open Artifacts
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono">
                Open Access
              </span>
            </div>
            <p className="leading-relaxed">
              Fully reproducible audio manifests, alignment intervals, and evaluation scripts are released under permissive open research licensing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
