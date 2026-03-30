# EMR Transfer Example (Prototype)

This document shows **example outputs** from the WhisperTranscribe prototype and **how you could transfer them into an EMR**.

## Important disclaimers
- This is a **UI-only prototype**. No data is sent to an EMR.
- This is **not HIPAA-certified** and does not claim compliance.
- This is **not medical advice** and **not billing/coding advice**.
- Always validate clinical content, coding, and local payer rules before charting.

## What you can export (example payloads)

### 1) Transcript segments (JSON)
Use this if you want to keep structured timestamps + speaker labels.

```json
[
  {
    "speaker": "Clinician",
    "startTime": "00:00:00",
    "endTime": "00:00:04",
    "text": "Hi John, I'm Dr. Reed. What brings you in today?"
  },
  {
    "speaker": "Patient",
    "startTime": "00:00:05",
    "endTime": "00:00:09",
    "text": "I've had headaches and fatigue for about two weeks."
  }
]
```

### 2) SOAP note (plain text)
Use this if your EMR supports copy/paste into note sections.

```text
CC: Headache and fatigue for ~2 weeks.

HPI: Mild intermittent nausea. Denies fever and vision changes. Stress and reduced sleep reported.

Assessment (prototype): Tension-type headache vs. other benign etiologies; screen for red flags.

Plan (prototype): Review red flags and vitals; consider basic labs if persistent/worsening. Sleep hygiene and stress management counseling (prototype).
```

### 3) Billing suggestions (plain text)
Use this if your billing workflow accepts “candidate codes” notes for later review.

```text
Candidate codes (prototype):
- G44.209 — Unspecified headache (example)
- Z73.3 — Stress, not elsewhere classified (example)
- R11.0 — Nausea (example)
```

## Common EMR mapping (copy/paste)

### Typical EMR fields → prototype sources
- **Chief Complaint (CC)** → SOAP CC
- **HPI** → SOAP Symptoms/HPI
- **Assessment** → SOAP Assessment
- **Plan** → SOAP Plan
- **Problem list** → derived from Assessment keywords (prototype)
- **Medications** → transcript mentions + patient history panel (prototype)
- **Billing notes** → billing suggestions panel (prototype; must be verified)

### Example mapping for “John Doe (prototype)”
- **CC**: “Headaches and fatigue for ~2 weeks”
- **HPI**: “Mild nausea at times; denies fever/vision changes; stress and reduced sleep”
- **Assessment**: “Likely tension-type headache; review red flags”
- **Plan**: “Vitals, review red flags, consider basic labs if persistent; sleep hygiene/stress management”

## Example workflow (prototype)
1. Open `/transcript/john-doe` in the app.
2. Review or edit transcript segments (Edit mode).
3. Click **Generate SOAP** (choose template if desired).
4. Click **Generate billing codes** (prototype suggestions).
5. Copy the SOAP fields into the EMR’s CC/HPI/Assessment/Plan sections.
6. Paste candidate billing suggestions into a billing review note or task (if your workflow uses one).

## FHIR-like JSON example (illustrative only)
This is a **non-authoritative** example of how a SOAP-style note might be represented for an EMR interface. Real implementations vary widely.

```json
{
  "resourceType": "DocumentReference",
  "status": "current",
  "type": {
    "text": "Clinical note (SOAP) - prototype"
  },
  "subject": {
    "display": "John Doe"
  },
  "content": [
    {
      "attachment": {
        "contentType": "text/plain",
        "title": "SOAP Note - John Doe (prototype)",
        "data": "Q0M6IEhlYWRhY2hlIGFuZCBmYXRpZ3VlIGZvciB+MiB3ZWVrcy4uLg=="
      }
    }
  ]
}
```

Notes:
- The `data` field above is **placeholder base64** (not real encoded content).
- In a real system you might use `Composition`, `Observation`, `Condition`, `MedicationStatement`, etc.

