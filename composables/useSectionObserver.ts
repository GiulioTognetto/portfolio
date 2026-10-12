import { onUnmounted } from 'vue'

// 1. Stato globale reattivo condiviso tra tutte le chiamate del composable
export function useSectionObserver() {
  const activeHash = useState<string | null>('active-section-hash', () => null)

  // Variabili di istanza per il blocco click
  const isClickScrolling = useState<boolean>('is-click-scrolling', () => false)
  let clickTimeout: ReturnType<typeof setTimeout> | null = null
  let observer: IntersectionObserver | null = null

  // Sincronizza l'hash e la storia dell'URL
  const updateHash = (newHash: string) => {
    activeHash.value = newHash
    const newUrl = newHash
      ? `${window.location.pathname}${newHash}`
      : window.location.pathname

    if (window.location.hash !== newHash) {
      window.history.replaceState({ ...history.state }, '', newUrl)
    }
  }

  // Sblocca/Blocca temporaneamente l'observer ai click nei link del menu
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

  // 2. Metodo per inizializzare l'observer (da chiamare SOLO nel layout o nella pagina principale)
  const initObserver = (
    sectionIds: string[],
    threshold: number = 0.0,
    rootMargin: string = '-20% 0px -60% 0px'
  ) => {
    onMounted(() => {
      // Inizializza l'hash al caricamento della pagina
      if (window.location.hash) {
        activeHash.value = window.location.hash
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