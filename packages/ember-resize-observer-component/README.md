# ember-resize-observer-component

<p>
  <a href="https://github.com/PrecisionNutrition/ember-resize-observer-component/actions?query=workflow%3ACI" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/PrecisionNutrition/ember-resize-observer-component/workflows/CI/badge.svg" alt="CI status">
  </a>

  <a href="https://www.npmjs.com/package/ember-resize-observer-component" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/npm/v/ember-resize-observer-component?color=informational" alt="NPM version" />
  </a>
</p>

A tiny, [ResizeObserver-based][resize-observer] solution for building components responsive to their container size, rather than the viewport. The idea is to overcome the limitations of viewport-based media queries, and it's known as `Container Queries`.

Here is how it can be done, using this addon (controversial example):

```hbs
<ResizeObserver
  @matchers={{hash
    width-between-100-300=(hash width-gte=100 width-lte=300)
    bigSquare=(hash width-gt=500 height-gt=500 aspectRatio=1)
  }}
  as |RO|
>
  <p class="matchers {{if RO.is.bigSquare "matchers--square"}}">
    {{if RO.is.width-between-100-300 "Width is between 100px-300px"}}
  </p>

  {{#if RO.is.bigSquare}}
    <p>Big square</p>
  {{/if}}

  {{#if (gt RO.width 300)}}
    <p>Width is greater than 300px</p>
  {{/if}}

  <p>Width: {{RO.width}}</p>
  <p>Height: {{RO.height}}</p>
  <p>Aspect Ratio: {{RO.aspectRatio}}</p>
</ResizeObserver>
```

This addon focuses on simplicity. It only includes a single component and won't do any attributes binding for you. Instead, it provides element's dimensions and easy to use `size-matchers`.

**Highlights:**

- a single component and nothing more
- only provides data (no attributes or class binding)
- supports `no-wrapper` mode - use your element directly
- easy to use `size-matchers`
- works with FastBoot/SSR

## Installation

```
ember install ember-resize-observer-component
```

If you need a [ResizeObserver polyfill][resize-observer-polyfill] ([caniuse.com](https://caniuse.com/#feat=resizeobserver)):

```
ember install ember-resize-observer-polyfill
```

## Usage

### Matcher query syntax

Matchers allow you to map size-related conditions, such as `width > 100`, to properties on the object you get from `<ResizeObserver />` (e.g. `RO.is.large`). And whenever the element's size changes, the relevant properties will update.

In the example below, `large` is a matcher name, and `(hash width-gte=1200)` represents a condition query.

```hbs
<ResizeObserver
  @matchers={{hash
    large=(hash width-gte=1200)
  }}
  as |RO|
>
  {{if RO.is.large "I'm large!"}}
</ResizeObserver>
```

**Available operators:** `eq`, `gt`, `gte`, `lt`, `lte` (they are similar to [ember-truth-helpers][])

**Available conditions:** `width`, `height`, `aspectRatio`.

**Note:** The addon protects you from mistyping by validating all your matchers and telling you exactly what was wrong with a particular matcher.

| Query                 | JavaScript     |
| --------------------- | -------------- |
| `(hash width=10)`     | `width === 10` |
| `(hash width-gt=10)`  | `width > 10`   |
| `(hash width-gte=10)` | `width >= 10`  |
| `(hash width-lt=10)`  | `width < 10`   |
| `(hash width-lte=10)` | `width <= 10`  |

**Examples with multiple values:**

| Query                              | JavaScript                        |
| ---------------------------------- | --------------------------------- |
| `(hash width=10 height-lt=20)`     | `width === 10 && height < 20`     |
| `(hash width-gt=10 aspectRatio=1)` | `width > 10 && aspectRatio === 1` |

**In `no-wrapper` mode, the component won't provide a wrapper element, so you will need to attach `onResize` handler to a target element yourself:**

```hbs
<ResizeObserver @noWrapper={{true}} as |RO|>
  <div {{on-resize RO.onResize}}>
    {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
  </div>
</ResizeObserver>
```

**You can set initial demensions that will be used if the component can't get element's size, e.g. in FastBoot environment:**

```hbs
<ResizeObserver
  @matchers={{hash
    large=(hash width-gte=1200)
    square=(hash aspectRatio=1)
  }}
  @defaultWidth={{100}}
  @defaultHeight={{100}}
  as |RO|
>
  {{if RO.is.large "Large"}}
  {{if RO.is.square "Square"}}

  Size: {{RO.width}} x {{RO.height}}
</ResizeObserver>
```

For more info, please [read the tests](https://github.com/PrecisionNutrition/ember-resize-observer-component/blob/master/tests/integration/components/resize-observer-test.js). The documentation will be improved soon.

## Related addons

- [ember-on-resize-modifier][on-resize-modifier]
- [ember-resize-observer-service][resize-observer-service]
- [ember-resize-observer-polyfill][resize-observer-polyfill]

## Alternative solutions worth checking out

- [ember-fill-up](https://github.com/chadian/ember-fill-up) ([video](https://www.youtube.com/watch?v=RIdjk9_RSBY))
- [ember-container-query](https://github.com/ijlee2/ember-container-query)

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## Compatibility

- Ember.js v3.12 or above
- Ember CLI v2.13 or above
- Node.js v10 or above

## License

This project is licensed under the [MIT License](LICENSE.md).

[resize-observer]: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
[resize-observer-service]: https://github.com/PrecisionNutrition/ember-resize-observer-service
[on-resize-modifier]: https://github.com/PrecisionNutrition/ember-on-resize-modifier
[resize-observer-polyfill]: https://github.com/PrecisionNutrition/ember-resize-observer-polyfill
[ember-truth-helpers]: https://github.com/jmurphyau/ember-truth-helpers
