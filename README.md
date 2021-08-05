# Verity

## Packages

- [@centre/demo-site](./packages/demo-site)
- [@centre/verity](./packages/verity)

## Getting Started

```
npm install
npm run db:migrate
```

### Configuring your Local Environment

To enable interactions with the mobile wallet, we need to configure our local environment file `packages/demo-site/.env.development.local`:

1. Point to an IP address rather than localhost
2. Contain a JWT secret key

For example:

```sh
touch packages/demo-site/.env.development.local
echo "HOSTNAME=192.168.4.31" >> packages/demo-site/.env.development.local
echo "AUTH_JWT_SECRET=<SECRET_KEY>" >> packages/demo-site/.env.development.local
```

## Running the apps

To run the `demo-site` while watching for changes in `verity`, you can run

```
npm run dev
```

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

To minimize dependencies, we use an in-memory data store in lieu of a database.
The following users are added by default:

| id  | email          | password |
| --- | -------------- | -------- |
| 1   | alice@test.com | testing  |
| 2   | bob@test.com   | testing  |

## Testing

Run tests by running

```
npm run test
```

**NOTE** Be sure to have built `verity` by running `npm run build:verity`

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
