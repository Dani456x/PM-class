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
          <div class="text-body2 text-grey-8 q-mb-md">SOAP, H&amp;P, Progress, Discharge — drag-and-drop editor (prototype).</div>
          <q-btn outline color="primary" no-caps label="Create custom template" />
        </q-card>
      </q-tab-panel>
      <q-tab-panel name="usage" class="q-pa-none">
        <q-card flat bordered class="q-pa-md" style="border-radius: 8px">
          <div class="text-h6 q-mb-sm">2h 34m remaining</div>
          <q-linear-progress :value="0.12" color="primary" class="q-mb-md" style="height: 4px; border-radius: 4px" />
          <div class="text-caption text-grey-7">18.5 hours used · 2.5 hours remaining · Upgrade for more (simulated).</div>
          <q-btn unelevated color="primary" no-caps class="q-mt-md" label="View session breakdown" />
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
</script>
