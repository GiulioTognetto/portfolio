<template>
  <div
    class="group relative block h-80 w-[min(92vw,640px)] select-none text-left"
    @keydown.esc="isOpen = false"
  >
    <div class="absolute inset-0 overflow-hidden rounded-2xl border-2 border-neutral-900/80 bg-neutral-900 shadow-xl transition-shadow duration-300 group-hover:shadow-2xl dark:border-white/80">
      <!-- Immagine: a riposo riempie la card, quando è aperta si riduce a rettangolo sopra il pannello -->
      <div
        class="absolute inset-x-0 top-0 overflow-hidden transition-[height] duration-500 ease-out"
        :class="isOpen ? 'h-[36%]' : 'h-full'"
      >
        <NuxtImg
          :src="hasImageError ? fallbackImage : `https://opengraph.githubassets.com/1/${repo.full_name}`"
          :alt="repo.name"
          class="h-full w-full object-cover"
          loading="lazy"
          @error="hasImageError = true"
        />
        <div class="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-transparent" />
      </div>

      <!-- Titolo, descrizione e topics: visibili solo a card chiusa -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex flex-col gap-1.5 p-4 transition-opacity duration-200"
        :class="isOpen ? 'opacity-0' : 'opacity-100'"
      >
        <h3 class="truncate text-xl font-bold leading-tight text-white">
          {{ repo.name }}
        </h3>
        <p class="line-clamp-2 text-xs leading-relaxed text-white/80">
          {{ repo.description || 'Nessuna descrizione disponibile.' }}
        </p>
        <div v-if="topics.length" class="mt-1 flex flex-wrap gap-1.5">
          <span
            v-for="topic in topics"
            :key="topic"
            class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-md"
          >
            {{ topic }}
          </span>
          <span
            v-if="extraTopics > 0"
            class="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white/80 backdrop-blur-md"
          >
            +{{ extraTopics }}
          </span>
        </div>
      </div>

      <!-- Pannello dettagli -->
      <div
        class="absolute inset-x-0 bottom-0 flex h-[64%] flex-col gap-2 overflow-hidden bg-neutral-100/97 px-4 py-3 transition-all duration-500 ease-out dark:bg-neutral-900/97"
        :class="isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
        :aria-hidden="!isOpen"
      >
        <!-- Nome + tag -->
        <div class="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 class="min-w-0 max-w-full truncate text-lg font-bold leading-tight text-neutral-900 dark:text-white">
            {{ repo.name }}
          </h3>

          <span v-if="licenseLabel" :class="badgeClass">
            <UIcon name="i-lucide-scale" class="size-3" />
            {{ licenseLabel }}
          </span>
          <span :class="badgeClass">
            <UIcon name="i-lucide-star" class="size-3" />
            {{ formatCount(repo.stargazers_count) }}
          </span>
          <span :class="badgeClass">
            <UIcon name="i-lucide-git-fork" class="size-3" />
            {{ formatCount(repo.forks_count) }}
          </span>
        </div>

        <p class="line-clamp-2 shrink-0 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
          {{ repo.description || 'Nessuna descrizione disponibile.' }}
        </p>

        <!-- Linguaggi -->
        <div class="mt-auto min-h-0 rounded-xl bg-neutral-200/80 p-2.5 dark:bg-neutral-800/80">
          <div class="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <span>Linguaggi</span>
            <span class="inline-flex items-center gap-1 normal-case tracking-normal text-neutral-700 dark:text-neutral-200">
              <UIcon name="i-lucide-hard-drive" class="size-3" />
              {{ repositorySize }}
            </span>
          </div>

          <div v-if="languagesPending" class="flex items-center justify-center py-2 text-xs text-neutral-600 dark:text-neutral-300">
            <UIcon name="i-heroicons-arrow-path" class="mr-2 size-4 animate-spin" />
            Caricamento linguaggi...
          </div>
          <p v-else-if="languagesError" class="py-2 text-xs text-red-600 dark:text-red-300">
            Impossibile caricare i linguaggi.
          </p>
          <p v-else-if="!languageBreakdown.length" class="py-2 text-xs text-neutral-600 dark:text-neutral-300">
            Nessun linguaggio disponibile.
          </p>
          <template v-else>
            <div class="flex h-2 w-full overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
              <div
                v-for="(language, index) in languageBreakdown"
                :key="language.name"
                :class="languageColors[index] ?? 'bg-neutral-400'"
                :style="{ width: `${language.percentage}%` }"
              />
            </div>
            <ul class="mt-2 grid grid-cols-3 gap-x-4 gap-y-1 text-xs text-neutral-900 dark:text-white">
              <li v-for="(language, index) in languageBreakdown" :key="language.name" class="flex min-w-0 items-center gap-1.5">
                <span class="size-2 shrink-0 rounded-full" :class="languageColors[index] ?? 'bg-neutral-400'" />
                <span class="truncate">{{ language.name }}</span>
                <span class="ml-auto shrink-0 tabular-nums text-neutral-600 dark:text-white/70">
                  {{ language.percentage.toFixed(1) }}%
                </span>
              </li>
            </ul>
          </template>
        </div>
      </div>

      <!-- Area cliccabile per aprire/chiudere (button vero, così funziona anche da tastiera) -->
      <button
        type="button"
        class="absolute inset-0 z-8 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary-500"
        :aria-expanded="isOpen"
        :aria-label="`${isOpen ? 'Nascondi' : 'Mostra'} i dettagli di ${repo.name}`"
        @click="toggle"
      />

      <a
        v-if="!repo.private"
        :href="repo.html_url"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Apri repository su GitHub"
        class="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-primary-500"
      >
        <UIcon name="i-lucide-external-link" class="size-4" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Repository } from '~/types/repository'

