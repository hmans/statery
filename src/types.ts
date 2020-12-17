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
  subscribe: (prop: keyof T, listener: Listener<any>) => void

  /**
   * Unsubscribe a listener from being invoked when the specified property changes.
   */
  unsubscribe: (prop: keyof T, listener: Listener<any>) => void

  /**
   * The state itself.
   */
  state: T
}

/**
 * A callback that can be passed to a store's `subscribe` and `unsubscribe` functions.
 * Receives the changed property's new and previous value as its arguments.
 */
export type Listener<T = any> = (newValue: T, prevValue: T) => void
