# Verity

## Packages

- [@centre/contract](./packages/contract) - A solidity contract requiring KYC proof for a transaction
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

## Running the Apps

It's recommended to run hardhat and the demo-site separately.

```sh
npm run hardhat:node
```

then, in a new tab:

```sh
npm run hardhat:deploy
npm run dev
```

Or, if you want to run everything together, simply run:

```sh
npm run dev:all
```

## Running the Apps with ngrok

If using the demo mobile identity wallet, the server will automatically configure itself to use your local IP address. However, you can optionally create a tunnel through ngrok instead. Note, you must use `https` as it is required by iOS.

```
ngrok http 3000
NGROK_HOST=https://f15f3dcbc823.ngrok.io npm run dev
```

### Manually running services:

First, you need to run a hardhat node on it's own terminal tab:

```sh
npm run hardhat:node
```

Next, you must deploy the contract:

```
npm run hardhat:deploy
```

Next, build verity:

```sh
npm run build:verity
```

Now you can run the `demo-site`:

```sh
npm run dev:site
```

This will start your server at [http://localhost:3000](http://localhost:3000)

### @centre/verity:

To build the shared @centre/verity package, run:

```sh
npm run build:verity
```

To watch for changes to @centre/verity, run:

```sh
npm run dev:verity
```

### @centre/demo-site:

```
npm run dev:site
```

**NOTE** To run the demo-site, you _must_ build the verity project first.

### @centre/contract

Run a standalone ethereum network using hardhat in a separate terminal

```
npm run hardhat:node
```

Deploy the contract

```
npm run hardhat:deploy
```

You can find more [detailed information](./packages/contract) in the package.

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
