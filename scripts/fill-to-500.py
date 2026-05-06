#!/usr/bin/env python3
"""Generate articles to fill the DB to 500 total, then re-gate all dates."""
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
    elif index < 30 + 5 * 40:  # 30-229
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

ALL_TOPICS = [
    # ── DIET (80 total target) ──────────────────────────────────────────────
    ("The Glycemic Index vs. Glycemic Load: What Actually Matters for Blood Sugar", "diet"),
    ("Resistant Starch: The Carb That Feeds Your Gut and Lowers Blood Sugar", "diet"),
    ("Vinegar and Blood Sugar: The Science Behind Apple Cider Vinegar", "diet"),
    ("Protein and Blood Sugar: How Much Protein Is Optimal for Glucose Control", "diet"),
    ("Fiber Types and Blood Sugar: Soluble vs. Insoluble Fiber Explained", "diet"),
    ("Ketogenic Diet for Prediabetes: Benefits, Risks, and How to Start", "diet"),
    ("Alcohol and Blood Sugar: How Drinking Affects Glucose and Insulin", "diet"),
    ("Artificial Sweeteners and Blood Sugar: Do They Actually Raise Insulin?", "diet"),
    ("Ultra-Processed Foods and Insulin Resistance: The Hidden Driver", "diet"),
    ("Seed Oils and Metabolic Health: What the Research Actually Says", "diet"),
    ("Dark Chocolate and Blood Sugar: The Flavonoid Connection", "diet"),
    ("Coffee and Blood Sugar: Why Your Morning Cup Has Metabolic Effects", "diet"),
    ("Meal Prep for Blood Sugar Control: A Weekly Strategy Guide", "diet"),
    ("Restaurant Eating with Prediabetes: How to Order Without Spiking", "diet"),
    ("Reading Food Labels for Blood Sugar: What Numbers Actually Matter", "diet"),
    ("Snacking and Blood Sugar: When to Snack and What to Eat", "diet"),
    ("Breakfast and Blood Sugar: The Most Important Meal for Glucose Control", "diet"),
    ("Omega-3 Fatty Acids and Insulin Sensitivity: The Evidence", "diet"),
    ("Fermented Foods and Blood Sugar: Kefir, Kimchi, and Sauerkraut", "diet"),
    ("Mediterranean Diet for Prediabetes: The Gold Standard Explained", "diet"),
    ("DASH Diet and Blood Sugar: Beyond Blood Pressure Benefits", "diet"),
    ("Plant-Based Diet for Prediabetes: Benefits and Pitfalls", "diet"),
    ("Carnivore Diet and Blood Sugar: What Happens When You Eat Only Meat", "diet"),
    ("Paleo Diet for Prediabetes: Ancestral Eating and Modern Metabolism", "diet"),
    ("Whole30 and Blood Sugar: A Month-Long Reset for Metabolic Health", "diet"),
    ("Portion Control for Blood Sugar: The Plate Method Explained", "diet"),
    ("Eating Windows and Blood Sugar: How Meal Timing Affects Glucose", "diet"),
    ("The Role of Magnesium in Blood Sugar: Food Sources vs. Supplements", "diet"),
    ("Potassium and Blood Sugar: The Electrolyte That Supports Insulin", "diet"),
    ("Chromium and Blood Sugar: The Trace Mineral for Glucose Tolerance", "diet"),
    ("Nuts and Blood Sugar: Which Nuts Are Best for Metabolic Health", "diet"),
    ("Berries and Blood Sugar: Why Blueberries Are a Metabolic Superfood", "diet"),
    ("Leafy Greens and Blood Sugar: The Nitrate-Insulin Connection", "diet"),
    ("Legumes and Blood Sugar: Are Beans Good or Bad for Prediabetes", "diet"),
    ("Dairy and Blood Sugar: Cheese, Yogurt, and Milk Compared", "diet"),
    ("Eggs and Blood Sugar: The Complete Protein for Metabolic Health", "diet"),
    ("Avocado and Blood Sugar: Healthy Fats for Insulin Sensitivity", "diet"),
    ("Olive Oil and Blood Sugar: The Mediterranean Fat That Protects Metabolism", "diet"),
    ("Coconut Oil and Blood Sugar: MCTs and Metabolic Effects", "diet"),
    ("Spices and Blood Sugar: Turmeric, Ginger, Garlic, and More", "diet"),
    ("Intermittent Fasting for Prediabetes: 16:8, 5:2, and OMAD Compared", "diet"),
    ("Extended Fasting and Blood Sugar: 24-72 Hour Fasts for Metabolic Reset", "diet"),
    ("Meal Timing and Blood Sugar: Why When You Eat Matters as Much as What", "diet"),
    ("Food Order and Blood Sugar: Eating Vegetables First to Blunt Spikes", "diet"),
    ("Cooking Methods and Blood Sugar: How Preparation Affects Glycemic Response", "diet"),
    ("Processed Meat and Blood Sugar: Hot Dogs, Bacon, and Metabolic Risk", "diet"),
    ("Red Meat and Blood Sugar: Saturated Fat, Heme Iron, and Insulin", "diet"),
    ("Fish and Blood Sugar: Omega-3s, Protein, and Metabolic Benefits", "diet"),
    ("Bread and Blood Sugar: Sourdough, Whole Grain, and White Compared", "diet"),
    ("Rice and Blood Sugar: White, Brown, and Cauliflower Rice Options", "diet"),
    ("Pasta and Blood Sugar: Al Dente Cooking and Resistant Starch", "diet"),
    ("Potatoes and Blood Sugar: Sweet Potatoes vs. White Potatoes", "diet"),
    ("Corn and Blood Sugar: A High-Glycemic Vegetable Examined", "diet"),
    ("Fruit and Blood Sugar: Which Fruits Are Safe for Prediabetes", "diet"),
    ("Juice and Blood Sugar: Why Liquid Sugar Is Worse Than Solid Sugar", "diet"),
    ("Soda and Blood Sugar: Diet Soda, Regular Soda, and Metabolic Risk", "diet"),
    ("Tea and Blood Sugar: Green Tea, Black Tea, and Metabolic Benefits", "diet"),
    ("Water and Blood Sugar: Hydration's Role in Glucose Control", "diet"),
    ("Meal Replacement Shakes and Blood Sugar: Are They Safe for Prediabetes", "diet"),
    ("Protein Bars and Blood Sugar: Hidden Sugars and Glycemic Traps", "diet"),
    # ── SUPPLEMENTS (40 total target) ──────────────────────────────────────
    ("Neem and Blood Sugar: Ayurvedic Herb for Modern Metabolic Health", "supplements"),
    ("CoQ10 and Blood Sugar: Mitochondrial Support for Metabolic Health", "supplements"),
    ("Ashwagandha and Blood Sugar: Adaptogen Effects on Cortisol and Glucose", "supplements"),
    ("Resveratrol and Insulin Sensitivity: The Red Wine Molecule Explained", "supplements"),
    ("Psyllium Husk and Blood Sugar: Fiber Supplementation for Glucose Control", "supplements"),
    ("Ginseng for Blood Sugar: American vs. Asian Ginseng Compared", "supplements"),
    ("Inositol for Insulin Resistance: Myo-Inositol vs. D-Chiro-Inositol", "supplements"),
    ("Zinc and Blood Sugar: The Mineral Role in Insulin Production", "supplements"),
    ("Vitamin D and Insulin Resistance: The Sunshine Hormone Connection", "supplements"),
    ("Probiotics and Blood Sugar: Gut Bacteria and Glucose Metabolism", "supplements"),
    ("Alpha Lipoic Acid for Blood Sugar: Antioxidant and Insulin Sensitizer", "supplements"),
    ("Gymnema Sylvestre: The Sugar Destroyer Herb for Blood Sugar", "supplements"),
    ("Bitter Melon for Prediabetes: Traditional Remedy Meets Modern Research", "supplements"),
    ("Fenugreek and Blood Sugar: Seeds, Powder, and Extract Compared", "supplements"),
    ("Vitamin B12 and Blood Sugar: Metformin Depletion and Supplementation", "supplements"),
    ("Vitamin C and Blood Sugar: Antioxidant Protection for Metabolic Health", "supplements"),
    ("Vitamin E and Insulin Resistance: Tocopherol and Tocotrienol Effects", "supplements"),
    ("Iron and Blood Sugar: When Too Much Iron Raises Metabolic Risk", "supplements"),
    ("Selenium and Blood Sugar: The Trace Mineral and Insulin Signaling", "supplements"),
    ("Vanadium and Blood Sugar: The Insulin-Mimicking Mineral", "supplements"),
    ("Boron and Blood Sugar: The Overlooked Mineral for Metabolic Health", "supplements"),
    ("Quercetin and Blood Sugar: The Flavonoid That Improves Insulin Sensitivity", "supplements"),
    ("EGCG and Blood Sugar: Green Tea Extract for Metabolic Health", "supplements"),
    ("Curcumin and Blood Sugar: Turmeric's Active Compound for Prediabetes", "supplements"),
    ("Cinnamon and Blood Sugar: Separating Fact from Fiction", "supplements"),
    ("Berberine vs. Metformin: A Head-to-Head Comparison for Prediabetes", "supplements"),
    ("Magnesium and Blood Sugar: The Most Important Mineral for Glucose Control", "supplements"),
    ("Chromium Picolinate for Blood Sugar: Dosing and Evidence", "supplements"),
    ("NAC and Blood Sugar: N-Acetyl Cysteine for Oxidative Stress and Glucose", "supplements"),
    ("Melatonin and Blood Sugar: Sleep Hormone Effects on Glucose Metabolism", "supplements"),
    # ── LIFESTYLE (40 total target) ─────────────────────────────────────────
    ("Air Pollution and Blood Sugar: The Environmental Metabolic Risk", "lifestyle"),
    ("Endocrine Disruptors and Blood Sugar: BPA, Phthalates, and Plastics", "lifestyle"),
    ("Social Isolation and Metabolic Health: The Loneliness-Blood Sugar Link", "lifestyle"),
    ("Work Stress and Blood Sugar: How Your Job Affects Your Glucose", "lifestyle"),
    ("Sauna Use and Blood Sugar: Heat Stress as a Metabolic Tool", "lifestyle"),
    ("Eating Speed and Blood Sugar: Why Slowing Down Matters", "lifestyle"),
    ("Chewing and Digestion: The Overlooked Factor in Blood Sugar Control", "lifestyle"),
    ("Financial Stress and Prediabetes: The Socioeconomic Connection", "lifestyle"),
    ("Sunlight Exposure and Blood Sugar: Vitamin D, Circadian Rhythm, and Glucose", "lifestyle"),
    ("Inflammation and Insulin Resistance: The Immune System Connection", "lifestyle"),
    ("Posture and Blood Sugar: How Sitting Position Affects Metabolism", "lifestyle"),
    ("Shift Work and Blood Sugar: Circadian Disruption and Metabolic Risk", "lifestyle"),
    ("Travel and Blood Sugar: Managing Glucose on the Road", "lifestyle"),
    ("Alcohol Cessation and Blood Sugar: What Happens When You Stop Drinking", "lifestyle"),
    ("Smoking Cessation and Blood Sugar: How Quitting Improves Insulin Sensitivity", "lifestyle"),
    ("Gut Health and Blood Sugar: The Microbiome-Glucose Connection", "lifestyle"),
    ("Oral Health and Blood Sugar: The Gum Disease-Diabetes Link", "lifestyle"),
    ("Thyroid and Blood Sugar: How Hypothyroidism Affects Glucose Metabolism", "lifestyle"),
    ("PCOS and Blood Sugar: Polycystic Ovary Syndrome and Insulin Resistance", "lifestyle"),
    ("Testosterone and Blood Sugar: Low T and Metabolic Risk in Men", "lifestyle"),
    ("Estrogen and Blood Sugar: Menopause, HRT, and Glucose Metabolism", "lifestyle"),
    ("Cortisol and Blood Sugar: The Stress Hormone That Raises Glucose", "lifestyle"),
    ("Growth Hormone and Blood Sugar: IGF-1 and Metabolic Effects", "lifestyle"),
    ("Adipose Tissue and Insulin Resistance: Why Belly Fat Is Different", "lifestyle"),
    ("Visceral Fat and Blood Sugar: The Fat You Cannot See", "lifestyle"),
    # ── MINDSET (30 total target) ───────────────────────────────────────────
    ("The Emotional Weight of a Prediabetes Diagnosis", "mindset"),
    ("Food Guilt and Blood Sugar: Breaking the Shame Cycle", "mindset"),
    ("Perfectionism and Prediabetes: Why All-or-Nothing Thinking Fails", "mindset"),
    ("Building Self-Efficacy for Prediabetes Reversal", "mindset"),
    ("The Role of Identity in Metabolic Health Change", "mindset"),
    ("Stress Eating and Blood Sugar: Breaking the Cortisol-Glucose Cycle", "mindset"),
    ("Habit Stacking for Prediabetes: Linking New Behaviors to Existing Ones", "mindset"),
    ("The Neuroscience of Sugar Cravings: Why You Want What Spikes You", "mindset"),
    ("Dealing with Unsupportive Family Members During Prediabetes Reversal", "mindset"),
    ("Celebrating Non-Scale Victories in Prediabetes Reversal", "mindset"),
    ("Mindful Eating for Blood Sugar: How Awareness Changes Glucose Response", "mindset"),
    ("Cognitive Behavioral Therapy for Prediabetes: Changing Thought Patterns", "mindset"),
    ("Acceptance and Commitment Therapy for Chronic Metabolic Conditions", "mindset"),
    ("Motivational Interviewing Techniques for Prediabetes Behavior Change", "mindset"),
    ("The Psychology of Behavior Change for Prediabetes: What Actually Works", "mindset"),
    ("Prediabetes Reversal Success Stories: What the Research Shows", "mindset"),
    ("Journaling for Blood Sugar: How Writing Supports Metabolic Health", "mindset"),
    ("Community and Accountability in Prediabetes Reversal", "mindset"),
    ("Overcoming Diabetes Fatigue: When the Effort Feels Overwhelming", "mindset"),
    ("The Grief Cycle of a Prediabetes Diagnosis", "mindset"),
    # ── DIAGNOSIS (20 more) ─────────────────────────────────────────────────
    ("Adiponectin: The Fat Cell Hormone That Protects Against Diabetes", "diagnosis"),
    ("Leptin Resistance and Blood Sugar: The Hunger-Glucose Connection", "diagnosis"),
    ("Uric Acid and Insulin Resistance: The Overlooked Connection", "diagnosis"),
    ("Ferritin and Blood Sugar: What High Iron Levels Mean for Metabolic Health", "diagnosis"),
    ("The Somogyi Effect: Overnight Hypoglycemia and Morning Highs", "diagnosis"),
    ("Prediabetes in Children and Teens: An Emerging Crisis", "diagnosis"),
    ("Metabolic Syndrome: The Cluster of Conditions That Predict Diabetes", "diagnosis"),
    ("Reactive Hypoglycemia: When Blood Sugar Crashes After Meals", "diagnosis"),
    ("The Dawn Phenomenon: Why Blood Sugar Rises Overnight", "diagnosis"),
    ("Postprandial Blood Sugar: What Your Glucose Does After Meals", "diagnosis"),
    ("Fasting Blood Sugar vs. Postprandial: Which Matters More", "diagnosis"),
    ("The Oral Glucose Tolerance Test: What to Expect and How to Prepare", "diagnosis"),
    ("Continuous Glucose Monitoring for Non-Diabetics: Is It Worth It", "diagnosis"),
    ("Blood Sugar and Brain Health: Cognitive Decline and Glucose Dysregulation", "diagnosis"),
    ("Prediabetes and Cardiovascular Risk: The Heart-Glucose Connection", "diagnosis"),
    ("Prediabetes and Kidney Health: Early Signs of Nephropathy", "diagnosis"),
    ("Prediabetes and Eye Health: Retinopathy Risk Before Diabetes", "diagnosis"),
    ("Prediabetes and Nerve Damage: Early Neuropathy Signs", "diagnosis"),
    ("Prediabetes and Fatty Liver: The Hepatic-Metabolic Connection", "diagnosis"),
    ("Prediabetes and Cancer Risk: The Insulin-IGF-1 Pathway", "diagnosis"),
    # ── EXERCISE (15 more) ──────────────────────────────────────────────────
    ("HIIT for Blood Sugar: High-Intensity Intervals and Glucose Control", "exercise"),
    ("Yoga and Blood Sugar: The Evidence for Mind-Body Movement", "exercise"),
    ("Cycling for Prediabetes: Indoor and Outdoor Options Compared", "exercise"),
    ("Resistance Bands for Blood Sugar: A Home Workout Guide", "exercise"),
    ("Exercise Timing and Blood Sugar: Morning vs. Evening Workouts", "exercise"),
    ("Exercise and Insulin Sensitivity: The Cellular Mechanisms Explained", "exercise"),
    ("Overtraining and Blood Sugar: When Too Much Exercise Raises Cortisol", "exercise"),
    ("Tai Chi for Blood Sugar: Ancient Movement for Modern Metabolic Health", "exercise"),
    ("Stair Climbing and Blood Sugar: The Underrated Daily Exercise", "exercise"),
    ("Gardening and Blood Sugar: Why Outdoor Activity Counts", "exercise"),
    ("Exercise with Joint Pain: Low-Impact Options for Prediabetes", "exercise"),
    ("Building a Sustainable Exercise Habit for Blood Sugar Control", "exercise"),
    ("Cold Exposure and Blood Sugar: Ice Baths, Cold Showers, and Glucose", "exercise"),
    ("Non-Exercise Activity Thermogenesis (NEAT): Why Fidgeting Matters", "exercise"),
    ("Swimming and Blood Sugar: The Metabolic Benefits of Aquatic Exercise", "exercise"),
    # ── MONITORING (15 more) ────────────────────────────────────────────────
    ("Blood Sugar Patterns: How to Read Your Glucose Data Like a Pro", "monitoring"),
    ("Food Journaling for Blood Sugar: What to Track and Why", "monitoring"),
    ("Time in Range: The CGM Metric That Matters More Than A1c", "monitoring"),
    ("Glucose Variability: Why Spikes and Crashes Are Worse Than High Averages", "monitoring"),
    ("Libre vs. Dexcom: Comparing CGM Systems for Non-Diabetics", "monitoring"),
    ("Wearable Technology for Metabolic Health: Beyond CGMs", "monitoring"),
    ("Tracking Sleep and Blood Sugar: The Data Connection", "monitoring"),
    ("Heart Rate Variability and Metabolic Health: What HRV Tells You", "monitoring"),
    ("Body Composition vs. BMI: Why Weight Alone Misses the Point", "monitoring"),
    ("Waist-to-Height Ratio: The Simple Measurement That Predicts Metabolic Risk", "monitoring"),
    ("Lab Tests Every Prediabetic Should Request Annually", "monitoring"),
    ("Tracking Macros for Blood Sugar: Do You Need to Count Carbs", "monitoring"),
    ("Using Apps to Manage Prediabetes: The Best Tools Reviewed", "monitoring"),
    ("How to Interpret Your CGM Data: Peaks, Valleys, and Trends", "monitoring"),
    ("Ketone Testing for Blood Sugar Management: When and Why", "monitoring"),
    # ── REVERSAL (15 more) ──────────────────────────────────────────────────
    ("The DiRECT Trial: What the UK Diabetes Reversal Study Actually Proved", "reversal"),
    ("Very Low Calorie Diets for Prediabetes: Evidence and Safety", "reversal"),
    ("Bariatric Surgery and Blood Sugar: When Is Surgery the Right Choice", "reversal"),
    ("Prediabetes Reversal After 50: What Changes and What Doesn't", "reversal"),
    ("Prediabetes Reversal After 60: Age-Specific Strategies That Work", "reversal"),
    ("Prediabetes in Men: Unique Risk Factors and Reversal Strategies", "reversal"),
    ("Prediabetes in Women: Hormonal Factors and Gender-Specific Approaches", "reversal"),
    ("Maintaining Prediabetes Reversal: How to Keep Your A1c Normal Long-Term", "reversal"),
    ("Prediabetes Reversal and Weight Loss: How Much Weight Do You Need to Lose", "reversal"),
    ("The Role of Muscle Mass in Prediabetes Reversal", "reversal"),
    ("Prediabetes Reversal Without Weight Loss: Is It Possible", "reversal"),
    ("Liver Fat and Prediabetes Reversal: The Hepatic Connection", "reversal"),
    ("Pancreatic Beta Cell Recovery: Can Your Insulin Production Come Back", "reversal"),
    ("Prediabetes Reversal Programs: Comparing CDC-Recognized Options", "reversal"),
    ("Tracking Your Reversal Progress: Metrics Beyond A1c", "reversal"),
    # ── MEDICATION (15 more) ────────────────────────────────────────────────
    ("GLP-1 Agonists for Prediabetes: Ozempic, Wegovy, and the Evidence", "medication"),
    ("SGLT2 Inhibitors and Blood Sugar: Beyond Diabetes Treatment", "medication"),
    ("Acarbose for Prediabetes: The Carb Blocker That Works", "medication"),
    ("Thiazolidinediones for Insulin Resistance: Benefits and Risks", "medication"),
    ("Statins and Blood Sugar: Does Cholesterol Medication Raise Glucose", "medication"),
    ("Beta-Blockers and Blood Sugar: How Heart Medications Affect Glucose", "medication"),
    ("Corticosteroids and Blood Sugar: Managing Steroid-Induced Hyperglycemia", "medication"),
    ("Antidepressants and Blood Sugar: The Metabolic Side Effects You Should Know", "medication"),
    ("Antipsychotics and Metabolic Syndrome: Managing Medication-Induced Risk", "medication"),
    ("Transitioning Off Metformin: When and How to Taper", "medication"),
    ("Natural Alternatives to Metformin: What the Evidence Shows", "medication"),
    ("Combination Therapy for Prediabetes: Medication Plus Lifestyle", "medication"),
    ("Precision Medicine for Prediabetes: Pharmacogenomics and Personalized Treatment", "medication"),
    ("Over-the-Counter Blood Sugar Supplements vs. Prescription Medications", "medication"),
    ("Insulin Therapy for Prediabetes: When Is It Considered", "medication"),
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
        # fallback: extract any Q&A pattern
        lines = body.split('\n')
        for i, line in enumerate(lines):
            if line.strip().startswith('**Q:') or (line.strip().startswith('**') and line.strip().endswith('?**')):
                q = re.sub(r'\*+', '', line).strip().lstrip('Q:').strip()
                a = lines[i+1].strip() if i+1 < len(lines) else ""
                a = re.sub(r'\*+', '', a).strip().lstrip('A:').strip()
                if q and a:
                    faqs.append({"q": q, "a": a})
    return faqs[:5]

def strip_md(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[#*\[\]`_]', '', text)
    return re.sub(r'\s+', ' ', text).strip()

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")
db_lock = threading.Lock()

def generate(title, category):
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com. Science-backed, direct, zero food guilt, empowering. Write for intelligent adults who want real answers.

Write a comprehensive, authoritative article: "{title}"
Category: {CAT_LABELS.get(category, category)}

STRICT REQUIREMENTS:
- MINIMUM 1800 words (aim for 2000+)
- Start with ## TL;DR section (3-4 bullet points)
- Include at least 4 H2 (##) headings
- Include at least 3 research citations in format [Author et al., Year]
- Include at least 1 external link to PubMed, NIH, or ADA
- End with ## Bottom Line section
- End with exactly 5 FAQs in this format:
FAQ: Question here?
ANSWER: 2-3 sentence answer here.

Write the complete article now:"""

    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=4000,
                temperature=0.7,
            )
            body = resp.choices[0].message.content
            wc = len(body.split())
            if wc >= 1500:
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

# ── Main ─────────────────────────────────────────────────────────────────────
db = json.loads(DB_PATH.read_text())
existing_slugs = {a['slug'] for a in db['articles']}
current = len(db['articles'])
print(f"Current DB: {current} articles")

remaining = [(t, c) for t, c in ALL_TOPICS if slugify(t) not in existing_slugs]
needed = max(0, 500 - current)
remaining = remaining[:needed]
print(f"Generating {len(remaining)} articles to reach 500...")

if remaining:
    N_THREADS = min(14, len(remaining))
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
    print(f"\nGenerated: {generated}")

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
print(f"Schedule:")
print(f"  Launch (1-30):   {compute_publish_date(0)[:10]}")
print(f"  Burst (31-230):  {compute_publish_date(30)[:10]} → {compute_publish_date(229)[:10]} (5/day)")
if total > 230:
    print(f"  Drip (231+):     {compute_publish_date(230)[:10]} → {compute_publish_date(min(total-1,499))[:10]} (1/weekday)")
cats = {}
for a in db_final['articles']:
    cats[a['category']] = cats.get(a['category'], 0) + 1
for k, v in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")
