<template>
  <q-page class="wt-dashboard q-pa-md q-pa-lg-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="wt-h2 wt-display">Patient search</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          Select or create a patient before starting a clinical capture session. Recording stays locked until a patient is active in the visit workspace.
        </div>
      </div>
      <div class="row q-gutter-sm items-center">
        <q-btn round unelevated color="primary" icon="sym_o_add" size="lg" style="min-width: 44px; min-height: 44px" aria-label="New patient" @click="openCreate = true" />
        <ActionButton variant="secondary" @click="openCreate = true">
          <span class="row items-center no-wrap"><q-icon name="sym_o_person_add" class="q-mr-sm" size="20px" /> New patient</span>
        </ActionButton>
      </div>
    </div>

    <q-input
      ref="searchInputRef"
      v-model="search"
      outlined
      dense
      placeholder="Search by name, DOB, or ID…"
      class="wt-search q-mb-lg"
      @keydown.escape="search = ''"
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_search" color="primary" />
      </template>
    </q-input>

    <div class="text-caption text-grey-7 q-mb-sm">Recent patients</div>
    <div class="row q-col-gutter-md q-mb-xl">
      <div v-for="p in recentPatients" :key="p.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card flat bordered class="wt-recent-card cursor-pointer" @click="selectPatient(p)">
          <q-card-section class="row items-center no-wrap">
            <PatientAvatar :name="p.name" size="lg" />
            <div class="q-ml-md">
              <div class="text-body1 text-weight-medium">{{ p.name }}</div>
              <div class="text-caption text-grey-7">Last seen {{ p.lastSeen }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="text-caption text-grey-7 q-mb-sm">All patients</div>
    <q-card flat bordered class="wt-roster">
      <q-list separator>
        <q-item v-for="p in filteredRoster" :key="p.id" clickable v-ripple @click="selectPatient(p)">
          <q-item-section avatar>
            <PatientAvatar :name="p.name" size="md" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-body1">{{ p.name }}</q-item-label>
            <q-item-label caption>DOB {{ p.dob }} · Last visit {{ p.lastSeen }} · {{ p.insurance }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>
        <q-item v-if="!filteredRoster.length">
          <q-item-section class="text-grey-6">No matches.</q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-dialog v-model="openCreate">
      <q-card style="min-width: 360px; border-radius: 12px">
        <q-card-section class="text-h6">Quick intake</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newPatient.name" outlined dense label="Full name" class="q-mb-sm" />
          <q-input v-model="newPatient.dob" outlined dense label="DOB (YYYY-MM-DD)" class="q-mb-sm" />
          <q-input v-model="newPatient.mrn" outlined dense label="MRN" class="q-mb-sm" />
          <q-input v-model="newPatient.insurance" outlined dense label="Insurance" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Create &amp; open visit" @click="createAndGo" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PatientAvatar from '../components/medical/PatientAvatar.vue'
import ActionButton from '../components/medical/ActionButton.vue'
import { RECENT_PATIENTS } from '../data/medical-demo.js'

const router = useRouter()
const route = useRoute()
const STORAGE_PATIENT = 'wt_selected_patient'

const search = ref('')
const searchInputRef = ref(null)
const openCreate = ref(false)
const newPatient = ref({ name: '', dob: '', mrn: '', insurance: '' })

const roster = ref([...RECENT_PATIENTS])

const recentPatients = computed(() => roster.value.slice(0, 4))

const filteredRoster = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return roster.value
  return roster.value.filter(
    p =>
      p.name.toLowerCase().includes(q) ||
      p.dob.includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.insurance.toLowerCase().includes(q),
  )
})

function selectPatient(p) {
  sessionStorage.setItem(STORAGE_PATIENT, JSON.stringify(p))
  router.push('/session')
}

function createAndGo() {
  const n = newPatient.value
  if (!n.name?.trim()) return
  const id = `new-${Date.now()}`
  const row = {
    id,
    name: n.name.trim(),
    dob: n.dob || '—',
    mrn: n.mrn || 'Pending',
    insurance: n.insurance || '—',
    lastSeen: 'Today',
  }
  roster.value = [row, ...roster.value]
  openCreate.value = false
  selectPatient(row)
}

function focusPatientSearch() {
  nextTick(() => {
    searchInputRef.value?.focus?.()
    const el = searchInputRef.value?.$el?.querySelector?.('input')
    el?.focus?.()
  })
}

function onGlobalKey(e) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    focusPatientSearch()
  }
}

watch(
  () => route.query.patientSearch,
  v => {
    if (v) focusPatientSearch()
  },
)

onMounted(() => {
  window.addEventListener('keydown', onGlobalKey, true)
  window.addEventListener('wt-focus-patient-search', focusPatientSearch)
  if (route.query.patientSearch) focusPatientSearch()
  else focusPatientSearch()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKey, true)
  window.removeEventListener('wt-focus-patient-search', focusPatientSearch)
})
</script>

<style scoped>
.wt-dashboard {
  max-width: 960px;
  margin: 0 auto;
  background: #f8fafb;
  font-family: 'IBM Plex Sans', sans-serif;
}
.wt-display {
  font-family: 'DM Sans', sans-serif;
  color: #0f3d3d;
}
.wt-search :deep(.q-field__control) {
  border-radius: 8px;
  min-height: 48px;
}
.wt-recent-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  transition: border-color 0.2s;
}
.wt-recent-card:hover {
  border-color: #1565c0;
}
.wt-roster {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
