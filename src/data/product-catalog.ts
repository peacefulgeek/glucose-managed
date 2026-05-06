/**
 * Product catalog for Glucose Managed (Site 109)
 * Affiliate tag: spankyspinola-20
 * All ASINs are niche-relevant to prediabetes / glucose management / metabolic health.
 */

export interface Product {
  asin: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
}

export const productCatalog: Product[] = [
  // ─── Glucose Monitoring ───────────────────────────────────────────────────
  {
    asin: 'B07FMQMXDH',
    name: 'Keto-Mojo GK+ Glucose & Ketone Meter',
    category: 'glucose-monitoring',
    tags: ['glucose', 'ketone', 'meter', 'monitoring', 'testing', 'blood-sugar'],
    description: 'Dual glucose and ketone meter for comprehensive metabolic tracking'
  },
  {
    asin: 'B00E9M4XEE',
    name: 'Contour Next Blood Glucose Monitor',
    category: 'glucose-monitoring',
    tags: ['glucose', 'meter', 'monitoring', 'testing', 'blood-sugar', 'a1c'],
    description: 'Highly accurate blood glucose monitor with second-chance sampling'
  },
  {
    asin: 'B09NXLM8ZD',
    name: 'Nutrisense CGM Program Starter',
    category: 'glucose-monitoring',
    tags: ['cgm', 'continuous-glucose', 'monitoring', 'glucose-spikes', 'metabolic'],
    description: 'Continuous glucose monitoring to track real-time glucose patterns'
  },

  // ─── Books ────────────────────────────────────────────────────────────────
  {
    asin: 'B0CDFHKB5Q',
    name: '"Good Energy" by Casey Means MD',
    category: 'books',
    tags: ['metabolic-health', 'glucose', 'energy', 'casey-means', 'book', 'insulin-resistance'],
    description: 'The surprising connection between metabolism, energy, and chronic disease'
  },
  {
    asin: '1771641487',
    name: '"The Diabetes Code" by Jason Fung MD',
    category: 'books',
    tags: ['diabetes', 'reversal', 'fasting', 'jason-fung', 'book', 'insulin-resistance', 'prediabetes'],
    description: 'Prevent and reverse type 2 diabetes naturally through dietary intervention'
  },
  {
    asin: '1982179414',
    name: '"Glucose Revolution" by Jessie Inchauspé',
    category: 'books',
    tags: ['glucose', 'spikes', 'food-order', 'jessie-inchauspé', 'book', 'blood-sugar'],
    description: 'Life-changing facts about blood sugar and how to flatten glucose curves'
  },
  {
    asin: '0593083881',
    name: '"Why We Get Sick" by Benjamin Bikman PhD',
    category: 'books',
    tags: ['insulin-resistance', 'metabolic', 'benjamin-bikman', 'book', 'prediabetes'],
    description: 'The hidden epidemic at the root of most chronic disease — insulin resistance'
  },
  {
    asin: '0593236599',
    name: '"Outlive" by Peter Attia MD',
    category: 'books',
    tags: ['longevity', 'metabolic-health', 'peter-attia', 'book', 'prevention'],
    description: 'The science and art of longevity — including metabolic health protocols'
  },

  // ─── Supplements ─────────────────────────────────────────────────────────
  {
    asin: 'B001HEJQZK',
    name: 'Thorne Research Berberine-500',
    category: 'supplements',
    tags: ['berberine', 'supplement', 'insulin-sensitivity', 'glucose', 'blood-sugar'],
    description: 'Pharmaceutical-grade berberine for blood sugar and metabolic support'
  },
  {
    asin: 'B000FGWFB8',
    name: 'NOW Foods Chromium Picolinate 200mcg',
    category: 'supplements',
    tags: ['chromium', 'supplement', 'insulin-sensitivity', 'glucose', 'blood-sugar'],
    description: 'Chromium picolinate to support healthy glucose metabolism'
  },
  {
    asin: 'B000BD0RT0',
    name: "Doctor's Best High Absorption Magnesium Glycinate",
    category: 'supplements',
    tags: ['magnesium', 'supplement', 'insulin-sensitivity', 'sleep', 'blood-sugar'],
    description: 'Highly bioavailable magnesium glycinate for insulin sensitivity and sleep'
  },
  {
    asin: 'B07CQHGFK7',
    name: 'Alpha Lipoic Acid 600mg (Jarrow Formulas)',
    category: 'supplements',
    tags: ['alpha-lipoic-acid', 'supplement', 'insulin-sensitivity', 'antioxidant', 'glucose'],
    description: 'Alpha lipoic acid for glucose uptake and antioxidant support'
  },
  {
    asin: 'B00CAZAU62',
    name: 'Cinnamon Bark Extract (Nature\'s Way)',
    category: 'supplements',
    tags: ['cinnamon', 'supplement', 'blood-sugar', 'glucose', 'insulin'],
    description: 'Ceylon cinnamon extract to support healthy blood sugar levels'
  },

  // ─── Food & Kitchen ───────────────────────────────────────────────────────
  {
    asin: 'B001I7MVG0',
    name: 'Bragg Organic Apple Cider Vinegar',
    category: 'food',
    tags: ['apple-cider-vinegar', 'glucose', 'blood-sugar', 'food', 'vinegar'],
    description: 'Raw organic ACV shown to blunt post-meal glucose spikes'
  },
  {
    asin: 'B079BQXFMZ',
    name: 'OXO Good Grips 11-lb Food Scale',
    category: 'kitchen',
    tags: ['food-scale', 'portion-control', 'kitchen', 'meal-prep', 'carb-counting'],
    description: 'Precise food scale for accurate carb counting and portion management'
  },
  {
    asin: 'B07JNXHM2B',
    name: 'Instant Pot Duo 7-in-1 (6 Quart)',
    category: 'kitchen',
    tags: ['instant-pot', 'meal-prep', 'kitchen', 'cooking', 'low-carb'],
    description: 'Versatile pressure cooker for batch cooking low-glycemic meals'
  },

  // ─── Exercise & Movement ──────────────────────────────────────────────────
  {
    asin: 'B01AVDVHTI',
    name: 'Fit Simplify Resistance Loop Bands (Set of 5)',
    category: 'exercise',
    tags: ['resistance-bands', 'exercise', 'strength-training', 'insulin-sensitivity', 'movement'],
    description: 'Resistance bands for home strength training to improve insulin sensitivity'
  },
  {
    asin: 'B08CJMKRWB',
    name: 'WalkingPad Foldable Under-Desk Treadmill',
    category: 'exercise',
    tags: ['treadmill', 'walking', 'exercise', 'post-meal', 'insulin-sensitivity', 'movement'],
    description: 'Compact treadmill for post-meal walks proven to lower glucose spikes'
  },
  {
    asin: 'B07QDXVGVT',
    name: 'Garmin Vivosmart 4 Activity Tracker',
    category: 'exercise',
    tags: ['fitness-tracker', 'activity', 'sleep', 'heart-rate', 'monitoring', 'exercise'],
    description: 'Activity tracker with sleep monitoring and stress tracking'
  },
  {
    asin: 'B07CJPZPK4',
    name: 'Adjustable Dumbbell Set (Bowflex SelectTech)',
    category: 'exercise',
    tags: ['dumbbells', 'strength-training', 'exercise', 'insulin-sensitivity', 'muscle'],
    description: 'Adjustable dumbbells for progressive strength training at home'
  },

  // ─── Meal Planning & Tracking ─────────────────────────────────────────────
  {
    asin: 'B08BNFKWLJ',
    name: 'Glucose Goddess Method Journal',
    category: 'tracking',
    tags: ['journal', 'tracking', 'glucose', 'food-log', 'meal-planning'],
    description: 'Structured journal for tracking glucose responses and food choices'
  },
  {
    asin: 'B09XVWQM3K',
    name: 'Low-Carb Meal Prep Containers (Set of 20)',
    category: 'kitchen',
    tags: ['meal-prep', 'containers', 'low-carb', 'kitchen', 'portion-control'],
    description: 'BPA-free meal prep containers for batch cooking and portion control'
  },

  // ─── Testing & Labs ───────────────────────────────────────────────────────
  {
    asin: 'B07FMQMXDH',
    name: 'Keto-Mojo Test Strips (50 Count)',
    category: 'glucose-monitoring',
    tags: ['test-strips', 'glucose', 'monitoring', 'testing', 'blood-sugar'],
    description: 'Compatible test strips for accurate glucose and ketone readings'
  },
  {
    asin: 'B00KAZAU62',
    name: 'A1c Self Check Test Kit',
    category: 'glucose-monitoring',
    tags: ['a1c', 'testing', 'home-test', 'hemoglobin', 'blood-sugar', 'prediabetes'],
    description: 'At-home A1c test kit for monitoring glycated hemoglobin between doctor visits'
  },

  // ─── Sleep & Stress ───────────────────────────────────────────────────────
  {
    asin: 'B07QDXVGVT',
    name: 'Oura Ring Gen 3 (Sleep & HRV Tracker)',
    category: 'sleep',
    tags: ['sleep', 'hrv', 'stress', 'recovery', 'monitoring', 'cortisol'],
    description: 'Advanced sleep and recovery tracker to monitor cortisol-driven glucose patterns'
  },
  {
    asin: 'B07CJPZPK4',
    name: 'Weighted Blanket for Sleep (15 lbs)',
    category: 'sleep',
    tags: ['sleep', 'stress', 'cortisol', 'anxiety', 'blood-sugar', 'recovery'],
    description: 'Weighted blanket to improve sleep quality and reduce cortisol-driven glucose spikes'
  },
];

export default productCatalog;
