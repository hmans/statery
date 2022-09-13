---
"statery": minor
---

`set` now takes a second options argument. The only available option so far is `forceNotify`; when set to true, all updated properties will be notified, regardless of referential equality to the previous value.
