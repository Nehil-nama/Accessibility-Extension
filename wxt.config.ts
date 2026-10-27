import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ plugins: [tailwindcss()] }),
    manifest: {
    name: 'A11y Helper',
    permissions: ['storage', 'activeTab', 'scripting', 'tts'],
    commands: {
      'toggle-text': {
        suggested_key: { default: 'Alt+Shift+T' },
        description: 'Toggle dyslexia-friendly text',
      },
      'toggle-ruler': {
        suggested_key: { default: 'Alt+Shift+R' },
        description: 'Toggle reading ruler',
      },
      'cycle-color': {
        suggested_key: { default: 'Alt+Shift+C' },
        description: 'Cycle color vision filter',
      },
      'speak-selection': {
        suggested_key: { default: 'Alt+Shift+S' },
        description: 'Read selected text aloud (press again to stop)',
      },
    },
  },
});