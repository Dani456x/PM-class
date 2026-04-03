<template>
  <q-page class="wt-session-page q-pa-md">
    <div v-if="consentNeeded" class="q-mb-md">
      <InlineAlert variant="warning" :dismissible="false">
        <strong>Consent.</strong> By continuing you confirm this session is authorized for this patient on this device.
        <q-btn flat dense no-caps label="Acknowledge" color="warning" class="q-ml-sm" @click="ackConsent" />
      </InlineAlert>
    </div>

    <!-- Patient banner -->
    <q-card v-if="patient" flat bordered class="wt-patient-banner q-mb-md">
      <q-card-section class="row items-center q-py-sm q-px-md">
        <PatientAvatar :name="patient.name" size="md" />
        <div class="q-ml-md col">
          <div class="row items-center wrap q-gutter-x-sm">
            <span class="text-h6 wt-h3">{{ patient.name }}</span>
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2 text-grey-8">DOB {{ maskedDob ? '••••-••-••' : patient.dob }}</span>
            <q-btn flat dense round size="sm" :icon="maskedDob ? 'sym_o_visibility' : 'sym_o_visibility_off'" @click="maskedDob = !maskedDob" />
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2 text-grey-8 font-mono">MRN {{ maskedMrn ? '•••••' : patient.mrn }}</span>
            <q-btn flat dense round size="sm" :icon="maskedMrn ? 'sym_o_visibility' : 'sym_o_visibility_off'" @click="maskedMrn = !maskedMrn" />
            <span class="text-body2 text-grey-8">·</span>
            <span class="text-body2">Insurance: {{ patient.insurance }}</span>
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Last edited by Dr. James Chen at {{ lastEditTime }} · <span class="text-weight-medium">Audit trail on</span>
          </div>
        </div>
        <q-btn flat no-caps color="primary" label="Change patient" @click="confirmChangePatient" />
      </q-card-section>
    </q-card>

    <div class="row q-col-gutter-md no-wrap items-stretch wt-session-row">
      <!-- Main -->
      <div class="col-12 col-lg">
        <q-card flat bordered class="wt-main-card full-height">
          <q-card-section>
            <!-- Locked state -->
            <div v-if="!patient" class="column flex-center q-pa-xl text-grey-7">
              <q-icon name="sym_o_lock" size="48px" class="q-mb-md" />
              <div class="text-h6">Select a patient to unlock recording</div>
              <q-btn unelevated no-caps color="primary" label="Go to patient search" class="q-mt-md" @click="$router.push('/start')" />
            </div>

            <template v-else>
              <!-- Recording bar -->
              <div class="column items-center q-py-lg">
                <div class="row items-center q-gutter-md q-mb-md full-width justify-center">
                  <q-select
                    v-model="micChoice"
                    :options="micOptions"
                    dense
                    outlined
                    style="max-width: 160px"
                    class="wt-mic-select"
                  >
                    <template v-slot:prepend>
                      <q-icon name="sym_o_mic" size="20px" />
                    </template>
                  </q-select>
                </div>

                <div
                  class="wt-record-btn-wrap"
                  :class="{ 'wt-record-btn-wrap--active': isRecording && !isPaused }"
                >
                  <q-btn
                    round
                    size="xl"
                    class="wt-record-btn"
                    :class="{ 'wt-record-btn--recording': isRecording && !isPaused }"
                    icon="sym_o_fiber_manual_record"
                    @click="toggleRecord"
                  />
                </div>

                <div v-if="isRecording" class="text-h4 wt-timer q-mt-md font-mono">{{ formatTime(recordingSeconds) }}</div>
                <div v-else class="text-body2 text-grey-7 q-mt-md">Ready to capture visit audio (simulated)</div>

                <div v-if="isRecording" class="wt-wave row justify-center q-gutter-xs q-mt-md full-width">
                  <div v-for="(h, i) in waveHeights" :key="i" class="wt-wave-bar" :style="{ height: h + 'px' }" />
                </div>

                <div v-if="isRecording" class="row q-gutter-sm q-mt-lg">
                  <ActionButton variant="secondary" @click="isPaused = !isPaused">{{ isPaused ? 'Resume' : 'Pause' }}</ActionButton>
                  <ActionButton variant="danger" @click="confirmStop">Stop</ActionButton>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <!-- Transcript -->
              <div class="text-h6 wt-h3 q-mb-sm">Transcript</div>
              <div class="text-caption text-grey-7 q-mb-md">Hover an utterance for edit actions (prototype). Timestamps jump playback (simulated).</div>

              <div ref="transcriptScrollRef" class="wt-transcript-scroll">
                <transition-group name="wt-utter" tag="div">
                  <div
                    v-for="(block, bi) in renderedUtterances"
                    :key="bi"
                    class="wt-utter q-mb-md"
                    @mouseenter="hoverUtterance = bi"
                    @mouseleave="hoverUtterance = null"
                  >
                    <div class="row items-center q-gutter-xs q-mb-xs">
                      <span class="wt-speaker-pill" :class="`wt-speaker-pill--${block.role}`">{{ block.speaker }}</span>
                      <q-btn flat dense no-caps size="sm" class="text-caption font-mono" @click="seekSim(block.startSec)">
                        {{ formatClock(block.startSec) }}
                      </q-btn>
                      <q-badge v-if="block.adapted" outline color="teal" class="q-ml-xs">Adapted</q-badge>
                    </div>
                    <div class="wt-utter-text text-body2">
                      <template v-for="(w, wi) in block.words" :key="wi">
                        <span
                          v-if="filterSmallTalk && block.smallTalk"
                          class="wt-small-talk"
                        >{{ w }} </span>
                        <span
                          v-else
                          :class="{ 'wt-uncertain': isUncertainWord(w) }"
                          :title="isUncertainWord(w) ? 'Possible mishear — did you mean angina?' : undefined"
                        >{{ w }} </span>
                      </template>
                    </div>
                    <div v-if="hoverUtterance === bi" class="row q-gutter-xs q-mt-xs">
                      <q-btn dense flat no-caps size="sm" label="Edit" color="primary" @click="notifyEdit" />
                      <q-btn dense flat no-caps size="sm" label="Assign speaker" color="grey-8" @click="notifyAssign" />
                    </div>
                  </div>
                </transition-group>
              </div>

              <div v-if="transcriptComplete" class="q-mt-lg">
                <q-btn
                  unelevated
                  no-caps
                  class="wt-generate-soap full-width"
                  icon="sym_o_stethoscope"
                  label="Generate SOAP Notes →"
                  @click="generateSoap"
                />
              </div>

              <!-- SOAP -->
              <div v-if="soapVisible" class="q-mt-xl">
                <div class="row items-center q-mb-md">
                  <q-select v-model="soapTemplate" :options="soapTemplateOptions" dense outlined emit-value map-options class="col-grow" style="max-width: 280px" />
                </div>
                <div v-if="soapLoading" class="q-pa-lg">
                  <q-skeleton type="text" class="q-mb-sm" />
                  <q-skeleton type="text" class="q-mb-sm" />
                  <q-skeleton type="text" />
                  <div class="text-caption text-grey-7 q-mt-md">Analyzing clinical data…</div>
                </div>
                <template v-else>
                  <div v-for="sec in soapSections" :key="sec.key" class="q-mb-md">
                    <div class="row items-center q-mb-xs">
                      <span class="text-weight-bold text-primary">{{ sec.key }}</span>
                      <q-badge outline class="q-ml-sm">{{ sec.words }} words</q-badge>
                      <q-space />
                      <q-btn flat dense no-caps label="Edit" :disable="sec.locked" @click="toggleSoapEdit(sec.key)" />
                      <q-btn flat dense round :icon="sec.locked ? 'sym_o_lock' : 'sym_o_lock_open'" @click="sec.locked = !sec.locked">
                        <q-tooltip>{{ sec.locked ? 'Locked — unlock to edit' : 'Lock section' }}</q-tooltip>
                      </q-btn>
                    </div>
                    <q-input
                      v-if="soapEditing === sec.key"
                      v-model="sec.text"
                      type="textarea"
                      autogrow
                      outlined
                      dense
                    />
                    <div v-else class="wt-soap-body text-body2" v-html="highlightSoap(sec.text)" />
                    <div v-if="sec.editCount" class="text-caption text-grey-7 q-mt-xs">{{ sec.editCount }} edit(s)</div>
                  </div>

                  <InlineAlert v-if="billingWarning" variant="warning" class="q-mb-md" :dismissible="false">
                    AI flagged a possible upcoding/undercoding discrepancy — review codes carefully.
                  </InlineAlert>

                  <ActionButton variant="primary" class="full-width q-mb-md" @click="openEmrModal">Approve &amp; Send to EMR →</ActionButton>

                  <q-card v-if="showReferralCallout" flat bordered class="q-pa-md wt-referral-callout">
                    <div class="text-body2 q-mb-sm">Dr. Chen mentioned a referral to cardiology. Draft a referral letter?</div>
                    <ActionButton variant="secondary" @click="draftReferral">Draft Referral Letter →</ActionButton>
                  </q-card>

                  <q-card v-if="referralLetterVisible" flat bordered class="q-pa-md q-mt-md">
                    <div class="row items-center q-mb-sm">
                      <span class="text-h6 wt-h3">Referral letter</span>
                      <q-space />
                      <q-select v-model="referralUrgency" :options="urgencyOptions" dense outlined emit-value map-options style="min-width: 160px" />
                    </div>
                    <q-input v-model="referralBody" type="textarea" autogrow outlined />
                    <div class="row q-gutter-sm q-mt-md">
                      <q-btn no-caps outline label="Fax (sim)" @click="sendReferral('fax')" />
                      <q-btn no-caps outline label="Email" @click="sendReferral('email')" />
                      <q-btn no-caps outline label="Print PDF" @click="sendReferral('pdf')" />
                    </div>
                  </q-card>

                  <q-banner v-if="referralSentMsg" class="bg-positive text-white q-mt-md rounded-borders">{{ referralSentMsg }}</q-banner>
                </template>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right panel -->
      <div v-if="patient" class="col-12 col-lg-auto wt-right-panel">
        <div class="column q-gutter-md">
          <q-btn flat dense :icon="rightCollapsed ? 'sym_o_chevron_left' : 'sym_o_chevron_right'" :label="rightCollapsed ? '' : 'Collapse'" @click="rightCollapsed = !rightCollapsed" />

          <template v-if="!rightCollapsed">
            <SectionCard title="Patient context" :default-expanded="true">
              <template #badge><StatusBadge label="EMR" variant="sent" /></template>
              <div class="text-caption text-grey-8 q-mb-sm">Chief conditions, medications, allergies (simulated)</div>
              <div class="row wrap q-gutter-xs q-mb-md">
                <q-chip dense outline color="primary">HTN</q-chip>
                <q-chip dense outline color="orange">NKDA</q-chip>
                <q-chip dense outline color="teal">Lisinopril 10mg</q-chip>
              </div>
              <q-input dense outlined placeholder="Ask about this patient…" class="q-mb-sm" @keyup.enter="simulateAsk">
                <template v-slot:append>
                  <q-icon name="sym_o_chat" />
                </template>
              </q-input>
              <div v-if="askReply" class="text-body2 q-mb-md">{{ askReply }}</div>
              <div class="text-caption text-weight-medium q-mb-xs">Recent visits</div>
              <q-timeline color="primary" dense>
                <q-timeline-entry title="Follow-up — I10" subtitle="Mar 12, 2026" />
                <q-timeline-entry title="Annual — Z00.00" subtitle="Jan 4, 2026" />
              </q-timeline>
              <q-card flat bordered class="q-pa-sm q-mt-md" style="background: #fff8e1; border-color: #ffe082">
                <div class="text-caption text-weight-medium text-warning">Pattern</div>
                <div class="text-caption">Blood pressure trending up over last 3 visits (simulated).</div>
              </q-card>
            </SectionCard>

            <SectionCard title="Clinical notes (live)" :default-expanded="true">
              <template #badge><StatusBadge :label="isRecording ? 'Live' : 'Saved'" :variant="isRecording ? 'flagged' : 'draft'" /></template>
              <div v-if="drugAlert" class="q-mb-sm">
                <InlineAlert variant="warning" :dismissible="false">{{ drugAlert }}</InlineAlert>
              </div>
              <div class="q-mb-sm"><strong>Chief complaint:</strong> {{ clinical.chiefComplaint || '—' }}</div>
              <div class="q-mb-sm"><strong>Symptoms:</strong></div>
              <ul class="q-pl-md q-my-none">
                <li v-for="(s, i) in clinical.symptoms" :key="i">{{ s }}</li>
                <li v-if="!clinical.symptoms.length" class="text-grey-6">—</li>
              </ul>
              <div class="q-mb-sm"><strong>Key terms:</strong> {{ clinical.keyTerms.join(', ') || '—' }}</div>
              <div class="q-mb-sm"><strong>Provisional:</strong> {{ clinical.provisional || '—' }}</div>
              <div class="q-mb-md"><strong>Actions:</strong></div>
              <div class="row wrap q-gutter-xs">
                <q-chip v-for="a in clinical.actions" :key="a" dense color="primary" text-color="white">{{ a }}</q-chip>
              </div>
              <q-toggle v-model="filterSmallTalk" label="De-emphasize small talk" class="q-mt-md" dense />
            </SectionCard>

            <SectionCard v-if="soapVisible && !soapLoading" title="Suggested billing codes" :default-expanded="true">
              <template #badge><StatusBadge :label="`${approvedBillingCount} approved`" variant="approved" /></template>
              <BillingCodeChip
                v-for="c in billingCodes"
                :key="c.id"
                :code="c.code"
                :type="c.type"
                :description="c.description"
                :confidence="c.confidence"
                :status="c.status"
                class="q-mb-sm"
                @approve="approveCode(c)"
                @reject="c.status = 'rejected'"
                @modify="c.status = 'modified'"
              />
              <div class="text-body2 q-mt-md">{{ approvedBillingCount }} codes approved · Est. reimbursement: ${{ estReimbursement }} (simulated)</div>
            </SectionCard>
          </template>
        </div>
      </div>
    </div>

    <q-dialog v-model="stopConfirm">
      <q-card style="min-width: 320px; border-radius: 12px">
        <q-card-section class="text-h6">End session?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="End" @click="endRecording" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="emrModal">
      <q-card style="min-width: 360px; border-radius: 12px">
        <q-card-section class="text-h6">Send to EMR?</q-card-section>
        <q-select v-model="emrChoice" :options="emrOptions" outlined dense class="q-mx-md q-mb-md" />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="positive" label="Confirm" @click="confirmEmr" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import PatientAvatar from '../components/medical/PatientAvatar.vue'
