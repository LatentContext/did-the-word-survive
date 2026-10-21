import React, { useState, useEffect, useMemo } from 'react';
import { PRESETS, PresetSample } from '../data/evaluatorPresets';
import { LEXICON } from '../data/lexicon';
import { Sparkles, RefreshCw, X, Sliders, CheckCircle2, AlertTriangle, Activity, Volume2, Play, Square } from 'lucide-react';

const PHONE_CLASSES: Record<string, string> = {
  AA: 'vowels', AE: 'vowels', AH: 'vowels', AO: 'vowels', AW: 'vowels',
  AY: 'vowels', EH: 'vowels', ER: 'vowels', EY: 'vowels', IH: 'vowels',
  IY: 'vowels', OW: 'vowels', OY: 'vowels', UH: 'vowels', UW: 'vowels',
  B: 'plosives', D: 'plosives', G: 'plosives', K: 'plosives', P: 'plosives', T: 'plosives',
  CH: 'affricates', JH: 'affricates',
  DH: 'fricatives', F: 'fricatives', S: 'fricatives', SH: 'fricatives',
  TH: 'fricatives', V: 'fricatives', Z: 'fricatives', ZH: 'fricatives',
  HH: 'aspirates',
  M: 'nasals', N: 'nasals', NG: 'nasals',
  L: 'approximants', R: 'approximants', W: 'approximants', Y: 'approximants'
};

const IPA_MAP: Record<string, string> = {
  AA: 'ɑ', AE: 'æ', AH: 'ʌ', AO: 'ɔ', AW: 'aʊ',
  AY: 'aɪ', EH: 'ɛ', ER: 'ɝ', EY: 'eɪ', IH: 'ɪ',
  IY: 'i', OW: 'oʊ', OY: 'ɔɪ', UH: 'ʊ', UW: 'u',
  B: 'b', D: 'd', G: 'ɡ', K: 'k', P: 'p', T: 't',
  CH: 'tʃ', JH: 'dʒ',
  DH: 'ð', F: 'f', S: 's', SH: 'ʃ', TH: 'θ', V: 'v', Z: 'z', ZH: 'ʒ',
  HH: 'h',
  M: 'm', N: 'n', NG: 'ŋ',
  L: 'l', R: 'ɹ', W: 'w', Y: 'j'
};

const MANNER_LEVELS: Record<string, number> = {
  vowels: 6,
  approximants: 5,
  nasals: 4,
  fricatives: 3,
  affricates: 2.5,
  aspirates: 2,
  plosives: 1,
  other: 1.5
};

const MANNER_COLORS: Record<string, string> = {
  vowels: '#F294C8',
  plosives: '#88DFF2',
  fricatives: '#F2C53D',
  affricates: '#F472B6',
  aspirates: '#FB923C',
  nasals: '#64BF56',
  approximants: '#A78BFA',
  other: '#94A3B8'
};

const VOICELESS = new Set(['P', 'T', 'K', 'F', 'TH', 'S', 'SH', 'CH']);

function getPhoneClass(p: string): string {
  if (!p) return 'other';
  const clean = p.replace(/\d+/g, '').toUpperCase();
  return PHONE_CLASSES[clean] || 'other';
}

function getPhoneIpa(p: string): string {
  if (!p) return '';
  const clean = p.replace(/\d+/g, '').toUpperCase();
  return IPA_MAP[clean] || clean;
}

