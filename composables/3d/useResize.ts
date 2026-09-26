import { inject, onUnmounted } from 'vue'

type ResizeCallback = (size: { width: number; height: number }) => void

interface ViewerContext {
  registerResize: (cb: ResizeCallback) => void
  unregisterResize: (cb: ResizeCallback) => void
  viewportSize?: { width: number; height: number }
}

export function useResize(callback: ResizeCallback) {
  const context = inject<ViewerContext | null>('viewerContext', null)

  if (!context) {
    console.warn('[useResize] viewerContext non trovato.')
    return
  }

  context.registerResize(callback)

  if (context.viewportSize) {
    callback(context.viewportSize)
  }

  onUnmounted(() => {
    context.unregisterResize(callback)
  })
}