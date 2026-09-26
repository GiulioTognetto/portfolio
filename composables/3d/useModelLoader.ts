import * as THREE from 'three'
import { SkeletonUtils } from 'three/examples/jsm/Addons.js'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface LoadModelOptions {
  path: string
  onLoad?: (gltf: GLTF) => void
  onProgress?: (event: ProgressEvent<EventTarget>) => void
  onError?: (error: unknown) => void
}

interface CacheEntry {
  promise: Promise<GLTF | null>
  refCount: number
}

export interface UseModelLoaderReturn {
  loadModel: (options: LoadModelOptions) => Promise<GLTF | null>
  releaseModel: (path: string, instanceScene: THREE.Group | null) => Promise<void>
  clearModel: (path: string) => Promise<void>
  clearAll: () => Promise<void>
  disposeScene: (scene: THREE.Object3D) => void
}

// Map globale condisa tra tutte le istanze del composable
const cache = new Map<string, CacheEntry>()
const loader = new GLTFLoader()

/**
 * Libera geometrie, materiali e relative texture dalla VRAM GPU
 */
const disposeScene = (obj: THREE.Object3D) => {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh

      // Disposizione geometria
      mesh.geometry?.dispose()

      // Disposizione materiali e texture collegate
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((mat) => {
          // Pulisce eventuali mappe/texture (map, normalMap, roughnessMap, ecc.)
          Object.keys(mat).forEach((key) => {
            const prop = (mat as unknown as Record<string, unknown>)[key]
            if (prop && typeof prop === 'object' && 'isTexture' in prop && prop.isTexture) {
              (prop as THREE.Texture).dispose()
            }
          })
          mat.dispose()
        })
      }
    }
  })
}

export const useModelLoader = (): UseModelLoaderReturn => {
  /**
   * Carica o recupera dalla cache un modello GLTF/GLB
   * Ritorna SEMPRE una copia clonata sicura per l'uso nella scena.
   */
  const loadModel = async ({ path, onLoad, onProgress, onError }: LoadModelOptions): Promise<GLTF | null> => {
    let entry = cache.get(path)

    if (!entry) {
      const promise = new Promise<GLTF | null>((resolve) => {
        loader.load(
          path,
          (gltf) => {
            onLoad?.(gltf)
            resolve(gltf)
          },
          (event) => {
            onProgress?.(event)
          },
          (error) => {
            console.error(`[useModelLoader] Errore caricamento modello (${path}):`, error)
            onError?.(error)
            cache.delete(path)
            resolve(null)
          }
        )
      })

      entry = { promise, refCount: 0 }
      cache.set(path, entry)
    }

    // Incrementiamo il riferimento dei componenti che usano questo path
    entry.refCount++

    const masterGltf = await entry.promise
    if (!masterGltf) return null

    // Restituiamo una copia clonata completa con SkeletonUtils
    return {
      ...masterGltf,
      scene: SkeletonUtils.clone(masterGltf.scene) as THREE.Group
    }
  }

  /**
   * Da chiamare all'unmount del singolo componente:
   * 1. Pulisce l'istanza clonata usata dal componente.
   * 2. Decrementa il contatore; se è 0 libera anche la risorsa master in cache.
   */
  const releaseModel = async (path: string, instanceScene: THREE.Group | null) => {
    // 1. Rimuove e smaltisce l'istanza locale clonata
    if (instanceScene) {
      if (instanceScene.parent) {
        instanceScene.parent.remove(instanceScene)
      }
      disposeScene(instanceScene)
    }

    // 2. Decrementa il reference count globale
    const entry = cache.get(path)
    if (!entry) return

    entry.refCount--

    // Se nessun altro componente sta usando il modello, svuota la VRAM master
    if (entry.refCount <= 0) {
      const masterGltf = await entry.promise
      if (masterGltf) {
        disposeScene(masterGltf.scene)
      }
      cache.delete(path)
    }
  }

  /**
   * Forza la rimozione di un modello specifico dalla cache indipendentemente dai riferimenti
   */
  const clearModel = async (path: string) => {
    const entry = cache.get(path)
    if (!entry) return

    const masterGltf = await entry.promise
    if (masterGltf) {
      disposeScene(masterGltf.scene)
    }
    cache.delete(path)
  }

  /**
   * Forza la pulizia di tutta la cache globale
   */
  const clearAll = async () => {
    const paths = Array.from(cache.keys())
    await Promise.all(paths.map((p) => clearModel(p)))
  }

  return {
    loadModel,
    releaseModel,
    clearModel,
    clearAll,
    disposeScene
  }
}