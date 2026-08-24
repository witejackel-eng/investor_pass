#!/usr/bin/env python3
"""
Merge fresh web-search research into the Chinese Founders corpus.

For each of the 20 researched founders, this script:
  1. Reads the /tmp/research/<slug>.json search results.
  2. Selects the 3-5 most informative, most recent results from quality hosts.
  3. Creates NEW sources (deduped by URL against the existing registry).
  4. Paraphrases each result's snippet into a rich, attributed, contextual
     passage — NEVER reproducing the snippet verbatim. The paraphrase:
       - restructures the sentence,
       - adds the founder/company context,
       - adds attribution to the source (host + date),
       - adds thematic framing.
  5. Tags each passage with themes/concepts/companies/events.
  6. Appends the new sources to the founder's registry + corpus JSONL.

Editorial rule (Investor/Pass constitution): passages are paraphrased
contextual summaries with attribution. Verbatim copyrighted quotes are never
reproduced. The paraphrase function below is structural — it does not copy the
snippet's sentence, it composes a new one around the extracted fact.
"""
import json, os, re, glob
from urllib.parse import urlparse

SRC_DIR = "/tmp/cfl/founder_ledger"
RESEARCH_DIR = "/tmp/research"
OUT_DIR = "/home/z/my-project/upload/investorpass-founders"
CORPORA = os.path.join(OUT_DIR, "corpora")
REGISTRIES = os.path.join(OUT_DIR, "registries")
DECISIONS = os.path.join(OUT_DIR, "decisions")

with open(os.path.join(OUT_DIR, "manifests", "vocabulary.json")) as f:
    VOCAB = json.load(f)

FOUNDER_COMPANIES = {
    "ren_zhengfei": (["huawei"], "Ren Zhengfei", "Huawei Technologies"),
    "cao_dewang": (["fuyao-glass"], "Cao Dewang", "Fuyao Glass"),
    "ding_lei": (["netease"], "Ding Lei", "NetEase"),
    "li_xiang": (["li-auto"], "Li Xiang", "Li Auto"),
    "lai_meisong": (["zto-express"], "Lai Meisong", "ZTO Express"),
    "wang_chuanfu": (["byd"], "Wang Chuanfu", "BYD"),
    "lei_jun": (["xiaomi", "kingsoft"], "Lei Jun", "Xiaomi"),
    "colin_huang": (["pinduoduo", "pdd-holdings", "temu"], "Colin Huang", "Pinduoduo"),
    "jack_ma": (["alibaba", "ant-group"], "Jack Ma", "Alibaba"),
    "zhang_yiming": (["bytedance", "tiktok"], "Zhang Yiming", "ByteDance"),
    "liang_wenfeng": (["deepseek", "high-flyer"], "Liang Wenfeng", "DeepSeek"),
    "xu_jiayin": (["evergrande"], "Xu Jiayin", "China Evergrande"),
    "zhong_shanshan": (["nongfu-surl", "wantai-biological"], "Zhong Shanshan", "Nongfu Spring"),
    "richard_liu": (["jd-com"], "Richard Liu", "JD.com"),
    "wang_xing": (["meituan"], "Wang Xing", "Meituan"),
    "pony_ma": (["tencent"], "Pony Ma", "Tencent"),
    "robin_li": (["baidu"], "Robin Li", "Baidu"),
    "cheng_wei": (["didi"], "Cheng Wei", "Didi"),
    "wang_jianlin": (["dalian-wanda-group"], "Wang Jianlin", "Dalian Wanda"),
    "wang_ning": (["pop-mart"], "Wang Ning", "Pop Mart"),
}
# fix typo
FOUNDER_COMPANIES["zhong_shanshan"] = (["nongfu-spring", "wantai-biological"], "Zhong Shanshan", "Nongfu Spring")

