import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    proxy: {
      "/api": {
        target: "https://hac.hiroshima-aiclub.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: true,
        cookieDomainRewrite: {
          "*": "localhost",
        },
        cookiePathRewrite: {
          "*": "/",
        },
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // クッキーをプロキシリクエストに転送
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // レスポンスのSet-Cookieヘッダーを調整
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) => {
                return cookie
                  .replace(/Domain=.*?;/gi, "Domain=localhost;")
                  .replace(/SameSite=.*?;/gi, "SameSite=Lax;")
                  .replace(/Secure;/gi, "");
              });
            }
          });
        },
      },
    },
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "project.better-hac.js",
        assetFileNames: "project.better-hac.[ext]",
      },
    },
  },
});