import ActionButton from '../components/medical/ActionButton.vue'
import SectionCard from '../components/medical/SectionCard.vue'
import StatusBadge from '../components/medical/StatusBadge.vue'
import BillingCodeChip from '../components/medical/BillingCodeChip.vue'
import InlineAlert from '../components/medical/InlineAlert.vue'
import {
  DEMO_BILLING_CODES,
  DEMO_CLINICAL_MILESTONES,
  DEMO_PATIENT,
  DEMO_REFERRAL_LETTER,
  DEMO_SOAP_TEMPLATES,
  DEMO_UTTERANCES,
  buildSoapBody,
} from '../data/medical-demo.js'

const router = useRouter()
const $q = useQuasar()

const STORAGE_PATIENT = 'wt_selected_patient'
const STORAGE_CONSENT = id => `wt_consent_${id}`

const patient = ref(null)
const maskedDob = ref(true)
const maskedMrn = ref(true)
const consentNeeded = ref(false)
const lastEditTime = ref('2:14 PM')

const micChoice = ref('Integrated Microphone')
const micOptions = ['Integrated Microphone', 'USB Headset', 'Bluetooth']

const isRecording = ref(false)
const isPaused = ref(false)
const recordingSeconds = ref(0)
let recordTimer = null
let wordTimer = null

