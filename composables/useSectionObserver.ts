import { onUnmounted, onMounted } from 'vue'

export function useSectionObserver() {
  const activeHash = useState<string | null>('active-section-hash', () => null)
  const isClickScrolling = useState<boolean>('is-click-scrolling', () => false)
  let clickTimeout: ReturnType<typeof setTimeout> | null = null
  let observer: IntersectionObserver | null = null

  const updateHash = (newHash: string) => {
    activeHash.value = newHash
    const newUrl = newHash
      ? `${window.location.pathname}${newHash}`
      : window.location.pathname

    if (window.location.hash !== newHash) {
      window.history.replaceState({ ...history.state }, '', newUrl)
    }
  }

  const lockObserverTemporarily = (targetHash?: string) => {
    isClickScrolling.value = true

    if (targetHash !== undefined) {
      updateHash(targetHash.replace("/", ""))
    }

    if (clickTimeout) clearTimeout(clickTimeout)
    clickTimeout = setTimeout(() => {
      isClickScrolling.value = false
    }, 800)
  }

  const initObserver = (
    sectionIds: string[],
    threshold: number = 0.0,
    rootMargin: string = '-20% 0px -60% 0px'
  ) => {
    onMounted(() => {
      // 1. Gestione dell'hash iniziale all'atterraggio sulla pagina
      if (window.location.hash) {
        activeHash.value = window.location.hash
        // Forza lo scroll alla sezione se presente nell'URL
        setTimeout(() => {
          const el = document.querySelector(window.location.hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (isClickScrolling.value) return

          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id
              const newHash = id && id !== 'hero' ? `#${id}` : ''

              if (activeHash.value !== newHash) {
                updateHash(newHash)
              }
            }
          })
        },
        { rootMargin, threshold }
      )

      sectionIds.forEach((id) => {
        const el = document.getElementById(id)
        if (el) observer?.observe(el)
      })
    })

    onUnmounted(() => {
      if (observer) observer.disconnect()
      if (clickTimeout) clearTimeout(clickTimeout)
    })
  }

  return {
    activeHash,
    lockObserverTemporarily,
    initObserver
  }
}