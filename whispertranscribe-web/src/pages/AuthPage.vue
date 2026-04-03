<template>
  <!-- Split login (spec v2) -->
  <q-page v-if="gate === 'login'" class="auth-split full-height">
    <div class="row full-height no-wrap">
      <div class="col-12 col-md-6 auth-brand column justify-center q-pa-xl">
        <div class="text-h4 text-weight-bold text-white q-mb-md" style="font-family: 'DM Sans', sans-serif">
          WhisperTranscribe Medical
        </div>
        <div class="text-body1 text-white q-mb-lg" style="opacity: 0.9">
          Clinical precision, institutional trust, HIPAA-aware prototype UI.
        </div>
        <div class="row q-gutter-sm q-mb-md">
          <q-chip outline color="white" text-color="white" icon="sym_o_verified_user">HIPAA-ready workflows</q-chip>
          <q-chip outline color="white" text-color="white" icon="sym_o_encrypted">Encrypted in transit (sim)</q-chip>
        </div>
        <div class="text-caption text-white" style="opacity: 0.75">Illustrative only — not for real PHI.</div>
      </div>
      <div class="col-12 col-md-6 flex flex-center q-pa-md bg-surface">
        <q-card flat bordered class="auth-login-card q-pa-lg full-width">
          <q-tabs v-model="loginTab" dense align="justify" class="q-mb-md" active-color="primary">
            <q-tab name="email" label="Email" />
            <q-tab name="qr" label="Sign in with QR" />
          </q-tabs>
          <q-tab-panels v-model="loginTab" animated>
            <q-tab-panel name="email" class="q-pa-none">
              <q-input v-model="email" outlined dense type="email" label="Email" class="q-mb-sm" />
              <q-input v-model="password" outlined dense type="password" label="Password" class="q-mb-md" />
              <q-btn unelevated no-caps color="primary" class="full-width" style="min-height: 44px; border-radius: 8px" label="Sign in" @click="enterApp" />
            </q-tab-panel>
            <q-tab-panel name="qr" class="q-pa-none column items-center">
              <div class="relative-position q-mb-md">
                <q-circular-progress
                  :value="qrProgress"
                  size="160px"
                  :thickness="0.06"
                  color="primary"
                  track-color="grey-3"
                  class="qr-ring"
                />
                <div class="absolute-center text-center">
                  <q-icon name="sym_o_qr_code_2" size="72px" color="primary" />
                </div>
              </div>
              <div class="text-caption text-grey-7 q-mb-sm">Token refreshes in {{ qrSeconds }}s</div>
              <q-btn outline no-caps color="primary" label="Simulate scan from mobile" @click="simulateQrScan" />
            </q-tab-panel>
          </q-tab-panels>
          <q-separator class="q-my-md" />
          <div class="text-center">
            <q-btn flat no-caps color="primary" label="Continue as Guest (Demo)" @click="enterApp" />
          </div>
          <div class="text-center q-mt-sm">
            <q-btn flat dense no-caps color="grey-7" label="First-time setup wizard" @click="startWizard" />
          </div>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="qrFlash">
      <q-card class="bg-positive text-white text-center q-pa-xl" style="border-radius: 12px; min-width: 280px">
        <q-icon name="sym_o_check_circle" size="48px" />
        <div class="text-h6 q-mt-md">Session linked</div>
      </q-card>
    </q-dialog>
  </q-page>

  <!-- Original onboarding wizard -->
  <q-page v-else class="flex flex-center wt-auth-wizard full-height q-pa-md">
    <q-card flat class="border-radius-16 q-pa-xl full-width bg-white auth-card" :style="{ maxWidth: cardWidth }">
      <div v-if="step === 0" class="text-center">
        <div class="flex justify-center q-mb-sm">
          <img src="/logos/logo-onboarding.svg" alt="WhisperTranscribe" class="auth-logo" />
        </div>
        <div class="text-h5 text-weight-medium q-mb-xs">Get started with</div>
        <div class="text-h4 text-weight-medium text-primary q-mb-lg">60 free minutes</div>
        <q-btn no-caps color="primary" label="Continue" class="q-btn--lg full-width" @click="step = 1" />
      </div>

      <template v-if="step >= 1 && step <= 3">
        <div class="row items-center no-wrap q-mb-md">
          <template v-for="(s, i) in stepDefs" :key="s.n">
            <div
              class="step-badge"
              :class="{
                'step-badge--done': s.n < step,
                'step-badge--active': s.n === step,
                'step-badge--future': s.n > step,
              }"
            >
              {{ s.n }}
            </div>
            <q-icon v-if="i < stepDefs.length - 1" name="sym_o_trending_flat" color="primary" class="q-mx-xs" size="18px" />
          </template>
        </div>

        <div v-if="step === 1">
          <div class="text-h4 q-mb-sm">Transcription language</div>
          <div class="text-body2 q-mb-md">What language do you use most often in your audio or video?</div>
          <q-select
            v-model="selectedLanguage"
            :options="languages"
            option-label="label"
            option-value="code"
            outlined
            dense
            class="q-mb-md default-input"
          />
          <div class="flex justify-end q-mt-md">
            <q-btn no-caps label="Next" color="primary" @click="step = 2" />
          </div>
        </div>

        <div v-if="step === 2">
          <div class="text-h4 q-mb-sm">Create your first project</div>
          <div class="text-body2 q-mb-md">Your transcripts will be saved to projects.</div>
          <q-input v-model="projectName" outlined dense placeholder="My project" class="q-mb-md default-input" />
          <div class="flex justify-end q-mt-md">
            <q-btn no-caps label="Next" color="primary" :disable="!projectName?.trim()" @click="step = 3" />
          </div>
        </div>

        <div v-if="step === 3">
          <div class="text-h4 q-mb-sm">What best describes you?</div>
          <div class="text-body2 q-mb-md">We will use this to create a content from your transcript</div>
          <div class="profiles-list q-px-sm">
            <ProfileSelector :selected-profile="selectedProfile" @select-profile="p => (selectedProfile = p)" />
          </div>
          <div class="flex justify-end q-mt-md">
            <q-btn no-caps label="Next" color="primary" :disable="!selectedProfile" @click="completeOnboarding" />
          </div>
        </div>
      </template>

      <div v-if="step === 4" class="text-center">
        <div class="text-h4 q-mt-xl q-mb-sm">Welcome to WhisperTranscribe!</div>
        <div class="q-mb-lg">Your workspace is set up for you 🎉</div>
        <div class="column items-center q-gutter-y-sm">
          <q-btn no-caps label="Open patient search" color="primary" @click="goToStart" />
          <q-btn no-caps flat color="primary" label="View example transcript" @click="goToExample" />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { languages, defaultLanguage } from '../data/languages.js'