const { repo } = defineProps<{
  repo: Repository
}>()

const MAX_TOPICS = 4

const fallbackImage = '/images/github-repo-template.png'
const isOpen = ref(false)
const hasImageError = ref(false)
const languages = ref<Record<string, number>>({})
const languagesPending = ref(false)
const languagesError = ref(false)

// Classi complete (non dinamiche) così Tailwind le include nel build
const languageColors = ['bg-primary-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']
const badgeClass = 'inline-flex shrink-0 items-center gap-1 rounded-md bg-neutral-200 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'

const numberFormatter = new Intl.NumberFormat('it-IT', { notation: 'compact', maximumFractionDigits: 1 })
const formatCount = (value?: number) => numberFormatter.format(value ?? 0)

const topics = computed(() => (repo.topics ?? []).slice(0, MAX_TOPICS))
const extraTopics = computed(() => Math.max((repo.topics?.length ?? 0) - MAX_TOPICS, 0))

const licenseLabel = computed(() => {
  const id = repo.license?.spdx_id
  if (id && id !== 'NOASSERTION') return id
  return repo.license?.name ?? null
})

// repo.size è espresso in KB da GitHub
const repositorySize = computed(() => {
  const mb = (repo.size ?? 0) / 1024
  return mb > 0 && mb < 0.1 ? '< 0.1 MB' : `${mb.toFixed(1)} MB`
})

const languageBreakdown = computed(() => {
  const entries = Object.entries(languages.value)
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)

  return entries
    .map(([name, bytes]) => ({ name, percentage: total ? (bytes / total) * 100 : 0 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
})

const loadLanguages = async () => {
  if (Object.keys(languages.value).length || languagesPending.value || !repo.languages_url) return

  languagesPending.value = true
  languagesError.value = false

  try {
    languages.value = await $fetch<Record<string, number>>(repo.languages_url)
  } catch {
    languagesError.value = true
  } finally {
    languagesPending.value = false
  }
}

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) loadLanguages()
}
</script>