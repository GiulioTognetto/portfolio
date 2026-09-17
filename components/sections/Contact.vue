<template>
  <section id="contact" class="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
    <!-- Glow di sfondo ottimizzato e fluido (zero scatti, accelerato via GPU) -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60dvw] h-[60dvw] max-w-200 max-h-200 pointer-events-none z-0 opacity-40 dark:opacity-35 blur-[100px] transform-gpu">
      <div class="absolute inset-0 rounded-full bg-linear-to-bl from-primary-400/40 via-primary-600/20 to-transparent" />
    </div>

    <UContainer class="relative z-10 w-full">
      <div class="max-w-2xl mx-auto text-center flex flex-col items-center">
        
        <UBadge
          color="primary"
          variant="subtle"
          size="md"
          class="mb-4 font-mono rounded-full px-3.5 py-1"
        >
          Get in Touch
        </UBadge>
        
        <!-- Titolo e Sottotitolo -->
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
          Parliamo del tuo progetto
        </h2>
        <p class="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-lg">
          Hai un'idea in mente, vuoi collaborare o semplicemente fare due chiacchiere? Scegli il canale che preferisci.
        </p>

        <!-- Pulsanti di Azione Principali (layout originale intatto) -->
        <div class="mt-8 flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <BookACall />
          <UButton
            v-sound
            to="mailto:contact@giuliotognetto.dev"
            color="neutral"
            variant="outline"
            size="xl"
            icon="i-lucide-mail"
            class="rounded-xl bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-800 active:scale-95 transition-all shadow-xs"
          >
            Invia un'Email
          </UButton>
        </div>

      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import BookACall from '~/components/BookACall.vue'
</script>