# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [0.5.0 & 0.5.1] - 2020-12-18

### Changed

- **Minor Breaking Change:** The `set` function will now filter incoming updates and discard any that don't actually change the value that is currently in the store. Listeners will only receive the _actual_ changes to a store, and components will only re-render when a watched store property has actually changed to a new value. This change was made to allow for easier [integration with libraries like Immer](https://codesandbox.io/s/statery-immer-vr9b2?file=/src/App.tsx:592-783) that produce a complete new version of the store.

## [0.4.0] - 2020-12-17

### Added

- `set` now returns the updated version of the state (instead of `void`.)

### Changed

- **Breaking change:** The nature of `subscribe` callbacks has changed. Whenever a store is updated, each listener callback will now be invoked exactly _once_, with an object containing the applied changes as the first argument, and the current version of the state as the second.
- The bundles generated for the NPM package are now minified through [terser](https://github.com/terser/terser).

### Fixed

- No more "Rendered fewer hooks than expected" surprises! ([#1](https://github.com/hmans/statery/issues/1))

## [0.3.0] - 2020-12-16

- First release. Exciting times!
