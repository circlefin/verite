# Verite E2E Demo

This package contains examples showcasing issuance, verification, and revocation of Verifiable Credentials using the Verite protocols.

Additional examples showcase a DeFi use-case and smart contract integration, and a central custody service example in which Verifiable Credentials are generated dynamically.

## Getting Started

### Requirements

- Node.js v14
- npm v7 or greater (`npm i -g npm@7`)

### Installation

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

From the root of the monorepo, run:

```sh
npm run setup
```

### Starting the app

From the root of the monorepo, simply run:

```sh
npm run dev
```

### Folder Structure

This app is built with [next.js](https://nextjs.org/). Next.js is a development framework for React which has automatic routing (based on folder structure), server-side rendering, and other optimizations. Next.js maintains a folder structure which maps directly to app routes. For example, the file `pages/hello.tsx` would map to the route `/hello`.

The folder structure is as follows:

```
pages/       Contains top-level React components which are treated as "pages" mapped to an HTTP route
pages/api    Contains Server-Side API routes
components/  Contains shared React components
hooks/       Contains shared React hooks
lib/         Contains code shared between React front end and the API backend
prisma/    Contains the database schema and seeds
```

The root `App` React component is located in `pages/_app.tsx`. The root page for this demo is located at `pages/index.tsx`.

You can read more about the Next.js folder structure in [their documentation](https://nextjs.org/docs/basic-features/pages).

### Database

This app uses a local [sqlite](https://sqlite.org/_) database to maintain state, and uses [prisma](https://prisma.io) to access the database from code.

There are several database scripts which can be helpful during development:

#### Migrate the database

```sh
npm run db:migrate
```

#### Reset local database (rebuild and seed)

```sh
npm run db:reset
```

#### Seed local database

```sh
npm run db:seed
```

#### Inspect local database contents

```sh
npm run prisma studio
```

## Troubleshooting

### Demo faucets are not working on the Goerli Testnet

In some cases, the testnet faucets we use have run out of Eth. You should manually fill these faucets
using a Goerli faucet (such as <https://goerli-faucet.pk910.de/>).

The addresses to fill are:

- `0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1`
- `0x695f7BC02730E0702bf9c8C102C254F595B24161`

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) 
- [Sean Neville](https://github.com/psnevio) ([Circle, Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
