import { Listener, makeStore } from "../src"

describe("makeStore", () => {
  const state = {
    foo: 0,
    bar: 0
  }

  const store = makeStore(state)

  describe(".state", () => {
    it("provides direct access to the state object", () => {
      expect(store.state).toBe(state)
    })
  })

  describe(".set", () => {
    it("accepts a dictionary of updates to the state", () => {
      store.set({ foo: 10 })
      expect(state.foo).toEqual(10)
    })

    it("accepts a function that accepts the state and returns an update dictionary", () => {
      const current = state.foo
      store.set(({ foo }) => ({ foo: foo + 1 }))
      expect(state.foo).toEqual(current + 1)
    })
  })

  describe(".subscribe", () => {
    it("allows subscribing to updates to a specific property of the store", () => {
      let fooChanges = 0
      let barChanges = 0

      const fooListener = (prop) => prop == "foo" && fooChanges++
      const barListener = (prop) => prop == "bar" && barChanges++

      store.subscribe(fooListener)
      store.subscribe(barListener)

      store.set(({ foo }) => ({ foo: foo + 1 }))
      store.set(({ foo, bar }) => ({ foo: foo + 1, bar: bar + 1 }))

      store.unsubscribe(fooListener)
      store.unsubscribe(barListener)

      expect(fooChanges).toEqual(2)
      expect(barChanges).toEqual(1)
    })

    it("feeds the changed values to the listener callback", () => {
      let newFoo: number
      let prevFoo: number
      let changedProp: string

      const listener: Listener<number> = (prop, newValue, prevValue) => {
        changedProp = prop
        newFoo = newValue
        prevFoo = prevValue
      }

      store.set({ foo: 0 })
      store.subscribe(listener)
      store.set({ foo: 1 })
      store.unsubscribe(listener)

      expect(changedProp).toBe("foo")
      expect(newFoo).toBe(1)
      expect(prevFoo).toBe(0)
    })
  })
})
