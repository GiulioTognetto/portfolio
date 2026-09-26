<template>
  <!-- Cerchio Tap-Target semitrasparente per cursori da dispositivi mobile -->
  <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">

    <!-- Cerchio animato (ping) -->
    <div
      class="absolute h-8 w-8 rounded-full animate-ping opacity-30"
      :style="{ backgroundColor: color }"
    />

    <!-- Cerchio statico centrale -->
    <div
      class="h-7 w-7 rounded-full border-2 shadow-lg backdrop-blur-[2px]"
      :style="{
        borderColor: color,
        backgroundColor: circleBg,
        boxShadow: `0 0 12px ${circleBg}`,
      }"
    >
      <!-- Punto centrale -->
      <div
        class="absolute inset-0 m-auto h-2 w-2 rounded-full shadow-sm"
        :style="{ backgroundColor: color }"
      />
    </div>

    <!-- Badge Avatar DiceBear -->
    <div
      class="absolute top-8 left-1/2 -translate-x-1/2 w-12 h-12 aspect-square p-0.5 rounded-full shadow-lg backdrop-blur-md border border-white/40 select-none flex items-center justify-center overflow-hidden"
      :style="{ backgroundColor: badgeBg }"
    >
      <img
        :src="avatarUrl"
        alt="Avatar"
        class="w-full h-full rounded-full bg-white/50 object-cover shadow-inner block"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { getMobileCircleBg, getBadgeBg, getDicebearUrl } from '~/composables/multiplayer/useCursorHelpers'

const props = defineProps<{
  /** ID utente (usato come seed per l'avatar) */
  userId: string
  /** Colore hex del cursore */
  color: string
}>()

const circleBg = computed(() => getMobileCircleBg(props.color))
const badgeBg = computed(() => getBadgeBg(props.color))
const avatarUrl = computed(() => getDicebearUrl(props.userId))
</script>
