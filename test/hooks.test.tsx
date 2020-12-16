import { fireEvent, render } from "@testing-library/react"
import { makeStore, useStore } from "../src"

describe("useStore", () => {
  it("fetches a piece of data from the store", async () => {
    const store = makeStore({ counter: 123 })

    const Counter = () => {
      const { counter } = useStore(store)
      return <p>Counter: {counter}</p>
    }

    const { findByText } = render(<Counter />)

    await findByText("Counter: 123")
  })

  it("provides a proxy that allows subscribing to individual properties", async () => {
    const store = makeStore({ wood: 8, houses: 0 })

    const collectWood = () => store.set((state) => ({ wood: state.wood + 1 }))
    const buildHouse = () =>
      store.set((state) => ({ wood: state.wood - 10, houses: state.houses + 1 }))

    let woodRenderCount = 0
    let housesRenderCount = 0
    let buttonsRenderCount = 0

    const Wood = () => {
      woodRenderCount++
      const { wood } = useStore(store)
      return <p>Wood: {wood}</p>
    }

    const Houses = () => {
      housesRenderCount++
      const { houses } = useStore(store)
      return <p>Houses: {houses}</p>
    }

    const Buttons = () => {
      buttonsRenderCount++
      return (
        <p>
          <button onClick={collectWood}>Collect Wood</button>
          <button onClick={buildHouse}>Build House</button>
        </p>
      )
    }

    const { getByText, findByText } = render(
      <>
        <Wood />
        <Houses />
        <Buttons />
      </>
    )

    await findByText("Wood: 8")
    await findByText("Houses: 0")

    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))

    await findByText("Wood: 10")
    await findByText("Houses: 0")

    fireEvent.click(getByText("Build House"))

    await findByText("Wood: 0")
    await findByText("Houses: 1")

    expect(woodRenderCount).toEqual(4)
    expect(housesRenderCount).toEqual(2)
    expect(buttonsRenderCount).toEqual(1)
  })
})
