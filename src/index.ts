import { useEffect, useRef, useState } from "react"

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
 * The state objects wrapped by Statery stores are any JavaScript objects that
 * can be indexed using strings and/or numbers.
 */
export type State = Record<string | number, any>

/**
 * Statery stores wrap around a State object and provide a few functions to update them
 * and, in turn, subscribe to updates.
 */
export type Store<T extends State> = {
  /**
   * Return the current state.
   */
  state: T

  /**
   * Updates the store. Accepts an object that will be (shallow-)merged into the store's state,
   * or a callback that will be invoked with the current state and is expected to return an object
   * containing updates.
   *
   * @see StateUpdateFunction
   */
  set: (updates: Partial<T> | StateUpdateFunction<T>) => void

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

export type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 */
export type Listener<T extends State> = (updates: Partial<T>, state: T) => void

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
 * Creates a Statery store that wraps around a state object.
 *
 * Keep in mind that the state object will be mutated by the store.
 *
 * @param state The state object that will be wrapped by the store.
 */
export const makeStore = <T extends State>(initialState: T): Store<T> => {
  let state = initialState
  let listeners = new Array<Listener<T>>()

  return {
    get state() {
      return state
    },

    set: (updates) => {
      /* Get new properties */
      updates = updates instanceof Function ? updates(state) : updates

      /* Execute listeners */
      if (listeners.length > 0) {
        for (const listener of listeners) listener(updates, state)
      }

      /* Apply updates */
      state = { ...state, ...updates }
    },

    subscribe: (listener) => {
      listeners.push(listener)
    },

    unsubscribe: (listener) => {
      listeners = listeners.filter((l) => l !== listener)
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
 * it was invoked from automaticaly re-renders when any of the data it uses has changed.
 *
 * @param store The Statery store to access.
 */
export const useStore = <T extends State>(store: Store<T>): T => {
  /* A cheap version state that we will bump in order to re-render the component. */
  const [, setVersion] = useState(0)

  /* A set containing all props that we're interested in. */
  const interestingProps = useRef(new Set<keyof T>()).current

  /* Subscribe to changes in the store. */
  useEffect(() => {
    const listener: Listener<T> = (updates: Partial<T>) => {
      /* If there is at least one prop being updated that we're interested in,
         bump our local version. */
      if (Object.keys(updates).find((prop) => interestingProps.has(prop))) {
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
      get: (_, prop: keyof T) => {
        /* Add the prop we're interested in to the list of props */
        interestingProps.add(prop)

        /* Return the value of the property. */
        return store.state[prop]
      }
    }
  )
}
