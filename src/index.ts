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
 * The state objects managed by Statery stores are any JavaScript objects that
 * can be indexed using strings and/or numbers.
 */
export type State = Record<string | number, any>

/**
 * Statery stores wrap around a State object and provide a few functions to update them
 * and, in turn, subscribe to updates.
 */
export type Store<T extends State = State> = {
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
  set: (updates: Partial<T> | StateUpdateFunction<T>) => T

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

export type StateUpdateFunction<T extends State> = (state: Readonly<T>) => Partial<T>

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 */
export type Listener<T extends State> = (updates: Readonly<Partial<T>>, state: Readonly<T>) => void

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
 * @param state The state object that will be wrapped by the store.
 */
export const makeStore = <T extends State>(initialState: T): Store<T> => {
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

    set: (incoming) => {
      /* If the argument is a function, run it */
      const updates = getActualChanges(incoming instanceof Function ? incoming(state) : incoming)

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