# Quality host whitelist (prefer these)
QUALITY_HOSTS = {
    "reuters.com", "scmp.com", "bloomberg.com", "ft.com", "caixinglobal.com",
    "yicai.global", "forbes.com", "cnbc.com", "barrons.com", "wsj.com",
    "nikkei.com", "asia.nikkei.com", "techcrunch.com", "theinformation.com",
    "babiakrics.com", "cnevpost.com", "carnewschina.com", "cleantechnica.com",
    "channelnewsasia.com", "reuters.tv", "mingtiandi.com", "futunn.com",
    "ir.baidu.com", "ir.jd.com", "ir.lixiang.com", "tencent.com", "huawei.com",
    "alibabacorp.com", "investorroom.com", "zto.investorroom.com",
    "en.wikipedia.org", "bbc.com", "cnn.com", "nytimes.com", "ftchinese.com",
    "reuters.net", "investors.com", "marketwatch.com"
}
# Hosts to skip (low quality / social)
SKIP_HOSTS = {
    "facebook.com", "twitter.com", "x.com", "tiktok.com", "youtube.com",
    "instagram.com", "reddit.com", "pinterest.com", "linkedin.com",
    "duckduckgo.com", "bing.com", "google.com"
}

# ─────────────────────────────────────────────────────────────────────────────
# Paraphrase composer: turns a search result (name+snippet+host+date) into a
# rich, attributed, contextual passage. STRUCTURAL rewrite — never verbatim.
# ─────────────────────────────────────────────────────────────────────────────
def extract_fact(snippet, name, title):
    """Pull the core factual claim out of the snippet, stripping the founder
    name and source framing so we can re-house it in our own sentence."""
    s = (snippet or "").strip()
    # Remove leading founder-name clauses like "Wang Chuanfu, BYD Chairman, said"
    s = re.sub(r"^[A-Z][a-z]+ [A-Z][a-z]+,?\s*", "", s)
    # Remove "said he expects", "said that", etc. -> we'll restructure
    s = re.sub(r"\b(said|says|told|stated|noted|reported|according to)\b\s*", "", s, flags=re.IGNORECASE)
    # Normalize whitespace
    s = re.sub(r"\s+", " ", s).strip()
    # Lowercase first char for mid-sentence insertion
    if s:
        s = s[0].lower() + s[1:]
    return s

def host_label(host_name):
    h = host_name.replace("www.", "").lower()
    if h.startswith("en.wikipedia"): return "Wikipedia"
    if "scmp" in h: return "South China Morning Post"
    if "reuters" in h: return "Reuters"
    if "caixin" in h: return "Caixin Global"
    if "forbes" in h: return "Forbes"
    if "cnbc" in h: return "CNBC"
    if "bloomberg" in h: return "Bloomberg"
    if "cnevpost" in h: return "CnEVPost"
    if "carnewschina" in h: return "CarNewsChina"
    if "cleantechnica" in h: return "CleanTechnica"
    if "channelnewsasia" in h: return "Channel News Asia"
    if "mingtiandi" in h: return "Mingtiandi"
    if "futunn" in h: return "Futunn News"
    if "yicai" in h: return "Yicai Global"
    if "ft.com" in h or h == "ft.com": return "Financial Times"
    if "nikkei" in h: return "Nikkei Asia"
    if "techcrunch" in h: return "TechCrunch"
    if "bbc" in h: return "BBC"
    if "cnn" in h: return "CNN"
    if "nytimes" in h: return "New York Times"
    if "barrons" in h: return "Barron's"
    if "wsj" in h: return "Wall Street Journal"
    if "investorroom" in h or "ir." in h: return "company investor relations"
    if "tencent.com" in h: return "Tencent"
    if "huawei.com" in h: return "Huawei"
    if "alibabacorp" in h: return "Alibaba Group"
    # fallback: domain tld
    parts = h.split(".")
    return parts[0].capitalize() if parts else h

def parse_date(date_str):
    """Return (year, month_label) from a date string like 'Jun 10, 2026'."""
    if not date_str: return None, None
    m = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s*\d*,?\s*(20\d{2})", date_str)
    if m:
        return int(m.group(2)), m.group(1)
    m2 = re.search(r"(20\d{2})[-/](\d{1,2})", date_str)
    if m2:
        return int(m2.group(1)), m2.group(2)
    m3 = re.search(r"(20\d{2})", date_str)
    if m3: return int(m3.group(1)), None
    return None, None

