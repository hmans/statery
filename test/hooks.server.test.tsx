import React from "react"
import { renderToPipeableStream } from "react-dom/server"
import { PassThrough } from "stream"
import { makeStore, useStore } from "../src"

function renderServerSide(element: React.ReactElement) {
  return new Promise<string>((resolve, reject) => {
    let result = ""
    renderToPipeableStream(element)
      .pipe(new PassThrough())
      .on("data", (chunk) => (result += chunk))
      .on("end", () => resolve(result))
      .on("error", reject)
  })
}

describe("useStore", () => {
  it("renders server-side", async () => {
    const store = makeStore({ ssr: "yep" })

    const SSRComponent = () => {
      const { ssr } = useStore(store)
      return <div>{ssr}</div>
    }

    const html = await renderServerSide(<SSRComponent />)

    expect(html).toEqual("<div>yep</div>")
  })
})
