# statery

An extremely simple and just as experimental state management library for React. Yes, another one. Honestly, even I don't know why this even exists. I had an idea and just _had_ to try it, and yet another NPM package was born.

**Do not use this library. It's terrible.** In fact, do not use any other library, either. They're all terrible.

### Assumptions

- A store should only contain data. Mutators should just be normal functions that live outside of the store.
- Consumers of a store are typically only interested in top-level changes to it.
- We need (or rather: want) to support React functional components with hooks only.
- Offer a minimal API surface. Ideally just one way to read from the store, not many.

### Examples

_TODO_
