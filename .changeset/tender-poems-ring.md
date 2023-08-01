---
"statery": minor
---

Statery's React hooks now internally use React 18's new `useSyncExternalStore` hook. This simplifies the library implementation and makes sure that store updates don't cause UI drift.
