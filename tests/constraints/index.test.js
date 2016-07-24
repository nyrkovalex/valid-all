const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const { any, all, isIn, gt, gte, lt, lte, eq, maxLen, minLen, len } = require('../../src/constraints');
const { ConstraintResult, PathResult } = require('../../src/results');

chai.use(sinonChai);

const expect = chai.expect;

const okResult = ConstraintResult.ok();

describe('core constraints', () => {
  const input = { some: 'input' };
  const path = [ 'some', 'path' ];

  describe('any', () => {
    it('should call child constraint with provided value and path', () => {
      const child = sinon.spy(() => okResult);
      const validator = any(child);
      validator(input, path);
      expect(child).to.be.calledWith(input, path);
    });

    it('should call all child constraints with provided value and path', () => {
      const child = sinon.spy(() => okResult);
      const validator = any(
        () => okResult,
        child);
      validator(input, path);
      expect(child).to.be.calledWith(input, path);
    });

    it('should succeed when all children succeeded', () => {
      const validator = any(
        () => okResult,
        () => okResult
      );
      expect(validator(input, path)).to.eql(okResult);
    });

    it('should succeed when any child succeeds', () => {
      const validator = any(
        () => okResult,
        () => ConstraintResult.error(PathResult.error([], { failed: true }))
      );
      expect(validator(input, path)).to.eql(okResult);
    });

    it('should fail when all children fail', () => {
      const err1 = PathResult.error([ 'one' ], { failedOnce: true });
      const err2 = PathResult.error([ 'two' ], { failedTwice: true });

      const validator = any(
        () => ConstraintResult.error(err1),
        () => ConstraintResult.error(err2)
      );
      expect(validator(input, path)).to.eql(ConstraintResult.error(err1, err2));
    });

    it('should always succeed without children', () => {
      expect(any()(input, path)).to.eql(ConstraintResult.ok());
    });
  });

  describe('all', () => {
    it('sohould succeed whithout children', () => {
      expect(all()(input, path)).to.eql(ConstraintResult.ok());
    });

    it('should call child constraint', () => {
      const child = sinon.spy(() => okResult);
      const validator = all(child);
      validator(input, path);
      expect(child).to.be.calledWith(input, path);
    });

    it('should call all child constraints', () => {
      const child = sinon.spy(() => okResult);
      const validator = all(
        () => okResult,
        child);
      validator(input, path);
      expect(child).to.be.calledWith(input, path);
    });

    it('should succeed when all children succeeded', () => {
      const validator = all(
        () => okResult,
        () => okResult);
      expect(validator(input, path)).to.eql(okResult);
    });

    it('should fail when any child fails', () => {
      const err = PathResult.error([ 'some' ], { failed: true });
      const validator = all(
        () => ConstraintResult.error(err),
        () => okResult);
      expect(validator(input, path)).to.eql(ConstraintResult.error(err));
    });

    it('should combine child errors', () => {
      const err1 = PathResult.error(path, { failedOnce: true });
      const err2 = PathResult.error(path, { failedTwice: true });
      const validator = all(
        () => ConstraintResult.error(err1),
        () => ConstraintResult.error(err2));
      expect(validator(input, path)).to.eql(ConstraintResult.error(err1, err2));
    });
  });

  describe('isIn', () => {
    it('should fail when called without options', () => {
      expect(isIn()('DUDE', path)).to.eql(
        ConstraintResult.errorAt(path, new isIn.Error([], 'DUDE')));
    });

    it('should succeed when input is one of options', () => {
      expect(isIn('DUDE', 'WALTER')('DUDE')).to.eql(okResult);
    });

    it('should fail if input is not present in options', () => {
      expect(isIn('DUDE', 'WALTER')('DONNY', path)).to.eql(
        ConstraintResult.errorAt(path, new isIn.Error([ 'DUDE', 'WALTER' ], 'DONNY')));
    });
  });

  describe('gt', () => {
    it('should fail when called without options', () => {
      expect(gt()(42, path)).to.eql(ConstraintResult.errorAt(path, new gt.Error(undefined, 42)));
    });

    it('should succeed if value is greater than min', () => {
      expect(gt(10)(42)).to.eql(okResult);
    });

    it('should fail if value is equal to min', () => {
      expect(gt(10)(10)).to.eql(ConstraintResult.errorAt([], new gt.Error(10, 10)));
    });

    it('should fail if value is less than min', () => {
      expect(gt(10)(-10)).to.eql(ConstraintResult.errorAt([], new gt.Error(10, -10)));
    });
  });

  describe('gte', () => {
    it('should fail when called without options', () => {
      expect(gte()(42, path)).to.eql(ConstraintResult.errorAt(path, new gte.Error(undefined, 42)));
    });

    it('should succeed if value is greater than min', () => {
      expect(gte(10)(42)).to.eql(okResult);
    });

    it('should succeed if value is equal to min', () => {
      expect(gte(10)(10)).to.eql(okResult);
    });

    it('should fail if value is less than min', () => {
      expect(gt(10)(-10)).to.eql(ConstraintResult.errorAt([], new gt.Error(10, -10)));
    });
  });

  describe('lt', () => {
    it('should fail when called without options', () => {
      expect(lt()(42, path)).to.eql(ConstraintResult.errorAt(path, new lt.Error(undefined, 42)));
    });

    it('should succeed if value is less than max', () => {
      expect(lt(42)(10)).to.eql(okResult);
    });

    it('should fail if value is equal to max', () => {
      expect(lt(10)(10)).to.eql(ConstraintResult.errorAt([], new lt.Error(10, 10)));
    });

    it('should fail if value is greater than max', () => {
      expect(lt(10)(42)).to.eql(ConstraintResult.errorAt([], new lt.Error(10, 42)));
    });
  });

  describe('lte', () => {
    it('should fail when called without options', () => {
      expect(lte()(42, path)).to.eql(ConstraintResult.errorAt(path, new lte.Error(undefined, 42)));
    });

    it('should succeed if value is less than max', () => {
      expect(lte(42)(10)).to.eql(okResult);
    });

    it('should succeed if value is equal to max', () => {
      expect(lte(10)(10)).to.eql(okResult);
    });

    it('should fail if value is greater than max', () => {
      expect(lte(10)(42)).to.eql(ConstraintResult.errorAt([], new lte.Error(10, 42)));
    });
  });

  describe('lte', () => {
    it('should fail when called without options', () => {
      expect(eq()(42, path)).to.eql(ConstraintResult.errorAt(path, new eq.Error(undefined, 42)));
    });

    it('should fail if value is less than expected', () => {
      expect(eq(42)(10)).to.eql(ConstraintResult.errorAt([], new eq.Error(42, 10)));
    });

    it('should succeed if value is equal to expected', () => {
      expect(eq(10)(10)).to.eql(okResult);
    });

    it('should fail if value is greater than expected', () => {
      expect(eq(10)(42)).to.eql(ConstraintResult.errorAt([], new eq.Error(10, 42)));
    });
  });

  describe('maxLen', () => {
    it('should fail when called withput options', () => {
      expect(maxLen()('Dude')).to.eql(
        ConstraintResult.errorAt([], new maxLen.Error(undefined, 'Dude')));
    });

    it('should succeed if value length is less than max', () => {
      expect(maxLen(5)('Dude', path)).to.eql(okResult);
    });

    it('should succeed if value length is equal to max', () => {
      expect(maxLen(5)('Donny', path)).to.eql(okResult);
    });

    it('should fail if value length is greater than max', () => {
      expect(maxLen(5)('Walter', path)).to.eql(
        ConstraintResult.errorAt(path, new maxLen.Error(5, 'Walter')));
    });
  });

  describe('minLen', () => {
    it('should fail when called withput options', () => {
      expect(minLen()('Dude')).to.eql(
        ConstraintResult.errorAt([], new minLen.Error(undefined, 'Dude')));
    });

    it('should fail if value length is less than min', () => {
      expect(minLen(5)('Dude', path)).to.eql(
        ConstraintResult.errorAt(path, new minLen.Error(5, 'Dude')));
    });

    it('should succeed if value length is equal to min', () => {
      expect(minLen(5)('Donny', path)).to.eql(okResult);
    });

    it('should succeed if value length is greater than min', () => {
      expect(minLen(5)('Walter', path)).to.eql(okResult);
    });
  });

  describe('minLen', () => {
    it('should fail when called withput options', () => {
      expect(len()('Dude')).to.eql(
        ConstraintResult.errorAt([], new len.Error(undefined, 'Dude')));
    });

    it('should fail if value length is less than expected', () => {
      expect(len(5)('Dude', path)).to.eql(
        ConstraintResult.errorAt(path, new len.Error(5, 'Dude')));
    });

    it('should succeed if value length is equal to expected', () => {
      expect(len(5)('Donny', path)).to.eql(okResult);
    });

    it('should fail if value length is greater than expected', () => {
      expect(len(5)('Walter', path)).to.eql(
        ConstraintResult.errorAt(path, new len.Error(5, 'Walter')));
    });
  });
});