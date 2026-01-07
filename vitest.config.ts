import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for React component testing
    environment: 'jsdom',

    // Setup file for global test configuration
    setupFiles: ['./src/lib/__tests__/setup.ts'],

    // Enable globals (describe, it, expect, etc.)
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/lib/__tests__/',
        '**/*.config.*',
        '**/types.ts',
      ],
    },

    // Test file patterns
    include: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', '.next', 'out'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
