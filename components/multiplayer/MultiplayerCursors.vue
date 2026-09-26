<template>
  <div class="pointer-events-none fixed inset-0 z-100 overflow-hidden">
    <TransitionGroup name="cursor">
      <div
        v-for="(cursor, id) in renderableCursors"
        :key="id"
        class="absolute left-0 top-0 transition-transform ease-out will-change-transform duration-75"
        :style="{ transform: `translate3d(${cursor.screenX}px, ${cursor.screenY}px, 0)` }"
      >
        <CursorMobile
          v-if="cursor.isMobile"
          :user-id="String(id)"
          :color="cursor.color || '#3b82f6'"
        />
        <CursorDesktop
          v-else
          :user-id="String(id)"
          :color="cursor.color || '#3b82f6'"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import CursorMobile from './CursorMobile.vue'
import CursorDesktop from './CursorDesktop.vue'
import { useCursorMetrics } from '~/composables/multiplayer/useCursorMetrics.ts'
import { useCursorWebSocket } from '~/composables/multiplayer/useCursorWebSocket.ts'

const router = useRouter()
const getRouteBaseName = useRouteBaseName()
const route = useRoute()

// --- Metriche viewport / documento ---
const {
  windowScrollX,
  windowScrollY,
  documentWidth,
  documentHeight,
  viewportWidth,
  viewportHeight,
  updateWindowMetrics,
} = useCursorMetrics()

// --- WebSocket + stato cursori remoti ---
const { remoteCursors, sendPosition, resendLastPosition, connect, disconnect } =
  useCursorWebSocket()

/** Ritorna le dimensioni attuali del documento (usate dal composable WS per normalizzare) */
const getDocumentSize = () => ({
  width: documentWidth.value,
  height: documentHeight.value,
})

// --- Cursori calcolati: solo quelli visibili sulla rotta corrente ---
interface RenderableCursor {
  x: number
  y: number
  color: string
  route: string
  isMobile?: boolean
  screenX: number
  screenY: number
}

const renderableCursors = computed<Record<string, RenderableCursor>>(() => {
  const result: Record<string, RenderableCursor> = {}

  const docW = documentWidth.value
  const docH = documentHeight.value
  const sX = windowScrollX.value
  const sY = windowScrollY.value
  const vW = viewportWidth.value
  const vH = viewportHeight.value

  const currentBaseName = getRouteBaseName(route)

  for (const [id, cursor] of Object.entries(remoteCursors.value)) {
    const resolvedCursorRoute = router.resolve(cursor.route || '/')
    const cursorBaseName = getRouteBaseName(resolvedCursorRoute)

    if (cursorBaseName !== currentBaseName) continue

    const docX = (cursor.x / 100) * docW
    const docY = (cursor.y / 100) * docH
    const screenX = docX - sX
    const screenY = docY - sY

    const isVisible =
      screenX >= -50 &&
      screenX <= vW + 50 &&
      screenY >= -50 &&
      screenY <= vH + 50

    if (isVisible) {
      result[id] = {
        ...cursor,
        screenX: Math.round(screenX),
        screenY: Math.round(screenY),
      }
    }
  }

  return result
})

// --- Handlers input ---
const handleMouseMove = (e: MouseEvent) => {
  sendPosition(e.pageX, e.pageY, { currentPath: route.path, getDocumentSize })
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    if (touch) sendPosition(touch.pageX, touch.pageY, { currentPath: route.path, getDocumentSize })
  }
}

const handleScroll = () => {
  updateWindowMetrics()
  resendLastPosition({ currentPath: route.path, getDocumentSize })
}

// Aggiorna metriche e risincronizza posizione ad ogni cambio di rotta
watch(
  () => route.path,
  () => {
    if (!import.meta.client) return
    nextTick(() => {
      updateWindowMetrics()
      resendLastPosition({ currentPath: route.path, getDocumentSize })
    })
  }
)

onMounted(() => {
  // Dati fittizi in sviluppo per simulare utenti attivi
  if (import.meta.dev) {
    setTimeout(() => {
      remoteCursors.value['test-user-99'] = { x: 45, y: 30, color: '#ec4899', route: route.path, isMobile: false }
      remoteCursors.value['test-user-100'] = { x: 65, y: 15, color: '#ec4899', route: route.path, isMobile: true }
      remoteCursors.value['test-user-101'] = { x: 17, y: 7, color: '#ec4899', route: route.path, isMobile: false }
      remoteCursors.value['test-user-102'] = { x: 50, y: 3, color: '#ec4899', route: route.path, isMobile: false }
    }, 500)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('touchstart', handleTouchMove, { passive: true })

  connect(route)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchstart', handleTouchMove)
  disconnect()
})
</script>

<style scoped>
.cursor-enter-active,
.cursor-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cursor-enter-from,
.cursor-leave-to {
  opacity: 0;
  transform: scale(0.4) translate3d(0, 0, 0);
}
</style>
