#!/usr/bin/env python3
"""
Re-gates all articles to the correct schedule:
  - Articles 1-30:   all published at launch (today / deploy date)
  - Articles 31-230: 5 per day for 40 days
  - Articles 231-500: 1 per weekday (Mon-Fri) ongoing

Then generates any missing articles to reach 500 total.
"""
import json, os, re, time, threading
from pathlib import Path
from datetime import date, timedelta
from openai import OpenAI

DB_PATH = Path(__file__).parent.parent / "src/data/articles-db.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

# ── Schedule config ──────────────────────────────────────────────────────────
LAUNCH_DATE = date(2025, 1, 1)   # day 0 — 30 articles go live immediately
BURST_PER_DAY = 5                 # articles 31-230: 5/day for 40 days
BURST_DAYS = 40
DRIP_PER_WEEK = 5                 # articles 231-500: 1/weekday (Mon-Fri)

def compute_publish_date(index: int) -> str:
    """
    index 0-29   → LAUNCH_DATE (all 30 go live on day 0)
    index 30-229 → LAUNCH_DATE + ceil((index-29)/5) days  (5/day, 40 days)
    index 230+   → after burst ends, 1 per weekday
    """
    if index < 30:
        d = LAUNCH_DATE
    elif index < 30 + BURST_PER_DAY * BURST_DAYS:  # 30-229
        burst_slot = index - 30          # 0-based slot in burst
        day_offset = burst_slot // BURST_PER_DAY + 1
        d = LAUNCH_DATE + timedelta(days=day_offset)
    else:
        # Drip phase: 1 per weekday after burst ends
        burst_end = LAUNCH_DATE + timedelta(days=BURST_DAYS)
        drip_slot = index - (30 + BURST_PER_DAY * BURST_DAYS)  # 0-based
        # Walk forward counting only Mon-Fri
        weekday_count = 0
        candidate = burst_end + timedelta(days=1)
        while weekday_count < drip_slot:
            candidate += timedelta(days=1)
            if candidate.weekday() < 5:  # Mon=0 … Fri=4
                weekday_count += 1
        # Make sure candidate itself is a weekday
        while candidate.weekday() >= 5:
            candidate += timedelta(days=1)
        d = candidate
    return d.isoformat() + "T00:00:00.000Z"

# ── Verify schedule ──────────────────────────────────────────────────────────
print("=== Schedule preview ===")
for i in [0, 29, 30, 34, 229, 230, 231, 235, 499]:
    print(f"  Article {i+1:3d}: {compute_publish_date(i)}")

# ── Re-gate existing articles ────────────────────────────────────────────────
db = json.loads(DB_PATH.read_text())
articles = db["articles"]

# Sort by existing published_at so relative order is preserved
articles.sort(key=lambda a: a.get("published_at", ""))

print(f"\nRe-gating {len(articles)} existing articles...")
for i, article in enumerate(articles):
    new_date = compute_publish_date(i)
    article["published_at"] = new_date
    article["updated_at"] = new_date

db["articles"] = articles
DB_PATH.write_text(json.dumps(db, indent=2))
print(f"Re-gated {len(articles)} articles.")
print(f"  First 30 launch on: {articles[0]['published_at'][:10]}")
print(f"  Article 31 on:      {articles[30]['published_at'][:10]}")
if len(articles) > 229:
    print(f"  Article 230 on:     {articles[229]['published_at'][:10]}")
if len(articles) > 230:
    print(f"  Article 231 on:     {articles[230]['published_at'][:10]}")

# ── Generate missing articles to reach 500 ──────────────────────────────────
NEEDED = 500
current = len(articles)
to_generate = NEEDED - current
print(f"\nNeed {to_generate} more articles to reach 500.")

if to_generate <= 0:
    print("Already at 500+. Done!")
    exit(0)

