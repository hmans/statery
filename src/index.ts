import { useEffect, useLayoutEffect, useRef, useState } from "react"

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
 * If a component is loaded in a SSR context and imports the useStore hook,
 * React will trigger a warning that says: "useLayoutEffect does nothing on
 * the server". To surpress this warning, we need to check if window is
 * defined.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

/**
 * Provides reactive read access to a Statery store. Returns a proxy object that
 * provides direct access to the store's state and makes sure that the React component
 * it was invoked from automaticaly re-renders when any of the data it uses is updated.
 *
 * @param store The Statery store to access.
 */
export const useStore = <T extends IState>(store: Store<T>): T => {
  /* A cheap version state that we will bump in order to re-render the component. */
  const [v, setVersion] = useState(0)

  /* A set containing all props that we're interested in. */
  const subscribedProps = useConst(() => new Set<keyof T>())

  /* Grab a copy of the state at the time the component is rendering; then, in an effect,
  check if there have already been any updates. This can happen because something that
  was rendered alongside this component wrote into the store immediately, possibly
  through a function ref. If we detect a change related to the props we're interested in,
  force the component to reload. */
  const initialState = useConst(() => store.state)

  useIsomorphicLayoutEffect(() => {
    if (store.state === initialState) return

    subscribedProps.forEach((prop) => {
      if (initialState[prop] !== store.state[prop]) {
        setVersion((v) => v + 1)
        return
      }
    })
  }, [store])

  /* Subscribe to changes in the store. */
  useIsomorphicLayoutEffect(() => {
    const listener: Listener<T> = (updates: Partial<T>) => {
      /* If there is at least one prop being updated that we're interested in,
         bump our local version. */
      if (Object.keys(updates).find((prop) => subscribedProps.has(prop))) {
        setVersion((v) => v + 1)
      }
    }

    /* Mount & unmount the listener */
    store.subscribe(listener)
    return () => void store.unsubscribe(listener)
  }, [store])

  return new Proxy<Record<any, any>>(
    {},
    {
      get: (_, prop: string) => {
        /* Add the prop we're interested in to the list of props */
        subscribedProps.add(prop)

        /* Return the current value of the property. */
        return store.state[prop]
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