const utteranceProgress = ref(0)
const wordIndex = ref(0)
const renderedUtterances = ref([])
const transcriptScrollRef = ref(null)
const transcriptComplete = ref(false)
const hoverUtterance = ref(null)

const filterSmallTalk = ref(false)
const clinical = ref({
  chiefComplaint: '',
  symptoms: [],
  keyTerms: [],
  provisional: '',
  actions: [],
})
const drugAlert = ref('')
const askReply = ref('')

const soapVisible = ref(false)
const soapLoading = ref(false)
const soapTemplate = ref('soap')
const soapTemplateOptions = DEMO_SOAP_TEMPLATES.map(t => ({ label: t.label, value: t.value }))
const soapSections = ref([])
const soapEditing = ref(null)

const billingCodes = ref(DEMO_BILLING_CODES.map(c => ({ ...c, status: 'pending' })))
const billingWarning = ref(true)
const showReferralCallout = ref(false)
const referralLetterVisible = ref(false)
const referralBody = ref(DEMO_REFERRAL_LETTER)
const referralUrgency = ref('routine')
const urgencyOptions = [
  { label: 'Routine', value: 'routine' },
  { label: 'Semi-Urgent', value: 'semi' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'STAT', value: 'stat' },
]
const referralSentMsg = ref('')

