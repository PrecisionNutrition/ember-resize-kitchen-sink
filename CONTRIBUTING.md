# How To Contribute

## Installation

- `git clone https://github.com/PrecisionNutrition/ember-resize-kitchen-sink.git`
- `cd ember-resize-kitchen-sink`
- `yarn`

Note that this package is organized as a monorepo for ease of development.

## Linting

- `lerna run lint`
- `lerna run lint:fix`

## Running tests

- `lerna run test:ember` – Runs the test suite on the current Ember version
  for all members of this monorepo.
- `cd <package>; ember test --server` – Runs the test suite in "watch mode" for
  a given package
- `lerna run test:ember-compatibility` – Runs the test suite against multiple
  Ember versions for all members of this monorepo.

## Running the dummy application

- `cd <package>; ember serve`
- Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
