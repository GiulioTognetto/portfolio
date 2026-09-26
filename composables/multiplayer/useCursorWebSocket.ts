import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const CURSOR_UPDATE_RATE_MS = 30

export interface RemoteCursor {
  x: number
  y: number
  color: string
  route: string
  isMobile?: boolean
}

interface SendPositionOptions {
  /** Pagina corrente (route.path) */
  currentPath: string
  /** Dimensione documento corrente */
  getDocumentSize: () => { width: number; height: number }
  /** Forza l'invio anche se non è passato il rate limit */
  force?: boolean
}

/**
 * Gestisce la connessione WebSocket per il sistema di cursori multiplayer.
 * Si occupa di: handshake init, invio posizione, ricezione aggiornamenti e leave.
 */
export function useCursorWebSocket() {
  const remoteCursors = ref<Record<string, RemoteCursor>>({})

  let ws: WebSocket | null = null
  let myColor = '#ffffff'
  let myId = ''
  let isInitialized = false
  let lastSend = 0
  let lastPointerPageX = 0
  let lastPointerPageY = 0
  let isCurrentDeviceMobile = false

  const sendPosition = (pageX: number, pageY: number, options: SendPositionOptions) => {
    const { currentPath, getDocumentSize, force = false } = options
    if (!isInitialized || !ws || ws.readyState !== WebSocket.OPEN) return

    const now = Date.now()
    if (!force && now - lastSend < CURSOR_UPDATE_RATE_MS) return
    lastSend = now

    lastPointerPageX = pageX
    lastPointerPageY = pageY

    const { width: docW, height: docH } = getDocumentSize()
    const x = Number(((pageX / docW) * 100).toFixed(3))
    const y = Number(((pageY / docH) * 100).toFixed(3))

    ws.send(
      JSON.stringify({
        type: 'move',
        x,
        y,
        color: myColor,
        route: currentPath,
        isMobile: isCurrentDeviceMobile,
      })
    )
  }

  const resendLastPosition = (options: Omit<SendPositionOptions, 'force'>) => {
    if (lastPointerPageX || lastPointerPageY) {
      sendPosition(lastPointerPageX, lastPointerPageY, { ...options, force: true })
    }
  }

  const connect = (route: ReturnType<typeof useRoute>) => {
    if (!import.meta.client) return

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
              isMobile: data.isMobile ?? (deviceType === 'mobile'),
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
  }

  const disconnect = () => {
    ws?.close()
    ws = null
  }

  return {
    remoteCursors,
    sendPosition,
    resendLastPosition,
    connect,
    disconnect,
    getIsCurrentDeviceMobile: () => isCurrentDeviceMobile,
  }
}
