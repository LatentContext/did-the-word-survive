<p align="center">
  <!-- Core -->
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.9%20|%203.10%20|%203.11%20|%203.12-blue?logo=python&logoColor=white" alt="Python 3.9+"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?logo=open-source-initiative&logoColor=white" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/dependencies-zero-22c55e" alt="Zero external dependencies">
  <img src="https://img.shields.io/badge/tests-22%20passing-22c55e?logo=github-actions&logoColor=white" alt="Tests passing">
  <img src="https://img.shields.io/badge/MFA-compatible-0284c7" alt="MFA Compatible">
  <br>
  <!-- Resources -->
  <a href="#-benchmarked-vocoders-14-models"><img src="https://img.shields.io/badge/Vocoders-14%20Neural%20Models-blueviolet" alt="14 Vocoder Models"></a>
  <a href="#-benchmark-datasets-4-corpora"><img src="https://img.shields.io/badge/Datasets-4%20Speech%20Corpora-blueviolet" alt="4 Speech Datasets"></a>
  <a href="https://hub.docker.com/"><img src="https://img.shields.io/badge/Docker-latentcontext%2Fdid--the--word--survive-2496ED?logo=docker&logoColor=white" alt="Docker Hub"></a>
  <!-- ASR -->
  <a href="https://github.com/openai/whisper"><img src="https://img.shields.io/badge/Evaluated%20with-Whisper%20(OpenAI)-412991?logo=openai&logoColor=white" alt="OpenAI Whisper"></a>
</p>

<br>

<h1 align="center">Did The Word Survive?</h1>

<p align="center">
  <strong>A dependency-free Python toolkit for text-level speech evaluation.</strong>
</p>

<br>

---

## 🗂️ Table of Contents