# Extra topics to fill the gap
FILL_TOPICS = [
    {"title": "Neem and Blood Sugar: Ayurvedic Herb for Modern Metabolic Health", "category": "supplements"},
    {"title": "CoQ10 and Blood Sugar: Mitochondrial Support for Metabolic Health", "category": "supplements"},
    {"title": "Air Pollution and Blood Sugar: The Environmental Metabolic Risk", "category": "lifestyle"},
    {"title": "Ashwagandha and Blood Sugar: Adaptogen Effects on Cortisol and Glucose", "category": "supplements"},
    {"title": "Resveratrol and Insulin Sensitivity: The Red Wine Molecule Explained", "category": "supplements"},
    {"title": "Psyllium Husk and Blood Sugar: Fiber Supplementation for Glucose Control", "category": "supplements"},
    {"title": "Ginseng for Blood Sugar: American vs. Asian Ginseng Compared", "category": "supplements"},
    {"title": "Inositol for Insulin Resistance: Myo-Inositol vs. D-Chiro-Inositol", "category": "supplements"},
    {"title": "Zinc and Blood Sugar: The Mineral Role in Insulin Production", "category": "supplements"},
    {"title": "Vitamin D and Insulin Resistance: The Sunshine Hormone Connection", "category": "supplements"},
    {"title": "Probiotics and Blood Sugar: Gut Bacteria and Glucose Metabolism", "category": "supplements"},
    {"title": "Alpha Lipoic Acid for Blood Sugar: Antioxidant and Insulin Sensitizer", "category": "supplements"},
    {"title": "Gymnema Sylvestre: The Sugar Destroyer Herb for Blood Sugar", "category": "supplements"},
    {"title": "Bitter Melon for Prediabetes: Traditional Remedy Meets Modern Research", "category": "supplements"},
    {"title": "Fenugreek and Blood Sugar: Seeds, Powder, and Extract Compared", "category": "supplements"},
    # More lifestyle
    {"title": "Inflammation and Insulin Resistance: The Immune System Connection", "category": "lifestyle"},
    {"title": "Endocrine Disruptors and Blood Sugar: BPA, Phthalates, and Plastics", "category": "lifestyle"},
    {"title": "Social Isolation and Metabolic Health: The Loneliness-Blood Sugar Link", "category": "lifestyle"},
    {"title": "Work Stress and Blood Sugar: How Your Job Affects Your Glucose", "category": "lifestyle"},
    {"title": "Sauna Use and Blood Sugar: Heat Stress as a Metabolic Tool", "category": "lifestyle"},
    {"title": "Posture and Blood Sugar: How Sitting Position Affects Metabolism", "category": "lifestyle"},
    {"title": "Eating Speed and Blood Sugar: Why Slowing Down Matters", "category": "lifestyle"},
    {"title": "Chewing and Digestion: The Overlooked Factor in Blood Sugar Control", "category": "lifestyle"},
    {"title": "Financial Stress and Prediabetes: The Socioeconomic Blood Sugar Connection", "category": "lifestyle"},
    {"title": "Sunlight Exposure and Blood Sugar: Vitamin D, Circadian Rhythm, and Glucose", "category": "lifestyle"},
    # More mindset
    {"title": "The Emotional Weight of a Prediabetes Diagnosis", "category": "mindset"},
    {"title": "Food Guilt and Blood Sugar: Breaking the Shame Cycle", "category": "mindset"},
    {"title": "Perfectionism and Prediabetes: Why All-or-Nothing Thinking Fails", "category": "mindset"},
    {"title": "Building Self-Efficacy for Prediabetes Reversal", "category": "mindset"},
    {"title": "The Role of Identity in Metabolic Health Change", "category": "mindset"},
    {"title": "Stress Eating and Blood Sugar: Breaking the Cortisol-Glucose Cycle", "category": "mindset"},
    {"title": "Habit Stacking for Prediabetes: Linking New Behaviors to Existing Ones", "category": "mindset"},
    {"title": "The Neuroscience of Sugar Cravings: Why You Want What Spikes You", "category": "mindset"},
    {"title": "Dealing with Unsupportive Family Members During Prediabetes Reversal", "category": "mindset"},
    {"title": "Celebrating Non-Scale Victories in Prediabetes Reversal", "category": "mindset"},
    # More diagnosis
    {"title": "Adiponectin: The Fat Cell Hormone That Protects Against Diabetes", "category": "diagnosis"},
    {"title": "Leptin Resistance and Blood Sugar: The Hunger-Glucose Connection", "category": "diagnosis"},
    {"title": "Uric Acid and Insulin Resistance: The Overlooked Connection", "category": "diagnosis"},
    {"title": "Ferritin and Blood Sugar: What High Iron Levels Mean for Metabolic Health", "category": "diagnosis"},
    {"title": "The Somogyi Effect: Overnight Hypoglycemia and Morning Highs", "category": "diagnosis"},
    {"title": "Prediabetes in Children and Teens: An Emerging Crisis", "category": "diagnosis"},
    {"title": "Gestational Diabetes: Risk Factors and Long-Term Implications", "category": "diagnosis"},
    {"title": "Metabolic Syndrome: The Cluster of Conditions That Predict Diabetes", "category": "diagnosis"},
    {"title": "Reactive Hypoglycemia: When Blood Sugar Crashes After Meals", "category": "diagnosis"},
    {"title": "The Dawn Phenomenon: Why Blood Sugar Rises Overnight", "category": "diagnosis"},
    # More diet
    {"title": "The Glycemic Index vs. Glycemic Load: What Actually Matters", "category": "diet"},
    {"title": "Resistant Starch: The Carb That Feeds Your Gut and Lowers Blood Sugar", "category": "diet"},
    {"title": "Vinegar and Blood Sugar: The Science Behind Apple Cider Vinegar", "category": "diet"},
    {"title": "Protein and Blood Sugar: How Much Protein Is Optimal for Glucose Control", "category": "diet"},
    {"title": "Fat and Blood Sugar: Why Dietary Fat Affects Insulin Sensitivity", "category": "diet"},
    {"title": "Fiber Types and Blood Sugar: Soluble vs. Insoluble Fiber Explained", "category": "diet"},
    {"title": "Ketogenic Diet for Prediabetes: Benefits, Risks, and How to Start", "category": "diet"},
    {"title": "Alcohol and Blood Sugar: How Drinking Affects Glucose and Insulin", "category": "diet"},
    {"title": "Artificial Sweeteners and Blood Sugar: Do They Actually Raise Insulin?", "category": "diet"},
    {"title": "Ultra-Processed Foods and Insulin Resistance: The Hidden Driver", "category": "diet"},
    {"title": "Seed Oils and Metabolic Health: What the Research Says", "category": "diet"},
    {"title": "Dark Chocolate and Blood Sugar: The Flavonoid Connection", "category": "diet"},
    {"title": "Coffee and Blood Sugar: Why Your Morning Cup Has Metabolic Effects", "category": "diet"},
    {"title": "Meal Prep for Blood Sugar Control: A Weekly Strategy Guide", "category": "diet"},
    {"title": "Restaurant Eating with Prediabetes: How to Order Without Spiking", "category": "diet"},
    {"title": "Reading Food Labels for Blood Sugar: What Numbers Actually Matter", "category": "diet"},
    {"title": "Snacking and Blood Sugar: When to Snack and What to Eat", "category": "diet"},
    {"title": "Breakfast and Blood Sugar: The Most Important Meal for Glucose Control", "category": "diet"},
    {"title": "The Role of Omega-3 Fatty Acids in Insulin Sensitivity", "category": "diet"},
    {"title": "Fermented Foods and Blood Sugar: Kefir, Kimchi, and Sauerkraut", "category": "diet"},
    # More exercise
    {"title": "HIIT for Blood Sugar: High-Intensity Intervals and Glucose Control", "category": "exercise"},
    {"title": "Yoga and Blood Sugar: The Evidence for Mind-Body Movement", "category": "exercise"},
    {"title": "Cycling for Prediabetes: Indoor and Outdoor Options Compared", "category": "exercise"},
    {"title": "Resistance Bands for Blood Sugar: A Home Workout Guide", "category": "exercise"},
    {"title": "Exercise Timing and Blood Sugar: Morning vs. Evening Workouts", "category": "exercise"},
    {"title": "Non-Exercise Activity Thermogenesis (NEAT): Why Fidgeting Matters", "category": "exercise"},
    {"title": "Exercise and Insulin Sensitivity: The Cellular Mechanisms Explained", "category": "exercise"},
    {"title": "Overtraining and Blood Sugar: When Too Much Exercise Raises Cortisol", "category": "exercise"},
    {"title": "Tai Chi for Blood Sugar: Ancient Movement for Modern Metabolic Health", "category": "exercise"},
    {"title": "Stair Climbing and Blood Sugar: The Underrated Daily Exercise", "category": "exercise"},
    {"title": "Gardening and Blood Sugar: Why Outdoor Activity Counts", "category": "exercise"},
    {"title": "Exercise with Joint Pain: Low-Impact Options for Prediabetes", "category": "exercise"},
    {"title": "Building a Sustainable Exercise Habit for Blood Sugar Control", "category": "exercise"},
    {"title": "Cold Exposure and Blood Sugar: Ice Baths, Cold Showers, and Glucose", "category": "exercise"},
    # More monitoring
    {"title": "Blood Sugar Patterns: How to Read Your Glucose Data Like a Pro", "category": "monitoring"},
    {"title": "Food Journaling for Blood Sugar: What to Track and Why", "category": "monitoring"},
    {"title": "Time in Range: The CGM Metric That Matters More Than A1c", "category": "monitoring"},
    {"title": "Glucose Variability: Why Spikes and Crashes Are Worse Than High Averages", "category": "monitoring"},
    {"title": "Libre vs. Dexcom: Comparing CGM Systems for Non-Diabetics", "category": "monitoring"},
    {"title": "Wearable Technology for Metabolic Health: Beyond CGMs", "category": "monitoring"},
    {"title": "Tracking Sleep and Blood Sugar: The Data Connection", "category": "monitoring"},
    {"title": "Heart Rate Variability and Metabolic Health: What HRV Tells You", "category": "monitoring"},
    {"title": "Body Composition vs. BMI: Why Weight Alone Misses the Point", "category": "monitoring"},
    {"title": "Waist-to-Height Ratio: The Simple Measurement That Predicts Metabolic Risk", "category": "monitoring"},
    {"title": "Lab Tests Every Prediabetic Should Request Annually", "category": "monitoring"},
    {"title": "Tracking Macros for Blood Sugar: Do You Need to Count Carbs?", "category": "monitoring"},
    {"title": "Using Apps to Manage Prediabetes: The Best Tools Reviewed", "category": "monitoring"},
    {"title": "How to Interpret Your CGM Data: Peaks, Valleys, and Trends", "category": "monitoring"},
    {"title": "Ketone Testing for Blood Sugar Management: When and Why", "category": "monitoring"},
    # More reversal
    {"title": "The DiRECT Trial: What the UK Diabetes Reversal Study Actually Proved", "category": "reversal"},
    {"title": "Very Low Calorie Diets for Prediabetes: Evidence and Safety", "category": "reversal"},
    {"title": "Bariatric Surgery and Blood Sugar: When Is Surgery the Right Choice?", "category": "reversal"},
    {"title": "Prediabetes Reversal After 50: What Changes and What Doesn't", "category": "reversal"},
    {"title": "Prediabetes Reversal After 60: Age-Specific Strategies That Work", "category": "reversal"},
    {"title": "Prediabetes in Men: Unique Risk Factors and Reversal Strategies", "category": "reversal"},
    {"title": "Prediabetes in Women: Hormonal Factors and Gender-Specific Approaches", "category": "reversal"},
    {"title": "Maintaining Prediabetes Reversal: How to Keep Your A1c Normal Long-Term", "category": "reversal"},
    {"title": "Prediabetes Reversal and Weight Loss: How Much Weight Do You Need to Lose?", "category": "reversal"},
    {"title": "The Role of Muscle Mass in Prediabetes Reversal", "category": "reversal"},
    {"title": "Prediabetes Reversal Without Weight Loss: Is It Possible?", "category": "reversal"},
    {"title": "Liver Fat and Prediabetes Reversal: The Hepatic Connection", "category": "reversal"},
    {"title": "Pancreatic Beta Cell Recovery: Can Your Insulin Production Come Back?", "category": "reversal"},
    {"title": "Prediabetes Reversal Programs: Comparing CDC-Recognized Options", "category": "reversal"},
    # More medication
    {"title": "GLP-1 Agonists for Prediabetes: Ozempic, Wegovy, and the Evidence", "category": "medication"},
    {"title": "SGLT2 Inhibitors and Blood Sugar: Beyond Diabetes Treatment", "category": "medication"},
    {"title": "Acarbose for Prediabetes: The Carb Blocker That Works", "category": "medication"},
    {"title": "Thiazolidinediones for Insulin Resistance: Benefits and Risks", "category": "medication"},
    {"title": "Statins and Blood Sugar: Does Cholesterol Medication Raise Glucose?", "category": "medication"},
    {"title": "Beta-Blockers and Blood Sugar: How Heart Medications Affect Glucose", "category": "medication"},
    {"title": "Corticosteroids and Blood Sugar: Managing Steroid-Induced Hyperglycemia", "category": "medication"},
    {"title": "Antidepressants and Blood Sugar: The Metabolic Side Effects You Should Know", "category": "medication"},
    {"title": "Antipsychotics and Metabolic Syndrome: Managing Medication-Induced Risk", "category": "medication"},
    {"title": "Transitioning Off Metformin: When and How to Taper", "category": "medication"},
    {"title": "Natural Alternatives to Metformin: What the Evidence Shows", "category": "medication"},
    {"title": "Combination Therapy for Prediabetes: Medication Plus Lifestyle", "category": "medication"},
    {"title": "Precision Medicine for Prediabetes: Pharmacogenomics and Personalized Treatment", "category": "medication"},
    {"title": "Over-the-Counter Blood Sugar Supplements vs. Prescription Medications", "category": "medication"},
    {"title": "Insulin Therapy for Prediabetes: When Is It Considered?", "category": "medication"},
]

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
    return faqs

