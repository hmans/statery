import { makeStore } from "../src"

describe("makeStore", () => {
  const store = makeStore({
    foo: 0,
    bar: 0
  })

  beforeEach(() => {
    store.set({ foo: 0, bar: 0 })
  })

  describe(".state", () => {
    it("provides direct access to the state object", () => {
      expect(store.state).toEqual({ foo: 0, bar: 0 })
    })
  })

  describe(".set", () => {
    it("accepts a dictionary of updates to the state", () => {
      store.set({ foo: 10 })
      expect(store.state.foo).toEqual(10)
    })

    it("accepts a function that accepts the state and returns an update dictionary", () => {
      const current = store.state.foo
      expect(store.state.foo).toEqual(current)
      store.set(({ foo }) => ({ foo: foo + 1 }))
      expect(store.state.foo).toEqual(current + 1)
    })

    it("returns the updated state", () => {
      const result = store.set({ foo: 1 })
      expect(result).toEqual({ foo: 1, bar: 0 })
    })

    it("supports async updates to the state", async () => {
      const doImportantWork = () => new Promise((resolve) => setTimeout(resolve, 2000))

      const asyncUpdater = async () => {
        await doImportantWork()
        store.set({ foo: 1 })
      }

      expect(store.state.foo).toBe(0)
      await asyncUpdater()
      expect(store.state.foo).toBe(1)
    })

    it("if no new values are applied, the state stays untouched", () => {
      const oldState = store.state
      store.set({ foo: 0 })
      expect(store.state).toBe(oldState)
    })

    it("if something actually changes, the state become a new object", () => {
      const oldState = store.state
      store.set({ foo: 1 })
      expect(store.state).not.toBe(oldState)
    })
  })

  describe(".subscribe", () => {
    it("accepts a listener callback that will be invoked when the store changes", () => {
      const listener = jest.fn()
      store.set({ foo: 0, bar: 0 })
      store.subscribe(listener)
      store.set({ foo: 1 })
      store.unsubscribe(listener)

      /* It should have been called exactly once */
      expect(listener.mock.calls.length).toBe(1)

      /* The first argument should be the changes */
      expect(listener.mock.calls[0][0]).toEqual({ foo: 1 })

      /* The second argument should be the previous state */
      expect(listener.mock.calls[0][1]).toEqual({ foo: 0, bar: 0 })
    })

    it("allows subscribing to updates to a store", () => {
      const changeCounters = {
        foo: 0,
        bar: 0
      }

      const listener = (updates) => {
        for (const prop in updates) changeCounters[prop]++
      }

      store.subscribe(listener)

      store.set(({ foo }) => ({ foo: foo + 1 }))
      store.set(({ foo, bar }) => ({ foo: foo + 1, bar: bar + 1 }))

      store.unsubscribe(listener)

      expect(changeCounters.foo).toEqual(2)
      expect(changeCounters.bar).toEqual(1)
    })
  })
})
