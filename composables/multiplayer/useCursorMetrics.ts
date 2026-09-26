import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Traccia le metriche della finestra: dimensioni del documento, viewport e scroll.
 * Aggiorna i valori reattivi ad ogni scroll e resize.
 */
export function useCursorMetrics() {
  const windowScrollX = ref(0)
  const windowScrollY = ref(0)
  const documentWidth = ref(1)
  const documentHeight = ref(1)
  const viewportWidth = ref(1)
  const viewportHeight = ref(1)

  const update = () => {
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

  onMounted(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return {
    windowScrollX,
    windowScrollY,
    documentWidth,
    documentHeight,
    viewportWidth,
    viewportHeight,
    updateWindowMetrics: update,
  }
}
