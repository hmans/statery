import { useCallback, useRef, useSyncExternalStore } from "react"

/*

    ███     ▄██   ▄      ▄███████▄    ▄████████    ▄████████
▀█████████▄ ███   ██▄   ███    ███   ███    ███   ███    ███
   ▀███▀▀██ ███▄▄▄███   ███    ███   ███    █▀    ███    █▀
    ███   ▀ ▀▀▀▀▀▀███   ███    ███  ▄███▄▄▄       ███
    ███     ▄██   ███ ▀█████████▀  ▀▀███▀▀▀     ▀███████████
    ███     ███   ███   ███          ███    █▄           ███
    ███     ███   ███   ███          ███    ███    ▄█    ███
   ▄████▀    ▀█████▀   ▄████▀        ██████████  ▄████████▀

*/

/**
 * The state objects managed by Statery stores are any string-indexed JavaScript objects.
 */
export interface IState extends Record<string, any> {}

/**
 * Statery stores wrap around a State object and provide a few functions to update them
 * and, in turn, subscribe to updates.
 */
export type Store<T extends IState = Record<string, any>> = {
  /**
   * Return the current state.
   */
  state: Readonly<T>

  /**
   * Updates the store. Accepts an object that will be (shallow-)merged into the current state,
   * or a callback that will be invoked with the current state and is expected to return an object
   * containing updates.
   *
   * Returns the updated version of the store.
   *
   * @example
   * store.set({ foo: 1 })
   *
   * @example
   * store.set(state => ({ foo: state.foo + 1}))
   *
   * @see StateUpdateFunction
   */
  set: (updates: Partial<T> | StateUpdateFunction<T>, options?: SetOptions) => T

  /**
   * Subscribe to changes to the store's state. Every time the store is updated, the provided
   * listener callback will be invoked, with the object containing the updates passed as the
   * first argument, and the previous state as the second.
   *
   * @see Listener
   */
  subscribe: (listener: Listener<T>) => void

  /**
   * Unsubscribe a listener from being invoked when the the store changes.
   */
  unsubscribe: (listener: Listener<T>) => void
}

export type StateUpdateFunction<T extends IState> = (state: Readonly<T>) => Partial<T>

/**
 * Options for the `set` function.
 */
export type SetOptions = { forceNotify?: boolean }

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 */
export type Listener<T extends IState> = (updates: Readonly<Partial<T>>, state: Readonly<T>) => void

/*

   ▄████████     ███      ▄██████▄     ▄████████    ▄████████
  ███    ███ ▀█████████▄ ███    ███   ███    ███   ███    ███
  ███    █▀     ▀███▀▀██ ███    ███   ███    ███   ███    █▀
  ███            ███   ▀ ███    ███  ▄███▄▄▄▄██▀  ▄███▄▄▄
▀███████████     ███     ███    ███ ▀▀███▀▀▀▀▀   ▀▀███▀▀▀
         ███     ███     ███    ███ ▀███████████   ███    █▄
   ▄█    ███     ███     ███    ███   ███    ███   ███    ███
 ▄████████▀     ▄████▀    ▀██████▀    ███    ███   ██████████
                                      ███    ███
*/

/**
 * Creates a Statery store and populates it with an initial state.
 *
 * @param initialState The state object that will be wrapped by the store.
 */
export const makeStore = <T extends IState>(initialState: T): Store<T> => {
  let state = initialState
  const listeners = new Set<Listener<T>>()

  const getActualChanges = (updates: Partial<T>) =>
    Object.keys(updates).reduce<Partial<T>>((changes, prop: keyof Partial<T>) => {
      if (updates[prop] !== state[prop]) changes[prop] = updates[prop]
      return changes
    }, {})

  return {
    get state() {
      return state
    },

    set: (incoming, { forceNotify = false }: SetOptions = {}) => {
      /* If the argument is a function, run it */
      const incomingState = incoming instanceof Function ? incoming(state) : incoming

      /*
      Check which updates we're actually applying. If forceNotify is enabled,
      we'll use (and notify for) all of them; otherwise, we'll check them against
      the current state to only change (and notify for) the properties
      that have changed from the current state.
      */
      const updates = forceNotify ? incomingState : getActualChanges(incomingState)

      /* Has anything changed? */
      if (Object.keys(updates).length > 0) {
        /* Keep a reference to the previous state, we're going to need it in a second */
        const previousState = state

        /* Apply updates */
        state = { ...state, ...updates }

        /* Execute listeners */
        for (const listener of listeners) listener(updates, previousState)
      }

      return state
    },

    subscribe: (listener) => {
      listeners.add(listener)
    },

    unsubscribe: (listener) => {
      listeners.delete(listener)
    }
  }
}

/*

   ▄█    █▄     ▄██████▄   ▄██████▄     ▄█   ▄█▄    ▄████████
  ███    ███   ███    ███ ███    ███   ███ ▄███▀   ███    ███
  ███    ███   ███    ███ ███    ███   ███▐██▀     ███    █▀
 ▄███▄▄▄▄███▄▄ ███    ███ ███    ███  ▄█████▀      ███
▀▀███▀▀▀▀███▀  ███    ███ ███    ███ ▀▀█████▄    ▀███████████
  ███    ███   ███    ███ ███    ███   ███▐██▄            ███
  ███    ███   ███    ███ ███    ███   ███ ▀███▄    ▄█    ███
  ███    █▀     ▀██████▀   ▀██████▀    ███   ▀█▀  ▄████████▀
                                       ▀
*/

/**
 * Provides reactive read access to a Statery store. Returns a proxy object that
 * provides direct access to the store's state and makes sure that the React component
 * it was invoked from automatically re-renders when any of the data it uses is updated.
 *
 * @param store The Statery store to access.
 */
export const useStore = <T extends IState>(store: Store<T>): T => {
  /* A set containing all props that we're interested in. */
  const subscribedProps = useConst(() => new Set<keyof T>())
  const prevSnapshot = useRef(store.state)

  const subscribe = useCallback((listener: () => void) => {
    store.subscribe(listener)
    return () => store.unsubscribe(listener)
  }, [])

  const getSnapshot = useCallback(() => {
    let hasChanged = false

    for (const prop of subscribedProps) {
      if (store.state[prop] !== prevSnapshot.current[prop]) {
        hasChanged = true
        break
      }
    }

    if (hasChanged) {
      prevSnapshot.current = store.state
    }

    return prevSnapshot.current
  }, [store])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  return new Proxy<Record<any, any>>(
    {},
    {
      get: (_, prop: string) => {
        /* Add the prop we're interested in to the list of props */
        subscribedProps.add(prop)

        /* Return the current value of the property. */
        return snapshot[prop]
      }
    }
  )
}

/**
 * A tiny helper hook that will initialize a ref with the return value of the
 * given constructor function.
 */
const useConst = <T>(ctor: () => T) => {
  const ref = useRef<T>(null!)
  if (!ref.current) ref.current = ctor()
  return ref.current
}
