import { useEffect, useState } from "react"

type State = { [key: string]: any }

type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

type Store<T extends State> = {
  set: (updates: T | StateUpdateFunction<T>) => void
  subscribe: (prop: string, listener: Listener) => void
  unsubscribe: (prop: string, listener: Listener) => void
  state: T
}

type Listener = Function

export const makeStore = <T extends State>(state: T): Store<T> => {
  const listeners: { [prop: string]: Listener[] } = {}

  const set = (updates: State | StateUpdateFunction<T>) => {
    /* Update state */
    const newProps = updates instanceof Function ? updates(state) : updates
    console.log("Applying updates:", newProps)
    Object.assign(state, newProps)

    /* Execute listeners */
    for (const prop in newProps) {
      listeners[prop]?.forEach((listener) => {
        listener()
      })
    }
  }

  const subscribe = (prop: string, listener: Listener) => {
    if (!listeners[prop]) listeners[prop] = []
    listeners[prop].push(listener)
  }

  const unsubscribe = (prop: string, listener: Listener) => {
    listeners[prop] = listeners[prop].filter((l) => l !== listener)
  }

  return { set, subscribe, unsubscribe, state }
}

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
