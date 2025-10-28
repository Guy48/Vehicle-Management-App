import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Enables DOM for React components
    setupFiles: ['./src/test/setup.ts'], // optional, but recommended
    globals: true, // allows using describe/test/expect without import
  },
});
