/** WhisperTranscribe Medical — prototype demo data (John Smith) */

export const DEMO_PATIENT = {
  id: 'john-smith',
  name: 'John Smith',
  dob: '1968-07-14',
  mrn: '00312',
  insurance: 'Blue Cross Blue Shield',
  lastSeen: 'Today',
}

export const RECENT_PATIENTS = [DEMO_PATIENT]

/** Last 5 visits with diagnosis codes (patient context timeline) */
export const DEMO_VISIT_TIMELINE = [
  { date: 'Apr 2, 2026', label: 'Today — Diabetes management', code: 'E11.65' },
  { date: 'Jan 8, 2026', label: 'A1C follow-up', code: 'E11.9' },
  { date: 'Oct 5, 2025', label: 'Hypertension check', code: 'I10' },
  { date: 'Jul 14, 2025', label: 'Annual wellness', code: 'Z00.00' },
  { date: 'Apr 22, 2025', label: 'Foot neuropathy screen', code: 'E11.40' },
]

/** Sparkline heights 0–100 for cross-visit vitals demo (trend up: BP, A1C, weight) */
export const DEMO_SPARK_BP = [48, 51, 54, 58, 62, 67]
export const DEMO_SPARK_A1C = [46, 49, 53, 58, 64, 71] // visually ~7.1 → 8.4%
export const DEMO_SPARK_WT = [52, 54, 55, 57, 59, 61]

export const DEMO_SPECIALISTS = [
  { label: 'Dr. Tashkentov — Endocrinology — Houston Methodist', value: 'tashkentov' },
]

/** Full utterances — words streamed ~300ms each in UI */
export const DEMO_UTTERANCES = [
  {
    speaker: 'DR. RODRIGUEZ',
    role: 'doctor',
    startSec: 0,
    words: ['Good', 'morning', 'John,', 'how', 'have', 'you', 'been', 'feeling', 'since', 'your', 'last', 'visit?'],
    uncertainIndex: null,
    smallTalk: true,
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 7,
    words: [
      'My', 'home', 'glucose', 'has', 'been', 'around', '180', 'to', '220,', 'and', "I've", 'had', 'tingling', 'in', 'both',
      'feet', 'for', 'about', 'three', 'months.',
    ],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. RODRIGUEZ',
    role: 'doctor',
    startSec: 22,
    words: ['Have', 'you', 'been', 'taking', 'your', 'metformin', 'consistently?', "What's", 'your', 'diet', 'been', 'like?'],
    uncertainIndex: null,
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 33,
    words: [
      "I'll", 'be', 'honest,', "I've", 'skipped', 'some', 'doses', 'because', 'work', 'has', 'been', 'stressful.',
      'And', "I've", 'been', 'eating', 'late', 'takeout', 'more', 'than', 'I', 'should.',
    ],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. RODRIGUEZ',
    role: 'doctor',
    startSec: 52,
    words: [
      'Your', 'A1C', 'came', 'back', '8.4%,', 'up', 'from', '7.1%', 'in', 'January.',
      'The', 'tingling', 'sounds', 'consistent', 'with', 'peripheral', 'neuropathy.',
      "I'm", 'going', 'to', 'order', 'a', 'monofilament', 'test', 'today.',
    ],
    uncertainIndex: 17, // "neuropathy" for demo uncertainty
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 78,
    words: ['Is', 'the', 'neuropathy', 'reversible?', 'I', "didn't", 'realize', 'things', 'had', 'gotten', 'this', 'bad.'],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. RODRIGUEZ',
    role: 'doctor',
    startSec: 90,
    words: [
      'Early-stage', 'changes', 'can', 'often', 'stabilize', 'with', 'better', 'control.',
      "I'd", 'like', 'to', 'add', 'a', 'GLP-1', 'agonist', 'called', 'semaglutide,',
      'and', 'I', 'am', 'referring', 'you', 'to', 'Dr.', 'Tashkentov', 'in', 'endocrinology.',
    ],
    uncertainIndex: null,
  },
]

