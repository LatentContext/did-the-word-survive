"""Standard text evaluation metrics for demonstration workflows.

Implements standard Levenshtein edit distance calculations for:
- Word Error Rate (WER): (S + D + I) / N_ref
- Character Error Rate (CER): (S_char + D_char + I_char) / N_char_ref
- Match Error Rate (MER): (S + D + I) / (H + S + D + I)

Handles edge cases (empty strings, pure insertions, perfect matches) explicitly.
"""

from __future__ import annotations

import re
import string
from typing import Any, Dict, List, Sequence, Tuple


def normalize_text(
    text: str,
    lowercase: bool = True,
    strip_punctuation: bool = True
) -> str:
    """Normalize text by converting to lowercase and stripping punctuation.

    Args:
        text: Input string.
        lowercase: Whether to convert text to lowercase.
        strip_punctuation: Whether to remove punctuation marks.

    Returns:
        Cleaned, normalized string with single space separation.
    """
    if not text:
        return ""

    normalized = text
    if lowercase:
        normalized = normalized.lower()

    if strip_punctuation:
        # Replace punctuation characters with whitespace
        punct_pattern = f"[{re.escape(string.punctuation)}]"
        normalized = re.sub(punct_pattern, " ", normalized)

    # Collapse consecutive whitespace characters
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def levenshtein_edit_counts(
    ref_tokens: Sequence[str],
    hyp_tokens: Sequence[str]
) -> Tuple[int, int, int, int]:
    """Compute standard Levenshtein alignment edit counts.

    Args:
        ref_tokens: Sequence of reference tokens (words or characters).
        hyp_tokens: Sequence of hypothesis tokens (words or characters).

    Returns:
        Tuple of (hits, substitutions, deletions, insertions).
    """
    n_ref = len(ref_tokens)
    n_hyp = len(hyp_tokens)

    # Cost table
    dp = [[0] * (n_hyp + 1) for _ in range(n_ref + 1)]
    for i in range(n_ref + 1):
        dp[i][0] = i
    for j in range(n_hyp + 1):
        dp[0][j] = j

    for i in range(1, n_ref + 1):
        for j in range(1, n_hyp + 1):
            if ref_tokens[i - 1] == hyp_tokens[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                cost_sub = dp[i - 1][j - 1] + 1
                cost_del = dp[i - 1][j] + 1
                cost_ins = dp[i][j - 1] + 1
                dp[i][j] = min(cost_sub, cost_del, cost_ins)

    # Backtrace to count operations
    i, j = n_ref, n_hyp
    hits = 0
    subs = 0
    dels = 0
    ins = 0

    while i > 0 or j > 0:
        if i > 0 and j > 0 and ref_tokens[i - 1] == hyp_tokens[j - 1]:
            hits += 1
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            subs += 1
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            dels += 1
            i -= 1
        else:
            ins += 1
            j -= 1

    return hits, subs, dels, ins


def compute_wer(
    reference: str,
    hypothesis: str,
    normalize: bool = True
) -> float:
    """Compute Word Error Rate (WER) between reference and hypothesis.

    WER = (S + D + I) / N_ref

    Args:
        reference: Reference transcript string.
        hypothesis: Hypothesis transcript string.
        normalize: Whether to apply text normalization prior to tokenization.

    Returns:
        Fractional error rate (0.0 to float). If reference is empty:
        - returns 0.0 if hypothesis is also empty
        - returns 1.0 if hypothesis contains inserted words
    """
    if normalize:
        ref_text = normalize_text(reference)
        hyp_text = normalize_text(hypothesis)
    else:
        ref_text = reference.strip()
        hyp_text = hypothesis.strip()

    ref_words = ref_text.split() if ref_text else []
    hyp_words = hyp_text.split() if hyp_text else []

    if not ref_words:
        return 0.0 if not hyp_words else 1.0

    _, subs, dels, ins = levenshtein_edit_counts(ref_words, hyp_words)
    return (subs + dels + ins) / len(ref_words)


def compute_cer(
    reference: str,
    hypothesis: str,
    normalize: bool = True
) -> float:
    """Compute Character Error Rate (CER) between reference and hypothesis.

    CER = (S_char + D_char + I_char) / N_char_ref

    Args:
        reference: Reference transcript string.
        hypothesis: Hypothesis transcript string.
        normalize: Whether to apply text normalization prior to tokenization.

    Returns:
        Fractional character error rate. If reference is empty:
        - returns 0.0 if hypothesis is also empty
        - returns 1.0 if hypothesis contains characters
    """
    if normalize:
        ref_text = normalize_text(reference)
        hyp_text = normalize_text(hypothesis)
    else:
        ref_text = reference
        hyp_text = hypothesis

    ref_chars = list(ref_text)
    hyp_chars = list(hyp_text)

    if not ref_chars:
        return 0.0 if not hyp_chars else 1.0

    _, subs, dels, ins = levenshtein_edit_counts(ref_chars, hyp_chars)
    return (subs + dels + ins) / len(ref_chars)


def compute_mer(
    reference: str,
    hypothesis: str,
    normalize: bool = True
) -> float:
    """Compute Match Error Rate (MER) between reference and hypothesis.

    MER = (S + D + I) / (H + S + D + I)

    Args:
        reference: Reference transcript string.
        hypothesis: Hypothesis transcript string.
        normalize: Whether to apply text normalization prior to tokenization.

    Returns:
        Fractional error rate relative to total alignment steps.
        Returns 0.0 if both sequences are empty.
    """
    if normalize:
        ref_text = normalize_text(reference)
        hyp_text = normalize_text(hypothesis)
    else:
        ref_text = reference.strip()
        hyp_text = hypothesis.strip()

    ref_words = ref_text.split() if ref_text else []
    hyp_words = hyp_text.split() if hyp_text else []

    if not ref_words and not hyp_words:
        return 0.0

    hits, subs, dels, ins = levenshtein_edit_counts(ref_words, hyp_words)
    total_alignment = hits + subs + dels + ins
    if total_alignment == 0:
        return 0.0
    return (subs + dels + ins) / total_alignment


def evaluate_pair(
    reference: str,
    hypothesis: str,
    normalize: bool = True
) -> Dict[str, Any]:
    """Evaluate a single reference and hypothesis pair across all metrics.

    Args:
        reference: Reference string.
        hypothesis: Hypothesis string.
        normalize: Whether to normalize strings before comparison.

    Returns:
        Dictionary of token lengths, counts, and calculated rates.
    """
    ref_norm = normalize_text(reference) if normalize else reference.strip()
    hyp_norm = normalize_text(hypothesis) if normalize else hypothesis.strip()

    ref_words = ref_norm.split() if ref_norm else []
    hyp_words = hyp_norm.split() if hyp_norm else []

    hits, subs, dels, ins = levenshtein_edit_counts(ref_words, hyp_words)
    edits = subs + dels + ins
    ref_len = len(ref_words)
    total_align = hits + subs + dels + ins

    wer = (edits / ref_len) if ref_len > 0 else (0.0 if not hyp_words else 1.0)
    mer = (edits / total_align) if total_align > 0 else 0.0
    cer = compute_cer(reference, hypothesis, normalize=normalize)

    return {
        "reference": reference,
        "hypothesis": hypothesis,
        "normalized_reference": ref_norm,
        "normalized_hypothesis": hyp_norm,
        "ref_word_count": ref_len,
        "hyp_word_count": len(hyp_words),
        "hits": hits,
        "substitutions": subs,
        "deletions": dels,
        "insertions": ins,
        "total_word_edits": edits,
        "wer": wer,
        "cer": cer,
        "mer": mer,
    }


def aggregate_metrics(
    evaluations: Sequence[Dict[str, Any]]
) -> Dict[str, Any]:
    """Aggregate a sequence of item evaluations into summary micro and macro scores.

    Args:
        evaluations: List or sequence of results from evaluate_pair.

    Returns:
        Summary dictionary with counts, micro rates, and macro averages.
    """
    total_items = len(evaluations)
    if total_items == 0:
        return {
            "total_items": 0,
            "total_ref_words": 0,
            "micro_wer": 0.0,
            "micro_cer": 0.0,
            "micro_mer": 0.0,
            "macro_wer": 0.0,
            "macro_cer": 0.0,
            "macro_mer": 0.0,
        }

    total_ref_words = sum(e["ref_word_count"] for e in evaluations)
    total_word_edits = sum(e["total_word_edits"] for e in evaluations)
    total_alignments = sum(e["hits"] + e["total_word_edits"] for e in evaluations)

    micro_wer = (total_word_edits / total_ref_words) if total_ref_words > 0 else 0.0
    micro_mer = (total_word_edits / total_alignments) if total_alignments > 0 else 0.0

    # For CER micro calculation
    total_ref_chars = sum(len(e["normalized_reference"]) for e in evaluations)
    char_edits_sum = sum(
        compute_cer(e["reference"], e["hypothesis"], normalize=True) * len(e["normalized_reference"])
        for e in evaluations
    )
    micro_cer = (char_edits_sum / total_ref_chars) if total_ref_chars > 0 else 0.0

    macro_wer = sum(e["wer"] for e in evaluations) / total_items
    macro_cer = sum(e["cer"] for e in evaluations) / total_items
    macro_mer = sum(e["mer"] for e in evaluations) / total_items

    return {
        "total_items": total_items,
        "total_ref_words": total_ref_words,
        "micro_wer": micro_wer,
        "micro_cer": micro_cer,
        "micro_mer": micro_mer,
        "macro_wer": macro_wer,
        "macro_cer": macro_cer,
        "macro_mer": macro_mer,
    }
