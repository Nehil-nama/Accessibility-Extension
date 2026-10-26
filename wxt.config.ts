import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'A11y Helper',
        permissions: ['storage', 'activeTab'],
  },
});