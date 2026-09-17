<template>
  <div class="fixed top-2 sm:top-4 inset-x-0 z-50 px-3 sm:px-0 flex justify-center pointer-events-none">
    
    <div class="flex sm:hidden items-center justify-between w-full max-w-md bg-background/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-full px-3 py-1.5 border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-md pointer-events-auto">
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Logo size="md" v-sound="'meow'" />
        <span v-sound class="font-semibold text-xs tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          {{ t('header.home') }}
        </span>
      </NuxtLink>

      <div class="flex items-center gap-1.5">
        <LocaleSelector />
        <ColorModeButton />

        <!-- Bottone Hamburger -->
        <UButton
          icon="i-heroicons-bars-3"
          color="neutral"
          variant="ghost"
          size="sm"
          class="rounded-full"
          aria-label="Apri menu"
          v-sound
          @click="isMenuOpen = true"
        />
      </div>
    </div>

    <UNavigationMenu
      :items="navLinks"
      variant="pill"
      color="primary"
      class="hidden sm:flex bg-background/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-full px-5 py-1 border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm max-w-max items-center pointer-events-auto"
      :ui="{
        root: 'relative',
        item: 'mx-0.5',
        link: 'py-1.5 px-3 text-sm font-medium rounded-full transition-all duration-200 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 data-active:bg-primary-400 data-active:hover:bg-primary-400/90 dark:data-active:bg-primary-400/80 dark:data-active:hover:bg-primary-400/60 data-active:text-white data-active:shadow-xs before:hidden',
        linkLeadingIcon: 'text-neutral-500 dark:text-neutral-400 group-data-active:text-white group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-200 size-5'
      }"
    >
      <template #list-leading>
        <div class="flex items-center gap-2 pr-2">
          <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo size="md" v-sound="'meow'" />
            <span v-sound class="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              {{ t('header.home') }}
            </span>
          </NuxtLink>
          <div class="h-4 flex items-center ml-1">
            <USeparator orientation="vertical" />
          </div>
        </div>
      </template>

      <template #list-trailing>
        <div class="flex flex-row gap-2">
          <ColorModeButton />
          <LocaleSelector />
        </div>
      </template>
    </UNavigationMenu>

    <USlideover v-model:open="isMenuOpen" title="Menu">
      <template #content>
        <div class="p-4 flex flex-col justify-between h-full">
          <div>
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
              <NuxtLink to="/" @click="isMenuOpen = false" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Logo size="sm" v-sound="'meow'" />
                <span class="font-bold text-sm" v-sound>{{ t('header.home') }}</span>
              </NuxtLink>
            </div>

            <nav class="flex flex-col gap-2">
              <NuxtLink
                v-for="item in links"
                :key="item.to as string"
                :to="item.to"
                v-sound
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                @click="isMenuOpen = false"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="item.icon!" class="size-5 text-primary-500 stroke-[2.5px]" />
                  <span>{{ item.label }}</span>
                </div>
              </NuxtLink>
            </nav>
          </div>

          <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span class="text-xs text-neutral-500">{{ t('header.theme') }}</span>
            <ColorModeButton @click="isMenuOpen = false" />
          </div>
          <div class="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <span class="text-xs text-neutral-500">{{ t('header.locale') }}</span>
            <LocaleSelector />
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useSound } from '~/composables/useSound'
import LocaleSelector from './LocaleSelector.vue'
import ColorModeButton from './buttons/ColorModeButton.vue'

const isMenuOpen = ref(false)
const { activeHash, lockObserverTemporarily } = useSectionObserver()
const { t } = useI18n()
const { playSound } = useSound()
const localePath = useLocalePath()

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: t('header.projects'),
    icon: 'i-lucide-folder-git-2',
    to: localePath('/#projects'),
    exactHash: true,
  },
  {
    label: t('header.about'),
    icon: 'i-heroicons-user',
    to: localePath('/#about'),
    exactHash: true,
  },
  {
    label: t('header.contacts'),
    icon: 'i-heroicons-envelope',
    to: localePath('/#contact'),
    exactHash: true,
  }
])

const navLinks = computed(() =>
  links.value.map(link => ({
    ...link,
    active: activeHash.value === (link.to as string).replace("/", ""),
    onSelect: () => {
      lockObserverTemporarily(link.to as string)
      playSound('click')
    }
  }))
)
</script>