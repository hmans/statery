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
  subscribe: (listener: Listener<any>) => void

  /**
   * Unsubscribe a listener from being invoked when the specified property changes.
   */
  unsubscribe: (listener: Listener<any>) => void

  /**
   * The state itself.
   */
  state: T
}

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 * Receives the changed property's new and previous value as its arguments.
 */
export type Listener<T = any> = (prop: string, newValue: T, prevValue: T) => void

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

  const interestingPropsRef = useRef(new Array<keyof T>())
  const interestingProps = interestingPropsRef.current

  /* Subscribe to changes in the store. */
  useEffect(() => {
    const listener: Listener = (p) => {
      /* If this is the prop we're interested in, bump our version. */
      if (interestingProps.includes(p)) setVersion((v) => v + 1)
    }

    store.subscribe(listener)
    return () => void store.unsubscribe(listener)
  }, [store])

  return new Proxy<Record<any, any>>(
    {},
    {
      get: (cache, prop: keyof T) => {
        /* Add the prop we're interested in to the list of props */
        if (!interestingProps.includes(prop)) {
          interestingProps.push(prop)
        }

        /* Return the value of the property. */
        return store.state[prop]
      }
    }
  )
}