function isVoiced(p: string): boolean {
  if (!p) return true;
  const clean = p.replace(/\d+/g, '').toUpperCase();
  return !VOICELESS.has(clean);
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getVoiceContextLabel(c: string): string {
  switch (c) {
    case 'LJSpeech': return 'Controlled Studio';
    case 'LibriTTS': return 'Multi-Speaker Diverse';
    case 'VCTK': return 'Multi-Accent Regional';
    case 'Free_ST': return 'Non-Native / L2 Accented';
    default: return c;
  }
}

// Word to Phonemes Mapping with smart fallback
function getWordPhones(w: string): string[] {
  const clean = w.toUpperCase();
  if (LEXICON[clean]) return [...LEXICON[clean]];
  if (clean.endsWith('S') && LEXICON[clean.slice(0, -1)]) {
    return [...LEXICON[clean.slice(0, -1)], 'Z'];
  }
  if (clean.endsWith('ED') && LEXICON[clean.slice(0, -2)]) {
    return [...LEXICON[clean.slice(0, -2)], 'D'];
  }
  const phones: string[] = [];
  for (const ch of clean) {
    if ('AEIOU'.includes(ch)) phones.push('AH0');
    else if ('BP'.includes(ch)) phones.push(ch);
    else if ('DT'.includes(ch)) phones.push(ch);
    else if ('SZ'.includes(ch)) phones.push(ch);
    else if ('MN'.includes(ch)) phones.push(ch);
    else if ('LR'.includes(ch)) phones.push(ch);
    else phones.push('K');
  }
  return phones.length ? phones : ['AH0'];
}

function textToPhones(text: string): string[] {
  const norm = normalizeText(text);
  const words = norm.toUpperCase().split(' ').filter(Boolean);
  const phones: string[] = [];
  for (const w of words) {
    phones.push(...getWordPhones(w));
  }
  return phones;
}

// ── Benchmark MFA Alignment Timings for LJ016-0169 (WAV Audio Slicing) ──
const LJ016_PHONE_TIMINGS: Array<{ p: string; start: number; end: number; word: string }> = [
  { p: 'AE1', start: 0.00, end: 0.09, word: 'as' },
  { p: 'Z', start: 0.09, end: 0.17, word: 'as' },
  { p: 'M', start: 0.17, end: 0.25, word: 'more' },
  { p: 'AO1', start: 0.25, end: 0.34, word: 'more' },
  { p: 'R', start: 0.34, end: 0.40, word: 'more' },
  { p: 'HH', start: 0.40, end: 0.51, word: 'humane' },
  { p: 'Y', start: 0.51, end: 0.56, word: 'humane' },
  { p: 'UW0', start: 0.56, end: 0.60, word: 'humane' },
  { p: 'M', start: 0.60, end: 0.72, word: 'humane' },
  { p: 'EY1', start: 0.72, end: 0.93, word: 'humane' },
  { p: 'N', start: 0.93, end: 1.02, word: 'humane' },
  { p: 'P', start: 1.02, end: 1.12, word: 'principles' },
  { p: 'R', start: 1.12, end: 1.16, word: 'principles' },
  { p: 'IH1', start: 1.16, end: 1.20, word: 'principles' },
  { p: 'N', start: 1.20, end: 1.25, word: 'principles' },
  { p: 'S', start: 1.25, end: 1.33, word: 'principles' },
  { p: 'AH0', start: 1.33, end: 1.38, word: 'principles' },
  { p: 'P', start: 1.38, end: 1.45, word: 'principles' },
  { p: 'AH0', start: 1.45, end: 1.49, word: 'principles' },
  { p: 'L', start: 1.49, end: 1.60, word: 'principles' },
  { p: 'Z', start: 1.60, end: 1.70, word: 'principles' },
  { p: 'W', start: 1.70, end: 1.75, word: 'were' },
  { p: 'ER0', start: 1.75, end: 1.82, word: 'were' },
  { p: 'IH2', start: 1.82, end: 1.91, word: 'introduced' },
  { p: 'N', start: 1.91, end: 1.95, word: 'introduced' },
  { p: 'T', start: 1.95, end: 2.06, word: 'introduced' },
  { p: 'R', start: 2.06, end: 2.09, word: 'introduced' },
  { p: 'AH0', start: 2.09, end: 2.13, word: 'introduced' },
  { p: 'D', start: 2.13, end: 2.24, word: 'introduced' },
  { p: 'UW1', start: 2.24, end: 2.43, word: 'introduced' },
  { p: 'S', start: 2.43, end: 2.54, word: 'introduced' },
  { p: 'T', start: 2.54, end: 2.60, word: 'introduced' },
  { p: 'IH0', start: 2.60, end: 2.67, word: 'into' },
  { p: 'N', start: 2.67, end: 2.72, word: 'into' },
  { p: 'T', start: 2.72, end: 2.79, word: 'into' },
  { p: 'AH0', start: 2.79, end: 2.83, word: 'into' },
  { p: 'P', start: 2.83, end: 2.94, word: 'prison' },
  { p: 'R', start: 2.94, end: 2.99, word: 'prison' },
  { p: 'IH1', start: 2.99, end: 3.04, word: 'prison' },
  { p: 'Z', start: 3.04, end: 3.12, word: 'prison' },
  { p: 'AH0', start: 3.12, end: 3.17, word: 'prison' },
  { p: 'N', start: 3.17, end: 3.30, word: 'prison' },
  { p: 'M', start: 3.30, end: 3.34, word: 'management' },
  { p: 'AE1', start: 3.34, end: 3.45, word: 'management' },
  { p: 'N', start: 3.45, end: 3.51, word: 'management' },
  { p: 'IH0', start: 3.51, end: 3.57, word: 'management' },
  { p: 'JH', start: 3.57, end: 3.72, word: 'management' },
  { p: 'M', start: 3.72, end: 3.77, word: 'management' },
  { p: 'AH0', start: 3.77, end: 3.87, word: 'management' },
  { p: 'N', start: 3.87, end: 3.92, word: 'management' },
  { p: 'T', start: 3.92, end: 4.08, word: 'management' }
];

const LJ016_WORD_TIMINGS: Record<string, { start: number; end: number }> = {
  as: { start: 0.00, end: 0.17 },
  more: { start: 0.17, end: 0.40 },
  humane: { start: 0.40, end: 1.02 },
  principles: { start: 1.02, end: 1.70 },
  were: { start: 1.70, end: 1.82 },
  introduced: { start: 1.82, end: 2.60 },
  into: { start: 2.60, end: 2.83 },
  prison: { start: 2.83, end: 3.30 },
  management: { start: 3.30, end: 4.08 }
};

// ── Precise MFA & Wav2Vec2 Timings for demo_001 ("the quick brown fox jumps over the lazy dog") ──
const DEMO001_PHONE_TIMINGS: Array<{ p: string; start: number; end: number; word: string }> = [
  // the (DH, AH0)
  { p: 'DH', start: 0.00, end: 0.05, word: 'the' },
  { p: 'AH0', start: 0.05, end: 0.11, word: 'the' },
  // quick (K, W, IH1, K)
  { p: 'K', start: 0.14, end: 0.19, word: 'quick' },
  { p: 'W', start: 0.19, end: 0.24, word: 'quick' },
  { p: 'IH1', start: 0.24, end: 0.30, word: 'quick' },
  { p: 'K', start: 0.30, end: 0.35, word: 'quick' },
  // brown (B, R, AW1, N)
  { p: 'B', start: 0.44, end: 0.50, word: 'brown' },
  { p: 'R', start: 0.50, end: 0.58, word: 'brown' },
  { p: 'AW1', start: 0.58, end: 0.68, word: 'brown' },
  { p: 'N', start: 0.68, end: 0.76, word: 'brown' },
  // fox (F, AA1, K, S)
  { p: 'F', start: 0.84, end: 0.92, word: 'fox' },
  { p: 'AA1', start: 0.92, end: 1.02, word: 'fox' },
  { p: 'K', start: 1.02, end: 1.07, word: 'fox' },
  { p: 'S', start: 1.07, end: 1.16, word: 'fox' },
  // jumps (JH, AH1, M, P, S)
  { p: 'JH', start: 1.24, end: 1.30, word: 'jumps' },
  { p: 'AH1', start: 1.30, end: 1.39, word: 'jumps' },
  { p: 'M', start: 1.39, end: 1.46, word: 'jumps' },
  { p: 'P', start: 1.46, end: 1.50, word: 'jumps' },
  { p: 'S', start: 1.50, end: 1.60, word: 'jumps' },
  // over (OW1, V, ER0)
  { p: 'OW1', start: 1.72, end: 1.80, word: 'over' },
  { p: 'V', start: 1.80, end: 1.86, word: 'over' },
  { p: 'ER0', start: 1.86, end: 1.94, word: 'over' },
  // the (DH, AH0)
  { p: 'DH', start: 1.96, end: 2.01, word: 'the' },
  { p: 'AH0', start: 2.01, end: 2.08, word: 'the' },
  // lazy (L, EY1, Z, IY0)
  { p: 'L', start: 2.12, end: 2.20, word: 'lazy' },
  { p: 'EY1', start: 2.20, end: 2.30, word: 'lazy' },
  { p: 'Z', start: 2.30, end: 2.38, word: 'lazy' },
  { p: 'IY0', start: 2.38, end: 2.48, word: 'lazy' },
  // dog (D, AO1, G)
  { p: 'D', start: 2.52, end: 2.60, word: 'dog' },
  { p: 'AO1', start: 2.60, end: 2.74, word: 'dog' },
  { p: 'G', start: 2.74, end: 2.85, word: 'dog' }
];

const DEMO001_WORD_TIMINGS: Record<string, { start: number; end: number }> = {
  the: { start: 0.00, end: 0.11 },
  quick: { start: 0.14, end: 0.35 },
  brown: { start: 0.44, end: 0.76 },
  fox: { start: 0.84, end: 1.16 },
  jumps: { start: 1.24, end: 1.60 },
  over: { start: 1.72, end: 1.94 },
  lazy: { start: 2.12, end: 2.48 },
  dog: { start: 2.52, end: 2.85 }
};

// ── Web Audio Buffer Cache & Audio Slicing Engine ──
let sharedAudioCtx: AudioContext | null = null;
const audioBufferCache = new Map<string, AudioBuffer>();
let activeSourceNode: AudioBufferSourceNode | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

async function loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getSharedAudioContext();
  if (!ctx) return null;
  if (audioBufferCache.has(url)) return audioBufferCache.get(url)!;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const audioBuf = await ctx.decodeAudioData(arrayBuf);
    audioBufferCache.set(url, audioBuf);
    return audioBuf;
  } catch (err) {
    console.warn('Audio decoding failed for:', url, err);
    return null;
  }
}

