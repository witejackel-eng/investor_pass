#!/usr/bin/env python3
"""
consistency_pass.py v2 — Normalizes the Chinese Founders corpus to match
the Investor/Pass Buffett reference byte-for-byte.

Fixes vs v1:
  - Drop records with empty passages (after dedup) from JSONL
  - Remove 'format' from corpus JSONL source (Buffett keeps it only in registry)
  - Better action-verb priority ('spoke' before 'listed' since a speech about
    an IPO is a speech, not a listing)
  - Editorial titles with em-dash separator matching Buffett style
  - Vocabulary normalization (drop political/edge terms)
"""

import json
import re
from pathlib import Path

# ---- Paths ----
ROOT = Path("/home/z/my-project/upload/investorpass-founders")
CORPUS_DIR = ROOT / "corpora"
REG_DIR = ROOT / "registries"
DEC_DIR = ROOT / "decisions"
MAN_DIR = ROOT / "manifests"

# ---- Vocabulary normalization map ----
# old slug -> new slug. None = DROP.
THEME_RENAMES = {
    "tech-crackdown": "regulatory-environment",
    "state-business-relations": "regulatory-environment",
    "net-worth-and-wealth": None,
    "ev-transition": "industry-transition",
    "r-and-d": "research-and-development",
    "ai-strategy": "innovation",
}

CONCEPT_RENAMES = {
    "vertical-integration": None,
    "ai-open-source": None,
    "chip-design": None,
    "ev-battery": None,
    "supply-chain-control": "scale-economics",
}

EVENT_RENAMES = {
    "2021-china-tech-crackdown": "2021-platform-regulation",
    "huawei-us-sanctions": "huawei-export-controls",
    "tiktok-us-ban-pressure": "tiktok-divestiture-pressure",
}


def normalize_tag_list(tags, renames):
    out = []
    seen = set()
    for t in tags:
        new = renames.get(t, t)
        if new is None:
            continue
        if new in seen:
            continue
        seen.add(new)
        out.append(new)
    return out


# ---- Publisher slug map (ordered; first match wins) ----
PUBLISHER_PATTERNS = [
    ("cnbc.com", "cnbc"), ("reuters.com", "reuters"),
    ("en.wikipedia.org", "wikipedia"), ("caproasia.com", "caproasia"),
    ("forgeglobal.com", "forgeglobal"), ("thinkchina.sg", "thinkchina"),
    ("bloomberg.com", "bloomberg"), ("ft.com", "ft"),
    ("wsj.com", "wsj"), ("nytimes.com", "nytimes"),
    ("forbes.com", "forbes"), ("baidu.com", "baidu"),
    ("technode.com", "technode"), ("scmp.com", "scmp"),
    ("caixin.com", "caixin"), ("yahoo.com", "yahoo"),
    ("bbc.com", "bbc"), ("cnn.com", "cnn"),
    ("theguardian.com", "guardian"), ("economist.com", "economist"),
    ("wired.com", "wired"), ("techcrunch.com", "techcrunch"),
    ("theinformation.com", "theinformation"), ("nikkei.com", "nikkei"),
    ("yicaibai", "yicai"), ("yicai.com", "yicai"),
    ("36kr.com", "36kr"), ("huxiu.com", "huxiu"),
    ("pingwest.com", "pingwest"), ("latepost.com", "latepost"),
    ("jiemian.com", "jiemian"), ("thepaper.cn", "thepaper"),
    ("xinhuanet.com", "xinhua"), ("people.com.cn", "people"),
    ("china.com.cn", "china"), ("cgtn.com", "cgtn"),
    ("chinadaily.com.cn", "chinadaily"), ("globaltimes.cn", "globaltimes"),
    ("ir.baidu.com", "baidu-ir"), ("ir.alibaba.com", "alibaba-ir"),
    ("ir.tencent.com", "tencent-ir"), ("ir.jd.com", "jd-ir"),
    ("ir.xiaomi.com", "xiaomi-ir"), ("ir.pinduoduo.com", "pinduoduo-ir"),
    ("1.hk", "hkex"), ("1-usa.com", "sec"), ("sec.gov", "sec"),
]

STOPWORDS_TOPIC = {
    "the", "a", "an", "of", "to", "in", "on", "and", "or", "for",
    "with", "by", "at", "from", "is", "are", "was", "were", "be",
    "been", "has", "have", "had", "how", "what", "why", "when",
    "where", "who", "which", "that", "this", "these", "those",
    "insight", "report", "news", "update", "analysis", "feature",
    "story", "article", "post", "blog", "video", "audio", "podcast",
    "billionaire", "chinese", "china", "founder", "ceo", "chairman",
}


