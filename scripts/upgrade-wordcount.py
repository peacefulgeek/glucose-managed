#!/usr/bin/env python3
"""
Upgrade all articles under 1800 words by appending additional content sections.
Uses GPT-4.1-mini to generate 400-600 word extension sections.
"""
import json, os, re, time, threading
from pathlib import Path
from openai import OpenAI

DB_PATH = Path(__file__).parent.parent / "src/data/articles-db.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
TARGET_WORDS = 1800
BATCH_SIZE = 20  # articles per thread
N_THREADS = 12

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")
db_lock = threading.Lock()

def word_count(text):
    return len(re.sub(r'<[^>]+>', '', text).split())

def extend_article(title, category, current_body, current_wc):
    needed = TARGET_WORDS - current_wc + 100  # add 100 buffer
    prompt = f"""You are The Oracle Lover — metabolic health writer for glucosemanaged.com.

The following article needs additional content to reach {TARGET_WORDS} words. 
Article title: "{title}"
Category: {category}
Current word count: {current_wc}
Words needed: ~{needed}

Write {needed} additional words of high-quality content to append to this article.
Continue naturally from the existing content. Add 2-3 new H2 sections with practical, 
science-backed information. Each section should be 150-200 words.
Do NOT repeat content already covered. Do NOT include a new conclusion.
Just write the new sections directly, starting with ## [Section Title]:"""

    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.7,
            )
            extension = resp.choices[0].message.content.strip()
            return extension
        except Exception as e:
            print(f"  API error: {e}, retry {attempt+1}", flush=True)
            time.sleep(3)
    return None

def process_batch(articles_chunk, thread_id, results):
    done = 0
    for article in articles_chunk:
        slug = article['slug']
        title = article['title']
        category = article['category']
        body = article.get('body', '')
        current_wc = word_count(body)
        
        if current_wc >= TARGET_WORDS:
            continue
            
        extension = extend_article(title, category, body, current_wc)
        if not extension:
            print(f"[T{thread_id}] SKIP {slug[:40]}", flush=True)
            continue
        
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
                done += 1
                print(f"[T{thread_id}] ✓ {current_wc}→{new_wc}w {title[:45]}...", flush=True)
    
    results[thread_id] = done

# Main
db = json.loads(DB_PATH.read_text())
short_articles = [a for a in db['articles'] if word_count(a.get('body', '')) < TARGET_WORDS]
print(f"Articles under {TARGET_WORDS} words: {len(short_articles)}")
print(f"Running {N_THREADS} threads, {BATCH_SIZE} articles each...")

if not short_articles:
    print("All articles already meet the word count requirement!")
else:
    chunks = [short_articles[i:i+BATCH_SIZE] for i in range(0, len(short_articles), BATCH_SIZE)]
    threads = []
    results = {}
    for i, chunk in enumerate(chunks):
        t = threading.Thread(target=process_batch, args=(chunk, i, results))
        t.start()
        threads.append(t)
        time.sleep(0.2)  # stagger slightly
    
    for t in threads:
        t.join()
    
    total_upgraded = sum(results.values())
    print(f"\nUpgraded: {total_upgraded} articles")

# Final check
db_final = json.loads(DB_PATH.read_text())
wcs = [word_count(a.get('body','')) for a in db_final['articles']]
still_short = sum(1 for w in wcs if w < TARGET_WORDS)
avg_wc = sum(wcs) // len(wcs) if wcs else 0
print(f"\nFinal stats:")
print(f"  Total articles: {len(db_final['articles'])}")
print(f"  Avg word count: {avg_wc}")
print(f"  Still under {TARGET_WORDS}: {still_short}")
print(f"  Over {TARGET_WORDS}: {len(wcs) - still_short}")
