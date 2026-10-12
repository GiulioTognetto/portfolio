<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none w-full h-full"
    :style="{
      opacity,
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
    }"
  />
</template>

<script setup lang="ts">
interface Props {
  /** Colore dei puntini (hex o css color) */
  dotColor?: string
  /** Spaziatura griglia in px */
  spacing?: number
  /** Raggio di ripulsione in px */
  repelRadius?: number
  /** Forza massima di ripulsione (px) */
  repelStrength?: number
  /** Velocità di ritorno alla posizione di riposo (0–1, es. 0.08) */
  returnSpeed?: number
  /** Raggio del puntino in px */
  dotRadius?: number
  /** Opacità globale del canvas */
  opacity?: number
  /** Applica una maschera ellittica centrale (come il CSS originale) */
  vignette?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dotColor: '#eb5e28',
  spacing: 36,
  repelRadius: 120,
  repelStrength: 28,
  returnSpeed: 0.08,
  dotRadius: 1.5,
  opacity: 0.15,
  vignette: true,
})

// ─── Stato canvas ─────────────────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)

/** Posizione corrente del mouse/touch relativa al canvas */
const mouse = { x: -9999, y: -9999 }

interface Dot {
  /** Posizione di riposo */
  ox: number
  oy: number
  /** Posizione corrente (con displacement) */
  x: number
  y: number
  /** Velocità corrente (per smoothing) */
  vx: number
  vy: number
}

let dots: Dot[] = []
let rafId = 0
let ctx: CanvasRenderingContext2D | null = null

// ─── Costruzione griglia ───────────────────────────────────────────────────────

const buildGrid = (w: number, h: number) => {
  dots = []
  const { spacing } = props
  const cols = Math.ceil(w / spacing) + 1
  const rows = Math.ceil(h / spacing) + 1
  // Centriamo la griglia
  const offsetX = (w - (cols - 1) * spacing) / 2
  const offsetY = (h - (rows - 1) * spacing) / 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ox = offsetX + c * spacing
      const oy = offsetY + r * spacing
      dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 })
    }
  }
}

// ─── Loop di rendering ─────────────────────────────────────────────────────────

// Funzione per risolvere le variabili CSS (es. var(--color-xxx)) nel loro valore effettivo
const resolveCssColor = (colorValue: string, element: HTMLElement | null): string => {
  if (!colorValue.startsWith('var(')) return colorValue
  
  // Estrae il nome della variabile, es. "--color-primary-50" da "var(--color-primary-50)"
  const match = colorValue.match(/var\(([^)]+)\)/)
  if (!match) return colorValue
  
  const variableName = match[1] ?? ''.trim()
  const targetElement = element || document.documentElement
  const resolved = getComputedStyle(targetElement).getPropertyValue(variableName).trim()
  
  return resolved || colorValue
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return

  const { repelRadius, repelStrength, returnSpeed, dotRadius, dotColor, vignette } = props
  const w = canvas.width
  const h = canvas.height

  ctx.clearRect(0, 0, w, h)

  // Vignette mask via globalCompositeOperation
  if (vignette) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.55)
    grad.addColorStop(0, 'rgba(0,0,0,1)')
    grad.addColorStop(0.7, 'rgba(0,0,0,1)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    // salviamo il gradiente per applicarlo dopo via clip/alpha
    // Usiamo globalAlpha per il fade perimetrale in modo semplice
  }

  ctx.fillStyle = resolveCssColor(dotColor, canvas)

  const r2 = repelRadius * repelRadius

  for (const dot of dots) {
    // Forza di ripulsione
    const dx = dot.ox - mouse.x
    const dy = dot.oy - mouse.y
    const dist2 = dx * dx + dy * dy

    let targetX = dot.ox
    let targetY = dot.oy

    if (dist2 < r2 && dist2 > 0) {
      const dist = Math.sqrt(dist2)
      const factor = (1 - dist / repelRadius) // 1 al centro, 0 al bordo
      const push = factor * repelStrength
      targetX = dot.ox + (dx / dist) * push
      targetY = dot.oy + (dy / dist) * push
    }

    // Spring verso target (smorzamento esponenziale)
    dot.vx += (targetX - dot.x) * returnSpeed
    dot.vy += (targetY - dot.y) * returnSpeed
    dot.vx *= 0.72  // damping
    dot.vy *= 0.72
    dot.x += dot.vx
    dot.y += dot.vy

    // Vignette: riproduce mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]
    // Il CSS originale usava x-radius = 60% della larghezza, y-radius = 50% dell'altezza
    let alpha = 1
    if (vignette) {
      const cx = w / 2
      const cy = h / 2
      // Coordiante normalizzate rispetto ai radii dell'ellisse (1 = bordo ellisse)
      const ex = (dot.x - cx) / (w * 0.6)
      const ey = (dot.y - cy) / (h * 0.5)
      const d = Math.sqrt(ex * ex + ey * ey) // 0 al centro, 1 al bordo ellisse
      // Solid fino a 0.7, poi fade lineare fino a 1.0 (transparent) — identico al CSS
      if (d >= 1) alpha = 0
      else if (d > 0.7) alpha = 1 - (d - 0.7) / 0.3
    }

    if (alpha <= 0) continue
    ctx.globalAlpha = alpha

    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  rafId = requestAnimationFrame(draw)
}

