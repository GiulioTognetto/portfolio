<template>
  <div
    class="group relative block h-80 w-[min(92vw,640px)] select-none text-left cursor-pointer"
    @keydown.esc="isOpen = false"
    :aria-expanded="isOpen"
    :aria-label="`${isOpen ? 'Nascondi' : 'Mostra'} i dettagli di ${displayTitle}`"
    @click="toggle"
  >
    <div class="absolute inset-0 overflow-hidden rounded-2xl border-3 border-primary-300 dark:border-primary-600 bg-neutral-900 duration-300">
      <!-- Immagine: a riposo riempie la card, quando è aperta si riduce a rettangolo sopra il pannello -->
      <div
        class="absolute inset-x-0 top-0 overflow-hidden transition-[height] duration-500 ease-out"
        :class="isOpen ? 'h-[36%]' : 'h-full'"
      >
        <NuxtImg
          :src="thumbnailSrc"
          :alt="displayTitle"
          class="h-full w-full object-cover transition-transform duration-500 ease-out transform-gpu backface-hidden"
          :class="{ 'group-hover:scale-105': !isOpen }"
          loading="lazy"
          @error="hasImageError = true"
        />
        <!-- Gradiente meno scuro e con dissolvenza in apertura -->
        <div
          class="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent transition-opacity duration-300"
          :class="isOpen ? 'opacity-0' : 'opacity-100'"
        />
      </div>

      <!-- Titolo, descrizione, topics e badge: visibili a card chiusa -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-5 flex flex-col gap-1.5 p-4 transition-opacity duration-200"
        :class="isOpen ? 'opacity-0' : 'opacity-100'"
      >
        <!-- Nome + tag (licenza, stelle, fork, dimensione) -->
        <div class="pointer-events-auto flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 class="min-w-0 max-w-full truncate text-xl font-bold leading-tight text-white">
            {{ displayTitle }}
          </h3>

          <UBadge v-if="licenseLabel" variant="subtle" size="md" class="bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 border-0">
            <UIcon name="i-lucide-scale" class="size-3 mr-1" />
            {{ licenseLabel }}
          </UBadge>
          <UBadge variant="subtle" size="md" class="bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 border-0">
            <UIcon name="i-lucide-star" class="size-3 mr-1" />
            {{ formatCount(repo.stargazers_count) }}
          </UBadge>
          <UBadge variant="subtle" size="md" class="bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 border-0">
            <UIcon name="i-lucide-git-fork" class="size-3 mr-1" />
            {{ formatCount(repo.forks_count) }}
          </UBadge>
          <UBadge variant="subtle" size="md" class="bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 border-0">
            <UIcon name="i-lucide-hard-drive" class="size-3 mr-1" />
            {{ repositorySize }}
          </UBadge>
        </div>

        <p class="line-clamp-2 text-sm leading-relaxed text-white/80">
          {{ displayDescription }}
        </p>

        <!-- Topics troncati con Tooltip NuxtUI -->
        <div v-if="topics.length" class="pointer-events-auto mt-1 flex flex-wrap items-center gap-1.5">
          <UBadge
            v-for="topic in topics"
            :key="topic"
            variant="subtle"
            size="md"
            class="bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 border-0"
          >
            {{ topic }}
          </UBadge>

          <UTooltip v-if="extraTopics > 0" :popper="{ placement: 'top' }">
            <UBadge variant="subtle" size="sm" class="cursor-pointer bg-white/20 dark:bg-neutral-800/60 backdrop-blur-md text-white dark:text-neutral-200 hover:bg-white/30 dark:hover:bg-neutral-800 transition-colors border-0">
              +{{ extraTopics }}
            </UBadge>

            <template #content>
              <div class="flex w-full flex-wrap gap-1 p-1 bg-transparent">
                <UBadge
                  v-for="topic in hiddenTopics"
                  :key="topic"
                  variant="subtle"
                  size="md"
                  class="bg-neutral-900/80 dark:bg-neutral-800/90 backdrop-blur-md text-white border-0"
                >
                  {{ topic }}
                </UBadge>
              </div>
            </template>
          </UTooltip>
        </div>
      </div>

      <!-- Pannello dettagli (visibile ad apertura) -->
      <div
        class="absolute inset-x-0 bottom-0 flex h-[64%] flex-col gap-2 overflow-hidden bg-neutral-100/97 px-4 py-3 transition-all duration-500 ease-out dark:bg-neutral-900/97"
        :class="isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
        :aria-hidden="!isOpen"
      >
        <!-- Nome + tag -->
        <div class="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h3 class="min-w-0 max-w-full truncate text-lg font-bold leading-tight text-neutral-900 dark:text-white">
            {{ displayTitle }}
          </h3>

          <UBadge v-if="licenseLabel" color="neutral" variant="subtle" size="md">
            <UIcon name="i-lucide-scale" class="size-3 mr-1" />
            {{ licenseLabel }}
          </UBadge>
          <UBadge color="neutral" variant="subtle" size="md">
            <UIcon name="i-lucide-star" class="size-3 mr-1" />
            {{ formatCount(repo.stargazers_count) }}
          </UBadge>
          <UBadge color="neutral" variant="subtle" size="md">
            <UIcon name="i-lucide-git-fork" class="size-3 mr-1" />
            {{ formatCount(repo.forks_count) }}
          </UBadge>
          <UBadge color="neutral" variant="subtle" size="md">
            <UIcon name="i-lucide-hard-drive" class="size-3 mr-1" />
            {{ repositorySize }}
          </UBadge>
        </div>

        <p class="line-clamp-2 shrink-0 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 flex grow">
          {{ displayDescription }}
        </p>

        <!-- Sezione Linguaggi (se in caricamento o con dati) -->
        <div v-if="languagesPending || (!languagesError && languageBreakdown.length > 0)" class="mt-auto min-h-0 rounded-xl bg-neutral-200/80 p-2.5 dark:bg-neutral-800/80">
          <div class="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <span>Languages</span>
          </div>

          <div v-if="languagesPending" class="flex items-center justify-center py-2 text-xs text-neutral-600 dark:text-neutral-300">
            <UIcon name="i-heroicons-arrow-path" class="mr-2 size-4 animate-spin" />
            Loading languages...
          </div>
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

        <!-- Se fallback: mostra tutti i topics nel pannello se i linguaggi falliscono/non ci sono -->
        <div v-else-if="!languagesPending && (languagesError || !languageBreakdown.length) && repo.topics?.length" class="mt-auto min-h-0 rounded-xl bg-neutral-200/80 p-2.5 dark:bg-neutral-800/80">
          <div class="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            <span>Topics</span>
          </div>
          <div class="flex max-h-24 flex-wrap gap-1 overflow-y-auto pr-1">
            <UBadge
              v-for="topic in repo.topics"
              :key="topic"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ topic }}
            </UBadge>
          </div>
        </div>
      </div>

      <div class="absolute right-3 top-3 z-10 flex flex-row items-center gap-2">
        <!-- Pulsante Sito Web (se configurato) -->
        <NuxtLink
          v-if="websiteUrl"
          :to="websiteUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apri il sito web del progetto"
          class="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-primary-500"
          @click.stop
        >
          <UIcon name="i-lucide-globe" class="size-4" />
        </NuxtLink>

        <!-- Pulsante GitHub (se la repo non è privata) -->
        <NuxtLink
          v-if="!repo.private"
          :to="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Apri repository su GitHub"
          class="flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-primary-500"
          @click.stop
        >
          <UIcon name="i-lucide-external-link" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import type { EnrichedRepository, RepositoryPortfolioConfig } from '~/types/repository'

