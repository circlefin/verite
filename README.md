# Verity

## Packages

- [@centre/contract](./packages/contract) - A solidity contract requiring KYC proof for a transaction
- [@centre/dapp](./packages/dapp) - A front-end for the contract
- [@centre/demo-site](./packages/demo-site) - A demo walkthrough of the entire verity project
- [@centre/verity](./packages/verity) - Shared logic for issuingg, verifying, and revoking Verifiable Credentials

## Getting Started

Local environment setup is handled by running the following script:

```sh
npm run setup
```

This script will do the following:

- Install all dependencies
- Build the `@centre/verity` project
- Set up the local IP hostname for `@centre/demo-site` to be used with the wallet.
- Generate an auth JWT secret for `@centre/demo-site`
- Generate issuer and verifier DIDs and secrets for `@centre/demo-site`
- Build and migrate the database for `@centre/demo-site`

## Running the apps

To run the `demo-site` while watching for changes in `verity`, you can run

```
npm run dev
```

This will start your server at [http://localhost:3000](http://localhost:3000)

### @centre/verity:

```
npm run build:verity
```

### @centre/demo-site:

```
npm run site
```

**NOTE** To run the demo-site, you _must_ build the verity project first.

## Sample Users

The following users are added to the development environment by default:

| id  | email          | password |
| --- | -------------- | -------- |
| 1   | alice@test.com | testing  |
| 2   | bob@test.com   | testing  |

## Testing

Run tests by running

```
npm run test
```

**NOTE** Be sure to have built the `@centre/verity` package by running `npm run build:verity`.

## Developing

To run type-checking, linting, and tests, simply run:

```
npm run check
```

### Linting the codebase

```
npm run lint
```

or, with autofix:

```
npm run lint --fix
```

### Fixing with Prettier

This app uses [Prettier](https://prettier.io), and you can auto-format all files with

```
npm run format
```

### DB scripts

Run database migration script:

```
npm run db:migrate
```

Reset local database:

```
npm run db:reset
```

Seed local database:

```
npm run db:seed
```

Inspect local database contents

```
npm run prisma studio
```
