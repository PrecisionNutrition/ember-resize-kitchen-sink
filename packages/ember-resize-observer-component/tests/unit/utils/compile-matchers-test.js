import compileMatchers, {
  conditionsToFunction,
  queryToConditions,
} from 'ember-resize-observer-component/utils/compile-matchers';
import { module, test } from 'qunit';

function error(msg) {
  return new Error(`Assertion Failed: resize-observer-component: ${msg}`);
}

module('Unit | Utility | compile-matchers', function () {
  module('compileMatchers', function () {
    test('converts serialized matchers to match functions', function (assert) {
      const matchers = compileMatchers({
        large: { 'width-gte': 1000, 'height-lt': 500 },
        square: { aspectRatio: 1 },
      });

      const getMatches = dimensions => {
        const matches = {};

        matchers.forEach(({ name, match }) => {
          matches[name] = match(dimensions);
        });

        return matches;
      };

      assert.deepEqual(getMatches({ width: 1000, height: 499, aspectRatio: 1 }), {
        large: true,
        square: true,
      });
      assert.deepEqual(getMatches({ width: 1100, height: 0 }), { large: true, square: false });
      assert.deepEqual(getMatches({ width: 1000, height: 500 }), { large: false, square: false });
      assert.deepEqual(getMatches({ width: 999, height: 499 }), { large: false, square: false });
      assert.deepEqual(getMatches({ aspectRatio: 2 }), { large: false, square: false });
      assert.deepEqual(getMatches({ aspectRatio: 1 }), { large: false, square: true });
    });

    test('ignores matchers with empty queries', function (assert) {
      const matchers = compileMatchers({
        'empty-query': {},
        'width-10': { width: 10 },
        'height-lt-20': { 'height-lt': 200 },
      });

      const matchersNames = matchers.map(({ name }) => name);

      assert.deepEqual(matchersNames, ['width-10', 'height-lt-20']);
    });

    test('handles matchers as an empty object', async function (assert) {
      assert.deepEqual(compileMatchers({}), []);
    });

    test('throws if matchers is not an object', async function (assert) {
      assert.throws(
        () => compileMatchers(),
        error("matchers must be an object, but was 'undefined'")
      );

      assert.throws(
        () => compileMatchers([]),
        error("matchers must be an object, but was 'array'")
      );

      assert.throws(
        () => compileMatchers(new String('str')),
        error("matchers must be an object, but was 'string'")
      );
    });

    test('throws if a query is invalid', async function (assert) {
      assert.throws(
        () => compileMatchers({ wrong: undefined }),
        error("invalid matcher 'wrong': query must be an object, but was 'undefined'")
      );

      assert.throws(
        () => compileMatchers({ wrong: new String('str') }),
        error("invalid matcher 'wrong': query must be an object, but was 'string'")
      );
    });

    test('throws if a feature is invalid', async function (assert) {
      assert.throws(
        () => compileMatchers({ wrong: { 'aspect-ratio-lte': 100 } }),
        error(
          "invalid matcher 'wrong': invalid feature 'aspect', expected one of width,height,aspectRatio"
        )
      );
    });

    test('throws if an operator is invalid', async function (assert) {
      assert.throws(
        () => compileMatchers({ wrong: { 'width-gte-wrong': 100 } }),
        error(
          "invalid matcher 'wrong': invalid operator 'gte-wrong', expected one of eq,gt,gte,lt,lte"
        )
      );

      assert.throws(
        () => compileMatchers({ wrong: { 'width-wide': 100 } }),
        error("invalid matcher 'wrong': invalid operator 'wide', expected one of eq,gt,gte,lt,lte")
      );
    });

    test('throws if a value is invalid', async function (assert) {
      assert.throws(
        () => compileMatchers({ wrong: { 'width-gte': '100' } }),
        error("invalid matcher 'wrong': invalid value type 'string', expected number")
      );
    });
  });

  module('conditionsToFunction', function () {
    test('converts a serialized query object to a match function', function (assert) {
      const match = conditionsToFunction(
        queryToConditions({ 'width-gte': 100, 'width-lte': 110, 'height-lt': 500 })
      );

      assert.equal(match({ width: 100, height: 499 }), true);
      assert.equal(match({ width: 110, height: 0 }), true);
      assert.equal(match({ width: 100, height: 500 }), false);
      assert.equal(match({ width: 111, height: 499 }), false);
      assert.equal(match({ width: 100 }), false);
    });

    test('match function built with an empty query always returns true', function (assert) {
      const match = conditionsToFunction(queryToConditions({}));

      assert.equal(match({ width: 100, height: 499 }), true);
      assert.equal(match({ width: 111, height: 499 }), true);
      assert.equal(match({ width: 100 }), true);
    });
  });

  module('queryToConditions', function () {
    test('converts a query to conditions', function (assert) {
      const expected = [
        { feature: 'width', operator: 'eq', value: 10 },
        { feature: 'width', operator: 'eq', value: 10 },
        { feature: 'width', operator: 'gt', value: 10 },
        { feature: 'width', operator: 'gte', value: 10 },
        { feature: 'height', operator: 'lt', value: 10 },
        { feature: 'height', operator: 'lte', value: 10 },
        { feature: 'aspectRatio', operator: 'eq', value: 10 },
        { feature: 'aspectRatio', operator: 'gt', value: 10 },
      ];

      const actual = queryToConditions({
        width: 10,
        'width-eq': 10,
        'width-gt': 10,
        'width-gte': 10,
        'height-lt': 10,
        'height-lte': 10,
        aspectRatio: 10,
        'aspectRatio-gt': 10,
      });

      assert.deepEqual(actual, expected);
    });

    test('handles empty query', function (assert) {
      assert.deepEqual(queryToConditions({}), []);
    });
  });
});
