import { useEffect, useState } from 'react'
import { stillSrc, type ViewId } from '@/workshop/views'
import styles from './Stage.module.css'

export type StillId = ViewId

/** The still that matches a stage state. Only the overview has a lights-off render. */
export const stillFor = (view: ViewId, lights: boolean): StillId => (view === 'overview' && !lights ? 'overviewOff' : view)

interface StillViewProps {
  id: StillId
  /** Stills to keep mounted (current, previously seen, and ones about to be asked for). */
  warm: ReadonlySet<StillId>
  /** The first frame of the page: eager, high priority. */
  hero?: boolean
}

/**
 * Pre-rendered views of the car (blender/scripts/render_workshop_stills.py), cross-faded.
 * Used as the first paint of every tier, and as the whole experience in the Static tier.
 */
export function StillView({ id, warm, hero }: StillViewProps) {
  const [loaded, setLoaded] = useState<ReadonlySet<StillId>>(new Set())
  // Keep showing the previous still until the requested one has arrived, so a slow image never flashes blank.
  const [shown, setShown] = useState<StillId>(id)
  useEffect(() => {
    if (loaded.has(id)) setShown(id)
  }, [id, loaded])
  const ids = [...new Set<StillId>([...warm, id, shown])]
  return (
    <div className={styles.stills} aria-hidden="true">
      {ids.map((v) => (
        <img
          key={v}
          className={styles.still}
          data-active={v === shown && loaded.has(v) ? '' : undefined}
          src={stillSrc(v)}
          srcSet={`${stillSrc(v, true)} 800w, ${stillSrc(v)} 1600w`}
          sizes="(max-width: 720px) 100vw, 100vw"
          width={1600}
          height={900}
          alt=""
          decoding="async"
          loading={hero && v === 'overview' ? 'eager' : 'lazy'}
          fetchPriority={hero && v === 'overview' ? 'high' : 'auto'}
          onLoad={() => setLoaded((s) => (s.has(v) ? s : new Set(s).add(v)))}
        />
      ))}
    </div>
  )
}
