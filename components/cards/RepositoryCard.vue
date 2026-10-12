<script setup lang="ts">
import { ref } from 'vue'
import type { Repository } from '~/types/repository'

defineProps<{
  repo: Repository
}>()

// URL dell'immagine di fallback locale o statica
const fallbackImage = '/images/github-repo-template.png'
const hasImageError = ref(false)

const handleImageError = () => {
  hasImageError.value = true
}
</script>

<template>
  <a 
    :href="repo.html_url"
    target="_blank"
    rel="noopener noreferrer"
    class="block group w-95 h-85 user-select-none"
  >
    <UCard 
      class="w-full h-full flex flex-col justify-between overflow-hidden transition-all duration-300 group-hover:border-primary-500 dark:group-hover:border-primary-500 group-hover:shadow-md"
      :ui="{ 
        body: 'p-0 sm:p-0 flex flex-col h-full justify-between',
        header: 'p-0 sm:p-0',
        footer: 'p-4 sm:p-4 border-t border-neutral-100 dark:border-neutral-800'
      }"
    >
      <!-- HEADER: Thumbnail Open Graph con fallback -->
      <template #header>
        <div v-if="repo.full_name" class="relative w-full h-36 bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
          <NuxtImg 
            :src="hasImageError ? fallbackImage : `https://opengraph.githubassets.com/1/${repo.full_name}`"
            :alt="repo.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            @error="handleImageError"
          />
          <!-- Badge Pubblica / Privata in sovraimpressione sulla thumbnail -->
          <div class="absolute top-3 right-3">
            <span 
              :class="repo.private ? 'bg-yellow-500/90 text-neutral-900' : 'bg-emerald-500/90 text-white'"
              class="text-[10px] px-2.5 py-1 rounded-full font-semibold backdrop-blur-md shadow-xs"
            >
              {{ repo.private ? 'Privata' : 'Pubblica' }}
            </span>
          </div>
        </div>
      </template>

      <!-- BODY: Contenuto Testuale -->
      <div class="p-5 flex flex-col flex-grow justify-between overflow-hidden">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <h3 class="font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-primary-500 transition-colors">
              {{ repo.name }}
            </h3>
            <span 
              v-if="!repo.full_name"
              :class="repo.private ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'"
              class="text-[10px] px-2.5 py-0.5 rounded-full font-medium"
            >
              {{ repo.private ? 'Privata' : 'Pubblica' }}
            </span>
          </div>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {{ repo.description || 'Nessuna descrizione disponibile.' }}
          </p>
        </div>
      </div>

      <!-- FOOTER: Linguaggio e Stelle -->
      <template #footer>
        <div class="flex items-center justify-between text-xs text-neutral-400">
          <span v-if="repo.language" class="flex items-center gap-1.5 font-medium text-neutral-600 dark:text-neutral-300">
            <span class="size-2 rounded-full bg-primary-500"></span>
            {{ repo.language }}
          </span>
          <span v-else></span>
          
          <span class="flex items-center gap-1 font-medium">
            ⭐ {{ repo.stargazers_count }}
          </span>
        </div>
      </template>
    </UCard>
  </a>
</template>