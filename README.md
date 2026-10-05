# Did The Word Survive

This repository provides a small text-based demonstration of configuration and evaluation utilities for speech-research workflows. It includes generic settings, synthetic examples, and a runnable command-line demo.

## Overview

This repository demonstrates lightweight text-based error rate computation (Word Error Rate, Character Error Rate, and Match Error Rate) using standard edit-distance alignments. It does not provide model checkpoints, audio processing pipelines, or experimental reproduction data.

## Installation

The demo runs using standard Python (3.9+) with no external dependencies required:

```bash
git clone https://github.com/LatentContext/did-the-word-survive.git
cd did-the-word-survive
pip install -e .
```

Alternatively, the demo can be executed directly using Python without package installation:

```bash
python3 src/context_demo/cli.py --manifest examples/toy_manifest.jsonl --config configs/demo.json
```

## Example Usage

Run the demonstration evaluation over the included synthetic manifest:

```bash
context-demo --manifest examples/toy_manifest.jsonl --config configs/demo.json --format text
```

You can also output structured JSON:

```bash
context-demo --manifest examples/toy_manifest.jsonl --config configs/demo.json --format json
```

Or view results in tabular form:

```bash
context-demo --manifest examples/toy_manifest.jsonl --config configs/demo.json --format table
```

## Repository Structure

- `configs/`: Generic configuration options defining text normalization and evaluation parameters.
- `examples/`: Sample manifest files containing invented toy text pairs.
- `schemas/`: JSON schema defining the required structure for input manifest records.
- `src/context_demo/`: Implementation of standard Levenshtein-based edit distance metrics and CLI driver.
- `tests/`: Unit tests verifying metric computations, edge cases, and CLI operations.

## Note on Synthetic Data

All reference and hypothesis pairs in `examples/` are synthetic, newly invented sample sentences intended solely to verify metric computation. They do not represent real speech corpus transcripts, model outputs, or experimental measurements.
