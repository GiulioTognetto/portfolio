import { ref } from 'vue'


export type SoundEffect = 'click' | 'pop' | 'hover' | 'success' | 'meow'

const SOUND_PATHS: Record<SoundEffect, string> = {
  click: '/sounds/bubble-click.wav',
  meow: '/sounds/cat-meow.wav',
  pop: '/sounds/pop.mp3',
  hover: '/sounds/hover.mp3',
  success: '/sounds/success.mp3'
}

const audioCache: Partial<Record<SoundEffect, HTMLAudioElement>> = {}

export function useSound() {
  const isMuted = ref(false)

  // Precarica un audio se non presente in cache
  const getAudioInstance = (effect: SoundEffect): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null // SSG / SSR Guard

    if (!audioCache[effect]) {
      const audio = new Audio(SOUND_PATHS[effect])
      audio.preload = 'auto'
      audioCache[effect] = audio
    }

    return audioCache[effect] || null
  }

  const playSound = (effect: SoundEffect = 'click', volume: number = 0.25) => {
    if (isMuted.value) return

    const sound = getAudioInstance(effect)
    if (sound) {
      // Clona o riavvia subito il suono se il bottone viene cliccato ripetutamente
      sound.currentTime = 0
      sound.volume = volume
      sound.play().catch(() => {
        // I browser bloccano l'autoplai se l'utente non ha ancora interagito con la pagina
      })
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
  }

  return {
    playSound,
    toggleMute,
    isMuted
  }
}