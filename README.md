# Verity

## Packages

- [@centre/demo-site](./packages/demo-site)
- [@centre/verity](./packages/verity)

## Getting Started

```
npm run bootstrap
```

## Running the apps

### @centre/verity:

```
npm run build:verity
```

### @centre/demo-site:

```
npm run site
```

**NOTE** To run the demo-site, you _must_ build the verity project first.

### @centre/demo-wallet:

```
npm run metro
```

See the [demo-wallet README](https://github.com/centrehq/demo-site/blob/main/packages/demo-wallet/README.md) for details on how to run on simulator versus device.

## Testing

Run tests by running

```
npm run test
```

**NOTE** Be sure to have built `verity` by running `npm run build:verity`

### Linting the codebase

```
npm run lint
```

### Fixing with Prettier

This app uses [Prettier](https://prettier.io), and you can auto-format all files with

```
npm run format
```
