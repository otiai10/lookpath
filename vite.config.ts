import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        watch: false,
        threads: false,
        reporters: 'verbose',
    },
    esbuild: {
        target: 'es2020',
    },
});
