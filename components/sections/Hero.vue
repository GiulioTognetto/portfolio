<template>
  <section id="hero" class="relative min-h-dvh flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 pt-20 lg:pt-0">
    
    <!-- Background Accents (Più sfumati ed eleganti) -->
    <div class="absolute -top-48 -left-48 w-96 h-96 bg-primary-600/15 dark:bg-primary-500/10 rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-300" />
    <div class="absolute -bottom-48 -right-48 w-96 h-96 bg-primary-600/15 dark:bg-primary-500/10 rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-300" />
    <div class="absolute inset-0 bg-[radial-gradient(var(--color-primary-500)_1px,transparent_1px)] dark:bg-[radial-gradient(var(--color-primary-400)_1px,transparent_1px)] bg-size-[32px_32px] opacity-15 dark:opacity-10 mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

    <!-- Viewport 3D -->
    <div class="absolute top-14 left-0 w-full h-[36vh] lg:top-0 lg:w-1/2 lg:h-full lg:left-auto lg:right-0 z-0 pointer-events-auto">
      <ClientOnly>
        <Viewer>
          <Scene @update="(delta) => onSceneUpdate(delta)">
            <Camera :look-at="[0, 0, 0]" :position="[0, 0, 5.5]" />
            <Model
              path="/models/lego.glb"
              v-model:loaded="isModelLoaded"
              :position="modelPosition"
              :animation="modelAnimation"
              :loop-animation="modelAnimationLoop"
              :fade-duration="modelFadeConfig"
              @anim-loop="(payload) => onAnimationLoop(payload)"
              @anim-finish="(animation) => onAnimationFinished(animation)"
              :scale="modelScale"
            />
          </Scene>
        </Viewer>
      </ClientOnly>
    </div>

    <UContainer class="w-full relative z-10 pointer-events-none pt-[34vh] lg:pt-0 pb-16 lg:pb-0 my-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <div class="lg:col-span-8 xl:col-span-7 flex flex-col items-start text-left select-none pointer-events-auto">
          
          <!-- Badge di disponibilità rifinito -->
          <UBadge 
            color="neutral"
            variant="outline" 
            size="md"
            class="mb-4 sm:mb-6 rounded-full px-4 py-1.5 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-gray-200/80 dark:border-gray-800 gap-2.5 font-mono font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm shadow-xs"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Disponibile per nuovi progetti
          </UBadge>
          
          <!-- Nome con tracking ottimizzato -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.05]">
            Giulio Tognetto
          </h1>
          
          <!-- Ruolo con gradiente raffinato -->
          <h2 class="text-xl sm:text-2xl lg:text-3xl font-semibold bg-linear-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent mt-2 sm:mt-3">
            Junior Full Stack Developer
          </h2>

          <!-- Descrizione più leggibile -->
          <p class="mt-4 sm:mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
            Sviluppatore Full-Stack specializzato in architetture ad alte prestazioni, sistemi web reattivi ed esperienze 3D interattive.
          </p>

          <!-- Tech stack badges -->
          <div class="mt-5 sm:mt-6 flex flex-wrap gap-2">
            <span
              v-for="tech in ['Vue.js / Nuxt', 'TypeScript', 'Rust', 'Three.js', 'Cloudflare']" 
              :key="tech"
              class="font-mono text-xs sm:text-sm rounded-lg px-3 py-1 bg-white/60 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-400 shadow-2xs backdrop-blur-xs"
            >
              {{ tech }}
            </span>
          </div>

          <!-- Bottoni CTA -->
          <div class="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <UButton
              to="#projects"
              @click="playSound()"
              color="primary"
              variant="solid"
              size="xl"
              trailing-icon="i-heroicons-arrow-right-20-solid"
              class="rounded-xl shadow-md shadow-primary-500/20 active:scale-95 transition-all font-medium px-6"
            >
              Vedi Progetti
            </UButton>

            <UButton
              to="#contact"
              @click="playSound()"
              color="neutral"
              variant="outline"
              size="xl"
              trailing-icon="i-heroicons-paper-airplane"
              class="rounded-xl shadow-xs active:scale-95 transition-all font-medium px-6"
            >
              Contattami
            </UButton>
          </div>

        </div>
      </div>
    </UContainer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Viewer from '~/components/3d/Viewer.vue'
import Scene from '~/components/3d/Scene.vue'
import Model from '~/components/3d/Model.vue'
import Camera from '~/components/3d/Camera.vue'
import Controls from '~/components/3d/Controls.vue'

const { playSound } = useSound()

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  impactType.value = Math.random() < 0.5 ? 'landing' : 'flat'
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})

const modelScale = computed(() => isMobile.value ? 3.0 : 2.7)
const targetY = computed(() => isMobile.value ? -2.5 : -2.5)

const startY = 10
const duration = 1.0
let elapsedTime = 0

type ImpactType = 'landing' | 'flat'
const impactType = ref<ImpactType>('landing')

const modelPosition = ref<[number, number, number]>([0, startY, 0])
const modelAnimation = ref<string>("FallingIdle")
const modelAnimationLoop = ref<boolean>(true)
const isModelLoaded = ref<boolean>(false)

let hasImpacted = false

const targetWaves = ref(0)

const modelFadeConfig = {
  default: 0.25,

  'FallingIdle->FallingToLanding': { duration: 0.15, fadeOut: 0.35 },
  'FallingToLanding->Idle': { duration: 0.25, fadeOut: 0.65, warp: true },

  'FallingIdle->FlatImpact': { duration: 0.05, fadeOut: 0.20 },
  'FlatImpact->ImpactStandup': { duration: 0.15, fadeOut: 0.30 },
  'ImpactStandup->Idle': { duration: 0.35, fadeOut: 0.50, warp: true },

  'Idle->Waving': { duration: 0.2, fadeOut: 0.3 },
  'Waving->Idle': { duration: 0.20, fadeOut: 0.5, warp: true }
}

function setIdleAnimation() {
  modelAnimationLoop.value = true
  modelAnimation.value = 'Idle'
}

function onSceneUpdate(delta: number) {
  if (!isModelLoaded.value || hasImpacted) return

  if (elapsedTime < duration) {
    const safeDelta = Math.min(delta, 0.05)
    elapsedTime += safeDelta
    const progress = Math.min(elapsedTime / duration, 1)
    
    const easeInQuad = Math.pow(progress, 2)
    const currentY = startY + (targetY.value - startY) * easeInQuad
    modelPosition.value = [0, currentY, 0]

    if (progress >= 1) {
      hasImpacted = true
      modelPosition.value = [0, targetY.value, 0]
      modelAnimationLoop.value = false
      
      if (impactType.value === 'flat') {
        modelAnimation.value = "FlatImpact"
      } else {
        modelAnimation.value = "FallingToLanding"
      }
    }
  }
}

function onAnimationFinished(animation: string) {
  if (animation === 'FlatImpact') {
    modelAnimationLoop.value = false
    modelAnimation.value = 'ImpactStandup'
  } else if (animation === 'ImpactStandup' || animation === 'FallingToLanding') {
    setIdleAnimation()
  }
}

function onAnimationLoop(payload: { name: string; count: number }) {
  if (payload.name === 'Idle') {
    if (Math.random() < 0.4) {
      targetWaves.value = Math.floor(Math.random() * 5) + 1
      modelAnimationLoop.value = true
      modelAnimation.value = 'Waving'
    }
  } else if (payload.name === 'Waving') {
    if (payload.count >= targetWaves.value) {
      setIdleAnimation()
    }
  }
}
</script>