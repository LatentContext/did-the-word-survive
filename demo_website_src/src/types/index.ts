export interface ModelInfo {
  id: string; // M0..M14
  key: string;
  name: string;
  short_name: string;
  family: string;
  arch: string;
  steps: string;
  sample_rate: number;
  is_neural: boolean;
  is_reference: boolean;
  description: string;
}

export interface CorpusInfo {
  id: string; // 'pooled', 'LJSpeech', 'LibriTTS', 'VCTK', 'Free_ST'
  name: string;
  short_name: string;
  utterances: number;
  speakers: number;
  sample_rate: number;
  gender?: string;
  accent?: string;
  description: string;
}

export interface RecognizerInfo {
  id: string; // 'two_asr_consensus', 'whisper_tiny', 'wav2vec2_base'
  name: string;
  short_name: string;
  type: string;
  description: string;
}

export interface MacroMetric {
  model_id: string;
  key: string;
  name: string;
  N: number;
  ref_words: number;
  hits: number;
  subs: number;
  dels: number;
  ins: number;
  wer: number;
  mer: number;
  delta_wer: number;
  delta_cer: number;
  pesq: number;
  pesq_ci95: number;
  stoi: number;
  stoi_ci95: number;
  lsd: number;
  lsd_ci95: number;
  mcd: number;
  mcd_ci95: number;
  f0_rmse_cents?: number | null;
  f0_rmse_cents_std?: number | null;
  utmos?: number | null;
  utmos_ci95?: number | null;
  vowels_lsd?: number;
  vowels_lsd_ci95?: number;
  plosives_lsd?: number;
  plosives_lsd_ci95?: number;
  fricatives_lsd?: number;
  fricatives_lsd_ci95?: number;
  nasals_lsd?: number;
  nasals_lsd_ci95?: number;
  approximants_lsd?: number;
  approximants_lsd_ci95?: number;
  boundary_lsd?: number;
  boundary_lsd_ci95?: number;
}

export interface CorpusMetric {
  corpus: string;
  model_id: string;
  key: string;
  name: string;
  short_name?: string;
  N: number;
  ref_words?: number;
  wer?: number;
  pesq: number;
  pesq_ci95: number;
  stoi: number;
  stoi_ci95: number;
  lsd: number;
  lsd_ci95: number;
  delta_wer: number;
  delta_wer_ci95: number;
  f0_rmse_cents?: number | null;
  vowels_lsd?: number;
  vowels_lsd_ci95?: number;
  plosives_lsd?: number;
  plosives_lsd_ci95?: number;
  fricatives_lsd?: number;
  fricatives_lsd_ci95?: number;
  nasals_lsd?: number;
  nasals_lsd_ci95?: number;
  approximants_lsd?: number;
  approximants_lsd_ci95?: number;
  boundary_lsd?: number;
  boundary_lsd_ci95?: number;
}

export interface DatasetPhoneRanking {
  corpus: string;
  phone: string;
  ipa: string;
  phone_class: string;
  model_id: string;
  key: string;
  model_name: string;
  short_name: string;
  ref_support: number;
  sample_eval_count: number;
  subs: number;
  dels: number;
  ins: number;
  total_errors: number;
  per: number;
  per_ci95: number;
  metric_type: string;
  evidence_origin: string;
  status: string;
}

export interface PhoneOccurrence {
  base_phone?: string;
  phone?: string;
  Count?: number;
  pooled_count?: number;
  Percentage?: number;
  pooled_pct?: number;
  LJSpeech_count?: number;
  LibriTTS_count?: number;
  VCTK_count?: number;
  Free_ST_count?: number;
}

export interface PhoneticClass {
  phone_class?: string;
  class_name?: string;
  Count?: number;
  token_count?: number;
  Percentage?: number;
  token_pct?: number;
  phone_types?: string;
}

export interface PhoneDuration {
  base_phone?: string;
  phone?: string;
  count?: number;
  n_tokens?: number;
  mean?: number;
  mean_ms?: number;
  std?: number;
  std_ms?: number;
  min?: number;
  '25%'?: number;
  p25_ms?: number;
  '50%'?: number;
  median_ms?: number;
  '75%'?: number;
  p75_ms?: number;
  max?: number;
}

export interface ErrorDecomposition {
  System: string;
  Substitutions: number;
  Deletions: number;
  Insertions: number;
  Total_PER: number;
}

