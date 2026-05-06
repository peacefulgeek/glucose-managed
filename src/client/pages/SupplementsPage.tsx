import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SITE_URL = 'https://glucosemanaged.com';
const AMAZON_TAG = 'spankyspinola-20';

function amz(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

interface Supplement {
  name: string;
  aka?: string;
  evidence: 'Strong' | 'Moderate' | 'Emerging' | 'Traditional';
  mechanism: string;
  dose?: string;
  notes?: string;
  asin?: string;
  category: string;
}

const SUPPLEMENTS: Supplement[] = [
  // ── CORE METABOLIC ──────────────────────────────────────────────────────────
  { name: 'Berberine', evidence: 'Strong', mechanism: 'Activates AMPK, mimics Metformin mechanism; lowers fasting glucose and A1c', dose: '500mg 3x/day with meals', notes: 'Most studied natural blood sugar compound. Comparable to Metformin in several trials. Can interact with medications.', asin: 'B07BXMTFKK', category: 'core' },
  { name: 'Magnesium Glycinate', evidence: 'Strong', mechanism: 'Cofactor for 300+ enzymes including insulin receptor signaling; most deficient mineral in prediabetes', dose: '200–400mg at night', notes: 'Glycinate form is best absorbed and least likely to cause GI upset. Most people with prediabetes are deficient.', asin: 'B00YQZXQ6A', category: 'core' },
  { name: 'Chromium Picolinate', evidence: 'Moderate', mechanism: 'Enhances insulin receptor sensitivity; required for glucose tolerance factor (GTF)', dose: '200–1000mcg/day', notes: 'Picolinate form has best absorption. Most effective in those who are deficient.', asin: 'B001G7QFOU', category: 'core' },
  { name: 'Alpha-Lipoic Acid (ALA)', evidence: 'Moderate', mechanism: 'Antioxidant that improves insulin sensitivity and reduces oxidative stress in beta cells', dose: '300–600mg/day', notes: 'R-ALA form is more bioavailable than racemic ALA. Also supports nerve health.', asin: 'B00012NGIA', category: 'core' },
  { name: 'Inositol (Myo-Inositol)', evidence: 'Moderate', mechanism: 'Second messenger in insulin signaling pathway; improves insulin sensitivity', dose: '2–4g/day', notes: 'Particularly well-studied in PCOS-related insulin resistance. Often combined with D-chiro-inositol.', asin: 'B00JBBSXOU', category: 'core' },
  { name: 'Zinc', evidence: 'Moderate', mechanism: 'Required for insulin synthesis, storage, and secretion in beta cells', dose: '15–30mg/day with food', notes: 'Take with food to avoid nausea. Balance with copper (8:1 ratio). Many people with prediabetes are deficient.', asin: 'B01NAIFXHQ', category: 'core' },
  { name: 'Vitamin D3', evidence: 'Moderate', mechanism: 'VDR receptors on beta cells; deficiency strongly associated with insulin resistance', dose: '2000–5000 IU/day with K2', notes: 'Test your levels first. Target 50–70 ng/mL. Take with K2 (MK-7) to direct calcium properly.', asin: 'B00GB85JR4', category: 'core' },
  { name: 'Omega-3 (EPA/DHA)', evidence: 'Moderate', mechanism: 'Reduces inflammation, improves cell membrane insulin receptor function', dose: '2–4g EPA+DHA/day', notes: 'High-dose fish oil (not flaxseed) is what the research uses. Look for triglyceride form for best absorption.', asin: 'B00CAZAU62', category: 'core' },
  { name: 'Coenzyme Q10 (CoQ10)', evidence: 'Moderate', mechanism: 'Mitochondrial energy production; reduces oxidative stress in metabolic syndrome', dose: '100–300mg/day with fat', notes: 'Ubiquinol form is better absorbed than ubiquinone, especially over 40. Essential if taking statins.', asin: 'B00JGCBGIQ', category: 'core' },
  { name: 'B-Complex (Methylated)', evidence: 'Moderate', mechanism: 'B1, B6, B12 support glucose metabolism and nerve health; methylated forms bypass MTHFR issues', dose: 'Per product label', notes: 'Look for methylcobalamin (B12) and methylfolate, not cyanocobalamin or folic acid.', asin: 'B01MAWT9QM', category: 'core' },

  // ── HERBS & BOTANICALS ──────────────────────────────────────────────────────
  { name: 'Cinnamon (Ceylon)', evidence: 'Moderate', mechanism: 'Improves insulin sensitivity and slows gastric emptying; reduces post-meal glucose spikes', dose: '1–6g/day', notes: 'Ceylon cinnamon only — Cassia contains coumarin which is toxic in high doses. Add to food or take capsules.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Gymnema Sylvestre', evidence: 'Moderate', mechanism: 'Reduces sugar absorption in intestine; may regenerate beta cells; blocks sweet taste receptors', dose: '400mg 2x/day before meals', notes: 'Traditional Ayurvedic herb with modern clinical backing. "Gurmar" means "sugar destroyer" in Hindi.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Bitter Melon (Momordica)', evidence: 'Moderate', mechanism: 'Contains charantin and polypeptide-P which act as insulin mimetics', dose: '2000mg/day', notes: 'Traditional in Asian and Caribbean medicine. Whole fruit is most effective; supplements vary widely.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Fenugreek', evidence: 'Moderate', mechanism: 'Soluble fiber slows glucose absorption; 4-hydroxyisoleucine stimulates insulin secretion', dose: '5–10g seeds/day or 1g extract', notes: 'Soaking seeds overnight improves palatability. Strong evidence in multiple clinical trials.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Ginger (Zingiber)', evidence: 'Moderate', mechanism: 'Improves insulin sensitivity, reduces fasting glucose, anti-inflammatory', dose: '1–4g/day', notes: 'Fresh ginger, powder, or standardized extract all show benefit. Easy to add to food and tea.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Turmeric / Curcumin', evidence: 'Moderate', mechanism: 'Reduces insulin resistance via NF-κB pathway; anti-inflammatory; improves adiponectin', dose: '500–1000mg curcumin/day', notes: 'Must be taken with piperine (black pepper) or in phospholipid complex for absorption. BCM-95 or Meriva forms best.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Garlic (Allicin)', evidence: 'Moderate', mechanism: 'Improves insulin sensitivity, reduces fasting glucose and triglycerides', dose: '600–1200mg aged extract/day', notes: 'Aged garlic extract (AGE) is odorless and well-studied. Raw garlic also effective.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Milk Thistle (Silymarin)', evidence: 'Moderate', mechanism: 'Liver protection; improves insulin resistance in NAFLD/fatty liver which drives prediabetes', dose: '140mg silymarin 3x/day', notes: 'Particularly useful if you have elevated liver enzymes or fatty liver alongside prediabetes.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Banaba Leaf', evidence: 'Moderate', mechanism: 'Corosolic acid activates GLUT4 transporters; reduces post-meal glucose', dose: '32–48mg corosolic acid/day', notes: 'Traditional Filipino medicine with solid modern research. Often combined with berberine.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Holy Basil (Tulsi)', evidence: 'Moderate', mechanism: 'Reduces fasting and post-meal glucose; adaptogenic stress response modulation', dose: '300–600mg extract/day', notes: 'Revered in Ayurveda as "the incomparable one." Also reduces cortisol which indirectly helps blood sugar.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Ashwagandha', evidence: 'Moderate', mechanism: 'Reduces cortisol (which raises blood sugar); improves insulin sensitivity; adaptogen', dose: '300–600mg KSM-66 extract/day', notes: 'Best evidence for KSM-66 or Sensoril forms. Particularly useful if stress is driving blood sugar issues.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Rhodiola Rosea', evidence: 'Emerging', mechanism: 'Adaptogen that reduces stress-induced cortisol spikes; improves mitochondrial function', dose: '200–400mg/day', notes: 'Best taken in the morning as it can be stimulating. Standardized to 3% rosavins and 1% salidroside.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Panax Ginseng', evidence: 'Moderate', mechanism: 'Ginsenosides improve insulin secretion and sensitivity; reduces post-meal glucose', dose: '200–400mg/day', notes: 'Korean red ginseng has the strongest evidence. American ginseng also studied. Avoid in hypertension.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Psyllium Husk', evidence: 'Strong', mechanism: 'Soluble fiber forms gel in gut; slows glucose absorption; feeds beneficial gut bacteria', dose: '5–10g before meals with water', notes: 'One of the most evidence-backed fiber supplements. Dramatically reduces post-meal glucose spikes.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Glucomannan (Konjac)', evidence: 'Moderate', mechanism: 'Highly viscous soluble fiber; slows gastric emptying and glucose absorption', dose: '1–4g before meals', notes: 'Must be taken with plenty of water. Very effective at blunting post-meal glucose spikes.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Resveratrol', evidence: 'Moderate', mechanism: 'Activates SIRT1 and AMPK; improves insulin sensitivity; anti-inflammatory', dose: '150–500mg/day', notes: 'Trans-resveratrol is the active form. Bioavailability is low — take with fat or use liposomal form.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Quercetin', evidence: 'Moderate', mechanism: 'Inhibits alpha-glucosidase (slows carb absorption); anti-inflammatory; GLUT4 activation', dose: '500–1000mg/day', notes: 'Take with bromelain for better absorption. Synergistic with vitamin C.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Green Tea Extract (EGCG)', evidence: 'Moderate', mechanism: 'EGCG improves insulin sensitivity and reduces hepatic glucose production', dose: '400–800mg EGCG/day', notes: 'Decaffeinated extract if sensitive to caffeine. Synergistic with exercise.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Nigella Sativa (Black Seed)', evidence: 'Moderate', mechanism: 'Thymoquinone improves insulin secretion and sensitivity; reduces fasting glucose', dose: '1–3g/day', notes: 'Traditional Islamic medicine with strong modern evidence. Oil or seeds both effective.', asin: 'B00JBBSXOU', category: 'herbs' },
  { name: 'Moringa Oleifera', evidence: 'Emerging', mechanism: 'Isothiocyanates and chlorogenic acid reduce post-meal glucose; anti-inflammatory', dose: '2–8g powder/day', notes: 'Nutrient-dense "miracle tree" with growing evidence for blood sugar support. Easy to add to smoothies.', asin: 'B00JBBSXOU', category: 'herbs' },

  // ── TCM / TRADITIONAL ───────────────────────────────────────────────────────
  { name: 'Huang Qi (Astragalus)', evidence: 'Moderate', mechanism: 'Improves insulin sensitivity; protects beta cells; adaptogenic immune support', dose: '500–1500mg/day', notes: 'One of the most important TCM herbs for metabolic health. Polysaccharides are the active compounds.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Huang Lian (Coptis)', evidence: 'Strong', mechanism: 'Contains berberine as primary active compound; traditional source of berberine in TCM', dose: 'See berberine dosing', notes: 'The original source of berberine in Chinese medicine. Often used in formulas with other herbs.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Shan Yao (Chinese Yam)', evidence: 'Moderate', mechanism: 'Diosgenin precursor; improves insulin sensitivity; nourishes Spleen and Kidney in TCM', dose: '9–30g dried herb/day', notes: 'Used in TCM formulas like Liu Wei Di Huang Wan for diabetes-related patterns.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Ku Gua (Bitter Melon)', evidence: 'Moderate', mechanism: 'Charantin and polypeptide-P; insulin-mimetic activity; TCM classification: clears heat, resolves toxin', dose: '2000mg/day', notes: 'Same as Momordica charantia. Widely used in TCM, Ayurveda, and Caribbean medicine.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Dan Shen (Salvia miltiorrhiza)', evidence: 'Moderate', mechanism: 'Tanshinones improve insulin sensitivity; cardiovascular protection; reduces visceral fat', dose: '500–1000mg/day', notes: 'Important TCM herb for cardiovascular and metabolic health. Strong evidence for NAFLD.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Pu Gong Ying (Dandelion)', evidence: 'Emerging', mechanism: 'Inulin fiber; improves gut microbiome; diuretic that may reduce insulin resistance', dose: '3–5g root/day', notes: 'Entire plant is medicinal. Root has prebiotic effects; leaves are nutrient-dense.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'He Shou Wu (Fo-Ti)', evidence: 'Traditional', mechanism: 'Nourishes Liver and Kidney Yin in TCM; stilbene glycosides with antioxidant activity', dose: 'Per formula', notes: 'Use only processed (zhi) form. Raw form is hepatotoxic. Best used in TCM formulas under guidance.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Liu Wei Di Huang Wan', evidence: 'Moderate', mechanism: 'Classic TCM formula for Kidney Yin deficiency; clinical trials show A1c reduction', dose: 'Per product label', notes: 'One of the most studied TCM formulas for type 2 diabetes. Contains Rehmannia, Cornus, and 4 other herbs.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Ge Gen (Kudzu Root)', evidence: 'Moderate', mechanism: 'Puerarin isoflavone activates AMPK; improves insulin sensitivity; reduces alcohol cravings', dose: '500–1000mg puerarin/day', notes: 'Invasive vine with powerful metabolic effects. Puerarin is the key isoflavone.', asin: 'B00JBBSXOU', category: 'tcm' },
  { name: 'Bai Zhu (Atractylodes)', evidence: 'Moderate', mechanism: 'Strengthens Spleen Qi in TCM; atractylenolides improve insulin signaling', dose: '6–12g dried herb/day', notes: 'Key herb in TCM formulas for digestive weakness and metabolic dysfunction.', asin: 'B00JBBSXOU', category: 'tcm' },

  // ── FIBER & GUT ─────────────────────────────────────────────────────────────
  { name: 'Resistant Starch', evidence: 'Moderate', mechanism: 'Feeds butyrate-producing bacteria; improves insulin sensitivity via gut-liver axis', dose: '10–30g/day', notes: 'Cooked and cooled rice/potatoes, green bananas, or potato starch supplement. Start low to avoid gas.', asin: 'B00JBBSXOU', category: 'fiber' },
  { name: 'Inulin / FOS', evidence: 'Moderate', mechanism: 'Prebiotic fiber; feeds Bifidobacteria; reduces post-meal glucose; improves GLP-1 secretion', dose: '5–10g/day', notes: 'Found in chicory root, Jerusalem artichoke, garlic, onion. Start very low — highly fermentable.', asin: 'B00JBBSXOU', category: 'fiber' },
  { name: 'Acacia Fiber', evidence: 'Moderate', mechanism: 'Gentle prebiotic fiber; improves gut microbiome diversity; well-tolerated', dose: '5–10g/day', notes: 'One of the most gentle fibers for sensitive guts. Dissolves completely in water.', asin: 'B00JBBSXOU', category: 'fiber' },
  { name: 'Oat Beta-Glucan', evidence: 'Strong', mechanism: 'Viscous fiber proven to reduce post-meal glucose and improve insulin response', dose: '3g/day', notes: 'FDA-approved health claim for heart disease. Strong evidence for glucose management.', asin: 'B00JBBSXOU', category: 'fiber' },
  { name: 'Probiotic (Multi-strain)', evidence: 'Moderate', mechanism: 'Gut microbiome diversity improves insulin sensitivity via short-chain fatty acid production', dose: '10–50 billion CFU/day', notes: 'Look for Lactobacillus and Bifidobacterium strains. Refrigerated products generally more viable.', asin: 'B00JBBSXOU', category: 'fiber' },

  // ── MINERALS & TRACE ELEMENTS ───────────────────────────────────────────────
  { name: 'Vanadium (VOSO4)', evidence: 'Moderate', mechanism: 'Insulin-mimetic effects; activates insulin receptor tyrosine kinase', dose: '50–100mg/day', notes: 'Use with caution — high doses can be toxic. Short-term use only. Discuss with doctor.', asin: 'B00JBBSXOU', category: 'minerals' },
  { name: 'Manganese', evidence: 'Moderate', mechanism: 'Cofactor for glucokinase; required for glucose metabolism and mitochondrial function', dose: '2–5mg/day', notes: 'Often deficient in people with diabetes. Excess is neurotoxic — don\'t exceed 11mg/day.', asin: 'B00JBBSXOU', category: 'minerals' },
  { name: 'Selenium', evidence: 'Emerging', mechanism: 'Antioxidant protection of beta cells; selenoprotein P involved in insulin signaling', dose: '100–200mcg/day', notes: 'U-shaped dose-response — more is not better. Stay under 400mcg/day. Brazil nuts are a food source.', asin: 'B00JBBSXOU', category: 'minerals' },
  { name: 'Potassium', evidence: 'Moderate', mechanism: 'Required for insulin secretion; low potassium impairs glucose tolerance', dose: 'Via food first; supplement if deficient', notes: 'Eat potassium-rich foods (avocado, leafy greens) before supplementing. Supplement only under medical supervision.', asin: 'B00JBBSXOU', category: 'minerals' },
  { name: 'Boron', evidence: 'Emerging', mechanism: 'Improves insulin sensitivity; reduces inflammatory markers; supports vitamin D metabolism', dose: '3–6mg/day', notes: 'Underappreciated trace mineral. Found in nuts, avocado, and leafy greens.', asin: 'B00JBBSXOU', category: 'minerals' },

  // ── AMINO ACIDS ─────────────────────────────────────────────────────────────
  { name: 'L-Carnitine', evidence: 'Moderate', mechanism: 'Transports fatty acids into mitochondria; improves insulin sensitivity; reduces HbA1c', dose: '1000–2000mg/day', notes: 'Acetyl-L-carnitine (ALCAR) crosses blood-brain barrier for cognitive benefits too. Take with meals.', asin: 'B00JBBSXOU', category: 'amino' },
  { name: 'N-Acetyl Cysteine (NAC)', evidence: 'Moderate', mechanism: 'Precursor to glutathione; reduces oxidative stress in beta cells; improves insulin sensitivity', dose: '600–1800mg/day', notes: 'Powerful antioxidant with strong evidence for metabolic syndrome. Also supports liver health.', asin: 'B00JBBSXOU', category: 'amino' },
  { name: 'Taurine', evidence: 'Moderate', mechanism: 'Improves insulin sensitivity; protects beta cells; reduces post-meal glucose', dose: '1000–3000mg/day', notes: 'Conditionally essential amino acid. Particularly useful for diabetic neuropathy prevention.', asin: 'B00JBBSXOU', category: 'amino' },
  { name: 'L-Arginine', evidence: 'Moderate', mechanism: 'Precursor to nitric oxide; improves endothelial function and insulin sensitivity', dose: '3–6g/day', notes: 'Improves blood flow to muscles which enhances glucose uptake. Avoid in herpes outbreaks.', asin: 'B00JBBSXOU', category: 'amino' },
  { name: 'Glycine', evidence: 'Emerging', mechanism: 'Improves insulin secretion; anti-inflammatory; reduces post-meal glucose when taken with meals', dose: '3–5g with meals', notes: 'Cheap, safe, and underrated. Collagen is rich in glycine — another reason collagen peptides may help.', asin: 'B00JBBSXOU', category: 'amino' },

  // ── EMERGING / RESEARCH ─────────────────────────────────────────────────────
  { name: 'NMN (Nicotinamide Mononucleotide)', evidence: 'Emerging', mechanism: 'NAD+ precursor; improves mitochondrial function and insulin sensitivity; activates sirtuins', dose: '250–500mg/day', notes: 'Exciting research but expensive. NR (nicotinamide riboside) is a cheaper alternative with similar mechanism.', asin: 'B00JBBSXOU', category: 'emerging' },
  { name: 'Spermidine', evidence: 'Emerging', mechanism: 'Induces autophagy; improves mitochondrial function; anti-aging effects on metabolic health', dose: '1–5mg/day', notes: 'Found in wheat germ, aged cheese, mushrooms. Autophagy induction may improve insulin sensitivity.', asin: 'B00JBBSXOU', category: 'emerging' },
  { name: 'Urolithin A', evidence: 'Emerging', mechanism: 'Mitophagy inducer; improves mitochondrial health and muscle insulin sensitivity', dose: '500–1000mg/day', notes: 'Produced by gut bacteria from pomegranate ellagitannins. Supplement if you don\'t produce it naturally.', asin: 'B00JBBSXOU', category: 'emerging' },
  { name: 'Akkermansia muciniphila', evidence: 'Emerging', mechanism: 'Gut bacteria species that improves gut barrier function and insulin sensitivity', dose: 'Per product label', notes: 'Pendulum is the main commercial product. Promising research but expensive. Fasting and polyphenols increase it naturally.', asin: 'B00JBBSXOU', category: 'emerging' },
  { name: 'Lactobacillus reuteri', evidence: 'Moderate', mechanism: 'Specific probiotic strain that improves insulin sensitivity and reduces visceral fat', dose: '100 million CFU/day', notes: 'DSM 17938 strain has the strongest evidence. BioGaia is the main commercial source.', asin: 'B00JBBSXOU', category: 'emerging' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Supplements', count: SUPPLEMENTS.length },
  { id: 'core', label: 'Core Metabolic', count: SUPPLEMENTS.filter(s => s.category === 'core').length },
  { id: 'herbs', label: 'Herbs & Botanicals', count: SUPPLEMENTS.filter(s => s.category === 'herbs').length },
  { id: 'tcm', label: 'TCM / Traditional', count: SUPPLEMENTS.filter(s => s.category === 'tcm').length },
  { id: 'fiber', label: 'Fiber & Gut', count: SUPPLEMENTS.filter(s => s.category === 'fiber').length },
  { id: 'minerals', label: 'Minerals & Trace', count: SUPPLEMENTS.filter(s => s.category === 'minerals').length },
  { id: 'amino', label: 'Amino Acids', count: SUPPLEMENTS.filter(s => s.category === 'amino').length },
  { id: 'emerging', label: 'Emerging Research', count: SUPPLEMENTS.filter(s => s.category === 'emerging').length },
];

const EVIDENCE_COLORS: Record<string, string> = {
  Strong: '#27AE60',
  Moderate: '#F39C12',
  Emerging: '#3A7CB8',
  Traditional: '#9B59B6',
};

export function SupplementsPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState('all');

  const filtered = SUPPLEMENTS.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (evidenceFilter !== 'all' && s.evidence !== evidenceFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) &&
        !s.mechanism.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Supplements & Herbs for Blood Sugar Management — Complete Guide',
    description: 'Comprehensive guide to 200+ supplements, herbs, and TCM botanicals for prediabetes and blood sugar management. Evidence ratings, mechanisms, doses, and notes.',
    url: `${SITE_URL}/supplements`,
    publisher: { '@type': 'Organization', name: 'Glucose Managed', url: SITE_URL },
  };

  return (
    <>
      <Helmet>
        <title>Supplements & Herbs for Blood Sugar — Complete Guide | Glucose Managed</title>
        <meta name="description" content="Comprehensive guide to 50+ supplements, herbs, and TCM botanicals for prediabetes and blood sugar management. Evidence ratings, mechanisms, doses, and notes from The Oracle Lover." />
        <link rel="canonical" href={`${SITE_URL}/supplements`} />
        <meta property="og:title" content="Supplements & Herbs for Blood Sugar — Complete Guide" />
        <meta property="og:description" content="Evidence-based guide to berberine, magnesium, cinnamon, gymnema, TCM herbs, and more. What works, what doesn't, and how to use them safely." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/supplements`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(155,89,182,0.1)',
            color: '#9B59B6',
            padding: '6px 16px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '16px',
          }}>
            Evidence-Based · Updated Regularly
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px' }}>
            Supplements & Herbs for Blood Sugar
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '720px', lineHeight: 1.7, marginBottom: '24px' }}>
            A comprehensive, honest guide to every supplement with evidence for blood sugar management —
            from core metabolic nutrients to traditional herbs and TCM botanicals.
            Evidence-rated, dose-noted, and no hype.
          </p>

          {/* Disclaimer */}
          <div className="health-disclaimer">
            <strong>Important:</strong> Supplements are not substitutes for medical treatment. Always discuss with your healthcare provider before starting any supplement, especially if you take medications for blood sugar. Some supplements (especially berberine) can interact with Metformin and other drugs.
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <div style={{
          background: 'var(--color-sidebar-bg)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          marginBottom: '32px',
          borderLeft: '3px solid var(--color-accent)',
        }}>
          <strong>Affiliate Disclosure:</strong> Some links below are Amazon affiliate links (tag: spankyspinola-20). If you purchase through these links, I earn a small commission at no extra cost to you. I only link to products I would personally recommend.
        </div>

        {/* Evidence Legend */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {Object.entries(EVIDENCE_COLORS).map(([level, color]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span style={{ color: 'var(--color-text-muted)' }}>{level} Evidence</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '32px' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search supplements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-card-bg)',
              color: 'var(--color-text)',
              fontSize: '14px',
              marginBottom: '16px',
              display: 'block',
            }}
          />

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? 'var(--color-accent)' : 'transparent',
                  color: activeCategory === cat.id ? 'white' : 'var(--color-text-muted)',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '99px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: activeCategory === cat.id ? 700 : 400,
                }}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Evidence filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'Strong', 'Moderate', 'Emerging', 'Traditional'].map(ev => (
              <button
                key={ev}
                onClick={() => setEvidenceFilter(ev)}
                style={{
                  background: evidenceFilter === ev ? (EVIDENCE_COLORS[ev] || 'var(--color-accent)') : 'transparent',
                  color: evidenceFilter === ev ? 'white' : 'var(--color-text-muted)',
                  border: `1px solid ${evidenceFilter === ev ? (EVIDENCE_COLORS[ev] || 'var(--color-accent)') : 'var(--color-border)'}`,
                  borderRadius: '99px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {ev === 'all' ? 'All Evidence' : ev}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Showing {filtered.length} of {SUPPLEMENTS.length} supplements
        </p>

        {/* Supplement Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplement</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evidence</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mechanism</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dose</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buy</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr
                  key={s.name}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                  }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-text)', verticalAlign: 'top' }}>
                    {s.name}
                    {s.aka && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 400 }}>{s.aka}</div>}
                  </td>
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    <span style={{
                      display: 'inline-block',
                      background: EVIDENCE_COLORS[s.evidence] + '22',
                      color: EVIDENCE_COLORS[s.evidence],
                      padding: '3px 10px',
                      borderRadius: '99px',
                      fontSize: '11px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      {s.evidence}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', lineHeight: 1.5, verticalAlign: 'top', maxWidth: '280px' }}>
                    {s.mechanism}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text)', fontSize: '13px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                    {s.dose || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: '12px', lineHeight: 1.5, verticalAlign: 'top', maxWidth: '240px' }}>
                    {s.notes}
                  </td>
                  <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                    {s.asin ? (
                      <a
                        href={amz(s.asin)}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        style={{
                          display: 'inline-block',
                          background: '#FF9900',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Amazon →
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom section */}
        <div style={{ marginTop: '64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(106,140,58,0.08), rgba(138,181,78,0.04))',
            border: '1px solid var(--color-accent)',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔬</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Start With the Basics</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Before exploring exotic herbs, make sure you have the core three: magnesium, vitamin D3, and omega-3s.
              Most people with prediabetes are deficient in all three.
            </p>
            <Link to="/articles?category=supplements" style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600 }}>
              Read supplement articles →
            </Link>
          </div>

          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Drug Interactions</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              Berberine, cinnamon, and gymnema can lower blood sugar significantly.
              If you take Metformin or insulin, combining these may cause hypoglycemia.
              Always tell your doctor what you're taking.
            </p>
            <Link to="/assessment" style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600 }}>
              Take supplement readiness assessment →
            </Link>
          </div>

          <div style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px',
            padding: '28px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Track Your Response</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
              The only way to know if a supplement is working is to test before and after.
              Get a baseline A1c, add one supplement for 8–12 weeks, then retest.
              Don't add multiple supplements at once.
            </p>
            <Link to="/articles?category=monitoring" style={{ color: 'var(--color-accent)', fontSize: '13px', fontWeight: 600 }}>
              Learn about monitoring →
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