const rightCollapsed = ref(false)
const stopConfirm = ref(false)
const emrModal = ref(false)
const emrChoice = ref('Epic')
const emrOptions = ['Epic', 'Athenahealth', 'DrChrono', 'SimplePractice']
const waveHeights = ref(Array.from({ length: 24 }, () => 4))

let waveTimer = null

const WORD_MS = 300

function loadPatient() {
  try {
    const raw = sessionStorage.getItem(STORAGE_PATIENT)
    patient.value = raw ? JSON.parse(raw) : null
  } catch {
    patient.value = null
  }
  if (patient.value?.id) {
    consentNeeded.value = !localStorage.getItem(STORAGE_CONSENT(patient.value.id))
  }
}

function ackConsent() {
  if (patient.value?.id) {
    localStorage.setItem(STORAGE_CONSENT(patient.value.id), '1')
    consentNeeded.value = false
  }
}

function confirmChangePatient() {
  if (isRecording.value) {
    $q.dialog({
      title: 'Recording in progress',
      message: 'Stop recording and change patient?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      resetRecordingState()
      sessionStorage.removeItem(STORAGE_PATIENT)
      router.push('/start')
    })
  } else {
    sessionStorage.removeItem(STORAGE_PATIENT)
    router.push('/start')
  }
}

