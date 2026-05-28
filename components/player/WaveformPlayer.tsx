"use client";

import { useRef, useMemo, useCallback } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { WaveformPlayerProps } from "@/types";
import { formatDuration } from "@/lib/mock-data";

export default function WaveformPlayer({ track }: WaveformPlayerProps) {
  const containerRef = useRef(null);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 60,
    waveColor: "#6b7280",
    progressColor: "#a855f7",
    url: track.audioUrl,
  });

  const onPlayPause = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} />
      <div className="flex items-center justify-between text-sm">
        <button onClick={onPlayPause}>{isPlaying ? "Pause" : "Play"}</button>
        <span>
          {formatDuration(Math.floor(currentTime))} /{" "}
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
