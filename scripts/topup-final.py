#!/usr/bin/env python3
"""Generate exactly enough articles to reach 500, using fresh unique topics."""
import json, os, re, time, threading
from pathlib import Path
from datetime import date, timedelta
from openai import OpenAI

DB_PATH = Path(__file__).parent.parent / "src/data/articles-db.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
LAUNCH_DATE = date(2025, 1, 1)

def compute_publish_date(index: int) -> str:
    if index < 30:
        d = LAUNCH_DATE
    elif index < 230:
        burst_slot = index - 30
        day_offset = burst_slot // 5 + 1
        d = LAUNCH_DATE + timedelta(days=day_offset)
    else:
        burst_end = LAUNCH_DATE + timedelta(days=40)
        drip_slot = index - 230
        weekday_count = 0
        candidate = burst_end + timedelta(days=1)
        while weekday_count < drip_slot:
            candidate += timedelta(days=1)
            if candidate.weekday() < 5:
                weekday_count += 1
        while candidate.weekday() >= 5:
            candidate += timedelta(days=1)
        d = candidate
    return d.isoformat() + "T00:00:00.000Z"

CATEGORY_IMAGES = {
    "diagnosis": "https://glucose-managed.b-cdn.net/images/hero-diagnosis.webp",
    "diet": "https://glucose-managed.b-cdn.net/images/hero-diet.webp",
    "exercise": "https://glucose-managed.b-cdn.net/images/hero-exercise.webp",
    "supplements": "https://glucose-managed.b-cdn.net/images/hero-supplements.webp",
    "monitoring": "https://glucose-managed.b-cdn.net/images/hero-monitoring.webp",
    "lifestyle": "https://glucose-managed.b-cdn.net/images/hero-lifestyle.webp",
    "mindset": "https://glucose-managed.b-cdn.net/images/hero-mindset.webp",
    "reversal": "https://glucose-managed.b-cdn.net/images/hero-reversal.webp",
    "medication": "https://glucose-managed.b-cdn.net/images/hero-diagnosis.webp",
}

CAT_LABELS = {
    "diagnosis": "Diagnosis & Testing", "diet": "Diet & Nutrition",
    "exercise": "Exercise & Movement", "supplements": "Supplements",
    "monitoring": "Monitoring & Tracking", "lifestyle": "Lifestyle Factors",
    "mindset": "Mindset & Psychology", "reversal": "Reversal Protocols",
    "medication": "Medication & Treatment",
}

FRESH_TOPICS = [
    ("Prediabetes and Sleep Apnea: The Bidirectional Relationship", "lifestyle"),
    ("Insulin Resistance in Teenagers: Early Warning Signs and Prevention", "diagnosis"),
    ("The Role of Adipose Tissue Inflammation in Prediabetes", "diagnosis"),
    ("Prediabetes and Polycystic Ovary Syndrome: Managing Both Conditions", "lifestyle"),
    ("How to Talk to Your Doctor About Prediabetes Test Results", "diagnosis"),
    ("Prediabetes Reversal: A 90-Day Action Plan", "reversal"),
    ("Understanding Your Fasting Insulin Level: The Test Doctors Rarely Order", "diagnosis"),
    ("The Triglyceride-to-HDL Ratio: A Better Insulin Resistance Marker Than A1c", "diagnosis"),
    ("Prediabetes and Skin Tags: The Dermatological Connection to Insulin Resistance", "diagnosis"),
    ("Acanthosis Nigricans: The Skin Sign That Predicts Insulin Resistance", "diagnosis"),
    ("Prediabetes and Erectile Dysfunction: The Vascular Connection", "lifestyle"),
    ("How Prediabetes Affects Your Immune System", "diagnosis"),
    ("The Liver's Role in Blood Sugar: Hepatic Glucose Production Explained", "diagnosis"),
    ("Prediabetes and Hearing Loss: The Overlooked Metabolic Connection", "lifestyle"),
    ("Prediabetes and Cognitive Decline: Protecting Your Brain from Glucose Dysregulation", "lifestyle"),
    ("Resistant Exercise for Insulin Sensitivity: A Progressive Program", "exercise"),
    ("Zone 2 Cardio for Blood Sugar: The Optimal Training Intensity for Metabolic Health", "exercise"),
    ("Pilates for Blood Sugar: Core Strength and Metabolic Benefits", "exercise"),
    ("Hiking and Blood Sugar: Nature, Movement, and Metabolic Health", "exercise"),
    ("Dance and Blood Sugar: Joyful Movement as Medicine", "exercise"),
    ("Electrolytes and Blood Sugar: Sodium, Potassium, and Magnesium Balance", "diet"),
    ("Collagen and Blood Sugar: Glycine, Proline, and Metabolic Effects", "diet"),
    ("Bone Broth and Blood Sugar: Gut Healing and Metabolic Benefits", "diet"),
    ("The Carnivore Elimination Diet for Prediabetes: A 30-Day Protocol", "diet"),
    ("Seed Cycling and Blood Sugar: Hormonal Balance and Glucose Metabolism", "diet"),
    ("Mindfulness-Based Stress Reduction for Prediabetes: An 8-Week Protocol", "mindset"),
    ("The Science of Willpower and Blood Sugar: Glucose, Decisions, and Self-Control", "mindset"),
    ("Gratitude Practice and Metabolic Health: The Psychoneuroimmunology Connection", "mindset"),
    ("Sleep Restriction and Blood Sugar: What One Bad Night Does to Your Glucose", "monitoring"),
    ("Prediabetes and Menstrual Cycle: How Your Cycle Affects Blood Sugar", "lifestyle"),
]

