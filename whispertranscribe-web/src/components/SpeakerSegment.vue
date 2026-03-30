<template>
  <div class="paragraph row no-wrap">
    <div class="paragraph-meta q-pr-md">
      <q-checkbox
        v-if="editMode"
        :model-value="segmentSelected"
        @update:model-value="val => emit('toggleSelect', val)"
        color="primary"
        dense
        size="sm"
        class="q-mb-xs"
      />
      <div
        class="row items-center q-px-sm q-py-xs rounded-borders speaker-tag"
        :style="speakerStyle"
      >
        <span class="text-weight-medium" style="font-size: 13px">{{ speakerLabel }}</span>
        <q-icon name="sym_o_expand_more" size="16px" class="q-ml-xs" />
      </div>
      <div class="row items-center q-mt-xs q-gutter-x-xs" style="padding-left: 4px">
        <q-btn
          flat
          dense
          round
          size="xs"
          icon="sym_o_play_arrow"
          :color="isPurple ? 'primary' : 'amber-9'"
        />
        <q-btn
          v-if="editMode"
          flat
          dense
          round
          size="xs"
          icon="sym_o_arrow_upward"
          color="grey-7"
          :disable="!canMoveUp"
          @click="emit('moveUp')"
        />
        <q-btn
          v-if="editMode"
          flat
          dense
          round
          size="xs"
          icon="sym_o_arrow_downward"
          color="grey-7"
          :disable="!canMoveDown"
          @click="emit('moveDown')"
        />
        <span class="text-grey-6" style="font-size: 12px">
          {{ formatTime(startTime) }} - {{ formatTime(endTime) }}
        </span>
      </div>
    </div>
    <div class="paragraph-text text-body2" style="color: #424242; line-height: 1.7" v-if="!editMode">
      {{ text }}
    </div>
    <div v-else style="width: 100%">
      <q-input
        filled
        type="textarea"
        :model-value="text"
        @update:model-value="val => emit('updateText', val)"
        autogrow
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatTime } from '../data/transcript'

const props = defineProps({
  speaker: { type: Number, required: true },
  speakerLabel: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  text: { type: String, required: true },
  editMode: { type: Boolean, default: false },
  canMoveUp: { type: Boolean, default: false },
  canMoveDown: { type: Boolean, default: false },
  segmentSelected: { type: Boolean, default: false },
})

const emit = defineEmits(['updateText', 'moveUp', 'moveDown', 'toggleSelect'])

const isPurple = computed(() => props.speaker === 0)

const speakerStyle = computed(() => {
  if (isPurple.value) {
    return {
      borderLeft: '3px solid var(--brand-primary)',
      background: 'var(--brand-primary-bg)',
      color: 'var(--brand-primary)',
    }
  }
  return {
    borderLeft: '3px solid var(--brand-accent)',
    background: 'var(--brand-accent-bg)',
    color: 'var(--brand-accent)',
  }
})
</script>
