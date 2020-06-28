import { assert } from '@ember/debug';

const addonPrefix = 'resize-observer-component:';

const operators = {
  eq: (a, b) => a === b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
};

const validOperators = Object.keys(operators);
const validFeatures = ['width', 'height', 'aspectRatio'];

function typeOf(value) {
  return Object.prototype.toString.call(value).toLowerCase().slice(8, -1);
}

function assertMatchers(matchers, prefix) {
  assert(
    `${prefix} matchers must be an object, but was '${typeOf(matchers)}'`,
    typeOf(matchers) === 'object'
  );
}

function assertQuery(query, prefix) {
  assert(
    `${prefix} query must be an object, but was '${typeOf(query)}'`,
    typeOf(query) === 'object'
  );
}

function assertConditions(conditions, prefix) {
  conditions.forEach(({ feature, operator, value }) => {
    assert(
      `${prefix} invalid feature '${feature}', expected one of ${validFeatures}`,
      validFeatures.includes(feature)
    );

    assert(
      `${prefix} invalid operator '${operator}', expected one of ${validOperators}`,
      validOperators.includes(operator)
    );

    assert(
      `${prefix} invalid value type '${typeOf(value)}', expected number`,
      typeOf(value) === 'number'
    );
  });
}

/**
 * @param {object} query
 * @returns {array}
 */
export function queryToConditions(query) {
  return Object.entries(query).map(([featureAndOperator, value]) => {
    const [feature, operator = 'eq'] = featureAndOperator.split(/-(.+)/);
    return { feature, operator, value };
  });
}

/**
 * @param {array} conditions
 * @returns {function}
 */
export function conditionsToFunction(conditions) {
  return function matchFeatures(features) {
    return conditions.every(({ feature, operator, value: valueB }) => {
      const valueA = features[feature];
      const compare = operators[operator];

      if (valueA !== undefined && compare) {
        return compare(valueA, valueB);
      }
    });
  };
}

/**
 * Converts and validates matchers.
 * @param {object} matchers - serialized matchers
 * @returns {array} compiledMatchers
 *
 * @example
 * compileMatchers({
 *   'square-gte-10': { 'width-gte': 10, 'height-gte': 10 },
 *   'height-lt-5': { 'height-lt': 5 },
 * });
 *
 * [
 *   { name: 'square-gte-10', match: ({ width, height }) => width >= 10 && height >= 10 },
 *   { name: 'height-lt-5', match: ({ height }) => height < 5 },
 * ]
 */
export default function compileMatchers(matchers) {
  assertMatchers(matchers, addonPrefix);
  const compiledMatchers = [];

  Object.entries(matchers).forEach(([name, query]) => {
    const assertPrefix = `${addonPrefix} invalid matcher '${name}':`;
    assertQuery(query, assertPrefix);

    const conditions = queryToConditions(query);
    assertConditions(conditions, assertPrefix);

    if (conditions.length) {
      compiledMatchers.push({ name, match: conditionsToFunction(conditions) });
    }
  });

  return compiledMatchers;
}
