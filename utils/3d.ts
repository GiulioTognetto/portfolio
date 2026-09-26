import type { VNode } from 'vue'

/**
 * Srotola i VNode gestendo Fragment (v-for / v-if) e slot nidificati
 */
export const flattenVNodes = (vnodes: VNode[]): VNode[] => {
  const result: VNode[] = []

  for (const vnode of vnodes) {
    if (!vnode) continue

    // 1. Se è un Fragment (es. generato da v-for o v-if)
    if (typeof vnode.type === 'symbol' && Array.isArray(vnode.children)) {
      result.push(...flattenVNodes(vnode.children as VNode[]))
    } 
    // 2. Se ha uno slot default (es. componenti wrapper intermedi)
    else if (
      vnode.children && 
      typeof vnode.children === 'object' && 
      'default' in vnode.children && 
      typeof vnode.children.default === 'function'
    ) {
      try {
        const childVNodes = vnode.children.default()
        if (Array.isArray(childVNodes)) {
          result.push(...flattenVNodes(childVNodes))
        }
      } catch {
        // Ignora slot non eseguibili a runtime
        result.push(vnode)
      }
    } 
    // 3. Nodo standard
    else {
      result.push(vnode)
    }
  }

  return result
}

/**
 * Ritorna la scena attiva dagli slot.
 * Cerca la prima scena con prop `active` a true, altrimenti ritorna la prima scena disponibile.
 */
export const getActiveScene = (vnodes: VNode[]): VNode | undefined => {
  const sceneNames = ['Scene']
  
  // 1. Filtra solo i VNode che sono delle Scene
  const scenes = flattenVNodes(vnodes).filter((vn) => {
    if (!vn.type || typeof vn.type !== 'object') return false
    const type = vn.type as any
    const name = type.name || type.__name || ''
    return sceneNames.includes(name)
  })

  if (scenes.length === 0) return undefined

  // 2. Trova la scena marcata explicitamente come attiva (props.active === true o prop booleana senza valore)
  const explicitActive = scenes.find((scene) => {
    const activeProp = scene.props?.active
    return activeProp === true || activeProp === ''
  })

  // 3. Ritorna quella attiva, oppure la prima di default
  return explicitActive || scenes[0]
}

export const getActiveCamera = (vnodes: VNode[]): VNode | undefined => {
  const cameraNames = ['Camera']
  const flatNodes = flattenVNodes(vnodes)
  
  // 1. Filtra tutti i VNode che sono delle Camera
  const cameras = flatNodes.filter((vn) => {
    if (!vn.type || typeof vn.type !== 'object') return false
    const type = vn.type as any
    const name = type.name || type.__name || ''
    return cameraNames.includes(name)
  })

  if (cameras.length === 0) return undefined

  // 2. Cerca la prima camera esplicitamente attiva (active="true" o prop booleana :active)
  const explicitActive = cameras.find((cam) => {
    const activeProp = cam.props?.active
    return activeProp === true || activeProp === ''
  })

  // 3. Ritorna quella attiva, oppure la prima trovata come fallback
  return explicitActive || cameras[0]
}

export const getModels = (vnodes: VNode[]): VNode[] => {
  const modelNames = ['Model']
  const flatNodes = flattenVNodes(vnodes)

  return flatNodes.filter((vn) => {
    if (!vn.type || typeof vn.type !== 'object') return false
    const type = vn.type as any
    const name = type.name || type.__name || ''
    return modelNames.includes(name)
  })
}