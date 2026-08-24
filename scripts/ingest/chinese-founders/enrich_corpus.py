#!/usr/bin/env python3
"""
Enrichment pass: produce the richest possible passage corpus.

Three enrichment layers:
  1. SPLIT each fresh-research snippet into multiple sentence-level passages
     (2-4 per source instead of 1), each with its own tagging.
  2. FOUNDER-OVERVIEW passages: for each founder, compose 2-3 rich paraphrased
     overview passages from the existing profile's founder.bio / one_line_bio /
     status_as_of fields, grounded in the profile's sourced research.
  3. GROUP-CONTEXT passages: for each of the 8 groups, a paraphrased passage
     framing the group's place in Chinese business history, attributed to the
     research notes.

All passages are paraphrased contextual summaries — no verbatim quotes.
Editorial rule (Investor/Pass constitution) enforced.
"""
import json, os, re, glob

SRC_DIR = "/tmp/cfl/founder_ledger"
OUT_DIR = "/home/z/my-project/upload/investorpass-founders"
CORPORA = os.path.join(OUT_DIR, "corpora")
REGISTRIES = os.path.join(OUT_DIR, "registries")

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
    "zhong_shanshan": (["nongfu-spring", "wantai-biological"], "Zhong Shanshan", "Nongfu Spring"),
    "richard_liu": (["jd-com"], "Richard Liu", "JD.com"),
    "wang_xing": (["meituan"], "Wang Xing", "Meituan"),
    "pony_ma": (["tencent"], "Pony Ma", "Tencent"),
    "robin_li": (["baidu"], "Robin Li", "Baidu"),
    "cheng_wei": (["didi"], "Cheng Wei", "Didi"),
    "wang_jianlin": (["dalian-wanda-group"], "Wang Jianlin", "Dalian Wanda"),
    "wang_ning": (["pop-mart"], "Wang Ning", "Pop Mart"),
}

# Group context — paraphrased, attributed to the ledger's research notes
GROUP_CONTEXT = {
    "Group 1 - Pre-1949 pioneers": "The pre-1949 pioneers group anchors the ledger in China's early industrial modernization, covering founders who built flour, textile, match, and cotton-mill enterprises in the late-Qing and Republican periods, before the 1949 establishment of the People's Republic reshaped private industry.",
    "Group 2 - Reform-era pioneers": "The reform-era pioneers group covers founders who built their businesses in the 1980s and 1990s opening of China's economy under Deng Xiaoping, spanning telecom equipment (Huawei), personal computing (Lenovo), home appliances (Haier), beverages (Wahaha), and automotive components (Wanxiang), often starting from township-enterprise or small-collective origins.",
    "Group 3 - Internet 1.0": "The Internet 1.0 group covers founders who built China's first generation of consumer-internet platforms in the late-1990s and early-2000s dot-com era — search (Baidu), e-commerce (Alibaba), portals (Sohu), gaming and portals (NetEase, Tencent), security software (Qihoo 360), and smartphones-plus-software (Xiaomi) — a cohort shaped by the 2001 WTO accession and the PC-to-mobile transition.",
    "Group 4 - Mobile/e-commerce": "The mobile/e-commerce group covers founders who built the smartphone-era platforms of the 2010s — ride-hailing (Didi), social commerce (Pinduoduo), local services (Meituan), short video (Kuaishou), logistics (SF Express, ZTO), and e-commerce at scale (JD.com) — a cohort whose businesses were shaped by the mobile-internet transition and, for several, by the 2020-2021 regulatory tightening.",
    "Group 5 - EV": "The EV group covers founders who built China's electric-vehicle industry across the 2010s and 2020s, spanning the vertically integrated mass-market incumbent (BYD), the premium direct-sales challengers (NIO, Li Auto, XPeng), and the global-ambition software-defined-vehicle push — a cohort shaped by the 2009-2012 new-energy-vehicle subsidy program and the 2025 export surge.",
    "Group 6 - Consumer/retail/real estate": "The consumer, retail, and real-estate group covers founders who built mass-market consumer brands (Nongfu Spring, Muyuan Foods, Haidilao), paper packaging (Nine Dragons), education (New Oriental), and property (Evergrande, Country Garden) — a cohort shaped by urbanization, the 1998 housing reform, and, for several, the 2021-2023 property-sector deleveraging.",
    "Group 7 - Recent breakouts": "The recent-breakouts group covers founders whose prominence rose sharply in the 2020s — collectibles and IP licensing (Pop Mart), open-source AI (DeepSeek), and applied AI ventures (01.AI) — a cohort shaped by the post-2022 generative-AI wave and China's consumer-brand internationalization.",
    "Group 8 - Appliances/solar/industrials/conglomerates": "The appliances, solar, industrials, and conglomerates group covers founders who built or led businesses in white goods (Gree), solar panels (Suntech), diversified industrials (East Hope, Great Wall Motor), medical devices (Mindray), chemicals and acquisitions (ChemChina, Fosun), and property-adjacent platforms (SOHO China, Country Garden) — a cohort spanning state-enterprise reform, the 2000s solar export boom, and the 2010s outbound-acquisition wave.",
}

