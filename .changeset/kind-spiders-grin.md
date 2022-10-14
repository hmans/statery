---
"statery": patch
---

**Fixed:** The library recently started using `useLayoutEffect` instead of `useEffect`, breaking it in SSR environments, where usage of that hook throws errors. This has been fixed. (Thanks @daveschumaker!)
