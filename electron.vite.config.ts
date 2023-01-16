import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          //要访问的跨域的域名
          // target: 'http://118.25.4.192:7002', //线上环境
          target: "http://localhost:7002", //本地环境
          changeOrigin: true, //开启代理
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
