const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const type = require('../../src/constraints/type');
const { ConstraintResult, PathResult } = require('../../src/results');

chai.use(sinonChai);

const expect = chai.expect;

describe('type constraint', () => {
  describe('comparing to null and undefined', () => {
    it('should always pass for undefined', () => {
      expect(type(String)()).to.eql(ConstraintResult.ok());
    });

    it('should always pass for null', () => {
      expect(type({ name: type(String) })(null)).to.eql(ConstraintResult.ok());
    });
  });

  describe('string comparison', () => {
    const compare = type(String);

    it('should return true for String value', () => {
      expect(compare('foo')).to.eql(ConstraintResult.ok());
    });

    it('should report for provided path', () => {
      const path = [ 'some' ];
      expect(compare(200, path).errors[0].path).to.equal(path);
    });

    it('should return false for non-string value', () => {
      expect(compare(200)).to.eql(ConstraintResult.error({
        path: [],
        errors: [ new type.Error(String, Number) ]
      }));
    });
  });

  describe('number comparison', () => {
    const compare = type(Number);

    it('should return true for Number value', () => {
      expect(compare(200)).to.eql(ConstraintResult.ok());
    });

    it('should report for provided path', () => {
      const path = [ 'some' ];
      expect(compare('foo', path).errors[0].path).to.equal(path);
    });

    it('should return false for non-number value', () => {
      expect(compare('foo')).to.eql(ConstraintResult.error({
        path: [],
        errors: [ new type.Error(Number, String) ]
      }));
    });
  });

  describe('object comparison', () => {
    describe('calling field constraints', () => {
      let nameConstraint;
      let ageConstraint;
      let validator;

      let nameResult;
      let ageResult;

      const input = {
        name: 'Dude',
        age: 42
      };

      beforeEach(() => {
        nameResult = ConstraintResult.ok();
        ageResult = ConstraintResult.ok();
        nameConstraint = sinon.spy(() => nameResult);
        ageConstraint = sinon.spy(() => ageResult);

        validator = type({
          name: [ nameConstraint ],
          age: [ ageConstraint ]
        });
      });

      it('should call name field constraint', () => {
        validator(input);
        expect(nameConstraint).to.be.calledWith(input.name);
      });

      it('should call age field constraint', () => {
        validator(input);
        expect(ageConstraint).to.be.calledWith(input.age);
      });

      it('should fail with error message', () => {
        nameResult = ConstraintResult.error({
          path: [ 'name' ],
          errors: [ { failed: true } ]
        });
        expect(validator(input)).to.eql({
          ok: false,
          errors: [
            {
              path: [ 'name' ],
              errors: [
                { failed: true }
              ]
            }
          ]
        });
      });

      it('should call child constraint with value and path', () => {
        validator(input);
        expect(nameConstraint).to.be.calledWith(input.name, [ 'name' ]);
      });

      it('should call single child constraint with value and path', () => {
        validator = type({
          name: nameConstraint
        });
        validator(input);
        expect(nameConstraint).to.be.calledWith(input.name, [ 'name' ]);
      });
    });
  });

  describe('array comparison', () => {
    const value = [ 'Dude' ];
    const path = [ 'bowling' ];

    it('should match any array', () => {
      const validator = type([]);
      expect(validator(value)).to.eql(ConstraintResult.ok());
    });

    it('should call provided constraints', () => {
      const child = sinon.spy(() => ConstraintResult.ok());
      const validator = type([ child ]);
      validator(value, path);
      expect(child).to.be.calledWith(value[0], path.concat(0));
    });

    it('should fail if any constraint fail', () => {
      const error = PathResult.error([], { failed: true });
      const validator = type([
        () => ConstraintResult.error(error),
        () => ConstraintResult.ok()
      ]);
      expect(validator(value)).to.eql(ConstraintResult.error(error));
    });

    it('should fail if all constraints fail', () => {
      const validator = type([
        () => ConstraintResult.error(
          PathResult.error(path.concat(0), { failedOnce: true })),
        () => ConstraintResult.error(
          PathResult.error(path.concat(0), { failedTwice: true }))
      ]);
      expect(validator(value, path)).to.eql(ConstraintResult.error(
        PathResult.error(
          path.concat(0),
          { failedOnce: true }),
        PathResult.error(
          path.concat(0),
          { failedTwice: true })
      ));
    });

    it('should collect errors from all items', () => {
      const validator = type([
        (currVal, currPath) => ConstraintResult.error(
          PathResult.error(currPath, { failed: true }))
      ]);
      expect(validator([ 'Dude', 'Walter' ])).to.eql(ConstraintResult.error(
        PathResult.error([ 0 ], { failed: true }),
        PathResult.error([ 1 ], { failed: true })
      ));
    });
  });
});