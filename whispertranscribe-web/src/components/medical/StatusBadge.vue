<template>
  <span class="wt-status-badge" :class="`wt-status-badge--${variant}`">{{ label }}</span>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  variant: {
    type: String,
    default: 'draft',
    validator: v => ['draft', 'approved', 'sent', 'flagged'].includes(v),
  },
})
</script>

<style scoped>
.wt-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  border: 1px solid transparent;
}
.wt-status-badge--draft {
  background: #eceff1;
  color: #37474f;
  border-color: #cfd8dc;
}
.wt-status-badge--approved {
  background: #e8f5e9;
  color: #1b5e20;
  border-color: #a5d6a7;
}
.wt-status-badge--sent {
  background: #e3f2fd;
  color: #1565c0;
  border-color: #90caf9;
}
.wt-status-badge--flagged {
  background: #fff3e0;
  color: #e65100;
  border-color: #ffcc80;
}
</style>
