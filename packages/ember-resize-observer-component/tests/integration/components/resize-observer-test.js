import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, setupOnerror, resetOnerror } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { delay, setSize } from '../../utils';

module('Integration | Component | resize-observer', function (hooks) {
  setupRenderingTest(hooks);

  test('renders with a wrapper', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        data-test-container
        @matchers={{hash
          width-gte-100=(hash width-gte=100)
          height-lte-50=(hash height-lte=50)
          square=(hash aspectRatio=1)
        }}
        as |RO|
      >
        <p data-test-matchers>
          {{if RO.is.width-gte-100 "width-gte-100"}}
          {{if RO.is.height-lte-50 "height-lte-50"}}
          {{if RO.is.square "square"}}
        </p>

        <p data-test-dimensions>
          {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
        </p>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();

    assert.dom('[data-test-matchers]').hasText('width-gte-100 square');
    assert.dom('[data-test-dimensions]').hasText('100 100 1');

    await setSize(container, { height: 50 });

    assert.dom('[data-test-matchers]').hasText('width-gte-100 height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('100 50 2');
  });

  test('renders without wrapper', async function (assert) {
    await render(hbs`
      <ResizeObserver
        @matchers={{hash
          width-gte-100=(hash width-gte=100)
          height-lte-50=(hash height-lte=50)
          square=(hash aspectRatio=1)
        }}
        @noWrapper={{true}}
        as |RO|
      >
        <div
          style="width: 100px; height: 100px;"
          data-test-container
          {{on-resize RO.onResize}}
        >
          <p data-test-matchers>
            {{if RO.is.width-gte-100 "width-gte-100"}}
            {{if RO.is.height-lte-50 "height-lte-50"}}
            {{if RO.is.square "square"}}
          </p>

          <p data-test-dimensions>
            {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          </p>
        </div>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();

    assert.dom('[data-test-matchers]').hasText('width-gte-100 square');
    assert.dom('[data-test-dimensions]').hasText('100 100 1');

    await setSize(container, { height: 50 });

    assert.dom('[data-test-matchers]').hasText('width-gte-100 height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('100 50 2');
  });

  test('SSR with defaults', async function (assert) {
    this.isSSR = true;
    this.noop = () => null;

    await render(hbs`
      <ResizeObserver
        @matchers={{hash
          width-gte-100=(hash width-gte=100)
          height-lte-50=(hash height-lte=50)
          square=(hash aspectRatio=1)
        }}
        @defaultWidth={{100}}
        @defaultHeight={{50}}
        @noWrapper={{true}}
        as |RO|
      >
        <div
          style="width: 100px; height: 100px;"
          data-test-container
          {{on-resize (if this.isSSR this.noop RO.onResize)}}
        >
          <p data-test-matchers>
            {{if RO.is.width-gte-100 "width-gte-100"}}
            {{if RO.is.height-lte-50 "height-lte-50"}}
            {{if RO.is.square "square"}}
          </p>

          <p data-test-dimensions>
            {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          </p>
        </div>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();

    assert.dom('[data-test-matchers]').hasText('width-gte-100 height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('100 50 2');

    await setSize(container, { width: 100 });

    assert.dom('[data-test-matchers]').hasText('width-gte-100 height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('100 50 2');

    this.set('isSSR', false);
    await setSize(container, { width: 200, height: 200 });

    assert.dom('[data-test-matchers]').hasText('width-gte-100 square');
    assert.dom('[data-test-dimensions]').hasText('200 200 1');
  });

  test('SSR with no defaults', async function (assert) {
    this.isSSR = true;
    this.noop = () => null;

    await render(hbs`
      <ResizeObserver
        @matchers={{hash
          width-gte-100=(hash width-gte=100)
          height-lte-50=(hash height-lte=50)
          square=(hash aspectRatio=1)
        }}
        @noWrapper={{true}}
        as |RO|
      >
        <div
          style="width: 100px; height: 100px;"
          data-test-container
          {{on-resize (if this.isSSR this.noop RO.onResize)}}
        >
          <p data-test-matchers>
            {{if RO.is.width-gte-100 "width-gte-100"}}
            {{if RO.is.height-lte-50 "height-lte-50"}}
            {{if RO.is.square "square"}}
          </p>

          <p data-test-dimensions>
            {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          </p>
        </div>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();

    assert.dom('[data-test-matchers]').hasText('height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('0 0 0');

    await setSize(container, { width: 100 });

    assert.dom('[data-test-matchers]').hasText('height-lte-50');
    assert.dom('[data-test-dimensions]').hasText('0 0 0');

    this.set('isSSR', false);
    await setSize(container, { width: 200, height: 200 });

    assert.dom('[data-test-matchers]').hasText('width-gte-100 square');
    assert.dom('[data-test-dimensions]').hasText('200 200 1');
  });

  test('matchers work properly', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        data-test-container
        @matchers={{hash
          square-gte-100=(hash width-gte=100 height-gte=100 aspectRatio=1)
          width-between-64-100=(hash width-gte=64 width-lte=100)
          hd-lt-50=(hash width-lt=50 height-lt=50 aspectRatio=(div 16 9))
          square-50x50=(hash width=50 height=50)
          empty-query=(hash)
        }}
        as |RO|
      >
        <p data-test-matchers>
          {{if RO.is.square-gte-100 "square-gte-100"}}
          {{if RO.is.width-between-64-100 "width-between-64-100"}}
          {{if RO.is.hd-lt-50 "hd-lt-50"}}
          {{if RO.is.square-50x50 "square-50x50"}}
          {{if RO.is.empty-query "empty-query"}}
        </p>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();
    assert.dom('[data-test-matchers]').hasText('square-gte-100 width-between-64-100');

    await setSize(container, { width: 105, height: 105 });
    assert.dom('[data-test-matchers]').hasText('square-gte-100');

    await setSize(container, { width: 64, height: 36 });
    assert.dom('[data-test-matchers]').hasText('width-between-64-100');

    await setSize(container, { width: 32, height: 18 });
    assert.dom('[data-test-matchers]').hasText('hd-lt-50');

    await setSize(container, { width: 50, height: 50 });
    assert.dom('[data-test-matchers]').hasText('square-50x50');
  });

  test('switching matchers', async function (assert) {
    const widthMatchers = {
      'width-gt-50': { 'width-gt': 50 },
      'width-50-100': { 'width-gte': 50, 'width-lte': 100 },
      'width-gt-200': { 'width-gt': 200 },
    };

    const heightMatchers = {
      'height-gt-50': { 'height-gt': 50 },
      'height-50-100': { 'height-gte': 50, 'height-lte': 100 },
      'height-gt-200': { 'height-gt': 200 },
    };

    this.matchers = widthMatchers;

    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        data-test-container
        @matchers={{this.matchers}}
        as |RO|
      >
        <p data-test-matchers>
          {{if RO.is.width-gt-50 "width-gt-50"}}
          {{if RO.is.width-50-100 "width-50-100"}}
          {{if RO.is.width-gt-200 "width-gt-200"}}

          {{if RO.is.height-gt-50 "height-gt-50"}}
          {{if RO.is.height-50-100 "height-50-100"}}
          {{if RO.is.height-gt-200 "height-gt-200"}}
        </p>
      </ResizeObserver>
    `);

    await delay();
    assert.dom('[data-test-matchers]').hasText('width-gt-50 width-50-100');

    this.set('matchers', heightMatchers);
    assert.dom('[data-test-matchers]').hasText('height-gt-50 height-50-100');
  });

  test('dimensions work properly', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 0px; height: 0px;"
        data-test-container
        as |RO|
      >
        <p data-test-dimensions>
          {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
        </p>
      </ResizeObserver>
    `);

    const container = find('[data-test-container]');
    await delay();
    assert.dom('[data-test-dimensions]').hasText('0 0 0');

    await setSize(container, { width: 64, height: 64 });
    assert.dom('[data-test-dimensions]').hasText('64 64 1');

    await setSize(container, { height: 36 });
    assert.dom('[data-test-dimensions]').hasText(`64 36 ${16 / 9}`);

    await setSize(container, { width: 80, height: 60 });
    assert.dom('[data-test-dimensions]').hasText(`80 60 ${4 / 3}`);
  });

  test('renders without @matchers', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        as |RO|
      >
        <p data-test-dimensions>
          {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          {{RO.is.nothing}}
        </p>
      </ResizeObserver>
    `);

    await delay();
    assert.dom('[data-test-dimensions]').hasText('100 100 1');
  });

  test('renders when @matchers is set to null', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        @matchers={{null}}
        as |RO|
      >
        <p data-test-dimensions>
          {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          {{RO.is.nothing}}
        </p>
      </ResizeObserver>
    `);

    await delay();
    assert.dom('[data-test-dimensions]').hasText('100 100 1');
  });

  test('renders when @matchers is set to an empty object', async function (assert) {
    await render(hbs`
      <ResizeObserver
        style="width: 100px; height: 100px;"
        @matchers={{hash}}
        as |RO|
      >
        <p data-test-dimensions>
          {{RO.width}} {{RO.height}} {{RO.aspectRatio}}
          {{RO.is.nothing}}
        </p>
      </ResizeObserver>
    `);

    await delay();
    assert.dom('[data-test-dimensions]').hasText('100 100 1');
  });

  module('matchers validation errors', function (hooks) {
    hooks.afterEach(function () {
      resetOnerror();
    });

    test('throws if @matchers is invalid', async function (assert) {
      assert.expect(1);

      setupOnerror(error => {
        assert.equal(
          error.message,
          "Assertion Failed: resize-observer-component: matchers must be an object, but was 'string'"
        );
      });

      await render(hbs`
        <ResizeObserver
          @matchers="width-gt-100"
          as |RO|
        >
          {{RO.is.nothing}}
        </ResizeObserver>
      `);
    });

    test('throws if query is invalid', async function (assert) {
      assert.expect(1);

      setupOnerror(error => {
        assert.equal(
          error.message,
          "Assertion Failed: resize-observer-component: invalid matcher 'wrong': query must be an object, but was 'array'"
        );
      });

      await render(hbs`
        <ResizeObserver
          @matchers={{hash
            width-gte-100=(hash width-gte=100)
            wrong=(array 'mess')
          }}
          as |RO|
        >
          {{RO.is.wrong}}
        </ResizeObserver>
      `);
    });

    test('throws if feature is invalid', async function (assert) {
      assert.expect(1);

      setupOnerror(error => {
        assert.equal(
          error.message,
          "Assertion Failed: resize-observer-component: invalid matcher 'wrong': invalid feature 'aspect', expected one of width,height,aspectRatio"
        );
      });

      await render(hbs`
        <ResizeObserver
          @matchers={{hash
            width-gte-100=(hash width-gte=100)
            wrong=(hash aspect-ratio=1)
          }}
          as |RO|
        >
          {{RO.is.wrong}}
        </ResizeObserver>
      `);
    });

    test('throws if operator is invalid', async function (assert) {
      assert.expect(1);

      setupOnerror(error => {
        assert.equal(
          error.message,
          "Assertion Failed: resize-observer-component: invalid matcher 'wrong': invalid operator 'wide', expected one of eq,gt,gte,lt,lte"
        );
      });

      await render(hbs`
        <ResizeObserver
          @matchers={{hash
            width-gte-100=(hash width-gte=100)
            wrong=(hash width-wide=100)
          }}
          as |RO|
        >
          {{RO.is.wrong}}
        </ResizeObserver>
      `);
    });

    test('throws if value is invalid', async function (assert) {
      assert.expect(1);

      setupOnerror(error => {
        assert.equal(
          error.message,
          "Assertion Failed: resize-observer-component: invalid matcher 'wrong': invalid value type 'string', expected number"
        );
      });

      await render(hbs`
        <ResizeObserver
          @matchers={{hash
            width-gte-100=(hash width-gte=100)
            wrong=(hash width-gte='100')
          }}
          as |RO|
        >
          {{RO.is.wrong}}
        </ResizeObserver>
      `);
    });
  });
});
