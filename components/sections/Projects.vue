<template>
  <section id="projects" class="relative z-10 bg-white dark:bg-gray-900 border-t border-b border-gray-200/80 dark:border-gray-800/80 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.35)] pt-16 pb-24">
    <UContainer>
      <div class="text-center max-w-3xl mx-auto mb-12">
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
          {{ t('sections.projects.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
          {{ t('sections.projects.subtitle') }}
        </p>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>