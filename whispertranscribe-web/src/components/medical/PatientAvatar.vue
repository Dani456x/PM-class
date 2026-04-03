<template>
  <div class="wt-avatar" :class="[`wt-avatar--${size}`, hashClass]">{{ initials }}</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md', validator: v => ['sm', 'md', 'lg'].includes(v) },
})

const initials = computed(() => {
  const parts = (props.name || '').trim().split(/\s+/)
  if (!parts.length) return '?'
  const a = parts[0][0] || ''
  const b = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (a + b).toUpperCase()
})

const hashClass = computed(() => {
  let h = 0
  for (let i = 0; i < props.name.length; i++) h = props.name.charCodeAt(i) + ((h << 5) - h)
  const idx = Math.abs(h) % 5
  return `wt-avatar--tone-${idx}`
})
</script>

<style scoped>
.wt-avatar {
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
  border: 1px solid rgba(15, 61, 61, 0.12);
}
.wt-avatar--sm {
  width: 32px;
  height: 32px;
  font-size: 11px;
}
.wt-avatar--md {
  width: 40px;
  height: 40px;
  font-size: 13px;
}
.wt-avatar--lg {
  width: 56px;
  height: 56px;
  font-size: 16px;
}
.wt-avatar--tone-0 {
  background: #0f3d3d;
}
.wt-avatar--tone-1 {
  background: #1565c0;
}
.wt-avatar--tone-2 {
  background: #37474f;
}
.wt-avatar--tone-3 {
  background: #00695c;
}
.wt-avatar--tone-4 {
  background: #283593;
}
</style>
