import { readdirSync } from "fs";
import { INDUSTRIES, COMPANIES, THEMES, CONCEPTS, EVENTS } from "./entities";

type PassageLine = {
  text: string;
  sequence: number;
  visibility: string;
  themes: string[];
  concepts: string[];
  companies: string[];
  events: string[];
};

type CorpusLine = {
  personSlug: string;
  source: {
    slug: string;
    title: string;
    year: number | null;
    sourceType: string;
    publisher: string;
    url: string;
  };
  passages: PassageLine[];
};

const PEOPLE = [
  { slug: "buffett", name: "Warren Buffett", birthYear: 1930, sortOrder: 1, shortDescription: "Chairman of Berkshire Hathaway and history's most studied capital allocator.", bio: "Warren Buffett (b. 1930) ran Buffett Partnership Ltd. from 1957 to 1969 before taking control of Berkshire Hathaway. His annual letters to shareholders, written since 1977, form one of the most complete public records of any investor's thinking." },
  { slug: "munger", name: "Charlie Munger", birthYear: 1924, sortOrder: 2, shortDescription: "Berkshire Hathaway vice chairman and architect of worldly wisdom.", bio: "Charlie Munger (1924\u20132023) was Berkshire Hathaway's vice chairman and Warren Buffett's partner for over five decades. His Wesco Financial letters and talks on psychology and decision-making shaped modern value investing." },
  { slug: "marks", name: "Howard Marks", birthYear: 1946, sortOrder: 3, shortDescription: "Oaktree co-founder whose client memos chronicle cycles and risk.", bio: "Howard Marks (b. 1946) co-founded Oaktree Capital Management, a leader in credit investing. Since 1990 his memos to clients have been required reading across the investment world." },
  { slug: "lynch", name: "Peter Lynch", birthYear: 1944, sortOrder: 4, shortDescription: "Magellan Fund manager who taught investors to know what they own.", bio: "Peter Lynch (b. 1944) managed Fidelity's Magellan Fund from 1977 to 1990, averaging roughly 29% annually. His lectures and interviews popularized investing in what you know." },
  { slug: "graham", name: "Benjamin Graham", birthYear: 1894, sortOrder: 5, shortDescription: "Father of value investing and author of Security Analysis.", bio: "Benjamin Graham (1894\u20131976) codified security analysis and the margin of safety. His Senate testimony and late-career interviews remain primary documents of disciplined investing." },
  { slug: "bogle", name: "John Bogle", birthYear: 1929, sortOrder: 6, shortDescription: "Vanguard founder and permanent champion of the index fund.", bio: "John C. Bogle (1929\u20132019) founded Vanguard and created the first retail index fund. His speeches and essays on costs, compounding, and investor behavior reshaped an industry." },
  { slug: "klarman", name: "Seth Klarman", birthYear: 1957, sortOrder: 7, shortDescription: "Baupost Group president and author of Margin of Safety.", bio: "Seth Klarman (b. 1957) founded The Baupost Group in 1982. His absolute-return, risk-first approach made Margin of Safety (1991) one of the most sought-after investing books ever printed." },
  { slug: "soros", name: "George Soros", birthYear: 1930, sortOrder: 8, shortDescription: "Macro investor and theorist of reflexivity.", bio: "George Soros (b. 1930) built Quantum Fund into one of history's greatest track records. His CEU lectures articulate reflexivity, the feedback loop between market beliefs and reality." },
  { slug: "druckenmiller", name: "Stanley Druckenmiller", birthYear: 1953, sortOrder: 9, shortDescription: "Duquesne founder; macro concentration and asymmetric bets.", bio: "Stanley Druckenmiller (b. 1953) ran Duquesne Capital for three decades without a losing year and co-drove Quantum's legendary run with Soros." },
  { slug: "simons", name: "Jim Simons", birthYear: 1938, sortOrder: 10, shortDescription: "Mathematician who built Renaissance Technologies.", bio: "Jim Simons (1938\u20132024) applied mathematics and data to found Renaissance Technologies, whose Medallion fund set records for systematic returns." },
  { slug: "livermore", name: "Jesse Livermore", birthYear: 1877, sortOrder: 11, shortDescription: "Legendary speculator of the 1907 and 1929 crashes.", bio: "Jesse Livermore (1877\u20131940) shorted both the 1907 panic and the 1929 crash. How to Trade in Stocks (1940) distilled his tape-reading discipline." },
  { slug: "dalio", name: "Ray Dalio", birthYear: 1949, sortOrder: 12, shortDescription: "Bridgewater founder; principles and economic machine frameworks.", bio: "Ray Dalio (b. 1949) founded Bridgewater Associates and codified his decision-making into Principles and his template of debt cycles." },
  { slug: "templeton", name: "John Templeton", birthYear: 1912, sortOrder: 13, shortDescription: "Global contrarian pioneer of bargain hunting worldwide.", bio: "Sir John Templeton (1912\u20132008) pioneered global contrarian investing, buying at maximum pessimism across markets few Americans watched." },
  { slug: "greenblatt", name: "Joel Greenblatt", birthYear: 1957, sortOrder: 14, shortDescription: "Gotham Capital founder; special situations and the Magic Formula.", status: "coming_later" },
  { slug: "fisher", name: "Philip Fisher", birthYear: 1907, sortOrder: 15, shortDescription: "Growth-investing pioneer and author of Common Stocks and Uncommon Profits." },
  { slug: "pabrai", name: "Mohnish Pabrai", birthYear: 1964, sortOrder: 16, shortDescription: "Dhandho value investor and devoted student of Buffett and Munger.", status: "coming_later" },
  { slug: "ackman", name: "Bill Ackman", birthYear: 1966, sortOrder: 17, shortDescription: "Pershing Square founder; activist, concentrated public positions.", status: "coming_later" },
  { slug: "icahn", name: "Carl Icahn", birthYear: 1936, sortOrder: 18, shortDescription: "The original corporate raider turned activist shareholder." },
  { slug: "swensen", name: "David Swensen", birthYear: 1954, sortOrder: 19, shortDescription: "Yale endowment architect of institutional portfolio management.", status: "coming_later" },
  { slug: "smith", name: "Terry Smith", birthYear: 1954, sortOrder: 20, shortDescription: "Fundsmith founder; buy good companies and do nothing.", status: "coming_later" },
  { slug: "jamsetji-tata", name: "Jamsetji Tata", birthYear: 1869, sortOrder: 101, shortDescription: "Founding patriarch of the Tata Group; conceived steel, hydroelectric power and a research university.", bio: "Founder of the Tata Group (1839-1904). Began with Empress Mills in Nagpur in 1877; conceived Tata Steel, Tata Power and the Indian Institute of Science, completed by successors after his death. The trust-ownership structure that routes Tata Sons dividends to philanthropy traces to his bequest." },
  { slug: "jrd-tata", name: "JRD Tata", birthYear: 1904, sortOrder: 102, shortDescription: "Chairman of Tata Sons 1938-1988; founder of Indian civil aviation.", bio: "Jehangir Ratanji Dadabhoy Tata (1904-1993) led Tata Sons for half a century, grew the group to nearly a hundred companies, founded Tata Airlines (later Air India) in 1932, and introduced employee welfare provisions decades before they became statutory." },
  { slug: "ratan-tata", name: "Ratan Tata", birthYear: 1937, sortOrder: 103, shortDescription: "Chairman of Tata Sons 1991-2012; drove the global M&A wave (Tetley, Corus, JLR) and the Nano bet.", bio: "Ratan Naval Tata (b. 1937) succeeded JRD Tata in 1991 and globalised the group through overseas acquisitions. Returned as interim chairman during the 2016 Mistry affair. Chairman Emeritus of Tata Sons." },
  { slug: "gd-birla", name: "Ghanshyam Das Birla", birthYear: 1894, sortOrder: 104, shortDescription: "Founder of the Birla Group; diversified from jute into aluminium, cement and chemicals.", bio: "Ghanshyam Das Birla (1894-1983) built the Birla Group from a Bengal jute-trading base into textiles, aluminium (Hindalco), cement and viscose. A close associate and funder of Mahatma Gandhi; founded Birla Engineering College, Pilani (BITS)." },
  { slug: "dhirubhai-ambani", name: "Dhirubhai Ambani", birthYear: 1932, sortOrder: 105, shortDescription: "Founder of Reliance Industries; pioneered the Indian equity cult.", bio: "Dhirajlal Hirachand Ambani (1932-2002) founded Reliance in 1966 as a textile trader and built it into India's largest private-sector company via integrated petrochemicals and refining (Hazira, Jamnagar). Credited with seeding the Indian retail-equity cult." },
  { slug: "karsanbhai-patel", name: "Karsanbhai Patel", birthYear: 1945, sortOrder: 106, shortDescription: "Founder of Nirma; the Indian bottom-of-the-pyramid consumer reference case.", bio: "Karsanbhai Patel (b. 1945) founded Nirma from an Ahmedabad garage in 1969 with a low-priced detergent that undercut the incumbents and built a national consumer-goods business on pricing, distribution and backward integration, without ceding promoter equity for decades." },
  { slug: "jamnalal-bajaj", name: "Jamnalal Bajaj", birthYear: 1889, sortOrder: 107, shortDescription: "Founder of the Bajaj Group; Gandhian industrialist and treasurer of the independence movement.", bio: "Jamnalal Bajaj (1889-1942) founded the Bajaj Group and was a close associate and funder of Mahatma Gandhi. His sons Kamalnayan and Ramkrishna carried the group into Bajaj Auto and Bajaj Electricals after independence." },
  { slug: "rahul-bajaj", name: "Rahul Bajaj", birthYear: 1938, sortOrder: 108, shortDescription: "Scaled Bajaj Auto through the licence-raj and post-liberalisation decades.", bio: "Rahul Bajaj (1938-2022) led Bajaj Auto through India's licence era as the dominant two-wheeler incumbent and through the post-1991 transition when the protected market opened to Japanese joint-venture entrants. Chairman emeritus of the Bajaj Group." },
  { slug: "ardeshir-godrej", name: "Ardeshir Godrej", birthYear: 1868, sortOrder: 109, shortDescription: "Founder of the Godrej Group around the springless lock (1897).", bio: "Ardeshir Burjorji Sorabji Godrej (1868-1936) founded the Godrej Group in 1897 with a hand-cast springless lock and extended it into soaps, safes and steel furniture, establishing the diversification logic and trust-ownership posture the group retains." },
  { slug: "verghese-kurien", name: "Verghese Kurien", birthYear: 1921, sortOrder: 110, shortDescription: "Architect of India's White Revolution and the Amul cooperative model.", bio: "Verghese Kurien (1921-2012) engineered the White Revolution, building the Anand cooperative (Amul/GCMMF) and NDDB into a producer-owned dairy structure that made India the world's largest milk producer through institutional rather than technological innovation." },
  { slug: "walchand-hirachand", name: "Walchand Hirachand", birthYear: 1882, sortOrder: 111, shortDescription: "Pioneer of Indian-owned shipping, aviation and automobile manufacturing.", bio: "Walchand Hirachand (1882-1953) founded Scindia Steam Navigation (1919), Hindustan Aircraft (1940) and Premier Automobiles (1944), entering sectors the colonial state had treated as European preserves." },
  { slug: "brijmohan-lall-munjal", name: "Brijmohan Lall Munjal", birthYear: 1924, sortOrder: 112, shortDescription: "Founder of Hero Cycles and the Hero Honda joint venture.", bio: "Brijmohan Lall Munjal (1924-2015) founded Hero Cycles in 1956 (the world's largest bicycle maker) and the 1984 Honda joint venture Hero Honda, which became the world's largest two-wheeler manufacturer. The JV was amicably terminated in 2011." },
  { slug: "kk-birla", name: "K.K. Birla", birthYear: 1915, sortOrder: 113, shortDescription: "Steward of a Birla branch weighted toward media (Hindustan Times), fertilisers and viscose.", bio: "Krishna Kumar Birla (1915-2008) carried forward a segment of the Birla family interests spanning sugar, fertilisers, textiles, viscose (Century, Zuari) and the Hindustan Times, distinguishing his branch through an explicit media-and-chemicals weighting." },
  { slug: "ramkrishna-bajaj", name: "Ramkrishna Bajaj", birthYear: 1923, sortOrder: 114, shortDescription: "Steward of the Bajaj Group through the licence-raj decades.", bio: "Ramkrishna Bajaj (1923-1994) was the younger son of Jamnalal Bajaj and chaired the Bajaj Group through the licence-raj period in which Bajaj Auto became the dominant Indian two-wheeler maker. Established the Jamnalal Bajaj Foundation and its awards." },
  { slug: "mukesh-ambani", name: "Mukesh Ambani", birthYear: 1957, sortOrder: 201, shortDescription: "Chairman of Reliance Industries; the Jio price-war and the retail and digital pivots.", bio: "Mukesh Ambani (b. 1957) chairs Reliance Industries and led the group's expansion from petrochemicals and refining into telecom (Reliance Jio, launched 2016) and retail, redefining the group's consumer-facing footprint." },
  { slug: "anil-agarwal", name: "Anil Agarwal", birthYear: 1954, sortOrder: 202, shortDescription: "Founder and chairman of Vedanta; the mining and metals bet.", bio: "Anil Agarwal (b. 1954) founded Sterlite Industries and built Vedanta Resources into a diversified mining and metals house, listing the holding company in London in 2003 before re-domiciling to India." },
  { slug: "gautam-adani", name: "Gautam Adani", birthYear: 1962, sortOrder: 203, shortDescription: "Founder of the Adani Group; ports-to-energy conglomerate and the Hindenburg episode.", bio: "Gautam Adani (b. 1962) founded the Adani Group and built it from ports into energy, logistics and green energy. The January 2023 Hindenburg report and its aftermath are the defining public test of the group's leverage and disclosure posture." },
  { slug: "kumar-mangalam-birla", name: "Kumar Mangalam Birla", birthYear: 1967, sortOrder: 204, shortDescription: "Chairman of the Aditya Birla Group; modernisation and the Vodafone Idea gamble.", bio: "Kumar Mangalam Birla (b. 1967) chairs the Aditya Birla Group and led its globalisation (Novellis, Columbian Chemicals) and its telecom exposure through Idea Cellular and the Vodafone Idea merger." },
  { slug: "anand-mahindra", name: "Anand Mahindra", birthYear: 1955, sortOrder: 205, shortDescription: "Chairman of the Mahindra Group; farm-to-auto-to-tech pivot.", bio: "Anand Mahindra (b. 1955) chairs the Mahindra Group and led its diversification into IT services (the Tech Mahindra/Satyam merger), financial services and electric vehicles, alongside a high-profile public communications posture." },
  { slug: "sunil-bharti-mittal", name: "Sunil Bharti Mittal", birthYear: 1957, sortOrder: 206, shortDescription: "Founder of Bharti Enterprises; the telecom outsourcing model and the Zain Africa acquisition.", bio: "Sunil Bharti Mittal (b. 1957) built Bharti Airtel into one of India's largest telecom operators through the network and IT outsourcing model, and extended the model across Africa via the 2010 Zain acquisition." },
  { slug: "naveen-jindal", name: "Naveen Jindal", birthYear: 1970, sortOrder: 207, shortDescription: "Chairman of Jindal Steel and Power; the flag-rights case and the coal-allocation episode.", bio: "Naveen Jindal (b. 1970) leads Jindal Steel and Power and is a former two-term member of Parliament, known for the Supreme Court case that secured the citizen's right to fly the national flag and for the 2014 coal-block de-allocation that reshaped JSPL's raw-material base." },
  { slug: "op-jindal", name: "O.P. Jindal", birthYear: 1930, sortOrder: 208, shortDescription: "Founder of the Jindal Group; the pipe-to-steel-and-power vertical integration.", bio: "Om Prakash Jindal (1930-2005) founded the Jindal Group from a pipe-manufacturing unit in 1952 and built it into a vertically integrated steel-and-power house, with the operating businesses later split among his sons." },
  { slug: "narayana-murthy", name: "N.R. Narayana Murthy", birthYear: 1946, sortOrder: 301, shortDescription: "Co-founder of Infosys; the $250 founding and the Indian IT services model.", bio: "Nagavara Ramarao Narayana Murthy (b. 1946) co-founded Infosys in 1981 with $250 borrowed from his wife and built it into a global IT-services firm, anchoring the Indian offshore services model and the equity-governance posture associated with it." },
  { slug: "nandan-nilekani", name: "Nandan Nilekani", birthYear: 1955, sortOrder: 302, shortDescription: "Co-founder of Infosys and architect of Aadhaar as public infrastructure.", bio: "Nandan Nilekani (b. 1955) co-founded Infosys and led the UIDAI/Aadhaar programme, treating identity as public infrastructure. Returned as Infosys chairman in 2017." },
  { slug: "azim-premji", name: "Azim Premji", birthYear: 1945, sortOrder: 303, shortDescription: "Chairman of Wipro; the pivot from vegetable oil to IT services and the philanthropic endowment.", bio: "Azim Premji (b. 1945) chairs Wipro and led its pivot from a vegetable-oil trading company into a global IT-services firm. His philanthropic endowment, routed through the Azim Premji Foundation, is among the largest by an Indian promoter." },
  { slug: "shiv-nadar", name: "Shiv Nadar", birthYear: 1945, sortOrder: 304, shortDescription: "Founder of HCL; the hardware-to-services transition and the Shiv Nadar Foundation.", bio: "Shiv Nadar (b. 1945) founded HCL in 1976 as a hardware venture and led its transition into IT services (HCL Technologies), building one of the largest Indian offshore services firms alongside Infosys and Wipro." },
  { slug: "fc-kohli", name: "F.C. Kohli", birthYear: 1924, sortOrder: 305, shortDescription: "Father of the Indian IT services industry; first CEO of TCS.", bio: "Faqir Chand Kohli (1924-2020) was the first chief executive of Tata Consultancy Services and is credited with establishing the Indian IT-services industry's operating model from the 1960s onward." },
  { slug: "ramalinga-raju", name: "Byrraju Ramalinga Raju", birthYear: 1954, sortOrder: 306, shortDescription: "Founder of Satyam; the 2009 confession and the governance-failure reference case.", bio: "Byrraju Ramalinga Raju (b. 1954) founded Satyam Computer Services in 1987 and built it into India's fourth-largest IT services firm before his January 2009 confession to having falsified the firm's accounts over several years, the defining corporate-governance failure of Indian tech's first wave." },
  { slug: "kishore-biyani", name: "Kishore Biyani", birthYear: 1971, sortOrder: 401, shortDescription: "Founder of Future Group; the rise and the Future-Reliance retail collapse.", bio: "Kishore Biyani (b. 1971) founded the Future Group and built Big Bazaar into India's largest modern retail footprint before the group's 2020-22 insolvency and the contested Future-Reliance retail transaction." },
  { slug: "kiran-mazumdar-shaw", name: "Kiran Mazumdar-Shaw", birthYear: 1953, sortOrder: 402, shortDescription: "Founder of Biocon; biotech from a Bangalore garage.", bio: "Kiran Mazumdar-Shaw (b. 1953) founded Biocon in 1978 from a Bangalore garage and built it into India's leading biotechnology firm, with a research pipeline in insulin analogues and oncology." },
  { slug: "yc-deveshwar", name: "Y.C. Deveshwar", birthYear: 1947, sortOrder: 403, shortDescription: "Chairman of ITC; the diversification defense strategy.", bio: "Yogesh Chander Deveshwar (1947-2019) chaired ITC from 1996 and led its diversification from cigarettes into FMCG, hotels, paperboards and agribusiness, framing the strategy as a defense of the cigarette cash-cow through adjacent category build-outs." },
  { slug: "ramesh-chauhan", name: "Ramesh Chauhan", birthYear: 1944, sortOrder: 404, shortDescription: "Founder of Parle and Bisleri; the Thums Up sale to Coca-Cola.", bio: "Ramesh Chauhan (b. 1944) built Parle's Thums Up, Limca and Gold Spot into the dominant Indian soft-drink brands, sold them to Coca-Cola in 1993, and later built Bisleri into the packaged-water category leader." },
  { slug: "cyrus-poonawalla", name: "Cyrus Poonawalla", birthYear: 1941, sortOrder: 405, shortDescription: "Founder of the Serum Institute; the vaccine scale bet.", bio: "Cyrus Poonawalla (b. 1941) founded the Serum Institute of India in 1966 and built it into the world's largest vaccine manufacturer by dose volume, the basis of India's role in global immunisation." },
  { slug: "sachin-and-binny-bansal", name: "Sachin Bansal & Binny Bansal", birthYear: 1981, sortOrder: 501, shortDescription: "Co-founders of Flipkart; the build-and-sell-to-Walmart arc.", bio: "Sachin Bansal (b. 1981) and Binny Bansal (b. 1983) co-founded Flipkart in 2007 and built it into India's leading e-commerce firm, sold to Walmart in 2018 for ~$16 billion. Both departed the firm subsequently." },
  { slug: "deepinder-goyal", name: "Deepinder Goyal", birthYear: 1983, sortOrder: 502, shortDescription: "Founder of Zomato (Eternal); survival through multiple pivots.", bio: "Deepinder Goyal (b. 1983) founded Zomato (later Eternal) in 2008 and led it through the food-listing, food-delivery and quick-commerce (Blinkit) pivots to a 2021 listing and a broader hyperlocal-commerce posture." },
  { slug: "bhavish-and-ankit-ola", name: "Bhavish Aggarwal & Ankit Bhati", birthYear: 1985, sortOrder: 503, shortDescription: "Co-founders of Ola; the ride-hailing to EV pivot.", bio: "Bhavish Aggarwal (b. 1985) and Ankit Bhati (b. 1985) co-founded Ola in 2010 and built it into India's leading ride-hailing platform; Bhavish subsequently led the Ola Electric EV pivot." },
  { slug: "vijay-shekhar-sharma", name: "Vijay Shekhar Sharma", birthYear: 1978, sortOrder: 504, shortDescription: "Founder of Paytm; the RBI payments-bank clampdown as an Outcome case.", bio: "Vijay Shekhar Sharma (b. 1978) founded One97 Communications and built Paytm into India's largest payments brand, a trajectory sharply tested by the Reserve Bank of India's 2022-24 restrictions on Paytm Payments Bank." },
  { slug: "falguni-nayar", name: "Falguni Nayar", birthYear: 1963, sortOrder: 505, shortDescription: "Founder of Nykaa; the inventory-led beauty e-commerce and the profitable listing.", bio: "Falguni Nayar (b. 1963) founded Nykaa in 2012 after a career in investment banking and listed it in 2021 as one of the rare Indian consumer-tech unicorns to be operating-profitable at listing." },
  { slug: "ritesh-agarwal", name: "Ritesh Aggarwal", birthYear: 1994, sortOrder: 506, shortDescription: "Founder of OYO; aggressive scaling then contraction.", bio: "Ritesh Aggarwal (b. 1994) founded OYO Rooms in 2013, scaled it into a global hospitality-tech firm and led the pandemic-era contraction that re-priced the model ahead of a planned IPO." },
  { slug: "byju-raveendran", name: "Byju Raveendran", birthYear: 1980, sortOrder: 507, shortDescription: "Founder of BYJU'S; the insolvency and contempt proceedings (developing).", bio: "Byju Raveendran (b. 1980) built Think and Learn / BYJU'S into India's most valued startup and a global edtech benchmark before its 2022-24 valuation collapse, insolvency proceedings and the founder's personal legal exposure, which remains developing." },
  { slug: "nithin-and-nikhil-kamath", name: "Nithin Kamath & Nikhil Kamath", birthYear: 1986, sortOrder: 508, shortDescription: "Co-founders of Zerodha; profitable-by-design bootstrapping.", bio: "Nithin Kamath (b. 1986) and Nikhil Kamath (b. 1986) co-founded Zerodha in 2010 and built it into India's largest retail brokerage by active clients on a bootstrapped, profitable-by-design model against VC-funded rivals." },
  { slug: "girish-mathrubootham", name: "Girish Mathrubootham", birthYear: 1975, sortOrder: 509, shortDescription: "Founder of Freshworks; the first Indian SaaS Nasdaq listing.", bio: "Girish Mathrubootham (b. 1975) founded Freshworks (Freshdesk) in 2010 and listed it on Nasdaq in 2021, the first Indian-origin SaaS company to do so, building the template for the wider Indian SaaS wave." },
  { slug: "kunal-and-rohit-snapdeal", name: "Kunal Bahl & Rohit Bansal", birthYear: 1982, sortOrder: 510, shortDescription: "Co-founders of Snapdeal; the rise and the retreat.", bio: "Kunal Bahl (b. 1982) and Rohit Bansal (b. 1982) co-founded Snapdeal in 2010, scaled it into a leading horizontal marketplace and led the post-2017 retreat from the horizontal model to a focused value-commerce platform after the failed Flipkart merger." },
  { slug: "sriharsha-and-nandan-swiggy", name: "Sriharsha Majety & Nandan Reddy", birthYear: 1984, sortOrder: 511, shortDescription: "Co-founders of Swiggy; food delivery and the Instamart pivot.", bio: "Sriharsha Majety and Nandan Reddy co-founded Swiggy in 2014 and built it into India's leading food-delivery platform, extending into quick commerce (Instamart) and a 2024 listing." },
  { slug: "ashneer-grover", name: "Ashneer Grover", birthYear: 1982, sortOrder: 512, shortDescription: "Co-founder of BharatPe; the public ouster as a governance case.", bio: "Ashneer Grover (b. 1982) co-founded BharatPe in 2018 and was ousted in 2022 after an external governance review of his conduct and related-party transactions, the standard Indian case of founder-led fintech governance failure." },
  { slug: "divyank-turakhia", name: "Divyank Turakhia", birthYear: 1982, sortOrder: 513, shortDescription: "Founder of Media.net; the quiet $900M ad-tech exit.", bio: "Divyank Turakhia (b. 1982) co-founded Media.net and sold the contextual-advertising business to a Chinese consortium in 2016 for ~$900 million, an exit notable for its size and for the founder's deliberate avoidance of public-promoter visibility." },
  { slug: "varun-alagh", name: "Varun Alagh", birthYear: 1985, sortOrder: 601, shortDescription: "Co-founder of Mamaearth/Honasa; the D2C-to-IPO arc.", bio: "Varun Alagh (b. 1985) co-founded Mamaearth in 2016 and built it into India's largest D2C personal-care brand, listing Honasa Consumer in 2023 amid a public debate on the IPO's pricing." },
  { slug: "ghazal-alagh", name: "Ghazal Alagh", birthYear: 1985, sortOrder: 602, shortDescription: "Co-founder of Mamaearth/Honasa.", bio: "Ghazal Alagh (b. 1985) co-founded Mamaearth alongside Varun Alagh and led the brand's product and content posture through the D2C-to-IPO arc." },
  { slug: "suchi-mukherjee", name: "Suchi Mukherjee", birthYear: 1972, sortOrder: 603, shortDescription: "Founder of LimeRoad; the social-commerce wind-down.", bio: "Suchi Mukherjee founded LimeRoad in 2012 as a women-focused social-commerce platform and led the venture until its 2018 acquisition by V-Mart after a wind-down of the standalone model." },
  { slug: "sameer-nigam", name: "Sameer Nigam", birthYear: 1978, sortOrder: 604, shortDescription: "Founder of PhonePe; UPI dominance and the India domicile move.", bio: "Sameer Nigam (b. 1978) co-founded PhonePe inside Flipkart in 2015, built it into India's dominant UPI payments platform by transaction share, and led the 2022 spin-out and India domicile shift." },
  { slug: "harsh-and-bhavit-dream11", name: "Harsh Jain & Bhavit Sheth", birthYear: 1986, sortOrder: 605, shortDescription: "Co-founders of Dream11; the fantasy-sports regulatory tightrope.", bio: "Harsh Jain (b. 1986) and Bhavit Sheth co-founded Dream11 in 2008 and built it into India's dominant fantasy-sports platform, defending the game-of-skill format across multiple state jurisdictions." },
];

