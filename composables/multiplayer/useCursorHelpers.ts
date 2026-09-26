/**
 * Utility helpers per il rendering dei cursori multiplayer.
 */

/** Genera l'URL avatar DiceBear basato su un seed (ID utente) */
export const getDicebearUrl = (seed: string): string => {
  return `https://api.dicebear.com/10.x/critters/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

/** Converte un colore hex in rgba con alpha 0.25 (sfondo cerchio mobile) */
export const getMobileCircleBg = (colorHex?: string): string => {
  const hex = (colorHex || '#3b82f6').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 59
  const g = parseInt(hex.substring(2, 4), 16) || 130
  const b = parseInt(hex.substring(4, 6), 16) || 246
  return `rgba(${r}, ${g}, ${b}, 0.25)`
}

/** Converte un colore hex in rgba con alpha 0.85 (sfondo badge avatar) */
export const getBadgeBg = (colorHex?: string): string => {
  const hex = (colorHex || '#3b82f6').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 59
  const g = parseInt(hex.substring(2, 4), 16) || 130
  const b = parseInt(hex.substring(4, 6), 16) || 246
  return `rgba(${r}, ${g}, ${b}, 0.85)`
}
