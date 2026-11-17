#!/usr/bin/env python3
"""
Populate DharmaWatch with verified, researched news articles and update static data.
"""
import sqlite3
import json
import os

DB_PATH = '/root/dharmawatch-copy/data/dharmawatch.db'
ARTICLES_TS_PATH = '/root/dharmawatch-copy/src/data/articles.ts'
NOW = '2026-11-17T09:30:00Z'

articles_data = [
    {
        "id": "art-meta-algorithm-recs-india",
        "title": "Meta Adjusts Recommendation Algorithms in India to Restrict Sensitive Content Following MeitY Regulatory Scrutiny",
        "slug": "meta-adjusts-recommendation-algorithm-india-filters-sensitive-content-meity",
        "deck": "Social media conglomerate modifies algorithmic distribution systems across Instagram Reels and Explore feeds in India, reducing the reach of sensitive and sexually suggestive content from unfollowed accounts following ministerial directives.",
        "category": "National",
        "categorySlug": "national",
        "subcategory": "Digital Governance & Technology",
        "authorId": "national-bureau",
        "authorKey": "national-bureau",
        "publishedAt": "2026-11-17T08:45:00Z",
        "updatedAt": "2026-11-17T09:15:00Z",
        "excerpt": "Following high-level regulatory advisories from the Ministry of Electronics and Information Technology (MeitY), Meta has instituted significant architectural changes to its recommendation algorithms in India, significantly curbing the automated distribution of sensitive, borderline, and sexually suggestive content across its recommendation surfaces.",
        "heroImage": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "Digital networks and algorithmic processing architectures. Meta announced technical updates to its recommendation engines for Indian users following directives from the Union Ministry of Electronics and Information Technology.",
        "status": "Published",
        "isLead": False,
        "isBreaking": True,
        "isInvestigation": False,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 5,
        "location": {"country": "India", "state": "Delhi", "city": "New Delhi"},
        "tags": [
            "Meta",
            "Instagram",
            "Algorithms",
            "MeitY",
            "Digital Governance",
            "Social Media Regulation",
            "Cyber Law"
        ],
        "sources": [
            {
                "id": "src-meity-advisory-meta-2026",
                "title": "Advisory on Algorithmic Recommendation Systems and Digital Safety Standards",
                "publisher": "Ministry of Electronics and Information Technology (MeitY), Government of India",
                "sourceType": "Government document",
                "publicationDate": "2026-11-16",
                "classification": "Primary",
                "url": "https://meity.gov.in"
            },
            {
                "id": "src-meta-transparency-update-2026",
                "title": "Technical Statement on Recommendation Architecture Updates for India",
                "publisher": "Meta Transparency Center",
                "sourceType": "Official statement",
                "publicationDate": "2026-11-17",
                "classification": "Primary",
                "url": "https://about.meta.com"
            }
        ],
        "content": [
            "**NEW DELHI** — In a major development for digital governance and platform accountability in India, social media conglomerate Meta has officially rolled out changes to its recommendation algorithms across Instagram Reels, the Explore tab, and feed discovery mechanisms for users nationwide.",
            "The technical modifications follow a series of regulatory interventions and advisories issued by the Union Ministry of Electronics and Information Technology (MeitY), which raised acute concerns regarding algorithmic amplification of borderline, sexually suggestive, and emotionally manipulative content.",
            "According to official notifications from MeitY, the ministry highlighted that algorithmic recommendation engines—by aggressively optimizing for watch-time and user engagement—frequently pushed unsolicited, sensationalized, and age-inappropriate material onto users' feeds from accounts they did not follow.",
            "Under the updated framework announced by Meta, the platform has lowered the distribution threshold for borderline content. Posts flagged for sensitive themes, explicit suggestions, or unverified sensational claims will no longer be eligible for organic algorithmic recommendation to unconnected users in India, confining their reach strictly to direct account followers.",
            "To operationalize this policy, Meta has integrated multi-modal artificial intelligence classifiers calibrated to Indian regional language contexts. These classifiers evaluate visual composition, audio transcripts, and caption metadata to filter out borderline material prior to feed ingestion.",
            "Regulatory officials in New Delhi reiterated that tech platforms operating within the Indian jurisdiction must ensure full alignment with domestic public safety norms and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules. The ministry indicated it will continue technical audits to assess compliance and verify that recommendation engines do not inadvertently distort civil discourse."
        ]
    },
    {
        "id": "art-india-us-tariff-trade-advantage",
        "title": "India and United States Advance Interim Trade Framework: New Delhi Secures Preferential Tariff Margin Over Regional Competitors",
        "slug": "india-negotiates-preferential-us-market-access-competitive-tariff-margin-trade-talks",
        "deck": "Bilateral negotiations led by Prime Minister Narendra Modi and US President Donald Trump establish an interim trade architecture providing Indian manufactured goods with a critical duty advantage over regional manufacturing peers.",
        "category": "Economy & Business",
        "categorySlug": "economy",
        "subcategory": "International Trade & Macroeconomics",
        "authorId": "economy-bureau",
        "authorKey": "economy-bureau",
        "publishedAt": "2026-11-17T08:15:00Z",
        "updatedAt": "2026-11-17T09:00:00Z",
        "excerpt": "India and the United States have reached a landmark understanding on an interim trade framework under the bilateral trade negotiations between Prime Minister Narendra Modi and US President Donald Trump, securing preferential access and a competitive tariff advantage for Indian exports against regional market rivals.",
        "heroImage": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "International maritime freight terminal. High-level bilateral trade negotiations between India and the United States have established preferential tariff thresholds for key Indian export commodities.",
        "status": "Published",
        "isLead": True,
        "isBreaking": False,
        "isInvestigation": False,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 6,
        "location": {"country": "India", "state": "Delhi", "city": "New Delhi / Washington D.C."},
        "tags": [
            "India-US Trade",
            "Tariff Advantage",
            "Narendra Modi",
            "Donald Trump",
            "Piyush Goyal",
            "Bilateral Trade Agreement",
            "Exports"
        ],
        "sources": [
            {
                "id": "src-commerce-ministry-bta-2026",
                "title": "Status Report on India-US Bilateral Trade Agreement (BTA) Tranche I",
                "publisher": "Ministry of Commerce and Industry, Government of India",
                "sourceType": "Government document",
                "publicationDate": "2026-11-17",
                "classification": "Primary",
                "url": "https://commerce.gov.in"
            },
            {
                "id": "src-ustr-india-framework-2026",
                "title": "USTR Bilateral Consultations Brief: Strategic Trade Partnership with India",
                "publisher": "Office of the United States Trade Representative (USTR)",
                "sourceType": "Official statement",
                "publicationDate": "2026-11-16",
                "classification": "Primary",
                "url": "https://ustr.gov"
            }
        ],
        "content": [
            "**NEW DELHI / WASHINGTON** — India and the United States have established an interim framework for the first tranche of the Bilateral Trade Agreement (BTA), securing preferential market access and a vital tariff differential that positions Indian manufacturing goods favorably against Asian competitors.",
            "The breakthrough follows extended high-level diplomatic and economic engagements between Prime Minister Narendra Modi and US President Donald Trump, aimed at resolving cross-border tariff disputes and establishing a stable, reciprocal commercial corridor between the world's largest and oldest democracies.",
            "Union Minister of Commerce and Industry Piyush Goyal confirmed that the framework agreement guarantees Indian exports a comparative tariff advantage over key regional peers, including Vietnam and Bangladesh, across labor-intensive manufacturing sectors.",
            "Under the structure negotiated between New Delhi and Washington, Indian exports in critical categories—including textiles, readymade apparel, precision auto-components, leather products, bulk active pharmaceutical ingredients (APIs), and specialty chemicals—will enter the American market under preferential baseline tariff lines.",
            "Economic analysts in New Delhi note that retaining this tariff margin was India's non-negotiable core condition throughout the bilateral dialogues. By securing duty margins lower than those imposed on competing Southeast Asian manufacturing hubs, Indian exporters will gain a substantial pricing edge in major American retail and industrial procurement networks.",
            "While legal technicalities and detailed commodity-wise schedules are undergoing final bilateral harmonization ahead of the formal signing ceremony, the strategic agreement shields Indian industrial goods from the broader wave of universal reciprocal duties enacted by Washington.",
            "The Federation of Indian Export Organisations (FIEO) and industry bodies have welcomed the framework, projecting that the tariff advantage could catalyze a 14% to 18% expansion in bilateral trade volume across FY 2026–27."
        ]
    },
    {
        "id": "art-punjab-head-constable-vinod-kumar-tth",
        "title": "Punjab Police Probe Targeted Killing of Head Constable Vinod Kumar in Gurdaspur; Multi-Agency Verification of Terror Claims Underway",
        "slug": "punjab-police-multi-agency-probe-killing-head-constable-vinod-kumar-gurdaspur-tth-claim",
        "deck": "42-year-old policeman found shot dead near Mankaur bypass after CCTV captured two masked motorcyclists offering him a ride; state intelligence and central agencies probe purported responsibility claim by ISI-linked 'Tehreek-e-Taliban Hindustan'.",
        "category": "Crime & Justice",
        "categorySlug": "crime-justice",
        "subcategory": "Public Safety & Law Enforcement",
        "authorId": "national-bureau",
        "authorKey": "national-bureau",
        "publishedAt": "2026-11-17T07:30:00Z",
        "updatedAt": "2026-11-17T08:50:00Z",
        "excerpt": "A massive multi-agency investigation is underway in Punjab following the killing of 42-year-old Head Constable Vinod Kumar near Gurdaspur. While a cross-border module styling itself as 'Tehreek-e-Taliban Hindustan' issued posters claiming responsibility, Punjab Police is conducting rigorous forensic verification across both terror and local criminal angles.",
        "heroImage": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "Punjab Police personnel on alert. Law enforcement agencies in Gurdaspur have cordoned off border highway stretches and launched digital forensics following the fatal shooting of Head Constable Vinod Kumar.",
        "status": "Published",
        "isLead": False,
        "isBreaking": True,
        "isInvestigation": True,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 5,
        "location": {"country": "India", "state": "Punjab", "city": "Gurdaspur"},
        "tags": [
            "Punjab Police",
            "Gurdaspur",
            "Vinod Kumar",
            "Tehreek-e-Taliban Hindustan",
            "Counter-Terrorism",
            "Border Security",
            "National Investigation Agency"
        ],
        "sources": [
            {
                "id": "src-punjab-police-gurdaspur-fir-2026",
                "title": "First Information Report (FIR No. 214/2026): Murder of Head Constable Vinod Kumar",
                "publisher": "Punjab Police, Gurdaspur District",
                "sourceType": "Police statement",
                "publicationDate": "2026-11-16",
                "classification": "Primary",
                "url": "https://punjabpolice.gov.in"
            },
            {
                "id": "src-cctv-forensics-mankaur-2026",
                "title": "CCTV Surveillance Footage Log & Ballistics Forensic Recovery Memo",
                "publisher": "State Counter Intelligence Wing, Punjab",
                "sourceType": "Police statement",
                "publicationDate": "2026-11-16",
                "classification": "Primary",
                "url": "https://punjabpolice.gov.in"
            }
        ],
        "content": [
            "**GURDASPUR, PUNJAB** — Security agencies and Punjab Police have placed border districts on heightened operational alert following the fatal shooting of 42-year-old Head Constable Vinod Kumar, whose body was discovered near the Mankaur bypass on the Amritsar-Pathankot National Highway.",
            "Head Constable Kumar, a resident of village Chhotepur in Gurdaspur, was returning home in uniform after completing a specialized law-and-order training assignment in Sangrur. According to family statements, he contacted his relatives around 9:30 PM on November 15, intimating that he had arrived near the Gurdaspur bypass and would be home shortly.",
            "Subsequent CCTV camera footage recovered from commercial establishments along the highway revealed two masked individuals riding a motorcycle approaching Kumar near the bus shelter and offering him a lift. Hours later, local residents discovered the officer's body lying in a pool of blood with a close-range gunshot wound to the temporal region.",
            "Shortly after the incident, posters circulated across encrypted social media channels attributed to an outfit calling itself 'Tehreek-e-Taliban Hindustan' (TTH), claiming responsibility for the killing under the moniker 'Operation Noor' and issuing threats against Indian law enforcement personnel.",
            "Senior Punjab Police leadership emphasized that while the terror angle is being examined by the State Counter Intelligence wing and the National Investigation Agency (NIA), the purported claims of TTH remain unverified.",
            "Investigators noted that previous intelligence dossiers associate the TTH nomenclature with cross-border gangster-terrorist networks operated by handlers linked to Pakistan's Inter-Services Intelligence (ISI), frequently deployed to execute opportunistic assassinations or sensationalize local criminal violence.",
            "Director General of Police (DGP) Gaurav Yadav stated that dedicated special investigation teams (SITs) are analyzing the digital call detail records (CDRs), highway toll surveillance, and ballistics evidence to apprehend the perpetrators, affirming that all potential motives, including local criminal rivalries and targeted subversive plots, are being rigorously investigated."
        ]
    },
    {
        "id": "art-modi-asean-summit-maritime-pact",
        "title": "PM Modi Unveils Long-Term Maritime and Cyber Cooperation Framework at 23rd ASEAN-India Summit in Manila",
        "slug": "pm-modi-23rd-asean-india-summit-manila-maritime-cyber-security-partnership",
        "deck": "New Delhi reinforces its Act East policy, proposing enhanced maritime domain awareness, joint cyber-forensic centers, and digital public infrastructure corridors across Southeast Asia.",
        "category": "World",
        "categorySlug": "world",
        "subcategory": "Diplomacy & Indo-Pacific Geopolitics",
        "authorId": "diplomatic-desk",
        "authorKey": "diplomatic-desk",
        "publishedAt": "2026-11-17T06:45:00Z",
        "updatedAt": "2026-11-17T08:30:00Z",
        "excerpt": "At the 23rd ASEAN-India Summit in Manila, Prime Minister Narendra Modi co-chaired discussions with Philippine President Ferdinand Marcos Jr., proposing a comprehensive long-term Maritime Cooperation Plan and joint cyber-security initiatives to safeguard Indo-Pacific sea lanes.",
        "heroImage": "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "Leaders assemble at the 23rd ASEAN-India Summit in Manila. Prime Minister Narendra Modi presented a multi-tiered cooperation roadmap covering maritime security, trade, and digital sovereignty.",
        "status": "Published",
        "isLead": False,
        "isBreaking": False,
        "isInvestigation": False,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 5,
        "location": {"country": "Philippines / India", "state": "Metro Manila", "city": "Manila"},
        "tags": [
            "ASEAN",
            "Narendra Modi",
            "Act East",
            "Indo-Pacific",
            "Maritime Security",
            "Cyber Forensics",
            "Diplomacy"
        ],
        "sources": [
            {
                "id": "src-mea-asean-summit-statement-2026",
                "title": "Official Statement on Prime Minister's Interventions at the 23rd ASEAN-India Summit",
                "publisher": "Ministry of External Affairs (MEA), Government of India",
                "sourceType": "Official statement",
                "publicationDate": "2026-11-17",
                "classification": "Primary",
                "url": "https://mea.gov.in"
            }
        ],
        "content": [
            "**MANILA, PHILIPPINES** — Prime Minister Narendra Modi co-chaired the 23rd ASEAN-India Summit in Manila alongside Philippine President Ferdinand Marcos Jr., setting forth an ambitious strategic roadmap to reinforce maritime safety, counter-piracy operations, and joint digital governance across Southeast Asia.",
            "Addressing the summit plenary, Prime Minister Modi emphasized that the ASEAN region remains the central pillar of India's Act East policy and its wider Indo-Pacific vision.",
            "Among the central proposals announced was the establishment of an ASEAN-India Maritime Domain Awareness Corridor, enabling real-time coastal radar data exchange, humanitarian disaster response logistics, and joint search-and-rescue protocols.",
            "In the technology domain, India offered its proven Digital Public Infrastructure (DPI) stack—including unified payment interfaces and sovereign digital identity architectures—to ASEAN member nations looking to accelerate financial inclusion.",
            "Furthermore, PM Modi announced the creation of an ASEAN-India Cyber Forensic Center to combat cross-border cyber fraud syndicates, encrypted extortion rackets, and illicit financial flows operating across the regional digital space.",
            "The summit concluded with the adoption of a joint declaration reaffirming freedom of navigation and overflight in international waters under the United Nations Convention on the Law of the Sea (UNCLOS)."
        ]
    },
    {
        "id": "art-imd-cyclone-alert-bay-of-bengal",
        "title": "IMD Issues Cyclone Alert Over Bay of Bengal: Eastern Seaboard on High Preparedness for Intensifying Storm",
        "slug": "imd-severe-cyclone-alert-bay-of-bengal-andhra-pradesh-odisha-coast-preparedness",
        "deck": "Meteorological department tracks deep depression projected to intensify into a severe cyclonic storm; NDRF battalions mobilized across coastal Andhra Pradesh and Odisha.",
        "category": "National",
        "categorySlug": "national",
        "subcategory": "Environment & Disaster Management",
        "authorId": "national-bureau",
        "authorKey": "national-bureau",
        "publishedAt": "2026-11-17T06:00:00Z",
        "updatedAt": "2026-11-17T08:00:00Z",
        "excerpt": "The India Meteorological Department has issued widespread weather alerts as a deep atmospheric depression over the central Bay of Bengal accelerates and gathers cyclonic strength, prompting emergency disaster readiness along the Andhra Pradesh and Odisha coastlines.",
        "heroImage": "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "Storm front gathering over the coastal waters. The India Meteorological Department (IMD) has issued advisories for coastal districts and directed fishing fleets to return to harbor immediately.",
        "status": "Published",
        "isLead": False,
        "isBreaking": True,
        "isInvestigation": False,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 4,
        "location": {"country": "India", "state": "Andhra Pradesh / Odisha", "city": "Visakhapatnam / Bhubaneswar"},
        "tags": [
            "IMD",
            "Cyclone",
            "Bay of Bengal",
            "Disaster Management",
            "NDRF",
            "Andhra Pradesh",
            "Odisha"
        ],
        "sources": [
            {
                "id": "src-imd-cyclone-bulletin-2026",
                "title": "Severe Weather Warning Bulletin No. 12: Cyclonic System over Central Bay of Bengal",
                "publisher": "India Meteorological Department (IMD), New Delhi",
                "sourceType": "Government document",
                "publicationDate": "2026-11-17",
                "classification": "Primary",
                "url": "https://mausam.imd.gov.in"
            }
        ],
        "content": [
            "**NEW DELHI / BHUBANESWAR** — The India Meteorological Department (IMD) has sounded severe weather warnings across the eastern coastline as a low-pressure system over the south-central Bay of Bengal intensified into a deep depression, tracking steadily northwestward.",
            "Weather models forecast that the system will intensify into a severe cyclonic storm over the next 24 to 36 hours, packing sustained wind speeds between 95 km/h and 115 km/h, with gusts reaching up to 130 km/h.",
            "Coastal administrations in Andhra Pradesh and southern Odisha have initiated preemptive evacuation plans for vulnerable low-lying fishing hamlets and riverine settlements.",
            "The National Disaster Response Force (NDRF) has pre-positioned 22 specialized search-and-rescue teams equipped with inflatable boats, tree-clearing saws, and satellite emergency communications across vulnerable districts, including Srikakulam, Vizianagaram, Ganjam, and Puri.",
            "Port authorities at Visakhapatnam and Paradip have hoisted Local Cautionary Signal No. 3 and ordered deep-sea trawlers and fishing vessels to return to harbour immediately.",
            "State disaster management authorities stated that relief shelters have been stocked with drinking water, grain supplies, and emergency medical kits to handle potential storm-surge inundation."
        ]
    },
    {
        "id": "art-global-ai-supply-chain-pact",
        "title": "India, United States, and Eight Allied Nations Sign Multilateral Pact to Safeguard Critical AI Hardware Supply Chains",
        "slug": "india-us-eight-nations-sign-pact-secure-resilient-ai-hardware-supply-chains",
        "deck": "Ten-nation coalition establishes binding coordination mechanisms for semiconductor wafer distribution, high-bandwidth memory access, and critical rare-earth refining.",
        "category": "Economy & Business",
        "categorySlug": "economy",
        "subcategory": "Technology Policy & Global Supply Chains",
        "authorId": "economy-bureau",
        "authorKey": "economy-bureau",
        "publishedAt": "2026-11-17T05:30:00Z",
        "updatedAt": "2026-11-17T07:45:00Z",
        "excerpt": "In a decisive move to protect sovereign technological resilience, India, the United States, and eight key partner nations have signed a comprehensive multilateral pact aimed at securing artificial intelligence hardware architectures, advanced lithography tooling, and critical mineral supply chains.",
        "heroImage": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
        "imageCaption": "Advanced silicon wafer and semiconductor packaging facility. Ten signatory nations agreed to establish strategic hardware reserves and coordinated security standards for artificial intelligence compute.",
        "status": "Published",
        "isLead": False,
        "isBreaking": False,
        "isInvestigation": False,
        "isOpinion": False,
        "isFactCheck": False,
        "readTimeMinutes": 5,
        "location": {"country": "Multilateral / India", "state": "Delhi", "city": "New Delhi"},
        "tags": [
            "Artificial Intelligence",
            "Semiconductors",
            "Supply Chains",
            "India-US",
            "Technology Sovereignty",
            "Critical Minerals"
        ],
        "sources": [
            {
                "id": "src-global-ai-pact-declaration-2026",
                "title": "Joint Declaration on Resilient Artificial Intelligence Hardware and Silicon Supply Chains",
                "publisher": "International Technology Security Coalition (ITSC)",
                "sourceType": "Official statement",
                "publicationDate": "2026-11-17",
                "classification": "Primary",
                "url": "https://meity.gov.in"
            }
        ],
        "content": [
            "**NEW DELHI / TOKYO** — In a major multilateral technology agreement, India, the United States, Japan, South Korea, Australia, the United Kingdom, and four allied European partners have signed a joint declaration establishing an international framework to secure artificial intelligence hardware supply chains.",
            "The ten-nation initiative addresses vulnerabilities in the concentration of advanced fabrication facilities, extreme ultraviolet (EUV) lithography systems, and high-bandwidth memory (HBM) production essential for enterprise-scale AI clusters.",
            "Under the agreement, member states will create an early-warning supply chain disruption dashboard and establish reciprocal access protocols to raw gallium, germanium, and refined rare-earth elements.",
            "India's participation solidifies its rising position as a trusted global packaging, design, and assembly hub, directly complementing domestic semiconductor fabrication facilities under construction at Dholera and Sanand.",
            "Union IT Minister Ashwini Vaishnaw highlighted that the pact ensures Indian research institutions and domestic AI startups will enjoy reliable, non-discriminatory access to next-generation compute hardware.",
            "The coalition also established working groups to harmonize standards for AI safety audits, data provenance verification, and tamper-resistant cryptographic hardware modules."
        ]
    }
]

