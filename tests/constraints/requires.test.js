const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const required = require('../../src/constraints/required');
const { ConstraintResult } = require('../../src/results');

chai.use(sinonChai);

const expect = chai.expect;

describe('constraints', () => {
  describe('required constraint', () => {
    const path = [ 'some' ];

    it('should fail if value is undefined', () => {
      expect(required()(undefined, path)).to.eql(ConstraintResult.error({
        path,
        errors: [ new required.Error() ]
      }));
    });

    it('should fail if value is null', () => {
      expect(required()(null, path)).to.eql(ConstraintResult.error({
        path,
        errors: [ new required.Error() ]
      }));
    });

    it('shoult pass if value is present', () => {
      expect(required()(1)).to.eql(ConstraintResult.ok());
    });

    it('should return true for falsy values', () => {
      expect(required()(false)).to.eql(ConstraintResult.ok());
    });

    it('should succedd if child constraint passes', () => {
      expect(required(() => ConstraintResult.ok())(1)).to.eql(
        ConstraintResult.ok());
    });

    it('should fail if child constraint fails', () => {
      const err = ConstraintResult.error({ failed: true });
      expect(required(() => err)(1)).to.eql(err);
    });

    it('should call constraint function against checked value and path', () => {
      const value = { value: true };
      const constraint = sinon.spy(() => ConstraintResult.ok());
      required(constraint)(value, path);
      expect(constraint).to.be.calledWith(value, path);
    });
  });
});
