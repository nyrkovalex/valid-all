const { expect } = require('chai');
const { type, required, all, any, gt, gte, lt, lte, eq, maxLen, minLen, len } = require('../src/constraints');
const { ConstraintResult, PathResult } = require('../src/results');

const COMPLEX_CASE = type({
  title: required(all(
    type(String),
    minLen(1),
    maxLen(20))),
  owner: required(
    type({
      name: required(all(
        type(String),
        minLen(1))),
      email: required(all(
        type(String)
        // TODO: regex here
      )),
      phone: type(String)
    })
  ),
  branches: required(all(
    type([
      type({
        address: required(type(String)),
        isActive: required(type(Boolean))
      })
    ]),
    minLen(1)))
});

const samples = [
  {
    name: 'should check a string type',
    constraint: type(String),
    value: 'foo',
    ok: true
  },
  {
    name: 'should fail a number check',
    constraint: type(Number),
    value: 'foo',
    ok: false,
    errors: [ PathResult.error([], new type.Error(Number, String)) ]
  },
  {
    name: 'should check a plain object',
    constraint: type({
      name: [ type(String) ],
      age: [ type(Number) ]
    }),
    value: {
      name: 'Dude',
      age: 42
    },
    ok: true
  },
  {
    name: 'should fail a plain object check',
    constraint: type({
      name: [ type(String) ],
      age: [ type(Number) ]
    }),
    value: {
      name: 404,
      age: 'old'
    },
    ok: false,
    errors: [
      PathResult.error([ 'name' ], new type.Error(String, Number)),
      PathResult.error([ 'age' ], new type.Error(Number, String))
    ]
  },
  {
    name: 'should check recursive declaration',
    constraint: type({
      person: [
        type({
          name: [ type(String) ],
          age: [ type(Number) ]
        })
      ]
    }),
    value: {
      person: {
        name: 'Dude',
        age: 42
      }
    },
    ok: true
  },
  {
    name: 'should fail recursive declaration',
    constraint: type({
      person: [
        type({
          name: [ type(String) ],
          age: [ type(Number) ]
        })
      ]
    }),
    value: {
      person: {
        name: 404,
        age: 'old'
      }
    },
    ok: false,
    errors: [
      PathResult.error([ 'person', 'name' ], new type.Error(String, Number)),
      PathResult.error([ 'person', 'age' ], new type.Error(Number, String))
    ]
  },
  {
    name: 'should check a required value',
    constraint: required(),
    value: 'I am here',
    ok: true
  },
  {
    name: 'should fail required check',
    constraint: required(),
    value: undefined,
    ok: false,
    errors: [
      PathResult.error([], new required.Error())
    ]
  },
  {
    name: 'should check required field within a type',
    constraint: type({
      name: required(),
      age: type(Number)
    }),
    value: {
      name: 'Dude',
      age: 42
    },
    ok: true
  },
  {
    name: 'should fail required check within a type',
    constraint: type({
      name: required(),
      age: type(Number)
    }),
    value: {
      age: 42
    },
    ok: false,
    errors: [
      PathResult.error([ 'name' ], new required.Error())
    ]
  },
  {
    name: 'should pass required check with child constraints',
    constraint: required(type(String)),
    value: 'Dude',
    ok: true
  },
  {
    name: 'should fail required check with child constraints',
    constraint: required(type(String)),
    value: 400,
    ok: false,
    errors: [
      PathResult.error([], new type.Error(String, Number))
    ]
  },
  {
    name: 'should validate empty array type',
    constraint: type([]),
    value: [ 'anhything' ],
    ok: true
  },
  {
    name: 'should validate string array type',
    constraint: type([ type(String) ]),
    value: [ 'string' ],
    ok: true
  },
  {
    name: 'should validate an array of required strings',
    constraint: type([ required(type(String)) ]),
    value: [ 'string' ],
    ok: true
  },
  {
    name: 'should fail required and type validation',
    constraint: type([ required(type(String)) ]),
    value: [ 'string', null, 42 ],
    ok: false,
    errors: [
      PathResult.error([ 1 ], new required.Error()),
      PathResult.error([ 2 ], new type.Error(String, Number))
    ]
  },
  {
    name: 'should validate string or number array type',
    constraint: type([ any(type(String), type(Number)) ]),
    value: [ 'string', 42 ],
    ok: true
  },
  {
    name: 'should fail strng array constraint',
    constraint: type([ type(String) ]),
    value: [ 'Dude', 42 ],
    ok: false,
    errors: [
      PathResult.error([ 1 ], new type.Error(String, Number))
    ]
  },
  {
    name: 'should fail object array constraint',
    constraint: type([
      type({
        name: type(String),
        age: type(Number)
      })
    ]),
    value: [
      { name: 'Dude', age: 42 },
      { name: 40, age: 'Walter' }
    ],
    ok: false,
    errors: [
      PathResult.error([ 1, 'name' ], new type.Error(String, Number)),
      PathResult.error([ 1, 'age' ], new type.Error(Number, String))
    ]
  },
  {
    name: 'should succeed combining gt and lt constraints',
    constraint: all(gt(5), lt(10)),
    value: 7,
    ok: true
  },
  {
    name: 'should fail combining gt and lt constraints',
    constraint: all(gt(5), lt(10)),
    value: 20,
    ok: false,
    errors: [
      PathResult.error([], new lt.Error(10, 20))
    ]
  },
  {
    name: 'should succeed combining length of 5 or 6 for Donny',
    constraint: any(len(5), len(6)),
    value: 'Donny',
    ok: true
  },
  {
    name: 'should succeed combining length of 5 or 6 for Walter',
    constraint: any(len(5), len(6)),
    value: 'Walter',
    ok: true
  },
  {
    name: 'should fail combining length of 5 or 6 for Dude',
    constraint: any(len(5), len(6)),
    value: 'Dude',
    ok: false,
    errors: [
      PathResult.error([], new len.Error(5, 'Dude')),
      PathResult.error([], new len.Error(6, 'Dude'))
    ]
  },
  {
    name: 'should succeed with gte and lte',
    constraint: all(gte(10), lte(10)),
    value: 10,
    ok: true
  },
  {
    name: 'should fail with gte and lte',
    constraint: all(gte(11), lte(9)),
    value: 10,
    ok: false,
    errors: [
      PathResult.error([], new gte.Error(11, 10)),
      PathResult.error([], new lte.Error(9, 10))
    ]
  },
  {
    name: 'should succeed with min and max len',
    constraint: all(minLen(5), maxLen(7)),
    value: 'Walter',
    ok: true
  },
  {
    name: 'should fail with min len',
    constraint: all(minLen(5), maxLen(7)),
    value: 'Dude',
    ok: false,
    errors: [
      PathResult.error([], new minLen.Error(5, 'Dude'))
    ]
  },
  {
    name: 'should fail with max len',
    constraint: all(minLen(5), maxLen(7)),
    value: 'El Duderino',
    ok: false,
    errors: [
      PathResult.error([], new maxLen.Error(7, 'El Duderino'))
    ]
  },
  {
    name: 'should pass an equality check',
    constraint: eq('Dude'),
    value: 'Dude',
    ok: true
  },
  {
    name: 'should fail an equality check',
    constraint: eq('Dude'),
    value: 'Walter',
    ok: false,
    errors: [
      PathResult.error([], new eq.Error('Dude', 'Walter'))
    ]
  },
  {
    name: 'should pass a complex type case',
    constraint: COMPLEX_CASE,
    value: {
      title: 'Bowling inc.',
      owner: {
        name: 'Dude',
        email: 'dude@bowling.com',
        phone: '123123123'
      },
      branches: [
        {
          address: 'Elm Street 13',
          isActive: true
        }
      ]
    },
    ok: true
  },
  {
    name: 'should fail complex case without some data',
    constraint: COMPLEX_CASE,
    value: {
      owner: {
        name: ''
      },
      branches: []
    },
    errors: [
      PathResult.error([ 'title' ], new required.Error()),
      PathResult.error([ 'owner', 'name' ], new minLen.Error(1, '')),
      PathResult.error([ 'owner', 'email' ], new required.Error()),
      PathResult.error([ 'branches' ], new minLen.Error(1, []))
    ]
  }
];


describe('usage examples', () => {
  samples.forEach((sample) => {
    it(sample.name, () => {
      expect(sample.constraint(sample.value)).to.eql(
        sample.ok
          ? ConstraintResult.ok()
          : ConstraintResult.error(...sample.errors));
    });
  });
});