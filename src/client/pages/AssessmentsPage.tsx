import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://glucosemanaged.com';

interface Question {
  q: string;
  options: { label: string; points: number }[];
}

interface Assessment {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  description: string;
  questions: Question[];
  scoring: { min: number; max: number; label: string; message: string; color: string }[];
}

const ASSESSMENTS: Assessment[] = [
  {
    id: 'prediabetes-risk',
    title: 'Prediabetes Risk Assessment',
    subtitle: 'Know your risk in 2 minutes',
    emoji: '🩺',
    color: '#6A8C3A',
    description: 'Based on the CDC\'s validated prediabetes risk test, this assessment helps you understand your personal risk level. It\'s not a diagnosis — it\'s a starting point for a conversation with your doctor.',
    questions: [
      { q: 'How old are you?', options: [{ label: 'Under 40', points: 0 }, { label: '40–49', points: 1 }, { label: '50–59', points: 2 }, { label: '60 or older', points: 3 }] },
      { q: 'What is your sex assigned at birth?', options: [{ label: 'Female', points: 0 }, { label: 'Male', points: 1 }] },
      { q: 'Do you have a mother, father, sister, or brother with diabetes?', options: [{ label: 'No', points: 0 }, { label: 'Yes', points: 1 }] },
      { q: 'Have you ever been diagnosed with high blood pressure?', options: [{ label: 'No', points: 0 }, { label: 'Yes', points: 1 }] },
      { q: 'Are you physically active?', options: [{ label: 'Yes — at least 3 times/week', points: 0 }, { label: 'Somewhat — 1–2 times/week', points: 1 }, { label: 'No — rarely or never', points: 2 }] },
      { q: 'What is your weight status?', options: [{ label: 'Normal weight (BMI under 25)', points: 0 }, { label: 'Overweight (BMI 25–29)', points: 1 }, { label: 'Obese (BMI 30 or higher)', points: 3 }] },
      { q: 'How often do you eat processed or sugary foods?', options: [{ label: 'Rarely or never', points: 0 }, { label: 'A few times a week', points: 1 }, { label: 'Daily', points: 2 }] },
      { q: 'How would you describe your sleep quality?', options: [{ label: 'Good — 7–9 hours most nights', points: 0 }, { label: 'Fair — often under 7 hours', points: 1 }, { label: 'Poor — frequently disrupted', points: 2 }] },
      { q: 'How often do you feel unusually thirsty or need to urinate frequently?', options: [{ label: 'Never', points: 0 }, { label: 'Occasionally', points: 1 }, { label: 'Often', points: 2 }] },
      { q: 'Have you ever had gestational diabetes or given birth to a baby over 9 lbs?', options: [{ label: 'No / Not applicable', points: 0 }, { label: 'Yes', points: 1 }] },
    ],
    scoring: [
      { min: 0, max: 4, label: 'Low Risk', message: 'Your risk appears low right now. Keep up the healthy habits — consistent movement, quality sleep, and whole foods are your best long-term protection.', color: '#27AE60' },
      { min: 5, max: 8, label: 'Moderate Risk', message: 'You have some risk factors worth paying attention to. This is the perfect time to talk to your doctor about getting an A1c or fasting glucose test. Small changes now can prevent big problems later.', color: '#F39C12' },
      { min: 9, max: 30, label: 'Higher Risk', message: 'Your results suggest a higher risk for prediabetes. Please request an A1c test from your doctor. The good news: prediabetes is highly reversible with the right approach. You\'re in the right place.', color: '#E74C3C' },
    ],
  },
  {
    id: 'insulin-resistance',
    title: 'Insulin Resistance Indicator',
    subtitle: 'Is your body struggling to use insulin?',
    emoji: '🔬',
    color: '#9B59B6',
    description: 'Insulin resistance often develops silently for years before blood sugar rises. This assessment looks at the lifestyle and physical signs that often accompany it.',
    questions: [
      { q: 'Do you carry most of your extra weight around your abdomen?', options: [{ label: 'No', points: 0 }, { label: 'Somewhat', points: 1 }, { label: 'Yes, definitely', points: 2 }] },
      { q: 'Do you experience energy crashes after eating carbohydrate-heavy meals?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Almost always', points: 2 }] },
      { q: 'Do you feel hungry again within 2 hours of eating?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Frequently', points: 2 }] },
      { q: 'Do you have skin tags or dark patches on your neck or armpits (acanthosis nigricans)?', options: [{ label: 'No', points: 0 }, { label: 'Possibly', points: 1 }, { label: 'Yes', points: 2 }] },
      { q: 'Do you have difficulty losing weight even when eating less?', options: [{ label: 'No', points: 0 }, { label: 'Somewhat', points: 1 }, { label: 'Yes, it\'s very difficult', points: 2 }] },
      { q: 'Do you have strong cravings for sweets or carbohydrates?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Daily or constant', points: 2 }] },
      { q: 'Do you have high triglycerides or low HDL cholesterol on lab work?', options: [{ label: 'No / Don\'t know', points: 0 }, { label: 'Borderline', points: 1 }, { label: 'Yes', points: 2 }] },
      { q: 'Do you experience brain fog or difficulty concentrating after meals?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Often', points: 2 }] },
    ],
    scoring: [
      { min: 0, max: 4, label: 'Low Indicators', message: 'You show few signs of insulin resistance. Continue prioritizing movement, sleep, and whole foods to keep it that way.', color: '#27AE60' },
      { min: 5, max: 9, label: 'Some Indicators', message: 'You have some signs worth monitoring. Consider getting a fasting insulin test alongside your glucose — it\'s the earliest indicator of insulin resistance.', color: '#F39C12' },
      { min: 10, max: 20, label: 'Multiple Indicators', message: 'You show multiple signs of possible insulin resistance. This is worth discussing with your doctor. Ask specifically for a fasting insulin test and HOMA-IR calculation.', color: '#E74C3C' },
    ],
  },
  {
    id: 'diet-quality',
    title: 'Metabolic Diet Quality Check',
    subtitle: 'How well is your diet supporting your blood sugar?',
    emoji: '🥗',
    color: '#E07B39',
    description: 'Your diet is the most powerful lever you have for blood sugar management. This assessment evaluates how well your current eating patterns support metabolic health.',
    questions: [
      { q: 'How many servings of non-starchy vegetables do you eat daily?', options: [{ label: '3 or more', points: 0 }, { label: '1–2', points: 1 }, { label: 'Less than 1', points: 2 }] },
      { q: 'How often do you eat refined carbohydrates (white bread, pasta, pastries)?', options: [{ label: 'Rarely or never', points: 0 }, { label: 'A few times a week', points: 1 }, { label: 'Daily', points: 2 }] },
      { q: 'Do you eat breakfast within 30 minutes of waking?', options: [{ label: 'No — I usually fast or delay breakfast', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Yes, always', points: 1 }] },
      { q: 'How often do you drink sugar-sweetened beverages (soda, juice, sports drinks)?', options: [{ label: 'Never', points: 0 }, { label: 'A few times a week', points: 1 }, { label: 'Daily', points: 2 }] },
      { q: 'Do you include protein with every meal?', options: [{ label: 'Yes, always', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Rarely', points: 2 }] },
      { q: 'Do you eat late at night (within 2 hours of bedtime)?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Most nights', points: 2 }] },
      { q: 'How often do you eat ultra-processed foods?', options: [{ label: 'Rarely', points: 0 }, { label: 'A few times a week', points: 1 }, { label: 'Most meals', points: 2 }] },
      { q: 'Do you eat fiber-rich foods (legumes, vegetables, whole grains) regularly?', options: [{ label: 'Yes, daily', points: 0 }, { label: 'A few times a week', points: 1 }, { label: 'Rarely', points: 2 }] },
    ],
    scoring: [
      { min: 0, max: 4, label: 'Strong Foundation', message: 'Your diet is doing a lot of the right things for your blood sugar. Keep focusing on protein, fiber, and whole foods — you\'re building real metabolic resilience.', color: '#27AE60' },
      { min: 5, max: 9, label: 'Room to Grow', message: 'Your diet has some good elements but also some patterns that can spike blood sugar. Small, consistent changes — like adding protein to every meal and reducing refined carbs — can make a big difference.', color: '#F39C12' },
      { min: 10, max: 20, label: 'Needs Attention', message: 'Your current eating patterns are likely contributing to blood sugar instability. The good news: diet is the most powerful tool you have. Start with one change — protein at every meal — and build from there.', color: '#E74C3C' },
    ],
  },
  {
    id: 'sleep-stress',
    title: 'Sleep & Stress Impact Assessment',
    subtitle: 'How much are sleep and stress affecting your glucose?',
    emoji: '😴',
    color: '#3A7CB8',
    description: 'Sleep deprivation and chronic stress are two of the most underestimated drivers of blood sugar dysregulation. This assessment helps you see the connection.',
    questions: [
      { q: 'How many hours of sleep do you typically get?', options: [{ label: '7–9 hours', points: 0 }, { label: '6–7 hours', points: 1 }, { label: 'Under 6 hours', points: 2 }] },
      { q: 'How would you rate your sleep quality?', options: [{ label: 'Good — I wake refreshed', points: 0 }, { label: 'Fair — sometimes tired', points: 1 }, { label: 'Poor — rarely feel rested', points: 2 }] },
      { q: 'Do you experience chronic stress (work, relationships, finances)?', options: [{ label: 'Low stress overall', points: 0 }, { label: 'Moderate stress', points: 1 }, { label: 'High or constant stress', points: 2 }] },
      { q: 'Do you have a consistent sleep schedule (same bedtime and wake time)?', options: [{ label: 'Yes, very consistent', points: 0 }, { label: 'Somewhat', points: 1 }, { label: 'No, it varies a lot', points: 2 }] },
      { q: 'Do you use screens (phone, TV) within an hour of bedtime?', options: [{ label: 'Rarely', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Almost every night', points: 2 }] },
      { q: 'Do you have a stress management practice (meditation, exercise, therapy)?', options: [{ label: 'Yes, regularly', points: 0 }, { label: 'Occasionally', points: 1 }, { label: 'No', points: 2 }] },
      { q: 'Do you notice your blood sugar or cravings are worse during stressful periods?', options: [{ label: 'No', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Yes, definitely', points: 2 }] },
    ],
    scoring: [
      { min: 0, max: 3, label: 'Well Managed', message: 'You\'re doing well with sleep and stress — two of the most powerful non-food levers for blood sugar. Keep prioritizing them.', color: '#27AE60' },
      { min: 4, max: 7, label: 'Moderate Impact', message: 'Sleep and stress are having some impact on your metabolic health. Even one improvement — like a consistent bedtime — can meaningfully lower cortisol and improve insulin sensitivity.', color: '#F39C12' },
      { min: 8, max: 16, label: 'Significant Impact', message: 'Sleep deprivation and chronic stress are likely contributing significantly to your blood sugar challenges. These aren\'t soft issues — cortisol directly raises blood glucose. Prioritizing sleep may be the most impactful change you can make.', color: '#E74C3C' },
    ],
  },
  {
    id: 'exercise-readiness',
    title: 'Exercise & Movement Readiness',
    subtitle: 'Is your movement routine supporting your metabolism?',
    emoji: '🏃',
    color: '#27AE60',
    description: 'Exercise is one of the most powerful tools for improving insulin sensitivity. This assessment evaluates your current movement patterns and their metabolic impact.',
    questions: [
      { q: 'How many days per week do you engage in intentional exercise?', options: [{ label: '4 or more days', points: 0 }, { label: '2–3 days', points: 1 }, { label: '0–1 days', points: 2 }] },
      { q: 'Do you include strength training (weights, resistance bands, bodyweight) in your routine?', options: [{ label: 'Yes, regularly', points: 0 }, { label: 'Occasionally', points: 1 }, { label: 'No', points: 2 }] },
      { q: 'Do you take short walks after meals?', options: [{ label: 'Yes, often', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Rarely', points: 2 }] },
      { q: 'How many hours per day do you spend sitting?', options: [{ label: 'Under 4 hours', points: 0 }, { label: '4–8 hours', points: 1 }, { label: 'Over 8 hours', points: 2 }] },
      { q: 'Do you break up long periods of sitting with movement?', options: [{ label: 'Yes, every 30–60 minutes', points: 0 }, { label: 'Sometimes', points: 1 }, { label: 'Rarely', points: 2 }] },
      { q: 'Do you feel energized after exercise (not exhausted)?', options: [{ label: 'Yes, usually', points: 0 }, { label: 'Mixed', points: 1 }, { label: 'I rarely exercise', points: 2 }] },
    ],
    scoring: [
      { min: 0, max: 3, label: 'Active & Metabolically Fit', message: 'Your movement habits are excellent for blood sugar management. Strength training and post-meal walks are particularly powerful — keep them up.', color: '#27AE60' },
      { min: 4, max: 7, label: 'Moderately Active', message: 'You have some good movement habits but there\'s room to improve. Adding even a 10-minute walk after dinner can lower post-meal glucose by 20–30%.', color: '#F39C12' },
      { min: 8, max: 14, label: 'Sedentary Pattern', message: 'A sedentary lifestyle is one of the strongest drivers of insulin resistance. You don\'t need to run marathons — even 150 minutes of brisk walking per week can dramatically improve insulin sensitivity.', color: '#E74C3C' },
    ],
  },
  {
    id: 'a1c-knowledge',
    title: 'A1c & Blood Sugar Knowledge Quiz',
    subtitle: 'How well do you understand your numbers?',
    emoji: '📊',
    color: '#16A085',
    description: 'Understanding your lab numbers is the foundation of taking control. This quiz tests your knowledge of A1c, fasting glucose, and what the numbers actually mean.',
    questions: [
      { q: 'What A1c range is considered prediabetes?', options: [{ label: '5.7%–6.4%', points: 2 }, { label: '6.5% and above', points: 0 }, { label: 'Under 5.7%', points: 0 }, { label: 'I\'m not sure', points: 0 }] },
      { q: 'What does A1c actually measure?', options: [{ label: 'Your blood sugar right now', points: 0 }, { label: 'Average blood sugar over ~3 months', points: 2 }, { label: 'Insulin levels', points: 0 }, { label: 'I\'m not sure', points: 0 }] },
      { q: 'What is a normal fasting blood glucose level?', options: [{ label: 'Under 100 mg/dL', points: 2 }, { label: '100–125 mg/dL', points: 0 }, { label: '126 mg/dL or higher', points: 0 }, { label: 'I\'m not sure', points: 0 }] },
      { q: 'Which test gives the earliest warning of insulin resistance?', options: [{ label: 'Fasting glucose', points: 0 }, { label: 'A1c', points: 0 }, { label: 'Fasting insulin / HOMA-IR', points: 2 }, { label: 'I\'m not sure', points: 0 }] },
      { q: 'Can prediabetes be reversed?', options: [{ label: 'Yes — with lifestyle changes', points: 2 }, { label: 'No — it always progresses', points: 0 }, { label: 'Only with medication', points: 0 }, { label: 'I\'m not sure', points: 0 }] },
      { q: 'What percentage of people with prediabetes don\'t know they have it?', options: [{ label: 'About 20%', points: 0 }, { label: 'About 50%', points: 0 }, { label: 'About 80%', points: 2 }, { label: 'I\'m not sure', points: 0 }] },
    ],
    scoring: [
      { min: 10, max: 12, label: 'Blood Sugar Expert', message: 'You know your numbers and what they mean. That knowledge is power — use it to stay proactive about your metabolic health.', color: '#27AE60' },
      { min: 4, max: 9, label: 'Good Foundation', message: 'You have solid baseline knowledge. Filling in the gaps — especially around fasting insulin and HOMA-IR — will give you a much clearer picture of your metabolic health.', color: '#F39C12' },
      { min: 0, max: 3, label: 'Room to Learn', message: 'Don\'t worry — most people don\'t know these numbers until they need to. Start with our article on what A1c actually means, and you\'ll be up to speed quickly.', color: '#3A7CB8' },
    ],
  },
  {
    id: 'supplement-readiness',
    title: 'Supplement Readiness Assessment',
    subtitle: 'Are you ready to add targeted supplements?',
    emoji: '💊',
    color: '#8E44AD',
    description: 'Supplements can be powerful tools — but only when the foundations are in place. This assessment helps you understand whether you\'re ready to add targeted supplementation.',
    questions: [
      { q: 'Do you have a consistent diet and exercise routine in place?', options: [{ label: 'Yes, solid foundation', points: 2 }, { label: 'Working on it', points: 1 }, { label: 'Not yet', points: 0 }] },
      { q: 'Have you discussed supplements with your doctor?', options: [{ label: 'Yes', points: 2 }, { label: 'No, but I plan to', points: 1 }, { label: 'No', points: 0 }] },
      { q: 'Do you know your current A1c or fasting glucose?', options: [{ label: 'Yes, recent test', points: 2 }, { label: 'Tested over a year ago', points: 1 }, { label: 'Never tested', points: 0 }] },
      { q: 'Are you currently taking any medications for blood sugar?', options: [{ label: 'No', points: 1 }, { label: 'Yes — Metformin', points: 1 }, { label: 'Yes — other medications', points: 0 }] },
      { q: 'Are you willing to track your response to supplements over 8–12 weeks?', options: [{ label: 'Yes, absolutely', points: 2 }, { label: 'Maybe', points: 1 }, { label: 'No', points: 0 }] },
    ],
    scoring: [
      { min: 7, max: 10, label: 'Ready to Supplement', message: 'You have the foundations in place and the awareness to use supplements strategically. Explore our Supplements & Herbs guide for evidence-based options.', color: '#27AE60' },
      { min: 3, max: 6, label: 'Almost Ready', message: 'You\'re close. Get your baseline labs done and talk to your doctor first — then you\'ll be in a great position to add targeted supplements safely.', color: '#F39C12' },
      { min: 0, max: 2, label: 'Build the Foundation First', message: 'Supplements work best on top of a solid diet and exercise foundation. Focus on those first — they\'re more powerful than any pill.', color: '#E74C3C' },
    ],
  },
  {
    id: 'reversal-readiness',
    title: 'Reversal Readiness Check',
    subtitle: 'How ready are you to reverse prediabetes?',
    emoji: '🔄',
    color: '#E74C3C',
    description: 'Reversing prediabetes requires commitment, knowledge, and the right support. This assessment helps you identify where you are on the readiness spectrum.',
    questions: [
      { q: 'How motivated are you to make lifestyle changes right now?', options: [{ label: 'Very motivated — ready to start', points: 3 }, { label: 'Motivated but unsure where to start', points: 2 }, { label: 'Somewhat motivated', points: 1 }, { label: 'Not yet motivated', points: 0 }] },
      { q: 'Do you have support from family or friends?', options: [{ label: 'Yes, strong support', points: 2 }, { label: 'Some support', points: 1 }, { label: 'No, I\'m on my own', points: 0 }] },
      { q: 'Have you tried to change your diet or exercise habits before?', options: [{ label: 'Yes, and I learned what works for me', points: 2 }, { label: 'Yes, but struggled to maintain it', points: 1 }, { label: 'No', points: 0 }] },
      { q: 'Do you have access to healthy food options?', options: [{ label: 'Yes, good access', points: 2 }, { label: 'Limited but manageable', points: 1 }, { label: 'Very limited', points: 0 }] },
      { q: 'Are you working with a healthcare provider on your metabolic health?', options: [{ label: 'Yes, actively', points: 2 }, { label: 'I have a doctor but haven\'t discussed this', points: 1 }, { label: 'No healthcare provider', points: 0 }] },
      { q: 'Do you believe prediabetes can be reversed with lifestyle changes?', options: [{ label: 'Yes, absolutely', points: 2 }, { label: 'I hope so', points: 1 }, { label: 'I\'m skeptical', points: 0 }] },
    ],
    scoring: [
      { min: 9, max: 13, label: 'Highly Ready', message: 'You have the motivation, support, and mindset to make real change. Start with our Reversal Protocols section — the Newcastle Protocol and low-carb approaches have the strongest evidence.', color: '#27AE60' },
      { min: 5, max: 8, label: 'Building Readiness', message: 'You\'re on the right path. The most important next step is getting clear on your "why" — what will your life look like when you\'ve reversed this? That clarity is fuel.', color: '#F39C12' },
      { min: 0, max: 4, label: 'Starting Point', message: 'Everyone starts somewhere. The fact that you\'re here, taking this assessment, means you\'re already more aware than most. Start small — one walk after dinner, one less sugary drink. Momentum builds.', color: '#3A7CB8' },
    ],
  },
  {
    id: 'cgm-readiness',
    title: 'CGM & Self-Monitoring Readiness',
    subtitle: 'Is continuous glucose monitoring right for you?',
    emoji: '📱',
    color: '#F39C12',
    description: 'Continuous glucose monitors (CGMs) have transformed blood sugar management for people with and without diabetes. This assessment helps you decide if one is right for you.',
    questions: [
      { q: 'Do you currently monitor your blood sugar at home?', options: [{ label: 'Yes, regularly', points: 2 }, { label: 'Occasionally', points: 1 }, { label: 'No', points: 0 }] },
      { q: 'Are you curious about how specific foods affect your glucose?', options: [{ label: 'Very curious', points: 2 }, { label: 'Somewhat', points: 1 }, { label: 'Not really', points: 0 }] },
      { q: 'Are you comfortable with wearable technology?', options: [{ label: 'Yes, I use wearables', points: 2 }, { label: 'I\'d be willing to try', points: 1 }, { label: 'I prefer not to', points: 0 }] },
      { q: 'Do you experience unexplained energy crashes or mood swings?', options: [{ label: 'Yes, frequently', points: 2 }, { label: 'Sometimes', points: 1 }, { label: 'Rarely', points: 0 }] },
      { q: 'Are you willing to wear a small sensor on your arm for 2 weeks?', options: [{ label: 'Yes, absolutely', points: 2 }, { label: 'Maybe', points: 1 }, { label: 'No', points: 0 }] },
      { q: 'Do you want to understand your personal glucose response to exercise?', options: [{ label: 'Yes', points: 2 }, { label: 'Somewhat', points: 1 }, { label: 'Not a priority', points: 0 }] },
    ],
    scoring: [
      { min: 9, max: 12, label: 'Great CGM Candidate', message: 'You\'re an excellent candidate for CGM. The data you\'ll get from even 2 weeks of wear can transform your understanding of your own metabolism. Look into the Libre 2 or Stelo for over-the-counter options.', color: '#27AE60' },
      { min: 5, max: 8, label: 'Worth Considering', message: 'A CGM could be very useful for you. Even a single 2-week trial can reveal surprising patterns in your glucose response to food, exercise, and sleep.', color: '#F39C12' },
      { min: 0, max: 4, label: 'Not a Priority Right Now', message: 'CGM isn\'t essential for everyone. A simple home glucose meter and regular A1c testing can give you plenty of useful information while you build your metabolic health foundation.', color: '#3A7CB8' },
    ],
  },
];

function AssessmentCard({ assessment, onStart }: { assessment: Assessment; onStart: () => void }) {
  return (
    <div
      onClick={onStart}
      style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '28px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        borderTop: `4px solid ${assessment.color}`,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
        (e.currentTarget as HTMLElement).style.borderColor = assessment.color;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{assessment.emoji}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
        {assessment.title}
      </h3>
      <p style={{ fontSize: '13px', color: assessment.color, fontWeight: 600, marginBottom: '10px' }}>
        {assessment.subtitle}
      </p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
        {assessment.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {assessment.questions.length} questions · ~2 min
        </span>
        <button
          style={{
            background: assessment.color,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Start →
        </button>
      </div>
    </div>
  );
}

function AssessmentQuiz({ assessment, onBack }: { assessment: Assessment; onBack: () => void }) {
  const [answers, setAnswers] = useState<number[]>(new Array(assessment.questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const totalScore = answers.reduce((sum, a, i) => {
    if (a === -1) return sum;
    return sum + (assessment.questions[i].options[a]?.points || 0);
  }, 0);

  const result = assessment.scoring.find(s => totalScore >= s.min && totalScore <= s.max) || assessment.scoring[assessment.scoring.length - 1];

  const allAnswered = answers.every(a => a !== -1);
  const progress = answers.filter(a => a !== -1).length / assessment.questions.length;

  if (submitted) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{
          background: 'var(--color-card-bg)',
          border: `3px solid ${result.color}`,
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>{assessment.emoji}</div>
          <div style={{
            display: 'inline-block',
            background: result.color,
            color: 'white',
            padding: '6px 20px',
            borderRadius: '99px',
            fontSize: '14px',
            fontWeight: 700,
            marginBottom: '20px',
          }}>
            {result.label}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>
            {assessment.title} — Your Result
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--color-text-muted)', marginBottom: '32px' }}>
            {result.message}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onBack}
              style={{
                background: 'transparent',
                border: `2px solid ${assessment.color}`,
                color: assessment.color,
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ← All Assessments
            </button>
            <Link
              to="/articles"
              style={{
                background: assessment.color,
                color: 'white',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Read Related Articles →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = assessment.questions[currentQ];

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          <span>{assessment.title}</span>
          <span>Question {currentQ + 1} of {assessment.questions.length}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress * 100}%`, background: assessment.color, borderRadius: '99px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', color: 'var(--color-text)', lineHeight: 1.4 }}>
          {q.q}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {q.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentQ] = oi;
                setAnswers(newAnswers);
                // Auto-advance after short delay
                setTimeout(() => {
                  if (currentQ < assessment.questions.length - 1) {
                    setCurrentQ(currentQ + 1);
                  }
                }, 300);
              }}
              style={{
                background: answers[currentQ] === oi ? assessment.color : 'transparent',
                color: answers[currentQ] === oi ? 'white' : 'var(--color-text)',
                border: `2px solid ${answers[currentQ] === oi ? assessment.color : 'var(--color-border)'}`,
                borderRadius: '10px',
                padding: '14px 20px',
                textAlign: 'left',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontWeight: answers[currentQ] === oi ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button
          onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : onBack()}
          style={{
            background: 'transparent',
            border: '2px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Back
        </button>
        {currentQ < assessment.questions.length - 1 ? (
          <button
            onClick={() => answers[currentQ] !== -1 && setCurrentQ(currentQ + 1)}
            disabled={answers[currentQ] === -1}
            style={{
              background: answers[currentQ] !== -1 ? assessment.color : 'var(--color-border)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              cursor: answers[currentQ] !== -1 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={() => allAnswered && setSubmitted(true)}
            disabled={!allAnswered}
            style={{
              background: allAnswered ? assessment.color : 'var(--color-border)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            See My Results →
          </button>
        )}
      </div>
    </div>
  );
}

export function AssessmentsPage() {
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Prediabetes & Metabolic Health Assessments',
    description: '9 free assessments to understand your prediabetes risk, insulin resistance, diet quality, sleep impact, and readiness to reverse metabolic dysfunction.',
    url: `${SITE_URL}/assessment`,
    publisher: { '@type': 'Organization', name: 'Glucose Managed', url: SITE_URL },
  };

  return (
    <>
      <Helmet>
        <title>9 Free Prediabetes & Metabolic Health Assessments | Glucose Managed</title>
        <meta name="description" content="Take our 9 free science-based assessments: prediabetes risk, insulin resistance, diet quality, sleep & stress impact, exercise readiness, A1c knowledge, supplement readiness, reversal readiness, and CGM readiness." />
        <link rel="canonical" href={`${SITE_URL}/assessment`} />
        <meta property="og:title" content="9 Free Prediabetes Assessments | Glucose Managed" />
        <meta property="og:description" content="Know your risk. Understand your numbers. Take the first step toward reversing prediabetes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/assessment`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {activeAssessment ? (
          <AssessmentQuiz
            assessment={activeAssessment}
            onBack={() => setActiveAssessment(null)}
          />
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(106,140,58,0.1)',
                color: 'var(--color-accent)',
                padding: '6px 16px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}>
                Free · Science-Based · No Email Required
              </div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: '20px',
                color: 'var(--color-text)',
              }}>
                Know Your Metabolic Health
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'var(--color-text-muted)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}>
                Nine assessments to help you understand your prediabetes risk, insulin resistance,
                and readiness to reverse the trend. No email. No judgment. Just clarity.
              </p>
            </div>

            {/* Assessment Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '64px',
            }}>
              {ASSESSMENTS.map(a => (
                <AssessmentCard
                  key={a.id}
                  assessment={a}
                  onStart={() => setActiveAssessment(a)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(106,140,58,0.08), rgba(138,181,78,0.04))',
              border: '1px solid var(--color-accent)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
            }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>
                Ready to go deeper?
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '16px', lineHeight: 1.6 }}>
                These assessments are a starting point. Our articles give you the science, protocols,
                and practical steps to actually change your numbers.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/articles" className="btn btn-primary">
                  Read the Articles →
                </Link>
                <Link to="/supplements" className="btn btn-outline">
                  Explore Supplements
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
