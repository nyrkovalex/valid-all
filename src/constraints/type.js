const { NamedError } = require('../errors');
const { PathResult, ConstraintResult } = require('../results');

class TypeConstraintError extends NamedError {
  constructor (expectedType, actualType) {
    super('Type mismatch');
    this.expectedType = expectedType;
    this.actualType = actualType;
  }
}


function checkPrototypeOf (typeFn, value) {
  return Object.getPrototypeOf(value) === typeFn.prototype;
}


function isNullOrUndefined (value) {
  return value === null || value === undefined;
}


function simpleTypeConstraint (expectedType, value, path = []) {
  return checkPrototypeOf(expectedType, value)
    ? ConstraintResult.ok()
    : ConstraintResult.error(PathResult.error(
      path, new TypeConstraintError(expectedType, value.constructor)));
}


function objectTypeConstraint (schema, value, path = []) {
  return Object.keys(schema).reduce(
    (schemaResult, schemaKey) => schemaResult.merge(
      checkKeyConstraints(
        value[schemaKey],
        path.concat(schemaKey),
        schema[schemaKey])),
    ConstraintResult.ok()
  );
}


function checkKeyConstraints (value, path, constraints) {
  return (constraints.reduce instanceof Function ? constraints : [ constraints ])
    .reduce(
      (keyResult, constraint) => keyResult.merge(constraint(value, path)),
      ConstraintResult.ok()
    );
}


function arrayTypeConstraint (schema, value, path = []) {
  return schema.length === 0
    ? ConstraintResult.ok()
    : value.reduce(
      (schemaResult, item, index) => schemaResult.merge(schema.reduce(
        (itemResult, constraint) => itemResult.merge(constraint(item, path.concat(index))),
        ConstraintResult.ok())),
      ConstraintResult.ok());
}


/**
 * Validates input by schema description.
 * Input may be of any type, while validation techniques will differ:
 *
 * - Null or undefined values will always be treated like matching.
 * It is a job of required() constraint to deal with them.
 *
 * - Object literal will be treated as object schema and input will be validated
 * by matching each constraint function against the value of its key in input object.
 *
 * @example
 * const user = type({
 *   name: type(String)
 *   settings: type([
 *     type({
 *       key: required(type(String)),
 *       value: required(type(String))
 *     })
 *   ])
 * })
 *
 * - Array literal will also be considered a validation schema where in order to succeed
 * input must meet all child constraints.
 * In order to define any multi-constraint array type, e.g. a multitype array use {@link constraints.any}
 * constraint
 *
 * @example
 * const stringArray = type([ type(String) ]);
 * const stringOrNumberArray = type([ any(type(String), type(Number)) ]);
 * const userArray = type([
 *   type({
 *     name: type(String),
 *     age: type(Number)
 *   })
 * ]);
 *
 * - Anything else will be considered a simple type and checked by matching input prototype against
 * provided type's prototype
 *
 * @param {Function} targetType
 * @returns {Function}
 */
function type (targetType) {
  return function typeConstraint (value, path = []) {
    if (isNullOrUndefined(value)) {
      return ConstraintResult.ok();
    }

    if (checkPrototypeOf(Object, targetType)) {
      return objectTypeConstraint(targetType, value, path);
    }

    if (checkPrototypeOf(Array, targetType)) {
      return arrayTypeConstraint(targetType, value, path);
    }

    return simpleTypeConstraint(targetType, value, path);
  };
}


module.exports = type;
module.exports.Error = TypeConstraintError;