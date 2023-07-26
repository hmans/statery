```
                                          💥           ⭐️            💥      ✨
                             ✨                                ✨
  ███████╗████████╗ █████╗ ████████╗███████╗██████╗ ██╗   ██╗██╗   ✨
  ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝██╔══██╗╚██╗ ██╔╝██║
  ███████╗   ██║   ███████║   ██║   █████╗  ██████╔╝ ╚████╔╝ ██║     ⭐️    ✨
  ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝  ██╔══██╗  ╚██╔╝  ╚═╝
  ███████║   ██║   ██║  ██║   ██║   ███████╗██║  ██║   ██║   ██╗     ✨  💥
  ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ✨
                                         ✨                 ✨   ⭐️
  SURPRISE-FREE STATE MANAGEMENT!                💥
                                                              ✨
```

[![Version](https://img.shields.io/npm/v/statery?style=for-the-badge)](https://www.npmjs.com/package/statery)
![CI](https://img.shields.io/github/actions/workflow/status/hmans/statery/tests.yml?style=for-the-badge)
[![Downloads](https://img.shields.io/npm/dt/statery.svg?style=for-the-badge)](https://www.npmjs.com/package/statery)
[![Bundle Size](https://img.shields.io/bundlephobia/min/statery?label=bundle%20size&style=for-the-badge)](https://bundlephobia.com/result?p=statery)

### Features 🎉

- Simple, **noise- and surprise-free API**. Check out the [demo]!
- **Extremely compact**, both in bundle size as well as API surface (2 exported functions!)
- Fully **tested**, fully **typed**!
- **Designed for React** (with functional components and hooks), but can also be used **without it**, or with other frameworks (but you may need to bring your own glue.)

### Non-Features 🧤

- Doesn't use **React Context** (but you can easily use it to provide a context-specific store!)
- Provides a simple `set` function for updating a store and not much else (have you checked out the [demo] yet?) If you want to use **reducers** or libraries like [Immer], these can easily sit on top of your Statery store.
- Currently no support for (or concept of) **middlewares**, but this may change in the future.
- While the `useStore` hook makes use of **proxies**, the store contents themselves are never wrapped in proxy objects. (If you're looking for a fully proxy-based solution, I recommend [Valtio].)
- **React Class Components** are not supported (but PRs welcome!)

## SUMMARY

```tsx
import { makeStore, useStore } from "statery"

const store = makeStore({ counter: 0 })

const increment = () =>
  store.set((state) => ({
    counter: state.counter + 1
  }))

const Counter = () => {
  const { counter } = useStore(store)

  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

For a more fully-featured example, please check out the [demo].

## BASIC USAGE

### Adding it to your Project

```
npm add statery
yarn add statery
pnpm add statery
```

### Creating a Store

Statery stores wrap around plain old JavaScript objects that are free to contain any kind of data:

```ts
import { value makeStore } from "statery"

const store = makeStore({
  player: {
    id: 1,
    name: "John Doe",
    email: "john@doe.com"
  },
  gold: 100,
  wood: 0,
  houses: 0
})
```

If you're using TypeScript, the type of the store state will be inferred from the initial state; but you may also pass a type argument to `makeStore` to explicitly set the type of the store:

```ts
const store = makeStore<{ count: number }>({ count: 0 })
```

### Updating the Store

The store object's `set` function will update the store's state and notify any listeners who have subscribed to changes:

```tsx
const collectWood = () =>
  store.set((state) => ({
    wood: state.wood + 1
  }))

const buildHouse = () =>
  store.set((state) => ({
    wood: state.wood - 10,
    houses: state.houses + 1
  }))

const Buttons = () => {
  return (
    <p>
      <button onClick={collectWood}>Collect Wood</button>
      <button onClick={buildHouse}>Build House</button>
    </p>
  )
}
```

Updates will be shallow-merged with the current state, meaning that top-level properties will be replaced, and properties you don't update will not be touched.

### Reading from a Store (with React)

Within a React component, use the `useStore` hook to read data from the store:

```tsx
import { value useStore } from "statery"

const Wood = () => {
  const { wood } = useStore(store)

  return <p>Wood: {wood}</p>
}
```

When any of the store's properties that your component accesses are updated, they will automatically re-render, automatically receiving the new state.

### Reading from a Store (without React)

A Statery store provides access to its current state through its `state` property:

```ts
const store = makeStore({ count: 0 })
console.log(store.state.count)
```

You can also imperatively [subscribe to updates](#subscribing-to-updates-imperatively).

## ADVANCED USAGE

### Deriving Values from a Store

Just like mutations, functions that derive values from the store's state can be written as standalone functions:

```tsx
const canBuyHouse = ({ wood, gold }) => wood >= 5 && gold >= 5
```

These will work from within plain imperative JavaScript code...

```tsx
if (canBuyHouse(store.state)) {
  console.log("Let's buy a house!")
}
```

...mutation code...

```tsx
const buyHouse = () =>
  store.set((state) =>
    canBuyHouse(state)
      ? {
          wood: state.wood - 5,
          gold: state.gold - 5,
          houses: state.houses + 1
        }
      : {}
  )
```

...as well as React components, which will automatically be re-rendered if any of the underlying data changes:

```tsx
const BuyHouseButton = () => {
  const store = useStore(store)

  return (
    <button onClick={buyHouse} disabled={!canBuyHouse(store)}>
      Buy House (5g, 5w)
    </button>
  )
}
```

### Forcing a store update

When the store is updated, Statery will check which of the properties within the update object are actually different objects (or scalar values) from the previous state, and will only notify listeners to those properties.

In some cases, you may want to force a store update even though the property has not changed to a new object. For these situations, the `set` function allows you to pass a second argument; if this is set to `true`, Statery will ignore the equality check and notify all listeners to the properties included in the update.

Example:

```tsx
const store = makeStore({
  rotation: new THREE.Vector3()
})

export const randomizeRotation = () =>
  store.set(
    (state) => ({
      rotation: state.rotation.randomRotation()
    }),
    true
  )
```

### Subscribing to updates (imperatively)

Use a store's `subscribe` function to register a callback that will be executed every time the store is changed.
The callback will receive both an object containing of the changes, as well as the store's current state.

```ts
const store = makeStore({ count: 0 })

const listener = (changes, state) => {
  console.log("Applying changes:", changes)
}

store.subscribe(console.log)
store.set((state) => ({ count: state.count + 1 }))
store.unsubscribe(console.log)
```

## NOTES

### Stuff that probably needs work

- [ ] No support for middleware yet. Haven't decided on an API that is adequately simple.

### Prior Art & Credits

Statery was born after spending a lot of time with the excellent state management libraries provided by the [Poimandres](https://github.com/pmndrs) collective, [Zustand] and [Valtio]. Statery started out as an almost-clone of Zustand, but with the aim of providing an even simpler API. The `useStore` hook API was inspired by Valtio's very nice `useProxy`.

Statery is written and maintained by [Hendrik Mans](https://www.hmans.dev/).

[demo]: https://codesandbox.io/s/statery-clicker-game-hjxk3?file=/src/App.tsx
[zustand]: https://github.com/pmndrs/zustand
[valtio]: https://github.com/pmndrs/valtio
[immer]: https://github.com/immerjs/immer
