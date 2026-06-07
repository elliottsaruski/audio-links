export async function extractPeaks(file: File, numPeaks = 200): Promise<number[]> {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new AudioContext()
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    const data = audioBuffer.getChannelData(0)
    const blockSize = Math.floor(data.length / numPeaks)
    const peaks: number[] = []
    for (let i = 0; i < numPeaks; i++) {
      let max = 0
      for (let j = 0; j < blockSize; j++) {
        const v = Math.abs(data[i * blockSize + j]!)
        if (v > max) max = v
      }
      peaks.push(parseFloat(max.toFixed(3)))
    }
    return peaks
  } finally {
    await ctx.close()
  }
}
