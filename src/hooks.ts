import { useEffect, useState } from "react"
import { State, Store } from "./types"

/* Subscription hook */
export const useStore = <T extends State>(store: Store<T>, prop: string) => {
  const [, setVersion] = useState(0)

  useEffect(() => {
    const listener = () => setVersion((v) => v + 1)
    store.subscribe(prop, listener)
    return () => void store.unsubscribe(prop, listener)
  }, [store, prop])

  return store.state[prop]
}
