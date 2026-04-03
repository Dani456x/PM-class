/** WhisperTranscribe Medical — prototype demo data (Sarah Mitchell) */

export const DEMO_PATIENT = {
  id: 'sarah-mitchell',
  name: 'Sarah Mitchell',
  dob: '1985-03-12',
  mrn: '00421',
  insurance: 'Aetna',
  lastSeen: '2 days ago',
}

export const RECENT_PATIENTS = [
  DEMO_PATIENT,
  { id: 'john-doe', name: 'John Doe', dob: '1978-06-22', mrn: '00892', insurance: 'BCBS', lastSeen: '1 week ago' },
]

/** Full utterances — words streamed ~300ms each in UI */
export const DEMO_UTTERANCES = [
  {
    speaker: 'DR. CHEN',
    role: 'doctor',
    startSec: 0,
    words: ['Good', 'morning', 'Sarah,', 'what', 'brings', 'you', 'in', 'today?'],
    uncertainIndex: null,
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 5,
    words: [
      "I've", 'been', 'having', 'chest', 'tightness', 'and', 'shortness', 'of', 'breath', 'for', 'about', 'two', 'weeks.',
      'Mostly', 'when', 'I', 'climb', 'stairs.',
    ],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. CHEN',
    role: 'doctor',
    startSec: 22,
    words: ['Any', 'pain', 'radiating', 'to', 'your', 'arm', 'or', 'jaw?', 'Any', 'dizziness?'],
    uncertainIndex: null,
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 30,
    words: ['Slight', 'dizziness', 'sometimes,', 'no', 'pain.', 'My', 'father', 'had', 'heart', 'disease.'],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. CHEN',
    role: 'doctor',
    startSec: 45,
    words: [
      "I'm", 'going', 'to', 'order', 'an', 'EKG', 'today.', 'Based', 'on', "what", "you're", 'describing,',
      'I', 'believe', 'this', 'may', 'be', 'stable', 'angina.', "We'll", 'need', 'a', 'stress', 'test', 'to', 'confirm.',
    ],
    uncertainIndex: 18, // "angina" for demo uncertainty
  },
  {
    speaker: 'PATIENT',
    role: 'patient',
    startSec: 62,
    words: ['Is', 'that', 'serious?'],
    uncertainIndex: null,
  },
  {
    speaker: 'DR. CHEN',
    role: 'doctor',
    startSec: 67,
    words: [
      "It's", 'manageable,', 'but', 'I', 'want', 'to', 'refer', 'you', 'to', 'a', 'cardiologist', '—', 'Dr.', 'Patel',
      'at', 'Houston', 'Methodist.', "I'll", 'send', 'the', 'referral', 'today.',
    ],
    uncertainIndex: null,
  },
]

export const DEMO_CLINICAL_MILESTONES = [
  { afterUtteranceIndex: 0, chiefComplaint: 'Chest tightness and shortness of breath × 2 weeks (emerging).' },
  { afterUtteranceIndex: 1, symptoms: ['Chest tightness', 'Exertional dyspnea', 'Worse on stairs'] },
  { afterUtteranceIndex: 3, symptoms: ['Chest tightness', 'Exertional dyspnea', 'Episodic dizziness', 'FHx CAD'] },
  { afterUtteranceIndex: 4, keyTerms: ['angina', 'EKG', 'stress test'], provisional: 'Stable angina — provisional pending stress test' },
  { afterUtteranceIndex: 6, actions: ['Order EKG', 'Refer to cardiology (Dr. Patel)'] },
]

export const DEMO_BILLING_CODES = [
  {
    id: '1',
    code: 'I20.9',
    type: 'ICD-10',
    description: 'Angina pectoris, unspecified',
    confidence: 94,
  },
  {
    id: '2',
    code: '93000',
    type: 'CPT',
    description: 'EKG complete',
    confidence: 88,
  },
  {
    id: '3',
    code: '93015',
    type: 'CPT',
    description: 'Cardiovascular stress test',
    confidence: 76,
  },
]

export const DEMO_SOAP_TEMPLATES = [
  { label: 'SOAP (default)', value: 'soap' },
  { label: 'H&P Note', value: 'hp' },
  { label: 'Progress Note', value: 'progress' },
  { label: 'Discharge Summary', value: 'discharge' },
]

export function buildSoapBody(template) {
  const s =
    'Patient presents with chest tightness and exertional dyspnea × 2 weeks. Reports episodic dizziness. Family history positive for coronary artery disease (father). Denies chest pain radiating to arm or jaw.'
  const o = 'EKG ordered. Vitals pending. No acute distress observed. Further workup with stress test to be scheduled.'
  const a = 'Stable angina (ICD-10: I20.9) — provisional diagnosis pending stress test results.'
  const p =
    '1. Order EKG stat. 2. Schedule cardiac stress test. 3. Refer to cardiology (Dr. Patel, Houston Methodist). 4. Patient education re: angina management. 5. Follow-up in 1 week.'

  if (template === 'hp') {
    return { S: s, O: o, A: a, P: p, title: 'H&P Note (prototype)' }
  }
  if (template === 'progress') {
    return {
      S: 'Interval history: continued exertional symptoms; patient adherent to plan.',
      O: 'Vitals stable. EKG completed.',
      A: a,
      P: 'Continue cardiology referral; stress test scheduling.',
      title: 'Progress Note (prototype)',
    }
  }
  if (template === 'discharge') {
    return {
      S: s,
      O: o,
      A: a,
      P: 'Outpatient follow-up with cardiology; return precautions reviewed.',
      title: 'Discharge Summary (prototype)',
    }
  }
  return { S: s, O: o, A: a, P: p, title: 'SOAP (default)' }
}

export const DEMO_REFERRAL_LETTER = `Date: April 2, 2026
RE: Sarah Mitchell, DOB 03/12/1985, MRN 00421

Dear Dr. Patel,

I am referring Ms. Mitchell for cardiology evaluation. She presents with a 2-week history of exertional chest tightness and dyspnea, with occasional dizziness. Family history is notable for coronary artery disease. We have ordered an EKG and plan cardiac stress testing.

Provisional Dx: Stable angina (I20.9) pending stress test.

Urgency: Routine — please see within 2 weeks.

Sincerely,
Dr. James Chen, MD`
