import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TabType,
  ModelInfo,
  CorpusInfo,
  CorpusMetric,
  MacroMetric,
} from '../types';
import {
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Headphones,
  X,
  Layers,
  Cpu,
  Database,
  Activity,
} from 'lucide-react';

export type StageId = 'hero' | 'condition' | 'phoneclass' | 'results';
export type ConditionKey = 'studio' | 'diverse' | 'accent' | 'nonnative' | 'all';
export type PhoneClassKey = 'fricative' | 'plosive' | 'nasal' | 'approximant' | 'vowel' | 'affricate' | 'aspirate' | 'all';

interface Case2GuidedFlowProps {
  models: ModelInfo[];
  corpora: CorpusInfo[];
  corpusMetrics: CorpusMetric[];
  macroMetrics: Record<string, MacroMetric>;
  onNavigateToTab: (tab: TabType) => void;
  homeResetTrigger?: number;
}

interface ConditionOption {
  key: ConditionKey;
  corpusId: string;
  badge: string;
  title: string;
  subtitle: string;
  speakers: string;
  sampleRate: string;
  utterances: string;
  accent: string;
  color: string;
  colorClass: string;
  datasetName: string;
}

const CONDITIONS: ConditionOption[] = [
  {
    key: 'studio',
    corpusId: 'LJSpeech',
    badge: '🎙️ Studio',
    title: 'Controlled Studio',
    subtitle: 'Single female speaker in sound-damped booth. High signal-to-noise reference.',
    speakers: '1 Speaker (US Female)',
    sampleRate: '22.05 kHz',
    utterances: '2,000 evaluated utts',
    accent: 'Standard US English',
    color: '#88DFF2',
    colorClass: 'border-[#88DFF2] text-[#88DFF2]',
    datasetName: 'Controlled Studio',
  },
  {
    key: 'diverse',
    corpusId: 'LibriTTS',
    badge: '👥 Diverse Voices',
    title: 'Multi-Speaker Diverse',
    subtitle: '682 distinct male & female readers with varied prosody, acoustic timbre, and pacing.',
    speakers: '682 Speakers',
    sampleRate: '24.0 kHz',
    utterances: '2,000 evaluated utts',
    accent: 'General American',
    color: '#F294C8',
    colorClass: 'border-[#F294C8] text-[#F294C8]',
    datasetName: 'Multi-Speaker Diverse',
  },
  {
    key: 'accent',
    corpusId: 'VCTK',
    badge: '🌍 Regional Accents',
    title: 'Multi-Accent Regional',
    subtitle: '109 British, Scottish, and Irish regional native speakers with localized phonetics.',
    speakers: '109 Speakers',
    sampleRate: '24.0 kHz',
    utterances: '1,999 evaluated utts',
    accent: 'British & Scottish Dialects',
    color: '#64BF56',
    colorClass: 'border-[#64BF56] text-[#64BF56]',
    datasetName: 'Multi-Accent Regional',
  },
  {
    key: 'nonnative',
    corpusId: 'Free_ST',
    badge: '🈵 Non-Native (L2)',
    title: 'Non-Native / L2 Accented',
    subtitle: 'Mandarin-accented English with atypical vowel durations, pitch contours, and transitions.',
    speakers: '10 L2 Speakers',
    sampleRate: '16.0 kHz',
    utterances: '2,000 evaluated utts',
    accent: 'Mandarin L2 English',
    color: '#F2C53D',
    colorClass: 'border-[#F2C53D] text-[#F2C53D]',
    datasetName: 'Non-Native / L2 Accented',
  },
  {
    key: 'all',
    corpusId: 'pooled',
    badge: '🌐 Benchmark-Wide',
    title: 'All Conditions Pooled',
    subtitle: 'Comprehensive evaluation pooled across all 4 environments and 120,000 waveforms.',
    speakers: '802 Total Speakers',
    sampleRate: '16–24 kHz',
    utterances: '120,000 Waveforms',
    accent: 'Combined Multi-Dialect',
    color: '#8B5CF6',
    colorClass: 'border-[#8B5CF6] text-[#8B5CF6]',
    datasetName: 'All Voice Contexts',
  },
];

interface PhoneItem {
  symbol: string;
  ipa: string;
  name: string;
}

const CLASS_PHONES: Record<PhoneClassKey, PhoneItem[]> = {
  fricative: [
    { symbol: 'S', ipa: 's', name: '/s/ Voiceless alveolar' },
    { symbol: 'Z', ipa: 'z', name: '/z/ Voiced alveolar' },
    { symbol: 'F', ipa: 'f', name: '/f/ Voiceless labiodental' },
    { symbol: 'V', ipa: 'v', name: '/v/ Voiced labiodental' },
    { symbol: 'TH', ipa: 'θ', name: '/θ/ Voiceless dental' },
    { symbol: 'DH', ipa: 'ð', name: '/ð/ Voiced dental' },
    { symbol: 'SH', ipa: 'ʃ', name: '/ʃ/ Voiceless postalveolar' },
    { symbol: 'ZH', ipa: 'ʒ', name: '/ʒ/ Voiced postalveolar' },
  ],
  plosive: [
    { symbol: 'T', ipa: 't', name: '/t/ Voiceless alveolar' },
    { symbol: 'D', ipa: 'd', name: '/d/ Voiced alveolar' },
    { symbol: 'P', ipa: 'p', name: '/p/ Voiceless bilabial' },
    { symbol: 'B', ipa: 'b', name: '/b/ Voiced bilabial' },
    { symbol: 'K', ipa: 'k', name: '/k/ Voiceless velar' },
    { symbol: 'G', ipa: 'ɡ', name: '/ɡ/ Voiced velar' },
  ],
  nasal: [
    { symbol: 'N', ipa: 'n', name: '/n/ Alveolar nasal' },
    { symbol: 'M', ipa: 'm', name: '/m/ Bilabial nasal' },
    { symbol: 'NG', ipa: 'ŋ', name: '/ŋ/ Velar nasal' },
  ],
  approximant: [
    { symbol: 'R', ipa: 'ɹ', name: '/ɹ/ Postalveolar liquid' },
    { symbol: 'L', ipa: 'l', name: '/l/ Lateral liquid' },
    { symbol: 'W', ipa: 'w', name: '/w/ Labial-velar glide' },
    { symbol: 'Y', ipa: 'j', name: '/j/ Palatal glide' },
  ],
  vowel: [
    { symbol: 'AH', ipa: 'ə / ʌ', name: 'Schwa / Strut' },
    { symbol: 'IH', ipa: 'ɪ', name: 'Kit vowel' },
    { symbol: 'IY', ipa: 'iː', name: 'Fleece vowel' },
    { symbol: 'AE', ipa: 'æ', name: 'Trap vowel' },
    { symbol: 'EH', ipa: 'ɛ', name: 'Dress vowel' },
    { symbol: 'ER', ipa: 'ɚ', name: 'Nurse rhotic' },
    { symbol: 'AA', ipa: 'ɑː', name: 'Palm / Lot' },
    { symbol: 'EY', ipa: 'eɪ', name: 'Face diphthong' },
    { symbol: 'AY', ipa: 'aɪ', name: 'Price diphthong' },
    { symbol: 'OW', ipa: 'oʊ', name: 'Goat diphthong' },
    { symbol: 'UW', ipa: 'uː', name: 'Goose vowel' },
    { symbol: 'AO', ipa: 'ɔː', name: 'Thought vowel' },
    { symbol: 'AW', ipa: 'aʊ', name: 'Mouth diphthong' },
    { symbol: 'UH', ipa: 'ʊ', name: 'Foot vowel' },
    { symbol: 'OY', ipa: 'ɔɪ', name: 'Choice diphthong' },
  ],
  affricate: [
    { symbol: 'JH', ipa: 'dʒ', name: '/dʒ/ Voiced postalveolar affricate' },
    { symbol: 'CH', ipa: 'tʃ', name: '/tʃ/ Voiceless postalveolar affricate' },
  ],
  aspirate: [
    { symbol: 'HH', ipa: 'h', name: '/h/ Glottal aspirate (CMUdict)' },
  ],
  all: [],
};

