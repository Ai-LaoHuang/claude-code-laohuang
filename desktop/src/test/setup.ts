class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.has(key) ? this.values.get(key)! : null
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value))
  }
}

function installStorage(name: 'localStorage' | 'sessionStorage'): void {
  const current = globalThis[name] as Storage | undefined
  if (
    current &&
    typeof current.clear === 'function' &&
    typeof current.getItem === 'function' &&
    typeof current.removeItem === 'function' &&
    typeof current.setItem === 'function'
  ) {
    return
  }

  const storage = new MemoryStorage()
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: true,
    value: storage,
    writable: true,
  })

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      configurable: true,
      enumerable: true,
      value: storage,
      writable: true,
    })
  }
}

installStorage('localStorage')
installStorage('sessionStorage')
