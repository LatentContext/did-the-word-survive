<p align="center">
  <!-- Core -->
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.9%20|%203.10%20|%203.11%20|%203.12-blue?logo=python&logoColor=white" alt="Python 3.9+"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?logo=open-source-initiative&logoColor=white" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/dependencies-zero-22c55e" alt="Zero external dependencies">
  <img src="https://img.shields.io/badge/tests-17%20passing-22c55e?logo=github-actions&logoColor=white" alt="Tests passing">
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

- [Overview](#️-overview)
- [Quick Links](#-quick-links)
- [Benchmarked Vocoders (14 Models)](#-benchmarked-vocoders-14-models)
- [Benchmark Datasets (4 Corpora)](#-benchmark-datasets-4-corpora)
- [Evaluation Pipeline](#-evaluation-pipeline)
- [Demo Output](#-demo-output)
- [Directory Structure](#-directory-structure)
- [Installation](#-installation)
- [Docker](#-docker)
- [Usage](#-usage)
- [Manifest Format](#-manifest-format)
- [Configuration](#️-configuration)
- [Metrics Definitions](#-metrics-definitions)
- [ASR Model Reference](#-asr-model-reference)
- [Note on Data](#-note-on-data)
- [License](#-license)
- [Citation](#-citation)

---

## 🔍 Overview

This repository provides a small, runnable demonstration of standard speech-recognition evaluation metrics using **edit-distance (Levenshtein) alignment**. It is self-contained and operates entirely on plain text — no audio files, no model weights, no external datasets.

**What this repo includes:**

| Component | Description |
|-----------|-------------|
| `metrics.py` | Standard WER, CER, MER — pure Python, no deps |
| `cli.py` | Command-line driver with `--format table / json / text` |
| `toy_manifest.jsonl` | 6 synthetic text pairs for smoke-testing |
| `demo.json` | Generic normalization config (lowercase, strip punctuation) |
| `test_demo.py` | 17 unit tests covering edge cases |
| `Dockerfile` | Container image for zero-setup evaluation |

**What this repo does not include:** model checkpoints, audio processing, real transcripts, private configurations, or experimental results.

---

## 🔗 Quick Links

| Resource | Scope / Description | Link |
|:---|:---|:---:|
| 📄 **Paper (PDF)** | Methodology & Research Findings | *Coming soon* |
| 🔊 **Vocoder Models (14)** | Benchmark Vocoder Papers, Code & Checkpoints | [View 14 Vocoders Table ↓](#-benchmarked-vocoders-14-models) |
| 📊 **Benchmark Datasets (4)** | LJSpeech, LibriTTS, VCTK, Free_ST | [View 4 Datasets Table ↓](#-benchmark-datasets-4-corpora) |
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

## 🔄 Evaluation Pipeline

The pipeline reads a `.jsonl` manifest of reference / hypothesis text pairs, applies configurable normalization (lowercase, punctuation removal), runs Levenshtein alignment, and reports per-sample and aggregate statistics.

**Stages:**

```
Input Manifest (.jsonl)
        ↓
  Config Loader (demo.json)
  └─ lowercase: true
  └─ strip_punctuation: true
        ↓
  Levenshtein Alignment
  └─ per-word alignment for WER/MER
  └─ per-character alignment for CER
        ↓
  Metric Computation
  └─ WER  =  (S + D + I) / N_ref_words
  └─ CER  =  (S + D + I) / N_ref_chars
  └─ MER  =  (S + D + I) / (H + S + D + I)
        ↓
  Output Report
  └─ --format table  (human-readable)
  └─ --format json   (machine-readable)
  └─ --format text   (plain summary)
```

---

## 🖥️ Demo Output

```text
$ context-demo --manifest examples/toy_manifest.jsonl --format table

==============================================================================
  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)
==============================================================================
Manifest: examples/toy_manifest.jsonl (6 records)
------------------------------------------------------------------------------
Sample ID          | Ref Words |      WER |      CER |      MER |   H/S/D/I
------------------------------------------------------------------------------
demo_sample_001    |         9 |     0.0% |     0.0% |     0.0% |   9/0/0/0
demo_sample_002    |         7 |    14.3% |     3.3% |    14.3% |   6/1/0/0
demo_sample_003    |         6 |    16.7% |     5.0% |    16.7% |   5/1/0/0
demo_sample_004    |         6 |     0.0% |     0.0% |     0.0% |   6/0/0/0
demo_sample_005    |         6 |    16.7% |    25.5% |    16.7% |   5/0/1/0
demo_sample_006    |         7 |    14.3% |     8.3% |    12.5% |   7/0/0/1
------------------------------------------------------------------------------
Summary Averages:
  Micro WER:  9.8%  |  Macro WER: 10.3%
  Micro CER:  6.7%  |  Macro CER:  7.0%
  Micro MER:  9.5%  |  Macro MER: 10.0%
==============================================================================
```

The table above shows per-sample WER, CER, MER, and alignment counts (H/S/D/I) for the 6 included synthetic text pairs, followed by micro and macro averages.

---

## 📁 Directory Structure

```
did-the-word-survive/
│
├── 📄  README.md                        ← This file
├── 📄  LICENSE                          ← MIT License
├── 🐳  Dockerfile                       ← Container build for zero-setup runs
├── ⚙️  pyproject.toml                   ← Package metadata & entry points
├── 🚫  .gitignore                       ← Deny-by-default allowlist
├── 📂  configs/
│   └── 📄  demo.json                    ← Generic normalization & eval options
│
├── 📂  examples/
│   └── 📄  toy_manifest.jsonl           ← 6 synthetic reference/hypothesis pairs
│                                           (NOT real transcripts or corpus data)
│
├── 📂  schemas/
│   └── 📄  demo_manifest.schema.json    ← JSON Schema v7 for manifest records
│
├── 📂  src/
│   └── 📂  context_demo/
│       ├── 📄  __init__.py              ← Package version & exports
│       ├── 📄  cli.py                   ← CLI driver (argparse → metrics → output)
│       └── 📄  metrics.py              ← WER / CER / MER (pure Python, zero deps)
│
└── 📂  tests/
    └── 📄  test_demo.py                 ← 17 unit tests (edge cases, empty refs,
                                            normalization, alignment, aggregation)
```

---

## 🚀 Installation

### Option 1 — pip (editable install)

```bash
git clone https://github.com/LatentContext/did-the-word-survive.git
cd did-the-word-survive
pip install -e .
```

### Option 2 — run directly (no install)

```bash
git clone https://github.com/LatentContext/did-the-word-survive.git
cd did-the-word-survive
python3 src/context_demo/cli.py \
    --manifest examples/toy_manifest.jsonl \
    --config   configs/demo.json \
    --format   table
```

### Option 3 — Docker (see below)

---

## 🐳 Docker

**Build locally:**

```bash
docker build -t did-the-word-survive:latest .
```

**Run the demo (table output):**

```bash
docker run --rm did-the-word-survive:latest
```

**Run with JSON output:**

```bash
docker run --rm did-the-word-survive:latest \
    --manifest examples/toy_manifest.jsonl \
    --config   configs/demo.json \
    --format   json
```

**Mount your own manifest:**

```bash
docker run --rm \
    -v /path/to/your/manifest.jsonl:/data/manifest.jsonl \
    did-the-word-survive:latest \
    --manifest /data/manifest.jsonl \
    --config   configs/demo.json \
    --format   table
```

> [!IMPORTANT]
> The Docker image contains only the demo source code and synthetic examples. It does not download models, audio files, or external datasets at build or run time.

**Pull from Docker Hub** *(when available)*:

```bash
docker pull latentcontext/did-the-word-survive:latest
```

---

## 📖 Usage

**Table format** — human-readable per-sample breakdown:

```bash
context-demo \
    --manifest examples/toy_manifest.jsonl \
    --config   configs/demo.json \
    --format   table
```

**JSON format** — machine-readable structured output:

```bash
context-demo \
    --manifest examples/toy_manifest.jsonl \
    --config   configs/demo.json \
    --format   json
```

**Plain text** — compact summary averages only:

```bash
context-demo \
    --manifest examples/toy_manifest.jsonl \
    --config   configs/demo.json \
    --format   text
```

**Run unit tests:**

```bash
python3 -m unittest discover tests -v
```

---

## 📋 Manifest Format

Each line in the `.jsonl` manifest must be a valid JSON object conforming to [`schemas/demo_manifest.schema.json`](schemas/demo_manifest.schema.json):

```jsonc
{
  "id":         "sample_001",        // unique string identifier
  "reference":  "the cat sat on the mat",   // gold-standard reference text
  "hypothesis": "the cat sat on a mat"      // system output to evaluate
}
```

**Rules:**
- `reference` must be a non-empty string (empty reference raises an explicit error)
- `hypothesis` may be empty (counts as 100% deletion)
- All fields are required; extra fields are ignored

See [`examples/toy_manifest.jsonl`](examples/toy_manifest.jsonl) for working examples.

---

## ⚙️ Configuration

[`configs/demo.json`](configs/demo.json) controls text normalization applied before alignment:

```json
{
  "lowercase":         true,   // convert both ref and hyp to lowercase
  "strip_punctuation": true,   // remove punctuation before tokenization
  "tokenizer":         "split" // whitespace split (no external tokenizer)
}
```

> [!NOTE]
> This configuration uses only Python built-ins. No external NLP libraries (spaCy, NLTK, etc.) are required or used.

---

## 📐 Metrics Definitions

| Metric | Full Name | Formula | Denominator |
|--------|-----------|---------|-------------|
| **WER** | Word Error Rate | `(S + D + I) / N` | Words in reference |
| **CER** | Character Error Rate | `(S + D + I) / N` | Characters in reference |
| **MER** | Match Error Rate | `(S + D + I) / (H + S + D + I)` | Total aligned tokens |

**Symbol key:**

| Symbol | Meaning |
|--------|---------|
| **H** | Hits (correctly recognised words/chars) |
| **S** | Substitutions |
| **D** | Deletions |
| **I** | Insertions |
| **N** | Reference length (words or characters) |

**Reporting conventions:**
- All scores are percentages (`0.0%` – `100.0%+` for WER/CER)
- **Micro** average: pool all tokens across samples, then compute once
- **Macro** average: average the per-sample rates
- Empty reference → explicit `ValueError` (not silent 0 or ∞)

---

## 🤖 ASR Model Reference

This evaluation toolkit is designed for use with the output of any ASR system. The associated research evaluates transcriptions produced by **[OpenAI Whisper](https://github.com/openai/whisper)**, a general-purpose speech recognition model.

| Resource | Link |
|----------|------|
| Whisper GitHub | [github.com/openai/whisper](https://github.com/openai/whisper) |
| Whisper on Hugging Face | [huggingface.co/openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3) |
| Whisper Paper (Radford et al., 2022) | [arxiv.org/abs/2212.04356](https://arxiv.org/abs/2212.04356) |

> [!NOTE]
> No Whisper model weights are included in or downloaded by this repository. The demo computes metrics from plain text pairs only.

---

## 📌 Note on Data

All reference and hypothesis pairs in [`examples/toy_manifest.jsonl`](examples/toy_manifest.jsonl) are **synthetic, newly invented** sentences created solely to verify metric computation. They do **not** represent:

- Real speech corpus transcripts
- Model outputs from any experiment
- Participant responses or evaluation data
- Any private or unpublished dataset

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 📚 Citation

If you use this toolkit in your work, please cite this repository:

```bibtex
@misc{did-the-word-survive,
  title        = {Did The Word Survive? — Text Evaluation Demo},
  author       = {LatentContext},
  year         = {2024},
  howpublished = {\url{https://github.com/LatentContext/did-the-word-survive}},
  note         = {Public demo repository. Research paper and full implementation not included.}
}
```

---

<p align="center">
  Made with ❤️ · <a href="https://github.com/LatentContext/did-the-word-survive">LatentContext / did-the-word-survive</a>
</p>
