import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Rewind, FastForward, Activity, Volume2, Sparkles, ChevronDown, ChevronUp, Info, Check } from 'lucide-react';

interface WaveformAnalysisProps {
  selectedUtteranceId?: string | null;
  onSelectUtterance?: (id: string) => void;
}

const VOC_AUDIO_MAP: Record<string, { name: string; rank: string; path: string }> = {
  gt: { name: 'Ground Truth Reference (22.05 kHz)', rank: 'Ref', path: 'audio/LJ016-0169_gt.wav' },
  periodwave_24k: { name: 'M14 PeriodWave-24k', rank: 'Rank 1', path: 'audio/LJ016-0169_periodwave_24k.wav' },
  bigvgan_v2: { name: 'M7 BigVGAN-v2 (112M)', rank: 'Rank 2', path: 'audio/LJ016-0169_bigvgan_v2_24khz_100band_256x.wav' },
  periodwave_turbo: { name: 'M5 PeriodWave-Turbo', rank: 'Rank 3', path: 'audio/LJ016-0169_periodwave_turbo.wav' },
  flow2gan: { name: 'M2 Flow2GAN (4-step)', rank: 'Rank 4', path: 'audio/LJ016-0169_flow2gan.wav' },
  bridgevoc: { name: 'M4 BridgeVoC', rank: 'Rank 5', path: 'audio/LJ016-0169_bridgevoc.wav' },
  vocos: { name: 'M3 Vocos Mel-24kHz', rank: 'Rank 6', path: 'audio/LJ016-0169_vocos_mel_24khz.wav' },
  comvo_large: { name: 'M9 ComVo-Large (115M)', rank: 'Rank 7', path: 'audio/LJ016-0169_comvo_large.wav' },
  wavefm: { name: 'M10 WaveFM', rank: 'Rank 8', path: 'audio/LJ016-0169_wavefm.wav' },
  bigvgan_base: { name: 'M8 BigVGAN-Base (14M)', rank: 'Rank 9', path: 'audio/LJ016-0169_bigvgan_base_24khz_100band.wav' },
  rndvoc: { name: 'M1 RNDVoC', rank: 'Rank 10', path: 'audio/LJ016-0169_rndvoc.wav' },
  comvo_base: { name: 'M6 ComVo-Base', rank: 'Rank 11', path: 'audio/LJ016-0169_comvo_base.wav' },
  rfwave: { name: 'M13 RFWave', rank: 'Rank 12', path: 'audio/LJ016-0169_rfwave_libritts_24k.wav' },
  hifigan: { name: 'M11 HiFi-GAN Universal', rank: 'Rank 13', path: 'audio/LJ016-0169_hifigan_universal_v1.wav' },
  freev: { name: 'M12 FreeV', rank: 'Rank 14', path: 'audio/LJ016-0169_freev.wav' }
};

interface WordToken {
  word: string;
  start: number;
  end: number;
}

const LJ_WORDS: WordToken[] = [
  { word: 'as', start: 0.00, end: 0.17 },
  { word: 'more', start: 0.17, end: 0.40 },
  { word: 'humane', start: 0.40, end: 1.02 },
  { word: 'principles', start: 1.02, end: 1.70 },
  { word: 'were', start: 1.70, end: 1.82 },
  { word: 'introduced', start: 1.82, end: 2.60 },
  { word: 'into', start: 2.60, end: 2.83 },
  { word: 'prison', start: 2.83, end: 3.30 },
  { word: 'management', start: 3.30, end: 4.08 }
];

interface PhoneToken {
  p: string;
  ipa: string;
  start: number;
  end: number;
  word: string;
  manner: string;
}

const LJ_PHONES: PhoneToken[] = [
  { p: 'AE1', ipa: 'æ', start: 0.00, end: 0.09, word: 'as', manner: 'vowel' },
  { p: 'Z', ipa: 'z', start: 0.09, end: 0.17, word: 'as', manner: 'fricative' },
  { p: 'M', ipa: 'm', start: 0.17, end: 0.25, word: 'more', manner: 'nasal' },
  { p: 'AO1', ipa: 'ɔ', start: 0.25, end: 0.34, word: 'more', manner: 'vowel' },
  { p: 'R', ipa: 'ɹ', start: 0.34, end: 0.40, word: 'more', manner: 'approximant' },
  { p: 'HH', ipa: 'h', start: 0.40, end: 0.51, word: 'humane', manner: 'fricative' },
  { p: 'Y', ipa: 'j', start: 0.51, end: 0.56, word: 'humane', manner: 'approximant' },
  { p: 'UW0', ipa: 'u', start: 0.56, end: 0.60, word: 'humane', manner: 'vowel' },
  { p: 'M', ipa: 'm', start: 0.60, end: 0.72, word: 'humane', manner: 'nasal' },
  { p: 'EY1', ipa: 'eɪ', start: 0.72, end: 0.93, word: 'humane', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 0.93, end: 1.02, word: 'humane', manner: 'nasal' },
  { p: 'P', ipa: 'p', start: 1.02, end: 1.12, word: 'principles', manner: 'plosive' },
  { p: 'R', ipa: 'ɹ', start: 1.12, end: 1.16, word: 'principles', manner: 'approximant' },
  { p: 'IH1', ipa: 'ɪ', start: 1.16, end: 1.20, word: 'principles', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 1.20, end: 1.25, word: 'principles', manner: 'nasal' },
  { p: 'S', ipa: 's', start: 1.25, end: 1.33, word: 'principles', manner: 'fricative' },
  { p: 'AH0', ipa: 'ʌ', start: 1.33, end: 1.38, word: 'principles', manner: 'vowel' },
  { p: 'P', ipa: 'p', start: 1.38, end: 1.45, word: 'principles', manner: 'plosive' },
  { p: 'AH0', ipa: 'ʌ', start: 1.45, end: 1.49, word: 'principles', manner: 'vowel' },
  { p: 'L', ipa: 'l', start: 1.49, end: 1.60, word: 'principles', manner: 'approximant' },
  { p: 'Z', ipa: 'z', start: 1.60, end: 1.70, word: 'principles', manner: 'fricative' },
  { p: 'W', ipa: 'w', start: 1.70, end: 1.75, word: 'were', manner: 'approximant' },
  { p: 'ER0', ipa: 'ɝ', start: 1.75, end: 1.82, word: 'were', manner: 'vowel' },
  { p: 'IH2', ipa: 'ɪ', start: 1.82, end: 1.91, word: 'introduced', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 1.91, end: 1.95, word: 'introduced', manner: 'nasal' },
  { p: 'T', ipa: 't', start: 1.95, end: 2.06, word: 'introduced', manner: 'plosive' },
  { p: 'R', ipa: 'ɹ', start: 2.06, end: 2.09, word: 'introduced', manner: 'approximant' },
  { p: 'AH0', ipa: 'ʌ', start: 2.09, end: 2.13, word: 'introduced', manner: 'vowel' },
  { p: 'D', ipa: 'd', start: 2.13, end: 2.24, word: 'introduced', manner: 'plosive' },
  { p: 'UW1', ipa: 'u', start: 2.24, end: 2.43, word: 'introduced', manner: 'vowel' },
  { p: 'S', ipa: 's', start: 2.43, end: 2.54, word: 'introduced', manner: 'fricative' },
  { p: 'T', ipa: 't', start: 2.54, end: 2.60, word: 'introduced', manner: 'plosive' },
  { p: 'IH0', ipa: 'ɪ', start: 2.60, end: 2.67, word: 'into', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 2.67, end: 2.72, word: 'into', manner: 'nasal' },
  { p: 'T', ipa: 't', start: 2.72, end: 2.79, word: 'into', manner: 'plosive' },
  { p: 'AH0', ipa: 'ʌ', start: 2.79, end: 2.83, word: 'into', manner: 'vowel' },
  { p: 'P', ipa: 'p', start: 2.83, end: 2.94, word: 'prison', manner: 'plosive' },
  { p: 'R', ipa: 'ɹ', start: 2.94, end: 2.99, word: 'prison', manner: 'approximant' },
  { p: 'IH1', ipa: 'ɪ', start: 2.99, end: 3.04, word: 'prison', manner: 'vowel' },
  { p: 'Z', ipa: 'z', start: 3.04, end: 3.12, word: 'prison', manner: 'fricative' },
  { p: 'AH0', ipa: 'ʌ', start: 3.12, end: 3.17, word: 'prison', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 3.17, end: 3.30, word: 'prison', manner: 'nasal' },
  { p: 'M', ipa: 'm', start: 3.30, end: 3.34, word: 'management', manner: 'nasal' },
  { p: 'AE1', ipa: 'æ', start: 3.34, end: 3.45, word: 'management', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 3.45, end: 3.51, word: 'management', manner: 'nasal' },
  { p: 'IH0', ipa: 'ɪ', start: 3.51, end: 3.57, word: 'management', manner: 'vowel' },
  { p: 'JH', ipa: 'dʒ', start: 3.57, end: 3.72, word: 'management', manner: 'affricate' },
  { p: 'M', ipa: 'm', start: 3.72, end: 3.77, word: 'management', manner: 'nasal' },
  { p: 'AH0', ipa: 'ʌ', start: 3.77, end: 3.87, word: 'management', manner: 'vowel' },
  { p: 'N', ipa: 'n', start: 3.87, end: 3.92, word: 'management', manner: 'nasal' },
  { p: 'T', ipa: 't', start: 3.92, end: 4.08, word: 'management', manner: 'plosive' }
];

