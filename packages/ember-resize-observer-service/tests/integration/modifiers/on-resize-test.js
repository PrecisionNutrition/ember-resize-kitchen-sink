import sinon from 'sinon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { later } from '@ember/runloop';

function timeout(ms) {
  return new Promise(resolve => {
    later(resolve, ms);
  });
}

module('Integration | Modifier | on-resize', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    this.onResize = sinon.spy().named('onResize');

    await render(hbs`
      <div data-test {{on-resize this.onResize}}>
        Resize me
      </div>
    `);

    const element = find('[data-test]');
    await timeout(50);

    assert
      .spy(this.onResize)
      .calledOnce('called on element insert')
      .calledWith(
        [sinon.match({ target: element })],
        'returned object target prop is linked to the element'
      );

    this.onResize.resetHistory();
    element.style.width = '25%';
    await timeout(50);

    assert.spy(this.onResize).calledOnce('responded to resize');

    this.onResize.resetHistory();
    element.style.width = '25%';
    await timeout(50);

    assert.spy(this.onResize).notCalled('not called when there are no size changes');
  });
});
