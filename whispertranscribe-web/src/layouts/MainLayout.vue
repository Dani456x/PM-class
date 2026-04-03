<template>
  <q-layout view="hHh Lpr lFf" class="wt-layout">
    <q-header elevated class="wt-header text-dark">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="sym_o_menu" aria-label="Menu" @click="drawer = !drawer" class="lt-md" />
        <div class="row items-center no-wrap q-mr-md">
          <q-icon name="sym_o_lock" color="positive" size="22px" class="q-mr-xs" />
          <span class="text-caption text-weight-bold text-positive">HIPAA Compliant</span>
        </div>
        <q-separator vertical inset class="q-mx-sm gt-sm" />
        <div class="gt-sm text-caption text-grey-8 q-mr-lg">
          Session lock in <span class="text-weight-bold text-primary">{{ idleCountdown }}</span>
        </div>
        <q-space />
        <div class="column items-end q-mr-md">
          <div class="text-caption text-weight-medium">{{ creditsLabel }}</div>
          <q-linear-progress :value="creditsProgress" color="primary" style="width: 140px; height: 3px; border-radius: 4px" />
        </div>
        <q-chip dense outline :color="netStrong ? 'positive' : 'warning'" class="gt-xs">
          <q-icon :name="netStrong ? 'sym_o_wifi' : 'sym_o_wifi_off'" class="q-mr-xs" size="16px" />
          {{ netStrong ? 'Strong' : 'Weak' }}
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="240"
      :breakpoint="768"
      bordered
      class="wt-drawer"
      :mini="drawerMini"
      :mini-width="72"
    >
      <div class="column full-height" style="overflow: hidden">
        <div class="q-pa-sm q-pt-md row items-center no-wrap">
          <q-btn flat dense round icon="sym_o_menu" color="white" @click="drawerMini = !drawerMini" />
          <div v-if="!drawerMini" class="q-ml-sm text-white text-weight-bold" style="font-family: 'DM Sans', sans-serif; font-size: 14px">
            WhisperTranscribe Medical
          </div>
          <q-space />
          <q-btn flat dense round icon="sym_o_home" color="white" title="Dashboard" @click="$router.push('/start')" />
        </div>

        <div class="q-px-sm q-mb-sm">
          <q-btn
            unelevated
            no-caps
            color="white"
            text-color="primary"
            icon="sym_o_person_search"
            :label="drawerMini ? undefined : 'Patients'"
            class="full-width"
            style="border-radius: 8px; min-height: 44px"
            @click="$router.push('/start')"
          />
        </div>
        <div class="q-px-sm q-mb-md">
          <q-btn
            unelevated
            no-caps
            color="white"
            text-color="primary"
            icon="sym_o_mic"
            :label="drawerMini ? undefined : 'Visit workspace'"
            class="full-width"
            style="border-radius: 8px; min-height: 44px"
            @click="$router.push('/session')"
          />
        </div>

        <div class="q-px-md q-mb-sm" v-if="!drawerMini">
          <q-input
            dense
            outlined
            placeholder="Search sessions…"
            class="search-input"
            dark
            v-model="searchQuery"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_search" color="white" />
            </template>
          </q-input>
        </div>

        <div class="q-px-md q-mb-sm" v-if="!drawerMini">
          <div class="text-white text-caption q-mb-xs" style="opacity: 0.9">Folders</div>
          <q-btn-toggle
            v-model="activeFolder"
            no-caps
            dense
            unelevated
            toggle-color="white"
            toggle-text-color="primary"
            color="white"
            text-color="primary"
            rounded
            class="full-width"
            :options="folderOptions"
          />
        </div>

        <div class="q-px-sm col" style="overflow-y: auto; overflow-x: hidden">
          <q-item
            v-for="p in filteredProjects"
            :key="p.id"
            clickable
            dark
            class="rounded-borders q-mb-xs"
            style="min-height: 44px"
            :class="{ 'bg-white-alpha': $route.path === p.route }"
            @click="$router.push(p.route)"
          >
            <q-item-section>
              <q-item-label class="text-white text-caption">
                <div class="row justify-between">
                  <span>{{ p.groupLabel }}</span>
                  <span>{{ p.dateLabel }}</span>
                </div>
              </q-item-label>
              <q-item-label class="text-white text-body2">{{ p.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>

        <div v-if="!drawerMini" class="q-px-md q-pb-sm">
          <div class="text-white text-caption q-mb-xs" style="opacity: 0.9">Documents</div>
          <div
            class="wt-doc-drop rounded-borders q-pa-md text-center text-caption"
            :class="{ 'wt-doc-drop--active': docDrag }"
            @dragenter.prevent="docDrag = true"
            @dragover.prevent="docDrag = true"
            @dragleave.prevent="docDrag = false"
            @drop.prevent="onDocDrop"
          >
            Drop PDF or fax image (demo: loads sample summary)
          </div>
          <q-btn flat dense no-caps color="white" class="full-width q-mt-xs" label="Analyze sample report" @click="runDocDemo" />
          <q-card v-if="docSummary" flat class="q-mt-sm q-pa-sm bg-white text-dark" style="border-radius: 8px">
            <div class="text-caption text-weight-medium q-mb-xs">Extracted (simulated)</div>
            <div class="text-caption" v-html="docSummary" />
            <q-btn dense unelevated color="primary" no-caps class="q-mt-sm full-width" label="Add to patient record" @click="toastAdded" />
          </q-card>
        </div>

        <q-space />

        <div class="q-pa-sm" style="border-top: 1px solid rgba(255,255,255,0.15)">
          <q-item dense dark clickable class="rounded-borders" @click="$router.push('/settings')">
            <q-item-section avatar>
              <q-icon name="sym_o_settings" color="white" />
            </q-item-section>
            <q-item-section v-if="!drawerMini">
              <q-item-label class="text-white text-caption">Settings</q-item-label>
              <q-item-label class="text-white text-caption" style="opacity: 0.7">Integrations &amp; templates</q-item-label>
            </q-item-section>
          </q-item>
          <q-item dense dark clickable class="rounded-borders">
            <q-item-section avatar>
              <q-icon name="sym_o_account_circle" color="white" />
            </q-item-section>
            <q-item-section v-if="!drawerMini">
              <q-item-label class="text-white text-caption ellipsis">dani456x@gmail.com</q-item-label>
              <q-item-label class="text-white text-caption" style="opacity: 0.7">{{ creditsLabel }}</q-item-label>
            </q-item-section>
          </q-item>
          <div class="text-center q-mt-xs" v-if="!drawerMini">
            <span class="text-white" style="font-size: 10px; opacity: 0.5">Terms · Privacy · v2.0 Medical prototype</span>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container class="wt-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const drawer = ref(true)
const drawerMini = ref(false)
const searchQuery = ref('')
const activeFolder = ref('patients')
const folderOptions = [
  { label: 'Patients', value: 'patients' },
  { label: 'Projects', value: 'projects' },
]

const idleSeconds = ref(14 * 60 + 59)
let idleTimer = null
const creditsLabel = ref('2h 34m remaining')
const creditsProgress = ref(0.87)
const netStrong = ref(true)
const docDrag = ref(false)
const docSummary = ref('')

const projects = [
  {
    id: 'sarah-session',
    route: '/session',
    groupLabel: 'Visit',
    dateLabel: 'Today',
    title: 'Sarah Mitchell — demo session',
    folder: 'patients',
  },
  {
    id: 'john-doe',
    route: '/transcript/john-doe',
    groupLabel: 'Patient',
    dateLabel: 'Archive',
    title: 'John Doe (prototype)',
    folder: 'patients',
  },
  {
    id: 'nicky',
    route: '/transcript/example',
    groupLabel: 'Project',
    dateLabel: '26 Mar 2026',
    title: 'User Interview 1: Nicky',
    folder: 'projects',
  },
]

const filteredProjects = computed(() => {
  const q = (searchQuery.value || '').trim().toLowerCase()
  const inFolder = projects.filter(p => p.folder === activeFolder.value)
  if (!q) return inFolder
  return inFolder.filter(p => (p.title || '').toLowerCase().includes(q) || (p.groupLabel || '').toLowerCase().includes(q))
})

const idleCountdown = computed(() => {
  const m = Math.floor(idleSeconds.value / 60)
  const s = idleSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

function resetIdle() {
  idleSeconds.value = 15 * 60 - 1
}

function onActivity() {
  resetIdle()
  netStrong.value = Math.random() > 0.15
}

function runDocDemo() {
  docSummary.value =
    '<strong>Prior cardiology report</strong> — Dr. Rao, 2025-11-02. Key: EF 55%, mild LVH. <span style="background:#fff9c4">Mention of stress test deferred.</span>'
  $q.notify({ message: 'Analyzing document…', color: 'primary', timeout: 800 })
}

function onDocDrop() {
  docDrag.value = false
  runDocDemo()
}

function toastAdded() {
  $q.notify({ message: 'Summary appended to visit history (simulated)', color: 'positive' })
}

onMounted(() => {
  resetIdle()
  idleTimer = setInterval(() => {
    if (idleSeconds.value > 0) idleSeconds.value -= 1
  }, 1000)
  window.addEventListener('pointerdown', onActivity)
  window.addEventListener('keydown', onActivity)
})

onUnmounted(() => {
  if (idleTimer) clearInterval(idleTimer)
  window.removeEventListener('pointerdown', onActivity)
  window.removeEventListener('keydown', onActivity)
})
</script>

<style>
.wt-layout .wt-header {
  background: #ffffff !important;
  border-bottom: 1px solid #e0e0e0;
}
.wt-drawer {
  background: #0f3d3d !important;
}
.wt-page-container {
  background: #f8fafb;
}
.search-input .q-field__control {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}
.search-input .q-field__control input::placeholder {
  color: rgba(255, 255, 255, 0.7) !important;
}
.search-input .q-field__control input {
  color: white !important;
}
.bg-white-alpha {
  background: rgba(255, 255, 255, 0.15) !important;
}
.wt-doc-drop {
  border: 1px dashed rgba(255, 255, 255, 0.5);
  color: rgba(255, 255, 255, 0.85);
}
.wt-doc-drop--active {
  background: rgba(255, 255, 255, 0.12);
}
</style>
