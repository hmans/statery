# STATERY

![Status](https://img.shields.io/badge/status-experimental-orange)
[![Build Size](https://img.shields.io/bundlephobia/min/statery?label=bundle%20size)](https://bundlephobia.com/result?p=statery)
[![Version](https://img.shields.io/npm/v/statery)](https://www.npmjs.com/package/statery)
[![Downloads](https://img.shields.io/npm/dt/statery.svg)](https://www.npmjs.com/package/statery)

An extremely simple and just as experimental state management library for React. Yes, _another one_. Honestly, even I don't know why this exists. I had an idea and just _had_ to try it, and yet another NPM package was born.

**Do not use this library. It's terrible.** In fact, do not use any other library, either. They're all terrible. Code is bad and we should all be spending more time outside instead.

Anyway. If you still want to give the thing a go, keep reading.

## DEMOS

- [Example Clicker Game](https://codesandbox.io/s/statery-clicker-game-hjxk3?file=/src/App.tsx) (Codesandbox)

## BASIC USAGE

### Adding it to your Project

```
npm install statery
```

or

```
yarn add statery
```

### Creating a Store

Statery stores wrap around plain old JavaScript objects:

```ts
import { makeStore } from "statery"

const store = makeStore({
  wood: 8,
  houses: 0
})
```

### Reading from a Store

Within a React component, use the `useStore` hook to read data from the store:

```tsx
import { useStore } from "statery"

const Wood = () => {
  const { wood } = useStore(store)

  return <p>Wood: {wood}</p>
}
```

Naturally, your components will **re-render** when the data they've accessed changes.

### Updating the Store

Update the store contents using its `set` function:

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

## ADVANCED USAGE

### Deriving Values from a Store

Just like mutations, functions that derive values from the store's state can be written as standalone functions:

```tsx
const canBuyHouse = ({ wood, gold }) => wood >= 5 && gold >= 5
```

Due to the way Statery is designed, these will work both within mutation code...

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

...as well as React components, which will automatically be rerendered if any of the underlying data changes:

```tsx
const BuyHouseButton = () => {
  const proxy = useStore(store)

  return (
    <button onClick={buyHouse} disabled={!canBuyHouse(proxy)}>
      Buy House (5g, 5w)
    </button>
  )
}
```

### Accessing the State Directly

If, for any reason, you ever need to work with the underlying state object without any potentially unwanted magic happening, you can use the store's `state` property to access it directly:

```ts
const store = makeStore({ count: 0 })
console.log(store.state.count)
```

**Note:** this won't stop you from mutating the state object. Keep in mind that when you do this, none of the subscribed listeners will be executed.

### Subscribing to updates imperatively

Use a store's `subscribe` function to register a callback that will be executed every time a specific property is changed. Listeners will be passed both the new as well as the previous value as arguments.

```ts
const store = makeStore({ count: 0 })
store.subscribe("count", console.log)

/* Now every time an update is made to the the store's "count" property,
   it will be logged to the console. */

store.unsubscribe("count", console.log)
```

## NOTES

### Stuff that probably needs work

- [ ] I have yet to try how well Statery works with async updating of the store.
- [ ] Statery _probably_ has problems in React's Concurrent Mode. I haven't tried yet, but I will.
- [ ] No support for middleware yet. Haven't decided on an API that is adequately simple.
- [ ] Probably other bits and pieces I haven't even encountered yet.

### Motivation & Assumptions

There are more React state management libraries out there than _actual state_, so why build another one? Frankly, I have no excuse. I know. Everything is terrible. I am terrible.

However, I've always felt that there was a state management solution missing that worked exactly the way _I_ wanted, and let me tell you, I only ever want simple things.

State management should be simple, both in use as well as implementation.

Statery makes a couple of assumptions that you may or may not agree with:

- A store's state should only ever contain data. Code that mutates a store should live outside of it. The store should only provide a single `set` method that updates its state, everything else should be left to the user.
- Consumers of a store -- React components etc. -- are _typically_ only interested in top-level changes to its state. Subscribing to deeply nested properties is usually a sign that your store is getting too complex, and should be split apart.
- It's 2020, and we only need to support modern React: functional components and hooks. Yes, I know that component classes will stay officially supported. No, I don't plan on supporting them (but will happily accept a PR if someone feels like providing one.)
- The library implementing the store should only expose a minimal API surface. There should only be a single way to update a store, and a single way to read from it.
- Type support should be _flawless_.
