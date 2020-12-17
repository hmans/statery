import { useEffect, useState } from "react"

export type State = { [key: string]: any }

export type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

export type Store<T extends State> = {
  /**
   * Updates the store. Accepts an object that will be (shallow-)merged into the store's state,
   * or a callback that will be invoked with the current state and is expected to return an object
   * containing updates.
   *
   * @see StateUpdateFunction
   */
  set: (updates: Partial<T> | StateUpdateFunction<T>) => void

  /**
   * Subscribe to changes of a specific property of the state. The provided listener callback will
   * be invoked every time the property changes, and is passed the property's new and previous values
   * as its arguments.
   *
   * @see Listener
   */
  subscribe: (prop: keyof T, listener: Listener<any>) => void

  /**
   * Unsubscribe a listener from being invoked when the specified property changes.
   */
  unsubscribe: (prop: keyof T, listener: Listener<any>) => void

  /**
   * The state itself.
   */
  state: T
}

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 * Receives the changed property's new and previous value as its arguments.
 */
export type Listener<T = any> = (newValue: T, prevValue: T) => void

type ListenerMap<T extends State> = Record<keyof T, Listener[]>

/**
 * Creates a Statery store that wraps around a state object.
 *
 * Keep in mind that the state object will be mutated by the store.
 *
 * @param state The state object that will be wrapped by the store.
 */
export const makeStore = <T extends State>(state: T): Store<T> => {
  const listeners = {} as ListenerMap<T>

  const set = (updates: Partial<T> | StateUpdateFunction<T>) => {
    /* Update state */
    const newProps = updates instanceof Function ? updates(state) : updates

    /* Execute listeners */
    for (const prop in newProps) {
      const newValue = newProps[prop]
      const prevValue = state[prop]

      Object.assign(state, { [prop]: newValue })

      listeners[prop]?.forEach((listener) => {
        listener(newValue, prevValue)
      })
    }
  }

  const subscribe = (prop: keyof T, listener: Listener<any>) => {
    if (!listeners[prop]) listeners[prop] = []
    listeners[prop].push(listener)
  }

  const unsubscribe = (prop: keyof T, listener: Listener<any>) => {
    listeners[prop] = listeners[prop].filter((l) => l !== listener)
  }

  return { set, subscribe, unsubscribe, state }
}

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
