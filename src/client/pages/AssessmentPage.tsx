import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: number; detail?: string }[];
  category: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'age',
    text: 'How old are you?',
    category: 'Demographics',
    options: [
      { label: 'Under 40', value: 0 },
      { label: '40–49', value: 1 },
      { label: '50–59', value: 2 },
      { label: '60 or older', value: 3 },
    ],
  },
  {
    id: 'bmi',
    text: 'How would you describe your current weight?',
    category: 'Body Composition',
    options: [
      { label: 'Normal weight (BMI under 25)', value: 0 },
      { label: 'Slightly overweight (BMI 25–29)', value: 1, detail: 'BMI 25–29.9' },
      { label: 'Overweight (BMI 30–34)', value: 2, detail: 'BMI 30–34.9' },
      { label: 'Obese (BMI 35+)', value: 3, detail: 'BMI 35 or higher' },
    ],
  },
  {
    id: 'waist',
    text: 'What is your waist circumference?',
    category: 'Body Composition',
    options: [
      { label: 'Under 35 inches (women) / Under 40 inches (men)', value: 0 },
      { label: '35–39 inches (women) / 40–44 inches (men)', value: 2 },
      { label: '40+ inches (women) / 45+ inches (men)', value: 3 },
      { label: "I don't know", value: 1 },
    ],
  },
  {
    id: 'activity',
    text: 'How physically active are you?',
    category: 'Lifestyle',
    options: [
      { label: 'Very active — exercise 5+ days/week', value: 0 },
      { label: 'Moderately active — 3–4 days/week', value: 1 },
      { label: 'Lightly active — 1–2 days/week', value: 2 },
      { label: 'Sedentary — rarely or never exercise', value: 3 },
    ],
  },
  {
    id: 'family',
    text: 'Do you have a parent, brother, or sister with diabetes?',
    category: 'Family History',
    options: [
      { label: 'No family history', value: 0 },
      { label: 'One family member has type 2 diabetes', value: 2 },
      { label: 'Multiple family members have type 2 diabetes', value: 3 },
      { label: "I'm not sure", value: 1 },
    ],
  },
  {
    id: 'gestational',
    text: 'Have you ever been diagnosed with gestational diabetes or given birth to a baby over 9 lbs?',
    category: 'Medical History',
    options: [
      { label: 'No / Not applicable', value: 0 },
      { label: 'Yes, gestational diabetes', value: 3 },
      { label: 'Yes, baby over 9 lbs', value: 2 },
      { label: "I'm not sure", value: 1 },
    ],
  },
  {
    id: 'blood_pressure',
    text: 'Have you ever been diagnosed with high blood pressure?',
    category: 'Medical History',
    options: [
      { label: 'No', value: 0 },
      { label: 'Yes, currently managed with medication', value: 2 },
      { label: 'Yes, unmanaged or borderline', value: 3 },
      { label: "I'm not sure", value: 1 },
    ],
  },
  {
    id: 'diet',
    text: 'How would you describe your typical diet?',
    category: 'Nutrition',
    options: [
      { label: 'Mostly whole foods, vegetables, lean protein', value: 0 },
      { label: 'Mixed — some processed foods, some whole foods', value: 1 },
      { label: 'High in refined carbs, sugary drinks, processed food', value: 3 },
      { label: 'I eat irregularly with no consistent pattern', value: 2 },
    ],
  },
  {
    id: 'sleep',
    text: 'How many hours of sleep do you typically get per night?',
    category: 'Lifestyle',
    options: [
      { label: '7–9 hours (optimal)', value: 0 },
      { label: '6–7 hours', value: 1 },
      { label: 'Under 6 hours', value: 3 },
      { label: 'Over 9 hours (often tired)', value: 2 },
    ],
  },
  {
    id: 'stress',
    text: 'How would you rate your chronic stress level?',
    category: 'Lifestyle',
    options: [
      { label: 'Low — I manage stress well', value: 0 },
      { label: 'Moderate — some stress but manageable', value: 1 },
      { label: 'High — frequently stressed', value: 2 },
      { label: 'Very high — chronic, unmanaged stress', value: 3 },
    ],
  },
];

interface RiskLevel {
  label: string;
  color: string;
  bg: string;
  icon: string;
  description: string;
  action: string;
  articles: string[];
}

function getRiskLevel(score: number, maxScore: number): RiskLevel {
  const pct = (score / maxScore) * 100;

  if (pct < 25) return {
    label: 'Low Risk',
    color: '#27AE60',
    bg: '#E8F8F0',
    icon: '✅',
    description: 'Your risk factors are low. Keep doing what you\'re doing. Prevention is still the goal.',
    action: 'Maintain your current lifestyle. Annual fasting glucose check is sufficient.',
    articles: ['walking-after-meals-evidence-backed-intervention', 'sleep-and-blood-sugar-bidirectional-relationship'],
  };

  if (pct < 50) return {
    label: 'Moderate Risk',
    color: '#F39C12',
    bg: '#FEF9E7',
    icon: '⚠️',
    description: 'You have some risk factors worth addressing. This is the ideal time to act — before any diagnosis.',
    action: 'Request a fasting glucose and A1c test. Start with diet and exercise changes.',
    articles: ['what-prediabetes-actually-is-a1c-meaning', 'low-carb-for-prediabetes-research'],
  };

  if (pct < 70) return {
    label: 'Elevated Risk',
    color: '#E07B39',
    bg: '#FEF0E7',
    icon: '🔶',
    description: 'Your risk profile is elevated. A conversation with your doctor about testing is important.',
    action: 'Get tested: fasting glucose, A1c, and ideally fasting insulin. Don\'t wait.',
    articles: ['insulin-resistance-root-cause', 'homa-ir-more-useful-than-fasting-glucose'],
  };

  return {
    label: 'High Risk',
    color: '#E74C3C',
    bg: '#FDEDEC',
    icon: '🔴',
    description: 'Multiple significant risk factors are present. Testing and action are urgent.',
    action: 'See your doctor this week. Request comprehensive metabolic panel. Prediabetes is reversible — but only if you act.',
    articles: ['newcastle-protocol-reverse-prediabetes', 'metformin-for-prediabetes-options'],
  };
}

