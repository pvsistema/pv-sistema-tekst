import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

/**
 * Готовит index.html к работе без интернета: убирает внешние скрипты
 * телеметрии и подключение веб-шрифтов, иначе окно программы на
 * компьютере без сети ждёт ответа и открывается с задержкой.
 */
const offlineHtml = (): Plugin => ({
  name: 'offline-html',
  enforce: 'post',
  transformIndexHtml(html) {
    /* каждый шаблон ограничен одним тегом, иначе вырезается половина страницы */
    const scriptBody = '(?:(?!<\\/script>)[\\s\\S])*';
    return html
      .replace(/<script[^>]*\ssrc="https?:\/\/[^"]*"[^>]*><\/script>/g, '')
      .replace(
        new RegExp(
          `<script\\b[^>]*>${scriptBody}mc\\.yandex\\.ru${scriptBody}<\\/script>`,
          'g',
        ),
        '',
      )
      .replace(
        /<noscript>(?:(?!<\/noscript>)[\s\S])*?yandex(?:(?!<\/noscript>)[\s\S])*?<\/noscript>/gi,
        '',
      )
      .replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>/g, '')
      .replace(
        '</head>',
        '    <link rel="stylesheet" href="./fonts/fonts.css"/>\n</head>',
      )
      .replace(/<html lang="en"/, '<html lang="ru"');
  },
});

export default defineConfig({
  plugins: [react(), offlineHtml()],
  base: './',
  define: {
    'import.meta.env.VITE_DESKTOP': JSON.stringify('1'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-desktop',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});