import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        cloudflare(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['vite.svg'],
            manifest: {
                name: 'Guitar Helper',
                short_name: 'GuitarHelper',
                description: 'A guitar practice companion app',
                theme_color: '#2c3e50',
                icons: [
                    {
                        src: 'vite.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml'
                    },
                    {
                        src: 'vite.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml'
                    }
                ]
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
                runtimeCaching: [
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.destination === 'document';
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'html-cache',
                        }
                    },
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.destination === 'script' || request.destination === 'style';
                        },
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'assets-cache',
                        }
                    },
                    {
                        urlPattern: function (_a) {
                            var request = _a.request;
                            return request.destination === 'image';
                        },
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
                            },
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
