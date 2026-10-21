import React from 'react';
import { Cpu, Terminal, Layers, CheckCircle2, AlertTriangle, FileCode, ExternalLink, ShieldCheck } from 'lucide-react';

export const AsrModelsView: React.FC = () => {
  return (
    <div className="space-y-8 anim-fade-up">
      {/* ── Main Header & Overview ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-[#64BF56]/15 text-[#14213D] dark:text-[#64BF56]">🤖</span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
                ASR Models Used for Hypothesis Generation
              </h1>
            </div>
            <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] max-w-3xl leading-relaxed">
              Two automatic speech recognition (ASR) models were used to produce the hypothesis transcriptions evaluated in this benchmark. Each model's architecture, parameter count, and training regime is detailed below:
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] border border-[#88DFF2]/40">
              Whisper-Small (244M)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#64BF56]/20 text-[#14213D] dark:text-[#64BF56] border border-[#64BF56]/40">
              Wav2vec2-Base (94.4M)
            </span>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-3 px-4">ASR Model</th>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">Parameters</th>
                <th className="py-3 px-4">Training Data & Hours</th>
                <th className="py-3 px-4">Citation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-sm text-[#14213D] dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#88DFF2]" />
                    <span>Whisper-Small</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                  Encoder–decoder Transformer
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#14213D] dark:text-[#88DFF2]">
                  244 M
                </td>
                <td className="py-3 px-4 text-[#5A7086] dark:text-[#7A9BB8]">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#88DFF2]/15 text-[#0E7490] dark:text-[#88DFF2]">
                    Multilingual web audio (680,000h)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-[#5A7086]">
                  Radford et al., 2023
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50 transition-colors">
                <td className="py-3 px-4 font-bold text-sm text-[#14213D] dark:text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#64BF56]" />
                    <span>Wav2vec2-Base</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                  CNN–Transformer encoder with CTC
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#14213D] dark:text-[#64BF56]">
                  94.4 M
                </td>
                <td className="py-3 px-4 text-[#5A7086] dark:text-[#7A9BB8]">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">
                    LibriSpeech (960h)
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-[#5A7086]">
                  Baevski et al., 2020
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Whisper-Small 10 Evaluation Samples ── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#D6EDF8]/60 dark:border-[#2A3F54]/60 pb-3">
          <div>
            <h3 className="font-bold text-base text-[#88DFF2] flex items-center gap-2">
              <span>🌬</span>
              <span>Whisper-Small: 10 Evaluation Samples</span>
            </h3>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
              Encoder–decoder Transformer (244 M params) trained on 680k hours of multilingual web audio. Abbreviation: <strong>WS</strong>.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#88DFF2]/15 text-[#14213D] dark:text-[#88DFF2] font-bold">
            10 Diagnostic Test Sentences
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Reference (Ground Truth)</th>
                <th className="py-2.5 px-3">Hypothesis (WS Output)</th>
                <th className="py-2.5 px-3 text-right">Error Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-01</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">acoustic modeling captures nuanced phonetic features across speech registers</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">acoustic modeling captures nuanced phonetic features across speech registers</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-02</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">speech synthesis evaluation requires clear <span className="font-bold underline text-[#88DFF2]">objective</span> metrics</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">speech synthesis evaluation requires clear <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">subjective</span> metrics</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-03</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">surrounding acoustic context improves lexical identification</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">surrounding acoustic context improves lexical identification</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-04</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">background noise complicates automatic speech <span className="font-bold underline text-[#88DFF2]">transcription</span></td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">background noise complicates automatic speech <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">description</span></td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-05</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">isolated words lack <span className="font-bold underline text-[#88DFF2]">surrounding</span> carrier phrases</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">isolated words lack <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~surrounding~~</span> carrier phrases</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]">Deletion</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-06</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">careful normalization ensures consistent scoring across runs</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">careful normalization ensures consistent <span className="font-bold px-1 rounded bg-[#88DFF2]/30 text-[#0E7490] dark:text-[#88DFF2]">+fast</span> scoring across runs</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#88DFF2]/20 text-[#0E7490] dark:text-[#88DFF2]">Addition</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-07</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">neural vocoders generate high fidelity speech waveforms</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">neural vocoders generate high fidelity speech waveforms</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-08</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">spectral envelope features preserve vowel <span className="font-bold underline text-[#88DFF2]">formant</span> frequencies</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">spectral envelope features preserve vowel <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">format</span> frequencies</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-09</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">prosodic variations influence perceived <span className="font-bold underline text-[#88DFF2]">voice</span> naturalness and emotion</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">prosodic variations influence perceived <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~voice~~</span> naturalness and emotion</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]">Deletion</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">WS-10</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">objective metrics correlate strongly with subjective <span className="font-bold underline text-[#88DFF2]">human</span> listening trials</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">objective metrics correlate strongly with subjective <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~human~~</span> listening trials</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]">Deletion</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Wav2vec2-Base 10 Evaluation Samples ── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#D6EDF8]/60 dark:border-[#2A3F54]/60 pb-3">
          <div>
            <h3 className="font-bold text-base text-[#64BF56] flex items-center gap-2">
              <span>🔊</span>
              <span>Wav2vec2-Base: 10 Evaluation Samples</span>
            </h3>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
              CNN–Transformer encoder with CTC head (94.4 M params) fine-tuned on LibriSpeech 960h. Abbreviation: <strong>W2V</strong>.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#64BF56]/15 text-[#14213D] dark:text-[#64BF56] font-bold">
            10 Diagnostic Test Sentences
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] uppercase font-mono tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Reference (Ground Truth)</th>
                <th className="py-2.5 px-3">Hypothesis (W2V Output)</th>
                <th className="py-2.5 px-3 text-right">Error Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6EDF8]/60 dark:divide-[#2A3F54]/60 font-sans">
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-01</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">speech foundation models demonstrate robust cross lingual acoustic transfer</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">speech foundation models demonstrate robust cross lingual acoustic transfer</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-02</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">articulatory boundaries define phoneme segmentation intervals</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">articulatory boundaries define phoneme segmentation intervals</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-03</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">forced alignment matches acoustic <span className="font-bold underline text-[#64BF56]">signals</span> with phonetic <span className="font-bold underline text-[#64BF56]">transcriptions</span></td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">forced alignment matches acoustic <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">signal</span> with phonetic <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">transcription</span></td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-04</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">temporal resolution affects the precision of phonetic boundaries</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">temporal resolution affects the precision of phonetic boundaries</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56]">Hit</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-05</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">unvoiced stops produce silent <span className="font-bold underline text-[#64BF56]">closure</span> gaps before <span className="font-bold underline text-[#64BF56]">burst</span> release</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">unvoiced stops produce silent <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~closure~~</span> gaps before <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~burst~~</span> release</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]">Deletion</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-06</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">pitch contours provide essential clues for <span className="font-bold underline text-[#64BF56]">semantic</span> disambiguation</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">pitch contours provide essential clues for <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">syntactic</span> disambiguation</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-07</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">nasal murmurs exhibit low frequency spectral resonances</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">nasal murmurs exhibit <span className="font-bold px-1 rounded bg-[#88DFF2]/30 text-[#0E7490] dark:text-[#88DFF2]">+distinct</span> low frequency spectral resonances</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#88DFF2]/20 text-[#0E7490] dark:text-[#88DFF2]">Addition</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-08</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">plosive consonants produce rapid <span className="font-bold underline text-[#64BF56]">transient</span> acoustic bursts</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">plosive consonants produce rapid <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">transit</span> acoustic bursts</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-09</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">fricative noises show <span className="font-bold underline text-[#64BF56]">energy concentrations in</span> high frequencies</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">fricative noises show <span className="line-through px-1 rounded bg-[#F65936]/20 text-[#C62828] dark:text-[#F65936]">~~concentrations~~</span> energy in high frequencies</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936]">Deletion</span>
                </td>
              </tr>
              <tr className="hover:bg-[#F0F8FF]/60 dark:hover:bg-[#1A2332]/50">
                <td className="py-2.5 px-3 font-mono text-[#5A7086]">W2V-10</td>
                <td className="py-2.5 px-3 text-[#14213D] dark:text-[#E6F0F8]">approximants and <span className="font-bold underline text-[#64BF56]">glides</span> exhibit continuous formant transitions</td>
                <td className="py-2.5 px-3 font-medium text-[#14213D] dark:text-[#E6F0F8]">approximants and <span className="font-bold px-1 rounded bg-[#F2C53D]/30 text-[#854D0E] dark:text-[#F2C53D]">guides</span> exhibit continuous formant transitions</td>
                <td className="py-2.5 px-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D]">Substitution</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CLI & Docker Execution ── */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-[#F294C8]" />
          <h3 className="font-bold text-base text-[#14213D] dark:text-white">
            Command-Line Interface & Containerized Execution
          </h3>
        </div>
        <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
          Run the evaluation engine directly via native Python CLI or containerized Docker:
        </p>

        <div className="space-y-4 pt-2">
          <div>
            <div className="text-xs font-bold text-[#F294C8] mb-1.5 font-mono">
              # Standard Python CLI
            </div>
            <pre className="p-3.5 rounded-xl bg-[#0C1322] text-[#E6F0F8] font-mono text-xs overflow-x-auto leading-relaxed border border-[#2A3F54]">
<code>{`# Table output with word, character, and match error rates
context-demo --manifest examples/toy_manifest.jsonl --format table

# Full evaluation with ARPAbet lexicon and Phone Error Rate (PER)
context-demo --manifest examples/toy_manifest.jsonl --lexicon lexicons/sample_lexicon.txt --format table

# Machine-readable structured JSON output
context-demo --manifest examples/toy_manifest.jsonl --lexicon lexicons/sample_lexicon.txt --format json`}</code>
            </pre>
          </div>

          <div>
            <div className="text-xs font-bold text-[#88DFF2] mb-1.5 font-mono">
              # Docker Container Run
            </div>
            <pre className="p-3.5 rounded-xl bg-[#0C1322] text-[#E6F0F8] font-mono text-xs overflow-x-auto leading-relaxed border border-[#2A3F54]">
<code>{`# Build locally
docker build -t did-the-word-survive:latest .

# Run default table evaluation
docker run --rm did-the-word-survive:latest

# Run with lexicon in Docker
docker run --rm did-the-word-survive:latest --lexicon lexicons/sample_lexicon.txt --format table`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
