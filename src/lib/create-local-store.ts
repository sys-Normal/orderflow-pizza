// A tiny localStorage-backed external store compatible with useSyncExternalStore.
// Avoids the useEffect+setState hydration anti-pattern by giving React a
// stable snapshot getter (cached until invalidated) plus a server snapshot,
// so reads never mismatch during hydration.
export function createLocalStore<T>(key: string, fallback: T) {
  let cache: T = fallback;
  let cacheValid = false;
  const listeners = new Set<() => void>();

  function read(): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  function getSnapshot(): T {
    if (!cacheValid) {
      cache = read();
      cacheValid = true;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return fallback;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cacheValid = false;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function write(value: T): void {
    cache = value;
    cacheValid = true;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    notify();
  }

  return { read, write, getSnapshot, getServerSnapshot, subscribe };
}
