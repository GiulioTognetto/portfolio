<template>
  <ClientOnly>
    <UButton
      v-sound
      :aria-label="`Switch to ${nextTheme} mode`"
      :icon="`i-lucide-${nextTheme === 'dark' ? 'sun' : 'moon'}`"
      color="primary"
      variant="ghost"
      size="md"
      class="rounded-full cursor-pointer"
      @click="startViewTransition"
    />
    <template #placeholder>
      <UButton
        aria-label="Loading theme toggle"
        icon="i-lucide-sun"
        color="primary"
        variant="ghost"
        size="md"
        class="rounded-full pointer-events-none"
      />
    </template>
    <template #fallback>
      <UButton
        aria-label="Loading theme toggle"
        icon="i-lucide-sun"
        color="primary"
        variant="ghost"
        size="md"
        class="rounded-full pointer-events-none"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const colorMode = useColorMode()

const nextTheme = computed(() => (colorMode.value === 'dark' ? 'light' : 'dark'))

const switchTheme = () => {
  colorMode.preference = nextTheme.value
}

const startViewTransition = (event: MouseEvent) => {
  // Se le View Transitions non sono supportate o l'utente ha reduced motion, cambia direttamente
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    switchTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY

  // Calcolo della distanza dall'angolo più lontano
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // 1. Iniziamo la View Transition in modo sincrono
  const transition = document.startViewTransition(() => {
    switchTheme()
  })

  // 2. Quando il browser ha catturato il vecchio e il nuovo stato, eseguiamo l'animazione
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]

    document.documentElement.animate(
      {
        clipPath: clipPath
      },
      {
        duration: 750,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    )
  })
}
</script>

<style>
/* Regole critiche per impedire il flickering e forzare la visualizzazione dell'animazione */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  display: block;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 99999;
}
</style>