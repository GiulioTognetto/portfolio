// @ts-ignore
import nitroApp from '../.output/server/index.mjs'

import { CursorTracker } from './durable-objects/CursorTracker'
import { type Env } from '../_cloudflare/env'

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    console.log(`[Worker] Request ricevuta: ${request.method} ${url.pathname}`)

    if (url.pathname === '/api/cursors') {
      const upgradeHeader = request.headers.get('Upgrade')

      if (upgradeHeader && upgradeHeader.toLowerCase().includes('websocket')) {
        const id = env.CURSOR_TRACKER.idFromName(`cursor-tracker`)
        const stub = env.CURSOR_TRACKER.get(id)
        return stub.fetch(request)
      }

      return new Response('Expected Upgrade: websocket', { status: 426 })
    }

    return nitroApp.fetch(request, env, ctx)
  }
}

export { CursorTracker }