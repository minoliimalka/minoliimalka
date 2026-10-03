import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  // Relative assets support both domain roots and subdirectory hosting.
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 8443,
    strictPort: true,
  },
  preview: { host: "0.0.0.0", port: 8443 },
})
