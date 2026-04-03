<template>
  <div class="wt-billing-chip" :class="{ 'wt-billing-chip--approved': status === 'approved', 'wt-billing-chip--rejected': status === 'rejected' }">
    <div class="row items-start no-wrap q-gutter-sm">
      <div class="col">
        <div class="row items-center q-gutter-xs">
          <code class="wt-code">{{ displayCode }}</code>
          <span class="text-caption text-grey-8">{{ type }}</span>
        </div>
        <div class="text-body2 text-grey-9 q-mt-xs">{{ description }}</div>
        <q-linear-progress :value="confidence / 100" color="primary" class="q-mt-sm rounded-borders" style="height: 4px; border-radius: 4px" />
        <div class="text-caption text-grey-7 q-mt-xs">{{ confidence }}% confidence</div>
        <div v-if="status === 'modified'" class="q-mt-sm">
          <q-input
            v-model="modQuery"
            dense
            outlined
            placeholder="Search CPT / ICD-10…"
            class="q-mb-xs"
            @keyup.enter="confirmModify"
          />
          <div class="row q-gutter-xs">
            <q-btn dense unelevated color="primary" no-caps label="Apply code" @click="confirmModify" />
            <q-btn dense flat no-caps label="Cancel" @click="$emit('cancelModify')" />
          </div>
        </div>
      </div>
      <div v-if="status === 'pending'" class="column q-gutter-xs">
        <q-btn dense unelevated color="positive" label="Approve" no-caps class="full-width" style="min-height: 44px; border-radius: 4px" @click="$emit('approve')" />
        <q-btn dense outline color="primary" label="Modify" no-caps class="full-width" style="min-height: 44px; border-radius: 4px" @click="onModify" />
        <q-btn dense flat color="negative" label="Reject" no-caps class="full-width" style="min-height: 44px; border-radius: 4px" @click="$emit('reject')" />
      </div>
      <div v-else-if="status === 'approved'" class="column items-center justify-center">
        <q-icon name="sym_o_check_circle" color="positive" size="28px" />
        <span class="text-caption text-positive">Approved</span>
      </div>
      <div v-else-if="status === 'rejected'" class="column items-center">
        <q-icon name="sym_o_cancel" color="grey-6" size="28px" />
        <span class="text-caption text-grey-6 text-strike">Rejected</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  code: String,
  type: String,
  description: String,
  confidence: Number,
  status: { type: String, default: 'pending', validator: v => ['pending', 'approved', 'rejected', 'modified'].includes(v) },
})
const emit = defineEmits(['approve', 'modify', 'reject', 'confirmModify', 'cancelModify'])

const modQuery = ref('')
const displayCode = computed(() => (props.status === 'modified' && modQuery.value ? modQuery.value : props.code))

watch(
  () => props.status,
  s => {
    if (s === 'modified') modQuery.value = props.code || ''
  },
)

function onModify() {
  modQuery.value = props.code || ''
  emit('modify')
}

function confirmModify() {
  emit('confirmModify', modQuery.value?.trim() || props.code)
}
</script>

<style scoped>
.wt-billing-chip {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}
.wt-billing-chip--approved {
  border-color: #a5d6a7;
  background: #f1f8e9;
}
.wt-billing-chip--rejected {
  opacity: 0.75;
}
.wt-code {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  background: #eceff1;
  padding: 2px 8px;
  border-radius: 4px;
  color: #37474f;
}
</style>
