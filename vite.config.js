import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32x32.png", "apple-touch-icon.png"],
      manifestFilename: 'site.webmanifest',
      manifest: {
        id: 'lbatch-quick-tools',
        name: "Quick Tools",
        short_name: "QuickTools",
        description: "A collection of handy tools",
        theme_color: "#292524",
        background_color: '#111827',
        start_url: '/',
        launch_handler: {
          client_mode: 'auto'
        },
        orientation: 'portrait',
        screenshots: [
          { form_factor: 'narrow', src: '/screenshot-1.png', sizes: '920x2048', type: 'image/png' },
          { form_factor: 'narrow', src: '/screenshot-2.png', sizes: '920x2048', type: 'image/png' },
          { form_factor: 'narrow', src: '/screenshot-3.png', sizes: '920x2048', type: 'image/png' },
          { form_factor: 'narrow', src: '/screenshot-4.png', sizes: '920x2048', type: 'image/png' },
          { form_factor: 'narrow', src: '/screenshot-5.png', sizes: '920x2048', type: 'image/png' },
        ],
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
