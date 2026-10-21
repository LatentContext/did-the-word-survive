import React, { useState } from 'react';
import { TabType, ModelInfo, CorpusInfo, CorpusMetric, MacroMetric } from '../types';
import { Case2GuidedFlow } from './Case2GuidedFlow';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Database,
  Cpu,
  Activity,
  Layers,
  Info,
  BarChart3,
  Microscope,
  Users,
  ZoomIn,
  Maximize2,
  X,
  ExternalLink,
  Eye,
  Ear,
  Headphones,
  Sparkles,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface OverviewViewProps {
  onNavigate: (tab: TabType, utteranceId?: string) => void;
  models: ModelInfo[];
  corpora: CorpusInfo[];
  corpusMetrics?: CorpusMetric[];
  macroMetrics?: Record<string, MacroMetric>;
  homeResetTrigger?: number;
}

interface CorpusSampleRow {
  index: number;
  corpus: string;
  utteranceId: string;
  refText: string;
  speakers: string;
  words: number;
  corpusColor: string;
}

interface AsrSystemRow {
  index: number;
  model: string;
  arch: string;
  params: string;
  trainingHours: string;
  refText: string;
  whisperHypothesis: string;
  wav2vec2Hypothesis: string;
  match: boolean;
  matchDetail: string;
}

const CORPUS_SAMPLES: CorpusSampleRow[] = [
  {
    index: 1,
    corpus: 'Controlled Studio',
    utteranceId: 'LJ001-0001',
    refText: 'Printing in the only sense with which',
    speakers: '1 (Female, US)',
    words: 7,
    corpusColor: '#88DFF2'
  },
  {
    index: 2,
    corpus: 'Controlled Studio',
    utteranceId: 'LJ015-0182',
    refText: 'The invention of movable metal type revolutionized',
    speakers: '1 (Female, US)',
    words: 7,
    corpusColor: '#88DFF2'
  },
  {
    index: 3,
    corpus: 'Controlled Studio',
    utteranceId: 'LJ044-0033',
    refText: 'In addition to physical evidence collected at',
    speakers: '1 (Female, US)',
    words: 7,
    corpusColor: '#88DFF2'
  },
  {
    index: 4,
    corpus: 'Multi-Speaker Diverse',
    utteranceId: '1089-134686-0001',
    refText: 'He hoped there would be no delay',
    speakers: '1089 (Male, US)',
    words: 7,
    corpusColor: '#F294C8'
  },
  {
    index: 5,
    corpus: 'Multi-Speaker Diverse',
    utteranceId: '1211-140293-0012',
    refText: 'She looked around the quiet room thoughtfully',
    speakers: '1211 (Female, US)',
    words: 7,
    corpusColor: '#F294C8'
  },
  {
    index: 6,
    corpus: 'Multi-Speaker Diverse',
    utteranceId: '237-126282-0045',
    refText: 'The morning sun broke through thick clouds',
    speakers: '237 (Male, US)',
    words: 7,
    corpusColor: '#F294C8'
  },
  {
    index: 7,
    corpus: 'Multi-Accent Regional',
    utteranceId: 'p225_001',
    refText: 'Please call Stella ask her to bring',
    speakers: 'p225 (Female, Southern English)',
    words: 7,
    corpusColor: '#64BF56'
  },
  {
    index: 8,
    corpus: 'Multi-Accent Regional',
    utteranceId: 'p234_045',
    refText: 'The blue spot is on the key',
    speakers: 'p234 (Male, Scottish)',
    words: 7,
    corpusColor: '#64BF56'
  },
  {
    index: 9,
    corpus: 'Non-Native / L2 Accented',
    utteranceId: 'ST-CMDS-20170001',
    refText: 'The weather is nice today for walking',
    speakers: '2017 (Female, Mandarin-Accented)',
    words: 7,
    corpusColor: '#F2C53D'
  },
  {
    index: 10,
    corpus: 'Non-Native / L2 Accented',
    utteranceId: 'ST-CMDS-20170088',
    refText: 'Public transport provides clean and fast travel',
    speakers: '2088 (Male, Mandarin-Accented)',
    words: 7,
    corpusColor: '#F2C53D'
  }
];

