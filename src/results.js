/**
 * Error description object.
 * Used to define that some path has validation problems.
 * Instance of this object is expected by ConstraintResult.error() factory method.
 * Path result can only be errorous. There is no need to create a successfull one.
 * Use ConstraintResult.ok() function to describe validation success.
 */
class PathResult {
  /**
   * Factory function for creating an error object.
   * @param {string[]} path
   * @param {...*} errors
   * @returns {PathResult}
   */
  static error (path, ...errors) {
    return new PathResult(path, errors);
  }

  /**
   * Private constructor. Use error() factory function instead.
   * @private
   * @param {string[]} path
   * @param {*[]} [errors]
   */
  constructor (path, errors = []) {
    this.path = path;
    this.errors = errors;
  }
}

/**
 * Result of a constraint invocation either a successfull or a failed one.
 * Instance of this type is expected from any constraint function implementation.
 * Use ok() and error() static factories to create corresponding instance.
 */
class ConstraintResult {
  /**
   * Creates a successfull result. This means that all checks have passed.
   * @returns {ConstraintResult}
   */
  static ok () {
    return new ConstraintResult();
  }

  /**
   * Creates an errorous result if called with at least one error argument.
   * This result means that that checks were not passed.
   * Please note that this may as well produce a successfull result if called
   * with no errros.
   * This method expects PathResult objects as error descriptions.
   *
   * @param {...PathResult} errors
   * @returns {ConstraintResult}
   */
  static error (...errors) {
    return new ConstraintResult(errors);
  }

  /**
   * A shorthand method for creating an errorous result containing single error on
   * the path.
   *
   * @param {string[]} path
   * @param {...*} errors
   * @returns {ConstraintResult}
   */
  static errorAt (path, ...errors) {
    return new ConstraintResult([ PathResult.error(path, ...errors) ]);
  }

  /**
   * Private constructor. Use ok() and error() factory functions instead.
   * @param {PathResult[]} errors
   * @private
   */
  constructor (errors = []) {
    this.ok = errors.length === 0;
    this.errors = errors;
  }

  /**
   * Merges current result with the other one.
   * This method does not mutate any of results, instead it creates a new one
   * containing all errors from both current and provided resutls.
   *
   * @param {ConstraintResult} other result to merge with
   * @returns {ConstraintResult} newly created result
   */
  merge (other) {
    return other.ok ? this : ConstraintResult.error(...this.errors, ...other.errors);
  }
}

module.exports = {
  ConstraintResult, PathResult
};