export const DEMO_CLINICAL_MILESTONES = [
  { afterUtteranceIndex: 1, chiefComplaint: 'Elevated home glucose; bilateral foot tingling × 3 months.' },
  { afterUtteranceIndex: 1, symptoms: ['Fasting hyperglycemia (180–220 mg/dL)', 'Bilateral foot tingling', 'Fatigue'] },
  {
    afterUtteranceIndex: 3,
    symptoms: [
      'Fasting hyperglycemia (180–220 mg/dL)',
      'Bilateral foot tingling × 3 months',
      'Fatigue',
      'Medication non-adherence',
      'Dietary indiscretion (late takeout)',
      'Psychosocial stress (work)',
    ],
  },
  {
    afterUtteranceIndex: 4,
    keyTerms: ['neuropathy', 'A1C 8.4%', 'monofilament test'],
    provisional: 'T2DM with hyperglycemia; peripheral neuropathy — provisional pending exam findings',
  },
  { afterUtteranceIndex: 6, actions: ['Order monofilament test', 'Start semaglutide', 'Refer to endocrinology (Dr. Tashkentov)'] },
]

export const DEMO_BILLING_CODES = [
  { id: '1', code: 'E11.65', type: 'ICD-10', description: 'Type 2 diabetes mellitus with hyperglycemia', confidence: 97 },
  { id: '2', code: 'E11.40', type: 'ICD-10', description: 'Type 2 diabetes mellitus with diabetic neuropathy, unspecified', confidence: 89 },
  { id: '3', code: '99214', type: 'CPT', description: 'Office visit, moderate complexity', confidence: 92 },
  { id: '4', code: 'S0395', type: 'CPT', description: 'Monofilament sensory test', confidence: 81 },
]

export const DEMO_SOAP_TEMPLATES = [
  { label: 'SOAP (default)', value: 'soap' },
  { label: 'H&P Note', value: 'hp' },
  { label: 'Progress Note', value: 'progress' },
  { label: 'Discharge Summary', value: 'discharge' },
]

function peObjectiveFull() {
  return [
    'Labs: A1C 8.4% (was 7.1% Jan 2026). BMP reviewed — no barrier to metformin (prototype).',
    'Vitals: BP 138/86, HR 78, RR 16, T 98.2°F, SpO2 97% RA. BMI 29.4.',
    'General: NAD, comfortable, appropriate.',
    'HEENT / Neck: Unremarkable; no JVD.',
    'CV: RRR, no m/r/g, no edema.',
    'Lungs: CTA bilaterally.',
    'Abd: Soft, NT, +BS.',
    'Ext (feet): Warm, intact skin, pulses present; monofilament — reduced sensation bilaterally (stocking).',
    'Neuro: AOx3; CN II–XII intact; strength 5/5; distal LE sensation ↓ vs stocking pattern; gait normal.',
    'Psych: Cooperative, appropriate affect.',
  ].join('\n')
}

function peObjectiveProgress() {
  return [
    'Vitals: BP 138/86, BMI 29.4. A1C 8.4% (↑ from 7.1%).',
    'CV/Pulm: RRR, clear lungs, no edema.',
    'Feet/neuro: Intact skin; monofilament — reduced distal sensation.',
  ].join('\n')
}

function peObjectiveDischarge() {
  return [
    'Stable for discharge from clinic; ambulatory, no acute distress.',
    'BP 138/86 at exit. Foot exam: no ulcer; protective sensation reduced — precautions reinforced.',
    'Endocrine referral placed; PCP follow-up per plan.',
  ].join('\n')
}

export function buildSoapBody(template) {
  const sFull =
    '57 y/o male with T2DM — follow-up for hyperglycemia and new bilateral foot tingling ×3 mo (burning worse at night). Home glucose ~180–220 mg/dL. Admits missed metformin (work stress) and more takeout. ROS+: paresthesias, fatigue. ROS−: chest pain, SOB, fever, open wounds. Asks if neuropathy can improve with control.'

  const sProgress =
    'T2DM follow-up: persistent foot tingling; inconsistent metformin; diet lapses on workdays. No acute CP/SOB today.'

  const a =
    '(1) T2DM with hyperglycemia — E11.65. (2) T2DM with diabetic neuropathy — E11.40. (3) HTN — I10. Rising A1C; exam/monofilament consistent with distal symmetric polyneuropathy (prototype).'

  const p =
    '1. Start semaglutide + counsel on SEs/sick day (prototype). 2. Metformin adherence tools (pillbox, alarms). 3. DSME / nutrition referral. 4. Endocrinology (Dr. Tashkentov). 5. Podiatry ~3 mo or sooner if skin issues. 6. A1C in 3 mo; review home logs. 7. BP and lifestyle counseling.'

  const pProgress =
    'Continue metformin + adherence plan; semaglutide started; endocrine + DSME + podiatry referrals; A1C 3 mo; urgent return for foot/chest red flags.'

  const pDischarge =
    'Discharge with diabetes/neuropathy plan, Rx and referrals; foot self-check and ED precautions reviewed; PCP/endocrine follow-up scheduled.'

  if (template === 'progress') {
    return {
      S: sProgress,
      O: peObjectiveProgress(),
      A: a,
      P: pProgress,
      title: 'Progress Note (prototype)',
    }
  }

  if (template === 'discharge') {
    return {
      S: sFull,
      O: peObjectiveDischarge(),
      A: a,
      P: pDischarge,
      title: 'Discharge Summary (prototype)',
    }
  }

  const oFull = peObjectiveFull()
  if (template === 'hp') {
    return { S: sFull, O: oFull, A: a, P: p, title: 'H&P Note (prototype)' }
  }
  return { S: sFull, O: oFull, A: a, P: p, title: 'SOAP (default)' }
}

