<template>
  <q-page class="q-pa-md" style="background: #f8fafb; font-family: 'IBM Plex Sans', sans-serif">
    <div class="text-h4 q-mb-md" style="font-family: 'DM Sans', sans-serif; color: #0f3d3d">Settings</div>
    <q-tabs v-model="tab" dense align="left" class="q-mb-md" active-color="primary">
      <q-tab name="integrations" label="Integrations" />
      <q-tab name="templates" label="Templates" />
      <q-tab name="usage" label="Usage &amp; credits" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="integrations" class="q-pa-none">
        <q-card flat bordered style="border-radius: 8px">
          <q-list separator>
            <q-item v-for="emr in emrs" :key="emr.id">
              <q-item-section avatar><q-icon :name="emr.icon" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ emr.name }}</q-item-label>
                <q-item-label caption>{{ emr.blurb }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="!emr.connected"
                  unelevated
                  no-caps
                  color="primary"
                  label="Connect"
                  @click="connect(emr)"
                />
                <StatusBadge v-else label="Connected ✓" variant="approved" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="templates" class="q-pa-none">
        <q-card flat bordered class="q-pa-md" style="border-radius: 8px">
          <div class="text-body2 text-grey-8 q-mb-md">
            Default templates: SOAP, H&amp;P, Progress, Discharge. Drag to reorder sections, rename fields, toggle mandatory (prototype).
          </div>
          <q-list bordered separator class="rounded-borders q-mb-md">
            <q-item v-for="t in templateList" :key="t.id" dense>
              <q-item-section avatar><q-icon name="sym_o_drag_indicator" color="grey-6" /></q-item-section>
              <q-item-section>{{ t.name }}</q-item-section>
              <q-item-section side><q-toggle v-model="t.mandatory" dense label="Required" /></q-item-section>
            </q-item>
          </q-list>
          <q-btn outline color="primary" no-caps label="Create custom template" />
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="usage" class="q-pa-none">
        <q-card flat bordered class="q-pa-md" style="border-radius: 8px">
          <div class="text-h6 q-mb-sm">2h 34m remaining</div>
          <q-linear-progress :value="0.12" color="primary" class="q-mb-md" style="height: 4px; border-radius: 4px" />
          <div class="text-caption text-grey-7 q-mb-md">18.5 hours used · 2.5 hours remaining · Upgrade for more (simulated).</div>
          <div class="row q-col-gutter-sm q-mb-md">
            <q-input v-model="usageFrom" outlined dense label="From" type="date" class="col-12 col-sm-6" />
            <q-input v-model="usageTo" outlined dense label="To" type="date" class="col-12 col-sm-6" />
          </div>
          <q-markup-table flat bordered dense wrap-cells class="q-mb-md">
            <thead>
              <tr>
                <th class="text-left">Session</th>
                <th class="text-left">Date</th>
                <th class="text-left">Duration</th>
                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usageRows" :key="u.id">
                <td>{{ u.title }}</td>
                <td>{{ u.date }}</td>
                <td>{{ u.duration }}</td>
                <td>{{ u.status }}</td>
              </tr>
            </tbody>
          </q-markup-table>
          <q-btn unelevated color="primary" no-caps label="Upgrade for more time" />
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="oauthOpen">
      <q-card style="min-width: 340px; border-radius: 12px">
        <q-card-section class="text-h6">Connect {{ pendingEmr?.name }}</q-card-section>
        <q-card-section v-if="oauthStep === 0">
          <q-linear-progress indeterminate color="primary" class="q-mb-md" />
          <div class="text-body2">OAuth (simulated)…</div>
        </q-card-section>
        <q-card-section v-else>
          <q-banner class="bg-positive text-white rounded-borders">Connected. Syncing patient roster…</q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup @click="finishOauth" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import StatusBadge from '../components/medical/StatusBadge.vue'

const tab = ref('integrations')
const emrs = ref([
  { id: 'epic', name: 'Epic', blurb: 'FHIR — notes sync, billing export.', icon: 'sym_o_link', connected: false },
  { id: 'athena', name: 'Athenahealth', blurb: 'REST chart updates.', icon: 'sym_o_link', connected: false },
  { id: 'drchrono', name: 'DrChrono', blurb: 'DPC-native lightweight.', icon: 'sym_o_link', connected: true },
  { id: 'sp', name: 'SimplePractice', blurb: 'Behavioral health focus.', icon: 'sym_o_link', connected: false },
])

const oauthOpen = ref(false)
const oauthStep = ref(0)
const pendingEmr = ref(null)

function connect(emr) {
  pendingEmr.value = emr
  oauthStep.value = 0
  oauthOpen.value = true
  setTimeout(() => {
    oauthStep.value = 1
    const row = emrs.value.find(e => e.id === emr.id)
    if (row) row.connected = true
  }, 1200)
}

function finishOauth() {
  oauthOpen.value = false
}

const usageFrom = ref('2026-03-01')
const usageTo = ref('2026-04-02')
const usageRows = [
  { id: '1', title: 'Sarah Mitchell — visit', date: 'Apr 2, 2026', duration: 'Simulated', status: 'Draft' },
  { id: '2', title: 'Sarah Mitchell — follow-up', date: 'Mar 12, 2026', duration: '18m', status: 'Approved' },
  { id: '3', title: 'John Doe — prototype', date: 'Mar 1, 2026', duration: '12m', status: 'Sent' },
]

const templateList = ref([
  { id: 'soap', name: 'SOAP (default)', mandatory: true },
  { id: 'hp', name: 'H&P Note', mandatory: false },
  { id: 'prog', name: 'Progress Note', mandatory: false },
  { id: 'dc', name: 'Discharge Summary', mandatory: false },
])
</script>
