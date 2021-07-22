# Verity

## Packages

- [demo-site](./packages/demo-site)
- [demo-wallet](./packages/demo-wallet)
- [verity](./packages/verity)

## Getting Started

```
npm run bootstrap
```

## Running the apps

To run the `demo-site` while watching for changes in `vertity`, you can run

```
npm run dev
```

### verity:

```
npm run build:verity
```

### demo-site:

```
npm run site
```

**NOTE** To run the demo-site, you _must_ build the verity project first.

### demo-wallet:

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