// ─── Resize ───────────────────────────────────────────────────────────────────

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Risaliamo il DOM cercando il primo antenato posizionato con dimensioni > 0
  // (salta il wrapper <div> di <ClientOnly> che è position:static e senza size)
  let w = 0
  let h = 0
  let el: HTMLElement | null = canvas.parentElement
  while (el && el !== document.documentElement) {
    const style = getComputedStyle(el)
    if (style.position !== 'static' && el.clientWidth > 0 && el.clientHeight > 0) {
      w = el.clientWidth
      h = el.clientHeight
      break
    }
    el = el.parentElement
  }
  // Fallback: dimensioni del viewport
  if (w === 0) w = window.innerWidth
  if (h === 0) h = window.innerHeight

  // Impostiamo ESPLICITAMENTE sia lo stile CSS sia il buffer di disegno
  canvas.style.width  = `${w}px`
  canvas.style.height = `${h}px`
  canvas.width  = w
  canvas.height = h

  buildGrid(w, h)
}

// ─── Event listeners ──────────────────────────────────────────────────────────

const onMouseMove = (e: MouseEvent) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

const onTouchMove = (e: TouchEvent) => {
  const canvas = canvasRef.value
  if (!canvas || !e.touches[0]) return
  const rect = canvas.getBoundingClientRect()
  mouse.x = e.touches[0].clientX - rect.left
  mouse.y = e.touches[0].clientY - rect.top
}

const onMouseLeave = () => {
  mouse.x = -9999
  mouse.y = -9999
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

let ro: ResizeObserver | null = null

onMounted(async () => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  await nextTick()
  resize()

  // Trova il container posizionato con dimensioni reali per il ResizeObserver
  let container: HTMLElement = document.documentElement
  let el: HTMLElement | null = canvas.parentElement
  while (el && el !== document.documentElement) {
    const style = getComputedStyle(el)
    if (style.position !== 'static' && el.clientWidth > 0) {
      container = el
      break
    }
    el = el.parentElement
  }
  ro = new ResizeObserver(() => resize())
  ro.observe(container)

  // Mouse/touch sul window: il canvas è pointer-events-none, non emette eventi propri
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('touchmove', onTouchMove as EventListener, { passive: true })
  window.addEventListener('mouseleave', onMouseLeave, { passive: true })
  window.addEventListener('resize', resize, { passive: true })

  draw()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('touchmove', onTouchMove as EventListener)
  window.removeEventListener('mouseleave', onMouseLeave)
  window.removeEventListener('resize', resize)
})
</script>
