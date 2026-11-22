/**
 * Intelligent poller with document visibility detection and exponential backoff on error.
 * Prevents tab thrashing and limits requests when hidden or offline.
 */
export function createPoller(fn: () => Promise<void>, intervalMs: number) {
  let timer: any = null;
  let isPaused = false;
  let isStopped = false;
  let backoff = 1;

  const tick = async () => {
    if (isStopped) return;
    if (isPaused || (typeof document !== 'undefined' && document.hidden)) {
      timer = setTimeout(tick, intervalMs);
      return;
    }
    try {
      await fn();
      backoff = 1;
      timer = setTimeout(tick, intervalMs);
    } catch {
      backoff = Math.min(backoff * 2, 8);
      timer = setTimeout(tick, intervalMs * backoff);
    }
  };

  return {
    start: () => {
      isStopped = false;
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, intervalMs);
    },
    stop: () => {
      isStopped = true;
      if (timer) clearTimeout(timer);
    },
    pause: () => {
      isPaused = true;
    },
    resume: () => {
      isPaused = false;
    },
  };
}
