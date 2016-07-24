/**
 * Superclass for all validation errors.
 * Constraint implementors are encouraged to use this as a base
 * for their error description classes for the sake of uniformity.
 *
 * @abstract
 */
class NamedError {

  /**
   * Constructor to be called from implementing class.
   * It sets error name and message.
   * Name is automatically extracted from constructor function name
   * and considered a machine-readable representtion of error type.
   * Message is provided by the implementing class and should be
   * human-readable.
   *
   * @param {string} message
   */
  constructor (message) {
    this.message = message;
    this.name = this.constructor.name;
  }
}

module.exports = { NamedError };
