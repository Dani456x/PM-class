<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer
      v-model="drawer"
      :width="300"
      :mini-width="76"
      :mini="drawerMini"
      :breakpoint="0"
      bordered
      class="bg-primary"
      :no-swipe-open="true"
      :no-swipe-close="true"
    >
      <div class="column full-height" style="overflow: hidden">
        <div class="q-pa-sm q-pt-md row items-center no-wrap">
          <q-btn flat dense round icon="sym_o_menu" color="white" class="q-ml-xs" @click="drawerMini = !drawerMini" />
          <div v-if="!drawerMini" class="q-ml-sm">
            <img src="/logos/logo-sidebar.svg" alt="WhisperTranscribe" style="width: 140px" />
          </div>
          <q-space />
          <q-btn flat dense round icon="sym_o_home" color="white" title="Dashboard" @click="$router.push('/start')" />
        </div>

        <div class="q-px-md q-mt-sm q-mb-sm" v-if="!drawerMini">
          <q-btn
            unelevated
            color="white"
            text-color="primary"
            icon="sym_o_space_dashboard"
            label="Dashboard"
            class="full-width"
            style="border-radius: 8px"
            @click="$router.push('/start')"
          />
        </div>

        <div class="q-px-md q-mb-md">
          <q-btn
            unelevated
            color="white"
            text-color="primary"
            icon="sym_o_adaptive_audio_mic"
            label="New transcription"
            class="full-width"
            style="border-radius: 8px"
            @click="$router.push('/start')"
          />
        </div>
        <div class="q-px-md q-mb-sm" v-if="!drawerMini">
          <q-input
            dense
            outlined
            placeholder="Search projects and files"
            class="search-input"
            dark
            v-model="searchQuery"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_search" color="white" />
            </template>
          </q-input>
        </div>

        <!-- Folders -->
        <div class="q-px-md q-mb-sm" v-if="!drawerMini">
          <div class="text-white text-body2 q-mb-xs" style="opacity: 0.9">Folders</div>
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

        <q-space />

        <div class="q-pa-md">
          <div class="row items-center q-mb-sm">
            <q-icon name="sym_o_folder" color="white" size="20px" class="q-mr-sm" />
            <span class="text-white text-body2">{{ activeFolder === 'patients' ? 'Patients' : 'Projects' }}</span>
          </div>
        </div>

        <div class="q-pa-sm" style="border-top: 1px solid rgba(255,255,255,0.15)">
          <q-item dense dark clickable class="rounded-borders">
            <q-item-section avatar>
              <q-icon name="sym_o_account_circle" color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-white text-caption ellipsis">dani456x@gmail.com</q-item-label>
              <q-item-label class="text-white text-caption" style="opacity: 0.7">60 minutes left</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="sym_o_expand_less" color="white" size="16px" />
            </q-item-section>
          </q-item>
          <div class="text-center q-mt-xs">
            <span class="text-white" style="font-size: 10px; opacity: 0.5">
              Affiliate &nbsp; Terms &nbsp; Privacy &nbsp; Roadmap &nbsp; v2.0.0
            </span>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-banner dense class="text-center" style="min-height: 32px; font-size: 13px; background: #f1ecfc; color: #424242">
        Enjoy 10% off on any subscription (also annual) with code <b>GXODAZNA</b> ⏱ <i>Ends in 16h 58m.</i>
        <a href="#" class="text-primary" style="margin-left: 4px">Check out plans</a>
      </q-banner>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
const drawer = ref(true)
const drawerMini = ref(false)

const searchQuery = ref('')
const activeFolder = ref('patients')
const folderOptions = [
  { label: 'Patients', value: 'patients' },
  { label: 'Projects', value: 'projects' },
]

const projects = [
  // Patients folder
  {
    id: 'john-doe',
    route: '/transcript/john-doe',
    groupLabel: 'Patient',
    dateLabel: 'Yesterday',
    title: 'John Doe (prototype)',
    folder: 'patients',
  },
  // Projects folder
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
</script>

<style>
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
</style>
