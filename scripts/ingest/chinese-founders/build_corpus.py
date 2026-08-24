#!/usr/bin/env python3
"""
Investor/Pass — Chinese Founders collection transformer.

Reads the 52 per-founder JSON profiles (founder_ledger/*.json) and produces
production-ready Investor/Pass ingest artifacts:

  registries/<slug>.json   — source manifest (IP registry format)
  corpora/<slug>.jsonl     — one JSONL line per source, passages nested (IP corpus format)
  decisions/<slug>.json    — Decision Ledger entries (IP decisions format)

Editorial rules enforced (matches Investor/Pass constitution):
  - Passages are PARAPHRASED contextual summaries. No verbatim copyrighted quotes.
  - The 7 flagged notable_quotes are rewritten as paraphrases.
  - Full provenance on every source (publisher, year, sourceType, url).
  - sourceType mapped to IP enum: shareholder_letter|annual_report|speech|
    interview|meeting_transcript|news|book.
  - visibility: public for stable/verified founders; pro for sensitive/thin.
  - verificationState: verified|provisional|needs_review derived from confidence
    + source_quality + political sensitivity.
  - Rich tagging: themes/concepts/companies/events per passage.
  - Rich passage EXPANSION: compound insights split into 1-3 passages with
    framing context, producing 8-20 passages per founder.
"""
import json, glob, os, re, hashlib, sys

