export type State = { [key: string]: any }

export type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

export type Store<T extends State> = {
  set: (updates: Partial<T> | StateUpdateFunction<T>) => void
  subscribe: (prop: string, listener: Listener) => void
  unsubscribe: (prop: string, listener: Listener) => void
  state: T
}

export type Listener = Function
