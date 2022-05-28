import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';

export default class OnResizeModifier extends Modifier {
  @service resizeObserver;

  callback = null;
  element = null;

  constructor() {
    super(...arguments);

    registerDestructor(this, () => {
      this.resizeObserver.unobserve(this.element, this.callback);
    });
  }

  modify(element, [callback]) {
    assert(
      `on-resize-modifier: callback must be a function, but was ${callback}`,
      typeof callback === 'function'
    );

    this.resizeObserver.observe(element, callback);
    this.resizeObserver.unobserve(this.element, this.callback);

    this.callback = callback;
    this.element = element;
  }
}
