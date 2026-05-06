#!/usr/bin/env python3
"""
Per-batch article generator for glucosemanaged.com
Usage: python3 generate-batch.py /tmp/batch-N.json /tmp/output-N.json
"""
import sys, json, time, re, os
from openai import OpenAI

OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")

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

CATEGORY_LABELS = {
    "diagnosis": "Diagnosis & Testing",
    "diet": "Diet & Nutrition",
    "exercise": "Exercise & Movement",
    "supplements": "Supplements",
    "monitoring": "Monitoring & Tracking",
    "lifestyle": "Lifestyle Factors",
    "mindset": "Mindset & Psychology",
    "reversal": "Reversal Protocols",
    "medication": "Medication & Treatment",
}

def extract_faqs(body):
    faqs = []
    pattern = re.compile(r'FAQ:\s*(.+?)\?\s*\nANSWER:\s*(.+?)(?=\nFAQ:|\n##|$)', re.DOTALL)
    for m in pattern.finditer(body):
        faqs.append({"q": m.group(1).strip() + "?", "a": m.group(2).strip()})
    return faqs

def strip_markdown(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[#*\[\]`]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def generate_article(topic):
    cat_label = CATEGORY_LABELS.get(topic['category'], topic['category'])
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com. Science-backed, direct, zero food guilt, empowering. Write for intelligent adults who want real information.

Write a comprehensive article: "{topic['title']}"
Category: {cat_label}

REQUIREMENTS (non-negotiable):
- 1800-2200 words minimum
- Start with ## TL;DR section (3-4 bullet points)
- At least 4 H2 headings (##)
- At least 3 research citations formatted as [Author et al., Year]
- At least 1 external link to PubMed, NIH, or ADA
- End with ## Bottom Line section
- Include 5 FAQs at the end in EXACT format:
FAQ: [Question]?
ANSWER: [2-3 sentence answer].

VOICE: Direct, warm, science-forward. "Prediabetes doesn't have to become diabetes." No hedging every paragraph.

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
            print(f"  QG fail ({wc} words), retry {attempt+1}", flush=True)
        except Exception as e:
            print(f"  Error: {e}, retry {attempt+1}", flush=True)
            time.sleep(2)
    return None, 0

def main():
    batch_file = sys.argv[1]
    output_file = sys.argv[2]
    
    topics = json.loads(open(batch_file).read())
    print(f"Processing {len(topics)} topics...", flush=True)
    
    results = []
    for i, topic in enumerate(topics):
        print(f"  [{i+1}/{len(topics)}] {topic['title'][:60]}...", flush=True)
        body, wc = generate_article(topic)
        if not body:
            print(f"  FAILED: {topic['slug']}", flush=True)
            continue
        
        faqs = extract_faqs(body)
        clean = strip_markdown(body)
        
        article = {
            "id": time.time() + i * 0.001,
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
            "published_at": "2025-03-01T00:00:00.000Z",
            "updated_at": "2025-03-01T00:00:00.000Z",
            "meta_title": topic["title"],
            "meta_description": clean[:155],
        }
        results.append(article)
        print(f"  ✓ {wc}w, {len(faqs)} FAQs", flush=True)
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDone! Generated {len(results)}/{len(topics)} articles → {output_file}", flush=True)

if __name__ == "__main__":
    main()