function stopCurrentAudio() {
  if (activeSourceNode) {
    try { activeSourceNode.stop(); } catch {}
    try { activeSourceNode.disconnect(); } catch {}
    activeSourceNode = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}

function playAudioSlice(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number,
  onEnd?: () => void
) {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  stopCurrentAudio();

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  const dur = Math.max(0.06, endTime - startTime);
  const safeStart = Math.max(0, startTime);
  source.start(0, safeStart, dur);
  activeSourceNode = source;
  source.onended = () => {
    if (activeSourceNode === source) {
      activeSourceNode = null;
    }
    if (onEnd) onEnd();
  };
}

// ── Web Audio Acoustic Synthesizer (Single Clean Phoneme Audio with Zero Letter Spelling) ──
function playAcousticPhone(phone: string) {
  try {
    stopCurrentAudio();
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const clean = phone.replace(/\d+/g, '').toUpperCase();
    const manner = getPhoneClass(clean);
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);

    if (manner === 'vowels' || manner === 'approximants') {
      // Voiced Formant Periodic Resonance (Glottal source F0 ~ 135 Hz)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(135, now);

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.setValueAtTime(5, now);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.Q.setValueAtTime(7, now);

      let f1Freq = 500, f2Freq = 1500;
      if (clean === 'IY' || clean === 'IH') { f1Freq = 280; f2Freq = 2250; }
      else if (clean === 'UW' || clean === 'UH') { f1Freq = 310; f2Freq = 870; }
      else if (clean === 'AE' || clean === 'EH') { f1Freq = 660; f2Freq = 1720; }
      else if (clean === 'AA' || clean === 'AO') { f1Freq = 730; f2Freq = 1100; }
      else if (clean === 'AH') { f1Freq = 640; f2Freq = 1200; }
      else if (clean === 'L' || clean === 'R') { f1Freq = 380; f2Freq = 1300; }
      else if (clean === 'W' || clean === 'Y') { f1Freq = 320; f2Freq = 2100; }

      f1.frequency.setValueAtTime(f1Freq, now);
      f2.frequency.setValueAtTime(f2Freq, now);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(master);
      f2.connect(master);

      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.28, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.start(now);
      osc.stop(now + 0.19);
    } else if (manner === 'nasals') {
      // Nasal murmur (250 Hz peak)
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(clean === 'M' ? 120 : 135, now);

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(250, now);
      f1.Q.setValueAtTime(6, now);

      osc.connect(f1);
      f1.connect(master);

      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.start(now);
      osc.stop(now + 0.19);
    } else if (manner === 'fricatives') {
      // Clean turbulent noise without letter spelling
      const isPhoneVoiced = isVoiced(clean);
      const bufLen = Math.floor(ctx.sampleRate * 0.18);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      let centerFreq = 5400;
      if (clean === 'SH' || clean === 'ZH') centerFreq = 3000;
      else if (clean === 'F' || clean === 'V') centerFreq = 2500;
      else if (clean === 'TH' || clean === 'DH') centerFreq = 3000;
      bpf.frequency.setValueAtTime(centerFreq, now);
      bpf.Q.setValueAtTime(3, now);

      noise.connect(bpf);
      bpf.connect(master);

      if (isPhoneVoiced) {
        // Add voiced vocal fold buzz for /z/, /v/, /ð/, /ʒ/
        const vOsc = ctx.createOscillator();
        vOsc.type = 'sawtooth';
        vOsc.frequency.setValueAtTime(130, now);
        const vFilter = ctx.createBiquadFilter();
        vFilter.type = 'lowpass';
        vFilter.frequency.setValueAtTime(450, now);
        vOsc.connect(vFilter);
        vFilter.connect(master);
        vOsc.start(now);
        vOsc.stop(now + 0.18);
      }

      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.start(now);
      noise.stop(now + 0.19);
    } else {
      // Plosive release burst shockwave
      const bufLen = Math.floor(ctx.sampleRate * 0.07);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012));
      }
      const burst = ctx.createBufferSource();
      burst.buffer = buf;

      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      let burstFreq = 2200;
      if (clean === 'P' || clean === 'B') burstFreq = 800;
      else if (clean === 'T' || clean === 'D') burstFreq = 3800;
      else if (clean === 'CH' || clean === 'JH') burstFreq = 3000;
      bpf.frequency.setValueAtTime(burstFreq, now);
      bpf.Q.setValueAtTime(2.5, now);

      burst.connect(bpf);
      bpf.connect(master);

      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.38, now + 0.005);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      burst.start(now);
      burst.stop(now + 0.08);
    }
  } catch (e) {
    console.warn('Web Audio synthesis failed:', e);
  }
}

function playSpokenWord(word: string) {
  stopCurrentAudio();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utter = new SpeechSynthesisUtterance(word);
      utter.rate = 0.85;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    } catch {}
  }
}

export interface AlignedToken {
  type: 'hit' | 'sub' | 'del' | 'ins';
  ref: string;
  hyp: string;
  refIdx: number;
  hypIdx: number;
}

export interface DPResult {
  hits: number;
  subs: number;
  dels: number;
  ins: number;
  aligned: AlignedToken[];
}

