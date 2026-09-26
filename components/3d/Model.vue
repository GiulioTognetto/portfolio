<template>
  <div class="hidden">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, inject, watch, onMounted, onBeforeUnmount, type ShallowRef } from 'vue'
import { Scene, Camera, AnimationClip, AnimationAction, AnimationMixer, LoopOnce, LoopRepeat } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useModelLoader } from '~/composables/3d/useModelLoader'

export interface FadeOptions {
  /** Durata del crossfade/fadeIn in secondi */
  duration?: number
  /** Durata del fadeOut dell'azione uscente (se diversa) */
  fadeOut?: number
  /** Se true, esegue il crossFade ammorbidendo anche la velocità (timeScale) */
  warp?: boolean
  /** Resetta il tempo dell'animazione uscente prima di sfumare */
  resetPrevious?: boolean
}

export type FadeConfig = number | {
  default?: number | FadeOptions
  [key: string]: number | FadeOptions | undefined
}

const sceneContext = inject<{ scene: Scene, activeCamera: ShallowRef<Camera | null> } | null>('sceneContext', null)

const props = withDefaults(
  defineProps<{
    path: string
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number | [number, number, number]
    animation?: string
    loopAnimation?: boolean
    fadeDuration?: FadeConfig
  }>(),
  {
    position: () => [0, 0, 0],
    rotation: () => [0, 0, 0],
    scale: 1,
    loopAnimation: true,
    fadeDuration: 0.3
  }
)

const isLoaded = defineModel<boolean>('loaded', { default: false })
const emit = defineEmits<{
  (e: 'load', gltf: GLTF): void
  (e: 'progress', event: ProgressEvent<EventTarget>): void
  (e: 'error', error: unknown): void
  (e: 'anim-start', name: string): void
  (e: 'anim-finish', name: string): void
  (e: 'anim-loop', payload: { name: string; count: number }): void
  (e: 'anim-change', payload: { from: string | null; to: string }): void
}>()

const { loadModel, releaseModel } = useModelLoader()
const model = shallowRef<GLTF | null>(null)

// --- Gestione Animazioni ---
let mixer: AnimationMixer | null = null
let currentAction: AnimationAction | null = null
const loopCount = ref(0)

useUpdate((delta: number) => {
  if (mixer) {
    mixer.update(delta)
  }
})

const setupMixerListeners = () => {
  if (!mixer) return

  mixer.addEventListener('finished', (e: any) => {
    const actionName = e.action.getClip().name
    emit('anim-finish', actionName)
  })

  mixer.addEventListener('loop', (e: any) => {
    const actionName = e.action.getClip().name
    loopCount.value++
    emit('anim-loop', { name: actionName, count: loopCount.value })
  })
}

const resolveFadeOptions = (from: string | null, to: string): Required<FadeOptions> => {
  const fallback: Required<FadeOptions> = {
    duration: 0.25,
    fadeOut: 0.25,
    warp: false,
    resetPrevious: false
  }

  if (typeof props.fadeDuration === 'number') {
    return { ...fallback, duration: props.fadeDuration, fadeOut: props.fadeDuration }
  }

  if (typeof props.fadeDuration === 'object') {
    // 1. Transizione specifica "From->To"
    const specific = from ? props.fadeDuration[`${from}->${to}`] : undefined
    // 2. O animazione di destinazione "To"
    const target = props.fadeDuration[to]
    // 3. Fallback di default
    const def = props.fadeDuration.default

    const match = specific ?? target ?? def

    if (typeof match === 'number') {
      return { ...fallback, duration: match, fadeOut: match }
    } else if (typeof match === 'object') {
      return {
        duration: match.duration ?? fallback.duration,
        fadeOut: match.fadeOut ?? match.duration ?? fallback.fadeOut,
        warp: match.warp ?? fallback.warp,
        resetPrevious: match.resetPrevious ?? fallback.resetPrevious
      }
    }
  }

  return fallback
}

