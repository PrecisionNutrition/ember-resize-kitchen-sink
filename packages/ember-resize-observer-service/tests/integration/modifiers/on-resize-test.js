import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { delay, setSize } from '../../utils';

module('Integration | Modifier | on-resize', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    this.onResize = sinon.spy().named('onResize');

    await render(hbs`
      <div
        style="width: 100px; height: 100px;"
        data-test
        {{on-resize this.onResize}}
      >
        Resize me
      </div>
    `);

    const element = find('[data-test]');
    await delay();

    assert
      .spy(this.onResize)
      .calledOnce('called onResize on insert')
      .calledWithExactly([sinon.match.instanceOf(ResizeObserverEntry)])
      .calledWithExactly([sinon.match({ target: element })])
      .calledWithExactly([sinon.match({ contentRect: sinon.match({ height: 100, width: 100 }) })]);

    this.onResize.resetHistory();
    await setSize(element, { width: 50 });

    assert
      .spy(this.onResize)
      .calledOnce('called onResize on width change')
      .calledWithExactly([sinon.match({ target: element })])
      .calledWithExactly([sinon.match({ contentRect: sinon.match({ height: 100, width: 50 }) })]);

    this.onResize.resetHistory();
    await setSize(element, { height: 50 });

    assert
      .spy(this.onResize)
      .calledOnce('called onResize on height change')
      .calledWithExactly([sinon.match({ target: element })])
      .calledWithExactly([sinon.match({ contentRect: sinon.match({ height: 50, width: 50 }) })]);

    this.onResize.resetHistory();
    await setSize(element, { width: 50 });

    assert.spy(this.onResize).notCalled('did not call onResize when size is not changed');
  });

  test('using multiple modifiers for the same element', async function (assert) {
    const callback1 = sinon.spy().named('callback1');
    const callback2 = sinon.spy().named('callback2');
    const callback3 = sinon.spy().named('callback3');

    this.onResize1 = callback1;
    this.onResize2 = callback2;

    await render(hbs`
      <div
        style="width: 100px;"
        data-test
        {{on-resize this.onResize1}}
        {{on-resize this.onResize2}}
      >
        Resize me
      </div>
    `);

    const element = find('[data-test]');
    await delay();

    assert.spy(callback1).calledOnce();
    assert.spy(callback2).calledOnce();

    callback1.resetHistory();
    callback2.resetHistory();
    await setSize(element, { width: 50 });

    assert.spy(callback1).calledOnce();
    assert.spy(callback2).calledOnce();

    this.set('onResize1', callback3);
    callback1.resetHistory();
    callback2.resetHistory();
    await setSize(element, { width: 20 });

    assert.spy(callback1).notCalled();
    assert.spy(callback2).calledOnce();
    assert.spy(callback3).calledOnce();
  });

  test('changing the callback', async function (assert) {
    const callback1 = sinon.spy().named('callback1');
    const callback2 = sinon.spy().named('callback2');

    this.onResize = callback1;

    await render(hbs`
      <div
        style="width: 100px;"
        data-test
        {{on-resize this.onResize}}
      >
        Resize me
      </div>
    `);

    const element = find('[data-test]');
    await delay();

    assert.spy(callback1).calledOnce();
    assert.spy(callback2).notCalled();

    callback1.resetHistory();
    this.set('onResize', callback2);
    await delay();

    assert.spy(callback1).notCalled();
    assert.spy(callback2).notCalled();

    await setSize(element, { width: 50 });

    assert.spy(callback1).notCalled();
    assert.spy(callback2).calledOnce();
  });

  test('prevents "ResizeObserver loop limit exceeded" error', async function (assert) {
    assert.expect(0);
    this.onResize = () => this.set('showText', true);

    await render(hbs`
      <div {{on-resize this.onResize}}>
        {{if this.showText "Trigger ResizeObserver again"}}
      </div>
    `);

    delay();
  });
});
