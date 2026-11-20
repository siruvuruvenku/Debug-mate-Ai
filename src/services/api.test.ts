import { describe, expect, it } from 'vitest'
import { streamAnalysis } from './api'

describe('streamAnalysis', () => {
  it('rejects with AbortError when a stream is cancelled', async () => {
    const controller = new AbortController()
    const received: string[] = []

    await expect(streamAnalysis(
      { logs: 'TypeError: missing value', language: 'TypeScript', category: 'Runtime error' },
      controller.signal,
      chunk => {
        received.push(chunk)
        controller.abort()
      },
    )).rejects.toMatchObject({ name: 'AbortError' })

    expect(received.length).toBeGreaterThan(0)
  })
})
