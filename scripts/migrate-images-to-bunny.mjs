#!/usr/bin/env node
/**
 * migrate-images-to-bunny.mjs
 * Converts all local images to compressed WebP and uploads to Bunny CDN.
 * After upload, deletes local copies and updates articles-db.json with CDN URLs.
 * Zero images in repo after this runs (except public/favicon.svg).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BUNNY_ZONE = process.env.BUNNY_STORAGE_ZONE || 'glucose-managed';
const BUNNY_KEY = process.env.BUNNY_API_KEY || '98fa03b8-e96f-475e-a02df024fe4f-c640-47b9';
const BUNNY_ENDPOINT = process.env.BUNNY_STORAGE_ENDPOINT || 'https://ny.storage.bunnycdn.com';
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || 'https://glucose-managed.b-cdn.net';

async function uploadToBunny(localPath, remoteName) {
  const data = fs.readFileSync(localPath);
  const url = `${BUNNY_ENDPOINT}/${BUNNY_ZONE}/images/${remoteName}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_KEY,
      'Content-Type': 'image/webp',
    },
    body: data,
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bunny upload failed for ${remoteName}: ${response.status} ${text}`);
  }
  
  return `${BUNNY_CDN_URL}/images/${remoteName}`;
}

async function convertAndUpload(inputPath, outputName) {
  const tmpPath = `/tmp/${outputName}`;
  
  // Convert to WebP with quality 82 (good balance of size/quality)
  await sharp(inputPath)
    .webp({ quality: 82, effort: 4 })
    .toFile(tmpPath);
  
  const originalSize = fs.statSync(inputPath).size;
  const webpSize = fs.statSync(tmpPath).size;
  console.log(`  ${outputName}: ${(originalSize/1024).toFixed(0)}KB → ${(webpSize/1024).toFixed(0)}KB WebP`);
  
  const cdnUrl = await uploadToBunny(tmpPath, outputName);
  fs.unlinkSync(tmpPath);
  return cdnUrl;
}

async function main() {
  console.log('🐰 Bunny CDN Image Migration');
  console.log(`Zone: ${BUNNY_ZONE} | Endpoint: ${BUNNY_ENDPOINT}`);
  console.log('');
  
  const imagesDir = path.join(ROOT, 'public', 'images');
  const imageFiles = fs.readdirSync(imagesDir).filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );
  
  console.log(`Found ${imageFiles.length} images to migrate...`);
  
  const urlMap = {}; // old local URL → new CDN URL
  
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const baseName = path.basename(file, path.extname(file));
    const outputName = `${baseName}.webp`;
    
    try {
      process.stdout.write(`Uploading ${file}... `);
      const cdnUrl = await convertAndUpload(inputPath, outputName);
      urlMap[`/images/${file}`] = cdnUrl;
      urlMap[`/images/${baseName}.webp`] = cdnUrl;
      console.log(`✓ ${cdnUrl}`);
    } catch (err) {
      console.error(`✗ FAILED: ${err.message}`);
    }
  }
  
  console.log('\nUpdating articles-db.json with CDN URLs...');
  const dbPath = path.join(ROOT, 'src', 'data', 'articles-db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  let updated = 0;
  for (const article of db.articles) {
    if (article.hero_url && urlMap[article.hero_url]) {
      article.hero_url = urlMap[article.hero_url];
      updated++;
    } else if (article.hero_url && article.hero_url.startsWith('/images/')) {
      // Try to match by base name
      const baseName = path.basename(article.hero_url, path.extname(article.hero_url));
      const cdnUrl = `${BUNNY_CDN_URL}/images/${baseName}.webp`;
      article.hero_url = cdnUrl;
      updated++;
    }
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`Updated ${updated} article hero_url fields`);
  
  // Delete local images (keep favicon.svg)
  console.log('\nDeleting local images...');
  for (const file of imageFiles) {
    fs.unlinkSync(path.join(imagesDir, file));
    console.log(`  Deleted: ${file}`);
  }
  
  // Remove the images directory if empty
  const remaining = fs.readdirSync(imagesDir);
  if (remaining.length === 0) {
    fs.rmdirSync(imagesDir);
    console.log('  Removed empty /public/images/ directory');
  }
  
  console.log('\n✅ Migration complete!');
  console.log(`CDN URL map:`);
  Object.entries(urlMap).forEach(([local, cdn]) => {
    console.log(`  ${local} → ${cdn}`);
  });
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
