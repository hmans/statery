import { useEffect, useState } from "react"
import { State, Store } from "./types"

export const useStore = <T extends State>(store: Store<T>): T => {
  return new Proxy<Record<any, any>>(
    {},
    {
      get: (cache, prop: keyof T) => {
        /* Memoize store access */
        if (!cache.hasOwnProperty(prop)) cache[prop] = useStoreProperty(store, prop)

        return cache[prop]
      }
    }
  )
}

const useStoreProperty = <T extends State>(store: Store<T>, prop: keyof T) => {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const listener = () => setVersion((v) => v + 1)

    /* On mounting, subscribe to the listener. */
    store.subscribe(prop, listener)

    /* On unmounting, unsubscribe from it again. */
    return () => void store.unsubscribe(prop, listener)
  }, [store, prop])

  /* Return the requested property from our state. */
  return store.state[prop]
}
