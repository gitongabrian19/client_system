import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  server: {
    port: 5000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.js',
      exportName: 'viteNodeApp'
    })
  ]
});
