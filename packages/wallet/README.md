# Verite Wallet

## Getting Started

```sh
npm install
```

## Install Expo Go on your mobile device

Install [Expo Go](https://expo.dev/client). This is where the app will run in development.

## Running the App

From the root of the monorepo, you can run

```sh
npm run wallet
```

Or, from the packages/wallet directory, you can run:

```sh
npm start
```

The console will display a QR code.

On iOS, you can scan the QR code with the camera app. This will launch Expo Go.
On Android, you can launch Expo Go and scan the QR code from within Expo Go.

Once you've scanned the code once, you can launch Expo Go and the app will be listed in the "Recently Opened" list.

## Design Notes

The Verite wallet is a sample implementation of core Verite flows, but it makes some simplifications in its initial implementation. PRs to address these limitations are welcome.

1. Manifest input/output descriptor to credential mapping
   - The wallet assumes manifest input/output descriptor IDs have a 1-1 mapping to Verifiable Credential types. It uses this assumption to look up manifests / credentials for purposes of display and exchange.
2. Assumes only 1 VC at a time is issued

- The wallet assumes only 1 VC at a time is issued, but note that the main Verite libraries can support issuance/exchange of more than one VC at a time.

## Contributors

- [Kim Hamilton Duffy](https://github.com/kimdhamilton) 
- [Sean Neville](https://github.com/psnevio) ([Xdotzero](http://xdotzero.com))
- [Brice Stacey](https://github.com/bricestacey) ([M2 Labs](https://m2.xyz))
- [Matt Venables](https://github.com/venables) ([M2 Labs](https://m2.xyz))
