const { NamedError } = require('../errors');
const { ConstraintResult } = require('../results');


class RequiredConstraintError extends NamedError {
  constructor () {
    super('Value is required');
  }
}

/**
 * Checks if target value is not null or undefined and executes child constraint against it.
 * Validation passes only if both value is present and all child constraint succeedes.
 *
 * One should consider using all() and any() aggregation constraints if multiple child
 * constraints are needed.
 *
 * @example
 * const requiredLongString = required(all(
 *   type(String),
 *   minLen(100)));
 *
 * @param {Function} constraint that will be executed against provided value if it is present
 * @returns {Function}
 */
function required (child) {
  return function requiredConstraint (value, path = []) {
    if (value === undefined || value === null) {
      return ConstraintResult.errorAt(path, new RequiredConstraintError());
    }
    if (child) {
      return child(value, path);
    }
    return ConstraintResult.ok();
  };
}

module.exports = required;
module.exports.Error = RequiredConstraintError;