import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      // '/api'로 시작하는 모든 요청을 프록시합니다.
      '/api': {
        // 요청을 전달할 실제 백엔드 서버 주소입니다.
        target: 'http://localhost:8080',
        // 주소를 변경할 때 필요한 설정입니다. CORS 오류를 방지합니다.
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
