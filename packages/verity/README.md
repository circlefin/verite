# `verity`

This package contains the Verity-specific logic for requesting, issuing, consuming, and revoking verifiable credentials.

Note that this package was written with the intent of soliciting feedback, not with the intent of being published or used in a production environment. Extracting core logic to a package made logical sense for laying out the project, but primarily aided in more easily sharing common code between demo-site, demo-wallet, and the other demos.

## Getting Started

This package is set up as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) (requires npm v7 or greater), and as such, the dependencies for all included packages are installed from the root level using `npm install`. Do not run `npm install` from this directory.
