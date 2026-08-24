#!/usr/bin/env python3
"""
text_cleanup.py — Cleans editorial voice in passage text to match Buffett's
confident, attribution-light prose style.

Operations:
  1. Strip trailing empty lines (fixes JSONL parse errors)
  2. Drop passages that are pure internal leakage (e.g. "manual editorial
     review" flags) — these never belonged in the public corpus
  3. Strip "Context: ..." suffixes (internal annotation that splits passages)
  4. Strip "Per a [Date] [Publisher] report aggregated in the public record, "
     prefixes — replace with the factual statement
  5. Strip "aggregated in the public record" hedges
  6. Strip "in this research pass" / "has not been independently confirmed"
     hedges — keep the factual claim, drop the editorial anxiety
  7. Strip "undated" / "fresh research update" internal annotations
  8. Capitalize first letter; ensure proper terminal punctuation
  9. Drop passages that become empty or too short (< 30 chars) after cleanup
"""

import json
import re
from pathlib import Path

CORPUS = Path("/home/z/my-project/upload/investorpass-founders/corpora")

# Patterns that mark a passage as pure internal leakage (DROP entire passage)
DROP_PATTERNS = [
    r"manual editorial review",
    r"flags this profile for manual",
    r"Per the brief's explicit instruction",
    r"not verified via a primary source in this pass",
    r"unconfirmed as of research date",
]

# Suffix patterns to strip (keep text before)
SUFFIX_PATTERNS = [
    r"\s*Context:.*$",                    # "Context: ..." suffix
    r"\s*Section:.*$",                    # "Section: ..." suffix
    r"\s*Outcome[^.]*\.$",               # "Outcome (X, date) of D1."
]

# Prefix patterns to strip (keep text after)
PREFIX_PATTERNS = [
    r"^Per (?:a|the) [A-Z][^.]{0,80}?report aggregated in the public record,\s*",
    r"^Per (?:a|the) [A-Z][^.]{0,80}?report,\s*",
    r"^Per (?:a|the) [A-Z][^.]{0,80}?,\s*",
    r"^Per the ledger[^.]{0,80}?,\s*",
    r"^Per [A-Z][^.]{0,60}?\s*report[^.]{0,40}?,\s*",
]

# Inline hedges to remove (replace with empty or space)
INLINE_PATTERNS = [
    (r"\s*aggregated in the public record", ""),
    (r"\s*in this research pass\.?", ""),
    (r",\s*which has not been independently confirmed[^.]*\.?", "."),
    (r"\s*has not been independently confirmed[^.]*\.?", ""),
    (r"\s*undated\.?", ""),
    (r"\s*Fresh research update[^.]*\.?", ""),
    (r"\s*this account of internal deliberations rests on anonymous sourcing[^.]*\.?", ""),
    (r"\(not verified via a primary source in this pass\)\s*", ""),
    (r"\(Dongyang, Zhejiang, China\)", "in Dongyang, Zhejiang"),
]


def clean_text(text):
    """Apply all cleanup patterns. Returns cleaned text or None to drop."""
    if not text:
        return None
    text = text.strip()

    # Drop pure-internal passages
    for pat in DROP_PATTERNS:
        if re.search(pat, text, re.I):
            return None

    # Strip suffixes (Context:, Section:, Outcome...)
    for pat in SUFFIX_PATTERNS:
        text = re.sub(pat, "", text, flags=re.I | re.DOTALL).strip()

    # Strip prefixes (Per a X report aggregated...)
    for pat in PREFIX_PATTERNS:
        text = re.sub(pat, "", text).strip()

    # Strip inline hedges
    for pat, repl in INLINE_PATTERNS:
        text = re.sub(pat, repl, text, flags=re.I).strip()

    # Fix double spaces and stray punctuation
    text = re.sub(r"\s{2,}", " ", text).strip()
    text = re.sub(r",\s*,", ",", text).strip()
    text = re.sub(r"\.\s*\.", ".", text).strip()
    text = re.sub(r"^\s*[-—]+\s*", "", text).strip()  # leading dash
    text = re.sub(r"\s*—\s*$", "", text).strip()       # trailing em-dash

    # Capitalize first letter
    if text:
        text = text[0].upper() + text[1:]

    # Ensure terminal punctuation
    if text and text[-1] not in ".!?":
        text += "."

    # Drop if too short
    if len(text) < 30:
        return None

    return text


def process_file(path):
    """Clean one JSONL file in-place."""
    records = []
    dropped = 0
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue  # skip empty lines (fixes parse errors)
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            new_passages = []
            for p in rec["passages"]:
                cleaned = clean_text(p["text"])
                if cleaned is None:
                    dropped += 1
                    continue
                p["text"] = cleaned
                new_passages.append(p)
            # Resequence
            for idx, p in enumerate(new_passages):
                p["sequence"] = idx
            rec["passages"] = new_passages
            records.append(rec)

    # Drop records with no passages after cleanup
    records = [r for r in records if r["passages"]]

    # Write back compact JSONL
    with open(path, "w") as f:
        for rec in records:
            f.write(json.dumps(rec, separators=(",", ":"),
                               ensure_ascii=False) + "\n")
    return len(records), sum(len(r["passages"]) for r in records), dropped


def main():
    total_records = 0
    total_passages = 0
    total_dropped = 0
    for path in sorted(CORPUS.glob("*.jsonl")):
        recs, pas, dropped = process_file(path)
        total_records += recs
        total_passages += pas
        total_dropped += dropped
        print(f"  {path.stem}: {recs} recs, {pas} passages, "
              f"{dropped} dropped")
    print(f"\nTOTAL: {total_records} records, {total_passages} passages, "
          f"{total_dropped} passages dropped")


if __name__ == "__main__":
    main()
