import typescript from "rollup-plugin-typescript2"
import pkg from "./package.json"

const plugins = [
  typescript({
    typescript: require("typescript")
  })
]

const input = "src/index.ts"

export default [
  {
    input,
    plugins,
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true
    }
  },
  {
    input,
    plugins,
    output: {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  }
]
