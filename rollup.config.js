import typescript from "@rollup/plugin-typescript"

export default {
  input: "src/index.ts",
  output: {
    // file: "dist/index.js",
    dir: "dist",
    format: "cjs"
  },
  plugins: [typescript()]
}
