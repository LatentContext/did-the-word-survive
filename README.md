<p align="center">
  <!-- Core -->
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.9%20|%203.10%20|%203.11%20|%203.12-blue?logo=python&logoColor=white" alt="Python 3.9+"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?logo=open-source-initiative&logoColor=white" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/dependencies-zero-22c55e" alt="Zero external dependencies">
  <img src="https://img.shields.io/badge/tests-17%20passing-22c55e?logo=github-actions&logoColor=white" alt="Tests passing">
  <br>
  <!-- Resources -->
  <img src="https://img.shields.io/badge/Paper-not%20yet%20public-lightgrey?logo=arxiv&logoColor=white" alt="Paper not yet public">
  <img src="https://img.shields.io/badge/Checkpoints-not%20released-lightgrey?logo=huggingface&logoColor=white" alt="Checkpoints not released">
  <img src="https://img.shields.io/badge/Dataset-synthetic%20demo%20only-orange?logo=databricks&logoColor=white" alt="Synthetic data only">
  <a href="https://hub.docker.com/"><img src="https://img.shields.io/badge/Docker-latentcontext%2Fdid--the--word--survive-2496ED?logo=docker&logoColor=white" alt="Docker Hub"></a>
  <!-- ASR -->
  <a href="https://github.com/openai/whisper"><img src="https://img.shields.io/badge/Evaluated%20with-Whisper%20(OpenAI)-412991?logo=openai&logoColor=white" alt="OpenAI Whisper"></a>
</p>

<br>

<h1 align="center">Did The Word Survive?</h1>

<p align="center">
  <strong>A dependency-free Python toolkit for text-level speech evaluation.</strong><br>
  Compute Word Error Rate (WER), Character Error Rate (CER), and Match Error Rate (MER)<br>
  from any reference / hypothesis manifest — no audio, no models, no private data required.
</p>

<br>

---

## 🗂️ Table of Contents

- [Overview](#️-overview)
- [Quick Links](#-quick-links)
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

| Resource | Status | Link |
|----------|--------|------|
| 📄 **Paper (PDF)** | Not yet public | — |
| 🤗 **Model Checkpoints** | Not released | — |
| 📊 **Research Dataset** | Not released | — |
| 🐳 **Docker Image** | `latentcontext/did-the-word-survive` | [Docker Hub →](https://hub.docker.com/) |
| 🤖 **ASR Model Used** | OpenAI Whisper | [github.com/openai/whisper →](https://github.com/openai/whisper) |
| 💻 **Source Code (demo)** | Public | [This repository →](https://github.com/LatentContext/did-the-word-survive) |

> [!NOTE]
> The paper, model checkpoints, and research dataset are associated with ongoing work and are not available in this public demo repository. This demo operates only on synthetic, invented text pairs.

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
