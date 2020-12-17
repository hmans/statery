import { useEffect, useState } from "react"
import { State, Store } from "./types"

/**
 * Provides reactive read access to a Statery store. Returns a proxy object that
 * provides direct access to the store's state and makes sure that the React component
 * it was invoked from automaticaly re-renders when any of the data it uses has changed.
 *
 * @param store The Statery store to access.
 */
export const useStore = <T extends State>(store: Store<T>): T => {
  return new Proxy<Record<any, any>>(
    {},
    {
      get: (cache, prop: keyof T) => {
        /* We don't want to create a new hook every time this property is accessed,
           so let's memoize its value. */
        if (!cache.hasOwnProperty(prop)) cache[prop] = useStoreProperty(store, prop)

        /* Return the value of the property. */
        return cache[prop]
      }
    }
  )
}

const useStoreProperty = <T extends State>(store: Store<T>, prop: keyof T) => {
  /* A cheap version state that we will bump in order to re-render the component. */
  const [, setVersion] = useState(0)

  /* Subscribe to changes of the requested property. */
  useEffect(() => {
    const listener = () => setVersion((v) => v + 1)
    store.subscribe(prop, listener)
    return () => void store.unsubscribe(prop, listener)
  }, [store, prop])

  /* Return the requested property from our state. */
  return store.state[prop]
}
