#!/usr/bin/env bash
# ==============================================================================
# setup_mfa.sh - Montreal Forced Aligner (MFA) Setup & Alignment Pipeline
# ==============================================================================
# This script provisions Montreal Forced Aligner (MFA) v2/v3, downloads the
# standard english_us_arpa acoustic model and dictionary, and provides the
# workflow to validate corpora and generate phoneme-aligned TextGrids.
#
# Usage:
#   bash scripts/setup_mfa.sh [check|install|download|validate|align]
# ==============================================================================

set -euo pipefail

MFA_ENV="${MFA_ENV:-mfa}"
ACOUSTIC_MODEL="english_us_arpa"
DICTIONARY="english_us_arpa"
NUM_JOBS="${NUM_JOBS:-4}"

ACTION="${1:-check}"

echo "=============================================================================="
echo "  Montreal Forced Aligner (MFA) Setup Script"
echo "  Target Acoustic Model: ${ACOUSTIC_MODEL}"
echo "  Target Dictionary    : ${DICTIONARY}"
echo "=============================================================================="

case "${ACTION}" in
    install)
        echo "[+] Setting up Conda environment '${MFA_ENV}' with Montreal Forced Aligner..."
        if command -v conda &>/dev/null; then
            conda create -n "${MFA_ENV}" -c conda-forge montreal-forced-aligner kaldi -y
            echo "[✓] MFA environment created successfully."
            echo "    Activate with: conda activate ${MFA_ENV}"
        else
            echo "[!] Conda not found in PATH. Please install Miniconda or Anaconda first:"
            echo "    https://docs.conda.io/en/latest/miniconda.html"
            exit 1
        fi
        ;;

    download)
        echo "[+] Downloading pretrained acoustic model and pronunciation dictionary..."
        mfa model download acoustic "${ACOUSTIC_MODEL}"
        mfa model download dictionary "${DICTIONARY}"
        echo "[✓] Downloaded MFA acoustic model: ${ACOUSTIC_MODEL}"
        echo "[✓] Downloaded MFA dictionary    : ${DICTIONARY}"
        ;;

    validate)
        CORPUS_DIR="${2:-data/raw}"
        LEXICON_FILE="${3:-lexicons/sample_lexicon.txt}"
        echo "[+] Validating corpus in '${CORPUS_DIR}' against '${LEXICON_FILE}'..."
        mfa validate "${CORPUS_DIR}" "${LEXICON_FILE}" "${ACOUSTIC_MODEL}" --clean
        echo "[✓] Corpus validation completed."
        ;;

    align)
        CORPUS_DIR="${2:-data/raw}"
        LEXICON_FILE="${3:-lexicons/sample_lexicon.txt}"
        OUTPUT_DIR="${4:-outputs/textgrids}"
        echo "[+] Running Montreal Forced Alignment..."
        echo "    Corpus : ${CORPUS_DIR}"
        echo "    Lexicon: ${LEXICON_FILE}"
        echo "    Output : ${OUTPUT_DIR}"
        echo "    Jobs   : ${NUM_JOBS}"
        mkdir -p "${OUTPUT_DIR}"
        mfa align "${CORPUS_DIR}" "${LEXICON_FILE}" "${ACOUSTIC_MODEL}" "${OUTPUT_DIR}" \
            --clean \
            --num_jobs "${NUM_JOBS}"
        echo "[✓] Forced alignment completed. Generated TextGrid intervals in: ${OUTPUT_DIR}"
        ;;

    check|*)
        echo "[+] Inspecting local MFA installation status:"
        if command -v mfa &>/dev/null; then
            echo "[✓] MFA binary found: $(command -v mfa)"
            mfa version || true
        else
            echo "[!] MFA CLI not found in current PATH."
            echo "    To install:  bash scripts/setup_mfa.sh install"
            echo "    Or manually: conda create -n mfa -c conda-forge montreal-forced-aligner -y"
        fi
        echo ""
        echo "Available local lexicons:"
        ls -lh lexicons/
        echo ""
        echo "Available test manifests:"
        ls -lh examples/
        ;;
esac
