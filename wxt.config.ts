import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: 'A11y Helper',
    permissions: ['storage', 'activeTab'],
    commands: {
      'toggle-text': {
        suggested_key: {default: 'Alt+Shift+T',
          mac: 'Command+Shift+T'},
        description: 'Toggle dyslexia-friendly text'
      },
      'toggle-ruler': {
        suggested_key: {default: 'Alt+Shift+R',
          mac: 'Command+Shift+R'},
        description: 'Toggle reading ruler',
      },
      'cycle-color': {
        suggested_key: {default: 'Alt+Shift+C',
          mac: 'Command+Shift+C'},
        description: 'Cycle color blindness filters',
      },
    },
  },
});