interface PhoneClassOption {
  key: PhoneClassKey;
  name: string;
  symbols: string;
  difficulty: 'Hardest' | 'Hard' | 'Medium' | 'Easiest' | 'All';
  tokenCount: string;
  avgLsd: string;
  color: string;
  badgeStyle: string;
  description: string;
  failureMechanism: string;
}

const PHONE_CLASSES: PhoneClassOption[] = [
  {
    key: 'fricative',
    name: 'Fricatives',
    symbols: '/s/, /z/, /f/, /v/, /θ/, /ð/, /ʃ/, /ʒ/',
    difficulty: 'Hardest',
    tokenCount: '5,867 Tokens',
    avgLsd: '6.93 dB LSD',
    color: '#F65936',
    badgeStyle: 'bg-[#F65936]/15 text-[#F65936] border-[#F65936]/30',
    description: 'Continuous turbulent airflow through narrow oral constriction (8 base phones: F, V, TH, DH, S, Z, SH, ZH).',
    failureMechanism: 'Mel-spectrogram resolution smooths rapid unvoiced turbulent noise, inducing word-final coda fricative deletions.',
  },
  {
    key: 'plosive',
    name: 'Stops / Plosives',
    symbols: '/p/, /b/, /t/, /d/, /k/, /g/',
    difficulty: 'Medium',
    tokenCount: '7,032 Tokens',
    avgLsd: '6.77 dB LSD',
    color: '#64BF56',
    badgeStyle: 'bg-[#64BF56]/15 text-[#64BF56] border-[#64BF56]/30',
    description: 'Complete oral occlusion followed by sudden explosive burst release (6 base phones: P, B, T, D, K, G).',
    failureMechanism: 'Stop burst transients survive better than continuous fricatives, but voice-onset timing (VOT) can shift.',
  },
  {
    key: 'nasal',
    name: 'Nasals',
    symbols: '/m/, /n/, /ŋ/',
    difficulty: 'Hard',
    tokenCount: '3,987 Tokens',
    avgLsd: '7.05 dB LSD',
    color: '#F294C8',
    badgeStyle: 'bg-[#F294C8]/15 text-[#F294C8] border-[#F294C8]/30',
    description: 'Acoustic airflow directed through nasal cavity with oral obstruction (3 base phones: M, N, NG).',
    failureMechanism: 'Velopharyngeal anti-formants and nasal murmurs lose spectral contrast during neural phase estimation.',
  },
  {
    key: 'approximant',
    name: 'Approximants',
    symbols: '/l/, /r/, /w/, /j/',
    difficulty: 'Hard',
    tokenCount: '4,042 Tokens',
    avgLsd: '7.01 dB LSD',
    color: '#F2C53D',
    badgeStyle: 'bg-[#F2C53D]/15 text-[#F2C53D] border-[#F2C53D]/30',
    description: 'Smooth constriction without audible friction, including glides and liquids (4 base phones: L, R, W, Y).',
    failureMechanism: 'Gradual formant transitions suffer boundary smearing when reconstructed from compressed mel frames.',
  },
  {
    key: 'vowel',
    name: 'Vowels',
    symbols: '/i/, /u/, /æ/, /ɑ/, /oʊ/, /eɪ/...',
    difficulty: 'Easiest',
    tokenCount: '14,002 Tokens',
    avgLsd: '6.81 dB LSD',
    color: '#88DFF2',
    badgeStyle: 'bg-[#88DFF2]/15 text-[#88DFF2] border-[#88DFF2]/30',
    description: 'Open vocal tract periodic resonance with clear harmonic formants (15 base phones with 100% stress closure).',
    failureMechanism: 'High harmonic resonance energy makes vowels robust; neural vocoders rarely drop primary vowel nuclei.',
  },
  {
    key: 'affricate',
    name: 'Affricates',
    symbols: '/tʃ/, /dʒ/',
    difficulty: 'Medium',
    tokenCount: '340 Tokens',
    avgLsd: '6.86 dB LSD',
    color: '#A855F7',
    badgeStyle: 'bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/30',
    description: 'Complete closure followed immediately by turbulent frication release (2 base phones: CH, JH).',
    failureMechanism: 'Complex two-stage articulatory gestures are susceptible to closure-burst desynchronization.',
  },
  {
    key: 'aspirate',
    name: 'Aspirate',
    symbols: '/h/',
    difficulty: 'Medium',
    tokenCount: '657 Tokens',
    avgLsd: '6.90 dB LSD',
    color: '#14B8A6',
    badgeStyle: 'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30',
    description: 'Glottal friction without oral vocal tract constriction (1 base phone: HH under CMUdict convention).',
    failureMechanism: 'Low-energy breath noise is frequently attenuated by mel-scale spectral noise floors.',
  },
  {
    key: 'all',
    name: 'All Phone Classes',
    symbols: 'Full 39-Phoneme Inventory',
    difficulty: 'All',
    tokenCount: '35,927 Speech Tokens',
    avgLsd: '6.89 dB LSD',
    color: '#0284C7',
    badgeStyle: 'bg-[#0284C7]/15 text-[#0284C7] border-[#0284C7]/30',
    description: 'Composite phonemic analysis across all 39 standard ARPAbet speech phones.',
    failureMechanism: 'Evaluates global lexical preservation across the entire evaluation cohort.',
  },
];

const CONDITION_STIMULUS: Record<ConditionKey, { id: string; corpus: string; word: string; phonemes: string; text: string }> = {
  studio: {
    id: 'LJ016-0169',
    corpus: 'Controlled Studio',
    word: 'as',
    phonemes: '/æ z/',
    text: '...as more humane principles were introduced into prison management.',
  },
  diverse: {
    id: '7134_67200_000014_000001',
    corpus: 'Multi-Speaker Diverse',
    word: 'doll',
    phonemes: '/d ɑ l/',
    text: '...the doll was very pretty.',
  },
  accent: {
    id: 'p240_006',
    corpus: 'Multi-Accent Regional',
    word: 'when',
    phonemes: '/w ɛ n/',
    text: '...when the sunlight strikes raindrops in the air...',
  },
  nonnative: {
    id: 'f0003_us_f0003_00128',
    corpus: 'Non-Native / L2 Accented',
    word: 'real',
    phonemes: '/r i l/',
    text: '...a real danger that...',
  },
  all: {
    id: 'LJ016-0169',
    corpus: 'Benchmark Pooled',
    word: 'as',
    phonemes: '/æ z/',
    text: '...as more humane principles were introduced into prison management.',
  },
};

