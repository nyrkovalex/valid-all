# valid-all
Lightweight and extendable JS validator in declarative functional style

# Usage
Usage is pretty straightforward. It fires in 3 simple steps

```javascript
// 1. require some constraints
const { all, type, required, minLen, isIn } = require('valid-all').constraints;

// 2. define a desired validation schema
const companySchema = type({
  title: required(all( // here we say that all following rules must resolve
    type(String),
    minLen(1))), // required constraint won't check for empty string
  owner: required(type({ // define a complex type
    name: required(all(
      type(String),
      minLen(1))),
    email: required(all(
      type(String),
      minLen(1))),
    phone: type(String) })), // an optional field -- no required()
  branches: required(all(
    minLen(1), // at least one item is required
    type([ // define an array of objects
      required(type({ // do not accept undefined or null as value
        address: required(all(
          type(String),
          minLen(1))),
        status: required(isIn('DRAFT', 'ACTIVE', 'DELETED')), // enum type
        note: type(String) })) ])))
});

// 3. Use it against any input
const bowlingResult = companySchema({
  title: 'Bowling inc.',
  owner: {
    name: 'Dude',
    email: 'dude@bowling.com',
    phone: '(999) 123-45-67'
  },
  branches: [
    {
      address: 'Somwhere in LA',
      status: 'ACTIVE',
      note: 'The beauty of it is its simplicity'
    }
  ]
});

// this onle is clearly OK and its result will look like

console.log(bowlingResult);
// {
//   ok: true,
//   errors: []
// }

const autobahnResult = companySchema({
  title: 'Autobahn & co',
  owner: {
    name: ''
  },
  branches: []
});

// and the nihilst guys seem to mess up with their setup somehow

console.log(autobahnResult);
// {
//   ok: false,
//   errors: [
//     { path: ['owner', 'name'], error: { ... } },
//     { path: ['owner', 'email'], error: { ... } },
//     { path: ['branches'], error: { ... } }
//   ]
// }

```

# Docs

See [github wiki](https://github.com/nyrkovalex/valid-all/wiki)
