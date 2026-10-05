"""Focused unit and integration tests for the synthetic text evaluation demo."""

import json
import tempfile
import unittest
from pathlib import Path

from context_demo.cli import load_config, load_manifest, main, run_demo
from context_demo.metrics import (
    aggregate_metrics,
    compute_cer,
    compute_mer,
    compute_wer,
    evaluate_pair,
    levenshtein_edit_counts,
    normalize_text,
)


class TestMetrics(unittest.TestCase):
    """Unit tests for standard edit distance and metric functions."""

    def test_normalize_text(self):
        text = "  Hello, World!  This is... a TEST.  "
        norm = normalize_text(text)
        self.assertEqual(norm, "hello world this is a test")

        empty = normalize_text("")
        self.assertEqual(empty, "")

    def test_levenshtein_exact_match(self):
        tokens = ["word", "sequence", "test"]
        hits, subs, dels, ins = levenshtein_edit_counts(tokens, tokens)
        self.assertEqual(hits, 3)
        self.assertEqual(subs, 0)
        self.assertEqual(dels, 0)
        self.assertEqual(ins, 0)

    def test_levenshtein_substitutions_and_deletions(self):
        ref = ["the", "quick", "brown", "fox"]
        hyp = ["the", "fast", "fox"]  # 'quick' -> 'fast' (sub), 'brown' deleted
        hits, subs, dels, ins = levenshtein_edit_counts(ref, hyp)
        self.assertEqual(hits, 2)  # 'the', 'fox'
        self.assertEqual(subs, 1)  # 'quick' -> 'fast'
        self.assertEqual(dels, 1)  # 'brown'
        self.assertEqual(ins, 0)

    def test_wer_exact_match(self):
        ref = "the quick brown fox"
        hyp = "The quick brown fox!"
        self.assertEqual(compute_wer(ref, hyp, normalize=True), 0.0)

    def test_wer_known_edits(self):
        ref = "one two three four"
        hyp = "one two five four"  # 1 substitution out of 4 words
        self.assertAlmostEqual(compute_wer(ref, hyp), 0.25)

    def test_wer_empty_cases(self):
        self.assertEqual(compute_wer("", ""), 0.0)
        self.assertEqual(compute_wer("", "extra words"), 1.0)
        self.assertEqual(compute_wer("hello world", ""), 1.0)

    def test_cer_exact_and_edits(self):
        ref = "cat"
        hyp = "cat"
        self.assertEqual(compute_cer(ref, hyp), 0.0)

        hyp_sub = "bat"  # 1 char sub out of 3
        self.assertAlmostEqual(compute_cer(ref, hyp_sub), 1.0 / 3.0)

        self.assertEqual(compute_cer("", ""), 0.0)
        self.assertEqual(compute_cer("", "abc"), 1.0)

    def test_mer_properties(self):
        ref = "alpha beta gamma"
        hyp = "alpha delta gamma epsilon"  # 1 sub ('beta'->'delta'), 1 ins ('epsilon'), 2 hits ('alpha','gamma')
        # Total alignment: 2 hits + 1 sub + 0 del + 1 ins = 4. Edits: 1 sub + 1 ins = 2.
        mer = compute_mer(ref, hyp)
        self.assertAlmostEqual(mer, 2.0 / 4.0)

        # MER is always between 0.0 and 1.0
        self.assertTrue(0.0 <= mer <= 1.0)
        self.assertEqual(compute_mer("", ""), 0.0)

    def test_evaluate_pair_structure(self):
        res = evaluate_pair("hello world", "hello earth")
        self.assertIn("wer", res)
        self.assertIn("cer", res)
        self.assertIn("mer", res)
        self.assertIn("hits", res)
        self.assertEqual(res["hits"], 1)
        self.assertEqual(res["substitutions"], 1)

    def test_aggregate_metrics(self):
        pairs = [
            evaluate_pair("hello world", "hello world"),  # 0 edits, 2 words
            evaluate_pair("test case", "test error"),    # 1 sub, 2 words
        ]
        agg = aggregate_metrics(pairs)
        self.assertEqual(agg["total_items"], 2)
        self.assertEqual(agg["total_ref_words"], 4)
        self.assertAlmostEqual(agg["micro_wer"], 1.0 / 4.0)
        self.assertAlmostEqual(agg["macro_wer"], (0.0 + 0.5) / 2.0)


