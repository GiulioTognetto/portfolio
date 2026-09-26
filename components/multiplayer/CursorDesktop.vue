<template>
  <!-- Freccia SVG Figma-style + Avatar per cursori da dispositivi desktop -->
  <div class="flex items-start">
    <svg
      class="h-6 w-6 -rotate-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] select-none shrink-0"
      viewBox="0 0 24 24"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500001 16.8829L0.500001 1.19841L17.7841 12.3673H5.65376Z"
        :fill="color"
        stroke="#ffffff"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Badge Avatar DiceBear -->
    <div
      class="mt-5 -ml-3 flex items-center justify-center p-0.5 rounded-full shadow-xl backdrop-blur-md border border-white/40 select-none"
      :style="{ backgroundColor: badgeBg }"
    >
      <img
        :src="avatarUrl"
        alt="Avatar"
        class="w-13 h-13 rounded-full bg-white/50 object-cover shadow-inner"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBadgeBg, getDicebearUrl } from '~/composables/multiplayer/useCursorHelpers'

const props = defineProps<{
  /** ID utente (usato come seed per l'avatar) */
  userId: string
  /** Colore hex del cursore */
  color: string
}>()

const badgeBg = computed(() => getBadgeBg(props.color))
const avatarUrl = computed(() => getDicebearUrl(props.userId))
</script>
