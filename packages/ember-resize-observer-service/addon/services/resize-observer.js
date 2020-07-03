import Service from '@ember/service';
import { action } from '@ember/object';
import { warn } from '@ember/debug';
import ignoreROError from '../utils/ignore-ro-error';

const addonName = 'resize-observer-service';

/**
 * ResizeObserverService allows to use a single ResizeObserver instance
 * for observing multiple elements to achieve better performance.
 */
export default class ResizeObserverService extends Service {
  init(...args) {
    super.init(...args);
    this.setup();
  }

  setup() {
    this.callbacks = null;
    this.observer = null;

    if (typeof FastBoot !== 'undefined' || typeof window === 'undefined') {
      return;
    }

    if (!window.ResizeObserver) {
      warn(`${addonName}: ResizeObserver is not available`, { id: addonName });
      return;
    }

    ignoreROError();
    this.callbacks = new WeakMap();
    this.observer = new window.ResizeObserver(this.handleResize);
  }

  /**
   * `isEnabled` is `true` if the ResizeObserver API is available,
   * otherwise the service will ignore any method calls.
   */
  get isEnabled() {
    return !!this.observer;
  }

  /**
   * Initiate the observing of the `element` or add an additional `callback`
   * if the `element` is already observed.
   *
   * @param {object} element
   * @param {function} callback The `callback` is called whenever the size of
   *    the `element` changes. It is called with `ResizeObserverEntry` object
   *    for the particular `element`.
   */
  observe(element, callback) {
    if (!this.isEnabled) {
      return;
    }

    const callbacks = this.callbacks.get(element);

    if (callbacks) {
      callbacks.add(callback);
    } else {
      this.callbacks.set(element, new Set([callback]));
      this.observer.observe(element);
    }
  }

  /**
   * End the observing of the `element` or just remove the provided `callback`.
   *
   * It will unobserve the `element` if the `callback` is not provided
   * or there are no more callbacks left for this `element`.
   *
   * @param {object} element
   * @param {function?} callback - The `callback` to remove from the listeners
   *   of the `element` size changes.
   */
  unobserve(element, callback) {
    if (!this.isEnabled) {
      return;
    }

    const callbacks = this.callbacks.get(element);

    if (!callbacks) {
      return;
    }

    callbacks.delete(callback);

    if (!callback || !callbacks.size) {
      this.callbacks.delete(element);
      this.observer.unobserve(element);
    }
  }

  /**
   * Unobserve all observed elements.
   */
  clear() {
    if (!this.isEnabled) {
      return;
    }

    this.callbacks = new WeakMap();
    this.observer.disconnect();
  }

  willDestroy() {
    this.clear();
  }

  @action
  handleResize(entries) {
    for (const entry of entries) {
      const callbacks = this.callbacks.get(entry.target);

      if (callbacks) {
        for (const callback of callbacks) {
          callback(entry);
        }
      }
    }
  }
}
