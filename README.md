# Statery

An extremely simple and just as experimental state management library for React. Yes, _another one_. Honestly, even I don't know why this exists. I had an idea and just _had_ to try it, and yet another NPM package was born.

**Do not use this library. It's terrible.** In fact, do not use any other library, either. They're all terrible.

### Creating a Store

Statery stores wrap around plain old JavaScript objects:

```ts
const store = makeStore({
  wood: 8,
  houses: 0
})
```

### Reading from a Store

Within a React component, use the `useStore` hook to read data from the store:

```tsx
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

That's all there is to it!

### Motivation & Assumptions

There are more React state management libraries out there than _actual state_, so why build another one? Frankly, I have no excuse. I know. Everything is terrible.

However, I've always felt that there was a state management solution missing that worked exactly the way _I_ wanted, and let me tell you, I only ever want simple things.

State management should be simple, both in use as well as implementation.

Statery makes a couple of assumptions that you may or may not agree with:

- A store's state should only ever contain data. Code that mutates a store should live outside of it. The store should only provide a single `set` method that updates its state, everything else should be left to the user.
- Consumers of a store -- React components etc. -- are _typically_ only interested in top-level changes to its state. Subscribing to deeply nested properties is usually a sign that your store is getting too complex, and should be split apart.
- It's 2020, and we only need to support modern React: functional components and hooks. Yes, I know that component classes will stay officially supported. No, I don't plan on supporting them (but will happily accept a PR if someone feels like providing one.)
- The library implementing the store should only expose a minimal API surface. There should only be a single way to update a store, and a single way to read from it.
- Type support should be _flawless_.
