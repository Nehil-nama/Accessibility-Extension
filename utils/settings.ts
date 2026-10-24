export type FontChoice = 'verdana' | 'arial' | 'tahoma' | 'trebuchet';

export interface Settings {
  enabled: boolean;
  font: FontChoice;
  lineHeight: number;    // unitless multiplier
  letterSpacing: number; // em
  wordSpacing: number;   // em
}

export const defaultSettings: Settings = {
  enabled: false,
  font: 'verdana',
  lineHeight: 1.8,
  letterSpacing: 0.05,
  wordSpacing: 0.15,
};

export const FONT_STACKS: Record<FontChoice, string> = {
  verdana: 'Verdana, Geneva, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  tahoma: 'Tahoma, Verdana, sans-serif',
  trebuchet: '"Trebuchet MS", Helvetica, sans-serif',
};

export async function getSettings(): Promise<Settings> {
  const r = await browser.storage.sync.get('settings');
  return { ...defaultSettings, ...(r.settings ?? {}) };
}

export function saveSettings(s: Settings) {
  return browser.storage.sync.set({ settings: s });
}