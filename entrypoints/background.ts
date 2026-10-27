import type { ColorBlindType } from '../utils/colorblind';
import { getEffective, updateForHost } from '../utils/settings';
import { speakSelection, stopSpeech, toggleSpeech } from '../utils/speech';
import { getActiveHost } from '../utils/tabs';

const COLOR_CYCLE: ColorBlindType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];

export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    if (command === 'speak-selection') {
      await toggleSpeech();
      return;
    }

    const host = await getActiveHost();
    if (!host) return;

    const current = await getEffective(host);

    switch (command) {
      case 'toggle-text':
        await updateForHost(host, { enabled: !current.enabled });
        break;
      case 'toggle-ruler':
        await updateForHost(host, { ruler: !current.ruler });
        break;
      case 'cycle-color': {
        const next = COLOR_CYCLE[(COLOR_CYCLE.indexOf(current.colorBlind) + 1) % COLOR_CYCLE.length];
        await updateForHost(host, { colorBlind: next ?? 'none' });
        break;
      }
    }
  });

  // Messages from the popup buttons
  browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'speak') void speakSelection();
    else if (msg?.type === 'stop') stopSpeech();
    sendResponse({ ok: true });
  });
});