- [Overview](#-overview)
- [Quick Links](#-quick-links)
- [Benchmarked Vocoders (14 Models)](#-benchmarked-vocoders-14-models)
- [Benchmark Datasets (4 Corpora)](#-benchmark-datasets-4-corpora)
- [Montreal Forced Alignment (MFA) & Lexicons](#-montreal-forced-alignment-mfa--lexicons)
- [Evaluation Pipeline](#-evaluation-pipeline)
- [Demo Output](#-demo-output)
- [Directory Structure](#-directory-structure)
- [Installation](#-installation)
- [Docker](#-docker)
- [Usage](#-usage)
- [Manifest & Phonetic Formats](#-manifest--phonetic-formats)
- [Configuration](#️-configuration)
- [Metrics Definitions](#-metrics-definitions)
- [Phonetic Class Diagnostics](#-phonetic-class-diagnostics)
- [Verification & Reproducibility Checklist](#-verification--reproducibility-checklist)
- [ASR Model Reference](#-asr-model-reference)
- [Note on Data](#-note-on-data)
- [License](#-license)
- [Citation](#-citation)

---

## 🔍 Overview

This repository provides a self-contained, reproducible toolkit for computing speech-recognition and speech-synthesis evaluation metrics using **edit-distance (Levenshtein) alignments** at both word, character, and phoneme granularities.

The core implementation operates in **pure Python with zero external runtime dependencies**, while providing optional integrations with **Montreal Forced Aligner (MFA)** pronunciation lexicons and ARPAbet phonetic class diagnostics (Manner of Articulation).

**What this repo includes:**

| Component | Description |
|-----------|-------------|
| `metrics.py` | Standard WER, CER, MER via dynamic-programming Levenshtein alignment |
| `phonetics.py` | ARPAbet phoneme extraction, Phone Error Rate (PER), and manner-of-articulation class breakdown |
| `cli.py` | CLI driver supporting `--format table / json / text` and optional `--lexicon` |
| `sample_lexicon.txt` | 142-word ARPAbet pronunciation dictionary in standard MFA / CMU Dict format |
| `setup_mfa.sh` | Shell automation for Montreal Forced Aligner installation, acoustic model download, and alignment |
| `toy_manifest.jsonl` | 20 synthetic reference/hypothesis pairs covering varied phonetic conditions |
| `phonetic_manifest.jsonl` | Phoneme-annotated synthetic samples with expected class categorizations |
| `demo.json` | Generic normalization configuration (lowercase, punctuation stripping) |
| `test_demo.py` | 22 comprehensive unit tests covering edge cases, alignments, and CLI operations |
| `Dockerfile` | Multi-stage container definition for zero-setup isolated execution |

**What this repo does not include:** private experimental data, internal author paths, or proprietary model checkpoints.

---

## 🔗 Quick Links

| Resource | Scope / Description | Link |
|:---|:---|:---:|
| 📄 **Paper (PDF)** | Methodology & Research Findings | *Coming soon* |
| 🔊 **Vocoder Models (14)** | Benchmark Vocoder Papers, Code & Checkpoints | [View 14 Vocoders Table ↓](#-benchmarked-vocoders-14-models) |
| 📊 **Benchmark Datasets (4)** | LJSpeech, LibriTTS, VCTK, Free_ST | [View 4 Datasets Table ↓](#-benchmark-datasets-4-corpora) |
| 🗣️ **Montreal Forced Aligner** | Official MFA Documentation | [montreal-forced-aligner.readthedocs.io →](https://montreal-forced-aligner.readthedocs.io/) |
| 📖 **CMU Pronouncing Dictionary** | ARPAbet Phonetic Lexicon Reference | [www.speech.cs.cmu.edu/cgi-bin/cmudict →](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) |
| 🐳 **Docker Image** | `latentcontext/did-the-word-survive` | [Docker Hub →](https://hub.docker.com/) |
| 🤖 **ASR Model Reference** | OpenAI Whisper (Evaluation Backend) | [github.com/openai/whisper →](https://github.com/openai/whisper) |
| 💻 **Source Code (Demo)** | Minimal Dependency-Free Demo | [This repository →](https://github.com/LatentContext/did-the-word-survive) |

---

## 🔊 Benchmarked Vocoders (14 Models)

The table below catalogs all 14 benchmarked neural vocoder systems, providing direct links to their original research papers, open-source code repositories, and public pretrained checkpoints for download:

| ID | Model | Architecture / Focus | 📄 Paper Link | 💻 Code Repository | 📦 Pretrained Checkpoint |
|:---|:---|:---|:---:|:---:|:---:|
| **M1** | RNDVoC | Residual Noise-Driven Vocoder | [arXiv:2406.01257](https://arxiv.org/abs/2406.01257) | [Andong-Li-speech/RNDVoC](https://github.com/Andong-Li-speech/RNDVoC) | [Hugging Face Checkpoint](https://huggingface.co/AndongLi/RNDVoC/blob/main/best_g_libritts) |
| **M2** | Flow2GAN (4-step) | Flow Matching + GAN Hybrid | [arXiv:2405.08819](https://arxiv.org/abs/2405.08819) | [k2-fsa/Flow2GAN](https://github.com/k2-fsa/Flow2GAN) | [Hugging Face Checkpoint](https://huggingface.co/k2-fsa/Flow2GAN) |
| **M3** | Vocos | Fast Fourier-based Neural Vocoder | [arXiv:2306.00814](https://arxiv.org/abs/2306.00814) | [gemelo-ai/vocos](https://github.com/gemelo-ai/vocos) | [Hugging Face Checkpoint](https://huggingface.co/charactr/vocos-mel-24khz) |
| **M4** | BridgeVoC | Diffusion Bridge Vocoder | [arXiv:2406.01258](https://arxiv.org/abs/2406.01258) | [Andong-Li-speech/BridgeVoC](https://github.com/Andong-Li-speech/BridgeVoC) | [Hugging Face Checkpoint](https://huggingface.co/AndongLi/BridgeVoC/blob/main/ckpt/Libritts/pretrained/bridgevoc_bcd_libritts_24k_fmax12k_nmel100.pt) |
| **M5** | PeriodWave-Turbo | Fast Periodic Waveform Synthesis | [arXiv:2408.06945](https://arxiv.org/abs/2408.06945) | [sh-lee-prml/PeriodWave](https://github.com/sh-lee-prml/PeriodWave) | [Google Drive Checkpoint](https://drive.google.com/drive/folders/1uUlfiSHFL9xNAZKp6-a584cW9nG7wDK7) |
| **M6** | ComVo-Base | Compact Neural Vocoder (Base) | [arXiv:2406.19794](https://arxiv.org/abs/2406.19794) | [hs-oh-prml/ComVo](https://github.com/hs-oh-prml/ComVo) | [Hugging Face Checkpoint](https://huggingface.co/hsoh/ComVo-base) |
| **M7** | BigVGAN-v2 (112M) | Universal GAN (Large 112M) | [arXiv:2206.04658](https://arxiv.org/abs/2206.04658) | [NVIDIA/BigVGAN](https://github.com/NVIDIA/BigVGAN) | [Hugging Face Checkpoint](https://huggingface.co/nvidia/bigvgan_v2_24khz_100band_256x) |
| **M8** | BigVGAN-Base (14M) | Universal GAN (Base 14M) | [arXiv:2206.04658](https://arxiv.org/abs/2206.04658) | [NVIDIA/BigVGAN](https://github.com/NVIDIA/BigVGAN) | [Hugging Face Checkpoint](https://huggingface.co/nvidia/bigvgan_base_24khz_100band) |
| **M9** | ComVo-Large | Compact Neural Vocoder (Large 115M) | [arXiv:2406.19794](https://arxiv.org/abs/2406.19794) | [hs-oh-prml/ComVo](https://github.com/hs-oh-prml/ComVo) | [Hugging Face Checkpoint](https://huggingface.co/hsoh/ComVo-large) |
| **M10** | WaveFM (1-step) | One-Step Flow Matching Vocoder | [arXiv:2406.00287](https://arxiv.org/abs/2406.00287) | [luotianze666/WaveFM](https://github.com/luotianze666/WaveFM) | [GitHub Checkpoint](https://github.com/luotianze666/WaveFM/blob/main/checkpoints/Distilled_WaveFM_25000) |
| **M11** | HiFi-GAN (Universal V1) | High-Fidelity Generative Adversarial | [arXiv:2010.05646](https://arxiv.org/abs/2010.05646) | [jik876/hifi-gan](https://github.com/jik876/hifi-gan) | [Google Drive Checkpoint](https://drive.google.com/drive/folders/1-eEYTB5Av9jNql0WGBlRoi-WH2J7bp5Y) |
| **M12** | FreeV | Free-U Enhanced Neural Vocoder | [arXiv:2405.15842](https://arxiv.org/abs/2405.15842) | [BakerBunker/FreeV](https://github.com/BakerBunker/FreeV) | [Hugging Face Checkpoint](https://huggingface.co/Bakerbunker/FreeV_Model_Logs) |
| **M13** | RFWave | Rectified Flow Waveform Generator | [arXiv:2406.18567](https://arxiv.org/abs/2406.18567) | [bfs18/rfwave](https://github.com/bfs18/rfwave) | [Google Drive Checkpoint](https://drive.google.com/file/d/1IQNXAAVRTtr9P8Gc-CoPeRIJ_l_O4y38/view) |
| **M14** | PeriodWave (16-step) | Periodic Multi-Diffusion Vocoder | [arXiv:2408.06945](https://arxiv.org/abs/2408.06945) | [sh-lee-prml/PeriodWave](https://github.com/sh-lee-prml/PeriodWave) | [Google Drive Checkpoint](https://drive.google.com/drive/folders/1uUlfiSHFL9xNAZKp6-a584cW9nG7wDK7) |

---

## 📊 Benchmark Datasets (4 Corpora)

The benchmarking evaluation assesses speech synthesis across four standard public speech datasets representing varied acoustic conditions:

| Corpus | Acoustic Condition | Description & Sampling | 📄 Paper / Reference | 📥 Download Links |
|:---|:---|:---|:---:|:---:|
| **LibriTTS** | Audiobook (diverse speakers) | Multi-speaker English corpus derived from LibriSpeech (585 hrs @ 24kHz) | [Zen et al., Interspeech 2019 (arXiv:1904.02882)](https://arxiv.org/abs/1904.02882) | [OpenSLR (SLR60)](https://www.openslr.org/60/) · [Hugging Face](https://huggingface.co/datasets/libritts) |
| **LJSpeech** | Clean studio recording | Single female speaker reading non-fiction English books (13,100 clips, ~24 hrs @ 22.05kHz) | [Ito & Johnson, 2017](https://keithito.com/LJ-Speech-Dataset/) | [Official Website](https://keithito.com/LJ-Speech-Dataset/) · [Hugging Face](https://huggingface.co/datasets/lj_speech) |
| **VCTK** | Accented speech | 109 native English speakers with varied regional accents (British, Scottish, Irish, etc.; 44 hrs) | [Yamagishi et al., CSTR (2019)](https://datashare.ed.ac.uk/handle/10283/3443) | [Edinburgh DataShare](https://datashare.ed.ac.uk/handle/10283/3443) · [Hugging Face](https://huggingface.co/datasets/vctk) |
| **Free_ST** | Real-world / noisy ambient | American English recorded in real environments with ambient acoustic noise and varied SNR | [Surfingtech (OpenSLR 45)](https://www.openslr.org/45/) | [OpenSLR (SLR45)](https://www.openslr.org/45/) |

---

## 🗣️ Montreal Forced Alignment (MFA) & Lexicons

**Montreal Forced Aligner (MFA)** provides Kaldi-based HMM-GMM acoustic alignment between continuous audio waveforms and word-level transcriptions, generating time-aligned phoneme and word intervals in Praat `TextGrid` format.

This repository includes a native pronunciation lexicon loader and phone-level alignment diagnostic suite compatible with MFA:

### 1. Pronunciation Lexicon Format
Lexicons are tab- or whitespace-separated ARPAbet dictionaries mapping orthographic words to phone sequences with optional lexical stress markers (e.g., `0`, `1`, `2`):

```text
SPEECH       S P IY1 CH
SYNTHESIS    S IH1 N TH AH0 S AH0 S
ACOUSTIC     AH0 K UW1 S T IH0 K
VOCODER      V OW1 K OW0 D ER0
```

The bundled sample lexicon is located at [`lexicons/sample_lexicon.txt`](lexicons/sample_lexicon.txt) and covers all 142 vocabulary items appearing in the benchmark manifests.

### 2. Automated MFA Setup Script
We provide a standalone automation script [`scripts/setup_mfa.sh`](scripts/setup_mfa.sh) that handles environment provisioning, model downloads, corpus validation, and forced alignment:

```bash
# Check status of local MFA installation
bash scripts/setup_mfa.sh check

# Provision isolated Conda environment with MFA & Kaldi dependencies
bash scripts/setup_mfa.sh install

# Download standard pre-trained acoustic model and dictionary
bash scripts/setup_mfa.sh download

# Validate corpus against lexicon
bash scripts/setup_mfa.sh validate data/raw lexicons/sample_lexicon.txt

# Run forced alignment and generate TextGrids
bash scripts/setup_mfa.sh align data/raw lexicons/sample_lexicon.txt outputs/textgrids
```

Standard MFA models used:
- **Acoustic Model**: `english_us_arpa`
- **Pronunciation Dictionary**: `english_us_arpa`

---

## 🔄 Evaluation Pipeline

The evaluation pipeline processes reference / hypothesis pairs across lexical and phonetic layers:

```
  Reference Text                   Hypothesis Text
        │                                 │
        ▼                                 ▼
┌────────────────────────────────────────────────────────┐
│               Text Normalization Layer                 │
│  - Lowercase conversion                                │
│  - Punctuation removal (preserving intra-word tokens)  │
│  - Whitespace tokenization                             │
└──────────────────────────────────┬─────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌────────────────────────────────┐         ┌─────────────────────────────────┐
│     Lexical Alignment (DP)     │         │   Phonetic Lexicon Mapping      │
│  - Levenshtein Word Align      │         │   (via lexicons/sample_lexicon) │
│  - Levenshtein Char Align      │         └────────────────┬────────────────┘
│                                │                          │
│  Output:                       │                          ▼
│  - Word Error Rate (WER)       │         ┌─────────────────────────────────┐
│  - Char Error Rate (CER)       │         │    Phonetic Alignment (DP)      │
│  - Match Error Rate (MER)      │         │  - ARPAbet Phone Align          │
└────────────────┬───────────────┘         │  - Manner-of-Articulation Class │
                 │                         │                                 │
                 │                         │  Output:                        │
                 │                         │  - Phone Error Rate (PER)       │
                 │                         │  - Vowel / Plosive / Fricative  │
                 │                         │    Class Error Breakdown        │
                 │                         └────────────────┬────────────────┘
                 ▼                                          ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    Reporting & Aggregation Layer                           │
│  - Micro-average (pooled corpus denominator)                               │
│  - Macro-average (unweighted sample mean)                                  │
│  - Formats: CLI Table, Structured JSON, or Text Summary                    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Demo Output

### 1. Lexicon-Enabled Evaluation (WER, CER, MER, PER)

Executing with the `--lexicon` flag runs word, character, and phoneme-level alignment across the 20 synthetic benchmark records:

```text
$ context-demo --manifest examples/toy_manifest.jsonl --lexicon lexicons/sample_lexicon.txt --format table

==========================================================================================
  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)
==========================================================================================
Manifest: examples/toy_manifest.jsonl (20 records)
Lexicon : lexicons/sample_lexicon.txt (142 words)
------------------------------------------------------------------------------------------
Sample ID          | Ref W |     WER |     CER |     MER |     PER | Ref P |   H/S/D/I
------------------------------------------------------------------------------------------
demo_sample_001    |     9 |    0.0% |    0.0% |    0.0% |    0.0% |    31 |   9/0/0/0
demo_sample_002    |     7 |   14.3% |    3.3% |   14.3% |    2.1% |    48 |   6/1/0/0
demo_sample_003    |     6 |   16.7% |    5.0% |   16.7% |    8.0% |    50 |   5/1/0/0
demo_sample_004    |     6 |    0.0% |    0.0% |    0.0% |    0.0% |    45 |   6/0/0/0
demo_sample_005    |     6 |   16.7% |   25.5% |   16.7% |   21.2% |    33 |   5/0/1/0
demo_sample_006    |     7 |   14.3% |    8.3% |   12.5% |    8.2% |    49 |   7/0/0/1
demo_sample_007    |     7 |    0.0% |    0.0% |    0.0% |    0.0% |    40 |   7/0/0/0
demo_sample_008    |     7 |   14.3% |    1.6% |   14.3% |    4.3% |    47 |   6/1/0/0
demo_sample_009    |     7 |   14.3% |    3.4% |   14.3% |    6.4% |    47 |   6/1/0/0
demo_sample_010    |     8 |   12.5% |   23.8% |   12.5% |   27.7% |    47 |   7/0/1/0
demo_sample_011    |     7 |   14.3% |   16.4% |   12.5% |   17.4% |    46 |   7/0/0/1
demo_sample_012    |     7 |   14.3% |    1.6% |   14.3% |    1.9% |    54 |   6/1/0/0
demo_sample_013    |     8 |   12.5% |    8.7% |   12.5% |    5.8% |    52 |   7/0/1/0
demo_sample_014    |     8 |   25.0% |    2.9% |   25.0% |    3.6% |    55 |   6/2/0/0
demo_sample_015    |     6 |    0.0% |    0.0% |    0.0% |    0.0% |    49 |   6/0/0/0
demo_sample_016    |     8 |   25.0% |   25.8% |   25.0% |   28.3% |    53 |   6/0/2/0
demo_sample_017    |     8 |   12.5% |    6.1% |   12.5% |    5.8% |    52 |   7/1/0/0
demo_sample_018    |     8 |    0.0% |    0.0% |    0.0% |    0.0% |    48 |   8/0/0/0
demo_sample_019    |     9 |   22.2% |   22.2% |   22.2% |   19.6% |    46 |   7/0/2/0
demo_sample_020    |     9 |   11.1% |    8.0% |   11.1% |   10.0% |    60 |   8/0/1/0
------------------------------------------------------------------------------------------
Summary Averages:
  Micro WER: 12.2%  |  Macro WER: 12.0%
  Micro CER:  8.1%  |  Macro CER:  8.1%
  Micro MER: 12.0%  |  Macro MER: 11.8%
  Micro PER:  8.5%  |  Macro PER:  8.5%
==========================================================================================
```

---

## 📁 Directory Structure

```
did-the-word-survive/
│
├── 📄  README.md                        ← Comprehensive specification and documentation
├── 📄  LICENSE                          ← MIT Open-Source License
├── 🐳  Dockerfile                       ← Containerized execution definition
├── ⚙️  pyproject.toml                   ← Package metadata & entry points
├── 🚫  .gitignore                       ← Deny-by-default publication allowlist
│
├── 📂  configs/
│   └── 📄  demo.json                    ← Normalization & evaluation configurations
│
├── 📂  examples/
│   ├── 📄  toy_manifest.jsonl           ← 20 synthetic reference/hypothesis pairs
│   └── 📄  phonetic_manifest.jsonl      ← Phoneme-annotated synthetic samples
│
├── 📂  lexicons/
│   └── 📄  sample_lexicon.txt           ← 142-word ARPAbet pronunciation dictionary
│
├── 📂  schemas/
│   └── 📄  demo_manifest.schema.json    ← JSON Schema v7 for manifest record validation
│
├── 📂  scripts/
│   └── 📄  setup_mfa.sh                 ← Montreal Forced Aligner setup & pipeline script
│
├── 📂  src/
│   └── 📂  context_demo/
│       ├── 📄  __init__.py              ← Package exports & versioning
│       ├── 📄  cli.py                   ← Multi-format CLI driver (--lexicon support)
│       ├── 📄  metrics.py               ← Levenshtein dynamic programming (WER/CER/MER)
│       └── 📄  phonetics.py             ← MFA phonetics, PER, & manner classification
│
└── 📂  tests/
    └── 📄  test_demo.py                 ← 22 unit tests (metrics, phonetics, CLI)
```

---

## 🚀 Installation

### Option 1 — pip (editable install)

```bash
git clone https://github.com/LatentContext/did-the-word-survive.git
cd did-the-word-survive
pip install -e .
```

### Option 2 — Direct Execution (Zero Installation)

```bash
git clone https://github.com/LatentContext/did-the-word-survive.git
cd did-the-word-survive
PYTHONPATH=src python3 src/context_demo/cli.py \
    --manifest examples/toy_manifest.jsonl \
    --lexicon  lexicons/sample_lexicon.txt \
    --format   table
```

---

## 🐳 Docker

**Build the image locally:**

```bash
docker build -t did-the-word-survive:latest .
```

**Run default evaluation in container:**

```bash
docker run --rm did-the-word-survive:latest
```

**Run with pronunciation lexicon and JSON output:**

```bash
docker run --rm did-the-word-survive:latest \
    --manifest examples/toy_manifest.jsonl \
    --lexicon  lexicons/sample_lexicon.txt \
    --format   json
```

**Mount external evaluation data:**

```bash
docker run --rm \
    -v /path/to/local/data:/data \
    did-the-word-survive:latest \
    --manifest /data/my_manifest.jsonl \
    --format   table
```

---

## 📖 Usage

### Word and Character Evaluation
```bash
context-demo --manifest examples/toy_manifest.jsonl --format table
```

### Full Phonetic & Word Evaluation (with Lexicon)
```bash
context-demo \
    --manifest examples/toy_manifest.jsonl \
    --lexicon  lexicons/sample_lexicon.txt \
    --format   table
```

### Structured JSON Output
```bash
context-demo \
    --manifest examples/toy_manifest.jsonl \
    --lexicon  lexicons/sample_lexicon.txt \
    --format   json
```

### Running Test Suite
```bash
python3 -m unittest discover tests -v
```

---

## 📋 Manifest & Phonetic Formats

### 1. Lexical Manifest (`toy_manifest.jsonl`)
Validated against [`schemas/demo_manifest.schema.json`](schemas/demo_manifest.schema.json):

```jsonc
{
  "id": "demo_sample_002",
  "reference": "speech synthesis evaluation requires clear objective metrics",
  "hypothesis": "speech synthesis evaluation requires clear subjective metrics"
}
```

### 2. Phonetic Manifest (`phonetic_manifest.jsonl`)
Enriched with ARPAbet phone sequences and manner-of-articulation tags:

```jsonc
{
  "id": "phone_sample_001",
  "reference": "speech synthesis",
  "hypothesis": "speech synthesis",
  "phones_ref": "S P IY1 CH S IH1 N TH AH0 S AH0 S",
  "phones_hyp": "S P IY1 CH S IH1 N TH AH0 S AH0 S",
  "classes": ["fricative", "plosive", "vowel", "fricative", "nasal", ...]
}
```

---

## ⚙️ Configuration

[`configs/demo.json`](configs/demo.json) manages text normalization:

```json
{
  "lowercase": true,
  "strip_punctuation": true,
  "tokenizer": "split"
}
```

---

## 📐 Metrics Definitions

| Metric | Level | Formula | Denominator | Description |
|:---|:---:|:---:|:---:|:---|
| **WER** | Word | `(S + D + I) / N_ref` | Words in reference | Standard word edit rate |
| **CER** | Character | `(S + D + I) / N_ref` | Characters in reference | Fine-grained acoustic transcription error |
| **MER** | Alignment | `(S + D + I) / (H + S + D + I)` | Total alignment operations | Bound between `[0, 1]`, match error fraction |
| **PER** | Phoneme | `(S + D + I) / N_ref_phones` | Phonemes in reference | Direct phonetic pronunciation fidelity |

**Alignment Operations:**
- **Hits (H)**: Correctly recognized / aligned tokens
- **Substitutions (S)**: Replaced tokens
- **Deletions (D)**: Tokens omitted from hypothesis
- **Insertions (I)**: Spurious tokens added to hypothesis

---

## 🔬 Phonetic Class Diagnostics

Neural vocoders exhibit distinct degradation patterns across manner-of-articulation phonetic classes. The `phonetics.py` module classifies errors into standard categories:

| Manner of Articulation | ARPAbet Phonemes Included | Acoustic Degradation Characteristics |
|:---|:---|:---|
| **Vowels** | `AA, AE, AH, AO, AW, AY, EH, ER, EY, IH, IY, OW, OY, UH, UW` | Formant frequency smearing, pitch contour deviation |
| **Plosives / Stops** | `B, D, G, K, P, T` | Loss of transient burst energy, closure gap distortion |
| **Fricatives & Affricates** | `CH, JH, DH, F, S, SH, TH, V, Z, ZH` | High-frequency turbulent noise damping or artifact smearing |
| **Nasals** | `M, N, NG` | Murmur attenuation, spectral anti-resonance loss |
| **Approximants** | `L, R, W, Y` | Continuous formant transition blur |

---

## ✅ Verification & Reproducibility Checklist

To independently verify all functionality in this repository, execute the following commands in sequence:

- [x] **1. Run Full Unit Test Suite (22 Tests)**:
  ```bash
  PYTHONPATH=src python3 -m unittest discover tests -v
  ```
- [x] **2. Run Lexical Error Rate Benchmark (20 Samples)**:
  ```bash
  PYTHONPATH=src python3 src/context_demo/cli.py --manifest examples/toy_manifest.jsonl --format table
  ```
- [x] **3. Run Phonetic PER Benchmark with Lexicon**:
  ```bash
  PYTHONPATH=src python3 src/context_demo/cli.py --manifest examples/toy_manifest.jsonl --lexicon lexicons/sample_lexicon.txt --format table
  ```
- [x] **4. Validate Structured JSON Export**:
  ```bash
  PYTHONPATH=src python3 src/context_demo/cli.py --manifest examples/toy_manifest.jsonl --lexicon lexicons/sample_lexicon.txt --format json | grep "micro_per"
  ```
- [x] **5. Inspect Montreal Forced Aligner Pipeline**:
  ```bash
  bash scripts/setup_mfa.sh check
  ```
- [x] **6. Check Schema Validation Integrity**:
  ```bash
  python3 -c "import json; [json.loads(line) for line in open('examples/toy_manifest.jsonl')]; print('Manifest JSON syntax valid.')"
  ```

---

## 🤖 ASR Model Reference

This toolkit evaluates speech transcription fidelity. Research benchmarks evaluate transcriptions from **[OpenAI Whisper](https://github.com/openai/whisper)**:

| Resource | Link |
|:---|:---|
| Whisper GitHub Repository | [github.com/openai/whisper](https://github.com/openai/whisper) |
| Whisper on Hugging Face | [huggingface.co/openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3) |
| Whisper Research Paper (Radford et al., 2022) | [arxiv.org/abs/2212.04356](https://arxiv.org/abs/2212.04356) |

---

## 📌 Note on Data

All reference and hypothesis pairs in [`examples/toy_manifest.jsonl`](examples/toy_manifest.jsonl) and [`examples/phonetic_manifest.jsonl`](examples/phonetic_manifest.jsonl) are **synthetic, newly constructed** pairs created to verify metric implementations. They do not contain proprietary recordings, real corpus transcripts, or participant data.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📚 Citation

```bibtex
@misc{did-the-word-survive,
  title        = {Did The Word Survive? — Text and Phonetic Speech Evaluation Toolkit},
  author       = {LatentContext},
  year         = {2024},
  howpublished = {\url{https://github.com/LatentContext/did-the-word-survive}},
  note         = {Public evaluation demo repository.}
}
```

---

<p align="center">
  Made with ❤️ · <a href="https://github.com/LatentContext/did-the-word-survive">LatentContext / did-the-word-survive</a>
</p>
