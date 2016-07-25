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
# API

## Constraints

All constraints are exposed as a factory functions that will or will not take some
options and return an actual checker.

Each constraint function also exposes its error type as a static property, e.g.
`type.Error`. They can be used to check constrint report and determine an error type.

This is also a recommended pattern for all constraint implementors.


### type

`type (schema: any): Function`

Validates input by schema description.

#### Params:
* `schema` - a type description target inut must meet.
  May be an object, an array or any oter type.
  For details on how each defenition is treated see below.
  * `null` or `undefined` values will always be treated like matching.
    It is a job of `required()` constraint to deal with them.
  * `Object` literal will be treated as object schema and input will be validated
    by matching each constraint function against the value of its key in input object.
  * `Array` literal will also be considered a validation schema where in order to succeed
    input must meet all child constraints.
    In order to define any multi-constraint array type, e.g. a multitype array use {@link constraints.any}
    constraint
  * Anything else will be considered a simple type and checked by matching input prototype against
    provided type's prototype

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Examples
```javascript
const user = type({
  name: type(String)
  settings: type([
    type({
      key: required(type(String)),
      value: required(type(String))
    })
  ])
});

const stringArray = type([ type(String) ]);

const stringOrNumberArray = type([ any(type(String), type(Number)) ]);

const userArray = type([
  type({
    name: type(String),
    age: type(Number)
  })
]);
```


### required

`required (child: Function): Function`

Checks if target value is not null or undefined and executes child constraint against it.
Validation passes only if both value is present and all child constraint succeed.

_One should consider using `all()` and `any()` aggregation constraints if multiple child
constraints are needed._

#### Params

* `child` - constraint function that will be evaluated if `required()` check passes.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example

```javascript
const requiredLongString = required(all(
  type(String),
  minLen(100)));
```


### any

`any (...constraints: Function): Function`

Aggregates child constraints with _OR_ logic.

Creates a constraint function that succeedes when any of its children succeed.

#### Params
* `constraints` - child constraints. `any()` will succeed if any of `constraints` passes.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const numberOrString = any(type(Number), type(String));
```


### all

`all (...constraints: Function): Function`

Aggregates child constraints with _AND_ logic.

Creates a constraint function that succeedes when all of its children succeed.

#### Params
* `constraints` - child constraints. `all()` will succeed only if all of `constraints` pass.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const notEmptyString = all(type(String), minLen(1));
```


### isIn

`isIn (...options: any): Function`

Creates a constraint function that checks if current input is present
among provided options.

_This constraint does not perform deep object comparison. It just checkes whether
options include arget input value._

#### Params
* `options` - possible values. Can be of any type, but `isIn()` won't do deep comparison.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const shouldWeTakeAshley = isIn('YES', 'OF COURSE', 'ABSOLUTELY');
```


### gt (greater than)

`gt (min: any): Function`

Creates a constraint that checks if value is greater than provided minimum.

_To check if value is greater than or equal to min use `gte()` constraint._

#### Params
* `min` - minimum value (not included). Must be something comparable.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const powerLevel = gt(9000);
```


### gte (greater than or equal to)

`gte (min: any): Function`

Creates a constraint that checks if value is greater than or equal to provided minimum.

_To check if value is strictly greater than min use `gt()` constraint._

#### Params
* `min` - minimum value (included). Must be something comparable.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const canBuyBooze = gte(21);
```


### lt (less than)

`lt (max: any): Function`

Creates a constraint that checks if value is strictly less than provided maximum.

_To check if value is less than or equal to max use `lte()` constraint._

#### Params
* `max` - maximum value (not included). Must be something comparable.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const tooYoungToDrive = lt(16);
```


### lte (less than or equal to)

`lte (max: any): Function`

Creates a constraint that checks if value is less than or equal to provided maximum.

_To check if value is striclty less than max use `lt()` constraint._

#### Params
* `max` - maximum value (included). Must be something comparable.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const stillInGame = lte(21);
```


### eq (equals)

`eq (expected: any): Function`

Creates a constraint that checks if value is strictly equal to provided expectation.

_This constraint does not perform deep comparison. It just checks for strcit equality._

#### Params
* `expected` - expectd value of a field.

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const catLives = eq(9);
```


### minLen (minimum length)

`minLen (min: number): Function`

Creates a constraint that succeedes when length of target value is greater than
or equal to provided minimum.

Can be used to compare `Array`s, `String`s and everything that has a `.length` property.

#### Params
* `min` - minimum acceptable length

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const passwordLen = minLen(8);
```


### maxLen (maximum length)

`maxLen (max: number): Function`

Creates a constraint that succeedes when length of target value is less than
or equal to provided minimum.

Can be used to compare `Array`s, `String`s and everything that has a `.length` property.

#### Params
* `max` - maximum acceptable length

#### Returns
* A constraint function that return an instance of `ConstraintResult` class when called.

#### Example
```javascript
const enoughForAll = maxLen(140);
```


### len (length)

`len (length: number): Function`

Creates a constraint that succeedes when length of target value is exactly
equal to provided number.

#### Params
* `length` - expected length

#### Example
```javascript
const questionsToCrossTheBridge = len(3);
```