<template>
  <USelectMenu
    v-model="currentLocale"
    :items="formattedLocales"
    value-key="code"
    label-key="label"
    variant="none"
    size="sm"
    class="w-10"
    :ui="{
      content: 'w-28',
      base: 'rounded-full font-mono font-bold text-xs justify-center hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 active:bg-primary-400/20'
    }"
  >
    <template #leading="{ modelValue }">
      <UIcon :name="getLocaleIcon(modelValue)" class="w-4 h-4" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
const { locale, setLocale, locales } = useI18n()

const formattedLocales = computed(() => {
  return (locales.value).map((l) => ({
    code: l.code,
    label: l.name ?? l.code.toUpperCase(),
    icon: l.icon || 'i-lucide-globe'
  }))
})

function getLocaleIcon(code: string): string {
  return (locales.value.find((locale) => locale.code as string === code) as any).icon
}

const currentLocale = computed({
  get: () => locale.value,
  set: (val) => setLocale(val)
})
</script>