function dpAlignment(refTokens: string[], hypTokens: string[]): DPResult {
  const n = refTokens.length;
  const m = hypTokens.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refTokens[i - 1] === hypTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const aligned: AlignedToken[] = [];
  let hits = 0;
  let subs = 0;
  let dels = 0;
  let ins = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refTokens[i - 1] === hypTokens[j - 1]) {
      aligned.unshift({ type: 'hit', ref: refTokens[i - 1], hyp: hypTokens[j - 1], refIdx: i - 1, hypIdx: j - 1 });
      hits++;
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      aligned.unshift({ type: 'sub', ref: refTokens[i - 1], hyp: hypTokens[j - 1], refIdx: i - 1, hypIdx: j - 1 });
      subs++;
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      aligned.unshift({ type: 'del', ref: refTokens[i - 1], hyp: '', refIdx: i - 1, hypIdx: -1 });
      dels++;
      i--;
    } else {
      aligned.unshift({ type: 'ins', ref: '', hyp: hypTokens[j - 1], refIdx: -1, hypIdx: j - 1 });
      ins++;
      j--;
    }
  }

  return { hits, subs, dels, ins, aligned };
}

type VisMode = 'manner' | 'edit' | 'voicing';

export const InteractiveEvaluatorView: React.FC = () => {
  // Filters
  const [corpusFilter, setCorpusFilter] = useState<string>('all');
  const [asrFilter, setAsrFilter] = useState<string>('all');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);

  // Active Sentence inputs
  const [refText, setRefText] = useState<string>(PRESETS[0].reference);
  const [hypText, setHypText] = useState<string>(PRESETS[0].hypothesis);

  // Status indicator
  const [statusText, setStatusText] = useState<string>('Loaded');

  // Visualization Mode
  const [visMode, setVisMode] = useState<VisMode>('manner');

  // Interactive Cross-Highlight state
  const [activeSelection, setActiveSelection] = useState<{
    type: 'phone' | 'word' | 'manner' | null;
    phoneIdx: number | null;
    wordIdx: number | null;
    manner: string | null;
  }>({
    type: null,
    phoneIdx: null,
    wordIdx: null,
    manner: null
  });

  // Audio Playback Indicator
  const [playingLabel, setPlayingLabel] = useState<string | null>(null);
  const [isPlayingSentence, setIsPlayingSentence] = useState<boolean>(false);

  const handlePlaySentence = async () => {
    if (isPlayingSentence) {
      stopCurrentAudio();
      setIsPlayingSentence(false);
      setPlayingLabel(null);
      return;
    }

    if (activePreset?.audioUrl) {
      const buf = await loadAudioBuffer(activePreset.audioUrl);
      if (buf) {
        setIsPlayingSentence(true);
        setPlayingLabel(`Audio: "${activePreset.reference}"`);
        playAudioSlice(buf, 0, buf.duration, () => {
          setIsPlayingSentence(false);
          setPlayingLabel(null);
        });
        return;
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      stopCurrentAudio();
      setIsPlayingSentence(true);
      setPlayingLabel(`Full Sentence: "${refText}"`);
      const utter = new SpeechSynthesisUtterance(refText);
      utter.rate = 0.9;
      utter.pitch = 1.0;
      utter.lang = 'en-US';
      utter.onend = () => {
        setIsPlayingSentence(false);
        setPlayingLabel(null);
      };
      utter.onerror = () => {
        setIsPlayingSentence(false);
        setPlayingLabel(null);
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const handleWordClick = async (wObj: { wIdx: number; word: string }) => {
    stopCurrentAudio();
    setPlayingLabel(`Word: "${wObj.word}"`);
    setTimeout(() => setPlayingLabel(null), 1200);

    if (activeSelection.type === 'word' && activeSelection.wordIdx === wObj.wIdx) {
      setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null });
    } else {
      setActiveSelection({ type: 'word', wordIdx: wObj.wIdx, phoneIdx: null, manner: null });
    }

    const cleanWord = wObj.word.toLowerCase().replace(/[^a-z]/g, '');
    let wordTiming: { start: number; end: number } | undefined;
    if (activePreset?.id === 'LJ016-0169') {
      wordTiming = LJ016_WORD_TIMINGS[cleanWord];
    } else if (activePreset?.id === 'demo_001') {
      wordTiming = DEMO001_WORD_TIMINGS[cleanWord];
    }

    if (activePreset?.audioUrl && wordTiming) {
      const buf = await loadAudioBuffer(activePreset.audioUrl);
      if (buf) {
        playAudioSlice(buf, wordTiming.start, wordTiming.end);
        return;
      }
    }

    // Single-shot spoken word (never spells letters)
    playSpokenWord(wObj.word);
  };

  const handlePhoneClick = async (p: string, ipa: string, globalIdx: number) => {
    stopCurrentAudio();
    setPlayingLabel(`Phoneme: /${p}/ [${ipa}]`);
    setTimeout(() => setPlayingLabel(null), 1200);

    if (activeSelection.type === 'phone' && activeSelection.phoneIdx === globalIdx) {
      setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null });
    } else {
      setActiveSelection({ type: 'phone', phoneIdx: globalIdx, wordIdx: null, manner: null });
    }

    let phoneTiming: { start: number; end: number } | undefined;
    if (activePreset?.id === 'LJ016-0169') {
      phoneTiming = LJ016_PHONE_TIMINGS[globalIdx];
    } else if (activePreset?.id === 'demo_001') {
      phoneTiming = DEMO001_PHONE_TIMINGS[globalIdx];
    }

    if (activePreset?.audioUrl && phoneTiming) {
      const buf = await loadAudioBuffer(activePreset.audioUrl);
      if (buf) {
        playAudioSlice(buf, phoneTiming.start, phoneTiming.end);
        return;
      }
    }

    // Pure Web Audio acoustic synthesis: formant resonance / burst / noise (ZERO letter spelling, ZERO duplicate playback)
    playAcousticPhone(p);
  };

  // Filtered preset options
  const filteredPresets = useMemo(() => {
    return PRESETS.map((item, originalIdx) => ({ item, originalIdx })).filter(({ item }) => {
      const matchCorpus = corpusFilter === 'all' || item.corpus === corpusFilter;
      const matchAsr = asrFilter === 'all' || item.asr === asrFilter || item.asr === 'all';
      return matchCorpus && matchAsr;
    });
  }, [corpusFilter, asrFilter]);

  const activePreset = PRESETS[selectedPresetIdx] || PRESETS[0];

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    const item = PRESETS[idx];
    if (item) {
      setRefText(item.reference);
      setHypText(item.hypothesis);
      setStatusText('Processing…');
      setTimeout(() => setStatusText('Loaded'), 200);
      setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null });
    }
  };

  // Run dynamic evaluations
  const evalData = useMemo(() => {
    const refNorm = normalizeText(refText);
    const hypNorm = normalizeText(hypText);

    const refWords = refNorm.split(' ').filter(Boolean);
    const hypWords = hypNorm.split(' ').filter(Boolean);

    // Word alignment (WER / MER)
    const wordAlign = dpAlignment(refWords, hypWords);
    const nRefWords = refWords.length;
    const wordEdits = wordAlign.subs + wordAlign.dels + wordAlign.ins;
    const wer = nRefWords > 0 ? wordEdits / nRefWords : hypWords.length > 0 ? 1 : 0;
    const totalAligned = wordAlign.hits + wordEdits;
    const mer = totalAligned > 0 ? wordEdits / totalAligned : 0;

    // Character alignment (CER)
    const refChars = refNorm.replace(/\s+/g, '').split('');
    const hypChars = hypNorm.replace(/\s+/g, '').split('');
    const charAlign = dpAlignment(refChars, hypChars);
    const nRefChars = refChars.length;
    const charEdits = charAlign.subs + charAlign.dels + charAlign.ins;
    const cer = nRefChars > 0 ? charEdits / nRefChars : hypChars.length > 0 ? 1 : 0;

    // Phonetic alignment (PER)
    const refPhones = textToPhones(refText);
    const hypPhones = textToPhones(hypText);
    const phoneAlign = dpAlignment(refPhones, hypPhones);
    const nRefPhones = refPhones.length;
    const phoneEdits = phoneAlign.subs + phoneAlign.dels + phoneAlign.ins;
    const per = nRefPhones > 0 ? phoneEdits / nRefPhones : hypPhones.length > 0 ? 1 : 0;

    // Word to Phones indexing
    const wordToPhones: Array<{
      word: string;
      wIdx: number;
      phones: string[];
      phoneIndices: number[];
      status: 'hit' | 'sub' | 'del';
    }> = [];

    let globalPIdx = 0;
    refWords.forEach((word, wIdx) => {
      const phones = getWordPhones(word);
      const pIndices: number[] = [];
      phones.forEach(() => {
        pIndices.push(globalPIdx);
        globalPIdx++;
      });

      // Find status
      let st: 'hit' | 'sub' | 'del' = 'hit';
      const alignedToken = wordAlign.aligned.find((a) => a.refIdx === wIdx);
      if (alignedToken) {
        if (alignedToken.type === 'sub') st = 'sub';
        if (alignedToken.type === 'del') st = 'del';
      }

      wordToPhones.push({
        word,
        wIdx,
        phones,
        phoneIndices: pIndices,
        status: st
      });
    });

    // Manner diagnostics counts
    const classStats: Record<string, { total: number; hits: number; color: string; icon: string }> = {
      vowels: { total: 0, hits: 0, color: '#F294C8', icon: '🌸' },
      plosives: { total: 0, hits: 0, color: '#88DFF2', icon: '💧' },
      fricatives: { total: 0, hits: 0, color: '#F2C53D', icon: '⚡' },
      affricates: { total: 0, hits: 0, color: '#F472B6', icon: '✨' },
      aspirates: { total: 0, hits: 0, color: '#FB923C', icon: '💨' },
      nasals: { total: 0, hits: 0, color: '#64BF56', icon: '🌿' },
      approximants: { total: 0, hits: 0, color: '#A78BFA', icon: '🌊' }
    };

    let totalPhonesCount = 0;
    phoneAlign.aligned.forEach((item) => {
      if (item.ref) {
        totalPhonesCount++;
        const c = getPhoneClass(item.ref);
        if (classStats[c]) {
          classStats[c].total++;
          if (item.type === 'hit') classStats[c].hits++;
        }
      }
    });

    return {
      wer,
      cer,
      mer,
      per,
      wordAlign,
      charAlign,
      phoneAlign,
      nRefWords,
      nRefPhones,
      wordToPhones,
      classStats,
      totalPhonesCount
    };
  }, [refText, hypText]);

  // Color determination helper
  const getPhoneColor = (p: string, editType?: string): string => {
    if (visMode === 'manner') {
      const cls = getPhoneClass(p);
      return MANNER_COLORS[cls] || '#94A3B8';
    } else if (visMode === 'edit') {
      if (editType === 'hit') return '#64BF56';
      if (editType === 'sub') return '#F2C53D';
      if (editType === 'del') return '#F65936';
      if (editType === 'ins') return '#88DFF2';
      return '#94A3B8';
    } else {
      return isVoiced(p) ? '#0284C7' : '#E11D48';
    }
  };

  // Trajectory points calculation
  const trajectoryPoints = useMemo(() => {
    const items = evalData.phoneAlign.aligned.filter((item) => item.ref);
    if (items.length === 0) return [];

    const paddingLeft = 80;
    const paddingRight = 40;
    const minStepX = 42;
    const plotWidth = Math.max(680, items.length * minStepX);
    const stepX = plotWidth / Math.max(1, items.length - 1);

    const levelY: Record<number, number> = {
      5: 42,
      4: 82,
      3: 122,
      2: 162,
      1: 202
    };

    return items.map((item, idx) => {
      const p = item.ref;
      const manner = getPhoneClass(p);
      const lvl = MANNER_LEVELS[manner] || 3;
      const x = paddingLeft + idx * stepX;
      const y = levelY[lvl];

      // Find parent word
      let parentWord = '';
      let parentWordIdx = -1;
      for (const wObj of evalData.wordToPhones) {
        if (wObj.phoneIndices.includes(idx)) {
          parentWord = wObj.word;
          parentWordIdx = wObj.wIdx;
          break;
        }
      }

      return { x, y, item, manner, p, idx, parentWord, parentWordIdx };
    });
  }, [evalData]);

  // SVG dimensions
  const svgWidth = trajectoryPoints.length > 0 ? 80 + Math.max(680, trajectoryPoints.length * 42) + 40 : 800;
  const svgHeight = 255;

  // Active highlight band bounds (with 25% opacity)
  const activeHighlightBand = useMemo(() => {
    if (!activeSelection.type || trajectoryPoints.length === 0) return null;

    if (activeSelection.type === 'phone' && activeSelection.phoneIdx !== null) {
      const pt = trajectoryPoints.find((p) => p.idx === activeSelection.phoneIdx);
      if (pt) {
        return { x1: pt.x - 20, x2: pt.x + 20, label: `${pt.p} [${getPhoneIpa(pt.p)}]` };
      }
    } else if (activeSelection.type === 'word' && activeSelection.wordIdx !== null) {
      const wObj = evalData.wordToPhones.find((w) => w.wIdx === activeSelection.wordIdx);
      if (wObj && wObj.phoneIndices.length > 0) {
        const pts = trajectoryPoints.filter((p) => wObj.phoneIndices.includes(p.idx));
        if (pts.length > 0) {
          const minX = Math.min(...pts.map((p) => p.x)) - 22;
          const maxX = Math.max(...pts.map((p) => p.x)) + 22;
          return { x1: minX, x2: maxX, label: `Word: "${wObj.word}"` };
        }
      }
    }
    return null;
  }, [activeSelection, trajectoryPoints, evalData]);

  // Smooth bezier path string
  const bezierPathD = useMemo(() => {
    if (trajectoryPoints.length <= 1) return '';
    let d = `M ${trajectoryPoints[0].x} ${trajectoryPoints[0].y}`;
    for (let i = 0; i < trajectoryPoints.length - 1; i++) {
      const curr = trajectoryPoints[i];
      const next = trajectoryPoints[i + 1];
      const mx = (curr.x + next.x) / 2;
      d += ` C ${mx} ${curr.y}, ${mx} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [trajectoryPoints]);

  return (
    <div className="space-y-8 anim-fade-up">
      {/* ── Page Header / Subtitle ── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-[#64BF56]/15 text-[#14213D] dark:text-[#64BF56]">🧪</span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
                Interactive Speech Evaluator
              </h1>
            </div>
            <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] max-w-2xl">
              Inspect token-level phonetic alignments, compute live NIST Levenshtein error rates (WER, CER, MER, PER), and visualize dynamic speech articulation trajectory curves with sonority hierarchies.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] border border-[#88DFF2]/40">
              60 Synthesized Presets
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#F294C8]/20 text-[#14213D] dark:text-[#F294C8] border border-[#F294C8]/40">
              413-Word Lexicon
            </span>
          </div>
        </div>

        {/* Preset Sample Selector Card */}
        <div className="mt-6 pt-6 border-t border-[#D6EDF8]/60 dark:border-[#2A3F54]/60 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
            Filter Synthetic Presets:
          </div>

          {/* Filter row: Corpus */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#5A7086] mr-2">Voice Context:</span>
            {[
              { id: 'all', label: 'All Voice Contexts' },
              { id: 'LJSpeech', label: '🎙️ Controlled Studio' },
              { id: 'LibriTTS', label: '📚 Multi-Speaker Diverse' },
              { id: 'VCTK', label: '🗺️ Multi-Accent Regional' },
              { id: 'Free_ST', label: '📱 Non-Native / L2 Accented' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCorpusFilter(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  corpusFilter === c.id
                    ? 'bg-[#88DFF2] text-[#14213D] font-bold shadow-xs'
                    : 'bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#88DFF2]/20'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Filter row: ASR Model */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-[#5A7086] mr-2">ASR Model:</span>
            {[
              { id: 'all', label: 'All Models' },
              { id: 'Whisper-Small', label: '🌬 Whisper-Small' },
              { id: 'Wav2vec2-Base', label: '🔊 Wav2vec2-Base' }
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setAsrFilter(a.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  asrFilter === a.id
                    ? 'bg-[#F294C8] text-[#14213D] font-bold shadow-xs'
                    : 'bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#F294C8]/20'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Dropdown Select */}
          <div>
            <select
              value={selectedPresetIdx}
              onChange={(e) => handleSelectPreset(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#161B22] text-xs font-medium text-[#14213D] dark:text-white cursor-pointer focus:ring-2 focus:ring-[#88DFF2]"
            >
              {filteredPresets.map(({ item, originalIdx }) => (
                <option key={item.id} value={originalIdx}>
                  [{item.id}] ({getVoiceContextLabel(item.corpus)} · {item.asr}) {item.reference.substring(0, 70)}…
                </option>
              ))}
            </select>
          </div>

          {/* Participant / Subject Info Panel */}
          <div className="p-3.5 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <span className="text-[10px] uppercase text-[#5A7086] block">Subject / Sample ID</span>
                <span className="font-bold text-[#14213D] dark:text-white">{activePreset.id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#5A7086] block">Voice Context (Source)</span>
                <span className="font-bold text-[#88DFF2]">{getVoiceContextLabel(activePreset.corpus)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-[#5A7086] block">ASR System</span>
                <span className="font-bold text-[#F294C8]">{activePreset.asr}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56] border border-[#64BF56]/40">
                ✅ {statusText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inputs Grid: Reference & Hypothesis ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
            Reference Sentence (Ground Truth Transcript)
          </label>
          <textarea
            value={refText}
            onChange={(e) => setRefText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#0D1117] text-xs sm:text-sm font-sans text-[#14213D] dark:text-white focus:ring-2 focus:ring-[#88DFF2] resize-y"
            placeholder="Enter reference transcript…"
          />
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
            Hypothesis Sentence (Model Output Transcription)
          </label>
          <textarea
            value={hypText}
            onChange={(e) => setHypText(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#0D1117] text-xs sm:text-sm font-sans text-[#14213D] dark:text-white focus:ring-2 focus:ring-[#F294C8] resize-y"
            placeholder="Enter hypothesis transcript…"
          />
        </div>
      </div>

      {/* ── Live Metric Scoreboard ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-center shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">WER</div>
          <div className="text-2xl sm:text-3xl font-black font-mono my-1 text-[#88DFF2]">
            {(evalData.wer * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#5A7086]">Word Error Rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-center shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">CER</div>
          <div className="text-2xl sm:text-3xl font-black font-mono my-1 text-[#F294C8]">
            {(evalData.cer * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#5A7086]">Character Error Rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-center shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">MER</div>
          <div className="text-2xl sm:text-3xl font-black font-mono my-1 text-[#F2C53D]">
            {(evalData.mer * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#5A7086]">Match Error Rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-center shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">PER</div>
          <div className="text-2xl sm:text-3xl font-black font-mono my-1 text-[#64BF56]">
            {(evalData.per * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#5A7086]">Phone Error Rate (ARPAbet)</div>
        </div>
      </div>

      {/* ── Alignment Counts Bar ── */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <span>Hits (H): <strong className="text-[#64BF56]">{evalData.wordAlign.hits}</strong></span>
          <span>Substitutions (S): <strong className="text-[#F2C53D]">{evalData.wordAlign.subs}</strong></span>
          <span>Deletions (D): <strong className="text-[#F65936]">{evalData.wordAlign.dels}</strong></span>
          <span>Insertions (I): <strong className="text-[#88DFF2]">{evalData.wordAlign.ins}</strong></span>
        </div>
        <div className="flex items-center gap-4 text-[#5A7086] dark:text-[#7A9BB8]">
          <span>Ref Words: <strong>{evalData.nRefWords}</strong></span>
          <span>Ref Phones: <strong>{evalData.nRefPhones}</strong></span>
        </div>
      </div>

      {/* ── Token Alignment & Error Progression Timeline ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#14213D] dark:text-white">
              🎯 Token Alignment & Error Progression Timeline
            </h3>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
              Click any token below to isolate its constituent phonemes & trajectory span on the curve!
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56] font-semibold">Hit (Match)</span>
            <span className="px-2 py-0.5 rounded bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D] font-semibold">Substitution</span>
            <span className="px-2 py-0.5 rounded bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936] font-semibold">Deletion</span>
            <span className="px-2 py-0.5 rounded bg-[#88DFF2]/20 text-[#0E7490] dark:text-[#88DFF2] font-semibold">Insertion</span>
          </div>
        </div>

        {/* Tokens Row */}
        <div className="flex flex-wrap gap-2 pt-2">
          {evalData.wordAlign.aligned.map((item, idx) => {
            const isSelected =
              activeSelection.type === 'word' &&
              ((item.refIdx >= 0 && activeSelection.wordIdx === item.refIdx) ||
                (item.refIdx < 0 && activeSelection.wordIdx === idx));

            let badgeClass = 'bg-[#64BF56]/15 text-[#2E7D32] dark:text-[#64BF56] border-[#64BF56]/40';
            let label = item.ref;
            let typeLabel = 'HIT';

            if (item.type === 'sub') {
              badgeClass = 'bg-[#F2C53D]/20 text-[#854D0E] dark:text-[#F2C53D] border-[#F2C53D]/50 font-bold';
              label = `${item.ref} → ${item.hyp}`;
              typeLabel = 'SUB';
            } else if (item.type === 'del') {
              badgeClass = 'bg-[#F65936]/15 text-[#C62828] dark:text-[#F65936] border-[#F65936]/40 line-through';
              label = item.ref;
              typeLabel = 'DEL';
            } else if (item.type === 'ins') {
              badgeClass = 'bg-[#88DFF2]/20 text-[#0E7490] dark:text-[#88DFF2] border-[#88DFF2]/40';
              label = `+${item.hyp}`;
              typeLabel = 'INS';
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  const targetWIdx = item.refIdx >= 0 ? item.refIdx : idx;
                  if (activeSelection.type === 'word' && activeSelection.wordIdx === targetWIdx) {
                    setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null });
                  } else {
                    setActiveSelection({ type: 'word', wordIdx: targetWIdx, phoneIdx: null, manner: null });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${badgeClass} ${
                  isSelected ? 'ring-2 ring-offset-2 ring-[#88DFF2] scale-105 shadow-md' : 'hover:scale-102'
                }`}
              >
                <span>{label}</span>
                <span className="text-[9px] opacity-75 ml-1.5">[{typeLabel}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Phoneme Visualizations Suite ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#14213D] dark:text-white">
              📊 Interactive Phoneme Sequence Flow & Articulation Plots
            </h3>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
              Explore how phonemes evolve along the sentence across words and manner of articulation classes:
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeHighlightBand && (
              <span className="text-xs font-bold text-[#F65936] font-mono">
                Active Filter: {activeHighlightBand.label}
              </span>
            )}
            {activeSelection.type && (
              <button
                onClick={() => setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null })}
                className="px-2.5 py-1 rounded-lg border border-[#D6EDF8] dark:border-[#2A3F54] text-xs font-bold text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Visualization Control Bar: Palette Mode + Legend */}
        <div className="p-3.5 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A7086]">Color Palette:</span>
            <div className="flex items-center gap-1">
              {[
                { id: 'manner', label: '🎨 Manner of Articulation' },
                { id: 'edit', label: '🎯 Edit Status' },
                { id: 'voicing', label: '🔊 Voicing' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setVisMode(m.id as VisMode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    visMode === m.id
                      ? 'bg-[#88DFF2] text-[#14213D] font-bold shadow-xs'
                      : 'border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#88DFF2]/15'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {visMode === 'manner' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#F294C8]" /> <span>Vowels</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#88DFF2]" /> <span>Plosives</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#F2C53D]" /> <span>Fricatives</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#64BF56]" /> <span>Nasals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#A78BFA]" /> <span>Approximants</span>
                </div>
              </>
            )}
            {visMode === 'edit' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#64BF56]" /> <span>Hit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#F2C53D]" /> <span>Sub</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#F65936]" /> <span>Del</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#88DFF2]" /> <span>Ins</span>
                </div>
              </>
            )}
            {visMode === 'voicing' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0284C7]" /> <span>Voiced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#E11D48]" /> <span>Voiceless</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Word & Phoneme Sequence Flow Hierarchy Ribbon */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#5A7086] dark:text-[#7A9BB8]">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider">Word & Phoneme Sequence Flow</span>
              <button
                onClick={handlePlaySentence}
                className="px-2.5 py-1 rounded-lg bg-[#88DFF2]/20 hover:bg-[#88DFF2]/35 text-[#0D1B2A] dark:text-[#88DFF2] border border-[#88DFF2]/50 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                title="Listen to full reference sentence spoken aloud"
              >
                {isPlayingSentence ? (
                  <>
                    <Square className="w-3 h-3 text-[#F65936] fill-[#F65936]" /> Stop Audio
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-[#0284C7] dark:text-[#88DFF2]" /> Listen Sentence
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {playingLabel && (
                <span className="px-2 py-0.5 rounded bg-[#64BF56]/20 text-[#2E7D32] dark:text-[#64BF56] border border-[#64BF56]/40 font-mono text-[11px] animate-pulse flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> {playingLabel}
                </span>
              )}
              <span>💡 Click any word or phone chip to listen & highlight</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-[#F0F8FF]/80 dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] overflow-x-auto">
            {evalData.wordToPhones.map((wObj) => {
              const isWordActive =
                activeSelection.type === 'word' && activeSelection.wordIdx === wObj.wIdx;

              return (
                <div
                  key={wObj.wIdx}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isWordActive
                      ? 'border-[#88DFF2] bg-[#88DFF2]/15 shadow-sm'
                      : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22]'
                  }`}
                >
                  <button
                    onClick={() => handleWordClick(wObj)}
                    className="font-bold text-xs text-left w-full mb-1.5 hover:text-[#88DFF2] transition-colors cursor-pointer flex items-center justify-between group"
                    title={`Click to pronounce "${wObj.word}"`}
                  >
                    <span>{wObj.word}</span>
                    <Volume2 className="w-3 h-3 opacity-40 group-hover:opacity-100 group-hover:text-[#88DFF2] transition-opacity" />
                  </button>

                  <div className="flex flex-wrap gap-1">
                    {wObj.phones.map((p, pOffset) => {
                      const globalIdx = wObj.phoneIndices[pOffset];
                      const isPhoneActive =
                        activeSelection.type === 'phone' && activeSelection.phoneIdx === globalIdx;
                      const ipa = getPhoneIpa(p);
                      const bg = getPhoneColor(p, wObj.status);

                      return (
                        <button
                          key={pOffset}
                          onClick={() => handlePhoneClick(p, ipa, globalIdx)}
                          style={{ backgroundColor: bg }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs transition-all cursor-pointer flex items-center gap-0.5 ${
                            isPhoneActive ? 'ring-2 ring-offset-1 ring-white scale-110 font-black' : 'hover:scale-105 active:scale-95'
                          }`}
                          title={`Click to listen to phone /${p}/ [${ipa}]`}
                        >
                          <span>{p}</span>
                          <span className="opacity-90">[{ipa}]</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full-width: Speech Articulation Trajectory Chart */}
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#5A7086] dark:text-[#7A9BB8]">
              <span className="uppercase tracking-wider">Speech Articulation Trajectory Curve & Phonetic Hierarchy</span>
              <span>💡 Y-axis reflects natural acoustic sonority</span>
            </div>

            <div className="rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#0C1322] p-2 overflow-x-auto relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[600px] block select-none"
              >
                {/* Horizontal lanes and labels */}
                {[
                  { lvl: 5, label: 'Vowels', icon: '🌸', y: 42 },
                  { lvl: 4, label: 'Approximants', icon: '🌊', y: 82 },
                  { lvl: 3, label: 'Nasals', icon: '🌿', y: 122 },
                  { lvl: 2, label: 'Fricatives', icon: '⚡', y: 162 },
                  { lvl: 1, label: 'Plosives', icon: '💧', y: 202 }
                ].map((lane) => (
                  <g key={lane.lvl}>
                    {/* Lane guide line */}
                    <line
                      x1={80}
                      y1={lane.y}
                      x2={svgWidth - 20}
                      y2={lane.y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeDasharray="3,3"
                      strokeWidth="1"
                    />
                    {/* Left Axis Gutter Label */}
                    <text
                      x={8}
                      y={lane.y + 4}
                      fill="#7A9BB8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {lane.icon} {lane.label}
                    </text>
                  </g>
                ))}

                {/* Vertical Separator */}
                <line
                  x1={75}
                  y1={15}
                  x2={75}
                  y2={svgHeight - 15}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                />

                {/* 25% Opacity Vertical Highlight Area for Selected Word or Phoneme */}
                {activeHighlightBand && (
                  <g>
                    <rect
                      x={activeHighlightBand.x1}
                      y={15}
                      width={activeHighlightBand.x2 - activeHighlightBand.x1}
                      height={svgHeight - 35}
                      fill="#88DFF2"
                      fillOpacity="0.25"
                      stroke="#88DFF2"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                      rx="6"
                    />
                    <text
                      x={(activeHighlightBand.x1 + activeHighlightBand.x2) / 2}
                      y={28}
                      fill="#88DFF2"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {activeHighlightBand.label}
                    </text>
                  </g>
                )}

                {/* Connecting Bezier Path */}
                {bezierPathD && (
                  <path
                    d={bezierPathD}
                    fill="none"
                    stroke="#F294C8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                  />
                )}

                {/* Trajectory Points & Badges */}
                {trajectoryPoints.map((pt) => {
                  const color = getPhoneColor(pt.p, pt.item.type);
                  const isSelected =
                    activeSelection.type === 'phone' && activeSelection.phoneIdx === pt.idx;
                  const isWordSelected =
                    activeSelection.type === 'word' && activeSelection.wordIdx === pt.parentWordIdx;
                  const isMannerSelected =
                    activeSelection.type === 'manner' && activeSelection.manner === pt.manner;

                  const isHighlighted = isSelected || isWordSelected || isMannerSelected;

                  return (
                    <g
                      key={pt.idx}
                      className="cursor-pointer"
                      onClick={() => handlePhoneClick(pt.p, getPhoneIpa(pt.p), pt.idx)}
                    >
                      {/* Vertical guide line down */}
                      <line
                        x1={pt.x}
                        y1={pt.y}
                        x2={pt.x}
                        y2={svgHeight - 20}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="2,2"
                      />

                      {/* Outer Glow */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHighlighted ? 12 : 8}
                        fill={color}
                        opacity={isHighlighted ? 0.45 : 0.22}
                      />

                      {/* Main Node Circle */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHighlighted ? 8 : 5.5}
                        fill={color}
                        stroke="#0C1322"
                        strokeWidth="2"
                      />

                      {/* White Core */}
                      <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />

                      {/* Phoneme Text Label */}
                      <text
                        x={pt.x}
                        y={pt.y <= 60 ? pt.y + 16 : pt.y - 10}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {pt.p}
                      </text>

                      {/* Bottom IPA Label */}
                      <text
                        x={pt.x}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        fill="#7A9BB8"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        [{getPhoneIpa(pt.p)}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Bottom: Manner Diagnostics as compact horizontal row */}
          <div className="rounded-2xl bg-[#F0F8FF]/80 dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#14213D] dark:text-white">Manner Diagnostics</h4>
                <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">Accuracy & phonetic distribution</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2]">
                {evalData.totalPhonesCount} phones
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {Object.entries(evalData.classStats).map(([cls, stats]) => {
                const pct = stats.total > 0 ? ((stats.hits / stats.total) * 100).toFixed(0) : '100';
                const isSelected =
                  activeSelection.type === 'manner' && activeSelection.manner === cls;

                return (
                  <div
                    key={cls}
                    onClick={() => {
                      if (activeSelection.type === 'manner' && activeSelection.manner === cls) {
                        setActiveSelection({ type: null, phoneIdx: null, wordIdx: null, manner: null });
                      } else {
                        setActiveSelection({ type: 'manner', manner: cls, phoneIdx: null, wordIdx: null });
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center ${
                      isSelected
                        ? 'border-[#88DFF2] bg-[#88DFF2]/15 shadow-xs'
                        : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22] hover:border-[#88DFF2]'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{stats.icon}</div>
                    <div className="font-bold text-[11px] capitalize text-[#14213D] dark:text-white">{cls}</div>
                    <div className="font-mono text-[10px] text-[#5A7086] dark:text-[#7A9BB8] mt-0.5">
                      {stats.hits}/{stats.total}
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#D6EDF8] dark:bg-[#2A3F54] overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: stats.color }}
                      />
                    </div>
                    <div className="text-[10px] font-bold mt-1" style={{ color: stats.color }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
