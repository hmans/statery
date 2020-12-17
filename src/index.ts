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
   * Updates the store. Accepts an object that will be (shallow-)merged into the store's state,
   * or a callback that will be invoked with the current state and is expected to return an object
   * containing updates.
   *
   * @see StateUpdateFunction
   */
  set: (updates: Partial<T> | StateUpdateFunction<T>) => void

  /**
   * Subscribe to changes to the store's state. Every time the store is updated, the provided
   * listener callback will be invoked for every updated property, passing its name, new value and
   * previous value as its arguments.
   *
   * @see Listener
   */
  subscribe: (listener: Listener) => void

  /**
   * Unsubscribe a listener from being invoked when the the store changes.
   */
  unsubscribe: (listener: Listener) => void

  /**
   * The state itself.
   */
  state: T
}

export type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 * When a store is modified, this will be invoked for every updated property.
 * The name of the updated property as well as its new and previous value are passed
 * as arguments.
 */
export type Listener<T = any> = (prop: string | number, newValue: T, prevValue: T) => void

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
export const makeStore = <T extends State>(state: T): Store<T> => {
  let listeners = new Array<Listener>()

  const set = (updates: Partial<T> | StateUpdateFunction<T>) => {
    /* Update state */
    const newProps = updates instanceof Function ? updates(state) : updates

    /* Execute listeners */
    for (const prop in newProps) {
      const newValue = newProps[prop]
      const prevValue = state[prop]

      Object.assign(state, { [prop]: newValue })

      listeners.forEach((listener) => {
        listener(prop, newValue, prevValue)
      })
    }
  }

  const subscribe = (listener: Listener<any>) => {
    listeners.push(listener)
  }

  const unsubscribe = (listener: Listener<any>) => {
    listeners = listeners.filter((l) => l !== listener)
  }

  return { set, subscribe, unsubscribe, state }
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
    const listener: Listener = (p: keyof T) => {
      /* If this is the prop we're interested in, bump our version. */
      if (interestingProps.has(p)) setVersion((v) => v + 1)
    }

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