import ProfileSelector from '../components/ProfileSelector.vue'

const router = useRouter()

const gate = ref('login')
const loginTab = ref('email')
const email = ref('')
const password = ref('')
const qrSeconds = ref(15)
let qrTimer = null
const qrFlash = ref(false)

const qrProgress = computed(() => ((15 - qrSeconds.value) / 15) * 100)

function startQrCountdown() {
  if (qrTimer) clearInterval(qrTimer)
  qrSeconds.value = 15
  qrTimer = setInterval(() => {
    if (qrSeconds.value <= 1) {
      qrSeconds.value = 15
    } else {
      qrSeconds.value -= 1
    }
  }, 1000)
}

watch(loginTab, t => {
  if (t === 'qr') startQrCountdown()
  else if (qrTimer) clearInterval(qrTimer)
})

onMounted(() => {
  if (loginTab.value === 'qr') startQrCountdown()
})

onUnmounted(() => {
  if (qrTimer) clearInterval(qrTimer)
})

function simulateQrScan() {
  qrFlash.value = true
  setTimeout(() => {
    qrFlash.value = false
    enterApp()
  }, 900)
}

function enterApp() {
  localStorage.setItem('onboardingCompleted', 'true')
  router.push('/start')
}

function startWizard() {
  gate.value = 'wizard'
}

const step = ref(0)
const selectedLanguage = ref(defaultLanguage)
const projectName = ref('My project')
const selectedProfile = ref(null)

const cardWidth = computed(() => {
  const w = step.value
  if (w === 0) return '420px'
  if (w === 1 || w === 2) return '500px'
  if (w === 3) return '750px'
  if (w === 4) return '400px'
  return '420px'
})

const stepDefs = [{ n: 1 }, { n: 2 }, { n: 3 }]

function completeOnboarding() {
  step.value = 4
}

function goToStart() {
  localStorage.setItem('onboardingCompleted', 'true')
  router.push('/start')
}

function goToExample() {
  localStorage.setItem('onboardingCompleted', 'true')
  router.push('/transcript/example')
}
</script>

<style scoped>
.auth-split {
  background: #0f3d3d;
}
.auth-brand {
  background: linear-gradient(160deg, #0f3d3d 0%, #0a2a2a 100%);
  min-height: 320px;
}
.bg-surface {
  background: #f8fafb;
}
.auth-login-card {
  max-width: 420px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}
.qr-ring {
  transform: rotate(-90deg);
}
.wt-auth-wizard {
  background: #f8fafb;
}
.auth-card {
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.12);
}
.profiles-list {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
}
.step-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}
.step-badge--done {
  background: var(--brand-primary);
  color: #fff;
}
.step-badge--active {
  background: var(--brand-primary-bg);
  color: var(--brand-primary);
}
.step-badge--future {
  background: #eceff1;
  color: var(--brand-primary);
}
</style>