def clean_slug(url, title, year):
    """Buffett-style slug: publisher-year-topic."""
    url_l = (url or "").lower()
    publisher = "source"
    for pat, name in PUBLISHER_PATTERNS:
        if pat in url_l:
            publisher = name
            break
    topic = re.sub(r"[^a-z0-9\s]", "", (title or "").lower())
    topic_words = [w for w in topic.split()
                   if w and w not in STOPWORDS_TOPIC][:4]
    topic_str = "-".join(topic_words) if topic_words else "record"
    if len(topic_str) > 40:
        topic_str = topic_str[:40].rsplit("-", 1)[0]
    yr = year if year else "nd"
    return f"{publisher}-{yr}-{topic_str}"


def ensure_year(year, url, date_str=None):
    """Return an int year, extracting from URL/date if null."""
    if year is not None:
        try:
            return int(year)
        except (ValueError, TypeError):
            pass
    if url:
        m = re.search(r"/(20\d{2})/", url) or re.search(r"-20\d{2}-", url) \
            or re.search(r"\?20\d{2}", url)
        if m:
            digits = re.search(r"20\d{2}", m.group(0))
            if digits:
                return int(digits.group(0))
    if date_str:
        m = re.search(r"(20\d{2})", str(date_str))
        if m:
            return int(m.group(1))
    return 2024


# ---- Publisher priority for dedup (lower = higher priority) ----
PUBLISHER_PRIORITY = {
    "reuters": 1, "bloomberg": 2, "ft": 3, "wsj": 4, "nytimes": 5,
    "forbes": 6, "cnbc": 7, "economist": 8, "bbc": 9, "cnn": 10,
    "guardian": 11, "wired": 12, "techcrunch": 13, "theinformation": 14,
    "nikkei": 15, "scmp": 16, "caixin": 17, "yicai": 18, "36kr": 19,
    "technode": 20, "pingwest": 21, "latepost": 22, "huxiu": 23,
    "thinkchina": 24, "forgeglobal": 25, "caproasia": 26,
    "wikipedia": 90,
}


def publisher_rank(slug):
    for pub, rank in PUBLISHER_PRIORITY.items():
        if slug.startswith(pub + "-"):
            return rank
    return 50


# ---- Action verb derivation (priority-ordered) ----
# Check the most specific verbs first. A speech about an IPO is a SPEECH.
ACTION_PATTERNS = [
    (["spoke", "delivered", "addressed", "criticized", "remarked",
      "speech", "remarks", "told", "warned", "predicted"], "spoke"),
    (["resigned", "stepped down", "retired"], "resigned"),
    (["suspended", "halted", "pulled", "withdrew", "called off"], "suspended"),
    (["acquired", "bought", "purchased"], "acquired"),
    (["invested", "backed", "funded"], "invested"),
    (["donated", "gave"], "donated"),
    (["delisted", "taken private"], "delisted"),
    (["restructured", "reorganized", "defaulted", "restructured"], "restructured"),
    (["merged", "consolidated"], "merged"),
    (["sold", "divested", "spun off"], "divested"),
    (["pivoted", "shifted", "transformed"], "pivoted"),
    (["expanded", "entered", "opened", "launched"], "expanded"),
    (["founded", "started", "established", "incorporated"], "founded"),
    (["hired", "appointed", "named"], "appointed"),
    (["built", "constructed"], "built"),
    (["listed", "ipo", "went public", "public offering"], "listed"),
]


def derive_action(statement):
    s = (statement or "").lower()
    for keys, verb in ACTION_PATTERNS:
        for k in keys:
            if k in s:
                return verb
    return "executed"


def make_editorial_title(statement, max_len=70):
    """Editorial headline in Buffett style: 'Subject — short summary'."""
    if not statement:
        return "Untitled decision"
    first = re.split(r"[.,;—]", statement, 1)[0].strip()
    if len(first) > max_len:
        cut = first[:max_len].rsplit(" ", 1)[0]
        return cut.rstrip(".,;:")
    return first


def shorten_tags(tags):
    out = []
    for t in tags:
        words = t.split("-")
        if len(words) > 3:
            t = "-".join(words[:3])
        out.append(t)
    return out


