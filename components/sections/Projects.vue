<template>
  <section id="projects" class="relative z-10 bg-white dark:bg-gray-900 border-t border-b border-gray-200/80 dark:border-gray-800/80 shadow-[0_-20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.35)] pt-16 pb-24 overflow-hidden">
    <!-- Intestazione della sezione -->
    <UContainer>
      <div class="text-center max-w-3xl mx-auto mb-12 mt-12">
        <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white">
          {{ t('sections.projects.title') }}
        </h2>
        <p class="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
          {{ t('sections.projects.subtitle') }}
        </p>
      </div>
    </UContainer>

    <!-- Stato di Caricamento -->
    <div v-if="pending" class="flex justify-center items-center py-12">
      <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin size-5 text-primary-500" />
        <span>Caricamento repository...</span>
      </div>
    </div>

    <!-- Stato di Errore -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-sm text-red-500 dark:text-red-400">
        Impossibile caricare le repository al momento.
      </p>
    </div>

    <!-- Carosello Full-Width con UCarousel -->
    <div v-else-if="repos && repos.length > 0" class="relative w-full py-8 user-select-none">
      <LazyUCarousel
        :items="repos" 
        dots
        auto-scroll
        class-names
        loop
        drag-free
        :autoplay="{ delay: 800, stopOnFocusIn: true, stopOnMouseEnter: true }"
        class="w-full mx-auto px-4 user-select-none"
        :ui="{
          dots: 'flex justify-start gap-2 mt-6 ml-10',
          dot: 'w-6 h-1 data-[state=active]:bg-primary-500',
          item: 'basis-[92%] transition-opacity basis-full sm:basis-[540px] lg:basis-[560px] px-2 py-4',
          container: 'items-center',
        }"
      >
        <template #default="{ item }">
          <div class="carousel-card-wrapper flex justify-center transition-all duration-300">
            <LazyRepositoryCard :repo="item" />
          </div>
        </template>
      </LazyUCarousel>
    </div>

    <!-- Nessuna repository trovata -->
    <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
      Nessuna repository trovata.
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EnrichedRepository } from '~/types/repository'
const { t } = useI18n()

const LazyRepositoryCard = defineAsyncComponent(() => import('~/components/cards/RepositoryCard.vue'))
const { data: allRepos, pending, error } = await useFetch<EnrichedRepository[]>('/api/github/repos')

const featuredRepoNames = [
  'portfolio',
  'Appunti', 
  'flarecord-rs', 
  'BrickUIWeb',
  'BrickUIApp',
  'RelayRouter',
  'StudyHive',
  'RelayRouter',
  'GGsBot.rs',
  'my.arch.config'
]

const repos = computed(() => {
  if (!allRepos.value) return []
  return allRepos.value.filter(repo => featuredRepoNames.includes(repo.name))
})

onMounted(() => {
  if (error.value) {
    console.error('Error fetching GitHub repositories:', error.value)
  }
})
</script>