import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Keep person rows in sync with the PEOPLE roster (status, descriptions).
  for (const p of PEOPLE) {
    await db.person.upsert({
      where: { slug: p.slug },
      update: { status: "active" },
      create: {
        slug: p.slug,
        name: p.name,
        birthYear: p.birthYear,
        sortOrder: p.sortOrder,
        shortDescription: p.shortDescription,
        bio: p.bio,
        status: p.status || "active",
      },
    });
  }

  const industryMap: Record<string, string> = {};
  await db.$transaction(async (tx) => {
    for (const ind of INDUSTRIES) {
      const rec = await tx.industry.upsert({ where: { slug: ind.slug }, update: {}, create: ind });
      industryMap[ind.slug] = rec.id;
    }
    for (const company of COMPANIES) {
      const { industry, ...rest } = company;
      const existing = await tx.company.findUnique({ where: { slug: company.slug } });
      if (!existing)
        await tx.company.create({ data: { ...rest, industryId: industryMap[industry] } });
    }
    for (const t of THEMES) {
      const e = await tx.theme.findUnique({ where: { slug: t.slug } });
      if (!e) await tx.theme.create({ data: t });
    }
    for (const c of CONCEPTS) {
      const e = await tx.concept.findUnique({ where: { slug: c.slug } });
      if (!e) await tx.concept.create({ data: c });
    }
    for (const ev of EVENTS) {
      const e = await tx.event.findUnique({ where: { slug: ev.slug } });
      if (!e) await tx.event.create({ data: ev });
    }
    console.log("entities ensured");
  }, { maxWait: 30000, timeout: 300000 });

  const themeIds = Object.fromEntries((await db.theme.findMany()).map((t) => [t.slug, t.id]));
  const conceptIds = Object.fromEntries((await db.concept.findMany()).map((c) => [c.slug, c.id]));
  const companyIds = Object.fromEntries((await db.company.findMany()).map((c) => [c.slug, c.id]));
  const eventIds = Object.fromEntries((await db.event.findMany()).map((e) => [e.slug, e.id]));
  const personIds = Object.fromEntries(
    (await db.person.findMany()).map((p) => [p.slug, p.id])
  );

  let totalPassages = 0;

  // Optional CLI filter: `bun scripts/ingest/import-db.ts fisher icahn` imports only
