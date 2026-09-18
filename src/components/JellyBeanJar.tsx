import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { DayEntry } from '../lib/types';

interface Props {
  entries: DayEntry[];
  justAddedDate?: string | null;
}

/** Deterministic pseudo-random jitter per bean so the jar looks hand-poured, not gridded. */
function jitterFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const rot = ((hash % 40) - 20) * 0.6; // -12deg..12deg
  const rise = (hash >> 3) % 6; // 0..5px
  return { rot, rise };
}

export default function JellyBeanJar({ entries, justAddedDate }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length]);

  const isEmpty = entries.length === 0;

  return (
    <div className="jar-wrap">
      <div className="jar-lid" aria-hidden="true" />
      <div className="jar" aria-label={`Jelly bean jar with ${entries.length} beans`}>
        <div className="jar-shine" aria-hidden="true" />
        <div className="jar-beans" ref={scrollRef}>
          {isEmpty && <p className="jar-empty">Your jar is waiting for its first jelly bean.</p>}
          {entries.map((e) => {
            const { rot, rise } = jitterFor(e.date);
            const isNew = e.date === justAddedDate;
            return (
              <span
                key={e.date}
                className={`bean bean-${e.bean}${isNew ? ' bean-drop' : ''}`}
                style={{ rotate: `${rot}deg`, translate: `0 -${rise}px` } as CSSProperties}
                title={`${e.date}: ${e.bean}`}
              />
            );
          })}
        </div>
      </div>
      <div className="jar-base" aria-hidden="true" />
    </div>
  );
}