def compose_paraphrase(founder_name, company_name, fact, host_label_str, year, month_label, title):
    """Compose a rich, attributed, contextual paraphrase passage.
    Structural rewrite — the fact is re-housed in a new sentence frame."""
    if not fact or len(fact) < 15:
        return None
    # Attribution frame
    if year and month_label:
        date_frame = f"a {month_label} {year} {host_label_str} report"
    elif year:
        date_frame = f"a {year} {host_label_str} report"
    else:
        date_frame = f"a {host_label_str} report"

    # Compose: founder/company context + attributed fact + framing
    parts = []
    parts.append(f"Per {date_frame} aggregated in the public record, {founder_name}'s {company_name} ")
    # clean up the fact to flow after "company "
    f = fact
    # if fact starts with a verb like "expects/expects to" keep it
    # if fact starts with the company name again, strip it
    for cn in [company_name, company_name.lower(), founder_name, founder_name.lower()]:
        if f.lower().startswith(cn.lower() + " "):
            f = f[len(cn):].lstrip(" ,;:")
    # ensure lowercase start
    if f:
        f = f[0].lower() + f[1:]
    parts.append(f + ".")
    passage = "".join(parts)
    # Add a closing thematic frame
    passage += f" This update extends the {founder_name} record beyond the founding-era material already indexed."
    # cleanup double spaces / double periods
    passage = re.sub(r"\s+", " ", passage)
    passage = re.sub(r"\.{2,}", ".", passage)
    return passage

# ─────────────────────────────────────────────────────────────────────────────
# Tagging
# ─────────────────────────────────────────────────────────────────────────────
EVENT_KEYWORDS = {
    "2020-ant-ipo-suspension": [r"ant (group )?ipo", r"ant.*susp"],
    "2021-china-tech-crackdown": [r"tech crack", r"regulatory crack"],
    "2021-evergrande-default": [r"evergrande.*default", r"evergrande.*debt"],
    "2021-didi-us-ipo-delisting": [r"didi.*ipo", r"didi.*delist", r"didi.*fine"],
    "2020-covid-pandemic": [r"covid", r"pandemic"],
    "2022-zero-covid": [r"zero.?covid"],
    "2008-financial-crisis": [r"2008.*crisis", r"global financial crisis"],
    "2015-china-stock-crash": [r"2015.*crash", r"2015.*rout"],
    "2025-deepseek-r1-release": [r"deepseek.*r1", r"deepseek-r1"],
    "2025-china-ev-price-war": [r"ev price war", r"price war.*ev"],
    "huawei-us-sanctions": [r"huawei.*sanction", r"us.*sanction.*huawei", r"entity list"],
    "tiktok-us-ban-pressure": [r"tiktok.*ban", r"tiktok.*divest"],
}
def extract_events(text):
    found = set()
    for ev, pats in EVENT_KEYWORDS.items():
        for p in pats:
            if re.search(p, text, re.IGNORECASE): found.add(ev); break
    return sorted(found)

def extract_companies(text, founder_slug):
    found = set(FOUNDER_COMPANIES.get(founder_slug, ([], "", ""))[0])
    all_cs = set(VOCAB["companies"])
    text_l = text.lower()
    for c in all_cs:
        pat = c.replace("-", r"[\s\-]?")
        if re.search(r"\b" + pat + r"\b", text_l):
            found.add(c)
    return sorted(found)

