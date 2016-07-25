const { NamedError } = require('../errors');
const { ConstraintResult } = require('../results');

/**
 * Creates a constraint function that succeedes when any of its
 * children succeed.
 *
 * @param {...Function} constraints
 * @returns {Function}
 */
function any (...constraints) {
  return function anyConstraint (value, path) {
    return constraints.length === 0
      ? ConstraintResult.ok()
      : constraints
        .map((child) => child(value, path))
        .reduce((left, right) => (left.ok || right.ok)
          ? ConstraintResult.ok()
          : left.merge(right));
  };
}

/**
 * Creates a constraint function that succeedes when all of its
 * children succeed.
 *
 * @param {...Function} constraints
 * @returns {Function}
 */
function all (...constraints) {
  return function allConstraint (value, path) {
    return constraints.reduce(
      (allResult, child) => allResult.merge(child(value, path)),
      ConstraintResult.ok());
  };
}


class IsInError extends NamedError {
  constructor (options, value) {
    super('Value is not among expected options');
    this.options = options;
    this.value = value;
  }
}

/**
 * Creates a constraint function that checks if current input is present
 * among provided options.
 * This constraint does not perform deep object comparison. It just checkes whether
 * options include arget input value.
 *
 * @param {...*} options
 * @returns {Function}
 */
function isIn (...options) {
  return function isInConstraint (value, path = []) {
    return options.includes(value)
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new IsInError(options, value));
  };
}

isIn.Error = IsInError;


class GtError extends NamedError {
  constructor (min, value) {
    super(`Expected value (${value}) to be strictly greater than min (${min})`);
    this.min = min;
    this.value = value;
  }
}

/**
 * Creates a constraint that checks if value is greater than provided minimum.
 * To check if value is greater than or equal to use gte() constraint.
 *
 * @param {*} min
 * @returns {Function}
 */
function gt (min) {
  return function gtConstraint (value, path = []) {
    return value > min
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new GtError(min, value));
  };
}

gt.Error = GtError;


class GteError extends NamedError {
  constructor (min, value) {
    super(`Expected value (${value}) to be greater than or equal to min (${min})`);
    this.min = min;
    this.value = value;
  }
}

/**
 * Creates a constraint that checks if value is greater than or equal to provided minimum.
 * To check if value is strictly greater than min use gt() constraint.
 *
 * @param {*} min
 * @returns {Function}
 */
function gte (min) {
  return function gteConstraint (value, path = []) {
    return value >= min
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new GteError(min, value));
  };
}

gte.Error = GteError;


class LtError extends NamedError {
  constructor (max, value) {
    super(`Expected value (${value}) to be strictly less than max (${max})`);
    this.max = max;
    this.value = value;
  }
}

/**
 * Creates a constraint that checks if value is strictly less than provided maximum.
 * To check if value is less than or equal to use lte() constraint.
 *
 * @param {*} max
 * @returns {Function}
 */
function lt (max) {
  return function ltConstraint (value, path = []) {
    return value < max
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new LtError(max, value));
  };
}

lt.Error = LtError;


class LteError extends NamedError {
  constructor (max, value) {
    super(`Expected value (${value}) to be less than or equal to max (${max})`);
    this.max = max;
    this.value = value;
  }
}

/**
 * Creates a constraint that checks if value is less than or equal to provided maximum.
 * To check if value is strictly less than or equal to use lt() constraint.
 *
 * @param {*} max
 * @returns {Function}
 */
function lte (max) {
  return function ltConstraint (value, path = []) {
    return value <= max
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new LteError(max, value));
  };
}

lte.Error = LteError;


class EqError extends NamedError {
  constructor (expected, value) {
    super(`Value (${value}) must be equal to expected (${expected})`);
    this.expected = expected;
    this.value = value;
  }
}

/**
 * Creates a constraint that checks if value is strictly equal to provided expectation.
 * This constraint does not perform deep comparison. It just checks for strcit equality.
 *
 * @param {*} expected
 * @returns {Function}
 */
function eq (expected) {
  return function eqConstraint (value, path = []) {
    return value === expected
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new EqError(expected, value));
  };
}

eq.Error = EqError;


class MaxLenError extends NamedError {
  constructor (max, value) {
    super(`Expected value (${value}) to have maximum length of maxLen (${max})`);
    this.value = value;
    this.maxLen = max;
    this.valueLength = value.length;
  }
}

/**
 * Creates a constraint that succeedes when length of target value is less than
 * or equal to provided maximum.
 *
 * @param {number} max
 * @returns {Function}
 */
function maxLen (max) {
  return function maxLenConstraint (value, path = []) {
    return value.length <= max
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new MaxLenError(max, value));
  };
}

maxLen.Error = MaxLenError;


class MinLenError extends NamedError {
  constructor (min, value) {
    super(`Expected value (${value}) to have minimum length of minLen (${min})`);
    this.value = value;
    this.minLen = min;
    this.valueLength = value.length;
  }
}

/**
 * Creates a constraint that succeedes when length of target value is greater than
 * or equal to provided minimum.
 *
 * @param {number} min
 * @returns {Function}
 */
function minLen (min) {
  return function maxLenConstraint (value, path = []) {
    return value.length >= min
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new MinLenError(min, value));
  };
}

minLen.Error = MinLenError;


class LenError extends NamedError {
  constructor (length, value) {
    super(`Expected value (${value}) to have length of exactly len (${length})`);
    this.value = value;
    this.len = length;
    this.valueLength = value.length;
  }
}

/**
 * Creates a constraint that succeedes when length of target value is exactly
 * equal to provided number.
 *
 * @param {number} length
 * @returns {Function}
 */
function len (length) {
  return function maxLenConstraint (value, path = []) {
    return value.length === length
      ? ConstraintResult.ok()
      : ConstraintResult.errorAt(path, new LenError(length, value));
  };
}

len.Error = LenError;


module.exports = {
  any,
  all,
  isIn,
  gt,
  gte,
  lt,
  lte,
  eq,
  maxLen,
  minLen,
  len,
  required: require('./required'),
  type: require('./type')
};