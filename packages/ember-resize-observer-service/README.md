# ResizeObserverService

`ResizeObserverService` allows to use a single [`ResizeObserver`][resize-observer] instance for observing multiple elements to achieve better performance.

**Why?** Using multiple [`ResizeObserver`][resize-observer] instances can result in a [noticeable performance penalty][performance-penalty].

This service can be used to create any tools that can benefit from using a single centralized [`ResizeObserver`][resize-observer]. For example, you can create a modifier for handling Element's size changes: [`<div {{on-resize @onResize}} />`][on-resize-modifier] (the full example in the usage section).

It has good test coverage and is ready for production👍

## Installation

```
ember install ember-resize-observer-service
```

You might also need a [polyfill][polyfill] for [`ResizeObserver`][resize-observer] ([caniuse.com](https://caniuse.com/#feat=resizeobserver)):

```
ember install ember-resize-observer-polyfill
```

## Usage

### Service API

#### `isEnabled`

It is `true` if [`ResizeObserver`][resize-observer] is available, otherwise the service will ignore any method calls (e.g. in `FastBoot` environment).

#### `observe(element, callback)`

Initiates the observing of the provided `element` or adds an additional `callback` if the `element` is already observed.

**Parameters**

- **element** `HTMLElement` - An element which size changes we want to observe.
- **callback** `function` - A function that will be called whenever the size of the element changes. It is called with [`ResizeObserverEntry`][resize-observer-entry] object for the given element.

#### `unobserve(element [, callback ])`

Ends the observing of the given `element` or just removes the provided `callback`.

It will unobserve the `element` if the `callback` is not provided or there are no more callbacks left for this `element`.

**Parameters**

- **element** `HTMLElement` - An element to unobserve or remove callback for.
- **callback** `function?` - A callback which will not respond to the element's size changes anymore.

#### `clear()`

Unobserve all observed elements.

### Example

Here is a simplified example of [`{{on-resize}}`][on-resize-modifier] modifier using the `ResizeObserverService`:

```hbs
<div {{on-resize @onResize}}>
  Resize me
</div>
```

```js
import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class OnResizeModifier extends Modifier {
  @service resizeObserver;

  didInstall() {
    this.resizeObserver.observe(this.element, this.handleResize);
  }

  willRemove() {
    this.resizeObserver.unobserve(this.element, this.handleResize);
  }

  @action
  handleResize(...args) {
    let [callback] = this.args.positional;
    callback(...args);
  }
}
```

## Compatibility

- Ember.js v3.12 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).

[resize-observer]: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
[resize-observer-entry]: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry
[on-resize-modifier]: https://github.com/PrecisionNutrition/ember-on-resize-modifier
[performance-penalty]: https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/z6ienONUb5A/F5-VcUZtBAAJ
[polyfill]: https://github.com/PrecisionNutrition/ember-resize-observer-polyfill
