#!/usr/bin/env python3
"""
Final targeted extension for articles still under 1800 words.
Uses a higher target of 2200 words to ensure all clear 1800.
"""
import json, os, re, time, threading
from pathlib import Path
from openai import OpenAI

DB_PATH = Path(__file__).parent.parent / "src/data/articles-db.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
TARGET_WORDS = 2200  # Higher target to ensure we clear 1800
N_THREADS = 20

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")
db_lock = threading.Lock()

def word_count(text):
    return len(re.sub(r'<[^>]+>', '', text).split())

def extend_article(title, category, current_body, current_wc):
    needed = TARGET_WORDS - current_wc + 150
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com.

Article: "{title}" | Category: {category} | Current words: {current_wc}

Write exactly {needed} words of new content to append. Add 3 new H2 sections.
Each section: 180-220 words of practical, evidence-based content.
Do NOT repeat existing content. Do NOT add a conclusion section.
Start directly with ## [Section Title]:"""

    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1400,
                temperature=0.7,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"  API error: {e}, retry {attempt+1}", flush=True)
            time.sleep(3)
    return None

def process_article(article, thread_id, results):
    slug = article['slug']
    title = article['title']
    category = article['category']
    body = article.get('body', '')
    current_wc = word_count(body)
    
    extension = extend_article(title, category, body, current_wc)
    if not extension:
        print(f"[T{thread_id}] SKIP {slug[:40]}", flush=True)
        results[slug] = False
        return
    
    new_body = body.rstrip() + "\n\n" + extension
    new_wc = word_count(new_body)
    
    with db_lock:
        db = json.loads(DB_PATH.read_text())
        idx = next((i for i, a in enumerate(db['articles']) if a['slug'] == slug), -1)
        if idx >= 0:
            db['articles'][idx]['body'] = new_body
            db['articles'][idx]['word_count'] = new_wc
            db['articles'][idx]['reading_time'] = max(5, round(new_wc / 200))
            DB_PATH.write_text(json.dumps(db, indent=2))
            print(f"[T{thread_id}] ✓ {current_wc}→{new_wc}w {title[:45]}", flush=True)
            results[slug] = True

# Main
db = json.loads(DB_PATH.read_text())
short_articles = [a for a in db['articles'] if word_count(a.get('body', '')) < 1800]
print(f"Articles under 1800 words: {len(short_articles)}")

if not short_articles:
    print("All articles meet the word count requirement!")
else:
    threads = []
    results = {}
    for i, article in enumerate(short_articles):
        t = threading.Thread(target=process_article, args=(article, i, results))
        t.start()
        threads.append(t)
        time.sleep(0.1)
    
    for t in threads:
        t.join()
    
    total_upgraded = sum(1 for v in results.values() if v)
    print(f"\nUpgraded: {total_upgraded}/{len(short_articles)}")

# Final check
db_final = json.loads(DB_PATH.read_text())
wcs = [word_count(a.get('body','')) for a in db_final['articles']]
still_short = sum(1 for w in wcs if w < 1800)
avg_wc = sum(wcs) // len(wcs) if wcs else 0
print(f"\nFinal: Total={len(db_final['articles'])} Avg={avg_wc}w Under1800={still_short} Over1800={len(wcs)-still_short}")