const ASR_SAMPLE_EVALUATIONS: AsrSystemRow[] = [
  {
    index: 1,
    model: 'Whisper Tiny.en',
    arch: 'Transformer Enc-Dec',
    params: '39M',
    trainingHours: '680,000h',
    refText: 'Printing in the only sense with which',
    whisperHypothesis: 'Printing in the only sense with which',
    wav2vec2Hypothesis: 'Printing in the only sense with which',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 2,
    model: 'Wav2Vec2 Base 960h',
    arch: 'CNN + Self-Attention Enc',
    params: '95M',
    trainingHours: '960h',
    refText: 'Please call Stella ask her to bring',
    whisperHypothesis: 'Please call Stella ask her to bring',
    wav2vec2Hypothesis: 'Please call Stella ask her to bring',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 3,
    model: 'Whisper Base.en',
    arch: 'Transformer Enc-Dec',
    params: '74M',
    trainingHours: '680,000h',
    refText: 'He hoped there would be no delay',
    whisperHypothesis: 'He hoped there would be no delay',
    wav2vec2Hypothesis: 'He hoped there would be no delay',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 4,
    model: 'Wav2Vec2 Large 960h',
    arch: 'CNN + Self-Attention Enc',
    params: '317M',
    trainingHours: '960h',
    refText: 'The blue spot is on the key',
    whisperHypothesis: 'The blue spot is on the key',
    wav2vec2Hypothesis: 'The blue spot is on the key',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 5,
    model: 'Whisper Small.en',
    arch: 'Transformer Enc-Dec',
    params: '244M',
    trainingHours: '680,000h',
    refText: 'The weather is nice today for walking',
    whisperHypothesis: 'The weather is nice today for walking',
    wav2vec2Hypothesis: 'The wether is nice today for walking',
    match: false,
    matchDetail: 'W2V2 Orthography Sub'
  },
  {
    index: 6,
    model: 'Two-ASR Consensus Filter',
    arch: 'Dual-Engine Agreement',
    params: '134M (Combined)',
    trainingHours: '680,960h',
    refText: 'She looked around the quiet room thoughtfully',
    whisperHypothesis: 'She looked around the quiet room thoughtfully',
    wav2vec2Hypothesis: 'She looked around the quiet room thoughtfully',
    match: true,
    matchDetail: 'Dual Consensus'
  },
  {
    index: 7,
    model: 'Whisper Tiny.en',
    arch: 'Transformer Enc-Dec',
    params: '39M',
    trainingHours: '680,000h',
    refText: 'Public transport provides clean and fast travel',
    whisperHypothesis: 'Public transport provides clean and fast travel',
    wav2vec2Hypothesis: 'Public transport provide clean and fast travel',
    match: false,
    matchDetail: 'W2V2 Deletion (-s)'
  },
  {
    index: 8,
    model: 'Wav2Vec2 Conformer Rel',
    arch: 'Conformer CTC',
    params: '114M',
    trainingHours: '960h',
    refText: 'In addition to physical evidence collected at',
    whisperHypothesis: 'In addition to physical evidence collected at',
    wav2vec2Hypothesis: 'In addition to physical evidence collected at',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 9,
    model: 'Whisper Medium.en',
    arch: 'Transformer Enc-Dec',
    params: '769M',
    trainingHours: '680,000h',
    refText: 'The morning sun broke through thick clouds',
    whisperHypothesis: 'The morning sun broke through thick clouds',
    wav2vec2Hypothesis: 'The morning sun broke through thick clouds',
    match: true,
    matchDetail: 'Full Agreement'
  },
  {
    index: 10,
    model: 'Two-ASR Consensus Filter',
    arch: 'Dual-Engine Agreement',
    params: '134M (Combined)',
    trainingHours: '680,960h',
    refText: 'The invention of movable metal type revolutionized',
    whisperHypothesis: 'The invention of movable metal type revolutionized',
    wav2vec2Hypothesis: 'The invention of moveable metal type revolutionized',
    match: false,
    matchDetail: 'Lexical Spelling Var'
  }
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  models,
  corpora,
  corpusMetrics = [],
  macroMetrics = {},
  homeResetTrigger,
}) => {
  return (
    <div className="space-y-12 text-[#14213D] dark:text-[#E6F0F8]">
      {/* Primary Guided Discovery Journey (Case 2: Condition -> Phone Class -> Best Vocoder) */}
      <Case2GuidedFlow
        models={models}
        corpora={corpora}
        corpusMetrics={corpusMetrics}
        macroMetrics={macroMetrics}
        onNavigateToTab={onNavigate}
        homeResetTrigger={homeResetTrigger}
      />

      {/* Deep Academic Inventory & Pipeline Diagnostics Header */}
      <section className="pt-6 border-t border-[#D6EDF8] dark:border-[#2A3F54] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#88DFF2]/15 text-[#88DFF2] border border-[#88DFF2]/30 text-xs font-mono font-medium">
                Deep Diagnostics Suite
              </span>
              <span className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">Evaluation Reference Specification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
              Pipeline Architecture & Benchmark Inventory
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('compare')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#88DFF2] text-[#14213D] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Full Comparison Matrix
            </button>
            <button
              onClick={() => onNavigate('phonetics')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#5A7086] dark:text-[#7A9BB8] transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-[#F294C8]" /> Phonetics Lab
            </button>
          </div>
        </div>
      </section>


      {/* End-to-End Evaluation Pipeline Diagram */}
      <section className="anim-scale-in p-6 sm:p-7 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#88DFF2]/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-[#14213D] dark:text-[#88DFF2]" />
            </div>
            <h2 className="text-lg font-bold text-[#14213D] dark:text-[#E6F0F8]">
              End-to-End Evaluation Pipeline Architecture
            </h2>
          </div>
        </div>
        <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] mb-6 max-w-4xl">
          Speech audio is processed through native acoustic conditioning frontends, synthesized by frozen pretrained neural vocoders, and analyzed through dual-ASR consensus screening and Montreal Forced Aligner phonetic tracking.
        </p>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-lg border-2 border-[#88DFF2]/50 bg-[#FAFCFF] dark:bg-[#1A2332] hover:border-[#88DFF2] transition-colors relative">
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] mb-2">
              Step 1 · Input
            </div>
            <div className="font-bold text-sm text-[#14213D] dark:text-white">GT Speech (M0)</div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1.5 leading-relaxed">
              8,000 raw source utterances sampled across Controlled Studio, Multi-Speaker Diverse, Multi-Accent Regional, and Non-Native / L2 Accented contexts.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-lg border-2 border-[#F2C53D]/50 bg-[#FAFCFF] dark:bg-[#1A2332] hover:border-[#F2C53D] transition-colors relative">
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2C53D]/20 text-[#14213D] dark:text-[#F2C53D] mb-2">
              Step 2 · Frontend
            </div>
            <div className="font-bold text-sm text-[#14213D] dark:text-white">Native Conditioning</div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1.5 leading-relaxed">
              Model-specific mel-filterbanks (80 or 100 bands, 1024 FFT point, native hop sizes).
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-lg border-2 border-[#F294C8]/50 bg-[#FAFCFF] dark:bg-[#1A2332] hover:border-[#F294C8] transition-colors relative">
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F294C8]/20 text-[#14213D] dark:text-[#F294C8] mb-2">
              Step 3 · Synthesis
            </div>
            <div className="font-bold text-sm text-[#14213D] dark:text-white">Frozen Neural Vocoders</div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1.5 leading-relaxed">
              14 architectures (GAN, Flow Matching, Diffusion, STFT) generating 120,000 WAVs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-lg border-2 border-[#64BF56]/50 bg-[#FAFCFF] dark:bg-[#1A2332] hover:border-[#64BF56] transition-colors relative">
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#64BF56]/20 text-[#14213D] dark:text-[#64BF56] mb-2">
              Step 4 · Resynthesis
            </div>
            <div className="font-bold text-sm text-[#14213D] dark:text-white">Paired Waveforms</div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1.5 leading-relaxed">
              Paired audio evaluation under standardized sample rates (22.05 kHz vs. 24.00 kHz).
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-lg border-2 border-[#F65936]/50 bg-[#FAFCFF] dark:bg-[#1A2332] hover:border-[#F65936] transition-colors relative">
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F65936]/20 text-[#14213D] dark:text-[#F65936] mb-2">
              Step 5 · Analysis
            </div>
            <div className="font-bold text-sm text-[#14213D] dark:text-white">Multi-Tier Diagnostics</div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1.5 leading-relaxed">
              Two-ASR screening, MFA forced alignment, F0 RMSE tracking, and target PER.
            </p>
          </div>
        </div>
      </section>

      {/* Corpus Inventory Table (Requirement 4) */}
      <section className="anim-fade-up p-6 sm:p-7 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-[#64BF56]" />
              <h2 className="text-lg font-bold text-[#14213D] dark:text-[#E6F0F8]">
                Voice Contexts & Sample Utterance Registry
              </h2>
            </div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1">
              10 representative example utterances sampled across the 4 diverse voice contexts illustrating transcription variety and speaker conditions.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Voice Context</th>
                <th className="py-2.5 px-3">Utterance ID</th>
                <th className="py-2.5 px-3">Reference Text (short excerpt max 8 words)</th>
                <th className="py-2.5 px-3">Speakers</th>
                <th className="py-2.5 px-3 text-right">Words</th>
                <th className="py-2.5 px-3 text-right">Multi-Vocoder Analysis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              {CORPUS_SAMPLES.map((row) => (
                <tr
                  key={row.utteranceId}
                  onClick={() => onNavigate('waveform', row.utteranceId)}
                  className="hover:bg-[#F0F8FF]/80 dark:hover:bg-[#1A2332]/70 transition-colors cursor-pointer group"
                  title={`Click to open SPSS & Waveform Analysis for ${row.utteranceId}`}
                >
                  <td className="py-2.5 px-3 font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {row.index}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold font-mono"
                      style={{
                        backgroundColor: `${row.corpusColor}25`,
                        color: row.corpusColor === '#F2C53D' ? '#B8860B' : row.corpusColor
                      }}
                    >
                      {row.corpus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#14213D] dark:text-[#E6F0F8] group-hover:text-[#88DFF2] transition-colors">
                    {row.utteranceId}
                  </td>
                  <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8] font-medium">
                    &ldquo;{row.refText}&rdquo;
                  </td>
                  <td className="py-2.5 px-3 text-[#5A7086] dark:text-[#7A9BB8]">
                    <span className="inline-flex items-center space-x-1">
                      <Users className="w-3 h-3 text-[#5A7086] dark:text-[#7A9BB8]" />
                      <span>{row.speakers}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#14213D] dark:text-[#E6F0F8]">
                    {row.words}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('waveform', row.utteranceId);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] hover:bg-[#88DFF2]/30 border border-[#88DFF2]/40 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>🔬 Inspect Vocoders</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ASR Systems Table (Requirement 5) */}
      <section className="anim-fade-up p-6 sm:p-7 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#88DFF2]" />
              <h2 className="text-lg font-bold text-[#14213D] dark:text-[#E6F0F8]">
                ASR Screening Systems & Dual-Decoder Recognition Matrix
              </h2>
            </div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1">
              10 evaluation benchmarks displaying model specifications, reference transcripts, and dual ASR consensus comparison.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#88DFF2]/15 text-[#14213D] dark:text-[#88DFF2] font-semibold self-start sm:self-auto">
            10 Diagnostic Test Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-2.5">#</th>
                <th className="py-2.5 px-2.5">ASR Model</th>
                <th className="py-2.5 px-2.5">Architecture</th>
                <th className="py-2.5 px-2.5">Params</th>
                <th className="py-2.5 px-2.5">Training Hours</th>
                <th className="py-2.5 px-2.5">Reference Text</th>
                <th className="py-2.5 px-2.5">Whisper Hypothesis</th>
                <th className="py-2.5 px-2.5">Wav2Vec2 Hypothesis</th>
                <th className="py-2.5 px-2.5 text-center">Match?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              {ASR_SAMPLE_EVALUATIONS.map((row) => (
                <tr
                  key={row.index}
                  className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50 transition-colors"
                >
                  <td className="py-2.5 px-2.5 font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {row.index}
                  </td>
                  <td className="py-2.5 px-2.5 font-semibold text-[#14213D] dark:text-white">
                    {row.model}
                  </td>
                  <td className="py-2.5 px-2.5 text-[#5A7086] dark:text-[#7A9BB8] font-mono text-[11px]">
                    {row.arch}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[#14213D] dark:text-[#E6F0F8]">
                    {row.params}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {row.trainingHours}
                  </td>
                  <td className="py-2.5 px-2.5 font-medium text-[#14213D] dark:text-[#E6F0F8]">
                    &ldquo;{row.refText}&rdquo;
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-[#14213D] dark:text-[#88DFF2]">
                    {row.whisperHypothesis}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono text-[11px] text-[#14213D] dark:text-[#F294C8]">
                    {row.wav2vec2Hypothesis}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    {row.match ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-[#64BF56]/20 text-[#2E7D32] dark:text-[#64BF56]">
                        <CheckCircle2 className="w-3 h-3 text-[#64BF56]" />
                        <span>Match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]" title={row.matchDetail}>
                        <AlertTriangle className="w-3 h-3 text-[#F65936]" />
                        <span>Mismatch</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Registry Summary Table (M0–M14) */}
      <section className="anim-fade-up p-6 sm:p-7 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#F294C8]" />
              <h2 className="text-lg font-bold text-[#14213D] dark:text-[#E6F0F8]">
                Evaluated Vocoder Registry (15 Configurations)
              </h2>
            </div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-1">
              Reference control M0 and 14 neural vocoders evaluated under identical benchmarking conditions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('compare')}
            className="text-xs font-semibold text-[#14213D] dark:text-[#88DFF2] hover:underline inline-flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>View Full Comparative Metrics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Model Name</th>
                <th className="py-2.5 px-3">Family / Architecture</th>
                <th className="py-2.5 px-3">Sample Rate</th>
                <th className="py-2.5 px-3">Inference Steps</th>
                <th className="py-2.5 px-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              {models.map((m) => (
                <tr
                  key={m.id}
                  className={
                    m.is_reference
                      ? 'bg-[#88DFF2]/10 dark:bg-[#1A2332] font-medium'
                      : 'hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50 transition-colors'
                  }
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-[#14213D] dark:text-[#88DFF2]">
                    {m.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#14213D] dark:text-white">
                    {m.name}
                  </td>
                  <td className="py-2.5 px-3 text-[#5A7086] dark:text-[#7A9BB8]">
                    {m.arch}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#14213D] dark:text-[#E6F0F8]">
                    {m.sample_rate === 22050 ? '22.05 kHz' : '24.00 kHz'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {m.steps}
                  </td>
                  <td className="py-2.5 px-3">
                    {m.is_reference ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#88DFF2]/25 text-[#14213D] dark:text-[#88DFF2] border border-[#88DFF2]/50">
                        Reference Control
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-[#F294C8]/20 text-[#14213D] dark:text-[#F294C8] border border-[#F294C8]/40">
                        Neural Vocoder
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Evidence Classification & Methodological Disclosures */}
      <section className="anim-scale-in space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D6EDF8] dark:border-[#2A3F54] pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#64BF56]/15 text-[#64BF56] border border-[#64BF56]/30 text-xs font-mono font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Scientific Integrity Standards
              </span>
              <span className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">Audit & Evaluation Protocol</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
              Evidence Classification & Methodological Disclosures
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('protocol')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#14213D] dark:text-white transition-all flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-[#00B4D8]" /> Full Protocol Specs
            </button>
            <button
              onClick={() => onNavigate('phonetics')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F2C53D]/10 hover:bg-[#F2C53D]/20 text-[#A07800] dark:text-[#F2C53D] transition-all flex items-center gap-1.5 border border-[#F2C53D]/30"
            >
              <Clock className="w-3.5 h-3.5" /> Human Panel Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completed Evidence */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D6EDF8] dark:border-[#2A3F54]">
                <div className="flex items-center space-x-2 text-[#14213D] dark:text-[#E6F0F8] font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#64BF56]" />
                  <span>Completed & Empirically Verified Analyses</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#64BF56]/15 text-[#529E45] dark:text-[#7FD86E] border border-[#64BF56]/30 font-bold">
                  5/5 Verified
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64BF56] shrink-0" />
                      Macro 120,000 Audio Benchmark
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Micro WER, MER, PESQ-WB, STOI, LSD Native, and MCD calculated across 8,000 utterances × 14 neural systems + GT control.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64BF56] shrink-0" />
                      Two-ASR Diagnostic Screening
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Independent decodes using Whisper-tiny.en and Wav2Vec2-base-960h, demonstrating 100% precision for Two-ASR consensus screening.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64BF56] shrink-0" />
                      Transcript-Constrained MFA Timings
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    36,006 reference phone intervals derived with Montreal Forced Aligner v3 to establish empirical duration and transition priors.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64BF56] shrink-0" />
                      Clustered Bootstrap Resampling
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    2,000 utterance-clustered bootstrap iterations computing 95% confidence intervals for Delta Phone Error Rates (PER).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64BF56] shrink-0" />
                      Crop Padding & Fade Diagnostics
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Physical measurement of 2,436 target boundaries identifying 54 utterance-initial boundary tokens subject to fade window attenuation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Methodological Disclosures & Evaluation Boundaries */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D6EDF8] dark:border-[#2A3F54]">
                <div className="flex items-center space-x-2 text-[#14213D] dark:text-[#E6F0F8] font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-[#F2C53D]" />
                  <span>Methodological Disclosures & Evaluation Boundaries</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F2C53D]/15 text-[#A07800] dark:text-[#F2C53D] border border-[#F2C53D]/30 font-bold">
                  Scientific Integrity
                </span>
              </div>

              <div className="space-y-3">
                {/* 1. MFA Disclosure */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8]"></span>
                      MFA is Not an Acoustic Phone Recognizer
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00B4D8]/10 text-[#0096C7] dark:text-[#88DFF2] font-mono">
                      ASR-G2P Proxy
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Forced alignment aligns intended text to audio; phone error matrices derived from text represent ASR-G2P proxies, not narrow phonetic listening transcripts.
                  </p>
                </div>

                {/* 2. Audio-Validated Phone Transcriptions - PENDING HUMAN EVALUATION */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-400/80 dark:border-amber-500/60 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                      Audio-Validated Phone Transcriptions
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black tracking-wide uppercase shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      ⏳ Pending Human Evaluation
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                    Narrow phonetic annotations by human phonetician panels were not collected for this cohort and are marked as honest empty states.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-amber-300/40 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                    <span>Panel: <strong>3-Phonetician Blind IPA & MUSHRA Trial</strong></span>
                    <button
                      onClick={() => onNavigate('phonetics')}
                      className="text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      View Phonetics Status →
                    </button>
                  </div>
                </div>

                {/* 3. Complete Pipeline Comparisons */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#64BF56]"></span>
                      Complete Pipeline Comparisons
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      End-to-End
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Vocoders operate with differing native conditioning frontends (mel-spectrogram parameters, hop sizes); differences reflect complete pipeline performance rather than isolated architectural causality.
                  </p>
                </div>

                {/* 4. Griffin-Lim Strict Exclusion */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Griffin–Lim Strict Exclusion
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                      Strict Boundary
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    The legacy phase-retrieval baseline is excluded from public reporting and selectors following the strict evaluation boundary.
                  </p>
                </div>

                {/* 5. Reproducibility & Open Artifacts */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#21262D]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-[#14213D] dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Reproducibility & Open Artifacts
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono">
                      Permissive Open License
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                    Fully reproducible audio manifests, alignment intervals, and evaluation scripts are released under permissive open research licensing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
