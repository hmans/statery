import { act, render } from "@testing-library/react"
import { makeStore, useStore } from "../src"

describe("useStore", () => {
  it("fetches a piece of data from the store", async () => {
    const store = makeStore({ counter: 123 })

    const Counter = () => {
      const counter = useStore(store, "counter")
      return <p>Counter: {counter}</p>
    }

    const { findByText } = render(<Counter />)

    await findByText("Counter: 123")
  })

  it("re-renders the component when the data changes", async () => {
    const store = makeStore({ counter: 123 })

    const increment = () => store.set(({ counter }) => ({ counter: counter + 1 }))

    let renderCount = 0

    const Counter = () => {
      renderCount++
      const counter = useStore(store, "counter")
      return <p>Counter: {counter}</p>
    }

    const { findByText } = render(<Counter />)

    await findByText("Counter: 123")
    act(increment)
    await findByText("Counter: 124")
    act(increment)
    await findByText("Counter: 125")

    expect(renderCount).toEqual(3)
  })
})