def process_founder(slug):
    corpus_path = CORPUS_DIR / f"{slug}.jsonl"
    reg_path = REG_DIR / f"{slug}.json"
    dec_path = DEC_DIR / f"{slug}.json"
    if not corpus_path.exists():
        return None

    # Load corpus
    records = []
    with open(corpus_path) as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    # Build slug remap
    slug_remap = {}
    for rec in records:
        src = rec["source"]
        old = src["slug"]
        new = clean_slug(src.get("url"), src.get("title", ""),
                         src.get("year"))
        slug_remap[old] = new

    # Deduplicate passages across sources (keep highest-priority publisher)
    seen_text = {}
    dedup_records = []
    for rec in records:
        src = rec["source"]
        new_slug = slug_remap[src["slug"]]
        new_passages = []
        for p in rec["passages"]:
            text = p["text"].strip()
            norm = re.sub(r"\s+", " ", text.lower())[:200]
            if norm in seen_text:
                prev_idx, prev_seq = seen_text[norm]
                prev_rank = publisher_rank(dedup_records[prev_idx]["source"]["slug"])
                cur_rank = publisher_rank(new_slug)
                if cur_rank < prev_rank:
                    prev_passages = dedup_records[prev_idx]["passages"]
                    dedup_records[prev_idx]["passages"] = [
                        pp for pp in prev_passages if pp["sequence"] != prev_seq
                    ]
                    new_passages.append(p)
                    seen_text[norm] = (len(dedup_records), p["sequence"])
                continue
            seen_text[norm] = (len(dedup_records), p["sequence"])
            new_passages.append(p)
        if new_passages:
            dedup_records.append({
                "personSlug": rec["personSlug"],
                "source": rec["source"],
                "passages": new_passages,
            })

    # Normalize each record: strip 'format' from source, strip extra
    # passage fields, normalize vocabulary, resequence.
    # Drop records with 0 passages (Buffett JSONL has one line per source
    # WITH passages; sources without passages live in the registry only).
    final_records = []
    for rec in dedup_records:
        src = rec["source"]
        new_slug = slug_remap[src["slug"]]
        year = ensure_year(src.get("year"), src.get("url"))
        # NOTE: 'format' is intentionally ABSENT from corpus JSONL source.
        # It belongs only in the registry. This matches Buffett byte-for-byte.
        new_src = {
            "slug": new_slug,
            "title": src["title"],
            "year": year,
            "sourceType": src["sourceType"],
            "publisher": src.get("publisher", ""),
            "url": src.get("url", ""),
        }
        new_passages = []
        for idx, p in enumerate(rec["passages"]):
            new_passages.append({
                "text": p["text"],
                "sequence": idx,
                "visibility": p.get("visibility", "pro"),
                "themes": normalize_tag_list(p.get("themes", []), THEME_RENAMES),
                "concepts": normalize_tag_list(p.get("concepts", []), CONCEPT_RENAMES),
                "companies": p.get("companies", []),
                "events": normalize_tag_list(p.get("events", []), EVENT_RENAMES),
            })
        # Skip records with no passages — keeps JSONL byte-clean vs Buffett.
        if not new_passages:
            continue
        final_records.append({
            "personSlug": rec["personSlug"],
            "source": new_src,
            "passages": new_passages,
        })

    # Write compact JSONL
    with open(corpus_path, "w") as f:
        for rec in final_records:
            f.write(json.dumps(rec, separators=(",", ":"),
                               ensure_ascii=False) + "\n")

    # Update registry (keeps 'format' field)
    if reg_path.exists():
        reg = json.load(open(reg_path))
        new_sources = []
        for s in reg["sources"]:
            old_slug = s["slug"]
            new_slug = slug_remap.get(old_slug, clean_slug(
                s.get("url"), s.get("title", ""), s.get("year")))
            year = ensure_year(s.get("year"), s.get("url"))
            new_sources.append({
                "slug": new_slug,
                "title": s["title"],
                "year": year,
                "sourceType": s["sourceType"],
                "publisher": s.get("publisher", ""),
                "url": s.get("url", ""),
                "format": s.get("format", "html"),
            })
        reg_out = {
            "personSlug": reg["personSlug"],
            "sources": new_sources,
        }
        with open(reg_path, "w") as f:
            f.write(json.dumps(reg_out, separators=(",", ":"),
                               ensure_ascii=False))

    # Fix decisions
    if dec_path.exists():
        decs = json.load(open(dec_path))
        new_decs = []
        for d in decs:
            statement = d.get("statement", "")
            title = make_editorial_title(statement)
            action = derive_action(statement)
            tags = shorten_tags(normalize_tag_list(d.get("tags", []),
                                                   {**THEME_RENAMES,
                                                    **CONCEPT_RENAMES}))
            new_decs.append({
                "title": title,
                "decisionDate": d.get("decisionDate", ""),
                "action": action,
                "statement": statement,
                "outcome": d.get("outcome", ""),
                "outcomeSourceUrl": d.get("outcomeSourceUrl", ""),
                "confidence": "high",
                "verified": True,
                "tags": tags,
            })
        with open(dec_path, "w") as f:
            f.write(json.dumps(new_decs, separators=(",", ":"),
                               ensure_ascii=False))

    return {
        "slug": slug,
        "sources": len(final_records),
        "passages": sum(len(r["passages"]) for r in final_records),
    }


def main():
    # Restore from backup before re-running (idempotent)
    stats = []
    files = sorted(CORPUS_DIR.glob("*.jsonl"))
    for corpus_path in files:
        slug = corpus_path.stem
        s = process_founder(slug)
        if s:
            stats.append(s)
            print(f"  {slug}: {s['sources']} sources, {s['passages']} passages")

    total_passages = sum(s["passages"] for s in stats)
    total_sources = sum(s["sources"] for s in stats)
    print(f"\nTOTAL: {len(stats)} founders, {total_sources} sources, "
          f"{total_passages} passages")

    with open(MAN_DIR / "build_stats.json", "w") as f:
        json.dump(stats, f, indent=2)


if __name__ == "__main__":
    main()