export const Case2GuidedFlow: React.FC<Case2GuidedFlowProps> = ({
  models,
  corpora,
  corpusMetrics,
  macroMetrics,
  onNavigateToTab,
  homeResetTrigger,
}) => {
  const [stage, setStage] = useState<StageId>('hero');
  const [selectedCondition, setSelectedCondition] = useState<ConditionKey>('studio');
  const [selectedPhoneClass, setSelectedPhoneClass] = useState<PhoneClassKey>('fricative');
  const [selectedPhone, setSelectedPhone] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<'per' | 'lsd'>('per');
  const [phoneComparisons, setPhoneComparisons] = useState<any>(null);

  const activeStimulus = useMemo(() => {
    return CONDITION_STIMULUS[selectedCondition] || CONDITION_STIMULUS.studio;
  }, [selectedCondition]);

  // Load phone comparisons matrix on mount
  useEffect(() => {
    fetch('./data/phone_dataset_comparisons.json')
      .then((r) => r.json())
      .then((data) => setPhoneComparisons(data))
      .catch((err) => console.warn('Could not load phone comparisons dataset:', err));
  }, []);

  // Reset individual phone selector to 'all' whenever phone class changes
  useEffect(() => {
    setSelectedPhone('all');
  }, [selectedPhoneClass]);

  // Reset to Home / Hero when logo is clicked
  useEffect(() => {
    if (homeResetTrigger && homeResetTrigger > 0) {
      setStage('hero');
      setIsPreviewModalOpen(false);
      if (audioGtRef.current) audioGtRef.current.pause();
      if (audioSynthRef.current) audioSynthRef.current.pause();
      setIsPlayingGt(false);
      setIsPlayingSynth(false);
    }
  }, [homeResetTrigger]);

  // Audio player state
  const [selectedModelKey, setSelectedModelKey] = useState<string>('flow2gan');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isPlayingGt, setIsPlayingGt] = useState<boolean>(false);
  const [isPlayingSynth, setIsPlayingSynth] = useState<boolean>(false);
  const [audioProgressGt, setAudioProgressGt] = useState<number>(0);
  const [audioProgressSynth, setAudioProgressSynth] = useState<number>(0);
  const [audioDurationGt, setAudioDurationGt] = useState<number>(0);
  const [audioDurationSynth, setAudioDurationSynth] = useState<number>(0);

  const audioGtRef = useRef<HTMLAudioElement | null>(null);
  const audioSynthRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount or model/condition change
  useEffect(() => {
    if (audioGtRef.current) {
      audioGtRef.current.pause();
      setIsPlayingGt(false);
      setAudioProgressGt(0);
    }
    if (audioSynthRef.current) {
      audioSynthRef.current.pause();
      setIsPlayingSynth(false);
      setAudioProgressSynth(0);
    }
  }, [selectedModelKey, selectedCondition]);

  // Find active condition object
  const currentCondition = useMemo(() => {
    return CONDITIONS.find((c) => c.key === selectedCondition) || CONDITIONS[0];
  }, [selectedCondition]);

  // Find active phone class object
  const currentPhoneClass = useMemo(() => {
    return PHONE_CLASSES.find((p) => p.key === selectedPhoneClass) || PHONE_CLASSES[0];
  }, [selectedPhoneClass]);

  // Compute leaderboard rows from real measured empirical data (no synthetic formulas)
  const leaderboard = useMemo(() => {
    const isAllConditions = selectedCondition === 'all';
    const corpKey = isAllConditions ? 'pooled' : currentCondition.corpusId;

    if (phoneComparisons && phoneComparisons[corpKey]?.[selectedPhoneClass]) {
      const classData = phoneComparisons[corpKey][selectedPhoneClass];
      let sysList: any[] = [];
      let minErr: number | null = null;

      if (selectedPhone !== 'all' && classData.phones?.[selectedPhone]) {
        const pObj = classData.phones[selectedPhone];
        sysList = pObj.systems || [];
        minErr = pObj.lowest_observed_error;
      } else {
        sysList = classData.class_summary?.systems || [];
        minErr = classData.class_summary?.lowest_observed_error;
      }

      // Filter neural models and sort by chosen metric
      const neuralItems = sysList.filter((s: any) => s.is_neural);
      neuralItems.sort((a: any, b: any) => {
        if (selectedMetric === 'lsd') {
          const aVal = a.acoustic_lsd != null ? a.acoustic_lsd : 999;
          const bVal = b.acoustic_lsd != null ? b.acoustic_lsd : 999;
          return aVal - bVal;
        } else {
          const aVal = a.proxy_error_rate != null ? a.proxy_error_rate : 999;
          const bVal = b.proxy_error_rate != null ? b.proxy_error_rate : 999;
          return aVal - bVal;
        }
      });

      return neuralItems.map((s: any) => {
        const mMeta = models.find((mod) => mod.id === s.system_id || mod.key === s.key);
        const macro = macroMetrics[s.key] || ({} as Partial<MacroMetric>);
        return {
          id: s.system_id,
          key: s.key,
          name: s.name,
          family: s.family || mMeta?.family || 'Neural',
          lsd: macro.lsd ?? null,
          phoneLsd: s.acoustic_lsd,
          proxyPer: s.proxy_error_rate,
          hits: s.hits,
          subs: s.subs,
          dels: s.dels,
          refTokens: s.ref_tokens,
          pesq: macro.pesq ?? null,
          stoi: macro.stoi ?? null,
          deltaWer: macro.delta_wer ?? null,
          wer: macro.wer ?? null,
          isLowest: minErr != null && s.proxy_error_rate === minErr,
          status: s.status,
        };
      });
    }

    // Direct empirical fallback from macroMetrics / corpusMetrics
    if (isAllConditions) {
      const items = Object.values(macroMetrics).filter((m) => m.model_id !== 'M0');
      return items
        .map((m) => {
          const modelMeta = models.find((mod) => mod.id === m.model_id);
          let classLsd: number | null = m.lsd;
          if (selectedPhoneClass === 'fricative') classLsd = m.fricatives_lsd ?? m.lsd;
          else if (selectedPhoneClass === 'plosive') classLsd = m.plosives_lsd ?? m.lsd;
          else if (selectedPhoneClass === 'vowel') classLsd = m.vowels_lsd ?? m.lsd;
          else if (selectedPhoneClass === 'nasal') classLsd = m.nasals_lsd ?? m.lsd;
          else if (selectedPhoneClass === 'approximant') classLsd = m.approximants_lsd ?? m.lsd;

          return {
            id: m.model_id,
            key: m.key,
            name: m.name,
            family: modelMeta?.family || 'Neural',
            lsd: m.lsd,
            phoneLsd: classLsd,
            proxyPer: null,
            hits: m.hits,
            subs: m.subs,
            dels: m.dels,
            refTokens: m.ref_words,
            pesq: m.pesq,
            stoi: m.stoi,
            deltaWer: m.delta_wer,
            wer: m.wer,
            isLowest: false,
            status: 'measured',
          };
        })
        .sort((a, b) => (a.phoneLsd ?? 999) - (b.phoneLsd ?? 999));
    } else {
      const subset = corpusMetrics.filter((cm) => cm.corpus === currentCondition.corpusId);
      return subset
        .map((cm) => {
          const modelMeta = models.find((m) => m.id === cm.model_id || m.key === cm.key);
          let classLsd: number | null = cm.lsd;
          if (selectedPhoneClass === 'fricative' && cm.fricatives_lsd != null) classLsd = cm.fricatives_lsd;
          else if (selectedPhoneClass === 'plosive' && cm.plosives_lsd != null) classLsd = cm.plosives_lsd;
          else if (selectedPhoneClass === 'vowel' && cm.vowels_lsd != null) classLsd = cm.vowels_lsd;
          else if (selectedPhoneClass === 'nasal' && cm.nasals_lsd != null) classLsd = cm.nasals_lsd;
          else if (selectedPhoneClass === 'approximant' && cm.approximants_lsd != null) classLsd = cm.approximants_lsd;

          return {
            id: cm.model_id,
            key: cm.key,
            name: cm.name,
            family: modelMeta?.family || 'Neural',
            lsd: cm.lsd,
            phoneLsd: classLsd,
            proxyPer: null,
            hits: null,
            subs: null,
            dels: null,
            refTokens: cm.N,
            pesq: cm.pesq,
            stoi: cm.stoi,
            deltaWer: cm.delta_wer,
            wer: cm.wer ?? (macroMetrics[cm.key]?.wer ?? null),
            isLowest: false,
            status: 'measured',
          };
        })
        .sort((a, b) => (a.phoneLsd ?? 999) - (b.phoneLsd ?? 999));
    }
  }, [
    phoneComparisons,
    selectedCondition,
    selectedPhoneClass,
    selectedPhone,
    selectedMetric,
    currentCondition,
    corpusMetrics,
    macroMetrics,
    models,
  ]);

  // Top model automatically selected for audio preview
  useEffect(() => {
    if (leaderboard.length > 0 && stage === 'results') {
      const topModel = leaderboard[0];
      if (topModel) {
        setSelectedModelKey(topModel.key);
      }
    }
  }, [leaderboard, stage]);

  const handleAudioToggleGt = () => {
    if (!audioGtRef.current) return;
    if (isPlayingGt) {
      audioGtRef.current.pause();
      setIsPlayingGt(false);
    } else {
      if (audioSynthRef.current) {
        audioSynthRef.current.pause();
        setIsPlayingSynth(false);
      }
      audioGtRef.current.play().then(() => setIsPlayingGt(true)).catch(() => {});
    }
  };

  const handleAudioToggleSynth = () => {
    if (!audioSynthRef.current) return;
    if (isPlayingSynth) {
      audioSynthRef.current.pause();
      setIsPlayingSynth(false);
    } else {
      if (audioGtRef.current) {
        audioGtRef.current.pause();
        setIsPlayingGt(false);
      }
      audioSynthRef.current.play().then(() => setIsPlayingSynth(true)).catch(() => {});
    }
  };

  // Breadcrumb step index
  const stageSteps: StageId[] = ['hero', 'condition', 'phoneclass', 'results'];
  const currentStepIdx = stageSteps.indexOf(stage);

  return (
    <div className="w-full">
      {/* Hidden Audio Elements for Ground Truth and Selected Vocoder */}
      <audio
        ref={audioGtRef}
        key={`gt_${activeStimulus.id}`}
        src={`./audio/${activeStimulus.id}_gt.wav`}
        preload="auto"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setAudioProgressGt(el.currentTime);
          setAudioDurationGt(el.duration || 0);
        }}
        onEnded={() => {
          setIsPlayingGt(false);
          setAudioProgressGt(0);
        }}
        onError={(e) => {
          console.warn('Ground truth audio error:', e);
          setIsPlayingGt(false);
        }}
      />
      <audio
        ref={audioSynthRef}
        key={`synth_${activeStimulus.id}_${selectedModelKey}`}
        src={`./audio/${activeStimulus.id}_${selectedModelKey}.wav`}
        preload="auto"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setAudioProgressSynth(el.currentTime);
          setAudioDurationSynth(el.duration || 0);
        }}
        onEnded={() => {
          setIsPlayingSynth(false);
          setAudioProgressSynth(0);
        }}
        onError={(e) => {
          console.warn('Synthesized audio error:', e);
          setIsPlayingSynth(false);
        }}
      />

      {/* 1. FIRST: Main Visual Masthead Banner - "Did The Word Survive?" Banner */}
      <div className="mb-6 relative overflow-hidden rounded-3xl bg-[#0C1322] shadow-2xl border border-white/15">
        <img
          src="./images/perceptual_completion_logo_banner.png"
          alt="Did the Word Survive? - Large-Scale Empirical Benchmark"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* 2. THEN: Top Breadcrumb Navigation */}
      <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setStage('hero')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              stage === 'hero'
                ? 'bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold shadow-sm'
                : 'text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            1. Overview
          </button>
          <span className="text-[#88DFF2] font-black tracking-tighter select-none">&gt;&gt;</span>

          <button
            onClick={() => setStage('condition')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              stage === 'condition'
                ? 'bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold shadow-sm'
                : 'text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            2. Recording Context
            {currentStepIdx >= 1 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#88DFF2]/30 text-[#14213D] dark:text-white">
                {currentCondition.badge.split(' ')[1]}
              </span>
            )}
          </button>
          <span className="text-[#88DFF2] font-black tracking-tighter select-none">&gt;&gt;</span>

          <button
            onClick={() => setStage('phoneclass')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              stage === 'phoneclass'
                ? 'bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2] font-bold shadow-sm'
                : 'text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            3. Sound Class
            {currentStepIdx >= 2 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F65936]/20 text-[#F65936]">
                {currentPhoneClass.name}
              </span>
            )}
          </button>
          <span className="text-[#88DFF2] font-black tracking-tighter select-none">&gt;&gt;</span>

          <button
            onClick={() => setStage('results')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              stage === 'results'
                ? 'bg-[#64BF56]/20 text-[#64BF56] font-bold shadow-sm'
                : 'text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            4. Leaderboard & Evidence
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5A7086] dark:text-[#7A9BB8] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">
            Stage {currentStepIdx + 1} of 4
          </span>
          {stage !== 'hero' && (
            <button
              onClick={() => {
                if (stage === 'results') setStage('phoneclass');
                else if (stage === 'phoneclass') setStage('condition');
                else if (stage === 'condition') setStage('hero');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#5A7086] dark:text-[#E6F0F8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 0: HERO SECTION - WEBSITE MAINPAGE, FIRST SCREEN                   */}
      {/* ========================================================================= */}
      {stage === 'hero' && (
        <div className="anim-fade-up space-y-6">
          {/* 3. THEN: Centered & Properly Aligned Core Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D1B2A] via-[#14213D] to-[#1E293B] text-white p-8 sm:p-12 shadow-xl border border-white/10">
            {/* Background Decorative Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#88DFF2]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F294C8]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-[#88DFF2]">
                <Sparkles className="w-3.5 h-3.5" />
                Benchmark Evaluation · 120,000 Waveforms Audited
              </div>

              <p className="text-base sm:text-xl text-[#D6EDF8] font-normal leading-relaxed max-w-3xl mx-auto">
                Modern neural vocoders achieve high synthetic quality metrics (UTMOS &gt; 4.0), yet frequently degrade delicate acoustic cues and erase critical phone boundaries.
              </p>

              {/* The 4 Core Pedagogical Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/[0.08] transition-colors">
                  <span className="text-[#88DFF2] text-sm shrink-0 mt-0.5">✦</span>
                  <p className="text-xs text-white/90 leading-relaxed">
                    <strong className="text-[#88DFF2]">Not all sounds survive equally:</strong> Vowels glide through intact, but delicate consonants collapse.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/[0.08] transition-colors">
                  <span className="text-[#F65936] text-sm shrink-0 mt-0.5">✦</span>
                  <p className="text-xs text-white/90 leading-relaxed">
                    <strong className="text-[#F65936]">Coda Fricatives are vulnerable:</strong> Word-final /s/, /v/, /f/, /z/ are 2.48× more likely to be lost.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/[0.08] transition-colors">
                  <span className="text-[#F2C53D] text-sm shrink-0 mt-0.5">✦</span>
                  <p className="text-xs text-white/90 leading-relaxed">
                    <strong className="text-[#F2C53D]">Context Compensation:</strong> Causal language models recover attenuated word tokens from linguistic priors.
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/[0.08] transition-colors">
                  <span className="text-[#64BF56] text-sm shrink-0 mt-0.5">✦</span>
                  <p className="text-xs text-white/90 leading-relaxed">
                    <strong className="text-[#64BF56]">Acoustic Disagreement:</strong> Non-autoregressive acoustic CTC decoding directly registers attenuated phonetic energy.
                  </p>
                </div>
              </div>

              {/* Centered Call-to-action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setStage('condition')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#88DFF2] to-[#F294C8] text-[#0D1B2A] hover:opacity-95 shadow-lg shadow-[#88DFF2]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
                >
                  Start: Choose Your Recording Setup
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateToTab('compare')}
                  className="px-5 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  Jump to Full Comparison Matrix →
                </button>
              </div>
            </div>
          </div>

          {/* 4. THEN: Consolidated 4 Stat Cards Right Below Hero Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cyan Card: 120,000 Waveforms Evaluated */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#88DFF2] dark:border-[#88DFF2]/80 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#88DFF2]/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#14213D] dark:text-[#88DFF2]">
                  Waveforms Evaluated
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#88DFF2]/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#14213D] dark:text-[#88DFF2]" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-[#14213D] dark:text-white">
                120,000
              </div>
              <div className="text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8] mt-1">
                Synthesized waveforms evaluated across all models & voice contexts
              </div>
              <div className="mt-3 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2]">
                15 configs × 8,000 utts
              </div>
            </div>

            {/* Pink Card: 14 Modern Vocoders */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#F294C8] dark:border-[#F294C8]/80 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F294C8]/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#14213D] dark:text-[#F294C8]">
                  Modern Vocoders
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F294C8]/20 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-[#F294C8]" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-[#14213D] dark:text-white">
                14 Models
              </div>
              <div className="text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8] mt-1">
                M1–M14 neural architectures + M0 ground truth baseline
              </div>
              <div className="mt-3 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#F294C8]/20 text-[#14213D] dark:text-[#F294C8]">
                GAN · Flow · Diffusion
              </div>
            </div>

            {/* Green Card: 4 Diverse Voice Contexts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#64BF56] dark:border-[#64BF56]/80 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#64BF56]/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#14213D] dark:text-[#64BF56]">
                  Diverse Voice Contexts
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#64BF56]/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-[#64BF56]" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-[#14213D] dark:text-white">
                4 Contexts
              </div>
              <div className="text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8] mt-1">
                Diverse acoustic conditions, accents, and recording environments
              </div>
              <div className="mt-3 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#64BF56]/20 text-[#14213D] dark:text-[#64BF56]">
                802 unique speakers
              </div>
            </div>

            {/* Yellow Card: Dual-ASR Consensus Protocol */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161B22] border-2 border-[#F2C53D] dark:border-[#F2C53D]/80 shadow-md relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2C53D]/10 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#14213D] dark:text-[#F2C53D]">
                  Consensus Protocol
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#F2C53D]/20 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#14213D] dark:text-[#F2C53D]" />
                </div>
              </div>
              <div className="text-3xl font-black font-mono text-[#14213D] dark:text-white">
                Dual-ASR
              </div>
              <div className="text-xs font-medium text-[#5A7086] dark:text-[#7A9BB8] mt-1">
                Whisper & Wav2Vec2 independent decoding with 8,000 utterances
              </div>
              <div className="mt-3 inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#F2C53D]/20 text-[#14213D] dark:text-[#F2C53D]">
                36,006 MFA phone intervals
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: RECORDING CONDITION SELECTOR                                    */}
      {/* ========================================================================= */}
      {stage === 'condition' && (
        <div className="anim-fade-up space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#88DFF2] uppercase tracking-widest">
              Step 1 of 3 · Context Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              What kind of voice recording are you working with?
            </h2>
            <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] max-w-2xl">
              Acoustic conditions drastically alter how neural vocoders compress and recover delicate phonemes. Select an environment to investigate:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CONDITIONS.map((cond) => {
              const isSelected = selectedCondition === cond.key;
              const isPooled = cond.key === 'all';

              // Distinct visual treatment for the Pooled Benchmark meta-option
              if (isPooled) {
                return (
                  <div
                    key={cond.key}
                    onClick={() => setSelectedCondition(cond.key)}
                    className={`cursor-pointer rounded-2xl p-6 sm:p-7 transition-all duration-200 border-2 relative flex flex-col justify-between md:col-span-2 lg:col-span-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-500/15 via-white to-indigo-500/15 dark:from-purple-950/60 dark:via-[#171524] dark:to-indigo-950/40 border-purple-500 dark:border-purple-400 shadow-xl shadow-purple-500/20 scale-[1.01]'
                        : 'bg-gradient-to-br from-purple-500/8 via-purple-50/40 to-indigo-500/10 dark:from-purple-950/30 dark:via-[#161B22] dark:to-indigo-950/25 border-purple-400/60 dark:border-purple-500/40 hover:border-purple-500 shadow-md shadow-purple-500/5'
                    }`}
                  >
                    {/* Top Ribbon Highlight */}
                    <div className="absolute -top-3 left-6 px-3.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-md flex items-center gap-1.5 ring-2 ring-white dark:ring-[#161B22]">
                      <span className="text-amber-300">★</span>
                      <span>Benchmark-Wide Meta-Analysis · All 4 Environments Combined</span>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1.5">
                            <span>🌐</span> Benchmark-Wide Pooled
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-500/30">
                            Mixed Meta Option
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30">
                          All 4 Voice Contexts Pooled
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-[#14213D] dark:text-white mb-1.5 flex items-center gap-2">
                          {cond.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-purple-950/80 dark:text-purple-200/90 leading-relaxed max-w-2xl font-medium">
                          {cond.subtitle}
                        </p>
                      </div>

                      {/* 4 Stat Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20">
                          <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Speaker Diversity</span>
                          <span className="text-xs sm:text-sm font-black text-[#14213D] dark:text-white">{cond.speakers}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20">
                          <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Acoustic Sampling</span>
                          <span className="text-xs sm:text-sm font-black text-[#14213D] dark:text-white">{cond.sampleRate}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20">
                          <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Phonetic Accent</span>
                          <span className="text-xs sm:text-sm font-black text-[#14213D] dark:text-white">{cond.accent}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/30 border border-purple-500/20">
                          <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Evaluated Scale</span>
                          <span className="text-xs sm:text-sm font-black text-purple-700 dark:text-purple-300">{cond.utterances}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-purple-900/90 dark:text-purple-300/90 font-medium">
                        <span className="text-amber-500 text-sm">💡</span>
                        <span>Aggregated multi-condition evaluation across all 14 neural vocoders</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCondition(cond.key);
                          setStage('phoneclass');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30 scale-[1.02]'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
                        }`}
                      >
                        {isSelected ? 'Continue with This Pooled Benchmark →' : 'Select Pooled Benchmark (100K+) →'}
                      </button>
                    </div>
                  </div>
                );
              }

              // Standard card for the 4 individual acoustic conditions
              return (
                <div
                  key={cond.key}
                  onClick={() => setSelectedCondition(cond.key)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-200 border-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#161B22] shadow-lg scale-[1.01]'
                      : 'bg-white/70 dark:bg-[#161B22]/70 hover:bg-white dark:hover:bg-[#161B22] border-transparent hover:border-[#D6EDF8] dark:hover:border-[#2A3F54]'
                  }`}
                  style={{
                    borderColor: isSelected ? cond.color : undefined,
                    boxShadow: isSelected ? `0 10px 25px -5px ${cond.color}25` : undefined,
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: `${cond.color}20`, color: cond.color }}
                      >
                        {cond.badge}
                      </span>
                      <span className="text-[11px] font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                        {cond.speakers}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#14213D] dark:text-white mb-1">
                        {cond.title}
                      </h3>
                      <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                        {cond.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5 text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                      <div className="flex justify-between">
                        <span>Speaker Diversity:</span>
                        <span className="font-semibold text-[#14213D] dark:text-white">{cond.speakers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acoustic Sampling:</span>
                        <span className="font-semibold text-[#14213D] dark:text-white">{cond.sampleRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phonetic Accent:</span>
                        <span className="font-semibold text-[#14213D] dark:text-white">{cond.accent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8]">
                      {cond.utterances}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCondition(cond.key);
                        setStage('phoneclass');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      style={{
                        backgroundColor: isSelected ? cond.color : 'rgba(0,0,0,0.05)',
                        color: isSelected ? '#14213D' : 'inherit',
                      }}
                    >
                      {isSelected ? 'Continue with This →' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#D6EDF8] dark:border-[#2A3F54]">
            <button
              onClick={() => setStage('hero')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Hero
            </button>

            <button
              onClick={() => setStage('phoneclass')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#88DFF2] text-[#14213D] hover:opacity-90 shadow-md transition-all"
            >
              Next: Select Sound Class ({currentCondition.title})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: PHONE CLASS SELECTOR (THE PEDAGOGICAL BRIDGE)                   */}
      {/* ========================================================================= */}
      {stage === 'phoneclass' && (
        <div className="anim-fade-up space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F65936] uppercase tracking-widest">
              Step 2 of 3 · Phonemic Vulnerability
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              Which sound class are you curious about?
            </h2>
            <p className="text-sm text-[#5A7086] dark:text-[#7A9BB8] max-w-2xl">
              Selected Recording Context:{' '}
              <span className="font-bold text-[#14213D] dark:text-white">
                {currentCondition.title}
              </span>
              . Each phoneme type presents unique acoustic hurdles for synthesis.
            </p>
          </div>

          {/* Educational Callout Box */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4 text-xs sm:text-sm leading-relaxed text-[#14213D] dark:text-[#E6F0F8]">
            <span className="text-xl">💡</span>
            <div>
              <strong className="font-bold text-amber-700 dark:text-amber-300 block mb-1">
                Why does phoneme class matter?
              </strong>
              Neural vocoders decode mel-spectrograms that compress high-frequency time resolution.
              While steady voiced vowels (/ae/, /iy/, /ow/) survive almost untouched (&lt;8% loss), rapid unvoiced coda
              transitions like fricatives (/s/, /v/, /f/, /z/) are smeared out, leading to entire missing words.
            </div>
          </div>

          {/* Phone Class Selection Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PHONE_CLASSES.map((phone) => {
              const isSelected = selectedPhoneClass === phone.key;
              return (
                <div
                  key={phone.key}
                  onClick={() => setSelectedPhoneClass(phone.key)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all duration-200 border-2 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-[#161B22] shadow-lg scale-[1.01]'
                      : 'bg-white/70 dark:bg-[#161B22]/70 hover:bg-white dark:hover:bg-[#161B22] border-transparent hover:border-[#D6EDF8] dark:hover:border-[#2A3F54]'
                  }`}
                  style={{
                    borderColor: isSelected ? phone.color : undefined,
                    boxShadow: isSelected ? `0 10px 25px -5px ${phone.color}25` : undefined,
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${phone.badgeStyle}`}>
                        {phone.difficulty}
                      </span>
                      <span className="text-xs font-mono font-semibold" style={{ color: phone.color }}>
                        {phone.tokenCount}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-[#14213D] dark:text-white flex items-center justify-between">
                        {phone.name}
                        <span className="text-xs font-mono font-normal text-[#5A7086] dark:text-[#7A9BB8]">
                          {phone.avgLsd}
                        </span>
                      </h3>
                      <p className="text-xs font-mono text-[#5A7086] dark:text-[#88DFF2] mt-0.5">
                        {phone.symbols}
                      </p>
                    </div>

                    <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8] leading-relaxed">
                      {phone.description}
                    </p>

                    <div className="pt-3 border-t border-black/5 dark:border-white/5">
                      <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] italic">
                        <strong className="not-italic text-[#14213D] dark:text-white">Vulnerability: </strong>
                        {phone.failureMechanism}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhoneClass(phone.key);
                        setStage('results');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isSelected ? phone.color : 'rgba(0,0,0,0.05)',
                        color: isSelected ? '#14213D' : 'inherit',
                      }}
                    >
                      {isSelected ? 'Reveal Leaderboard →' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#D6EDF8] dark:border-[#2A3F54]">
            <button
              onClick={() => setStage('condition')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Conditions
            </button>

            <button
              onClick={() => setStage('results')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#64BF56] text-white hover:opacity-90 shadow-md transition-all"
            >
              Next: See Which Vocoder Wins ({currentPhoneClass.name})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: RESULTS PANEL & SCIENTIFIC FINDINGS                             */}
      {/* ========================================================================= */}
      {stage === 'results' && (
        <div className="anim-fade-up space-y-8">
          {/* Header Summary Pill */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#64BF56] uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" /> Evidence Unlocked
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#14213D] dark:text-white">
                {currentCondition.title} › {currentPhoneClass.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A7086] dark:text-[#7A9BB8]">
                Voice Context: <strong>{currentCondition.title}</strong> · Target Phonemes:{' '}
                <span className="font-mono text-[#88DFF2]">{currentPhoneClass.symbols}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStage('condition')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#5A7086] dark:text-[#E6F0F8] transition-colors"
              >
                Change Condition
              </button>
              <button
                onClick={() => setStage('phoneclass')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#5A7086] dark:text-[#E6F0F8] transition-colors"
              >
                Change Phone Class
              </button>
            </div>
          </div>

          {/* Central Scientific Finding Card */}
          <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#F65936]/15 via-[#F2C53D]/10 to-[#88DFF2]/15 border border-[#F65936]/30 shadow-md">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#F65936] text-white shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F65936] text-white">
                    Key Empirical Research Finding
                  </span>
                  <span className="text-xs font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    Odds Ratio = 2.48 · p &lt; 0.001
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#14213D] dark:text-white">
                  Words ending in coda fricatives (/v/, /z/, /s/) are 2.48× more likely to be lost across all 14 vocoders.
                </h3>
                <p className="text-xs sm:text-sm text-[#5A7086] dark:text-[#A6C4DE] leading-relaxed">
                  Even top-tier models that achieve 4.4+ PESQ suffer from this systematic failure mode.
                  Furthermore, when one vocoder drops a fragile coda fricative, <strong>12 out of 14 other vocoders independently drop the same token</strong> (a 4.2× co-loss excess over independent chance).
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Leaderboard for Selected Condition & Phone Class */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#14213D] dark:text-white flex items-center gap-2">
                  <span className="text-[#88DFF2]">🏆</span> Vocoder Leaderboard: {currentPhoneClass.name} Survival
                </h3>
                <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                  Domain: <strong>{currentCondition.title}</strong> · Class: <strong>{currentPhoneClass.name}</strong> · Target: <strong>{selectedPhone === 'all' ? 'All in Class' : `${selectedPhone} (${CLASS_PHONES[selectedPhoneClass]?.find(p => p.symbol === selectedPhone)?.ipa || selectedPhone})`}</strong>
                </p>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D6EDF8] dark:border-[#2A3F54] text-xs">
                <button
                  onClick={() => setSelectedMetric('per')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedMetric === 'per'
                      ? 'bg-[#88DFF2] text-[#14213D] font-bold shadow-xs'
                      : 'text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#14213D] dark:hover:text-white'
                  }`}
                  title="Measured ASR-G2P Phone Proxy Error Rate (Substitutions + Deletions)"
                >
                  ASR-G2P PER (%)
                </button>
                <button
                  onClick={() => setSelectedMetric('lsd')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedMetric === 'lsd'
                      ? 'bg-[#F294C8] text-[#14213D] font-bold shadow-xs'
                      : 'text-[#5A7086] dark:text-[#7A9BB8] hover:text-[#14213D] dark:hover:text-white'
                  }`}
                  title="Measured Local Acoustic Log-Spectral Distance in dB"
                >
                  Acoustic LSD (dB)
                </button>
              </div>
            </div>

            {/* Individual Phone Selector Strip (Goal 4) */}
            {selectedPhoneClass !== 'all' && CLASS_PHONES[selectedPhoneClass]?.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#F0F8FF]/80 dark:bg-[#0D1117]/80 border border-[#D6EDF8] dark:border-[#2A3F54] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8]">
                    Filter by Individual Phone:
                  </span>
                  <span className="text-[10px] font-mono text-[#0284C7] dark:text-[#88DFF2]">
                    {selectedPhone === 'all' ? `All ${currentPhoneClass.name} Pooled` : `Selected: /${CLASS_PHONES[selectedPhoneClass].find(p => p.symbol === selectedPhone)?.ipa || selectedPhone}/`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPhone('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedPhone === 'all'
                        ? 'bg-[#14213D] dark:bg-white text-white dark:text-[#14213D] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] hover:border-[#88DFF2]'
                    }`}
                  >
                    All {currentPhoneClass.name}
                  </button>
                  {CLASS_PHONES[selectedPhoneClass].map((p) => {
                    const isSel = selectedPhone === p.symbol;
                    return (
                      <button
                        key={p.symbol}
                        onClick={() => setSelectedPhone(p.symbol)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isSel
                            ? 'bg-[#88DFF2] text-[#14213D] shadow-xs ring-2 ring-[#88DFF2]/40'
                            : 'bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] hover:border-[#88DFF2]'
                        }`}
                        title={p.name}
                      >
                        <span>{p.symbol}</span>
                        <span className="text-[10px] font-normal opacity-75">/{p.ipa}/</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#D6EDF8] dark:border-[#2A3F54] text-[#5A7086] dark:text-[#7A9BB8] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Vocoder Model</th>
                    <th className="py-3 px-3">Architecture</th>
                    <th className="py-3 px-3 text-right">
                      {selectedMetric === 'per' ? 'ASR-G2P PER (%)' : 'Acoustic LSD (dB)'}
                    </th>
                    <th className="py-3 px-3 text-right">Coverage (N tokens)</th>
                    <th className="py-3 px-3 text-right">Edit Trace (H / S / D)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Preview Audio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {leaderboard.map((row, idx) => {
                    const isTop1 = idx === 0;
                    const isTop2 = idx === 1;
                    const isTop3 = idx === 2;
                    const isSelected = selectedModelKey === row.key;

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-[#F0F8FF] dark:hover:bg-[#1A2332] transition-colors ${
                          isSelected ? 'bg-[#88DFF2]/10 dark:bg-[#88DFF2]/15 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-xs">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-[#5A7086] dark:text-[#7A9BB8] pl-2">{idx + 1}</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#14213D] dark:text-white">{row.name}</span>
                            {row.isLowest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#64BF56] text-white">
                                Lowest Error
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[#5A7086] dark:text-[#7A9BB8] font-mono text-[11px]">
                          {row.family}
                        </td>

                        <td className="py-3 px-3 text-right font-mono font-bold text-[#14213D] dark:text-white">
                          {selectedMetric === 'per'
                            ? (row.proxyPer != null ? `${row.proxyPer.toFixed(2)}%` : 'N/A')
                            : (row.phoneLsd != null ? `${row.phoneLsd.toFixed(2)} dB` : 'N/A')}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                          {row.refTokens != null ? row.refTokens.toLocaleString() : 'N/A'}
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                          {row.hits != null ? `${row.hits} / ${row.subs} / ${row.dels}` : 'N/A'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {row.isLowest ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#64BF56]/15 text-[#64BF56] border border-[#64BF56]/30">
                              Lowest Observed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#5A7086] dark:text-[#7A9BB8] bg-black/5 dark:bg-white/5">
                              Measured
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedModelKey(row.key);
                              setIsPreviewModalOpen(true);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm ${
                              isSelected
                                ? 'bg-[#88DFF2] text-[#14213D] ring-2 ring-[#88DFF2]/50 hover:opacity-95'
                                : 'bg-black/5 dark:bg-white/5 hover:bg-[#88DFF2] text-[#14213D] dark:text-white hover:text-[#14213D]'
                            }`}
                            title={`Preview audio comparison for ${row.name}`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Preview</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Methodological Disclosure Boundary & Non-collected Endpoints (Goal 8) */}
            <div className="p-4 rounded-2xl bg-[#F0F8FF] dark:bg-[#1A2332] border border-[#D6EDF8] dark:border-[#2A3F54] text-[11px] text-[#5A7086] dark:text-[#7A9BB8] space-y-1.5">
              <div className="font-bold text-[#14213D] dark:text-white flex items-center gap-1.5">
                <span>📋 Evaluation Disclosure & Measurement Origins:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>ASR-G2P Proxy PER:</strong> Pronunciation sequences derived from independent non-autoregressive CTC decoding (Wav2Vec2) and G2P mapping against reference dictionary sequences.</li>
                <li><strong>Acoustic LSD:</strong> Physical log-spectral distance computed across uncompressed 120,000 synthesized waveforms on common matched intervals.</li>
                <li><strong>Audio-Validated Phone Transcriptions:</strong> Narrow phonetic annotations by human phonetician panels were not collected for this cohort and remain an honest empty state.</li>
              </ul>
            </div>
          </div>

          {/* Interactive Audio Contrast Station */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161B22] border border-[#D6EDF8] dark:border-[#2A3F54] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#14213D] dark:text-white flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-[#88DFF2]" />
                  Acoustic Audio Contrast Station (Utterance LJ016-0169)
                </h3>
                <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                  Compare the uncompressed Ground Truth recording directly against synthesized neural waveforms.
                </p>
              </div>

              {/* Vocoder selector dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8]">Testing Model:</span>
                <select
                  value={selectedModelKey}
                  onChange={(e) => setSelectedModelKey(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F0F8FF] dark:bg-[#1A2332] text-[#14213D] dark:text-white border border-[#D6EDF8] dark:border-[#2A3F54] focus:outline-none"
                >
                  {models
                    .filter((m) => m.id !== 'M0')
                    .map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.name} ({m.family})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Audio Track Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ground Truth Track */}
              <div className="p-5 rounded-2xl bg-[#64BF56]/10 border border-[#64BF56]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#64BF56] text-white">
                    Ground Truth (M0)
                  </span>
                  <span className="text-xs font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {audioProgressGt.toFixed(1)}s / {audioDurationGt ? audioDurationGt.toFixed(1) : '4.2'}s
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAudioToggleGt}
                    className="w-12 h-12 rounded-2xl bg-[#64BF56] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    {isPlayingGt ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-[#14213D] dark:text-white">Natural Speech Recording</p>
                    {/* Simulated Waveform bar */}
                    <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#64BF56] h-full transition-all duration-100"
                        style={{
                          width: `${audioDurationGt ? (audioProgressGt / audioDurationGt) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] pt-2 border-t border-black/5 dark:border-white/5">
                  Reference text: <span className="font-semibold text-[#14213D] dark:text-white">"as more humane principles were introduced into prison management."</span>
                </div>
              </div>

              {/* Synthesized Track */}
              <div className="p-5 rounded-2xl bg-[#88DFF2]/10 border border-[#88DFF2]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#88DFF2] text-[#14213D]">
                    Synthesized: {models.find((m) => m.key === selectedModelKey)?.short_name || selectedModelKey}
                  </span>
                  <span className="text-xs font-mono text-[#5A7086] dark:text-[#7A9BB8]">
                    {audioProgressSynth.toFixed(1)}s / {audioDurationSynth ? audioDurationSynth.toFixed(1) : '4.2'}s
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleAudioToggleSynth}
                    className="w-12 h-12 rounded-2xl bg-[#88DFF2] text-[#14213D] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md font-bold"
                  >
                    {isPlayingSynth ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-bold text-[#14213D] dark:text-white">Neural Reconstruction</p>
                    {/* Simulated Waveform bar */}
                    <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#88DFF2] h-full transition-all duration-100"
                        style={{
                          width: `${audioDurationSynth ? (audioProgressSynth / audioDurationSynth) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] pt-2 border-t border-black/5 dark:border-white/5">
                  Listen closely to the first word <strong className="text-[#F65936]">"as"</strong> (/æ z/). Notice the coda /z/ attenuation!
                </div>
              </div>
            </div>

            {/* Token Diff Inspection */}
            <div className="p-5 rounded-2xl bg-[#FAFCFF] dark:bg-[#1A2332] border border-[#D6EDF8] dark:border-[#2A3F54] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F2C53D]" /> Dual-ASR Transcript Decoding Analysis
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#161B22] border border-black/5 dark:border-white/5 space-y-1">
                  <span className="font-bold text-[#88DFF2] block">Whisper-Tiny (Autoregressive LM):</span>
                  <p className="font-mono text-[11px] text-[#14213D] dark:text-[#E6F0F8]">
                    " <span className="bg-[#64BF56]/20 px-1 py-0.5 rounded text-[#64BF56] font-bold">as</span> more humane principles were introduced into prison management."
                  </p>
                  <p className="text-[10px] text-[#5A7086] dark:text-[#7A9BB8] pt-1">
                    ✅ <strong>Context Compensation [D = 0]:</strong> Whisper's causal LM prior recovers the target lexical token from linguistic context despite acoustic coda attenuation.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#161B22] border border-black/5 dark:border-white/5 space-y-1">
                  <span className="font-bold text-[#F65936] block">Wav2Vec2-Base (Acoustic CTC):</span>
                  <p className="font-mono text-[11px] text-[#14213D] dark:text-[#E6F0F8]">
                    "<span className="bg-[#F65936]/20 px-1 py-0.5 rounded text-[#F65936] font-bold">[DELETED] S</span> MORE HUMANE PRINCIPLES WERE INTRODUCED..."
                  </p>
                  <p className="text-[10px] text-[#5A7086] dark:text-[#7A9BB8] pt-1">
                    ❌ <strong>Acoustic Disagreement [D &gt; 0]:</strong> Non-autoregressive acoustic CTC decoding registers token loss due to attenuated coda /z/ energy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#D6EDF8] dark:border-[#2A3F54]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStage('phoneclass')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Phone Class
              </button>
              <button
                onClick={() => setStage('hero')}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#5A7086] dark:text-[#7A9BB8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Journey
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigateToTab('compare')}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#88DFF2] text-[#14213D] hover:opacity-90 shadow-md transition-all flex items-center gap-2"
              >
                Explore Full 14-Vocoder Matrix
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateToTab('phonetics')}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-black/5 dark:bg-white/5 text-[#5A7086] dark:text-[#E6F0F8] hover:bg-black/10 transition-all"
              >
                Phonetics Lab →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIO PREVIEW MODAL POPUP                                                 */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div
          onClick={() => {
            setIsPreviewModalOpen(false);
            if (audioGtRef.current) audioGtRef.current.pause();
            if (audioSynthRef.current) audioSynthRef.current.pause();
            setIsPlayingGt(false);
            setIsPlayingSynth(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 anim-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#161B22] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#D6EDF8] dark:border-[#2A3F54] anim-scale-in"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D6EDF8] dark:border-[#2A3F54] flex items-center justify-between bg-[#FAFCFF] dark:bg-[#0D1117]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#88DFF2]/20 flex items-center justify-center text-[#14213D] dark:text-[#88DFF2]">
                  <Headphones className="w-5 h-5 text-[#88DFF2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-[#14213D] dark:text-white">
                      Audio Pairwise Preview: {models.find((m) => m.key === selectedModelKey)?.name || selectedModelKey}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#88DFF2]/20 text-[#14213D] dark:text-[#88DFF2]">
                      {models.find((m) => m.key === selectedModelKey)?.family}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                    Utterance <span className="font-mono font-bold">{activeStimulus.id}</span> ({activeStimulus.corpus}) · Target Word: <strong className="text-[#F65936]">"{activeStimulus.word}"</strong> ({activeStimulus.phonemes})
                  </p>
                  <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] italic mt-0.5 truncate max-w-lg">
                    "{activeStimulus.text}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  if (audioGtRef.current) audioGtRef.current.pause();
                  if (audioSynthRef.current) audioSynthRef.current.pause();
                  setIsPlayingGt(false);
                  setIsPlayingSynth(false);
                }}
                className="p-2 rounded-xl text-[#5A7086] hover:text-[#14213D] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Quick Model Selector Strip */}
              <div>
                <label className="text-[11px] font-bold text-[#5A7086] dark:text-[#7A9BB8] uppercase tracking-wider block mb-2">
                  Select Vocoder to Preview:
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-2">
                  {models
                    .filter((m) => m.id !== 'M0')
                    .map((m) => {
                      const isSelected = selectedModelKey === m.key;
                      return (
                        <button
                          key={m.key}
                          onClick={() => {
                            setSelectedModelKey(m.key);
                            if (audioSynthRef.current) {
                              audioSynthRef.current.pause();
                              setIsPlayingSynth(false);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            isSelected
                              ? 'bg-[#88DFF2] text-[#14213D] font-bold shadow-sm'
                              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 text-[#5A7086] dark:text-[#7A9BB8]'
                          }`}
                        >
                          {m.short_name}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Side-by-Side Audio Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Track 1: Ground Truth */}
                <div className="p-5 rounded-2xl bg-[#64BF56]/10 border border-[#64BF56]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#64BF56] text-white">
                      Natural Speech (Ground Truth M0)
                    </span>
                    <span className="text-xs font-mono font-bold text-[#64BF56]">
                      {audioProgressGt.toFixed(1)}s / {audioDurationGt ? audioDurationGt.toFixed(1) : '4.2'}s
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAudioToggleGt}
                      className="w-14 h-14 rounded-2xl bg-[#64BF56] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 font-bold"
                    >
                      {isPlayingGt ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-[#14213D] dark:text-white">
                        <span>Natural Recording (22.05 kHz)</span>
                        {isPlayingGt && <span className="text-[10px] text-[#64BF56] font-semibold animate-pulse">Playing</span>}
                      </div>
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const frac = (e.clientX - rect.left) / rect.width;
                          if (audioGtRef.current && audioDurationGt) {
                            audioGtRef.current.currentTime = frac * audioDurationGt;
                            setAudioProgressGt(frac * audioDurationGt);
                          }
                        }}
                        className="w-full bg-black/10 dark:bg-white/10 h-3 rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="bg-[#64BF56] h-full transition-all duration-75"
                          style={{
                            width: `${audioDurationGt ? (audioProgressGt / audioDurationGt) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] pt-2 border-t border-black/5 dark:border-white/5">
                    Reference text: <strong className="text-[#14213D] dark:text-white">"as more humane principles were introduced into prison management."</strong>
                  </div>
                </div>

                {/* Track 2: Neural Vocoder */}
                <div className="p-5 rounded-2xl bg-[#88DFF2]/10 border border-[#88DFF2]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#88DFF2] text-[#14213D]">
                      Synthesized: {models.find((m) => m.key === selectedModelKey)?.short_name || selectedModelKey}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#88DFF2]">
                      {audioProgressSynth.toFixed(1)}s / {audioDurationSynth ? audioDurationSynth.toFixed(1) : '4.2'}s
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAudioToggleSynth}
                      className="w-14 h-14 rounded-2xl bg-[#88DFF2] text-[#14213D] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 font-bold"
                    >
                      {isPlayingSynth ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-[#14213D] dark:text-white">
                        <span>Neural Waveform</span>
                        {isPlayingSynth && <span className="text-[10px] text-[#88DFF2] font-semibold animate-pulse">Playing</span>}
                      </div>
                      <div
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const frac = (e.clientX - rect.left) / rect.width;
                          if (audioSynthRef.current && audioDurationSynth) {
                            audioSynthRef.current.currentTime = frac * audioDurationSynth;
                            setAudioProgressSynth(frac * audioDurationSynth);
                          }
                        }}
                        className="w-full bg-black/10 dark:bg-white/10 h-3 rounded-full overflow-hidden cursor-pointer relative"
                      >
                        <div
                          className="bg-[#88DFF2] h-full transition-all duration-75"
                          style={{
                            width: `${audioDurationSynth ? (audioProgressSynth / audioDurationSynth) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8] pt-2 border-t border-black/5 dark:border-white/5">
                    Notice acoustic attenuation on initial target word <strong className="text-[#F65936]">"as"</strong> (/æ z/).
                  </div>
                </div>
              </div>

              {/* Dual ASR Screening Analysis */}
              <div className="p-4 rounded-2xl bg-[#FAFCFF] dark:bg-[#0D1117] border border-[#D6EDF8] dark:border-[#2A3F54] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A7086] dark:text-[#7A9BB8] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#F2C53D]" /> Dual-ASR Transcript Decoding Analysis
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B22] border border-black/5 dark:border-white/5 space-y-1.5">
                    <span className="font-bold text-[#88DFF2] block">Whisper-Tiny (Autoregressive LM):</span>
                    <p className="font-mono text-xs text-[#14213D] dark:text-[#E6F0F8]">
                      " <span className="bg-[#64BF56]/20 px-1 py-0.5 rounded text-[#64BF56] font-bold">as</span> more humane principles were introduced into prison management."
                    </p>
                    <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">
                      ✅ <strong>Context Compensation [D = 0]:</strong> Whisper's causal LM prior recovers the target lexical token from linguistic context despite acoustic coda attenuation.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#161B22] border border-black/5 dark:border-white/5 space-y-1.5">
                    <span className="font-bold text-[#F65936] block">Wav2Vec2-Base (Acoustic CTC):</span>
                    <p className="font-mono text-xs text-[#14213D] dark:text-[#E6F0F8]">
                      "<span className="bg-[#F65936]/20 px-1 py-0.5 rounded text-[#F65936] font-bold">[DELETED] S</span> MORE HUMANE PRINCIPLES WERE INTRODUCED..."
                    </p>
                    <p className="text-[11px] text-[#5A7086] dark:text-[#7A9BB8]">
                      ❌ <strong>Acoustic Disagreement [D &gt; 0]:</strong> Non-autoregressive acoustic CTC decoding registers token loss due to attenuated coda /z/ energy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D6EDF8] dark:border-[#2A3F54] flex justify-between items-center bg-[#FAFCFF] dark:bg-[#0D1117]">
              <span className="text-xs text-[#5A7086] dark:text-[#7A9BB8]">
                Neural Vocoder Speech Evaluation Platform
              </span>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  if (audioGtRef.current) audioGtRef.current.pause();
                  if (audioSynthRef.current) audioSynthRef.current.pause();
                  setIsPlayingGt(false);
                  setIsPlayingSynth(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#14213D] dark:bg-white text-white dark:text-[#14213D] hover:opacity-90 transition-opacity"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
