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
    output_format: str = "text"
) -> Dict[str, Any]:
    """Execute evaluation on a synthetic manifest and return structured results.

    Args:
        manifest_path: Path to synthetic demo manifest.
        config_path: Path to demo configuration.
        output_format: Output format ('text', 'json', or 'table').

    Returns:
        Dictionary containing summary and item-level evaluation results.
    """
    config = load_config(config_path)
    records = load_manifest(manifest_path)

    normalize = bool(config.get("normalize_text", True))
    as_pct = bool(config.get("display_percentages", True))

    evaluated_items = []
    for rec in records:
        ev = evaluate_pair(rec["reference"], rec["hypothesis"], normalize=normalize)
        ev["id"] = rec["id"]
        evaluated_items.append(ev)

    summary = aggregate_metrics(evaluated_items)

    result = {
        "title": "Synthetic Text Evaluation Demo",
        "scope": "Generic demonstration utilities operating on synthetic text pairs only",
        "manifest": str(manifest_path),
        "config": str(config_path) if config_path else "default",
        "summary": summary,
        "items": evaluated_items,
    }

    if output_format == "json":
        print(json.dumps(result, indent=2))
    elif output_format == "table":
        print("=" * 78)
        print("  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)")
        print("=" * 78)
        print(f"Manifest: {manifest_path} ({len(records)} records)")
        print("-" * 78)
        print(f"{'Sample ID':<18} | {'Ref Words':>9} | {'WER':>8} | {'CER':>8} | {'MER':>8} | {'H/S/D/I':>9}")
        print("-" * 78)
        for it in evaluated_items:
            counts = f"{it['hits']}/{it['substitutions']}/{it['deletions']}/{it['insertions']}"
            wer_str = format_rate(it["wer"], as_pct)
            cer_str = format_rate(it["cer"], as_pct)
            mer_str = format_rate(it["mer"], as_pct)
            print(f"{it['id']:<18} | {it['ref_word_count']:>9} | {wer_str:>8} | {cer_str:>8} | {mer_str:>8} | {counts:>9}")
        print("-" * 78)
        print("Summary Averages:")
        print(f"  Micro WER: {format_rate(summary['micro_wer'], as_pct)}  |  Macro WER: {format_rate(summary['macro_wer'], as_pct)}")
        print(f"  Micro CER: {format_rate(summary['micro_cer'], as_pct)}  |  Macro CER: {format_rate(summary['macro_cer'], as_pct)}")
        print(f"  Micro MER: {format_rate(summary['micro_mer'], as_pct)}  |  Macro MER: {format_rate(summary['macro_mer'], as_pct)}")
        print("=" * 78)
    else:  # 'text'
        print("=" * 72)
        print("  SYNTHETIC TEXT EVALUATION DEMO (TOY DATA ONLY)")
        print("=" * 72)
        print(f"Evaluated {len(records)} synthetic sample records from {manifest_path}")
        print("-" * 72)
        for it in evaluated_items:
            print(f"[{it['id']}]")
            print(f"  Reference : \"{it['reference']}\"")
            print(f"  Hypothesis: \"{it['hypothesis']}\"")
            print(f"  Scores    : WER={format_rate(it['wer'], as_pct)} | CER={format_rate(it['cer'], as_pct)} | MER={format_rate(it['mer'], as_pct)}")
            print(f"  Edits     : Hits={it['hits']}, Subs={it['substitutions']}, Dels={it['deletions']}, Ins={it['insertions']}")
            print()
        print("-" * 72)
        print("AGGREGATE METRICS (SYNTHETIC SAMPLE MEDIAN/AVERAGES):")
        print(f"  Total Reference Words : {summary['total_ref_words']}")
        print(f"  Overall Micro WER     : {format_rate(summary['micro_wer'], as_pct)}")
        print(f"  Overall Micro CER     : {format_rate(summary['micro_cer'], as_pct)}")
        print(f"  Overall Micro MER     : {format_rate(summary['micro_mer'], as_pct)}")
        print(f"  Overall Macro WER     : {format_rate(summary['macro_wer'], as_pct)}")
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
            output_format=args.format
        )
        return 0
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
