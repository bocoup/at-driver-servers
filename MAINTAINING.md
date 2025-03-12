# MacOS AT Driver Server Maintenance Guide

This package organizes macOS platform code within an Xcode project. It also
relies on Node.js code to expose a command-line interface; the Node.js code is
copied into place from a shared directory during publication time.

## Packaging

This project includes macOS platform-specific code as well as Node.js code. It
bundles the application code along with the installation instructions in a NPM
package. During local development, it can be useful to build the package
locally (that is, without publishing it for use by others).

### Requirements

- macOS version 13 ("Ventura") or later
- Xcode
- Node.js version 18 or later

### Instructions

1. Build the Xcode project
   1. Select `Open Existing Project...` from Xcode and navigate to `/packages/macos-at-driver-server/MacOSATDriverServer/MacOSATDriverServer.xcodeproj` in your local repository
   2. With the project open, select `Product>Build` from the top-level menu
2. Execute the following command in a terminal:

       $ npm pack

## Publishing

This project is distributed via [the Node Package
Repository](https://npmjs.org).

### Requirements

- all of the packaging requirements listed above
- authentication to publish the package to the npm registry (once approved by
  the project's maintainers, individuals can authenticate using the command
  `npm login`)

### Instructions

1. Build the Xcode project
   1. Select `Open Existing Project...` from Xcode and navigate to `/packages/macos-at-driver-server/MacOSATDriverServer/MacOSATDriverServer.xcodeproj` in your local repository
   2. With the project open, select `Product>Build` from the top-level menu
2. Execute the following command in a terminal:

       $ npm publish
