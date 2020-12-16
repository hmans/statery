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
    const store = makeStore({
      wood: 0,
      gold: 4,
      houses: 0
    })

    const collectWood = () =>
      store.set((state) => ({
        wood: state.wood + 1
      }))

    const sellWood = () =>
      store.set((state) => ({
        wood: state.wood - 1,
        gold: state.gold + 1
      }))

    const canBuildHouse = (state: typeof store.state) => {
      const { wood, gold } = state
      return wood >= 5 && gold >= 5
    }

    const buildHouse = () =>
      store.set((state) =>
        canBuildHouse(state)
          ? {
              wood: state.wood - 5,
              gold: state.gold - 5,
              houses: state.houses + 1
            }
          : {}
      )

    let woodRenderCount = 0
    let goldRenderCount = 0
    let housesRenderCount = 0
    let buttonsRenderCount = 0

    const Wood = () => {
      woodRenderCount++
      const { wood } = useStore(store)
      return <p>Wood: {wood}</p>
    }

    const Gold = () => {
      goldRenderCount++
      const { gold } = useStore(store)
      return <p>Gold: {gold}</p>
    }

    const Houses = () => {
      housesRenderCount++
      const { houses } = useStore(store)
      return <p>Houses: {houses}</p>
    }

    const Buttons = () => {
      buttonsRenderCount++

      const proxy = useStore(store)

      return (
        <p>
          <button onClick={collectWood}>Collect Wood</button>
          <button onClick={sellWood}>Sell Wood</button>
          <button onClick={buildHouse} disabled={!canBuildHouse(proxy)}>
            Build House
          </button>
        </p>
      )
    }

    const { getByText, findByText } = render(
      <>
        <Wood />
        <Gold />
        <Houses />
        <Buttons />
      </>
    )

    await findByText("Wood: 0")
    await findByText("Houses: 0")
    await findByText("Gold: 4")

    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))
    fireEvent.click(getByText("Collect Wood"))

    await findByText("Wood: 6")

    fireEvent.click(getByText("Sell Wood"))

    await findByText("Wood: 5")
    await findByText("Gold: 5")
    await findByText("Houses: 0")

    fireEvent.click(getByText("Build House"))

    await findByText("Wood: 0")
    await findByText("Gold: 0")
    await findByText("Houses: 1")

    expect(woodRenderCount).toEqual(9)
    expect(housesRenderCount).toEqual(2)
    expect(buttonsRenderCount).toEqual(9)
  })
})
