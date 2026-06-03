/**
 * Async queue that keeps only the latest pending value while a worker is busy.
 *
 * Useful for high-frequency UI updates where intermediate states are obsolete
 * as soon as a newer state arrives.
 */
export class LatestOnlyQueue<T> {
  private inFlight = false
  private pending: { value: T; waiters: Array<() => void> } | null = null

  constructor(private readonly worker: (value: T) => Promise<void> | void) {}

  enqueue(value: T): Promise<void> {
    if (this.pending) {
      this.pending.value = value
    } else {
      this.pending = { value, waiters: [] }
    }

    const pending = this.pending
    const done = new Promise<void>((resolve) => {
      pending.waiters.push(resolve)
    })

    if (!this.inFlight) {
      void this.drain()
    }

    return done
  }

  private async drain(): Promise<void> {
    if (this.inFlight) return

    this.inFlight = true
    try {
      while (this.pending) {
        const { value, waiters } = this.pending
        this.pending = null

        try {
          await this.worker(value)
        } catch {
          // Queue callers use completion as "this value is no longer pending".
          // Worker-specific error handling belongs inside the worker.
        } finally {
          for (const resolve of waiters) resolve()
        }
      }
    } finally {
      this.inFlight = false
      if (this.pending) {
        void this.drain()
      }
    }
  }
}