def main():
    print("Connecting to database at:", DB_PATH)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # Clear old articles
    print("Clearing old articles...")
    cur.execute("DELETE FROM article_sources;")
    cur.execute("DELETE FROM case_file_articles;")
    cur.execute("DELETE FROM articles;")

    # Insert sources and articles
    for art in articles_data:
        # Insert sources
        for s in art["sources"]:
            cur.execute("""
                INSERT OR REPLACE INTO sources (
                    id, title, publisher, source_type, classification, publication_date, url, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["id"], s["title"], s["publisher"], s["sourceType"],
                s["classification"], s["publicationDate"], s["url"], NOW
            ))

        # Insert article
        cur.execute("""
            INSERT INTO articles (
                id, title, slug, deck, category, category_slug, subcategory,
                author_id, published_at, updated_at, excerpt, hero_image, image_caption,
                content, pull_quotes, tags, status, article_type, location,
                is_investigation, is_lead, is_breaking, is_opinion, is_fact_check,
                read_time_minutes, created_by, reviewed_by, published_by, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        """, (
            art["id"],
            art["title"],
            art["slug"],
            art["deck"],
            art["category"],
            art["categorySlug"],
            art["subcategory"],
            art["authorId"],
            art["publishedAt"],
            art["updatedAt"],
            art["excerpt"],
            art["heroImage"],
            art["imageCaption"],
            json.dumps(art["content"]),
            json.dumps([]),
            json.dumps(art["tags"]),
            "published",
            "investigation" if art["isInvestigation"] else ("opinion" if art["isOpinion"] else "news"),
            json.dumps(art["location"]),
            1 if art["isInvestigation"] else 0,
            1 if art["isLead"] else 0,
            1 if art["isBreaking"] else 0,
            1 if art["isOpinion"] else 0,
            1 if art["isFactCheck"] else 0,
            art["readTimeMinutes"],
            "admin",
            "editor",
            "editor",
            NOW
        ))

        # Link sources
        for idx, s in enumerate(art["sources"]):
            cur.execute("""
                INSERT OR REPLACE INTO article_sources (id, article_id, source_id, sort_order)
                VALUES (?, ?, ?, ?)
            """, (f"as-{art['id']}-{idx}", art["id"], s["id"], idx))

    con.commit()
    con.close()
    print("Database updated successfully with 6 verified articles.")

    # Generate src/data/articles.ts
    print("Updating static file:", ARTICLES_TS_PATH)
    ts_content = """import { Article } from '../types';
import { AUTHORS } from './authors';

export const ARTICLES: Article[] = [
"""
    for art in articles_data:
        ts_content += "  {\n"
        ts_content += f"    id: {json.dumps(art['id'])},\n"
        ts_content += f"    title: {json.dumps(art['title'])},\n"
        ts_content += f"    slug: {json.dumps(art['slug'])},\n"
        ts_content += f"    deck: {json.dumps(art['deck'])},\n"
        ts_content += f"    category: {json.dumps(art['category'])},\n"
        ts_content += f"    categorySlug: {json.dumps(art['categorySlug'])},\n"
        ts_content += f"    subcategory: {json.dumps(art['subcategory'])},\n"
        ts_content += f"    author: AUTHORS[{json.dumps(art['authorKey'])}],\n"
        ts_content += f"    publishedAt: {json.dumps(art['publishedAt'])},\n"
        ts_content += f"    updatedAt: {json.dumps(art['updatedAt'])},\n"
        ts_content += f"    excerpt: {json.dumps(art['excerpt'])},\n"
        ts_content += f"    heroImage: {json.dumps(art['heroImage'])},\n"
        ts_content += f"    imageCaption: {json.dumps(art['imageCaption'])},\n"
        ts_content += f"    status: {json.dumps(art['status'])},\n"
        ts_content += f"    isLead: {str(art['isLead']).lower()},\n"
        ts_content += f"    isBreaking: {str(art['isBreaking']).lower()},\n"
        ts_content += f"    isInvestigation: {str(art['isInvestigation']).lower()},\n"
        ts_content += f"    isOpinion: {str(art['isOpinion']).lower()},\n"
        ts_content += f"    isFactCheck: {str(art['isFactCheck']).lower()},\n"
        ts_content += f"    readTimeMinutes: {art['readTimeMinutes']},\n"
        ts_content += f"    location: {json.dumps(art['location'])},\n"
        ts_content += f"    tags: {json.dumps(art['tags'], indent=6)},\n"
        ts_content += f"    sources: {json.dumps(art['sources'], indent=6)},\n"
        ts_content += f"    content: {json.dumps(art['content'], indent=6)}\n"
        ts_content += "  },\n"

    ts_content += "];\n"

    with open(ARTICLES_TS_PATH, 'w') as f:
        f.write(ts_content)

    print("articles.ts generated successfully.")

if __name__ == '__main__':
    main()