// those corpora files. Without args, imports everything (full re-seed).
const onlyFiles = process.argv.slice(2).map((a) => (a.endsWith(".jsonl") ? a : `${a}.jsonl`));
const corpusFiles = readdirSync("data/corpora")
  .filter((f) => f.endsWith(".jsonl"))
  .filter((f) => onlyFiles.length === 0 || onlyFiles.includes(f));
  for (const file of corpusFiles) {
    const lines = (await Bun.file(`data/corpora/${file}`).text())
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as CorpusLine);

    for (const line of lines) {
      const personId = personIds[line.personSlug];
      if (!personId) continue;

      let source = await db.source.findUnique({ where: { slug: line.source.slug } });
      if (!source) {
        source = await db.source.create({
          data: {
            personId,
            slug: line.source.slug,
            title: line.source.title,
            year: line.source.year,
            sourceType: line.source.sourceType,
            publisher: line.source.publisher,
            url: line.source.url,
            provenanceStatus: "verified",
          },
        });
      } else {
        await db.source.update({
          where: { id: source.id },
          data: { year: line.source.year, title: line.source.title },
        });
      }

      await db.passage.deleteMany({ where: { sourceId: source.id } });

      const valid = line.passages.filter((p) => p.text && p.text.length >= 50);
      if (!valid.length) continue;

      // BULK: one insert per source instead of thousands of round trips
      await db.passage.createMany({
        data: valid.map((p) => ({
          sourceId: source!.id,
          text: p.text,
          sequence: p.sequence,
          visibility: p.visibility === "public" ? "public" : "pro",
        })),
      });

      const created = await db.passage.findMany({
        where: { sourceId: source.id },
        select: { id: true, sequence: true },
      });
      const bySeq = new Map(created.map((r) => [r.sequence, r.id]));

      const themeRows: { passageId: string; themeId: string }[] = [];
      const conceptRows: { passageId: string; conceptId: string }[] = [];
      const companyRows: { passageId: string; companyId: string }[] = [];
      const eventRows: { passageId: string; eventId: string }[] = [];
      for (const p of valid) {
        const pid = bySeq.get(p.sequence);
        if (!pid) continue;
        for (const s of p.themes ?? []) { const id = themeIds[s]; if (id) themeRows.push({ passageId: pid, themeId: id }); }
        for (const s of p.concepts ?? []) { const id = conceptIds[s]; if (id) conceptRows.push({ passageId: pid, conceptId: id }); }
        for (const s of p.companies ?? []) { const id = companyIds[s]; if (id) companyRows.push({ passageId: pid, companyId: id }); }
        for (const s of p.events ?? []) { const id = eventIds[s]; if (id) eventRows.push({ passageId: pid, eventId: id }); }
      }
      if (themeRows.length) await db.passageTheme.createMany({ data: themeRows, skipDuplicates: true });
      if (conceptRows.length) await db.passageConcept.createMany({ data: conceptRows, skipDuplicates: true });
      if (companyRows.length) await db.passageCompany.createMany({ data: companyRows, skipDuplicates: true });
      if (eventRows.length) await db.passageEvent.createMany({ data: eventRows, skipDuplicates: true });

      totalPassages += valid.length;
    }
    process.stdout.write(`${file} done (${totalPassages} total)\n`);
  }

  const counts = {
    people: await db.person.count(),
    sources: await db.source.count(),
    passages: await db.passage.count(),
  };
  console.log("IMPORT COMPLETE", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
