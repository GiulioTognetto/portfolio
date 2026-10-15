<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
useSchemaOrg([
  definePerson({
    name: 'Giulio Tognetto',
    url: 'https://giuliotognetto.dev',
    jobTitle: 'Full-Stack Developer',
    sameAs: [
      'https://github.com/GiulioTognetto',
      'https://www.instagram.com/giulio.tognetto',
      'https://discord.com/users/778017089230209045',
      'https://ko-fi.com/ginocchio',
      'https://cal.com/giuliotognetto'
    ]
  })
])
</script>