interface SpecStateDetail {
  f1: number;
  f2: number;
  f3: number;
  g1: number;
  g2: number;
  g3: number;
  desc: string;
}

interface SpecPhoneData {
  name: string;
  class: string;
  states: Record<number, SpecStateDetail>;
  zeros?: Array<{ freq: number; depth: number; bw: number; label: string }>;
}

const SPEC_DATA: Record<string, SpecPhoneData> = {
  ae: {
    name: '/æ/ "cat"', class: 'vowel',
    states: {
      1: { f1: 580, f2: 1550, f3: 2400, g1: 22, g2: 16, g3: 11, desc: 'Coarticulation onset: formants rising from stop occlusion' },
      2: { f1: 660, f2: 1720, f3: 2410, g1: 26, g2: 20, g3: 14, desc: 'Steady-state nucleus: wide pharynx creates high F1 resonant mountain' },
      3: { f1: 610, f2: 1640, f3: 2380, g1: 20, g2: 15, g3: 10, desc: 'Coda decay: tongue advancing toward alveolar closure' }
    },
    zeros: []
  },
  i: {
    name: '/i/ "see"', class: 'vowel',
    states: {
      1: { f1: 340, f2: 2100, f3: 2900, g1: 22, g2: 18, g3: 13, desc: 'Onset rise into close front posture' },
      2: { f1: 280, f2: 2250, f3: 3010, g1: 28, g2: 22, g3: 16, desc: 'High front nucleus: deep valley between F1 (280Hz) and F2 (2250Hz)' },
      3: { f1: 310, f2: 2150, f3: 2950, g1: 23, g2: 17, g3: 12, desc: 'Decay into coda glide' }
    },
    zeros: []
  },
  u: {
    name: '/u/ "boot"', class: 'vowel',
    states: {
      1: { f1: 360, f2: 950, f3: 2200, g1: 24, g2: 18, g3: 9, desc: 'Onset with lip rounding gesture' },
      2: { f1: 310, f2: 870, f3: 2240, g1: 28, g2: 21, g3: 11, desc: 'High back rounded nucleus: compact low-frequency double mountain' },
      3: { f1: 340, f2: 920, f3: 2210, g1: 23, g2: 17, g3: 8, desc: 'Decay away from labial constriction' }
    },
    zeros: []
  },
  m: {
    name: '/m/ "man" (Nasal)', class: 'nasal',
    states: {
      1: { f1: 280, f2: 1250, f3: 2100, g1: 22, g2: 9, g3: 6, desc: 'Bilabial closure onset: sound diverted into nasal cavity' },
      2: { f1: 250, f2: 1350, f3: 2200, g1: 26, g2: 11, g3: 7, desc: 'Nasal Murmur: oral cavity side-branch creates deep -32dB Antiformant Valley at 850Hz' },
      3: { f1: 300, f2: 1300, f3: 2150, g1: 20, g2: 8, g3: 5, desc: 'Velum lifting into oral vowel' }
    },
    zeros: [{ freq: 850, depth: -32, bw: 160, label: 'Nasal Zero (Antiformant Valley)' }]
  },
  s: {
    name: '/s/ "see" (Fricative)', class: 'fricative',
    states: {
      1: { f1: 400, f2: 1600, f3: 4800, g1: 5, g2: 6, g3: 18, desc: 'Turbulence development at teeth constriction' },
      2: { f1: 300, f2: 1500, f3: 5400, g1: -10, g2: -5, g3: 24, desc: 'Steady frication: low-energy valley <3.5kHz, sharp high-frequency turbulence mountain >4.5kHz' },
      3: { f1: 450, f2: 1700, f3: 5000, g1: 8, g2: 10, g3: 16, desc: 'Constriction release' }
    },
    zeros: [{ freq: 2000, depth: -35, bw: 1200, label: 'Laminar Anti-resonance Valley' }]
  },
  t: {
    name: '/t/ "cat" (Stop)', class: 'plosive',
    states: {
      1: { f1: 200, f2: 1400, f3: 2200, g1: -45, g2: -50, g3: -55, desc: 'State 1: Total Alveolar Occlusion Silence Valley (-70dB across spectrum)' },
      2: { f1: 500, f2: 1800, f3: 4000, g1: 15, g2: 18, g3: 24, desc: 'State 2: High-energy transient burst shockwave across full bandwidth' },
      3: { f1: 400, f2: 1600, f3: 3500, g1: 4, g2: 6, g3: 12, desc: 'State 3: Aspiration decay into voice onset time' }
    },
    zeros: []
  }
};

