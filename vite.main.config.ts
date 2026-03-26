import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    __ENCRYPT_SECRET__: JSON.stringify(process.env.VELNOT_ENCRYPT_SECRET ?? ''),
  },
});