export function AssessmentPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const maxScore = QUESTIONS.length * 3;
  const risk = getRiskLevel(totalScore, maxScore);

  const handleSelect = (value: number) => {
    setSelected(value);
  };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setSelected(null);
    setCompleted(false);
  };

  return (
    <>
      <Helmet>
        <title>Prediabetes Risk Assessment | Blood Sugar Blueprint</title>
        <meta name="description" content="Take the 5-minute prediabetes risk assessment. Know your risk score and get personalized guidance on what to do next." />
      </Helmet>

      <div className="page-container" style={{ maxWidth: '720px' }}>
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Risk Assessment' },
        ]} />

        {/* ─── Header ───────────────────────────────────────── */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            Prediabetes Risk Assessment
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
            10 questions. 5 minutes. Know your risk level and exactly what to do next.
            Your A1c is not your character. It's a lab value. And lab values can change.
          </p>
        </div>

        {!completed ? (
          <div className="assessment-card">
            {/* Progress */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                marginBottom: '8px',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{question.category}</span>
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
              </div>
              <div className="assessment-progress-bar">
                <div className="assessment-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Question */}
            <div className="assessment-question">{question.text}</div>

            {/* Options */}
            <div>
              {question.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`assessment-option ${selected === opt.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${selected === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: selected === opt.value ? 'var(--color-accent)' : 'transparent',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {selected === opt.value && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '15px' }}>{opt.label}</div>
                    {opt.detail && (
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {opt.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                fontSize: '15px',
                opacity: selected === null ? 0.5 : 1,
                cursor: selected === null ? 'not-allowed' : 'pointer',
              }}
            >
              {currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Results →'}
            </button>
          </div>
        ) : (
          /* ─── Results ──────────────────────────────────────── */
          <div className="assessment-card">
            <div className="assessment-result">
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{risk.icon}</div>
              <div style={{
                display: 'inline-block',
                background: risk.bg,
                color: risk.color,
                padding: '8px 20px',
                borderRadius: '99px',
                fontWeight: 700,
                fontSize: '18px',
                marginBottom: '20px',
                border: `2px solid ${risk.color}40`,
              }}>
                {risk.label}
              </div>

              <div className="assessment-score" style={{ color: risk.color }}>
                {Math.round((totalScore / maxScore) * 100)}%
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                Risk score: {totalScore} out of {maxScore} points
              </p>

              <p style={{
                fontSize: '17px',
                color: 'var(--color-text)',
                lineHeight: 1.7,
                marginBottom: '20px',
                textAlign: 'left',
                background: risk.bg,
                padding: '20px',
                borderRadius: '10px',
                borderLeft: `4px solid ${risk.color}`,
              }}>
                {risk.description}
              </p>

              <div style={{
                background: 'var(--color-sidebar-bg)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'left',
                marginBottom: '32px',
              }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '10px', color: 'var(--color-accent-dark)' }}>
                  🎯 Recommended Action
                </div>
                <p style={{ fontSize: '15px', color: 'var(--color-text)', lineHeight: 1.6, margin: 0 }}>
                  {risk.action}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="health-disclaimer" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <strong>Important:</strong> This assessment is a screening tool, not a medical diagnosis.
                Only a healthcare provider can diagnose prediabetes. If you're concerned, get tested.
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/articles" className="btn btn-primary">
                  Read Relevant Articles →
                </Link>
                <button onClick={handleRestart} className="btn btn-outline">
                  Retake Assessment
                </button>
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid var(--color-border)',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', textAlign: 'left' }}>
                Your Answers
              </h3>
              {QUESTIONS.map(q => {
                const ans = answers[q.id];
                const opt = q.options.find(o => o.value === ans);
                return (
                  <div key={q.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--color-border-light)',
                    gap: '12px',
                  }}>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', flex: 1 }}>
                      {q.text}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', textAlign: 'right', maxWidth: '200px' }}>
                      {opt?.label || 'Skipped'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Info Section ─────────────────────────────────── */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          background: 'var(--color-sidebar-bg)',
          borderRadius: '12px',
          border: '1px solid var(--color-sidebar-border)',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-accent-dark)' }}>
            About This Assessment
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0 }}>
            This assessment is based on validated risk factors from the American Diabetes Association's
            Type 2 Diabetes Risk Test and clinical research on prediabetes. It evaluates age, body
            composition, physical activity, family history, and lifestyle factors. It is not a
            substitute for medical testing. The gold standard for prediabetes diagnosis is a fasting
            plasma glucose test, A1c test, or oral glucose tolerance test administered by a healthcare provider.
          </p>
        </div>
      </div>
    </>
  );
}