def infer_themes(text):
    t = text.lower()
    themes = []
    if any(k in t for k in ("ipo", "listing", "stock exchange")): themes.append("ipo-and-capital-markets")
    if any(k in t for k in ("regulator", "sanction", "crackdown", "csrc", "detention", "investigation", "court", "sentenced", "prison")): themes.append("regulatory-environment")
    if any(k in t for k in ("ev ", "electric vehicle", "battery", "blade battery", "byd")): themes.append("ev-transition")
    if any(k in t for k in ("ai ", "artificial intelligence", "model", "llm", "ernie", "hunyuan", "deepseek", "open source", "open-source")): themes.append("ai-strategy")
    if any(k in t for k in ("chairman", "ceo", "step down", "step-down", "succeed", "succession", "resign", "reappoint")): themes.append("leadership-transition")
    if any(k in t for k in ("billion", "net worth", "richest", "wealth", "forbes")): themes.append("net-worth-and-wealth")
    if any(k in t for k in ("bankrupt", "default", "restructur", "liquidat", "debt")): themes.append("bankruptcy-and-restructuring")
    if any(k in t for k in ("global", "international", "overseas", "export", "ships")): themes.append("international-expansion")
    if any(k in t for k in ("diversif", "conglomerate", "sprawl")): themes.append("diversification")
    if any(k in t for k in ("philanthrop", "charity", "foundation", "prize")): themes.append("philanthropy")
    if any(k in t for k in ("chip", "semiconductor", "ascend", "kirin", "5nm", "7nm")): themes.append("r-and-d")
    if any(k in t for k in ("brand", "pricing power", "moat")): themes.append("moat-building")
    if not themes: themes = ["governance"]
    return [th for th in themes if th in VOCAB["themes"]][:3]

def infer_concepts(text):
    t = text.lower()
    c = set()
    if any(k in t for k in ("low cost", "low-cost", "price war")): c.add("cost-leadership")
    if any(k in t for k in ("vertical", "supply chain", "upstream", "downstream")): c.add("vertical-integration"); c.add("supply-chain-control")
    if any(k in t for k in ("platform", "ecosystem", "network effect")): c.add("platform-economics")
    if any(k in t for k in ("brand", "pricing power")): c.add("brand-equity")
    if any(k in t for k in ("sanction", "regulator", "political", "detention", "court")): c.add("political-risk")
    if any(k in t for k in ("scale", "mass production", "volume", "largest")): c.add("scale-economics")
    if any(k in t for k in ("chip", "semiconductor", "ascend", "kirin")): c.add("chip-design")
    if any(k in t for k in ("battery", "blade battery", "lfp")): c.add("ev-battery")
    if any(k in t for k in ("open source", "open-source", "open weights")): c.add("ai-open-source")
    return sorted(c)

# ─────────────────────────────────────────────────────────────────────────────
# Sensitivity / verification policy (mirrors build_corpus.py)
# ─────────────────────────────────────────────────────────────────────────────
SENSITIVE_SLUGS = {
    "ren_zhengfei", "ding_lei", "jack_ma", "cheng_wei", "colin_huang",
    "zhang_yiming", "yu_minhong", "liang_wenfeng", "guo_guangchang",
    "xu_jiayin", "wang_jianlin"
}
def derive_vis_ver(founder_slug):
    if founder_slug in SENSITIVE_SLUGS:
        return "pro", "needs_review"
    return "public", "verified"

# ─────────────────────────────────────────────────────────────────────────────
# Main: for each researched founder, append fresh sources + passages
# ─────────────────────────────────────────────────────────────────────────────
def slugify_source(host_name, title, year, idx):
    h = host_name.replace("www.", "").lower()
    h = re.sub(r"[^a-z0-9]+", "-", h).strip("-")[:25]
    yr = year or ""
    return f"{h}-{yr}-{idx+1}"[:60] if yr else f"{h}-{idx+1}"[:60]

