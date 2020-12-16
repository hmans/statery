import { Listener, State, StateUpdateFunction, Store } from "./types"

export const makeStore = <T extends State>(state: T): Store<T> => {
  const listeners: { [prop: string]: Listener[] } = {}

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

  const subscribe = (prop: string, listener: Listener) => {
    if (!listeners[prop]) listeners[prop] = []
    listeners[prop].push(listener)
  }

  const unsubscribe = (prop: string, listener: Listener) => {
    listeners[prop] = listeners[prop].filter((l) => l !== listener)
  }

  return { set, subscribe, unsubscribe, state }
}

export * from "./hooks"
export * from "./types"
