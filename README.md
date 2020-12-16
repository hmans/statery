# Statery

An extremely simple and just as experimental state management library for React. Yes, _another one_. Honestly, even I don't know why this exists. I had an idea and just _had_ to try it, and yet another NPM package was born.

**Do not use this library. It's terrible.** In fact, do not use any other library, either. They're all terrible.

### How to use it:

Statery stores wrap around plain old JavaScript objects:

```ts
const store = makeStore({
  wood: 8,
  houses: 0
})
```

Your React components access the store using the `useStore` hook:

```tsx
const Wood = () => {
  const { wood } = useStore(store)

  return <p>Wood: {wood}</p>
}
```

Naturally, your components will re-render when the data they've accessed changes.

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

### Assumptions

- A store should only contain data. Mutators should just be normal functions that live outside of the store.
- Consumers of a store are typically only interested in top-level changes to it.
- We need (or rather: want) to support React functional components with hooks only.
- Offer a minimal API surface. Ideally just one way to read from the store, not many.

### Examples

_TODO_

```

```