class TestManifestAndCLI(unittest.TestCase):
    """Tests for manifest loading, configuration parsing, and CLI commands."""

    def test_load_manifest_valid(self):
        manifest_path = Path("examples/toy_manifest.jsonl")
        self.assertTrue(manifest_path.is_file())
        records = load_manifest(manifest_path)
        self.assertGreater(len(records), 0)
        for r in records:
            self.assertIn("id", r)
            self.assertIn("reference", r)
            self.assertIn("hypothesis", r)

    def test_load_manifest_invalid(self):
        with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".jsonl") as tf:
            tf.write("not json\n")
            temp_path = Path(tf.name)
        try:
            with self.assertRaises(ValueError):
                load_manifest(temp_path)
        finally:
            temp_path.unlink()

    def test_load_config_defaults(self):
        conf = load_config(Path("non_existent_config.json"))
        self.assertTrue(conf["normalize_text"])
        self.assertIn("wer", conf["metrics"])

    def test_cli_execution_text(self):
        exit_code = main([
            "--manifest", "examples/toy_manifest.jsonl",
            "--config", "configs/demo.json",
            "--format", "text"
        ])
        self.assertEqual(exit_code, 0)

    def test_cli_execution_json(self):
        exit_code = main([
            "--manifest", "examples/toy_manifest.jsonl",
            "--config", "configs/demo.json",
            "--format", "json"
        ])
        self.assertEqual(exit_code, 0)

    def test_cli_execution_table(self):
        exit_code = main([
            "--manifest", "examples/toy_manifest.jsonl",
            "--config", "configs/demo.json",
            "--format", "table"
        ])
        self.assertEqual(exit_code, 0)

    def test_cli_missing_manifest(self):
        exit_code = main([
            "--manifest", "definitely_missing_manifest.jsonl"
        ])
        self.assertEqual(exit_code, 1)

    def test_cli_with_lexicon(self):
        exit_code = main([
            "--manifest", "examples/toy_manifest.jsonl",
            "--lexicon", "lexicons/sample_lexicon.txt",
            "--format", "table"
        ])
        self.assertEqual(exit_code, 0)


class TestPhonetics(unittest.TestCase):
    """Unit tests for Montreal Forced Aligner phonetics and lexicon utilities."""

    def test_load_lexicon(self):
        from context_demo.phonetics import load_lexicon
        lex = load_lexicon("lexicons/sample_lexicon.txt")
        self.assertIn("SPEECH", lex)
        self.assertIn("SYNTHESIS", lex)
        self.assertGreater(len(lex), 100)

    def test_clean_and_class(self):
        from context_demo.phonetics import clean_phone, get_phone_class
        self.assertEqual(clean_phone("AA1"), "AA")
        self.assertEqual(clean_phone("ER0"), "ER")
        self.assertEqual(get_phone_class("AA1"), "vowels")
        self.assertEqual(get_phone_class("T"), "plosives")
        self.assertEqual(get_phone_class("S"), "fricatives")
        self.assertEqual(get_phone_class("M"), "nasals")
        self.assertEqual(get_phone_class("L"), "approximants")

    def test_text_to_phonemes_and_per(self):
        from context_demo.phonetics import compute_per, load_lexicon, text_to_phonemes
        lex = load_lexicon("lexicons/sample_lexicon.txt")
        ref_p = text_to_phonemes("speech synthesis", lex)
        hyp_p = text_to_phonemes("speech synthesis", lex)
        per, counts = compute_per(ref_p, hyp_p)
        self.assertEqual(per, 0.0)
        self.assertEqual(counts["substitutions"], 0)

        # Test with one edit
        hyp_sub = text_to_phonemes("speech analysis", lex)
        per_sub, counts_sub = compute_per(ref_p, hyp_sub)
        self.assertGreater(per_sub, 0.0)

    def test_phonetic_class_breakdown(self):
        from context_demo.phonetics import phonetic_class_breakdown
        ref = ["S", "P", "IY1", "CH"]
        hyp = ["S", "T", "IY1", "CH"]  # P -> T (plosive sub)
        stats = phonetic_class_breakdown(ref, hyp)
        self.assertEqual(stats["fricatives"]["hits"], 2)  # S, CH
        self.assertEqual(stats["vowels"]["hits"], 1)       # IY1
        self.assertEqual(stats["plosives"]["subs"], 1)     # P -> T


if __name__ == "__main__":
    unittest.main()
