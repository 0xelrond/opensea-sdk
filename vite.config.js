import { defineConfig } from 'vite'
const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src"),
      fileName: (format) => `opensea-sdk.${format}.js`,
      name: "opensea-sdk",
    },
  },
  resolve: {
      "alias": {
          "@": path.resolve(__dirname, "src")
      }
  }
})