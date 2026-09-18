<template>
  <div class="pointer-events-none fixed inset-0 z-100 overflow-hidden">
    <!-- Renderizza i cursori degli altri utenti sulla stessa rotta -->
    <TransitionGroup name="cursor">
      <div
        v-for="(cursor, id) in renderableCursors"
        :key="id"
        class="absolute left-0 top-0 transition-transform ease-out will-change-transform duration-75"
        :style="{ transform: `translate3d(${cursor.screenX}px, ${cursor.screenY}px, 0)` }"
      >
        <!-- RENDERING MOBILE: Cerchio Tap-Target semitrasparente -->
        <template v-if="cursor.isMobile">
          <div class="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div
              class="absolute h-8 w-8 rounded-full animate-ping opacity-30"
              :style="{ backgroundColor: cursor.color || '#3b82f6' }"
            />
            
            <div
              class="h-7 w-7 rounded-full border-2 shadow-lg backdrop-blur-[2px] transition-transform duration-75"
              :style="{
                borderColor: cursor.color || '#3b82f6',
                backgroundColor: getMobileCircleBg(cursor.color),
                boxShadow: `0 0 12px ${getMobileCircleBg(cursor.color)}`
              }"
            >
              <div
                class="absolute inset-0 m-auto h-2 w-2 rounded-full shadow-sm"
                :style="{ backgroundColor: cursor.color || '#3b82f6' }"
              />
            </div>

            <!-- Badge con Avatar DiceBear (Mobile) -->
            <div
              class="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-md backdrop-blur-md border border-white/20 select-none whitespace-nowrap"
              :style="{ backgroundColor: getBadgeBg(cursor.color) }"
            >
              <img 
                :src="getDicebearUrl(id)" 
                alt="Avatar" 
                class="w-4 h-4 rounded-full bg-white/25 object-cover"
              />
              <span class="font-mono tracking-tight">{{ id }}</span>
            </div>
          </div>
        </template>

        <!-- RENDERING DESKTOP: Freccia SVG Figma-style -->
        <template v-else>
          <svg
            class="h-6 w-6 -rotate-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] select-none"
            viewBox="0 0 24 24"
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500001 16.8829L0.500001 1.19841L17.7841 12.3673H5.65376Z"
              :fill="cursor.color || '#3b82f6'"
              stroke="#ffffff"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
          </svg>

          <!-- Badge con Avatar DiceBear (Desktop) -->
          <div
            class="ml-4 -mt-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-md transition-all duration-150 border border-white/20 select-none"
            :style="{ backgroundColor: getBadgeBg(cursor.color) }"
          >
            <img 
              :src="getDicebearUrl(id)" 
              alt="Avatar" 
              class="w-5 h-5 rounded-full bg-white/25 object-cover"
            />

            <span class="font-mono tracking-tight">{{ id }}</span>
          </div>
        </template>

      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const router = useRouter()
const getRouteBaseName = useRouteBaseName()

interface RemoteCursor {
  x: number 
  y: number 
  color: string
  route: string
  isMobile?: boolean
}

interface RenderableCursor extends RemoteCursor {
  screenX: number
  screenY: number
}

const route = useRoute()

const CURSOR_UPDATE_RATE_MS = 30

const remoteCursors = ref<Record<string, RemoteCursor>>({})
let ws: WebSocket | null = null
let myColor = '#ffffff'
let myId = ''
let isInitialized = false
let lastSend = 0
let isCurrentDeviceMobile = false

let lastPointerPageX = 0
let lastPointerPageY = 0

const windowScrollX = ref(0)
const windowScrollY = ref(0)
const documentWidth = ref(1)
const documentHeight = ref(1)
const viewportWidth = ref(1)
const viewportHeight = ref(1)

const updateWindowMetrics = () => {
  if (!import.meta.client) return
  windowScrollX.value = window.scrollX || window.pageXOffset || 0
  windowScrollY.value = window.scrollY || window.pageYOffset || 0
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
  
  documentWidth.value = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    window.innerWidth
  )
  documentHeight.value = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight
  )
}

// Generatore URL DiceBear basato sull'ID utente (seed)
const getDicebearUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/critters/svg?seed=${encodeURIComponent(seed)}`
}

const renderableCursors = computed(() => {
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

const getMobileCircleBg = (colorHex?: string) => {
  const hex = (colorHex || '#3b82f6').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 59
  const g = parseInt(hex.substring(2, 4), 16) || 130
  const b = parseInt(hex.substring(4, 6), 16) || 246
  return `rgba(${r}, ${g}, ${b}, 0.25)`
}

const getBadgeBg = (colorHex?: string) => {
  const hex = (colorHex || '#3b82f6').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 59
  const g = parseInt(hex.substring(2, 4), 16) || 130
  const b = parseInt(hex.substring(4, 6), 16) || 246
  return `rgba(${r}, ${g}, ${b}, 0.85)`
}

const sendPosition = (pageX: number, pageY: number, force = false) => {
  if (!isInitialized || !ws || ws.readyState !== WebSocket.OPEN) return

  const now = Date.now()
  if (!force && now - lastSend < CURSOR_UPDATE_RATE_MS) return
  lastSend = now

  lastPointerPageX = pageX
  lastPointerPageY = pageY

  const docW = Math.max(
    document.documentElement.scrollWidth,
    document.body.scrollWidth,
    window.innerWidth
  )
  const docH = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
    window.innerHeight
  )

  const x = Number(((pageX / docW) * 100).toFixed(3))
  const y = Number(((pageY / docH) * 100).toFixed(3))

  ws.send(
    JSON.stringify({
      type: 'move',
      x,
      y,
      color: myColor,
      route: route.path,
      isMobile: isCurrentDeviceMobile
    })
  )
}

const handleMouseMove = (e: MouseEvent) => {
  sendPosition(e.pageX, e.pageY)
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    if (touch) sendPosition(touch.pageX, touch.pageY)
  }
}

const handleScroll = () => {
  updateWindowMetrics()
  if (lastPointerPageX || lastPointerPageY) {
    sendPosition(lastPointerPageX, lastPointerPageY)
  }
}

watch(
  () => route.path,
  () => {
    if (!import.meta.client) return
    nextTick(() => {
      updateWindowMetrics()
      if (lastPointerPageX || lastPointerPageY) {
        sendPosition(lastPointerPageX, lastPointerPageY, true)
      }
    })
  }
)

onMounted(() => {
  updateWindowMetrics()
  
  window.addEventListener('resize', updateWindowMetrics, { passive: true })
  window.addEventListener('scroll', handleScroll, { passive: true })

  isCurrentDeviceMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  const deviceType = isCurrentDeviceMobile ? 'mobile' : 'desktop'

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/api/cursors`

  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws?.send(JSON.stringify({ type: 'init-requested' }))
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'init') {
        myColor = data.color
        myId = data.id
        isInitialized = true
      } else if (data.type === 'update') {
        if (data.id === myId) return

        remoteCursors.value = {
          ...remoteCursors.value,
          [data.id]: {
            x: data.x,
            y: data.y,
            color: data.color,
            route: data.route || '/',
            isMobile: data.isMobile ?? (deviceType === 'mobile')
          },
        }
      } else if (data.type === 'leave') {
        const updated = { ...remoteCursors.value }
        delete updated[data.id]
        remoteCursors.value = updated
      }
    } catch (e) {
      console.error('Errore parsing WS:', e)
    }
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: true })
  window.addEventListener('touchstart', handleTouchMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowMetrics)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
  window.removeEventListener('touchstart', handleTouchMove)
  if (ws) {
    ws.close()
  }
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