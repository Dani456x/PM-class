<template>
  <q-layout view="hHh Lpr lFf" class="wt-layout">
    <q-header elevated class="wt-header text-dark">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="sym_o_menu" aria-label="Menu" @click="drawer = !drawer" class="lt-md" />
        <div class="row items-center no-wrap q-mr-md">
          <q-icon name="sym_o_lock" color="positive" size="22px" class="q-mr-xs" />
          <span class="text-caption text-weight-bold text-positive">HIPAA Compliant</span>
        </div>
        <q-space />
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
            @click="goPatientSearch"
          />
        </div>

        <div class="q-px-sm col" style="overflow-y: auto; overflow-x: hidden">
          <template v-for="node in sidebarNodes" :key="node.key">
            <q-expansion-item
              v-if="node.kind === 'patient'"
              dark
              dense
              expand-separator
              icon="sym_o_person"
              :label="node.name"
              header-class="text-white rounded-borders q-mb-xs"
              style="border-radius: 8px"
              default-opened
            >
              <q-list dense dark class="q-pl-sm">
                <q-item
                  v-for="s in node.sessions"
                  :key="s.id"
                  clickable
                  v-ripple
                  class="rounded-borders q-mb-xs"
                  style="min-height: 44px"
                  :class="{ 'bg-white-alpha': $route.path === s.route }"
                  @click="$router.push(s.route)"
                >
                  <q-item-section>
                    <q-item-label class="text-white text-body2">{{ s.title }}</q-item-label>
                    <q-item-label caption class="text-white" style="opacity: 0.75">{{ s.duration }} · {{ s.subtitle }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <StatusBadge :label="badgeLabel(s.status)" :variant="badgeVariant(s.status)" />
                  </q-item-section>
                  <q-menu touch-position context-menu>
                    <q-list dense style="min-width: 180px">
                      <q-item clickable v-close-popup @click="$router.push(s.route)"><q-item-section>Open</q-item-section></q-item>
                      <q-item clickable v-close-popup @click="toast('Duplicated (sim)')"><q-item-section>Duplicate</q-item-section></q-item>
                      <q-item clickable v-close-popup @click="openExportDialog(s)"><q-item-section>Export PDF</q-item-section></q-item>
                      <q-item clickable v-close-popup @click="toast('Archived (sim)')"><q-item-section>Archive</q-item-section></q-item>
                      <q-item clickable v-close-popup @click="toast('Deleted (sim)')"><q-item-section class="text-negative">Delete</q-item-section></q-item>
                    </q-list>
                  </q-menu>
                </q-item>
              </q-list>
            </q-expansion-item>
          </template>
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
          <div v-if="docAnalyzing" class="q-mt-sm q-pa-sm bg-white rounded-borders">
            <div class="text-caption text-grey-8 q-mb-xs">Analyzing document…</div>
            <q-skeleton type="text" />
            <q-skeleton type="text" class="q-mt-xs" />
            <q-skeleton type="rect" height="40px" class="q-mt-sm" />
          </div>
          <q-card v-else-if="docSummary" flat class="q-mt-sm q-pa-sm bg-white text-dark" style="border-radius: 8px">
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
              <q-item-label class="text-white text-caption" style="opacity: 0.7">Signed in</q-item-label>
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

    <q-dialog v-model="exportDialog" class="wt-modal-shadow">
      <q-card class="wt-modal-shadow" style="min-width: 360px; border-radius: 12px">
        <q-card-section class="text-h6">Export document</q-card-section>
        <q-card-section class="q-pt-none text-body2 text-grey-8">
          Color-coded sensitivity labels (required for outbound documents):
        </q-card-section>
        <q-card-section class="q-pt-none column q-gutter-sm">
          <q-chip square color="grey-3" text-color="dark" icon="sym_o_public">Public / educational</q-chip>
          <q-chip square color="blue-2" text-color="dark" icon="sym_o_badge">Internal — operational</q-chip>
          <q-chip square color="orange-3" text-color="dark" icon="sym_o_warning">Confidential — PHI</q-chip>
          <q-chip square color="red-3" text-color="dark" icon="sym_o_emergency">Restricted — highly sensitive</q-chip>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Export PDF (sim)" v-close-popup @click="toast('PDF queued with PHI label (sim)')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import StatusBadge from '../components/medical/StatusBadge.vue'

const $q = useQuasar()
const router = useRouter()
const drawer = ref(true)
const drawerMini = ref(false)

const docDrag = ref(false)
const docSummary = ref('')
const docAnalyzing = ref(false)
const exportDialog = ref(false)

const johnSessions = [
  {
    id: 'john-today',
    route: '/session',
    title: 'Visit · Apr 2, 2026',
    duration: 'Simulated',
    subtitle: 'Diabetes management',
    status: 'draft',
  },
  {
    id: 'john-overview',
    route: '/transcript/john-smith',
    title: 'Patient overview',
    duration: 'Prototype',
    subtitle: 'Interview-style workspace',
    status: 'approved',
  },
]

const sidebarNodes = computed(() => [
  {
    kind: 'patient',
    key: 'john-smith',
    name: 'Smith, John',
    sessions: johnSessions,
  },
])

function badgeLabel(s) {
  if (s === 'draft') return 'Draft'
  if (s === 'approved') return 'Approved'
  if (s === 'sent') return 'Sent'
  return 'Draft'
}

function badgeVariant(s) {
  if (s === 'approved') return 'approved'
  if (s === 'sent') return 'sent'
  return 'draft'
}

function openExportDialog() {
  exportDialog.value = true
}

function toast(msg) {
  $q.notify({ message: msg, color: 'grey-8', position: 'top' })
}

function goPatientSearch() {
  router.push({ path: '/start', query: { patientSearch: '1' } })
  window.dispatchEvent(new CustomEvent('wt-focus-patient-search'))
}

function runDocDemo() {
  docSummary.value = ''
  docAnalyzing.value = true
  setTimeout(() => {
    docAnalyzing.value = false
    docSummary.value =
      '<strong>Type:</strong> Cardiology report · <strong>Date:</strong> 2025-11-02 · <strong>From:</strong> Dr. Rao<br/><strong>Findings:</strong> EF 55%, mild LVH. <span style="background:#fff9c4">Stress test deferred.</span> · <strong>Meds:</strong> metoprolol'
    $q.notify({ message: 'Document analyzed', color: 'primary', timeout: 600 })
  }, 1400)
}

function onDocDrop() {
  docDrag.value = false
  runDocDemo()
}

function toastAdded() {
  $q.notify({ message: 'Summary appended to visit history (simulated)', color: 'positive' })
}

function onResize() {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    drawerMini.value = true
  }
}

function onPatientSearchHotkey(e) {
  const mod = e.metaKey || e.ctrlKey
  if (mod && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault()
    goPatientSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onPatientSearchHotkey, true)
  window.addEventListener('resize', onResize)
  onResize()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onPatientSearchHotkey, true)
  window.removeEventListener('resize', onResize)
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
