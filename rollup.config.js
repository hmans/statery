import { sizeSnapshot } from "rollup-plugin-size-snapshot"
import typescript from "rollup-plugin-typescript2"
import pkg from "./package.json"

const defaults = {
  input: "src/index.ts",
  external: ["react"],
  plugins: [
    sizeSnapshot(),
    typescript({
      typescript: require("typescript")
    })
  ]
}

export default [
  {
    ...defaults,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  },
  {
    ...defaults,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  }
]
