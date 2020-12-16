export type State = { [key: string]: any }

export type StateUpdateFunction<T extends State> = (state: T) => Partial<T>

export type Store<T extends State> = {
  set: (updates: Partial<T> | StateUpdateFunction<T>) => void
  subscribe: (prop: keyof T, listener: Listener<any>) => void
  unsubscribe: (prop: keyof T, listener: Listener<any>) => void
  state: T
}

export type Listener<T = any> = (newValue: T, prevValue: T) => void
