const errorMessages = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications.',
];

/**
 * Ignores "ResizeObserver loop limit exceeded" error in Ember tests.
 *
 * This "error" is safe to ignore as it is just a warning message,
 * telling that the "looping" observation will be skipped in the current frame,
 * and will be delivered in the next one.
 *
 * For some reason, it is fired as an `error` event at `window` failing Ember
 * tests and exploding Sentry with errors that must be ignored.
 */
export default function ignoreROError() {
  if (typeof window.onerror !== 'function') {
    return;
  }

  const onError = window.onerror;

  window.onerror = (message, ...args) => {
    if (errorMessages.includes(message)) {
      return true;
    } else {
      onError(message, ...args);
    }
  };
}
