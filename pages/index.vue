<template>
  <main class="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen">
    <Hero />
    <About />
    <Projects />
    <Contact />
  </main>
</template>

<script lang="ts" setup>
import Hero from '~/components/sections/Hero.vue'
import About from '~/components/sections/About.vue';
import Projects from '~/components/sections/Projects.vue';
import Contact from '~/components/sections/Contact.vue';

const { t } = useI18n()
const { initObserver } = useSectionObserver()
initObserver(['hero', 'about', 'projects', 'contact'])

useSeoMeta({
  title: t('pages.index.meta.title'),
  description: t('pages.index.meta.description'),
  
  ogTitle: t('pages.index.meta.ogtitle'),
  ogDescription: t('pages.index.meta.ogdescription'),
  ogImage: 'https://giuliotognetto.dev/og-image.png',
  ogUrl: 'https://giuliotognetto.dev',
  ogType: 'website',

  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: t('pages.index.meta.twittertitle'),
  twitterDescription: t('pages.index.meta.twitterdescription'),
  twitterImage: 'https://giuliotognetto.dev/og-image.png',
})
</script>