export interface BootstrapPerCI {
  System: string;
  Mean_PER: number;
  CI_Low: number;
  CI_High: number;
}

export interface PhoneticsData {
  coverage_matrix?: {
    corpora: string[];
    columns: string[];
    data: Record<string, Record<string, number>>;
  };
  phone_occurrences?: PhoneOccurrence[];
  phonetic_classes?: PhoneticClass[];
  phone_durations?: PhoneDuration[];
  bigram_transitions?: {
    phones: string[];
    matrix: Record<string, Record<string, number>>;
  };
  target_composition?: Array<{
    'Unnamed: 0'?: string;
    feature?: string;
    'Reference Cohort (%)'?: number;
    'Target Study Subset (%)'?: number;
    target_count?: number;
    target_pct?: number;
    general_pct?: number;
  }>;
  vowel_stress?: Array<{
    stress_label?: string;
    stress_category?: string;
    count?: number;
    token_count?: number;
    mean?: number;
    mean_duration_ms?: number;
  }>;
  phone_confusions?: {
    source_type: string;
    reference_phones: string[];
    hypothesis_phones: string[];
    matrix: Record<string, Record<string, number>>;
  };
  error_decomposition?: ErrorDecomposition[];
  bootstrap_per_ci?: BootstrapPerCI[];
  freq_vs_error?: Array<{
    phone: string;
    ref_count: number;
    error_count: number;
    error_rate_pct: number;
  }>;
  class_errors?: Array<{
    phonetic_class: string;
    substitutions: number;
    deletions: number;
    insertions: number;
    total_edits: number;
  }>;
  duration_vs_loss?: Array<{
    quartile: string;
    duration_range: string;
    loss_rate_pct: number;
    n_words: number;
  }>;
  vowel_formants?: Array<{
    vowel_ipa: string;
    f1_hz: number;
    f2_hz: number;
    example_word: string;
  }>;
  f0_rmse?: Array<{
    model_id: string;
    f0_rmse_cents_mean: number;
    f0_rmse_cents_std: number;
  }>;
  phonetic_lsd_hierarchy?: Array<{
    "Phone Class": string;
    "Metric Column": string;
    "Mean LSD (dB)": number;
    "Std Dev": number;
    "SE": number;
    "95% CI Range": string;
  }>;
  fade_overlap_summary?: {
    total_targets: number;
    clipped_150ms_padding: number;
    fade_mask_overlap_54: number;
    mean_left_padding_s: number;
    mean_right_padding_s: number;
  };
}

export interface TargetExample {
  id: string;
  utterance_id: string;
  dataset: string;
  target_word: string;
  occurrence_idx: number;
  model_id: string;
  model_name: string;
  model_key: string;
  category: string; // 'consensus_loss' | 'single_asr_loss' | 'control_unchanged'
  stratum: string;
  phones_arpabet: string;
  first_phone: string;
  last_phone: string;
  duration_ms: number;
  xmin: number;
  xmax: number;
  orig_rec_whisper: boolean;
  recon_rec_whisper: boolean;
  newly_missed_whisper: boolean;
  orig_rec_w2v: boolean;
  recon_rec_w2v: boolean;
  newly_missed_w2v: boolean;
  consensus_loss: boolean;
  whisper_hypothesis: string;
  w2v_hypothesis: string;
}

export interface ProtocolData {
  tab1_inventory: Array<{
    corpus: string;
    utterances: number;
    speakers: number;
    fs: string;
    intersected: number;
    accent: string;
  }>;
  tab2_context_rescue: Array<{
    corpus: string;
    targets: number;
    p_orig: number;
    p_recon: number;
    d_estimand: number;
    ci: string;
  }>;
  tab4_asr_screening: Array<{
    asr: string;
    sensitivity: number;
    specificity: number;
    precision: number;
    false_alarm: number;
    missed_loss: number;
    type: string;
  }>;
  tab5_screening_budget: Array<{
    method: string;
    top25: number;
    prec25: number;
    top50: number;
    prec50: number;
    top100: number;
    prec100: number;
  }>;
  tab6_linguistic_predictors: Array<{
    predictor: string;
    beta: number;
    se: number;
    odds_ratio: number;
    ci: string;
    p: string;
    significant?: boolean;
  }>;
}

export type TabType = 'overview' | 'evaluator' | 'waveform' | 'compare' | 'phonetics' | 'asr' | 'protocol' | 'resources';
