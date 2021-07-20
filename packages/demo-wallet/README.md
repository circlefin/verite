# Verity Wallet

## Getting Started

See the [Setting up the development environment](https://reactnative.dev/docs/environment-setup) documentation for React Native CLI.

The instructions suggest using the default system ruby, but it works just as well with a version manager such as asdf.

First run and after updating dependencies, you will need to update NPM and CocoaPod dependencies:

```
npm install
cd ios
pod install
```

## Running the App

```
npm run ios
```

### Running on Device

- Follow React Native's ["Running on Device" instructions](https://reactnative.dev/docs/running-on-device) for the appropriate target OS and development OS
- Ensure the app is authorized to run on your phone. On iPhone, this setting is in Settings > General > Device Management
- In the demo-site project, ensure your `HOSTNAME` environment variable is updated with a value accessible on your network; e.g., `HOSTNAME=192.168.1.8`

#### iOS-specific Notes

For now, we are creating our own placeholder provisioning profiles to generate signed builds for running on device. We may later set up an Apple developer team to enable easier sharing of builds.

Tips for generating signed builds:

- Set up code signing in xcode
  - See [examples with screenshots](https://help.apple.com/xcode/mac/current/#/dev23aab79b4)
- You'll need to create a unique bundle identifier (but don't check it in)

#### Other Tips

- If it fails because it can't find path to node, try out [this solution](https://stackoverflow.com/q/67337836)
- General quirkiness? Try resetting state within the Verity app (Settings > "Clear App Data")
- App still quirky and that didn't help? Try the nuclear option:

```
watchman watch-del-all
rm -rf node_modules/
rm package-lock.json
rm -rf /tmp/metro-*
npm cache clean
```
