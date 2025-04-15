import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/', // ✅ This fixes 404 and MIME issues on Render
  plugins: [react(), tailwindcss()],
});
