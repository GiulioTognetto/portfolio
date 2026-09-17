import { DurableObject } from 'cloudflare:workers'

interface AttachmentData {
  userId: string
  color: string
}

interface CursorState {
  x: number
  y: number
  color: string
  route: string
  isMobile: boolean
}

export class CursorTracker extends DurableObject {
  private positions = new Map<string, CursorState>()

  override async fetch(request: Request): Promise<Response> {
    console.log('[CursorTracker] Request ricevuta in fetch():', request.url, request.method)

    const upgradeHeader = request.headers.get('Upgrade')

    if (!upgradeHeader || !upgradeHeader.toLowerCase().includes('websocket')) {
      console.warn('[CursorTracker] Header WebSocket mancante o non valido. Annullamento.')
      return new Response('Attesa connessione WebSocket', { status: 426 })
    }

    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    if (!server) {
      console.error('[CursorTracker] Fallita la creazione del WebSocketPair server.')
      return new Response('Errore nella creazione del WebSocket', { status: 500 })
    }

    const userId = Math.random().toString(36).substring(2, 9)
    const color = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`

    const attachment: AttachmentData = { userId, color }
    server.serializeAttachment(attachment)

    try {
      this.ctx.acceptWebSocket(server)
    } catch (err) {
      console.error('[CursorTracker] Errore durante acceptWebSocket():', err)
      return new Response('Errore interno accettazione socket', { status: 500 })
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }

  override async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== 'string') return

    const session = ws.deserializeAttachment() as AttachmentData | null
    if (!session) return

    try {
      const data = JSON.parse(message)

      // 1. Init-Requested
      if (data.type === 'init-requested') {
        ws.send(
          JSON.stringify({
            type: 'init',
            id: session.userId,
            color: session.color,
          })
        )

        // Invia lo stato degli altri solo se presenti
        for (const [id, state] of this.positions.entries()) {
          if (id !== session.userId) {
            ws.send(
              JSON.stringify({
                type: 'update',
                id,
                ...state,
              })
            )
          }
        }
        return
      }

      // 2. Move
      if (data.type === 'move') {
        // Salva sempre la posizione in RAM per i futuri utenti che entreranno
        this.positions.set(session.userId, {
          x: data.x,
          y: data.y,
          color: data.color || session.color,
          route: data.route,
          isMobile: data.isMobile,
        })

        // CONTROLLO: Procedi col broadcast solo se ci sono almeno 2 client connessi
        const activeSockets = this.ctx.getWebSockets()
        if (activeSockets.length < 2) {
          return
        }

        const payload = JSON.stringify({
          type: 'update',
          id: session.userId,
          x: data.x,
          y: data.y,
          color: data.color || session.color,
          route: data.route,
          isMobile: data.isMobile,
        })

        for (const clientWs of activeSockets) {
          if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(payload)
          }
        }
      }
    } catch (e) {
      console.error(`[CursorTracker] Errore JSON parsing per User [${session.userId}]:`, e)
    }
  }

  override async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const session = ws.deserializeAttachment() as AttachmentData | null
    if (!session) return

    this.positions.delete(session.userId)

    const activeSockets = this.ctx.getWebSockets()
    // Notifica la chiusura agli altri solo se è rimasto qualcuno in ascolto
    if (activeSockets.length > 0) {
      const payload = JSON.stringify({
        type: 'leave',
        id: session.userId,
      })

      for (const clientWs of activeSockets) {
        if (clientWs !== ws && clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(payload)
        }
      }
    }
  }

  override async webSocketError(ws: WebSocket, error: unknown) {
    const session = ws.deserializeAttachment() as AttachmentData | null
    if (session) {
      this.positions.delete(session.userId)
    }
  }
}