<template>
  <UFooter class="dark:bg-gray-900 bg-gray-100 border-t border-gray-200/80 dark:border-gray-800/80">
    <template #left>
      <p class="text-muted text-sm">Copyright</p>
      <UIcon name="i-lucide-copyright" size="sm" class="text-muted"></UIcon>
      <p class="text-muted text-sm">
        {{ new Date().getFullYear() }} Giulio Tognetto. All rights reserved.
      </p>
    </template>

    <UNavigationMenu :items="items" variant="link" />

    <template #right>
      <UButton
        v-sound
        icon="i-simple-icons-discord"
        color="primary"
        variant="ghost"
        to="https://discord.com/users/778017089230209045"
        target="_blank"
        aria-label="Discord"
      />
      <UButton
        v-sound
        icon="i-simple-icons-instagram"
        color="primary"
        variant="ghost"
        to="https://www.instagram.com/giulio.tognetto"
        target="_blank"
        aria-label="Instagram"
      />
      <UButton
        v-sound
        icon="i-simple-icons-github"
        color="primary"
        variant="ghost"
        to="https://github.com/GiulioTognetto"
        target="_blank"
        aria-label="GitHub"
      />
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const { playSound } = useSound()

const items: NavigationMenuItem[] = [
  {
    icon: "i-lucide-creative-commons",
    label: 'Credits',
    to: '/credits',
    onSelect: () => playSound('click')
  }, 
]
</script>

<style>

</style>