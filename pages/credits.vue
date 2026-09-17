<template>
  <div class="max-w-4xl mx-auto px-4 pt-30 sm:pt-28 pb-12 sm:pb-16">
    <header class="mb-10 text-center sm:text-left">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-semibold mb-3">
        <UIcon name="i-heroicons-sparkles" class="size-4" />
        <span>{{ t('pages.credits.thanks') }}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">
        {{ t('pages.credits.title') }}
      </h1>
      <p class="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm sm:text-base">
        {{ t('pages.credits.description') }}
      </p>
    </header>

    <USeparator class="my-8" />

    <section class="space-y-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-speaker-wave" class="size-5 text-primary-500" />
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {{ t('pages.credits.audio-and-effects') }}
        </h2>
      </div>

      <!-- Griglia Generata Dinamicamente -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="audio in audioCredits"
          :key="audio.title"
          class="flex flex-col justify-between p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                {{ audio.title }}
              </span>
              <UBadge color="neutral" variant="subtle" size="xs">
                <a :href="audio.license.url" target="_blank" rel="noopener noreferrer">
                  {{ audio.license.label }}
                </a>
              </UBadge>
            </div>

            <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {{ audio.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs">
            <span class="text-neutral-500">
              {{ t('pages.credits.author') }}:
              <a
                v-if="audio.author.url"
                :href="audio.author.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-neutral-700 dark:text-neutral-300 hover:text-primary-500 transition-colors underline"
              >
                {{ audio.author.name }}
              </a>
              <span v-else class="font-medium text-neutral-700 dark:text-neutral-300">
                {{ audio.author.name }}
              </span>
            </span>

            <a
              :href="audio.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-primary-500 hover:underline font-medium"
            >
              <span>{{ t('pages.credits.source') }}</span>
              <UIcon name="i-heroicons-arrow-up-right-20-solid" class="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-12 space-y-6">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-code-bracket" class="size-5 text-primary-500" />
        <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {{ t('pages.credits.open-source-tech') }}
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          v-for="tech in techStack"
          :key="tech.name"
          :href="tech.url"
          target="_blank"
          rel="noopener noreferrer"
          class="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors group"
        >
          <UIcon :name="tech.icon" class="size-6 text-primary-500 group-hover:scale-110 transition-transform" />
          <div>
            <div class="font-medium text-sm text-neutral-900 dark:text-neutral-100">
              {{ tech.name }}
            </div>
            <div class="text-xs text-neutral-500">
              {{ tech.desc }}
            </div>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">

const { t } = useI18n()
useSeoMeta({
  title: t('pages.credits.meta.title'),
  description: t('pages.credits.meta.description'),
  
  ogTitle: t('pages.credits.meta.ogtitle'),
  ogDescription: t('pages.credits.meta.ogdescription'),
  ogImage: 'https://giuliotognetto.dev/og-image.png',
  ogUrl: 'https://giuliotognetto.dev',
  ogType: 'website',

  robots: 'noindex, follow',

  twitterCard: 'summary_large_image',
  twitterTitle: t('pages.credits.meta.twittertitle'),
  twitterDescription: t('pages.credits.meta.twitterdescription'),
  twitterImage: 'https://giuliotognetto.dev/og-image.png',
})

interface AudioCredit {
  title: string
  description: string
  sourceUrl: string
  author: {
    name: string
    url?: string
  }
  license: {
    label: string
    url?: string
  }
}

const audioCredits: AudioCredit[] = [
  {
    title: 'cat3.wav (cat-meow.wav)',
    description: 'Sound effect of meowing used when clicking on the logo.',
    sourceUrl: 'https://freesound.org/people/NoiseCollector/sounds/4915/',
    author: {
      name: 'NoiseCollector',
      url: 'https://freesound.org/people/NoiseCollector/'
    },
    license: {
      label: 'CC BY 3.0',
      url: 'http://creativecommons.org/licenses/by/3.0/'
    }
  },
  {
    title: 'Plastic bubble click (bubble-click.wav)',
    description: 'Feedback sound effect for buttons and navigation.',
    sourceUrl: 'https://mixkit.co/free-sound-effects/',
    author: {
      name: 'Mixkit Sound Effects',
      url: 'https://mixkit.co/'
    },
    license: {
      label: 'sfxFree',
      url: 'https://mixkit.co/license/#sfxFree'
    }
  }
]

const techStack = [
  { name: 'Typescript', desc: 'Typescript Language', icon: 'i-simple-icons-typescript', url: 'https://www.typescriptlang.org/' },
  { name: 'Vue', desc: 'Web Framework', icon: 'i-simple-icons-vuedotjs', url: 'https://vuejs.org/' },
  { name: 'Nuxt', desc: 'Vue Framework', icon: 'i-simple-icons-nuxtdotjs', url: 'https://nuxt.com' },
  { name: 'Nuxt UI', desc: 'Component Library', icon: 'i-simple-icons-nuxtdotjs', url: 'https://ui.nuxt.com' },
  { name: 'Three.js', desc: '3D WebGL Library', icon: 'i-simple-icons-threedotjs', url: 'https://threejs.org/' },
  { name: 'Blender', desc: '3D modeling and rigging software', icon: 'i-simple-icons-blender', url: 'https://www.blender.org/' }
]
</script>