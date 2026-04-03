<template>
  <q-card flat bordered class="wt-section-card">
    <q-card-section class="row items-center no-wrap q-py-sm q-px-md" style="border-bottom: 1px solid #eceff1">
      <q-btn
        v-if="collapsible"
        flat
        dense
        round
        size="sm"
        :icon="expanded ? 'sym_o_expand_less' : 'sym_o_expand_more'"
        color="grey-8"
        @click="expanded = !expanded"
      />
      <div class="text-h6 wt-heading q-ml-xs">{{ title }}</div>
      <q-space />
      <slot name="badge" />
      <div class="row items-center q-gutter-xs q-ml-sm">
        <slot name="actions" />
      </div>
    </q-card-section>
    <q-slide-transition>
      <q-card-section v-show="expanded" class="q-pa-md">
        <slot />
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<script setup>
import { ref, toRef, watch } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  collapsible: { type: Boolean, default: true },
  defaultExpanded: { type: Boolean, default: true },
})

const expanded = ref(props.defaultExpanded)
watch(toRef(props, 'defaultExpanded'), v => {
  expanded.value = v
})
</script>

<style scoped>
.wt-section-card {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
}
.wt-heading {
  font-family: 'DM Sans', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #0f3d3d;
}
</style>
