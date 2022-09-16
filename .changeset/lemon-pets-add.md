---
"statery": patch
---

Updating the same state property multiple times within the same React side effect would sometimes trigger multiple rerenders of the component, resulting in an infinite loop. This has now been fixed.
