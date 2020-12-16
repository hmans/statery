import { makeStore } from "../src"

describe("makeStore", () => {
  const state = {
    counter: 0
  }

  const store = makeStore(state)

  it("provides a state accessor", () => {
    expect(store.state).toBe(state)
  })

  describe("set", () => {
    it("accepts a dictionary of updates to the state", () => {
      store.set({ counter: 10 })
      expect(state.counter).toEqual(10)
    })

    it("accepts a function that accepts the state and returns an update dictionary", () => {
      const current = state.counter
      store.set(({ counter }) => ({ counter: counter + 1 }))
      expect(state.counter).toEqual(current + 1)
    })
  })
})
