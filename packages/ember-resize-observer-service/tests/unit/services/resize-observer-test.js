import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | resize-observer', function (hooks) {
  setupTest(hooks);

  module('setup', function () {
    test('it is enabled if env is not FastBoot', function (assert) {
      const service = this.owner.lookup('service:resize-observer');

      assert.equal(service.isEnabled, true, 'isEnabled is true');
      assert.ok(service.callbacks, 'callbacks is set');
      assert.ok(service.observer, 'observer is set');
    });

    test('it is disabled if env is FastBoot', function (assert) {
      window.FastBoot = undefined;
      sinon.stub(window, 'FastBoot').value(true);
      const service = this.owner.lookup('service:resize-observer');

      assert.equal(service.isEnabled, false, 'isEnabled is false');
      assert.equal(service.callbacks, null, 'callbacks is null');
      assert.equal(service.observer, null, 'observer is null');
    });

    test('it is disabled if ResizeObserver is not available', function (assert) {
      sinon.stub(window, 'ResizeObserver').value(null);
      const service = this.owner.lookup('service:resize-observer');

      assert.equal(service.isEnabled, false, 'isEnabled is false');
      assert.equal(service.callbacks, null, 'callbacks is null');
      assert.equal(service.observer, null, 'observer is null');
    });
  });

  module('observe', function (hooks) {
    hooks.beforeEach(function () {
      this.service = this.owner.lookup('service:resize-observer');
      this.observeSpy = sinon.stub(this.service.observer, 'observe');
      this.element = document.createElement('div');
      this.callback = () => null;
    });

    test('adds a callback to a new element', function (assert) {
      const { service, observeSpy, element, callback } = this;

      service.observe(element, callback);

      assert.ok(service.callbacks.has(element), 'added an element');
      assert.ok(service.callbacks.get(element).has(callback), 'added a callback');
      assert.spy(observeSpy).calledOnce().calledWithExactly([element]);
    });

    test('adds a callback to the existing element', function (assert) {
      const { service, observeSpy, element, callback } = this;
      const newCallback = () => null;

      service.observe(element, callback);
      observeSpy.reset();
      service.observe(element, newCallback);

      assert.ok(
        service.callbacks.get(element).has(callback),
        'still has the existing callback'
      );
      assert.ok(service.callbacks.get(element).has(newCallback), 'added a new callback');
      assert.spy(observeSpy).notCalled();
    });

    test('does nothing if it is disabled', function (assert) {
      const { service, observeSpy, element, callback } = this;

      sinon.stub(service, 'isEnabled').get(() => false);
      service.observe(element, callback);

      assert.notOk(service.callbacks.has(element), 'did not add an element');
      assert.spy(observeSpy).notCalled();
    });
  });

  module('unobserve', function (hooks) {
    hooks.beforeEach(function () {
      this.service = this.owner.lookup('service:resize-observer');
      this.unobserveSpy = sinon.stub(this.service.observer, 'unobserve');
      this.element = document.createElement('div');
      this.callback = () => null;

      sinon.stub(this.service.observer, 'observe');
    });

    test('unobserves an element with a single callback when a target callback is provided', function (assert) {
      const { service, unobserveSpy, element, callback } = this;

      service.observe(element, callback);

      assert.equal(
        service.callbacks.get(element).size,
        1,
        'has an element with a single callback'
      );

      service.unobserve(element, callback);

      assert.notOk(service.callbacks.has(element), 'removed the element');
      assert.spy(unobserveSpy).calledOnce().calledWithExactly([element]);
    });

    test('does not unobserve an element with multiple callbacks when a target callback is provided', function (assert) {
      const { service, unobserveSpy, element, callback } = this;
      const targetCallback = () => null;

      service.observe(element, callback);
      service.observe(element, targetCallback);

      assert.ok(
        service.callbacks.get(element).has(targetCallback),
        'has a target callback'
      );
      assert.ok(
        service.callbacks.get(element).has(callback),
        'has a non-target callback'
      );

      service.unobserve(element, targetCallback);

      assert.ok(service.callbacks.has(element), 'did not remove the element');
      assert.notOk(
        service.callbacks.get(element).has(targetCallback),
        'removed a target callback'
      );
      assert.ok(
        service.callbacks.get(element).has(callback),
        'did not remove a non-target callback'
      );
      assert.spy(unobserveSpy).notCalled();
    });

    test('unobserves an element with multiple callbacks if a target callback is not provided', function (assert) {
      const { service, unobserveSpy, element } = this;

      service.observe(element, () => null);
      service.observe(element, () => null);

      assert.equal(
        service.callbacks.get(element).size,
        2,
        'has an element with two callbacks'
      );

      service.unobserve(element);

      assert.notOk(service.callbacks.has(element), 'removed the element');
      assert.spy(unobserveSpy).calledOnce().calledWithExactly([element]);
    });

    test('does nothing if it is disabled', function (assert) {
      const { service, unobserveSpy, element, callback } = this;

      service.observe(element, callback);

      assert.ok(
        service.callbacks.get(element).has(callback),
        'has an element with a callback'
      );

      sinon.stub(service, 'isEnabled').get(() => false);
      service.unobserve(element, callback);

      assert.ok(
        service.callbacks.get(element).has(callback),
        'still has an element with a callback'
      );
      assert.spy(unobserveSpy).notCalled();
    });

    test('does nothing if a wrong element is provided', function (assert) {
      const { service, unobserveSpy, element, callback } = this;
      const wrongElement = document.createElement('div');

      service.observe(element, callback);

      assert.ok(
        service.callbacks.get(element).has(callback),
        'has an element with a callback'
      );

      service.unobserve(wrongElement, callback);

      assert.ok(
        service.callbacks.get(element).has(callback),
        'still has an element with a callback'
      );
      assert.spy(unobserveSpy).notCalled();
    });
  });

  module('clear', function (hooks) {
    hooks.beforeEach(function () {
      this.service = this.owner.lookup('service:resize-observer');
      this.serviceCallbacks = this.service.callbacks;
      this.disconnectSpy = sinon.stub(this.service.observer, 'disconnect');
    });

    test('resets callbacks map and unobserve all elements', function (assert) {
      const { service, serviceCallbacks, disconnectSpy } = this;

      service.clear();

      assert.notEqual(service.callbacks, serviceCallbacks, 'reset callbacks map');
      assert.spy(disconnectSpy).calledOnce();
    });

    test('does nothing if it is disabled', function (assert) {
      const { service, serviceCallbacks, disconnectSpy } = this;

      sinon.stub(service, 'isEnabled').get(() => false);
      service.clear();

      assert.equal(service.callbacks, serviceCallbacks, 'did not reset callbacks map');
      assert.spy(disconnectSpy).notCalled();
    });
  });

  module('handleResize', function (hooks) {
    hooks.beforeEach(function () {
      const service = this.owner.lookup('service:resize-observer');
      sinon.stub(service.observer, 'observe');

      const banner = document.createElement('div');
      banner.callbacks = [
        sinon.spy().named('bannerCallback1'),
        sinon.spy().named('bannerCallback2'),
      ];

      service.observe(banner, banner.callbacks[0]);
      service.observe(banner, banner.callbacks[1]);

      const modal = document.createElement('div');
      modal.callbacks = [
        sinon.spy().named('modalCallback1'),
        sinon.spy().named('modalCallback2'),
      ];

      service.observe(modal, modal.callbacks[0]);
      service.observe(modal, modal.callbacks[1]);

      const form = document.createElement('div');
      form.callbacks = [
        sinon.spy().named('formCallback1'),
        sinon.spy().named('formCallback2'),
      ];

      service.observe(form, form.callbacks[0]);
      service.observe(form, form.callbacks[1]);

      this.service = service;
      this.banner = banner;
      this.modal = modal;
      this.form = form;
    });

    test('calls all callbacks of a single target', function (assert) {
      const { service, banner, modal, form } = this;
      const bannerEntry = { target: banner };

      service.handleResize([bannerEntry]);

      assert.spy(banner.callbacks[0]).calledOnce().calledWithExactly([bannerEntry]);
      assert.spy(banner.callbacks[1]).calledOnce().calledWithExactly([bannerEntry]);

      assert.spy(modal.callbacks[0]).notCalled();
      assert.spy(modal.callbacks[1]).notCalled();

      assert.spy(form.callbacks[0]).notCalled();
      assert.spy(form.callbacks[1]).notCalled();
    });

    test('calls all callbacks of mutliple targets', function (assert) {
      const { service, banner, modal, form } = this;
      const modalEntry = { target: modal };
      const formEntry = { target: form };

      service.handleResize([modalEntry, formEntry]);

      assert.spy(banner.callbacks[0]).notCalled();
      assert.spy(banner.callbacks[1]).notCalled();

      assert.spy(modal.callbacks[0]).calledOnce().calledWithExactly([modalEntry]);
      assert.spy(modal.callbacks[1]).calledOnce().calledWithExactly([modalEntry]);

      assert.spy(form.callbacks[0]).calledOnce().calledWithExactly([formEntry]);
      assert.spy(form.callbacks[1]).calledOnce().calledWithExactly([formEntry]);
    });

    test('does not call unobserved callbacks', function (assert) {
      const { service, modal, form } = this;
      const modalEntry = { target: modal };
      const formEntry = { target: form };

      service.unobserve(modal, modal.callbacks[1]);
      service.unobserve(form, form.callbacks[0]);
      service.unobserve(form, form.callbacks[1]);

      service.handleResize([modalEntry, formEntry]);

      assert.spy(modal.callbacks[0]).calledOnce().calledWithExactly([modalEntry]);
      assert.spy(modal.callbacks[1]).notCalled();

      assert.spy(form.callbacks[0]).notCalled();
      assert.spy(form.callbacks[1]).notCalled();
    });

    test('handles targets that do not exist', function (assert) {
      const { service, banner } = this;

      service.handleResize([{ target: document.createElement('div') }]);

      assert.spy(banner.callbacks[0]).notCalled();
      assert.spy(banner.callbacks[1]).notCalled();
    });
  });
});
