# Verite Wallet

## Getting Started

See the [Setting up the development environment](https://reactnative.dev/docs/environment-setup) documentation for React Native CLI.

The instructions suggest using the default system ruby, but it works just as well with a version manager such as asdf.

First run and after updating dependencies, you will need to update NPM and CocoaPod dependencies:

```
npm install
```

## Install Expo Go

Install [Expo Go](https://expo.dev/client). This is where the app will run in development.

## Running the App

```
npm start
```

### Running on Device

- Scan the QR code with your phone's camera. This will launch Expo Go.

## Updating Verite Library

React Native does not play nice with symlinks and NPM workspaces so we could not directly link the [`@centrehq/verite`](https://github.com/centrehq/verite/tree/main/packages/verite) project as a dependency. As such, we manually copy the code into this project. We have included a bin script that will do most of the heavy lifting. See the script's contents for complete instructions.

```
./bin/update-verite
```

That command is only sufficient to copy of the code. Any additional changes, e.g. adding new dependencies, would require manually updating demo-wallet's `package.json` oneself.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) ([Centre Consortium](https://centre.io))
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