const props = defineProps<{
  repo: EnrichedRepository
}>()

const MAX_TOPICS = 5

const fallbackImage = '/images/github-repo-template.png'
const isOpen = ref(false)
const hasImageError = ref(false)
const languages = ref<Record<string, number>>({})
const languagesPending = ref(false)
const languagesError = ref(false)

// Stato reattivo per la configurazione custom del portfolio
const portfolioConfig = reactive<RepositoryPortfolioConfig>({})
const configLoaded = ref(false)

const languageColors = ['bg-primary-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

const numberFormatter = new Intl.NumberFormat('it-IT', { notation: 'compact', maximumFractionDigits: 1 })
const formatCount = (value?: number) => numberFormatter.format(value ?? 0)

// Proprietà calcolate reattive basate sulla configurazione con fallback ai dati GitHub
const displayTitle = computed(() => portfolioConfig.title || props.repo.name)
const displayDescription = computed(() => portfolioConfig.description ?? props.repo.description ?? 'Nessuna descrizione disponibile.')
const websiteUrl = computed(() => {
  const site = portfolioConfig.website || props.repo.homepage || null
  if (!site) return null

  if (!site.startsWith('http://') && !site.startsWith('https://')) {
    return `https://${site}`
  }
  
  return site
})

const thumbnailSrc = computed(() => {
  if (hasImageError.value) return fallbackImage
  
  const customThumb = portfolioConfig.thumbnail_url
  
  if (customThumb) {
    if (customThumb.startsWith('http://') || customThumb.startsWith('https://')) {
      return customThumb
    }
    
    const owner = props.repo.owner.login
    const branch = props.repo.default_branch || 'main'
    const cleanPath = customThumb.startsWith('/') ? customThumb.slice(1) : customThumb

    const imagePath = `https://raw.githubusercontent.com/${owner}/${props.repo.name}/${branch}/${cleanPath}`;

    console.log(`Using custom thumbnail for ${props.repo.full_name}: ${imagePath}`)
    
    return imagePath
  }
  
  return `https://opengraph.githubassets.com/1/${props.repo.full_name}`
})

const topics = computed(() => {
  const customTech = portfolioConfig.technologies
  if (customTech && customTech.length > 0) {
    return customTech.slice(0, MAX_TOPICS)
  }
  return (props.repo.topics ?? []).slice(0, MAX_TOPICS)
})

const extraTopics = computed(() => {
  const customTech = portfolioConfig.technologies
  const total = customTech && customTech.length > 0 ? customTech.length : (props.repo.topics?.length ?? 0)
  return Math.max(total - MAX_TOPICS, 0)
})

const hiddenTopics = computed(() => {
  const customTech = portfolioConfig.technologies
  if (customTech && customTech.length > 0) {
    return customTech.slice(MAX_TOPICS)
  }
  return (props.repo.topics ?? []).slice(MAX_TOPICS)
})

const licenseLabel = computed(() => {
  const id = props.repo.license?.spdx_id
  if (id && id !== 'NOASSERTION') return id
  return props.repo.license?.name ?? null
})

const repositorySize = computed(() => {
  const kb = props.repo.size ?? 0
  if (kb < 1024) {
    return `${kb} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
})

const languageBreakdown = computed(() => {
  const entries = Object.entries(languages.value)
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)

  return entries
    .map(([name, bytes]) => ({ name, percentage: total ? (bytes / total) * 100 : 0 }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)
})

// Funzione per caricare il file JSON di configurazione dalla repository
const loadPortfolioConfig = async () => {
  if (configLoaded.value || !props.repo.portfolioConfigUrl) return

  try {
    const rawData = await $fetch<any>(props.repo.portfolioConfigUrl)
    
    // Se GitHub restituisce il JSON come stringa (test/plain), lo parsiamo
    const configData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData

    if (configData) {
      Object.assign(portfolioConfig, configData)
      console.log('Parsed and assigned portfolio config:', portfolioConfig)
    }
  } catch (error: any) {
    console.warn(`Error loading portfolio config for ${props.repo.full_name}:`, error)
  } finally {
    configLoaded.value = true
  }
}

const loadLanguages = async () => {
  if (Object.keys(languages.value).length || languagesPending.value || !props.repo.languages_url) return

  languagesPending.value = true
  languagesError.value = false

  try {
    languages.value = await $fetch<Record<string, number>>(props.repo.languages_url)
  } catch {
    languagesError.value = true
  } finally {
    languagesPending.value = false
  }
}

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    loadLanguages()
  }
}

onMounted(() => {
  loadPortfolioConfig()
})
</script>