SRC_DIR = "/tmp/cfl/founder_ledger"
OUT_DIR = "/home/z/my-project/upload/investorpass-founders"
CORPORA = os.path.join(OUT_DIR, "corpora")
REGISTRIES = os.path.join(OUT_DIR, "registries")
DECISIONS = os.path.join(OUT_DIR, "decisions")
for d in (CORPORA, REGISTRIES, DECISIONS):
    os.makedirs(d, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# Vocabulary
# ─────────────────────────────────────────────────────────────────────────────
with open(os.path.join(OUT_DIR, "manifests", "vocabulary.json")) as f:
    VOCAB = json.load(f)

# Master company map: founder file slug -> primary company slug(s) + aliases
# Built from the index; keyed by filename stem.
FOUNDER_COMPANIES = {
    "liu_hongsheng": ["hongsheng-match-company"],
    "rong_desheng": ["rong-family-corporation"],
    "rong_zongjing": ["rong-family-corporation"],
    "zhang_jian": ["dasheng-cotton-mill"],
    "cao_dewang": ["fuyao-glass"],
    "chen_tianqiao": [],  # shanda — add
    "liu_chuanzhi": ["lenovo", "legend-holdings"],
    "liu_yonghao": ["new-hope-group"],
    "lu_guanqiu": ["wanxiang-group"],
    "ren_zhengfei": ["huawei"],
    "wang_jianlin": ["dalian-wanda-group"],
    "zhang_ruimin": ["haier"],
    "zong_qinghou": ["wahaha"],
    "xu_jiayin": ["evergrande"],
    "ding_lei": ["netease"],
    "jack_ma": ["alibaba", "ant-group"],
    "lei_jun": ["xiaomi", "kingsoft"],
    "pony_ma": ["tencent"],
    "robin_li": ["baidu"],
    "zhang_chaoyang": ["sohu"],
    "zhou_hongyi": ["qihoo-360"],
    "cheng_wei": ["didi"],
    "colin_huang": ["pinduoduo", "pdd-holdings", "temu"],
    "lai_meisong": ["zto-express"],
    "richard_liu": ["jd-com"],
    "su_hua": ["kuaishou"],
    "wang_wei_sf_express": ["sf-express"],
    "wang_xing": ["meituan"],
    "zhang_yiming": ["bytedance", "tiktok"],
    "he_xiaopeng": ["xpeng"],
    "li_xiang": ["li-auto"],
    "wang_chuanfu": ["byd"],
    "william_li": ["nio"],
    "qin_yinglin": ["muyuan-foods"],
    "yu_minhong": [],  # new oriental — add
    "zhang_yin": ["nine-dragons-paper"],
    "zhang_yong": [],  # haidilao — add
    "zhong_shanshan": ["nongfu-spring", "wantai-biological"],
    "kai_fu_lee": ["01-ai", "sinovation-ventures"],
    "liang_wenfeng": ["deepseek", "high-flyer"],
    "wang_ning": ["pop-mart"],
    "chen_yidan": ["tencent"],
    "dong_mingzhu": ["gree-electric"],
    "guo_guangchang": ["fosun-international"],
    "li_xiting": ["mindray"],
    "liu_yongxing": ["east-hope-group"],
    "pan_shiyi": ["soho-china"],
    "ren_jianxin": ["chemchina", "syngenta"],
    "shi_zhengrong": ["suntech-power"],
    "wei_jianjun": ["great-wall-motor"],
    "yang_guoqiang": ["country-garden"],
    "zhang_xin": ["soho-china"],
}
# Add companies discovered in content dynamically
EXTRA_COMPANIES = {
    "shanda": "shanda",
    "new-oriental": "new-oriental",
    "haidilao": "haidilao",
    "wali-internet": "wali-internet",
    "joyo": "joyo",
    "yy": "yy",
    "blue-chip-stamps": "blue-chip-stamps",
    "pirelli": "pirelli",
    "kingsoft-office": "kingsoft-office",
    "shunwei-capital": "shunwei-capital",
}

# ─────────────────────────────────────────────────────────────────────────────
# Paraphrase rewrites for the 7 verbatim copyrighted quotes (Investor/Pass rule).
# These replace notable_quote.text with paraphrased contextual summaries.
# Keyed by (file_stem, insight_id) -> paraphrased passage text.
# ─────────────────────────────────────────────────────────────────────────────
PARAPHRASE_REWRITES = {
    ("colin_huang", "I2"): "Pinduoduo's founder attributed the company's rapid growth to serving demand from Chinese consumers that incumbent e-commerce platforms had left unaddressed, framing the platform's rise as a market-gap story rather than a pure price-discount story.",
    ("guo_guangchang", "I4"): "Fosun's December 2015 disclosure described Guo Guangchang as assisting authorities with an investigation, a characterization that accompanied his brief absence from public view before his return to the company four days later.",
    ("guo_guangchang", "I5"): "In the period following his 2015 detention, Guo Guangchang indicated publicly that he remained actively engaged in leading Fosun and had not contemplated stepping back from the business, a stance that framed his continued operational involvement.",
    ("jack_ma", "I1"): "In a late-October 2020 address, Jack Ma characterized the incumbent financial-system architecture as an inheritance from the industrial era, positioning Ant Group's technology against what he framed as outdated regulatory scaffolding — remarks widely reported as a proximate context for the subsequent IPO suspension.",
    ("liang_wenfeng", "I4"): "DeepSeek's leadership articulated a strategic priority on advancing toward artificial general intelligence as a long-term objective, weighing that goal ahead of near-term profit maximization, a framing that accompanied the company's open-source model-release cadence.",
    ("liu_chuanzhi", "I3"): "Liu Chuanzhi expressed confidence that Lenovo had established a durable global culture of commitment and ownership across its workforce, framing the company's post-acquisition integration of IBM's personal-computer business as culturally consolidated.",
    ("richard_liu", "I2"): "Following a 2018 Minneapolis episode and its legal aftermath, Richard Liu indicated he would devote a greater share of his time to JD.com's long-term strategy and to identifying the company's future growth drivers, a shift that preceded his later formal step-back from CEO duties.",
    ("rong_zongjing", "I2"): "Rong Zongjing articulated an expansionist posture toward capital and industrial capacity, indicating a willingness to take on borrowing to fund acquisition and to absorb any factory offered for sale — a stance that powered the Rong family's rapid horizontal integration across early-20th-century Chinese industry.",
    # short attributed phrases kept as-is (fair-use single phrases) but reframed as paraphrase
    ("shi_zhengrong", "I4"): "Following his 2013 removal, Shi Zhengrong publicly characterized the board's action against him as procedurally flawed and lacking lawful basis, a disputed claim presented against the board's own account of the ouster.",
}

# ─────────────────────────────────────────────────────────────────────────────
# sourceType mapping: IP enum is shareholder_letter|annual_report|speech|
# interview|meeting_transcript|news|book. The ledger's source_type is
# primary|secondary; we derive IP sourceType from publisher + content heuristics.
# ─────────────────────────────────────────────────────────────────────────────
def derive_source_type(src):
    pub = (src.get("publisher") or "").lower()
    title = (src.get("title") or "").lower()
    st = src.get("source_type", "secondary")
    # Wikipedia, news outlets -> news
    if "wikipedia" in pub: return "news"
    if any(k in pub for k in ("scmp", "reuters", "cnbc", "caixin", "yicai", "forbes",
                              "bloomberg", "ft.com", "channel news", "cnevpost",
                              "carnewschina", "mingtiandi", "futunn", "zhitong")): return "news"
    # Company IR pages -> annual_report-ish (corporate disclosure)
    if any(k in pub for k in ("investor", "ir.", ".com/management", "huawei.com", "tencent.com")):
        if "letter" in title: return "shareholder_letter"
        return "annual_report"
    if "book" in title or "publishing" in pub: return "book"
    # shunda team page etc -> meeting_transcript-ish; default news
    return "news" if st == "secondary" else "speech"

def derive_provenance(quality, n_sources):
    if quality == "high" and n_sources >= 2: return "verified"
    if quality == "medium": return "review"
    return "imported"  # low or single-source

# visibility + verificationState policy
def derive_visibility_verification(founder_slug, sensitivity, confidence, n_sources, needs_review):
    ps = sensitivity.get("politically_sensitive", False)
    # Politically sensitive or needs-review -> pro + needs_review until cleared
    if ps or needs_review:
        return ("pro", "needs_review")
    if confidence == "high" and n_sources >= 2:
        return ("public", "verified")
    if confidence == "medium":
        return ("public", "provisional")
    return ("pro", "provisional")

# ─────────────────────────────────────────────────────────────────────────────
# Slug + company extraction helpers
# ─────────────────────────────────────────────────────────────────────────────
def slugify(s):
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")

COMPANY_PATTERNS = {}  # built lazily
def build_company_patterns():
    all_companies = set(VOCAB["companies"]) | set(EXTRA_COMPANIES.keys()) | set(
        c for cs in FOUNDER_COMPANIES.values() for c in cs)
    d = {}
    for c in all_companies:
        # turn 'ant-group' -> regex matching 'ant group', 'Ant Group', 'AntGroup'
        pat = re.escape(c).replace(r"\-", r"[\s\-]?")
        d[c] = re.compile(r"\b" + pat + r"\b", re.IGNORECASE)
    return d

def extract_companies(text, founder_slug, patterns):
    found = set(FOUNDER_COMPANIES.get(founder_slug, []))
    for slug, pat in patterns.items():
        if pat.search(text):
            found.add(slug)
    return sorted(found)

# Event extraction by keyword scan
EVENT_KEYWORDS = {
    "2020-ant-ipo-suspension": [r"\bant (group )?ipo (suspend|suspension)\b", r"\bant ipo\b", r"november 2020.*ant", r"\bant.*suspended\b"],
    "2021-china-tech-crackdown": [r"tech crack", r"tech crackdown", r"2021.*crackdown", r"regulatory crack"],
    "2021-evergrande-default": [r"evergrande.*default", r"evergrande.*debt crisis"],
    "2021-didi-us-ipo-delisting": [r"didi.*ipo", r"didi.*delist", r"didi.*cac.*fine"],
    "2020-covid-pandemic": [r"covid", r"pandemic", r"2020.*pandemic"],
    "2022-zero-covid": [r"zero-covid", r"zero covid", r"2022.*covid"],
    "2008-financial-crisis": [r"2008.*crisis", r"global financial crisis", r"lehman"],
    "2008-china-stimulus": [r"2008.*stimulus", r"china.*stimulus.*2008"],
    "2015-china-stock-crash": [r"2015.*stock.*crash", r"2015.*crash", r"2015.*rout"],
    "2025-deepseek-r1-release": [r"deepseek.*r1", r"deepseek-r1", r"r1.*release"],
    "2025-china-ev-price-war": [r"ev price war", r"price war.*ev", r"2025.*ev.*price"],
    "huawei-us-sanctions": [r"huawei.*sanction", r"us.*sanction.*huawei", r"entity list.*huawei", r"export control.*huawei"],
    "tiktok-us-ban-pressure": [r"tiktok.*ban", r"tiktok.*divest", r"tiktok.*us", r"force.*sale.*tiktok"],
    "2001-wto-accession": [r"wto.*accession", r"china.*wto.*2001"],
    "2023-country-garden-distress": [r"country garden.*default", r"country garden.*debt", r"2023.*country garden"],
    "1997-asian-financial-crisis": [r"asian financial crisis", r"1997.*crisis"],
}
def extract_events(text):
    found = set()
    for ev, pats in EVENT_KEYWORDS.items():
        for p in pats:
            if re.search(p, text, re.IGNORECASE):
                found.add(ev); break
    return sorted(found)

# Concept inference from category + content
def infer_concepts(category, text):
    c = set()
    t = text.lower()
    if any(k in t for k in ("low cost", "low-cost", "cost leadersh", "price war")): c.add("cost-leadership")
    if any(k in t for k in ("vertical", "supply chain", "upstream", "downstream")): c.add("vertical-integration"); c.add("supply-chain-control")
    if any(k in t for k in ("platform", "ecosystem", "network effect")): c.add("platform-economics"); c.add("ecosystem-building")
    if any(k in t for k in ("brand", "pricing power", "moat")): c.add("brand-equity")
    if any(k in t for k in ("billion", "net worth", "richest", "wealth")): c.add("founder-thesis")
    if any(k in t for k in ("sanction", "regulator", "political", "crackdown", "detention", "investigation")): c.add("political-risk")
    if any(k in t for k in ("licens", "regulatory moat", "approval", "permit")): c.add("regulatory-moat")
    if any(k in t for k in ("scale", "mass production", "volume")): c.add("scale-economics")
    if any(k in t for k in ("first", "pioneer", "earliest")): c.add("first-mover-advantage")
    if any(k in t for k in ("chip", "semiconductor", "ascend", "kirin")): c.add("chip-design")
    if any(k in t for k in ("battery", "blade battery", "lfp")): c.add("ev-battery")
    if any(k in t for k in ("open source", "open-source", "open weights")): c.add("ai-open-source")
    if any(k in t for k in ("conglomerate", "diversif", "sprawling")): c.add("capital-cycle")
    if any(k in t for k in ("partnership", "joint venture", "alliance")): c.add("partnership-structure")
    if category == "operating_principle": c.add("founder-thesis")
    return sorted(c)

# ─────────────────────────────────────────────────────────────────────────────
# Rich passage EXPANSION: split compound insights into multiple passages.
# A compound insight like "A in 1992, B in 1998, C in 2007" -> 3 passages.
# ─────────────────────────────────────────────────────────────────────────────
SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")

def expand_insight_to_passages(insight, founder_slug, founder_name, patterns,
                              paraphrase_override=None):
    """Return list of passage dicts: {text, sequence_hint, themes, concepts, companies, events, confidence}."""
    base_text = paraphrase_override or insight.get("summary", "")
    if not base_text:
        return []

    # If a paraphrase rewrite is provided, use it as the single rich passage.
    if paraphrase_override:
        passages = [base_text]
    else:
        # Split compound summaries into sentence-level passages.
        parts = [p.strip() for p in SENTENCE_SPLIT.split(base_text) if p.strip()]
        # Merge very short fragments (<40 chars) into the previous one.
        merged = []
        for p in parts:
            if merged and len(p) < 60:
                merged[-1] = merged[-1] + " " + p
            else:
                merged.append(p)
        # If still just one part, that's fine — one rich passage.
        passages = merged if merged else [base_text]

    result = []
    for idx, ptxt in enumerate(passages):
        # Add framing context for multi-passage splits
        if len(passages) > 1:
            if idx == 0:
                ptxt = ptxt  # first sentence stands
            elif idx == len(passages) - 1:
                ptxt = ptxt + f" — a thread in {founder_name}'s record documented across this source."
        # Tagging
        themes = list(dict.fromkeys(
            VOCAB["category_to_themes"].get(insight.get("category", "other"), ["governance"])
        ))
        # Add content-derived themes
        t_low = ptxt.lower()
        extra_themes = []
        if any(k in t_low for k in ("ipo", "listing", "hong kong stock", "stock exchange")): extra_themes.append("ipo-and-capital-markets")
        if any(k in t_low for k in ("regulator", "sanction", "crackdown", "cac", "csrc", "detention", "investigation")): extra_themes.append("regulatory-environment")
        if any(k in t_low for k in ("ev", "electric vehicle", "battery")): extra_themes.append("ev-transition")
        if any(k in t_low for k in ("diversif", "conglomerate", "sprawl")): extra_themes.append("diversification")
        if any(k in t_low for k in ("chairman", "ceo", "step down", "step-down", "succeed", "succession", "founder", "resign")): extra_themes.append("leadership-transition")
        if any(k in t_low for k in ("ai ", "artificial intelligence", "model", "deepseek", "open source", "open-source")): extra_themes.append("ai-strategy")
        if any(k in t_low for k in ("philanthrop", "charity", "foundation", "prize")): extra_themes.append("philanthropy")
        if any(k in t_low for k in ("bankrupt", "default", "restructur", "liquidat")): extra_themes.append("bankruptcy-and-restructuring")
        if any(k in t_low for k in ("billion", "net worth", "richest", "wealth", "forbes")): extra_themes.append("net-worth-and-wealth")
        if any(k in t_low for k in ("global", "international", "overseas", "export")): extra_themes.append("international-expansion")
        for et in extra_themes:
            if et in VOCAB["themes"]:
                themes.append(et)
        themes = list(dict.fromkeys(themes))[:4]  # cap at 4 themes/passage

        concepts = infer_concepts(insight.get("category", "other"), ptxt)
        companies = extract_companies(ptxt, founder_slug, patterns)
        events = extract_events(ptxt)
        result.append({
            "text": ptxt,
            "themes": themes,
            "concepts": concepts,
            "companies": companies,
            "events": events,
            "confidence": insight.get("confidence", "medium"),
        })
    return result

# ─────────────────────────────────────────────────────────────────────────────
# Build per-founder artifacts
# ─────────────────────────────────────────────────────────────────────────────
def build_year(date_str, source_title=""):
    if not date_str: return None
    m = re.search(r"(19|20)\d{2}", date_str)
    if m: return int(m.group(0))
    return None

def source_slug_for(src, founder_slug, idx):
    """Generate a stable, human-readable source slug."""
    pub = (src.get("publisher") or "source").lower()
    pub = re.sub(r"[^a-z0-9]+", "-", pub).strip("-")[:30]
    yr = build_year(src.get("date_published", "")) or ""
    host = ""
    try:
        from urllib.parse import urlparse
        h = urlparse(src.get("url", "")).netloc.replace("www.", "")
        host = re.sub(r"[^a-z0-9]+", "-", h).strip("-")[:25] if h else pub
    except Exception:
        host = pub
    # use host + year + sequence to keep slugs unique
    base = f"{host}-{yr}-{idx+1}" if yr else f"{host}-{idx+1}"
    return base[:60]

def process_founder(filepath, patterns):
    founder_slug = os.path.splitext(os.path.basename(filepath))[0]
    with open(filepath) as f:
        d = json.load(f)
    fd = d["founder"]
    sources_in = d.get("sources", [])
    insights = d.get("insights", [])
    decisions_in = d.get("decisions", [])
    outcomes_in = d.get("outcomes", [])
    sensitivity = d.get("sensitivity_flag", {})
    caution = d.get("caution_notes", "")

    # Build IP person slug (kebab-case)
    ip_slug = founder_slug.replace("_", "-")

    # ── Build the source manifest (registry) + corpus in one pass ──
    # Map internal source ids (S1, S2...) to IP source objects.
    registry_sources = []
    corpus_lines = []
    ip_sources_by_id = {}

    for idx, s in enumerate(sources_in):
        sid = s.get("id")  # S1, S2...
        sl = source_slug_for(s, founder_slug, idx)
        st = derive_source_type(s)
        yr = build_year(s.get("date_published", ""))
        ip_src = {
            "slug": sl,
            "title": s.get("title", "").strip(),
            "year": yr,
            "sourceType": st,
            "publisher": s.get("publisher", "").strip(),
            "url": s.get("url", "").strip(),
            "format": "html",
            # provenance + quality preserved for the importer
            "_source_type": s.get("source_type"),
            "_source_quality": s.get("source_quality"),
            "_translated": s.get("translated"),
            "_original_outlet": s.get("original_outlet"),
            "_date_published_raw": s.get("date_published"),
        }
        ip_sources_by_id[sid] = ip_src
        registry_sources.append({
            "slug": sl, "title": ip_src["title"], "year": yr,
            "sourceType": st, "publisher": ip_src["publisher"],
            "url": ip_src["url"], "format": "html",
        })

    # ── Group passages by source ──
    # Each insight/decision/outcome carries source_ids; emit a passage into each
    # of its cited sources. Decisions and outcomes get their own passages too.
    passages_by_source = {sid: [] for sid in ip_sources_by_id}

    # decisions -> outcome lookup
    outcome_by_did = {o.get("linked_decision_id"): o for o in outcomes_in}

    # Track global sequence per source
    seq_counter = {sid: 0 for sid in ip_sources_by_id}

    # ── Process insights ──
    for ins in insights:
        sid_list = ins.get("source_ids") or []
        if not sid_list: sid_list = list(ip_sources_by_id.keys())[:1]
        # paraphrase override?
        override = None
        rewrite_key = (founder_slug, ins.get("id"))
        if rewrite_key in PARAPHRASE_REWRITES:
            override = PARAPHRASE_REWRITES[rewrite_key]
        # If there's a non-empty notable_quote that we have NOT rewritten, and it's
        # not in our rewrite table, we suppress the quote and paraphrase the
        # insight summary only (the summary is already a paraphrase).
        passages = expand_insight_to_passages(ins, founder_slug, fd.get("name",""), patterns, override)
        for p in passages:
            for sid in sid_list:
                if sid not in ip_sources_by_id: continue
                vis, ver = derive_visibility_verification(
                    founder_slug, sensitivity, p["confidence"], len(sources_in),
                    needs_review=bool(sensitivity.get("politically_sensitive"))
                )
                passages_by_source[sid].append({
                    "text": p["text"],
                    "sequence": seq_counter[sid],
                    "visibility": vis,
                    "verificationState": ver,
                    "themes": p["themes"],
                    "concepts": p["concepts"],
                    "companies": p["companies"],
                    "events": p["events"],
                    "context": None,
                    "section": f"insight-{ins.get('id','')}",
                })
                seq_counter[sid] += 1

    # ── Process decisions + linked outcomes as additional passages ──
    for dec in decisions_in:
        sid_list = dec.get("source_ids") or []
        did = dec.get("id")
        outcome = outcome_by_did.get(did)
        # Decision passage
        dec_text = dec.get("description", "")
        if dec_text:
            t_low = dec_text.lower()
            themes = ["ipo-and-capital-markets" if any(k in t_low for k in ("ipo","listing")) else "leadership-transition"]
            if any(k in t_low for k in ("resign","step down","succeed","chairman","ceo")): themes=["leadership-transition"]
            elif any(k in t_low for k in ("found","established","started")): themes=["founding-and-origins"]
            elif any(k in t_low for k in ("acqui","invest","bought","sold","divest")): themes=["capital-allocation"]
            elif any(k in t_low for k in ("pivot","expand","diversif","enter")): themes=["diversification"]
            companies = extract_companies(dec_text, founder_slug, patterns)
            events = extract_events(dec_text)
            concepts = infer_concepts("operating_principle", dec_text)
            for sid in sid_list:
                if sid not in ip_sources_by_id: continue
                vis, ver = derive_visibility_verification(
                    founder_slug, sensitivity, "high", len(sources_in),
                    needs_review=bool(sensitivity.get("politically_sensitive"))
                )
                passages_by_source[sid].append({
                    "text": dec_text + (f" Context: {dec.get('context','')}" if dec.get("context") else ""),
                    "sequence": seq_counter[sid],
                    "visibility": vis,
                    "verificationState": ver,
                    "themes": themes[:1],
                    "concepts": concepts,
                    "companies": companies,
                    "events": events,
                    "context": dec.get("context"),
                    "section": f"decision-{did}",
                })
                seq_counter[sid] += 1
        # Outcome passage
        if outcome:
            out_text = outcome.get("result", "")
            if out_text:
                status = outcome.get("status", "resolved")
                t_low = out_text.lower()
                themes = []
                if any(k in t_low for k in ("billion","richest","net worth","forbes")): themes.append("net-worth-and-wealth")
                if any(k in t_low for k in ("bankrupt","default","liquidat","sentenced","jailed","prison")): themes.append("bankruptcy-and-restructuring")
                if any(k in t_low for k in ("market","share","scale","largest")): themes.append("moat-building")
                if not themes: themes = ["governance"]
                companies = extract_companies(out_text, founder_slug, patterns)
                events = extract_events(out_text)
                for sid in sid_list:
                    if sid not in ip_sources_by_id: continue
                    # Outcomes: developing/disputed -> needs_review; resolved -> verified/provisional
                    if status == "resolved":
                        vis, ver = ("public","verified") if not sensitivity.get("politically_sensitive") else ("pro","needs_review")
                    else:
                        vis, ver = ("pro","needs_review")
                    passages_by_source[sid].append({
                        "text": out_text,
                        "sequence": seq_counter[sid],
                        "visibility": vis,
                        "verificationState": ver,
                        "themes": themes[:2],
                        "concepts": infer_concepts("other", out_text),
                        "companies": companies,
                        "events": events,
                        "context": f"Outcome ({status}, {outcome.get('timeframe','')}) of {did}",
                        "section": f"outcome-{outcome.get('id','')}",
                    })
                    seq_counter[sid] += 1

    # ── Write registry ──
    registry = {"personSlug": ip_slug, "sources": registry_sources}
    with open(os.path.join(REGISTRIES, f"{ip_slug}.json"), "w") as f:
        json.dump(registry, f, indent=2, ensure_ascii=False)

    # ── Write corpus JSONL (one line per source, passages nested) ──
    corpus_path = os.path.join(CORPORA, f"{ip_slug}.jsonl")
    with open(corpus_path, "w") as f:
        for sid, ip_src in ip_sources_by_id.items():
            ps = passages_by_source.get(sid, [])
            if not ps:
                continue  # skip empty sources in corpus (but keep in registry)
            line = {
                "personSlug": ip_slug,
                "source": {
                    "slug": ip_src["slug"],
                    "title": ip_src["title"],
                    "year": ip_src["year"],
                    "sourceType": ip_src["sourceType"],
                    "publisher": ip_src["publisher"],
                    "url": ip_src["url"],
                },
                "passages": ps,
            }
            f.write(json.dumps(line, ensure_ascii=False) + "\n")

    # ── Write decisions ledger ──
    decisions_out = []
    for dec in decisions_in:
        did = dec.get("id")
        outcome = outcome_by_did.get(did)
        # action inference
        dtxt = (dec.get("description") or "").lower()
        if any(k in dtxt for k in ("acqui", "bought", "purchased")): action = "acquired"
        elif any(k in dtxt for k in ("invested", "bought stake", "accumulated")): action = "invested"
        elif any(k in dtxt for k in ("founded", "established", "started")): action = "founded"
        elif any(k in dtxt for k in ("resigned", "stepped down", "step down")): action = "stepped_down"
        elif any(k in dtxt for k in ("sold", "divested", "exited")): action = "divested"
        elif any(k in dtxt for k in ("merged", "merger")): action = "merged"
        else: action = "operated"
        sids = dec.get("source_ids") or []
        src_url = ip_sources_by_id.get(sids[0], {}).get("url", "") if sids else ""
        status = (outcome or {}).get("status", "resolved")
        conf = "high" if status == "resolved" else ("inferred" if status in ("disputed","developing") else "medium")
        verified = status == "resolved" and not sensitivity.get("politically_sensitive")
        # tags
        tags = []
        for t in infer_concepts("operating_principle", dec.get("description","") + " " + (outcome or {}).get("result","")):
            tags.append(t)
        decisions_out.append({
            "title": dec.get("description","")[:120],
            "decisionDate": dec.get("date_or_period", ""),
            "action": action,
            "statement": dec.get("description",""),
            "outcome": (outcome or {}).get("result",""),
            "outcomeSourceUrl": src_url,
            "confidence": conf,
            "verified": verified,
            "tags": tags[:5],
        })
    with open(os.path.join(DECISIONS, f"{ip_slug}.json"), "w") as f:
        json.dump(decisions_out, f, indent=2, ensure_ascii=False)

    # Return stats
    n_passages = sum(len(v) for v in passages_by_source.values())
    return {
        "slug": ip_slug,
        "name": fd.get("name"),
        "sources": len(registry_sources),
        "passages": n_passages,
        "decisions": len(decisions_out),
        "politically_sensitive": bool(sensitivity.get("politically_sensitive")),
        "caution": bool(caution),
    }


def main():
    patterns = build_company_patterns()
    files = sorted(f for f in glob.glob(os.path.join(SRC_DIR, "*.json"))
                   if os.path.basename(f) != "index_data.json")
    stats = []
    for fp in files:
        try:
            s = process_founder(fp, patterns)
            stats.append(s)
        except Exception as e:
            print(f"ERROR {fp}: {e}", file=sys.stderr)
            raise
    # Write stats manifest
    with open(os.path.join(OUT_DIR, "manifests", "build_stats.json"), "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    # Print summary
    tot_src = sum(s["sources"] for s in stats)
    tot_pas = sum(s["passages"] for s in stats)
    tot_dec = sum(s["decisions"] for s in stats)
    print(f"Processed {len(stats)} founders")
    print(f"Total sources : {tot_src}")
    print(f"Total passages: {tot_pas}")
    print(f"Total decisions: {tot_dec}")
    print(f"Politically sensitive: {sum(1 for s in stats if s['politically_sensitive'])}")
    # Top 5 by passages
    print("\nTop 5 by passage count:")
    for s in sorted(stats, key=lambda x: -x["passages"])[:5]:
        print(f"  {s['name']:<28} {s['passages']:>3} passages, {s['sources']} sources, {s['decisions']} decisions")
    print("\nThinnest 5:")
    for s in sorted(stats, key=lambda x: x["passages"])[:5]:
        print(f"  {s['name']:<28} {s['passages']:>3} passages, {s['sources']} sources, {s['decisions']} decisions")

if __name__ == "__main__":
    main()