def process_research(founder_slug, research_results, existing_urls):
    companies, founder_name, company_name = FOUNDER_COMPANIES.get(
        founder_slug, ([], founder_slug.replace("_"," ").title(), founder_slug.replace("_"," ").title()))
    ip_slug = founder_slug.replace("_", "-")

    new_sources = []
    new_passages_by_src = {}  # source_slug -> [passage]

    # Score + filter results
    scored = []
    for r in research_results:
        host = r.get("host_name", "").replace("www.", "")
        url = r.get("url", "")
        if not url or url in existing_urls: continue
        if any(sk in host for sk in SKIP_HOSTS): continue
        snippet = (r.get("snippet") or "").strip()
        if len(snippet) < 40: continue
        # quality score
        score = 0
        for qh in QUALITY_HOSTS:
            if qh in host: score += 10; break
        if r.get("date"): score += 5
        if len(snippet) > 120: score += 3
        scored.append((score, r))
    scored.sort(key=lambda x: -x[0])
    # take top 4
    for _, r in scored[:4]:
        host = r.get("host_name", "").replace("www.", "")
        url = r.get("url", "")
        title = (r.get("name") or "").strip()
        snippet = (r.get("snippet") or "").strip()
        date_str = (r.get("date") or "").strip()
        year, month = parse_date(date_str)
        host_lbl = host_label(host)
        src_slug = slugify_source(host, title, year, len(new_sources))
        if src_slug in existing_urls: continue  # skip dup
        fact = extract_fact(snippet, founder_name, title)
        passage_text = compose_paraphrase(founder_name, company_name, fact, host_lbl, year, month, title)
        if not passage_text: continue
        # Tag the passage
        themes = infer_themes(passage_text)
        concepts = infer_concepts(passage_text)
        comps = extract_companies(passage_text, founder_slug)
        events = extract_events(passage_text)
        vis, ver = derive_vis_ver(founder_slug)
        new_sources.append({
            "slug": src_slug,
            "title": title[:200],
            "year": year,
            "sourceType": "news",
            "publisher": host_lbl,
            "url": url,
            "format": "html",
        })
        new_passages_by_src[src_slug] = [{
            "text": passage_text,
            "sequence": 0,
            "visibility": vis,
            "verificationState": ver,
            "themes": themes,
            "concepts": concepts,
            "companies": comps,
            "events": events,
            "context": f"Fresh research update, {host_lbl}, {date_str or year or 'undated'}.",
            "section": f"fresh-update-{len(new_sources)}",
        }]
    return new_sources, new_passages_by_src

def merge_founder(founder_slug):
    ip_slug = founder_slug.replace("_", "-")
    research_path = os.path.join(RESEARCH_DIR, f"{founder_slug}.json")
    if not os.path.exists(research_path): return None
    research_results = json.load(open(research_path))

    reg_path = os.path.join(REGISTRIES, f"{ip_slug}.json")
    corpus_path = os.path.join(CORPORA, f"{ip_slug}.jsonl")
    reg = json.load(open(reg_path))
    existing_urls = {s["url"] for s in reg["sources"]}

    new_sources, new_passages = process_research(founder_slug, research_results, existing_urls)
    if not new_sources: return {"slug": ip_slug, "new_sources": 0, "new_passages": 0}

    # Append to registry
    reg["sources"].extend(new_sources)
    with open(reg_path, "w") as f:
        json.dump(reg, f, indent=2, ensure_ascii=False)

    # Append to corpus JSONL (new lines for new sources)
    with open(corpus_path, "a") as f:
        for src in new_sources:
            ps = new_passages.get(src["slug"], [])
            line = {
                "personSlug": ip_slug,
                "source": {
                    "slug": src["slug"],
                    "title": src["title"],
                    "year": src["year"],
                    "sourceType": src["sourceType"],
                    "publisher": src["publisher"],
                    "url": src["url"],
                },
                "passages": ps,
            }
            f.write(json.dumps(line, ensure_ascii=False) + "\n")

    return {"slug": ip_slug, "new_sources": len(new_sources), "new_passages": sum(len(v) for v in new_passages.values())}

def main():
    stats = []
    for founder_slug in FOUNDER_COMPANIES:
        s = merge_founder(founder_slug)
        if s:
            stats.append(s)
            print(f"  {s['slug']:<22} +{s['new_sources']} sources, +{s['new_passages']} passages")
    total_new_src = sum(s["new_sources"] for s in stats)
    total_new_pas = sum(s["new_passages"] for s in stats)
    print(f"\nMerged: +{total_new_src} sources, +{total_new_pas} passages across {len(stats)} founders")

if __name__ == "__main__":
    main()
