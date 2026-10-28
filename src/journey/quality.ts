import { createContext, useContext } from 'react'

export interface Quality {
  reflections: boolean
  reflectionRes: number
  dpr: [number, number]
  /** Fewer slats / fins / lights on phones. */
  detail: 'high' | 'low'
}

export const HIGH: Quality = { reflections: true, reflectionRes: 512, dpr: [1, 1.75], detail: 'high' }
export const LOW: Quality = { reflections: false, reflectionRes: 256, dpr: [1, 1.25], detail: 'low' }

export const QualityContext = createContext<Quality>(HIGH)
export const useQuality = () => useContext(QualityContext)
