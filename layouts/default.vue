<template>
  <MultiplayerCursors />

  <Header />

  <UMain>
    <slot />
  </UMain>

  <Footer />
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue';
import MultiplayerCursors from '~/components/multiplayer/MultiplayerCursors.vue';
</script>

<style>

</style>