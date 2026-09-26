<template>
  <div
    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium select-none
           backdrop-blur-sm border transition-colors duration-500"
  >
    <!-- Pallino con pulsazione -->
    <div class="relative flex items-center justify-center w-2.5 h-2.5">
      <!-- Anello ping -->
      <div
        class="absolute inset-0 rounded-full animate-ping opacity-60 transition-colors duration-500"
        :class="isAlone ? 'bg-primary-400' : 'bg-green-400'"
      />
      <!-- Punto statico centrale -->
      <div
        class="w-2 h-2 rounded-full transition-colors duration-500"
        :class="isAlone ? 'bg-primary-400' : 'bg-green-400'"
      />
    </div>

    <span>{{ totalOnline }} {{ t('components.multiplayer.online-users') }}</span>
  </div>
</template>

<script setup lang="ts">
import { useCursorWebSocket } from '~/composables/multiplayer/useCursorWebSocket';

const { t } = useI18n()

const { remoteCursors } = useCursorWebSocket()

/** Numero totale di persone connesse (io + gli altri) */
const totalOnline = computed(() => Object.keys(remoteCursors.value).length + 1)

/** true se nessun altro è connesso */
const isAlone = computed(() => Object.keys(remoteCursors.value).length === 0)
</script>