export const DEMO_REFERRAL_LETTER = `Date: April 2, 2026
RE: John Smith, DOB 07/14/1968, MRN 00312

Dear Dr. Tashkentov,

I am referring Mr. John Smith for endocrinology evaluation and management optimization of type 2 diabetes. He reports home glucose readings 180–220 mg/dL and bilateral foot tingling for ~3 months. He admits intermittent non-adherence with metformin due to work-related stress and dietary lapses.

Recent labs: A1C 8.4% (up from 7.1% in Jan 2026). Exam today includes planned monofilament sensory screening for early peripheral neuropathy.

Assessment: T2DM with hyperglycemia (E11.65) and suspected early diabetic neuropathy (E11.40).

Plan initiated: Begin semaglutide (GLP-1 agonist) and reinforce adherence/lifestyle changes. I would appreciate your input on ongoing medication titration and long-term risk reduction.

Sincerely,
Dr. Elena Rodriguez, MD
Internal Medicine
Kelsey-Seybold Clinic, Houston`

export const USER_INTERVIEW = {
  date: 'April 2, 2026',
  interviewer: 'Dr. Elena Rodriguez, MD',
  patient: 'John Smith',
  duration: '18 min',
  sections: [
    {
      label: 'Presenting Concern',
      text:
        'John reports that his home glucose readings have been consistently elevated, typically ranging from 180–220 mg/dL. He also describes a new tingling sensation in both feet that has been present for approximately three months. He notes mild fatigue and feels his diabetes control has worsened since his last follow-up.',
    },
    {
      label: 'Medication & Adherence',
      text:
        'He is prescribed metformin but admits he has missed doses several times per week due to a busy and stressful work schedule. He describes difficulty maintaining a consistent routine for meals and medications. He is open to strategies that make adherence easier and wants to avoid long-term complications.',
    },
    {
      label: 'Diet & Lifestyle',
      text:
        'John reports increased reliance on late-night takeout and convenience foods, especially on workdays. He acknowledges higher carbohydrate intake than usual and fewer planned meals at home. He is willing to work on diet changes and asks for clear, practical steps he can follow.',
    },
    {
      label: 'Review of Systems',
      text:
        'He denies chest pain, shortness of breath, or acute neurologic deficits. He endorses bilateral foot tingling without skin breakdown, ulcers, or focal weakness. He reports intermittent tiredness but no fever or recent illness.',
    },
    {
      label: 'Clinical Assessment',
      text:
        'We reviewed that his A1C is 8.4%, increased from 7.1% in January, indicating worsening glycemic control. The pattern of symptoms is concerning for early peripheral neuropathy, and monofilament sensory testing was ordered to support objective screening. Blood pressure today is 138/86 with a BMI of 29.4, both relevant to cardiometabolic risk.',
    },
    {
      label: 'Plan Discussed with Patient',
      text:
        'We discussed re-establishing consistent metformin use and implementing achievable dietary adjustments to reduce glucose variability. Given the rising A1C, we discussed initiating semaglutide (a GLP-1 agonist) and reviewed expected benefits and potential side effects. We also discussed referral to endocrinology (Dr. Tashkentov) for medication optimization and follow-up planning, with an A1C recheck in three months.',
    },
  ],
}