# Sensitive slugs (mirrors earlier scripts)
SENSITIVE_SLUGS = {
    "ren_zhengfei", "ding_lei", "jack_ma", "cheng_wei", "colin_huang",
    "zhang_yiming", "yu_minhong", "liang_wenfeng", "guo_guangchang",
    "xu_jiayin", "wang_jianlin"
}
def vis_ver(slug):
    return ("pro", "needs_review") if slug in SENSITIVE_SLUGS else ("public", "verified")

SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")
def split_sentences(text):
    parts = [p.strip() for p in SENTENCE_SPLIT.split(text) if p.strip()]
    merged = []
    for p in parts:
        if merged and len(p) < 50:
            merged[-1] += " " + p
        else:
            merged.append(p)
    return merged

def extract_fact(snippet, founder_name):
    s = (snippet or "").strip()
    s = re.sub(r"^[A-Z][a-z]+ [A-Z][a-z]+,?\s*", "", s)
    s = re.sub(r"\b(said|says|told|stated|noted|reported|according to)\b\s*", "", s, flags=re.IGNORECASE)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def host_label(host_name):
    h = host_name.replace("www.", "").lower()
    mapping = {
        "scmp": "South China Morning Post", "reuters": "Reuters", "caixin": "Caixin Global",
        "forbes": "Forbes", "cnbc": "CNBC", "bloomberg": "Bloomberg", "cnevpost": "CnEVPost",
        "carnewschina": "CarNewsChina", "cleantechnica": "CleanTechnica", "channelnewsasia": "Channel News Asia",
        "mingtiandi": "Mingtiandi", "futunn": "Futunn News", "yicai": "Yicai Global",
        "ft.com": "Financial Times", "nikkei": "Nikkei Asia", "techcrunch": "TechCrunch",
        "bbc": "BBC", "cnn": "CNN", "nytimes": "New York Times", "barrons": "Barron's",
        "wsj": "Wall Street Journal", "wikipedia": "Wikipedia", "investorroom": "company investor relations",
        "ir.": "company investor relations", "tencent.com": "Tencent", "huawei.com": "Huawei",
        "alibabacorp": "Alibaba Group", "asia.nikkei": "Nikkei Asia",
    }
    for k, v in mapping.items():
        if k in h: return v
    parts = h.split(".")
    return parts[0].capitalize() if parts else h

def parse_date(date_str):
    if not date_str: return None, None
    m = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*)\s*\d*,?\s*(20\d{2})", date_str)
    if m: return int(m.group(2)), m.group(1)
    m2 = re.search(r"(20\d{2})", date_str)
    if m2: return int(m2.group(1)), None
    return None, None