def slugify(title):
    s = title.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    return re.sub(r'-+', '-', s)[:80]

def extract_faqs(body):
    faqs = []
    pattern = re.compile(r'FAQ:\s*(.+?)\?\s*\nANSWER:\s*(.+?)(?=\nFAQ:|\n##|$)', re.DOTALL)
    for m in pattern.finditer(body):
        faqs.append({"q": m.group(1).strip() + "?", "a": m.group(2).strip()})
    if not faqs:
        lines = body.split('\n')
        for i, line in enumerate(lines):
            if '?' in line and ('**' in line or line.strip().startswith('Q:')):
                q = re.sub(r'[*#]', '', line).strip().lstrip('Q:').strip()
                a = lines[i+1].strip() if i+1 < len(lines) else ""
                a = re.sub(r'[*#]', '', a).strip().lstrip('A:').strip()
                if q and a and len(q) > 10:
                    faqs.append({"q": q, "a": a})
    return faqs[:5]

def strip_md(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[#*\[\]`_]', '', text)
    return re.sub(r'\s+', ' ', text).strip()

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")
db_lock = threading.Lock()

def generate(title, category):
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com. Science-backed, direct, zero food guilt, empowering. Write for intelligent adults.

Write a comprehensive article: "{title}"
Category: {CAT_LABELS.get(category, category)}

REQUIREMENTS:
- MINIMUM 1800 words
- Start with ## TL;DR (3-4 bullet points)
- At least 4 H2 headings
- At least 3 research citations [Author et al., Year]
- At least 1 external link to PubMed or NIH
- End with ## Bottom Line
- End with 5 FAQs:
FAQ: Question?
ANSWER: 2-3 sentence answer.

Write the complete article:"""

    for attempt in range(4):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.72,
            )
            body = resp.choices[0].message.content
            wc = len(body.split())
            if wc >= 1400:
                return body, wc
            print(f"  QG fail ({wc}w), retry {attempt+1}", flush=True)
        except Exception as e:
            print(f"  API error: {e}", flush=True)
            time.sleep(5)
    return None, 0

def save_article(article):
    with db_lock:
        db = json.loads(DB_PATH.read_text())
        slugs = {a['slug'] for a in db['articles']}
        if article['slug'] not in slugs:
            db['articles'].append(article)
            DB_PATH.write_text(json.dumps(db, indent=2))
            return len(db['articles'])
        return 0

def worker(topics_chunk, thread_id, results):
    done = 0
    for title, category in topics_chunk:
        slug = slugify(title)
        body, wc = generate(title, category)
        if not body:
            print(f"[T{thread_id}] SKIP {slug[:45]}", flush=True)
            continue
        faqs = extract_faqs(body)
        clean = strip_md(body)
        article = {
            "id": time.time() + thread_id * 0.001,
            "slug": slug,
            "title": title,
            "category": category,
            "body": body,
            "excerpt": clean[:280] + "...",
            "hero_url": CATEGORY_IMAGES.get(category, CATEGORY_IMAGES["diagnosis"]),
            "reading_time": max(5, round(wc / 200)),
            "word_count": wc,
            "faqs": json.dumps(faqs),
            "status": "published",
            "published_at": "PLACEHOLDER",
            "updated_at": "PLACEHOLDER",
            "meta_title": title,
            "meta_description": clean[:155],
        }
        count = save_article(article)
        if count:
            done += 1
            print(f"[T{thread_id}] ✓ {wc}w {title[:45]}... (DB: {count})", flush=True)
    results[thread_id] = done

# Main
db = json.loads(DB_PATH.read_text())
existing_slugs = {a['slug'] for a in db['articles']}
current = len(db['articles'])
needed = max(0, 500 - current)
print(f"Current: {current} | Need: {needed} more to reach 500")

remaining = [(t, c) for t, c in FRESH_TOPICS if slugify(t) not in existing_slugs][:needed]
print(f"Generating {len(remaining)} articles...")

if remaining:
    N_THREADS = min(10, len(remaining))
    chunk_size = max(1, len(remaining) // N_THREADS)
    chunks = [remaining[i:i+chunk_size] for i in range(0, len(remaining), chunk_size)]
    threads = []
    results = {}
    for i, chunk in enumerate(chunks):
        t = threading.Thread(target=worker, args=(chunk, i, results))
        t.start()
        threads.append(t)
    for t in threads:
        t.join()
    generated = sum(results.values())
    print(f"Generated: {generated}")

# Final re-gate
db_final = json.loads(DB_PATH.read_text())
db_final['articles'].sort(key=lambda a: a.get('published_at', ''))
for i, article in enumerate(db_final['articles']):
    d = compute_publish_date(i)
    article['published_at'] = d
    article['updated_at'] = d
DB_PATH.write_text(json.dumps(db_final, indent=2))

total = len(db_final['articles'])
print(f"\n{'='*50}")
print(f"FINAL: {total} articles")
print(f"  Launch (1-30):  {compute_publish_date(0)[:10]}")
print(f"  Burst (31-230): {compute_publish_date(30)[:10]} → {compute_publish_date(229)[:10]} (5/day, 40 days)")
if total > 230:
    print(f"  Drip (231-{total}): {compute_publish_date(230)[:10]} → {compute_publish_date(total-1)[:10]} (1/weekday)")
cats = {}
for a in db_final['articles']:
    cats[a['category']] = cats.get(a['category'], 0) + 1
for k, v in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")
