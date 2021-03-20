import { useEffect, useRef, useState } from "react"
import { State, Store, Listener } from "."

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
 * it was invoked from automaticaly re-renders when any of the data it uses is updated.
 *
 * @param store The Statery store to access.
 */
export const useStore = <T extends State>(store: Store<T>): T => {
  /* A cheap version state that we will bump in order to re-render the component. */
  const [, setVersion] = useState(0)

  /* A set containing all props that we're interested in. */
  const subscribedProps = useRef(new Set<keyof T>()).current

  /* Subscribe to changes in the store. */
  useEffect(() => {
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
