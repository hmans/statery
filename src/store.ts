import { Listener, State, StateUpdateFunction, Store } from "./types"

type ListenerMap<T extends State> = Record<keyof T, Listener[]>

export const makeStore = <T extends State>(state: T): Store<T> => {
  const listeners = {} as ListenerMap<T>

  const set = (updates: Partial<T> | StateUpdateFunction<T>) => {
    /* Update state */
    const newProps = updates instanceof Function ? updates(state) : updates
    Object.assign(state, newProps)

    /* Execute listeners */
    for (const prop in newProps) {
      listeners[prop]?.forEach((listener) => {
        listener()
      })
    }
  }

  const subscribe = (prop: keyof T, listener: Listener) => {
    if (!listeners[prop]) listeners[prop] = []
    listeners[prop].push(listener)
  }

  const unsubscribe = (prop: keyof T, listener: Listener) => {
    listeners[prop] = listeners[prop].filter((l) => l !== listener)
  }

  return { set, subscribe, unsubscribe, state }
}