function resetRecordingState() {
  isRecording.value = false
  isPaused.value = false
  if (recordTimer) clearInterval(recordTimer)
  recordTimer = null
  if (wordTimer) clearInterval(wordTimer)
  wordTimer = null
  recordingSeconds.value = 0
  utteranceProgress.value = 0
  wordIndex.value = 0
  renderedUtterances.value = []
  transcriptComplete.value = false
  soapVisible.value = false
  soapLoading.value = false
  showReferralCallout.value = false
  referralLetterVisible.value = false
  referralSentMsg.value = ''
  billingCodes.value = DEMO_BILLING_CODES.map(c => ({ ...c, status: 'pending' }))
  clinical.value = { chiefComplaint: '', symptoms: [], keyTerms: [], provisional: '', actions: [] }
}

function toggleRecord() {
  if (!isRecording.value) {
    startRecording()
  } else if (!isPaused.value) {
    isPaused.value = true
    pauseWordStream()
  } else {
    isPaused.value = false
    resumeWordStream()
  }
}

function startRecording() {
  resetRecordingState()
  isRecording.value = true
  isPaused.value = false
  utteranceProgress.value = 0
  wordIndex.value = 0
  renderedUtterances.value = []
  recordingSeconds.value = 0
  recordTimer = setInterval(() => {
    if (!isPaused.value) recordingSeconds.value += 1
  }, 1000)
  startWave()
  runWordStream()
}

function pauseWordStream() {
  if (wordTimer) clearInterval(wordTimer)
  wordTimer = null
  stopWave()
}

function resumeWordStream() {
  startWave()
  runWordStream()
}

