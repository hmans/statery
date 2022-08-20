---
"statery": patch
---

`useStore` will now force the component to re-render if a change was detected between the React render/reconcile stage and the invocation of the layout effect that actually sets up the subscription listener. This improves reactivity in situations where values were changed in the store during the render phase, or imperatively from outside of your React component tree.
