import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/main.tsx",
      name: "videoRecorder",
      formats: ["es"],
      fileName: () => "video-recorder.js",
    },
  },
  plugins: [react()],
  define: {
    'process.env': {}
  }
});
