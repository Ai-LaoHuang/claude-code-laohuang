import { describe, expect, it } from 'bun:test'
import { LatestOnlyQueue } from '../latest-only-queue.js'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('LatestOnlyQueue', () => {
  it('drops stale pending values while the worker is busy', async () => {
    const first = deferred()
    const seen: string[] = []
    const queue = new LatestOnlyQueue<string>(async (value) => {
      seen.push(value)
      if (value === 'first') {
        await first.promise
      }
    })

    const p1 = queue.enqueue('first')
    const p2 = queue.enqueue('second')
    const p3 = queue.enqueue('third')

    await Promise.resolve()
    expect(seen).toEqual(['first'])

    first.resolve()
    await Promise.all([p1, p2, p3])
    expect(seen).toEqual(['first', 'third'])
  })
})