const playAnimation = (name?: string, overrideFade?: number | FadeOptions) => {
  if (!mixer || !model.value?.animations.length) return

  const animations = model.value.animations
  const clip = name 
    ? AnimationClip.findByName(animations, name) 
    : animations[0]

  if (!clip) return

  const newAction = mixer.clipAction(clip)

  if (currentAction === newAction && newAction.isRunning()) return

  const previousName = currentAction ? currentAction.getClip().name : null
  const currentName = clip.name

  // Risoluzione delle opzioni di Fading
  const options = typeof overrideFade === 'number'
    ? { duration: overrideFade, fadeOut: overrideFade, warp: false, resetPrevious: false }
    : { ...resolveFadeOptions(previousName, currentName), ...overrideFade }

  loopCount.value = 0
  configureLoop(newAction, props.loopAnimation)

  if (currentAction && currentAction !== newAction) {
    if (options.resetPrevious) {
      currentAction.reset()
    }

    // Se fadeOut ha una durata diversa dal fadeIn dell'azione entrante
    if (options.fadeOut !== options.duration) {
      currentAction.fadeOut(options.fadeOut)
      newAction.reset().fadeIn(options.duration).play()
    } else {
      // Usa il crossFadeTo nativo con supporto facoltativo al warping (sincronizzazione tempo)
      currentAction.crossFadeTo(newAction, options.duration, options.warp)
      newAction.reset().play()
    }
  } else {
    // Prima esecuzione
    newAction.reset().fadeIn(options.duration).play()
  }

  currentAction = newAction

  emit('anim-start', currentName)
  if (previousName !== currentName) {
    emit('anim-change', { from: previousName, to: currentName })
  }
}

const configureLoop = (action: AnimationAction, loop: boolean) => {
  if (loop) {
    action.setLoop(LoopRepeat, Infinity)
    action.clampWhenFinished = false
  } else {
    action.setLoop(LoopOnce, 1)
    action.clampWhenFinished = true
  }
}

const applyTransformations = () => {
  if (!model.value?.scene) return

  const obj = model.value.scene
  obj.position.set(...props.position)
  obj.rotation.set(...props.rotation)

  if (typeof props.scale === 'number') {
    obj.scale.setScalar(props.scale)
  } else {
    obj.scale.set(...props.scale)
  }
}

const initModel = async () => {
  isLoaded.value = false
  if (!props.path) return

  const gltf = await loadModel({
    path: props.path,
    onProgress: (event) => emit('progress', event),
    onError: (err) => {
      isLoaded.value = false
      emit('error', err)
    }
  })

  if (gltf) {
    model.value = gltf
    applyTransformations()

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new AnimationMixer(gltf.scene)
      setupMixerListeners()
      playAnimation(props.animation)
    }

    if (sceneContext?.scene && !sceneContext.scene.children.includes(gltf.scene)) {
      sceneContext.scene.add(gltf.scene)
    }

    isLoaded.value = true
    emit('load', gltf)
  }
}

const cleanupModel = () => {
  if (mixer) {
    mixer.stopAllAction()
    if (model.value?.scene) {
      mixer.uncacheRoot(model.value.scene)
    }
    mixer = null
  }

  if (model.value?.scene && sceneContext?.scene) {
    sceneContext.scene.remove(model.value.scene)
  }

  if (props.path && model.value?.scene) {
    releaseModel(props.path, model.value?.scene)
  }

  isLoaded.value = false
  model.value = null
  loopCount.value = 0
}

// Watchers
watch(() => props.animation, (newAnimName) => playAnimation(newAnimName))

watch(() => props.loopAnimation, (newLoopState) => {
  if (currentAction) {
    configureLoop(currentAction, newLoopState)
  }
})

watch(() => [props.position, props.rotation, props.scale], applyTransformations, { deep: true })

watch(() => props.path,
  async (newPath, oldPath) => {
    if (oldPath) cleanupModel()
    await initModel()
  }
)

onMounted(initModel)
onBeforeUnmount(cleanupModel)

defineExpose({
  playAnimation,
  mixer,
  currentAction
})
</script>