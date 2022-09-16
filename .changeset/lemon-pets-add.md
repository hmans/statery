---
"statery": patch
---

Updating the same state property multiple times within the same React side effect would sometimes trigger multiple rerenders of the component, resulting in an infinite loop (for example when writing into the store in a `ref` function.) This has now been fixed.
