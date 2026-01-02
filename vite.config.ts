
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Do not define process.env.API_KEY here as it prevents dynamic updates from the UI dialog
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