function runWordStream() {
  if (wordTimer) clearInterval(wordTimer)
  const tick = () => {
    if (!isRecording.value || isPaused.value) return
    const uIdx = utteranceProgress.value
    const u = DEMO_UTTERANCES[uIdx]
    if (!u) {
      clearInterval(wordTimer)
      wordTimer = null
      transcriptComplete.value = true
      isRecording.value = false
      isPaused.value = false
      if (recordTimer) clearInterval(recordTimer)
      recordTimer = null
      stopWave()
      return
    }
    let block = renderedUtterances.value[uIdx]
    if (!block) {
      block = {
        speaker: u.speaker,
        role: u.role,
        startSec: u.startSec,
        words: [],
        smallTalk: false,
        adapted: u.role === 'doctor' && uIdx === 0,
      }
      renderedUtterances.value.push(block)
    }
    if (wordIndex.value < u.words.length) {
      block.words.push(u.words[wordIndex.value])
      wordIndex.value += 1
      nextTick(() => {
        const el = transcriptScrollRef.value
        if (el) el.scrollTop = el.scrollHeight
      })
    } else {
      applyMilestonesForCompletedUtterance(uIdx)
      utteranceProgress.value += 1
      wordIndex.value = 0
    }
  }
  wordTimer = setInterval(tick, WORD_MS)
}

function startWave() {
  stopWave()
  waveTimer = setInterval(() => {
    waveHeights.value = waveHeights.value.map(() => 4 + Math.random() * 28)
  }, 120)
}

function stopWave() {
  if (waveTimer) clearInterval(waveTimer)
  waveTimer = null
  waveHeights.value = waveHeights.value.map(() => 4)
}

function applyMilestonesForCompletedUtterance(completedUtteranceIndex) {
  DEMO_CLINICAL_MILESTONES.forEach(m => {
    if (m.afterUtteranceIndex === completedUtteranceIndex) {
      if (m.chiefComplaint) clinical.value.chiefComplaint = m.chiefComplaint
      if (m.symptoms) clinical.value.symptoms = [...m.symptoms]
      if (m.keyTerms) clinical.value.keyTerms = [...m.keyTerms]
      if (m.provisional) {
        clinical.value.provisional = m.provisional
        drugAlert.value =
          'Patient mentioned exertional symptoms — verify antihypertensive regimen if beta-blocker considered (simulated).'
      }
      if (m.actions) clinical.value.actions = [...m.actions]
    }
  })
}

function confirmStop() {
  stopConfirm.value = true
}

function endRecording() {
  stopConfirm.value = false
  pauseWordStream()
  isRecording.value = false
  if (recordTimer) clearInterval(recordTimer)
  recordTimer = null
  stopWave()
  transcriptComplete.value = true
}

function formatTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatClock(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function seekSim(sec) {
  $q.notify({ message: `Seek to ${formatClock(sec)} (simulated)`, color: 'primary', position: 'top' })
}

function isUncertainWord(w) {
  return /angina/i.test(w)
}

function notifyEdit() {
  $q.notify({ message: 'Inline edit (prototype)', color: 'grey-8' })
}

function notifyAssign() {
  $q.notify({ message: 'Speaker assignment (prototype)', color: 'grey-8' })
}

function generateSoap() {
  soapVisible.value = true
  soapLoading.value = true
  setTimeout(() => {
    applySoapTemplate()
    soapLoading.value = false
  }, 2000)
}

function applySoapTemplate() {
  const b = buildSoapBody(soapTemplate.value)
  soapSections.value = [
    { key: 'S', text: b.S, words: b.S.split(/\s+/).length, locked: false, editCount: 0 },
    { key: 'O', text: b.O, words: b.O.split(/\s+/).length, locked: false, editCount: 0 },
    { key: 'A', text: b.A, words: b.A.split(/\s+/).length, locked: false, editCount: 0 },
    { key: 'P', text: b.P, words: b.P.split(/\s+/).length, locked: false, editCount: 0 },
  ]
}

watch(soapTemplate, () => {
  if (soapVisible.value && !soapLoading.value) applySoapTemplate()
})

function toggleSoapEdit(key) {
  const sec = soapSections.value.find(s => s.key === key)
  if (!sec || sec.locked) return
  soapEditing.value = soapEditing.value === key ? null : key
  if (!soapEditing.value) sec.editCount += 1
}

function highlightSoap(text) {
  if (!text) return ''
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\b(angina|EKG|stress test|cardiologist)\b/gi, m => `<span class="wt-teal-term" title="ICD/CPT hint (sim)">${m}</span>`)
}

const approvedBillingCount = computed(() => billingCodes.value.filter(c => c.status === 'approved').length)
const estReimbursement = computed(() => 120 + approvedBillingCount.value * 74)

watch(approvedBillingCount, n => {
  if (n >= 2 && soapVisible.value && !soapLoading.value) showReferralCallout.value = true
})