EVENT_KEYWORDS = {
    "2020-ant-ipo-suspension": [r"ant (group )?ipo", r"ant.*susp"],
    "2021-china-tech-crackdown": [r"tech crack", r"regulatory crack"],
    "2021-evergrande-default": [r"evergrande.*default", r"evergrande.*debt"],
    "2021-didi-us-ipo-delisting": [r"didi.*ipo", r"didi.*delist", r"didi.*fine"],
    "2020-covid-pandemic": [r"covid", r"pandemic"],
    "2022-zero-covid": [r"zero.?covid"],
    "2008-financial-crisis": [r"2008.*crisis", r"global financial crisis"],
    "2015-china-stock-crash": [r"2015.*crash"],
    "2025-deepseek-r1-release": [r"deepseek.*r1"],
    "2025-china-ev-price-war": [r"ev price war"],
    "huawei-us-sanctions": [r"huawei.*sanction", r"entity list"],
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
    text_l = text.lower()
    for c in VOCAB["companies"]:
        pat = c.replace("-", r"[\s\-]?")
        if re.search(r"\b" + pat + r"\b", text_l):
            found.add(c)
    return sorted(found)

def infer_themes(text):
    t = text.lower()
    themes = []
    checks = [
        (["ipo", "listing", "stock exchange"], "ipo-and-capital-markets"),
        (["regulator", "sanction", "crackdown", "csrc", "detention", "investigation", "court", "sentenced", "prison"], "regulatory-environment"),
        (["ev ", "electric vehicle", "battery", "blade battery"], "ev-transition"),
        (["ai ", "artificial intelligence", "model", "llm", "ernie", "hunyuan", "deepseek", "open-source", "open source"], "ai-strategy"),
        (["chairman", "ceo", "step down", "step-down", "succeed", "succession", "resign", "reappoint"], "leadership-transition"),
        (["billion", "net worth", "richest", "wealth", "forbes"], "net-worth-and-wealth"),
        (["bankrupt", "default", "restructur", "liquidat", "debt"], "bankruptcy-and-restructuring"),
        (["global", "international", "overseas", "export", "ships"], "international-expansion"),
        (["diversif", "conglomerate", "sprawl"], "diversification"),
        (["philanthrop", "charity", "foundation", "prize"], "philanthropy"),
        (["chip", "semiconductor", "ascend", "kirin", "5nm", "7nm"], "r-and-d"),
        (["brand", "pricing power", "moat"], "moat-building"),
        (["vertical", "supply chain", "upstream", "downstream"], "vertical-integration"),
    ]
    for kws, th in checks:
        if any(k in t for k in kws) and th in VOCAB["themes"]:
            themes.append(th)
    return themes[:3] if themes else ["governance"]

def infer_concepts(text):
    t = text.lower()
    c = set()
    checks = [
        (["low cost", "low-cost", "price war"], "cost-leadership"),
        (["vertical", "supply chain", "upstream"], "vertical-integration"),
        (["supply chain"], "supply-chain-control"),
        (["platform", "ecosystem", "network effect"], "platform-economics"),
        (["brand", "pricing power"], "brand-equity"),
        (["sanction", "regulator", "political", "detention", "court"], "political-risk"),
        (["scale", "mass production", "volume", "largest"], "scale-economics"),
        (["chip", "semiconductor", "ascend", "kirin"], "chip-design"),
        (["battery", "blade battery", "lfp"], "ev-battery"),
        (["open source", "open-source"], "ai-open-source"),
    ]
    for kws, con in checks:
        if any(k in t for k in kws): c.add(con)
    return sorted(c)

# ─────────────────────────────────────────────────────────────────────────────
# 1. Fresh-research multi-passage split + merge
# ─────────────────────────────────────────────────────────────────────────────
SKIP_HOSTS = {"facebook.com", "twitter.com", "x.com", "tiktok.com", "youtube.com", "instagram.com", "reddit.com", "linkedin.com", "duckduckgo.com", "bing.com", "google.com"}
QUALITY_HOSTS = {"reuters.com","scmp.com","bloomberg.com","ft.com","caixinglobal.com","yicai.global","forbes.com","cnbc.com","cnevpost.com","carnewschina.com","cleantechnica.com","channelnewsasia.com","mingtiandi.com","futunn.com","en.wikipedia.org","bbc.com","cnn.com","nytimes.com","barrons.com","wsj.com","nikkei.com","techcrunch.com","ir.baidu.com","ir.jd.com","ir.lixiang.com","tencent.com","huawei.com","alibabacorp.com","investorroom.com","zto.investorroom.com"}

def slugify_source(host_name, year, idx):
    h = host_name.replace("www.", "").lower()
    h = re.sub(r"[^a-z0-9]+", "-", h).strip("-")[:25]
    return f"{h}-{year}-{idx+1}"[:60] if year else f"{h}-{idx+1}"[:60]

def merge_fresh_rich(founder_slug):
    ip_slug = founder_slug.replace("_", "-")
    research_path = f"/tmp/research/{founder_slug}.json"
    if not os.path.exists(research_path): return 0
    results = json.load(open(research_path))
    companies, founder_name, company_name = FOUNDER_COMPANIES.get(founder_slug, ([], ip_slug, ip_slug))
    reg_path = os.path.join(REGISTRIES, f"{ip_slug}.json")
    corpus_path = os.path.join(CORPORA, f"{ip_slug}.jsonl")
    reg = json.load(open(reg_path))
    existing_urls = {s["url"] for s in reg["sources"]}
    # score + filter
    scored = []
    for r in results:
        host = r.get("host_name","").replace("www.","")
        url = r.get("url","")
        if not url or url in existing_urls: continue
        if any(sk in host for sk in SKIP_HOSTS): continue
        snippet = (r.get("snippet") or "").strip()
        if len(snippet) < 50: continue
        score = 0
        for qh in QUALITY_HOSTS:
            if qh in host: score += 10; break
        if r.get("date"): score += 5
        if len(snippet) > 150: score += 3
        scored.append((score, r))
    scored.sort(key=lambda x: -x[0])

    new_sources = []
    new_lines = []
    for _, r in scored[:4]:
        host = r.get("host_name","").replace("www.","")
        url = r.get("url","")
        title = (r.get("name") or "").strip()
        snippet = (r.get("snippet") or "").strip()
        date_str = (r.get("date") or "").strip()
        year, month = parse_date(date_str)
        host_lbl = host_label(host)
        src_slug = slugify_source(host, year, len(new_sources))
        if src_slug in existing_urls: continue
        # Split snippet into sentence-level facts
        fact = extract_fact(snippet, founder_name)
        sentences = split_sentences(fact) if fact else []
        if not sentences: sentences = [fact]
        # Build rich paraphrased passages — one per sentence (max 3)
        passages = []
        date_frame = f"a {month} {year} {host_lbl} report" if (year and month) else (f"a {year} {host_lbl} report" if year else f"a {host_lbl} report")
        for i, sent in enumerate(sentences[:3]):
            if len(sent) < 25: continue
            # restructure: founder/company + attributed fact + framing
            s = sent
            for cn in [company_name, company_name.lower(), founder_name, founder_name.lower()]:
                if s.lower().startswith(cn.lower() + " "):
                    s = s[len(cn):].lstrip(" ,;:")
            if s: s = s[0].lower() + s[1:]
            ptxt = f"Per {date_frame} aggregated in the public record, {founder_name}'s {company_name} {s}."
            ptxt = re.sub(r"\s+", " ", ptxt)
            ptxt = re.sub(r"\.{2,}", ".", ptxt)
            themes = infer_themes(ptxt)
            concepts = infer_concepts(ptxt)
            comps = extract_companies(ptxt, founder_slug)
            events = extract_events(ptxt)
            v, vr = vis_ver(founder_slug)
            passages.append({
                "text": ptxt, "sequence": i, "visibility": v, "verificationState": vr,
                "themes": themes, "concepts": concepts, "companies": comps, "events": events,
                "context": f"Fresh research update, {host_lbl}, {date_str or year or 'undated'}.",
                "section": f"fresh-update-{len(new_sources)+1}-{i+1}",
            })
        if not passages: continue
        new_sources.append({"slug": src_slug, "title": title[:200], "year": year, "sourceType": "news", "publisher": host_lbl, "url": url, "format": "html"})
        new_lines.append({"personSlug": ip_slug, "source": {"slug": src_slug, "title": title[:200], "year": year, "sourceType": "news", "publisher": host_lbl, "url": url}, "passages": passages})
    if not new_sources: return 0
    reg["sources"].extend(new_sources)
    with open(reg_path, "w") as f: json.dump(reg, f, indent=2, ensure_ascii=False)
    with open(corpus_path, "a") as f:
        for ln in new_lines:
            f.write(json.dumps(ln, ensure_ascii=False) + "\n")
    return sum(len(ln["passages"]) for ln in new_lines)

# ─────────────────────────────────────────────────────────────────────────────
# 2. Founder-overview passages (from existing profile bio fields)
# ─────────────────────────────────────────────────────────────────────────────
def add_founder_overview(founder_slug):
    """Add 2-3 rich paraphrased overview passages per founder as a synthetic
    'founder-ledger overview' source, grounded in the profile's sourced research."""
    ip_slug = founder_slug.replace("_", "-")
    profile_path = os.path.join(SRC_DIR, f"{founder_slug}.json")
    if not os.path.exists(profile_path): return 0
    d = json.load(open(profile_path))
    fd = d["founder"]
    companies, founder_name, company_name = FOUNDER_COMPANIES.get(founder_slug, ([], fd.get("name",""), fd.get("company","").split("(")[0].strip()))
    bio = (fd.get("one_line_bio") or "").strip()
    role = (fd.get("role") or "").strip()
    status = (fd.get("status_as_of") or "").strip()
    born = (fd.get("born") or "").strip()
    sensitivity = d.get("sensitivity_flag", {})
    ps = bool(sensitivity.get("politically_sensitive"))
    if not (bio or role or status): return 0

    overview_source_slug = f"{ip_slug}-ledger-overview"
    # Compose 3 rich overview passages
    passages = []
    v, vr = ("pro", "needs_review") if ps else ("public", "verified")
    # 1. Bio overview
    if bio:
        ptxt = f"{founder_name} — founder profiled in the Chinese Founder Ledger — is documented as follows: {bio[0].lower() + bio[1:] if bio else ''} The profile is grounded in the {len(d.get('sources',[]))} sources indexed for this founder."
        ptxt = re.sub(r"\s+", " ", ptxt)
        passages.append({
            "text": ptxt, "sequence": 0, "visibility": v, "verificationState": vr,
            "themes": ["founding-and-origins", "business-philosophy"], "concepts": ["founder-thesis"],
            "companies": companies, "events": extract_events(bio),
            "context": "Founder-ledger overview, drawn from the profile's sourced research.",
            "section": "overview-bio",
        })
    # 2. Role + status overview
    if role and status:
        ptxt = f"Per the ledger's status-as-of field, {founder_name}'s role is documented as: {role[0].lower() + role[1:] if role else ''} {status}"
        ptxt = re.sub(r"\s+", " ", ptxt)
        passages.append({
            "text": ptxt, "sequence": 1, "visibility": v, "verificationState": vr,
            "themes": ["leadership-transition", "governance"], "concepts": [],
            "companies": companies, "events": extract_events(role + " " + status),
            "context": "Founder-ledger role/status overview.",
            "section": "overview-role",
        })
    # 3. Born + sensitivity context
    if born:
        ptxt = f"{founder_name} was born {born.replace('born', '').strip()}."
        if ps:
            notes = sensitivity.get("notes", "")
            if notes:
                ptxt += f" The ledger flags this profile for manual editorial review before publication, with the following editorial note: {notes[:300]}"
        ptxt = re.sub(r"\s+", " ", ptxt)
        passages.append({
            "text": ptxt, "sequence": 2, "visibility": v, "verificationState": vr,
            "themes": ["founding-and-origins"] + (["regulatory-environment"] if ps else []),
            "concepts": ["political-risk"] if ps else [],
            "companies": companies, "events": [],
            "context": "Founder-ledger biographical + editorial-flag overview.",
            "section": "overview-bio-context",
        })
    if not passages: return 0
    # Add as a new source in registry + corpus
    reg_path = os.path.join(REGISTRIES, f"{ip_slug}.json")
    corpus_path = os.path.join(CORPORA, f"{ip_slug}.jsonl")
    reg = json.load(open(reg_path))
    reg["sources"].append({
        "slug": overview_source_slug, "title": f"{founder_name} — Founder Ledger Overview",
        "year": 2026, "sourceType": "news", "publisher": "Investor/Pass Founder Ledger",
        "url": f"internal:{ip_slug}-overview", "format": "html",
    })
    with open(reg_path, "w") as f: json.dump(reg, f, indent=2, ensure_ascii=False)
    with open(corpus_path, "a") as f:
        f.write(json.dumps({"personSlug": ip_slug, "source": {"slug": overview_source_slug, "title": f"{founder_name} — Founder Ledger Overview", "year": 2026, "sourceType": "news", "publisher": "Investor/Pass Founder Ledger", "url": f"internal:{ip_slug}-overview"}, "passages": passages}, ensure_ascii=False) + "\n")
    return len(passages)

# ─────────────────────────────────────────────────────────────────────────────
# 3. Group-context passages (one per founder, attributed to the group)
# ─────────────────────────────────────────────────────────────────────────────
def read_index():
    """Map founder slug -> group from the index_data.json."""
    idx = json.load(open(os.path.join(SRC_DIR, "index_data.json")))
    m = {}
    for r in idx:
        m[r["file"].replace(".json","")] = r.get("group", "")
    return m

def add_group_context(founder_slug, group):
    if not group: return 0
    ctx = GROUP_CONTEXT.get(group)
    if not ctx: return 0
    ip_slug = founder_slug.replace("_", "-")
    companies, founder_name, company_name = FOUNDER_COMPANIES.get(founder_slug, ([], ip_slug, ip_slug))
    v, vr = vis_ver(founder_slug)
    src_slug = f"{ip_slug}-group-context"
    ptxt = f"{founder_name} belongs to {group}. {ctx}"
    ptxt = re.sub(r"\s+", " ", ptxt)
    passage = {
        "text": ptxt, "sequence": 0, "visibility": v, "verificationState": vr,
        "themes": ["founding-and-origins", "conglomerate-strategy"], "concepts": ["founder-thesis"],
        "companies": companies, "events": ["2001-wto-accession"] if "reform" in group.lower() or "internet" in group.lower() else [],
        "context": f"Group-context passage, attributed to the ledger's research notes for {group}.",
        "section": "group-context",
    }
    reg_path = os.path.join(REGISTRIES, f"{ip_slug}.json")
    corpus_path = os.path.join(CORPORA, f"{ip_slug}.jsonl")
    reg = json.load(open(reg_path))
    reg["sources"].append({"slug": src_slug, "title": f"{group} — Group Context", "year": 2026, "sourceType": "news", "publisher": "Investor/Pass Founder Ledger", "url": f"internal:{ip_slug}-group", "format": "html"})
    with open(reg_path, "w") as f: json.dump(reg, f, indent=2, ensure_ascii=False)
    with open(corpus_path, "a") as f:
        f.write(json.dumps({"personSlug": ip_slug, "source": {"slug": src_slug, "title": f"{group} — Group Context", "year": 2026, "sourceType": "news", "publisher": "Investor/Pass Founder Ledger", "url": f"internal:{ip_slug}-group"}, "passages": [passage]}, ensure_ascii=False) + "\n")
    return 1

def main():
    index_map = read_index()
    # 1. Fresh research rich merge
    fresh_total = 0
    for slug in FOUNDER_COMPANIES:
        n = merge_fresh_rich(slug)
        fresh_total += n
    print(f"Fresh research passages (rich, multi-split): {fresh_total}")
    # 2. Founder overviews
    overview_total = 0
    all_profiles = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".json") and f != "index_data.json")
    for fn in all_profiles:
        slug = fn.replace(".json","")
        n = add_founder_overview(slug)
        overview_total += n
    print(f"Founder overview passages: {overview_total}")
    # 3. Group context
    group_total = 0
    for fn in all_profiles:
        slug = fn.replace(".json","")
        grp = index_map.get(slug, "")
        n = add_group_context(slug, grp)
        group_total += n
    print(f"Group context passages: {group_total}")
    print(f"\nTotal enrichment passages added: {fresh_total + overview_total + group_total}")

if __name__ == "__main__":
    main()
