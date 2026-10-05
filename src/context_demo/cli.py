"""Command-line interface for the synthetic text evaluation demo.

Operates purely on synthetic toy text pairs. Uses standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from context_demo.metrics import aggregate_metrics, evaluate_pair, normalize_text
from context_demo.phonetics import (
    compute_per,
    load_lexicon,
    phonetic_class_breakdown,
    text_to_phonemes,
)


def load_config(config_path: Optional[Path]) -> Dict[str, Any]:
    """Load configuration dictionary from JSON file if provided.

    Args:
        config_path: Path to optional JSON config file.

    Returns:
        Configuration dictionary with fallback defaults.
    """
    defaults = {
        "pipeline_name": "text_evaluation_demo",
        "normalize_text": True,
        "lowercase": True,
        "strip_punctuation": True,
        "metrics": ["wer", "cer", "mer"],
        "display_percentages": True,
    }

    if config_path and config_path.is_file():
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                user_conf = json.load(f)
                defaults.update(user_conf)
        except Exception as e:
            print(f"[Warning] Failed to parse config {config_path}: {e}. Using defaults.", file=sys.stderr)

    return defaults


def load_manifest(manifest_path: Path) -> List[Dict[str, Any]]:
    """Load and validate synthetic samples from JSON Lines manifest.

    Args:
        manifest_path: Path to the JSONL manifest file.

    Returns:
        List of verified record dictionaries.

    Raises:
        FileNotFoundError: If manifest file does not exist.
        ValueError: If file is empty or records lack required keys.
    """
    if not manifest_path.is_file():
        raise FileNotFoundError(f"Manifest file not found: {manifest_path}")

    records = []
    with open(manifest_path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line_str = line.strip()
            if not line_str:
                continue
            try:
                rec = json.loads(line_str)
            except json.JSONDecodeError as err:
                raise ValueError(f"Line {line_no} in {manifest_path} is invalid JSON: {err}") from err

            if not isinstance(rec, dict):
                raise ValueError(f"Line {line_no} is not a JSON object")

            for required_key in ("id", "reference", "hypothesis"):
                if required_key not in rec:
                    raise ValueError(f"Record at line {line_no} missing required key: '{required_key}'")

            records.append({
                "id": str(rec["id"]),
                "reference": str(rec["reference"]),
                "hypothesis": str(rec["hypothesis"]),
            })

    if not records:
        raise ValueError(f"Manifest file is empty: {manifest_path}")

    return records


def format_rate(rate: float, as_percentage: bool = True) -> str:
    """Format an error rate float as a percentage or decimal string.

    Args:
        rate: Floating point rate.
        as_percentage: Whether to format as percentage (e.g. 12.5%) or decimal (0.1250).

    Returns:
        Formatted string.
    """
    if as_percentage:
        return f"{rate * 100:.1f}%"
    return f"{rate:.4f}"


def run_demo(
    manifest_path: Path,
    config_path: Optional[Path] = None,
    output_format: str = "text",
    lexicon_path: Optional[Path] = None
) -> Dict[str, Any]:
    """Execute evaluation on a synthetic manifest and return structured results.

    Args:
        manifest_path: Path to synthetic demo manifest.
        config_path: Path to demo configuration.
        output_format: Output format ('text', 'json', or 'table').
        lexicon_path: Optional path to ARPAbet pronunciation lexicon.

    Returns:
        Dictionary containing summary and item-level evaluation results.
    """
    config = load_config(config_path)
    records = load_manifest(manifest_path)

    normalize = bool(config.get("normalize_text", True))
    as_pct = bool(config.get("display_percentages", True))

    lexicon = load_lexicon(lexicon_path) if lexicon_path and lexicon_path.is_file() else None

    evaluated_items = []
    for rec in records:
        ev = evaluate_pair(rec["reference"], rec["hypothesis"], normalize=normalize)
        ev["id"] = rec["id"]

        if lexicon:
            ref_phones = text_to_phonemes(rec["reference"], lexicon)
            hyp_phones = text_to_phonemes(rec["hypothesis"], lexicon)
            per, p_counts = compute_per(ref_phones, hyp_phones)
            ev["per"] = per
            ev["ref_phone_count"] = p_counts["ref_phone_count"]
            ev["hyp_phone_count"] = p_counts["hyp_phone_count"]
            ev["phone_hits"] = p_counts["hits"]
            ev["phone_subs"] = p_counts["substitutions"]
            ev["phone_dels"] = p_counts["deletions"]
            ev["phone_ins"] = p_counts["insertions"]
            ev["class_breakdown"] = phonetic_class_breakdown(ref_phones, hyp_phones)

        evaluated_items.append(ev)

    summary = aggregate_metrics(evaluated_items)

    if lexicon:
        total_p_ref = sum(it.get("ref_phone_count", 0) for it in evaluated_items)
        total_p_edits = sum(
            it.get("phone_subs", 0) + it.get("phone_dels", 0) + it.get("phone_ins", 0)
            for it in evaluated_items
        )
        summary["total_ref_phones"] = total_p_ref
        summary["micro_per"] = (float(total_p_edits) / float(total_p_ref)) if total_p_ref > 0 else 0.0
        summary["macro_per"] = (
            sum(it.get("per", 0.0) for it in evaluated_items) / float(len(evaluated_items))
        ) if evaluated_items else 0.0

    result = {
        "title": "Synthetic Text Evaluation Demo",
        "scope": "Generic demonstration utilities operating on synthetic text pairs only",
        "manifest": str(manifest_path),
        "config": str(config_path) if config_path else "default",
        "lexicon": str(lexicon_path) if lexicon_path else None,
        "summary": summary,
        "items": evaluated_items,
    }

    if output_format == "json":
        print(json.dumps(result, indent=2))
    elif output_format == "table":
        sep_len = 90 if lexicon else 78
        print("=" * sep_len)
        print("  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)")
        print("=" * sep_len)
        print(f"Manifest: {manifest_path} ({len(records)} records)")
        if lexicon:
            print(f"Lexicon : {lexicon_path} ({len(lexicon)} words)")
        print("-" * sep_len)
        if lexicon:
            print(f"{'Sample ID':<18} | {'Ref W':>5} | {'WER':>7} | {'CER':>7} | {'MER':>7} | {'PER':>7} | {'Ref P':>5} | {'H/S/D/I':>9}")
        else:
            print(f"{'Sample ID':<18} | {'Ref Words':>9} | {'WER':>8} | {'CER':>8} | {'MER':>8} | {'H/S/D/I':>9}")
        print("-" * sep_len)
        for it in evaluated_items:
            counts = f"{it['hits']}/{it['substitutions']}/{it['deletions']}/{it['insertions']}"
            wer_str = format_rate(it["wer"], as_pct)
            cer_str = format_rate(it["cer"], as_pct)
            mer_str = format_rate(it["mer"], as_pct)
            if lexicon:
                per_str = format_rate(it.get("per", 0.0), as_pct)
                print(f"{it['id']:<18} | {it['ref_word_count']:>5} | {wer_str:>7} | {cer_str:>7} | {mer_str:>7} | {per_str:>7} | {it.get('ref_phone_count', 0):>5} | {counts:>9}")
            else:
                print(f"{it['id']:<18} | {it['ref_word_count']:>9} | {wer_str:>8} | {cer_str:>8} | {mer_str:>8} | {counts:>9}")
        print("-" * sep_len)
        print("Summary Averages:")
        print(f"  Micro WER: {format_rate(summary['micro_wer'], as_pct)}  |  Macro WER: {format_rate(summary['macro_wer'], as_pct)}")
        print(f"  Micro CER: {format_rate(summary['micro_cer'], as_pct)}  |  Macro CER: {format_rate(summary['macro_cer'], as_pct)}")
        print(f"  Micro MER: {format_rate(summary['micro_mer'], as_pct)}  |  Macro MER: {format_rate(summary['macro_mer'], as_pct)}")
        if lexicon:
            print(f"  Micro PER: {format_rate(summary['micro_per'], as_pct)}  |  Macro PER: {format_rate(summary['macro_per'], as_pct)}")
        print("=" * sep_len)
    else:  # 'text'
        print("=" * 72)
        print("  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)")
        print("=" * 72)
        print(f"Evaluated {len(records)} synthetic sample records from {manifest_path}")
        if lexicon:
            print(f"Loaded ARPAbet pronunciation lexicon: {lexicon_path} ({len(lexicon)} words)")
        print("-" * 72)
        for it in evaluated_items:
            print(f"[{it['id']}]")
            print(f"  Reference : \"{it['reference']}\"")
            print(f"  Hypothesis: \"{it['hypothesis']}\"")
            score_line = f"WER={format_rate(it['wer'], as_pct)} | CER={format_rate(it['cer'], as_pct)} | MER={format_rate(it['mer'], as_pct)}"
            if lexicon:
                score_line += f" | PER={format_rate(it.get('per', 0.0), as_pct)}"
            print(f"  Scores    : {score_line}")
            print(f"  Edits     : Hits={it['hits']}, Subs={it['substitutions']}, Dels={it['deletions']}, Ins={it['insertions']}")
            print()
        print("-" * 72)
        print("AGGREGATE METRICS (SYNTHETIC SAMPLE MEDIAN/AVERAGES):")
        print(f"  Total Reference Words : {summary['total_ref_words']}")
        if lexicon:
            print(f"  Total Reference Phones: {summary.get('total_ref_phones', 0)}")
        print(f"  Overall Micro WER     : {format_rate(summary['micro_wer'], as_pct)}")
        print(f"  Overall Micro CER     : {format_rate(summary['micro_cer'], as_pct)}")
        print(f"  Overall Micro MER     : {format_rate(summary['micro_mer'], as_pct)}")
        if lexicon:
            print(f"  Overall Micro PER     : {format_rate(summary['micro_per'], as_pct)}")
        print(f"  Overall Macro WER     : {format_rate(summary['macro_wer'], as_pct)}")
        if lexicon:
            print(f"  Overall Macro PER     : {format_rate(summary['macro_per'], as_pct)}")
        print("=" * 72)

    return result


def main(argv: Optional[List[str]] = None) -> int:
    """CLI entrypoint."""
    parser = argparse.ArgumentParser(
        prog="context-demo",
        description="Minimal demonstration of text-based evaluation utilities."
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("examples/toy_manifest.jsonl"),
        help="Path to synthetic demo manifest (JSONL format)."
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=Path("configs/demo.json"),
        help="Path to demo configuration JSON file."
    )
    parser.add_argument(
        "--lexicon",
        type=Path,
        default=None,
        help="Optional path to ARPAbet pronunciation lexicon file."
    )
    parser.add_argument(
        "--format",
        choices=["text", "table", "json"],
        default="text",
        help="Output format (default: text)."
    )

    args = parser.parse_args(argv)

    try:
        run_demo(
            manifest_path=args.manifest,
            config_path=args.config,
            output_format=args.format,
            lexicon_path=args.lexicon
        )
        return 0
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
