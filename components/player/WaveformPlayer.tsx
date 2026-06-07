'use client'

import { useRef, useCallback, useMemo } from 'react'
import { useWavesurfer } from '@wavesurfer/react'
import { Tables } from '@/types/database'

type Track = Tables<'tracks'>

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function WaveformPlayer({ track }: { track: Track }) {
  const containerRef = useRef<HTMLDivElement>(null)

  const peaks = useMemo(
    () => (track.waveform_peaks ? [track.waveform_peaks as number[]] : undefined),
    [track.waveform_peaks]
  )

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 36,
    waveColor: 'rgba(255,255,255,0.2)',
    progressColor: '#a855f7',
    url: track.audio_url ?? '',
    peaks,
    normalize: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
    fillParent: true,
    dragToSeek: true,
    cursorWidth: 1,
  })

  const onPlayPause = useCallback(() => wavesurfer?.playPause(), [wavesurfer])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPlayPause}
        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 hover:bg-zinc-200 transition text-xs"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div ref={containerRef} className="flex-1 min-w-0" />
      <span className="text-xs text-zinc-500 tabular-nums flex-shrink-0">{fmt(currentTime)}</span>
    </div>
  )
}
