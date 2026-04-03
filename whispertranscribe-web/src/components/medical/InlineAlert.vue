<template>
  <q-banner
    v-if="visible"
    dense
    class="wt-inline-alert"
    :class="`wt-inline-alert--${variant}`"
    rounded
  >
    <template v-slot:avatar>
      <q-icon :name="iconName" size="22px" />
    </template>
    <div class="text-body2"><slot /></div>
    <template v-if="dismissible" v-slot:action>
      <q-btn flat dense round icon="sym_o_close" @click="visible = false" />
    </template>
  </q-banner>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: v => ['info', 'warning', 'error'].includes(v),
  },
  dismissible: { type: Boolean, default: false },
  persistent: { type: Boolean, default: true },
})

const visible = ref(true)

const iconName = computed(() => {
  if (props.variant === 'warning') return 'sym_o_warning'
  if (props.variant === 'error') return 'sym_o_error'
  return 'sym_o_info'
})
</script>

<style scoped>
.wt-inline-alert {
  border: 1px solid;
  border-radius: 8px;
  font-family: 'IBM Plex Sans', sans-serif;
}
.wt-inline-alert--info {
  background: #e3f2fd;
  border-color: #90caf9;
  color: #0d47a1;
}
.wt-inline-alert--warning {
  background: #fff3e0;
  border-color: #ffb74d;
  color: #e65100;
}
.wt-inline-alert--error {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #b71c1c;
}
</style>
