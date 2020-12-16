import { makeStore } from "../src/store"

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

      const fooListener = () => fooChanges++
      const barListener = () => barChanges++

      store.subscribe("foo", fooListener)
      store.subscribe("bar", barListener)

      store.set(({ foo }) => ({ foo: foo + 1 }))
      store.set(({ foo, bar }) => ({ foo: foo + 1, bar: bar + 1 }))

      store.unsubscribe("foo", fooListener)
      store.unsubscribe("bar", barListener)

      expect(fooChanges).toEqual(2)
      expect(barChanges).toEqual(1)
    })
  })
})