function approveCode(c) {
  c.status = 'approved'
}

function openEmrModal() {
  emrModal.value = true
}

function confirmEmr() {
  emrModal.value = false
  $q.notify({
    message: 'Notes sent to EMR · Reference ID: #TXN-4492',
    color: 'positive',
    icon: 'sym_o_check_circle',
  })
}

function draftReferral() {
  referralLetterVisible.value = true
  referralBody.value = DEMO_REFERRAL_LETTER
}

function sendReferral() {
  referralSentMsg.value = 'Referral sent to Dr. Patel via secure fax · April 2, 2026, 2:24 PM.'
  $q.notify({ message: referralSentMsg.value, color: 'positive' })
}

function simulateAsk() {
  askReply.value = 'Simulated: No documented amoxicillin allergy; penicillin allergy not listed (prototype).'
}

function resetDemo() {
  resetRecordingState()
  askReply.value = ''
  drugAlert.value = ''
  soapEditing.value = null
  sessionStorage.setItem(STORAGE_PATIENT, JSON.stringify(DEMO_PATIENT))
  loadPatient()
  consentNeeded.value = false
  $q.notify({ message: 'Demo reset', color: 'primary' })
}

function onWindowKeydown(e) {
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.shiftKey && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault()
    resetDemo()
  }
}

onMounted(() => {
  loadPatient()
  if (!patient.value) router.replace('/start')
  window.addEventListener('keydown', onWindowKeydown, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onWindowKeydown, true)
  if (recordTimer) clearInterval(recordTimer)
  if (wordTimer) clearInterval(wordTimer)
  stopWave()
})
</script>

<style scoped>
.wt-session-page {
  background: #f8fafb;
  font-family: 'IBM Plex Sans', sans-serif;
}
.wt-h3 {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #0f3d3d;
}
.wt-patient-banner {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.font-mono {
  font-family: 'IBM Plex Mono', monospace;
}
.wt-main-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.wt-record-btn-wrap {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  transition: box-shadow 0.2s;
}
.wt-record-btn-wrap--active {
  box-shadow: 0 0 0 4px rgba(183, 28, 28, 0.25);
  animation: wt-pulse 1.4s ease-in-out infinite;
}
@keyframes wt-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(183, 28, 28, 0.2);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(183, 28, 28, 0.12);
  }
}
.wt-record-btn {
  width: 64px !important;
  height: 64px !important;
  background: #0f3d3d !important;
  color: #fff !important;
}
.wt-record-btn--recording {
  background: #b71c1c !important;
}
.wt-timer {
  color: #0f3d3d;
}
.wt-wave-bar {
  width: 4px;
  background: #1565c0;
  border-radius: 4px;
  min-height: 4px;
  transition: height 0.12s;
}
.wt-transcript-scroll {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 8px;
}
.wt-utter {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eceff1;
  background: #fafafa;
  animation: wt-fade-in 0.35s ease;
}
@keyframes wt-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.wt-speaker-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid transparent;
}
.wt-speaker-pill--doctor {
  background: #e0f2f1;
  color: #0f3d3d;
  border-color: #b2dfdb;
}
.wt-speaker-pill--patient {
  background: #eceff1;
  color: #37474f;
  border-color: #cfd8dc;
}
.wt-uncertain {
  border-bottom: 2px solid #ffc107;
  cursor: help;
}
.wt-small-talk {
  text-decoration: line-through;
  opacity: 0.55;
}
.wt-generate-soap {
  background: #0f3d3d !important;
  color: #fff !important;
  min-height: 48px;
  border-radius: 8px;
  animation: wt-pulse-cta 2s ease-in-out infinite;
}
@keyframes wt-pulse-cta {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(15, 61, 61, 0.35);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(15, 61, 61, 0);
  }
}
.wt-right-panel {
  width: 100%;
  max-width: 320px;
}
@media (max-width: 1023px) {
  .wt-right-panel {
    max-width: none;
  }
}
.wt-referral-callout {
  background: #e3f2fd;
  border-color: #90caf9 !important;
}
</style>

<style>
.wt-teal-term {
  text-decoration: underline;
  text-decoration-color: #0f3d3d;
  text-underline-offset: 2px;
}
</style>
