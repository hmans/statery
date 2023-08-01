# Changelog

## 0.7.0

### Minor Changes

- 8928b16: Statery's React hooks now internally use React 18's new `useSyncExternalStore` hook. This simplifies the library implementation and makes sure that store updates don't cause UI drift. (Thanks @smartinio!)
- 8c555e2: This package is now built using TypeScript 5.1.

## 0.6.3

### Patch Changes

- a9923df: **Fixed:** The library recently started using `useLayoutEffect` instead of `useEffect`, breaking it in SSR environments, where usage of that hook throws errors. This has been fixed. (Thanks @daveschumaker!)

## 0.6.2

### Patch Changes

- 5c8de24: Revert the previous fix for potentially infinite rerenders -- turns out it was a user issue (the user being me!), and the fix would actually cause bigger problems elsewhere.

## 0.6.1

### Patch Changes

- c69ab20: Updating the same state property multiple times within the same React side effect would sometimes trigger multiple rerenders of the component, resulting in an infinite loop (for example when writing into the store in a `ref` function.) This has now been fixed.

## 0.6.0

### Minor Changes

- d2eb9b4: **Fixed:** `useStore` now hooks into the store using `useLayoutEffect`, not `useEffect`
- 53fff47: Refreshed all of the package's dependencies and brushed up its test setup.
- 5b64a96: Switched the library's build tool to [Preconstruct](https://preconstruct.tools/). If everything breaks, it's on me! 🎉
- 53fff47: Statery now requires React 18 and up!
- 75d0a40: Simplify types.
- da27eba: `set` now takes a second options argument. The only available option so far is `forceNotify`; when set to true, all updated properties will be notified, regardless of referential equality to the previous value.

### Patch Changes

- a5f5533: `useStore` will now force the component to re-render if a change was detected between the React render/reconcile stage and the invocation of the layout effect that actually sets up the subscription listener. This improves reactivity in situations where values were changed in the store during the render phase, or imperatively from outside of your React component tree.

## 0.6.0-next.3

### Minor Changes

- 5b64a96: Switched the library's build tool to [Preconstruct](https://preconstruct.tools/). If everything breaks, it's on me! 🎉

## 0.6.0-next.2

### Patch Changes

- a5f5533: `useStore` will now force the component to re-render if a change was detected between the React render/reconcile stage and the invocation of the layout effect that actually sets up the subscription listener. This improves reactivity in situations where values were changed in the store during the render phase, or imperatively from outside of your React component tree.

## 0.6.0-next.1

### Minor Changes

- 75d0a40: Simplify types.
- da27eba: `set` now takes a second argument `forceNotify`; when set to true, all updated properties will be notified, regardless of referential equality to the previous value.

## 0.6.0-next.0

### Minor Changes

- d2eb9b4: **Fixed:** `useStore` now hooks into the store using `useLayoutEffect`, not `useEffect`
- 53fff47: Refreshed all of the package's dependencies and brushed up its test setup.
- 53fff47: Statery now requires React 18 and up!

## [0.5.4] - 2021-03-20

- **Changed:** Slightly improved typings. Most importantly, `store.state` is now typed as readonly, which should make Typescript et al warn you if you're trying to directly mutate the state object.
- **Changed:** Statery now uses Typescript 4.2.

## [0.5.2] - 2020-12-22

- **Fixed:** When subscribers were invoked, the store's state had not yet been updated to reflect the incoming changes. This has now been fixed.

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