function formatTimeHHMMSSMS(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const rem1 = seconds % 3600;
  const mins = Math.floor(rem1 / 60);
  const secs = Math.floor(rem1 % 60);
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const pad3 = (n: number) => String(n).padStart(3, '0');
  return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}.${pad3(ms)}`;
}

export const WaveformAnalysisView: React.FC<WaveformAnalysisProps> = ({
  selectedUtteranceId,
  onSelectUtterance
}) => {
  // Dual-source model comparison state
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [modelA, setModelA] = useState<string>('gt');
  const [modelB, setModelB] = useState<string>('hifigan');
  const [activeChannel, setActiveChannel] = useState<'A' | 'B'>('A');

  // Currently audible model
  const activeModel = isComparisonMode ? (activeChannel === 'A' ? modelA : modelB) : modelA;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(4.1867);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Accordion section collapse state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    spssSecAudio: false,
    spssSecHmm: false,
    spssSecSpec: false,
    spssSecInsight: false
  });

  const toggleSection = (secId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Spectral Inspector states
  const [curSpecPhone, setCurSpecPhone] = useState<string>('ae');
  const [curSpecState, setCurSpecState] = useState<number>(2);
  const [specLayers, setSpecLayers] = useState<{ env: boolean; mel: boolean; voc: boolean }>({
    env: true,
    mel: true,
    voc: true
  });
  const [hoverCursor, setHoverCursor] = useState<{ freq: number; db: number } | null>(null);

  // Sync audio source when activeModel or playbackRate changes
  useEffect(() => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    const prevTime = audioRef.current.currentTime;
    audioRef.current.src = VOC_AUDIO_MAP[activeModel].path;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.currentTime = prevTime;
    if (wasPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [activeModel, playbackRate]);

  // Audio animation frame ticker
  const updateTicker = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateTicker);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateTicker);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => console.warn('Audio playback prevented:', e));
    }
  };

  const stopPlayback = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const seekRelative = (delta: number) => {
    if (!audioRef.current) return;
    const newT = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = newT;
    setCurrentTime(newT);
  };

  const seekTo = (t: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Instant A/B channel switching preserving exact timestamp
  const switchActiveChannel = (ch: 'A' | 'B') => {
    if (activeChannel === ch) return;
    setActiveChannel(ch);
  };

  const toggleActiveChannel = () => {
    switchActiveChannel(activeChannel === 'A' ? 'B' : 'A');
  };

  // Find active word and active phoneme from currentTime
  const activeWord = LJ_WORDS.find((w) => currentTime >= w.start && currentTime < w.end) || null;
  const activePhone = LJ_PHONES.find((p) => currentTime >= p.start && currentTime < p.end) || null;

  // Active word's constituent phonemes
  const activeWordPhones = activeWord
    ? LJ_PHONES.filter(
        (p) => p.word === activeWord.word && p.start >= activeWord.start - 0.01 && p.end <= activeWord.end + 0.01
      )
    : [];

  // Spectral math
  const pObj = SPEC_DATA[curSpecPhone] || SPEC_DATA.ae;
  const st = pObj.states[curSpecState] || pObj.states[2];

  const computeSpectralResponse = (f: number): number => {
    if (pObj.class === 'plosive' && curSpecState === 1) {
      return -65 - (f / 8000) * 10;
    }
    const r1 = st.g1 / (1 + Math.pow((f - st.f1) / 75, 2));
    const r2 = st.g2 / (1 + Math.pow((f - st.f2) / 95, 2));
    const r3 = st.g3 / (1 + Math.pow((f - st.f3) / 120, 2));
    const tilt = (f / 1000) * 2.8;
    let resp = -15 + r1 + r2 + r3 - tilt;

    if (pObj.zeros) {
      pObj.zeros.forEach((z) => {
        const dip = z.depth / (1 + Math.pow((f - z.freq) / (z.bw / 2), 2));
        resp += dip;
      });
    }
    return Math.max(-80, Math.min(20, resp));
  };

  // Canvas coordinates
  const width = 900;
  const height = 300;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const minF = 50;
  const maxF = 8000;
  const minDb = -80;
  const maxDb = 20;

  const fToX = (f: number) => padLeft + ((f - minF) / (maxF - minF)) * plotW;
  const dbToY = (db: number) => padTop + plotH - ((db - minDb) / (maxDb - minDb)) * plotH;

  // Generate curve points
  const numPts = 140;
  const curvePts: Array<{ x: number; y: number; f: number; db: number }> = [];
  const vocPtsA: Array<{ x: number; y: number }> = [];
  const vocPtsB: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= numPts; i++) {
    const f = minF + (i / numPts) * (maxF - minF);
    const db = computeSpectralResponse(f);
    curvePts.push({ x: fToX(f), y: dbToY(db), f, db });

    // Model A envelope variation
    const fuzzA = Math.sin(f * 0.04) * 1.2 - (f > 6000 ? 2.5 : 0);
    vocPtsA.push({ x: fToX(f), y: dbToY(Math.max(minDb, db + fuzzA)) });

    // Model B envelope variation
    const fuzzB = Math.cos(f * 0.035) * 1.6 - (f > 4800 ? 4.2 : 0);
    vocPtsB.push({ x: fToX(f), y: dbToY(Math.max(minDb, db + fuzzB)) });
  }

  const envPathD =
    curvePts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${fToX(maxF)} ${dbToY(minDb)} L ${fToX(minF)} ${dbToY(minDb)} Z`;

  const vocPathDA = vocPtsA.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const vocPathDB = vocPtsB.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div className="space-y-8 anim-fade-up">
      {/* Audio Element Hidden */}
      <audio
        ref={audioRef}
        src={VOC_AUDIO_MAP[activeModel].path}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Hero / Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-2xl p-2 rounded-xl bg-[#88DFF2]/15 text-[#14213D] dark:text-[#88DFF2]">🔬</span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
                Statistical Parametric Speech Synthesis & Waveform Analysis
              </h1>
            </div>
            <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] max-w-3xl leading-relaxed">
              Explore the 3-state HMM-GMM phoneme decomposition (<code className="font-mono text-xs text-[#88DFF2]">s₁, s₂, s₃</code>), resonant spectral <em>Mountains</em> (formant poles <code className="font-mono text-xs text-[#F294C8]">F₁, F₂, F₃</code>) vs. <em>Valleys</em> (nasal antiformants, stop closures, radiation roll-off), and high-precision neural vocoder audio playback across all 14 evaluated architectures.
            </p>
          </div>

          {selectedUtteranceId && selectedUtteranceId !== 'LJ016-0169' && (
            <div className="bg-[#88DFF2]/15 border border-[#88DFF2]/40 rounded-xl p-3 text-xs text-[#14213D] dark:text-[#88DFF2] max-w-sm">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Info className="w-4 h-4 text-[#88DFF2]" /> Selected: {selectedUtteranceId}
              </div>
              <span>The 14-vocoder deep multi-model synthesis inspection audio benchmark is demonstrated on canonical benchmark utterance <code>LJ016-0169</code>.</span>
            </div>
          )}
        </div>

        {/* Quick jump menu pills */}
        <div className="mt-6 pt-5 border-t border-[#D6EDF8]/60 dark:border-[#2A3F54]/60 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8] mr-2">
            Jump to Section:
          </span>
          <a
            href="#spssSecAudio"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] hover:bg-[#88DFF2]/20 border border-[#D6EDF8] dark:border-[#2A3F54] transition-colors"
          >
            §1 · 🎵 Audio Player & Comparison
          </a>
          <a
            href="#spssSecHmm"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] hover:bg-[#F294C8]/20 border border-[#D6EDF8] dark:border-[#2A3F54] transition-colors"
          >
            §2 · 🧬 3-State HMM-GMM
          </a>
          <a
            href="#spssSecSpec"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] hover:bg-[#64BF56]/20 border border-[#D6EDF8] dark:border-[#2A3F54] transition-colors"
          >
            §3 · ⛰️ Spectral Mountains vs. Valleys
          </a>
          <a
            href="#spssSecInsight"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-[#E6F0F8] hover:bg-[#F2C53D]/20 border border-[#D6EDF8] dark:border-[#2A3F54] transition-colors"
          >
            §4 · 💡 Classical SPSS vs. Neural Vocoders
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════ */}
      {/*   SECTION 1 · HIGH-PRECISION AUDIO PLAYER  */}
      {/* ══════════════════════════════════════════ */}
      <section id="spssSecAudio" className="rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs overflow-hidden">
        <div
          onClick={() => toggleSection('spssSecAudio')}
          className="p-5 flex items-center justify-between cursor-pointer bg-gradient-to-r from-sky-50/50 to-transparent dark:from-slate-800/40 hover:bg-sky-50 dark:hover:bg-slate-800/60 transition-colors border-b border-[#D6EDF8] dark:border-[#2A3F54]"
        >
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#88DFF2] text-[#14213D]">
              §1 AUDIO
            </span>
            <span className="font-bold text-base sm:text-lg text-[#14213D] dark:text-white">
              🎵 High-Precision Empirical Audio Player (Ground Truth vs. 14 Neural Vocoders)
            </span>
          </div>
          {collapsedSections.spssSecAudio ? (
            <ChevronDown className="w-5 h-5 text-[#5A7086]" />
          ) : (
            <ChevronUp className="w-5 h-5 text-[#5A7086]" />
          )}
        </div>

        {!collapsedSections.spssSecAudio && (
          <div className="p-6 sm:p-7 space-y-6">
            {/* Top row: Utterance info + LCD timer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54]">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg font-mono font-bold text-xs bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] border border-[#88DFF2]/40">
                  LJ016-0169
                </span>
                <div>
                  <div className="text-xs font-bold text-[#14213D] dark:text-[#E6F0F8] flex items-center gap-2 flex-wrap">
                    {isComparisonMode ? (
                      <>
                        <span>A/B Comparison Mode:</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${activeChannel === 'A' ? 'bg-[#88DFF2] text-[#14213D] font-black ring-1 ring-[#88DFF2]' : 'bg-[#88DFF2]/15 text-[#88DFF2]'}`}>
                          [A] {VOC_AUDIO_MAP[modelA].name}
                        </span>
                        <span className="text-[#5A7086]">vs</span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${activeChannel === 'B' ? 'bg-[#F294C8] text-[#14213D] font-black ring-1 ring-[#F294C8]' : 'bg-[#F294C8]/15 text-[#F294C8]'}`}>
                          [B] {VOC_AUDIO_MAP[modelB].name}
                        </span>
                        <span className="text-[10px] text-[#64BF56] font-bold">
                          (Currently Auditory: Source {activeChannel})
                        </span>
                      </>
                    ) : (
                      <>
                        <span>Controlled Studio Reference vs. 14 Neural Vocoders</span>
                        <span className="font-mono text-[#88DFF2] text-[11px]">({VOC_AUDIO_MAP[modelA].name})</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">
                    "as more humane principles were introduced into prison management."
                  </div>
                </div>
              </div>

              {/* LCD Display */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0C1322] border border-[#88DFF2]/40 shadow-inner">
                <span className="text-[10px] font-mono text-[#88DFF2] uppercase">hh:mm:ss.ms</span>
                <span className="font-mono text-base font-bold text-[#64BF56] tracking-wider">
                  {formatTimeHHMMSSMS(currentTime)}
                </span>
                <span className="font-mono text-xs text-[#5A7086]">/ {formatTimeHHMMSSMS(duration)}</span>
              </div>
            </div>

            {/* ── Dual-Vocoder Comparison Mode Checkbox Bar ── */}
            <div className="p-3.5 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isComparisonMode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsComparisonMode(checked);
                    if (!checked && activeChannel === 'B') {
                      setActiveChannel('A');
                    }
                  }}
                  className="w-4 h-4 rounded text-[#88DFF2] focus:ring-[#88DFF2] cursor-pointer accent-[#88DFF2]"
                />
                <div>
                  <div className="text-xs font-bold text-[#14213D] dark:text-[#E6F0F8] flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>Compare Two Neural Vocoders (Dual-Source A/B Listening)</span>
                  </div>
                  <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">
                    {isComparisonMode
                      ? 'Dual dropdowns active. Seamlessly toggle between Source A and Source B at any playback millisecond.'
                      : 'Check to open a second dropdown and compare two neural vocoders side-by-side.'}
                  </div>
                </div>
              </label>

              {isComparisonMode && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
                    Audible Source:
                  </span>
                  <div className="inline-flex rounded-lg border border-[#D6EDF8] dark:border-[#2A3F54] p-0.5 bg-white dark:bg-[#161B22]">
                    <button
                      type="button"
                      onClick={() => switchActiveChannel('A')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        activeChannel === 'A'
                          ? 'bg-[#88DFF2] text-[#14213D] shadow-xs'
                          : 'text-[#5A7086] hover:text-[#14213D] dark:hover:text-white'
                      }`}
                    >
                      🎧 Source A ({VOC_AUDIO_MAP[modelA].rank})
                    </button>
                    <button
                      type="button"
                      onClick={() => switchActiveChannel('B')}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        activeChannel === 'B'
                          ? 'bg-[#F294C8] text-[#14213D] shadow-xs'
                          : 'text-[#5A7086] hover:text-[#14213D] dark:hover:text-white'
                      }`}
                    >
                      🎧 Source B ({VOC_AUDIO_MAP[modelB].rank})
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={toggleActiveChannel}
                    title="Switch listening channel instantly (preserves audio timestamp)"
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#14213D] text-white dark:bg-white dark:text-[#14213D] hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    ⇄ Toggle A/B
                  </button>
                </div>
              )}
            </div>

            {/* Controls Deck: Transport + Model Picker(s) + Speed */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Transport Buttons */}
              <div className={isComparisonMode ? "md:col-span-3 flex items-center gap-1.5" : "md:col-span-4 flex items-center gap-2"}>
                <button
                  onClick={togglePlayback}
                  className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-[#F294C8] text-[#14213D] hover:bg-[#F294C8]/90'
                      : 'bg-[#88DFF2] text-[#14213D] hover:bg-[#88DFF2]/90'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                </button>

                <button
                  onClick={stopPlayback}
                  title="Stop"
                  className="p-2.5 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => seekRelative(-0.5)}
                  title="Rewind 0.5s"
                  className="px-2 py-2.5 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] text-xs font-mono font-semibold text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] active:scale-95 transition-all cursor-pointer"
                >
                  −0.5s
                </button>

                <button
                  onClick={() => seekRelative(0.5)}
                  title="Forward 0.5s"
                  className="px-2 py-2.5 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] text-xs font-mono font-semibold text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] active:scale-95 transition-all cursor-pointer"
                >
                  +0.5s
                </button>
              </div>

              {/* Model Picker(s) */}
              {isComparisonMode ? (
                <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Source A Dropdown */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#88DFF2] flex items-center gap-1.5">
                        <span>Source A (Primary):</span>
                        {activeChannel === 'A' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#88DFF2] text-[#14213D] font-mono font-bold animate-pulse">
                            AUDIBLE
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => switchActiveChannel('A')}
                        className={`text-[10px] font-mono underline cursor-pointer ${activeChannel === 'A' ? 'text-[#88DFF2] font-bold' : 'text-[#5A7086]'}`}
                      >
                        {activeChannel === 'A' ? 'Active' : 'Listen'}
                      </button>
                    </div>
                    <select
                      value={modelA}
                      onChange={(e) => setModelA(e.target.value)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-semibold text-[#14213D] dark:text-white cursor-pointer transition-all ${
                        activeChannel === 'A'
                          ? 'border-[#88DFF2] bg-[#88DFF2]/10 ring-2 ring-[#88DFF2]/40'
                          : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#161B22]'
                      }`}
                    >
                      {Object.entries(VOC_AUDIO_MAP).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.name} [{item.rank}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Source B Dropdown */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#F294C8] flex items-center gap-1.5">
                        <span>Source B (Comparison):</span>
                        {activeChannel === 'B' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#F294C8] text-[#14213D] font-mono font-bold animate-pulse">
                            AUDIBLE
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => switchActiveChannel('B')}
                        className={`text-[10px] font-mono underline cursor-pointer ${activeChannel === 'B' ? 'text-[#F294C8] font-bold' : 'text-[#5A7086]'}`}
                      >
                        {activeChannel === 'B' ? 'Active' : 'Listen'}
                      </button>
                    </div>
                    <select
                      value={modelB}
                      onChange={(e) => setModelB(e.target.value)}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-semibold text-[#14213D] dark:text-white cursor-pointer transition-all ${
                        activeChannel === 'B'
                          ? 'border-[#F294C8] bg-[#F294C8]/10 ring-2 ring-[#F294C8]/40'
                          : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#161B22]'
                      }`}
                    >
                      {Object.entries(VOC_AUDIO_MAP).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.name} [{item.rank}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-5 flex flex-col gap-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
                    Select Synthesizer / Ground Truth:
                  </label>
                  <select
                    value={modelA}
                    onChange={(e) => setModelA(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#FAFCFF] dark:bg-[#161B22] text-xs font-semibold text-[#14213D] dark:text-white cursor-pointer focus:ring-2 focus:ring-[#88DFF2]"
                  >
                    {Object.entries(VOC_AUDIO_MAP).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name} [{item.rank}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Playback Rate */}
              <div className={isComparisonMode ? "md:col-span-3 flex flex-col gap-1" : "md:col-span-3 flex flex-col gap-1"}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
                  Playback Speed:
                </label>
                <div className="flex items-center gap-1">
                  {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-[#88DFF2] text-[#14213D] shadow-xs'
                          : 'border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332]'
                      }`}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrubber slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 4.1867}
                step="0.001"
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-[#D6EDF8] dark:bg-[#2A3F54] appearance-none cursor-pointer accent-[#88DFF2]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#5A7086] px-1">
                <span>0.00s</span>
                <span>{currentTime.toFixed(2)}s</span>
                <span>{(duration || 4.1867).toFixed(2)}s</span>
              </div>
            </div>

            {/* Forced Alignment Acoustic Timeline (MFA TextGrid) */}
            <div className="p-5 rounded-xl bg-[#F0F8FF]/80 dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#64BF56] animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm text-[#14213D] dark:text-white">
                    Forced-Alignment Acoustic Timeline (MFA TextGrid)
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#5A7086] dark:text-[#7A9BB8]">
                  Click any word below or press Play to track live phonetic voicing
                </span>
              </div>

              {/* Word Cards Row */}
              <div className="flex flex-wrap gap-2">
                {LJ_WORDS.map((w, idx) => {
                  const isActive = currentTime >= w.start && currentTime < w.end;
                  return (
                    <button
                      key={idx}
                      onClick={() => seekTo(w.start)}
                      className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#88DFF2]/20 border-[#88DFF2] text-[#14213D] dark:text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-[#161B22] border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:border-[#88DFF2]'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{w.word}</div>
                      <div className="text-[10px] font-mono opacity-80">
                        {w.start.toFixed(2)}s – {w.end.toFixed(2)}s
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Acoustic Articulation Inspector Banner */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54]">
                {activeWord ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6EDF8]/60 dark:border-[#2A3F54]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5A7086]">
                          Currently Voiced:
                        </span>
                        <span className="text-base font-black text-[#14213D] dark:text-white">
                          "{activeWord.word}"
                        </span>
                        <span className="text-xs font-mono text-[#5A7086]">
                          ({activeWord.start.toFixed(2)}s – {activeWord.end.toFixed(2)}s)
                        </span>
                      </div>
                      <div>
                        {activePhone ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#64BF56]/20 text-[#2E7D32] dark:text-[#64BF56] border border-[#64BF56]/40">
                            Active Phone: {activePhone.p} [{activePhone.ipa}] ({activePhone.manner.toUpperCase()})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs text-[#5A7086]">Transition Gap</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] mb-2">
                        Constituent Phonemes Sequence:
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {activeWordPhones.map((p, idx) => {
                          const isNow =
                            activePhone &&
                            p.p === activePhone.p &&
                            Math.abs(p.start - activePhone.start) < 0.02;
                          return (
                            <React.Fragment key={idx}>
                              <button
                                onClick={() => seekTo(p.start)}
                                className={`px-2.5 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                  isNow
                                    ? 'bg-[#F294C8] text-[#14213D] border-[#F294C8] shadow-md scale-110 font-bold'
                                    : 'bg-[#F0F8FF] dark:bg-[#0D1117] border-[#D6EDF8] dark:border-[#2A3F54] text-[#14213D] dark:text-[#E6F0F8] hover:border-[#F294C8]'
                                }`}
                              >
                                <div className="text-xs font-mono font-bold">{p.p}</div>
                                <div className="text-[10px] font-mono">[{p.ipa}]</div>
                                <div className="text-[9px] uppercase tracking-wider opacity-75">{p.manner}</div>
                              </button>
                              {idx < activeWordPhones.length - 1 && (
                                <span className="text-[#5A7086] font-bold text-xs">➔</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : currentTime >= 4.08 ? (
                  <div className="text-center py-2 text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8]">
                    🏁 Utterance playback complete. Select another model or replay to evaluate acoustics.
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8]">
                    🎙️ Press <strong>Play Audio</strong> or click any word card above to trace forced alignment, phoneme transitions, and acoustic formants in real-time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════ */}
      {/*   SECTION 2 · HMM-GMM 3-STATE DIAGRAM     */}
      {/* ══════════════════════════════════════════ */}
      <section id="spssSecHmm" className="rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs overflow-hidden">
        <div
          onClick={() => toggleSection('spssSecHmm')}
          className="p-5 flex items-center justify-between cursor-pointer bg-gradient-to-r from-pink-50/50 to-transparent dark:from-slate-800/40 hover:bg-pink-50 dark:hover:bg-slate-800/60 transition-colors border-b border-[#D6EDF8] dark:border-[#2A3F54]"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#F294C8] text-[#14213D]">
              §2 HMM-GMM
            </span>
            <span className="font-bold text-base sm:text-lg text-[#14213D] dark:text-white">
              🧬 HMM-GMM 3-State Phoneme Sequence Model: Word "cat" /k æ t/ & [m]
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Illustrative teaching model
            </span>
          </div>
          {collapsedSections.spssSecHmm ? (
            <ChevronDown className="w-5 h-5 text-[#5A7086]" />
          ) : (
            <ChevronUp className="w-5 h-5 text-[#5A7086]" />
          )}
        </div>

        {!collapsedSections.spssSecHmm && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">Theoretical 3-State Phone Decomposition (Educational Model)</p>
              <p className="text-[11px] leading-relaxed">
                This interactive panel simulates a classical 3-state left-to-right hidden Markov model (HMM) decomposition (<code className="font-mono">s₁</code> onset, <code className="font-mono">s₂</code> steady nucleus, <code className="font-mono">s₃</code> coda decay) for pedagogical source-filter illustrations. It is strictly an <strong>illustrative teaching model</strong>. The benchmark's empirical phoneme boundaries are derived from Montreal Forced Aligner (MFA v3) and measured via log-spectral distance (LSD) across 120,000 synthesized waveforms.
              </p>
            </div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
              Left-to-right 3-state HMM: onset (<code className="font-mono">s₁</code>), steady nucleus (<code className="font-mono">s₂</code>), coda decay (<code className="font-mono">s₃</code>). Click any state badge to inspect its spectral energy response in Section 3 below.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 p-6 rounded-xl bg-[#F0F8FF]/80 dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54]">
              {/* Phone: /k/ */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  curSpecPhone === 't' ? 'border-[#88DFF2] bg-[#88DFF2]/10' : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22]'
                }`}
              >
                <div className="text-xs font-bold text-[#14213D] dark:text-white mb-2">
                  /k/ [k] <span className="text-[10px] text-[#5A7086] block">Velar Stop</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { st: 1, label: 'k₁', desc: 'Onset' },
                    { st: 2, label: 'k₂', desc: 'Burst' },
                    { st: 3, label: 'k₃', desc: 'VOT' }
                  ].map((s) => (
                    <button
                      key={s.st}
                      onClick={() => { setCurSpecPhone('t'); setCurSpecState(s.st); }}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                        curSpecPhone === 't' && curSpecState === s.st
                          ? 'bg-[#88DFF2] text-[#14213D]'
                          : 'bg-[#F0F8FF] dark:bg-[#1A2332] text-[#5A7086] hover:bg-[#88DFF2]/20'
                      }`}
                    >
                      {s.label}<br/><span className="text-[9px] font-normal">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-lg font-bold text-[#88DFF2]">➔</span>

              {/* Phone: /æ/ */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  curSpecPhone === 'ae' ? 'border-[#F294C8] bg-[#F294C8]/15 shadow-sm' : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22]'
                }`}
              >
                <div className="text-xs font-bold text-[#14213D] dark:text-white mb-2">
                  /æ/ [æ] <span className="text-[10px] text-[#5A7086] block">Open Vowel</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { st: 1, label: 'æ₁', desc: 'Rise' },
                    { st: 2, label: 'æ₂', desc: 'Nucleus' },
                    { st: 3, label: 'æ₃', desc: 'Decay' }
                  ].map((s) => (
                    <button
                      key={s.st}
                      onClick={() => { setCurSpecPhone('ae'); setCurSpecState(s.st); }}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                        curSpecPhone === 'ae' && curSpecState === s.st
                          ? 'bg-[#F294C8] text-[#14213D]'
                          : 'bg-[#F0F8FF] dark:bg-[#1A2332] text-[#5A7086] hover:bg-[#F294C8]/20'
                      }`}
                    >
                      {s.label}<br/><span className="text-[9px] font-normal">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-lg font-bold text-[#88DFF2]">➔</span>

              {/* Phone: /t/ */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  curSpecPhone === 't' ? 'border-[#64BF56] bg-[#64BF56]/10' : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22]'
                }`}
              >
                <div className="text-xs font-bold text-[#14213D] dark:text-white mb-2">
                  /t/ [t] <span className="text-[10px] text-[#5A7086] block">Alveolar Stop</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { st: 1, label: 't₁', desc: 'Closure' },
                    { st: 2, label: 't₂', desc: 'Burst' },
                    { st: 3, label: 't₃', desc: 'Release' }
                  ].map((s) => (
                    <button
                      key={s.st}
                      onClick={() => { setCurSpecPhone('t'); setCurSpecState(s.st); }}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                        curSpecPhone === 't' && curSpecState === s.st
                          ? 'bg-[#64BF56] text-[#14213D]'
                          : 'bg-[#F0F8FF] dark:bg-[#1A2332] text-[#5A7086] hover:bg-[#64BF56]/20'
                      }`}
                    >
                      {s.label}<br/><span className="text-[9px] font-normal">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-lg font-bold text-[#88DFF2]">➔</span>

              {/* Phone: /m/ */}
              <div
                className={`p-3 rounded-xl border text-center transition-all ${
                  curSpecPhone === 'm' ? 'border-[#F2C53D] bg-[#F2C53D]/15' : 'border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22]'
                }`}
              >
                <div className="text-xs font-bold text-[#14213D] dark:text-white mb-2">
                  /m/ [m] <span className="text-[10px] text-[#5A7086] block">Bilabial Nasal</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { st: 1, label: 'm₁', desc: 'Closure' },
                    { st: 2, label: 'm₂', desc: 'Murmur (-32dB)' },
                    { st: 3, label: 'm₃', desc: 'Release' }
                  ].map((s) => (
                    <button
                      key={s.st}
                      onClick={() => { setCurSpecPhone('m'); setCurSpecState(s.st); }}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                        curSpecPhone === 'm' && curSpecState === s.st
                          ? 'bg-[#F2C53D] text-[#14213D]'
                          : 'bg-[#F0F8FF] dark:bg-[#1A2332] text-[#5A7086] hover:bg-[#F2C53D]/20'
                      }`}
                    >
                      {s.label}<br/><span className="text-[9px] font-normal">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-lg font-bold text-[#88DFF2]">➔</span>

              {/* Silence */}
              <div className="p-3 rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-white dark:bg-[#161B22] text-center">
                <div className="text-xs font-bold text-[#14213D] dark:text-white mb-2">
                  [ sil ] <span className="text-[10px] text-[#5A7086] block">Silence Gap</span>
                </div>
                <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#5A7086]">
                  s₁₀<br/><span className="text-[9px] font-normal">Decay</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════ */}
      {/*   SECTION 3 · SPECTRAL CANVAS             */}
      {/* ══════════════════════════════════════════ */}
      <section id="spssSecSpec" className="rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs overflow-hidden">
        <div
          onClick={() => toggleSection('spssSecSpec')}
          className="p-5 flex items-center justify-between cursor-pointer bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-slate-800/40 hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors border-b border-[#D6EDF8] dark:border-[#2A3F54]"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#64BF56] text-[#14213D]">
              §3 SPECTRUM
            </span>
            <span className="font-bold text-base sm:text-lg text-[#14213D] dark:text-white">
              ⛰️ Spectral Energy Distribution: Formant "Mountains" vs. Antiresonance "Valleys"
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Illustrative teaching model
            </span>
          </div>
          {collapsedSections.spssSecSpec ? (
            <ChevronDown className="w-5 h-5 text-[#5A7086]" />
          ) : (
            <ChevronUp className="w-5 h-5 text-[#5A7086]" />
          )}
        </div>

        {!collapsedSections.spssSecSpec && (
          <div className="p-6 sm:p-7 space-y-5">
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">Theoretical HMM Acoustic Response (Educational Model)</p>
              <p className="text-[11px] leading-relaxed">
                This interactive panel simulates 3-state HMM vocal tract transfer functions H(z) for pedagogical visualization of pole-zero resonant shifts. It is strictly an <strong>illustrative teaching model</strong>. For empirical acoustic measurements (1024-point STFT, 256-point hop, Hann window, 24 kHz/22.05 kHz analysis band, calibrated dB), inspect the paired empirical waveform and spectrogram panels above and the publication figure atlas.
              </p>
            </div>
            <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
              Frequency response H(z) showing resonant formant poles (F₁, F₂, F₃) vs. anti-resonant zeros (nasal notches, closures). Hover over the plot to inspect frequency and decibel energy in real-time.
            </p>

            {/* Controls Row: Phoneme + State + Layers */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54]">
              {/* Phoneme selector pills */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7086]">Phoneme:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'ae', label: '/æ/ cat' },
                    { key: 'i', label: '/i/ see' },
                    { key: 'u', label: '/u/ boot' },
                    { key: 'm', label: '/m/ nasal' },
                    { key: 's', label: '/s/ fric.' },
                    { key: 't', label: '/t/ stop' }
                  ].map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setCurSpecPhone(p.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        curSpecPhone === p.key
                          ? 'bg-[#64BF56] text-[#14213D] shadow-xs font-bold'
                          : 'bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#64BF56]/15'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* HMM State pills */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7086]">HMM State:</span>
                <div className="flex gap-1">
                  {[
                    { st: 1, label: 's₁ Onset' },
                    { st: 2, label: 's₂ Nucleus' },
                    { st: 3, label: 's₃ Coda' }
                  ].map((s) => (
                    <button
                      key={s.st}
                      onClick={() => setCurSpecState(s.st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        curSpecState === s.st
                          ? 'bg-[#88DFF2] text-[#14213D] shadow-xs font-bold'
                          : 'bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:bg-[#88DFF2]/15'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layers Toggles */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7086]">Layers:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSpecLayers((prev) => ({ ...prev, env: !prev.env }))}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      specLayers.env
                        ? 'bg-[#64BF56]/20 border border-[#64BF56] text-[#14213D] dark:text-[#64BF56] font-bold'
                        : 'border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086]'
                    }`}
                  >
                    Formant Env
                  </button>
                  <button
                    onClick={() => setSpecLayers((prev) => ({ ...prev, mel: !prev.mel }))}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      specLayers.mel
                        ? 'bg-[#88DFF2]/20 border border-[#88DFF2] text-[#14213D] dark:text-[#88DFF2] font-bold'
                        : 'border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086]'
                    }`}
                  >
                    Mel-Bank
                  </button>
                  <button
                    onClick={() => setSpecLayers((prev) => ({ ...prev, voc: !prev.voc }))}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      specLayers.voc
                        ? 'bg-[#F294C8]/20 border border-[#F294C8] text-[#14213D] dark:text-[#F294C8] font-bold'
                        : 'border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086]'
                    }`}
                  >
                    Vocoder Envelope
                  </button>
                </div>
              </div>
            </div>

            {/* Readout bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#64BF56] animate-pulse" />
                <span className="font-bold text-[#14213D] dark:text-white">Phoneme: {pObj.name}</span>
                <span className="text-[#5A7086]">• State {curSpecState}: {st.desc}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                <span>Freq: <strong>{hoverCursor ? `${Math.round(hoverCursor.freq)} Hz` : 'N/A'}</strong></span>
                <span>Energy: <strong>{hoverCursor ? `${hoverCursor.db.toFixed(1)} dB` : 'N/A'}</strong></span>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <div
              className="relative rounded-xl border border-[#D6EDF8] dark:border-[#2A3F54] bg-[#0C1322] overflow-hidden"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const plotX = (mouseX / rect.width) * width;
                const clampedX = Math.max(padLeft, Math.min(width - padRight, plotX));
                const freq = minF + ((clampedX - padLeft) / plotW) * (maxF - minF);
                const db = computeSpectralResponse(freq);
                setHoverCursor({ freq, db });
              }}
              onMouseLeave={() => setHoverCursor(null)}
            >
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block select-none">
                {/* Grid Lines - Frequency */}
                {[500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000].map((f) => {
                  const x = fToX(f);
                  return (
                    <g key={f}>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#2A3F54"
                        strokeDasharray="3,3"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={padTop + plotH + 16}
                        fontSize="9.5"
                        fill="#7A9BB8"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {f >= 1000 ? `${f / 1000}k` : f}Hz
                      </text>
                    </g>
                  );
                })}

                {/* Grid Lines - dB */}
                {[-60, -40, -20, 0, 20].map((db) => {
                  const y = dbToY(db);
                  return (
                    <g key={db}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={padLeft + plotW}
                        y2={y}
                        stroke="#2A3F54"
                        strokeDasharray="3,3"
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        fontSize="9.5"
                        fill="#7A9BB8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {db}dB
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={padLeft + plotW / 2}
                  y={height - 6}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#7A9BB8"
                  textAnchor="middle"
                >
                  Acoustic Frequency (Hz)
                </text>
                <text
                  x="16"
                  y={padTop + plotH / 2}
                  fontSize="11"
                  fontWeight="bold"
                  fill="#7A9BB8"
                  textAnchor="middle"
                  transform={`rotate(-90 16 ${padTop + plotH / 2})`}
                >
                  Spectral Energy (dB)
                </text>

                {/* Mel filterbank triangles */}
                {specLayers.mel &&
                  Array.from({ length: 16 }).map((_, i) => {
                    const centerMel = 100 + i * 220;
                    const centerHz = 700 * (Math.exp(centerMel / 1127) - 1);
                    if (centerHz >= maxF) return null;
                    const leftHz = Math.max(50, centerHz * 0.7);
                    const rightHz = Math.min(maxF, centerHz * 1.4);
                    const xL = fToX(leftHz);
                    const xC = fToX(centerHz);
                    const xR = fToX(rightHz);
                    const yBase = dbToY(minDb);
                    const yPeak = dbToY(minDb + 18);
                    return (
                      <polygon
                        key={i}
                        points={`${xL},${yBase} ${xC},${yPeak} ${xR},${yBase}`}
                        fill="rgba(136, 223, 242, 0.08)"
                        stroke="rgba(136, 223, 242, 0.35)"
                        strokeWidth="1"
                      />
                    );
                  })}

                {/* Mountain Area Fill and Formant Envelope */}
                {specLayers.env && (
                  <>
                    <defs>
                      <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#64BF56" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#F294C8" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#88DFF2" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={envPathD} fill="url(#mountainGrad)" />
                    <path
                      d={curvePts
                        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
                        .join(' ')}
                      fill="none"
                      stroke="#64BF56"
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* Neural Vocoder Envelope Overlay(s) */}
                {specLayers.voc && (
                  <>
                    <path
                      d={vocPathDA}
                      fill="none"
                      stroke={isComparisonMode ? "#88DFF2" : "#F294C8"}
                      strokeWidth="2"
                      strokeDasharray="5,3"
                    />
                    {isComparisonMode && (
                      <path
                        d={vocPathDB}
                        fill="none"
                        stroke="#F294C8"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                      />
                    )}
                  </>
                )}

                {/* Formant Mountain Markers F1 and F2 */}
                {st.f1 && (pObj.class !== 'plosive' || curSpecState !== 1) && (
                  <g>
                    <circle cx={fToX(st.f1)} cy={dbToY(st.g1 - 5)} r="5" fill="#F65936" />
                    <text
                      x={fToX(st.f1)}
                      y={Math.max(padTop + 14, dbToY(st.g1 - 5) - 10)}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#F65936"
                      textAnchor="middle"
                    >
                      F₁ ({st.f1}Hz)
                    </text>
                  </g>
                )}

                {st.f2 && (pObj.class !== 'plosive' || curSpecState !== 1) && (
                  <g>
                    <circle cx={fToX(st.f2)} cy={dbToY(st.g2 - 8)} r="5" fill="#64BF56" />
                    <text
                      x={fToX(st.f2)}
                      y={Math.max(padTop + 14, dbToY(st.g2 - 8) - 10)}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#64BF56"
                      textAnchor="middle"
                    >
                      F₂ ({st.f2}Hz)
                    </text>
                  </g>
                )}

                {/* Nasal / Laminar Zeros (Valleys) */}
                {pObj.zeros &&
                  pObj.zeros.map((z, idx) => {
                    const xZ = fToX(z.freq);
                    const yDip = dbToY(Math.max(minDb, computeSpectralResponse(z.freq)));
                    return (
                      <g key={idx}>
                        <line
                          x1={xZ}
                          y1={padTop + 10}
                          x2={xZ}
                          y2={dbToY(minDb)}
                          stroke="#F65936"
                          strokeDasharray="4,2"
                          strokeWidth="2"
                        />
                        <circle cx={xZ} cy={yDip} r="5" fill="#F65936" />
                        <text
                          x={xZ}
                          y={padTop + 24}
                          fontSize="9.5"
                          fontWeight="bold"
                          fill="#F65936"
                          textAnchor="middle"
                        >
                          {z.label} ({z.depth}dB at {z.freq}Hz)
                        </text>
                      </g>
                    );
                  })}

                {/* Crosshair Cursor */}
                {hoverCursor && (
                  <g>
                    <line
                      x1={fToX(hoverCursor.freq)}
                      y1={padTop}
                      x2={fToX(hoverCursor.freq)}
                      y2={padTop + plotH}
                      stroke="#88DFF2"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={fToX(hoverCursor.freq)}
                      cy={dbToY(hoverCursor.db)}
                      r="6"
                      fill="#88DFF2"
                      stroke="#0C1322"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Legend Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F0F8FF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#64BF56]" />
                <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Spectral "Mountains" (Formants F₁ F₂ F₃)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#F65936]" />
                <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Spectral "Valleys" (Nasal Zeros & Closures)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-[#88DFF2]" />
                <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Mel Filterbank (80 Triangular Bands)</span>
              </div>
              {isComparisonMode ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#88DFF2]" />
                    <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Source A ({VOC_AUDIO_MAP[modelA].rank})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded bg-[#F294C8]" />
                    <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Source B ({VOC_AUDIO_MAP[modelB].rank})</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#F294C8]" />
                  <span className="font-semibold text-[#14213D] dark:text-[#E6F0F8]">Neural Vocoder Synthesis Envelope</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════ */}
      {/*   SECTION 4 · ACOUSTIC INSIGHT            */}
      {/* ══════════════════════════════════════════ */}
      <section id="spssSecInsight" className="rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-xs overflow-hidden">
        <div
          onClick={() => toggleSection('spssSecInsight')}
          className="p-5 flex items-center justify-between cursor-pointer bg-gradient-to-r from-amber-50/50 to-transparent dark:from-slate-800/40 hover:bg-amber-50 dark:hover:bg-slate-800/60 transition-colors border-b border-[#D6EDF8] dark:border-[#2A3F54]"
        >
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#F2C53D] text-[#14213D]">
              §4 INSIGHT
            </span>
            <span className="font-bold text-base sm:text-lg text-[#14213D] dark:text-white">
              💡 Acoustic Insight: Why Classical SPSS Sounds Muffled vs. Why Neural Vocoders Excel
            </span>
          </div>
          {collapsedSections.spssSecInsight ? (
            <ChevronDown className="w-5 h-5 text-[#5A7086]" />
          ) : (
            <ChevronUp className="w-5 h-5 text-[#5A7086]" />
          )}
        </div>

        {!collapsedSections.spssSecInsight && (
          <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-[#F65936]/10 border border-[#F65936]/30 space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-[#F65936] text-white">
                Classical SPSS
              </span>
              <p className="text-xs text-[#14213D] dark:text-[#E6F0F8] leading-relaxed">
                Maximizes P(<strong>y</strong> | <strong>s</strong>) via Maximum Likelihood Parameter Generation (MLPG), producing <em>over-smoothed</em> averaged trajectories that strip away natural glottal jitter, vocal shimmer, and high-frequency turbulence → the infamous <strong>"robotic / muffled"</strong> quality.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#64BF56]/10 border border-[#64BF56]/30 space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold font-mono bg-[#64BF56] text-white">
                Neural Vocoders
              </span>
              <p className="text-xs text-[#14213D] dark:text-[#E6F0F8] leading-relaxed">
                Models like <strong>PeriodWave</strong> and <strong>BigVGAN-v2</strong> use periodic inductive biases (Snake activations, continuous vector-field flow-matching) to synthesize realistic non-linear phase structures, turbulent friction above 4 kHz, and sharp plosive releases, without metallic buzzing.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