def strip_md(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[#*\[\]`_]', '', text)
    return re.sub(r'\s+', ' ', text).strip()

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")

def generate(topic):
    cat_labels = {
        "diagnosis": "Diagnosis & Testing", "diet": "Diet & Nutrition",
        "exercise": "Exercise & Movement", "supplements": "Supplements",
        "monitoring": "Monitoring & Tracking", "lifestyle": "Lifestyle Factors",
        "mindset": "Mindset & Psychology", "reversal": "Reversal Protocols",
        "medication": "Medication & Treatment",
    }
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com. Science-backed, direct, zero food guilt, empowering. Write for intelligent adults.

Write a comprehensive article: "{topic['title']}"
Category: {cat_labels.get(topic['category'], topic['category'])}

REQUIREMENTS:
- 1800-2200 words minimum
- Start with ## TL;DR (3-4 bullet points)
- At least 4 H2 headings
- At least 3 research citations [Author et al., Year]
- At least 1 external link to PubMed, NIH, or ADA
- End with ## Bottom Line
- Include 5 FAQs at the end:
FAQ: Question?
ANSWER: 2-3 sentence answer.

Write the full article now, starting with ## TL;DR"""

    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3500,
                temperature=0.72,
            )
            body = resp.choices[0].message.content
            wc = len(body.split())
            if wc >= 1500:
                return body, wc
            print(f"  QG fail ({wc}w), retry {attempt+1}", flush=True)
        except Exception as e:
            print(f"  API error: {e}", flush=True)
            time.sleep(3)
    return None, 0

db_lock = threading.Lock()

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
    for topic in topics_chunk:
        body, wc = generate(topic)
        if not body:
            print(f"[T{thread_id}] SKIP {topic['slug'][:40]}", flush=True)
            continue
        faqs = extract_faqs(body)
        clean = strip_md(body)
        article = {
            "id": time.time() + thread_id * 0.001,
            "slug": topic["slug"],
            "title": topic["title"],
            "category": topic["category"],
            "body": body,
            "excerpt": clean[:280] + "...",
            "hero_url": CATEGORY_IMAGES.get(topic["category"], CATEGORY_IMAGES["diagnosis"]),
            "reading_time": max(5, round(wc / 200)),
            "word_count": wc,
            "faqs": json.dumps(faqs),
            "status": "published",
            "published_at": "PLACEHOLDER",  # will be re-gated after all done
            "updated_at": "PLACEHOLDER",
            "meta_title": topic["title"],
            "meta_description": clean[:155],
        }
        count = save_article(article)
        if count:
            done += 1
            print(f"[T{thread_id}] ✓ {wc}w {topic['title'][:45]}... (DB: {count})", flush=True)
    results[thread_id] = done

# Filter to only missing slugs
db_now = json.loads(DB_PATH.read_text())
existing_slugs = {a['slug'] for a in db_now['articles']}
remaining = []
for t in FILL_TOPICS:
    t['slug'] = slugify(t['title'])
    if t['slug'] not in existing_slugs and len(remaining) < to_generate:
        remaining.append(t)

print(f"Generating {len(remaining)} new articles...")

if remaining:
    N_THREADS = min(12, len(remaining))
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

# Final re-gate pass with correct dates
db_final = json.loads(DB_PATH.read_text())
db_final['articles'].sort(key=lambda a: a.get('published_at', ''))
for i, article in enumerate(db_final['articles']):
    d = compute_publish_date(i)
    article['published_at'] = d
    article['updated_at'] = d

DB_PATH.write_text(json.dumps(db_final, indent=2))

total = len(db_final['articles'])
print(f"\n{'='*50}")
print(f"FINAL DB: {total} articles")
print(f"Schedule:")
print(f"  Articles 1-30:   launch on {compute_publish_date(0)[:10]}")
print(f"  Articles 31-230: {compute_publish_date(30)[:10]} → {compute_publish_date(229)[:10]} (5/day, 40 days)")
if total > 230:
    print(f"  Articles 231+:   {compute_publish_date(230)[:10]} → {compute_publish_date(min(total-1,499))[:10]} (1/weekday)")
cats = {}
for a in db_final['articles']:
    cats[a['category']] = cats.get(a['category'], 0) + 1
for k, v in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")
