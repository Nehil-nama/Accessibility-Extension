import type { ColorBlindType } from '../utils/colorblind';
import { getEffective, updateForHost } from '../utils/settings';
import { getActiveHost } from '../utils/tabs';

const COLOR_CYCLE: ColorBlindType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];

export default defineBackground(() => {
  browser.commands.onCommand.addListener(async (command) => {
    const host = await getActiveHost();
    if (!host) return; // chrome:// pages and similar can't be changed

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
});