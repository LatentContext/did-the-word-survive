"""
Phonetic evaluation and Montreal Forced Alignment (MFA) diagnostics module.

Provides ARPAbet manner-of-articulation classification, pronunciation lexicon loading,
phonetic sequence conversion, and Phone Error Rate (PER) alignment computations.
"""

from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Tuple

from context_demo.metrics import levenshtein_edit_counts, normalize_text

# ARPAbet manner-of-articulation mapping
PHONE_CLASSES: Dict[str, str] = {
    # Vowels (monophthongs & diphthongs)
    "AA": "vowels", "AE": "vowels", "AH": "vowels", "AO": "vowels", "AW": "vowels",
    "AY": "vowels", "EH": "vowels", "ER": "vowels", "EY": "vowels", "IH": "vowels",
    "IY": "vowels", "OW": "vowels", "OY": "vowels", "UH": "vowels", "UW": "vowels",
    # Plosives / Stops
    "B": "plosives", "D": "plosives", "G": "plosives", "K": "plosives", "P": "plosives", "T": "plosives",
    # Fricatives & Affricates
    "CH": "fricatives", "JH": "fricatives", "DH": "fricatives", "F": "fricatives",
    "S": "fricatives", "SH": "fricatives", "TH": "fricatives", "V": "fricatives",
    "Z": "fricatives", "ZH": "fricatives",
    # Nasals
    "M": "nasals", "N": "nasals", "NG": "nasals",
    # Approximants / Liquids / Glides
    "L": "approximants", "R": "approximants", "W": "approximants", "Y": "approximants",
    # Silence / Non-speech tokens
    "SIL": "silence", "SP": "silence", "<EPS>": "silence",
}


def clean_phone(phone_token: str) -> str:
    """Strip numerical stress markers (e.g. 'AA1' -> 'AA', 'ER0' -> 'ER')."""
    return re.sub(r"\d+", "", phone_token).strip().upper()


def get_phone_class(phone_token: str) -> str:
    """Return manner-of-articulation class for a given ARPAbet phoneme."""
    cleaned = clean_phone(phone_token)
    return PHONE_CLASSES.get(cleaned, "other")


def load_lexicon(lexicon_path: Path | str) -> Dict[str, List[str]]:
    """
    Load a tab- or whitespace-separated ARPAbet pronunciation lexicon.
    
    Format:
        WORD  PHONE1 PHONE2 ...
    """
    path = Path(lexicon_path)
    if not path.is_file():
        raise FileNotFoundError(f"Lexicon file not found: {path}")

    lexicon: Dict[str, List[str]] = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if not line_str or line_str.startswith("#"):
                continue
            parts = line_str.split(None, 1)
            if len(parts) == 2:
                word = parts[0].upper()
                phones = parts[1].split()
                lexicon[word] = phones
    return lexicon


def text_to_phonemes(text: str, lexicon: Dict[str, List[str]]) -> List[str]:
    """
    Convert text string to a flat list of ARPAbet phonemes using the lexicon.
    Words missing from lexicon are preserved as bracketed tokens.
    """
    norm = normalize_text(text)
    words = norm.upper().split()
    phones: List[str] = []
    for w in words:
        if w in lexicon:
            phones.extend(lexicon[w])
        else:
            phones.append(f"[{w}]")
    return phones


def compute_per(ref_phones: List[str], hyp_phones: List[str]) -> Tuple[float, Dict[str, int]]:
    """
    Compute Phone Error Rate (PER) via Levenshtein alignment over phoneme lists.
    
    Returns:
        (per_fraction, counts_dict)
    """
    hits, subs, dels, ins = levenshtein_edit_counts(ref_phones, hyp_phones)
    edits = subs + dels + ins
    n_ref = len(ref_phones)
    per = float(edits) / float(n_ref) if n_ref > 0 else (0.0 if not hyp_phones else 1.0)
    counts = {
        "ref_phone_count": n_ref,
        "hyp_phone_count": len(hyp_phones),
        "hits": hits,
        "substitutions": subs,
        "deletions": dels,
        "insertions": ins,
        "total_phone_edits": edits,
    }
    return per, counts


def phonetic_class_breakdown(
    ref_phones: List[str], hyp_phones: List[str]
) -> Dict[str, Dict[str, int]]:
    """
    Perform DP alignment on phonemes and bucket substitutions, deletions,
    and hits by reference phone's manner-of-articulation class.
    """
    n, m = len(ref_phones), len(hyp_phones)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if clean_phone(ref_phones[i - 1]) == clean_phone(hyp_phones[j - 1]):
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])

    # Backtrack alignment path
    i, j = n, m
    class_stats: Dict[str, Dict[str, int]] = {
        "vowels": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
        "plosives": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
        "fricatives": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
        "nasals": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
        "approximants": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
        "other": {"hits": 0, "subs": 0, "dels": 0, "total": 0},
    }

    while i > 0 or j > 0:
        if i > 0 and j > 0 and clean_phone(ref_phones[i - 1]) == clean_phone(hyp_phones[j - 1]):
            c = get_phone_class(ref_phones[i - 1])
            bucket = class_stats.get(c, class_stats["other"])
            bucket["hits"] += 1
            bucket["total"] += 1
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            c = get_phone_class(ref_phones[i - 1])
            bucket = class_stats.get(c, class_stats["other"])
            bucket["subs"] += 1
            bucket["total"] += 1
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            c = get_phone_class(ref_phones[i - 1])
            bucket = class_stats.get(c, class_stats["other"])
            bucket["dels"] += 1
            bucket["total"] += 1
            i -= 1
        else:
            j -= 1

    return class_stats
