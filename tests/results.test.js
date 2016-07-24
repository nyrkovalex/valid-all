const chai = require('chai');
const sinonChai = require('sinon-chai');
const { ConstraintResult, PathResult } = require('../src/results');

chai.use(sinonChai);

const expect = chai.expect;

describe('result classes', () => {
  describe('validation report', () => {
    describe('valid', () => {
      const report = ConstraintResult.ok();

      it('should be succesfull by default', () => {
        expect(report.ok).to.be.true;
      });

      it('should have no errors', () => {
        expect(report.errors).to.eql([]);
      });
    });

    describe('errorous', () => {
      const err = { failed: true };
      const report = ConstraintResult.error(err);

      it('should not be ok', () => {
        expect(report.ok).to.be.false;
      });

      it('should contain errors', () => {
        expect(report.errors).to.eql([ err ]);
      });

      it('should have path and error', () => {
        const path = [ 'some' ];
        const errors = [ { failedOnce: true }, { failedTwice: true } ];
        expect(ConstraintResult.errorAt(path, ...errors)).to.eql(
          ConstraintResult.error(PathResult.error(path, ...errors)));
      });
    });

    describe('merging reports', () => {
      const sourceErr = {
        path: [ 'bowling' ],
        errors: [ { name: 'Dude' } ]
      };
      const sourceReport = ConstraintResult.error(sourceErr);

      it('should merge report errors', () => {
        const targetErr = {
          path: [ 'bowling', 'track' ],
          errors: [ { name: 'Walter' } ]
        };
        const targetReport = ConstraintResult.error(targetErr);
        expect(sourceReport.merge(targetReport)).to.eql(ConstraintResult.error(
          sourceErr, targetErr
        ));
      });

      it('should return source report if target is ok', () => {
        const targetReport = ConstraintResult.ok();
        expect(sourceReport.merge(targetReport)).to.be.equal(sourceReport);
      });
    });

    describe('path error report', () => {
      const path = [ 'name' ];
      const error = { failed: true };

      const report = PathResult.error(path, error);

      it('should have provided path and errors', () => {
        expect(report).to.eql({
          path, errors: [ error ]
        });
      });
    });
  });
});

