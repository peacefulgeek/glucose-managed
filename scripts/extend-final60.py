#!/usr/bin/env python3
"""Final aggressive extension for the last 60 short articles. Target: 2500 words."""
import json, os, re, time, threading
from pathlib import Path
from openai import OpenAI

DB_PATH = Path(__file__).parent.parent / "src/data/articles-db.json"
OPENAI_KEY = os.environ.get("OPENAI_API_KEY", "")
TARGET = 2500

client = OpenAI(api_key=OPENAI_KEY, base_url="https://api.openai.com/v1")
db_lock = threading.Lock()

def wc(text):
    return len(re.sub(r'<[^>]+>', '', text).split())

def extend(title, category, body, current_wc):
    needed = TARGET - current_wc + 200
    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": f"""You are The Oracle Lover, metabolic health writer for glucosemanaged.com.

Article: "{title}" | Category: {category} | Current words: {current_wc}

Write {needed} words of new content. Add 4 new H2 sections (200 words each).
Include practical tips, research citations, and actionable advice.
Do NOT repeat existing content. Do NOT write a conclusion.
Start with ## [Section Title]:"""}],
                max_tokens=1800,
                temperature=0.7,
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            print(f"  retry {attempt+1}: {e}", flush=True)
            time.sleep(3)
    return None

def process(article, tid, results):
    slug = article['slug']
    body = article.get('body', '')
    current = wc(body)
    ext = extend(article['title'], article['category'], body, current)
    if not ext:
        results[slug] = False
        return
    new_body = body.rstrip() + "\n\n" + ext
    new_wc = wc(new_body)
    with db_lock:
        db = json.loads(DB_PATH.read_text())
        idx = next((i for i, a in enumerate(db['articles']) if a['slug'] == slug), -1)
        if idx >= 0:
            db['articles'][idx]['body'] = new_body
            db['articles'][idx]['word_count'] = new_wc
            db['articles'][idx]['reading_time'] = max(5, round(new_wc / 200))
            DB_PATH.write_text(json.dumps(db, indent=2))
            print(f"[T{tid}] ✓ {current}→{new_wc}w {article['title'][:45]}", flush=True)
            results[slug] = True

db = json.loads(DB_PATH.read_text())
short = [a for a in db['articles'] if wc(a.get('body','')) < 1800]
print(f"Extending {len(short)} articles to {TARGET}+ words with 20 threads...")

threads, results = [], {}
for i, a in enumerate(short):
    t = threading.Thread(target=process, args=(a, i, results))
    t.start()
    threads.append(t)
    time.sleep(0.05)
for t in threads:
    t.join()

done = sum(1 for v in results.values() if v)
print(f"Done: {done}/{len(short)}")

# Final stats
db2 = json.loads(DB_PATH.read_text())
wcs = [wc(a.get('body','')) for a in db2['articles']]
short2 = sum(1 for w in wcs if w < 1800)
avg = sum(wcs) // len(wcs)
print(f"FINAL: {len(db2['articles'])} articles | avg {avg}w | under1800={short2} | over1800={len(wcs)-short2}")
