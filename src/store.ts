import { Listener, State, StateUpdateFunction, Store } from "./types"

type ListenerMap<T extends State> = Record<keyof T, Listener[]>

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
