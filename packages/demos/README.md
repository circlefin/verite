# demos

This package contains examples showcasing issuance, verification, and revocation of Verifiable Credentials using the verity protocols.

Additional examples showcase a DeFi use-case and smart contract integration, and a central custody service example in which Verifiable Credentials are generated dynamically.

# Getting Started

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.

### Database

The `demos` uses a local sqlite database to maintain state, and uses
[prisma](https://prisma.io) to access the database via code.

There are several database scripts which can be helpful during development:

#### Migrate the database

```
npm run db:migrate
```

#### Reset local database (rebuild and seed)

```
npm run db:reset
```

#### Seed local database

```
npm run db:seed
```

#### Inspect local database contents

```
npm run prisma studio
```

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Circle, Centre, Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
