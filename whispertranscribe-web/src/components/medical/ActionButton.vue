<template>
  <q-btn
    :class="['wt-action-btn', `wt-action-btn--${variant}`]"
    :unelevated="variant === 'primary' || variant === 'danger'"
    :outline="variant === 'secondary'"
    :flat="variant === 'ghost'"
    :loading="loading"
    :disable="disable || loading"
    no-caps
    @click="$emit('click', $event)"
  >
    <slot />
  </q-btn>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: v => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  loading: Boolean,
  disable: Boolean,
})
defineEmits(['click'])
</script>

<style scoped>
.wt-action-btn {
  border-radius: 8px;
  min-height: 44px;
  padding: 0 16px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
}
.wt-action-btn--primary {
  background: #0f3d3d !important;
  color: #fff !important;
  border: 2px solid #0f3d3d;
}
.wt-action-btn--primary:hover {
  filter: brightness(1.05);
}
.wt-action-btn--secondary {
  color: #0f3d3d !important;
  border: 1px solid #b0bec5 !important;
  background: #fff !important;
}
.wt-action-btn--ghost {
  color: #1565c0 !important;
  border: 1px solid transparent;
}
.wt-action-btn--danger {
  background: #b71c1c !important;
  color: #fff !important;
  border: 2px solid #b71c1c;
}
</style>
