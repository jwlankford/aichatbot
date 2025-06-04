import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // Import the 'path' module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  // Set the base path for deployment.
  // For GitHub Pages, this should be your repository name.
  // Your site will be served from jwlankford.github.io/aichatbot/
  base: '/aichatbot/',
  build: {
    rollupOptions: {
      // Explicitly define index.html as the main input for Rollup.
      // This helps Rollup correctly resolve scripts referenced within index.html.
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});