import type { ColorBlindMode, ColorBlindType } from './colorblind';

export type FontChoice = 'verdana' | 'arial' | 'tahoma' | 'trebuchet';

export interface Settings {
  enabled: boolean;
  font: FontChoice;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  colorBlind: ColorBlindType;
  colorBlindMode: ColorBlindMode;
  ruler: boolean;
  rulerHeight: number;
  rulerDim: number;
}

export const defaultSettings: Settings = {
  enabled: false,
  font: 'verdana',
  lineHeight: 1.8,
  letterSpacing: 0.05,
  wordSpacing: 0.15,
  colorBlind: 'none',
  colorBlindMode: 'correct',
  ruler: false,
  rulerHeight: 48,
  rulerDim: 0.5,
};

export const FONT_STACKS: Record<FontChoice, string> = {
  verdana: 'Verdana, Geneva, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  tahoma: 'Tahoma, Verdana, sans-serif',
  trebuchet: '"Trebuchet MS", Helvetica, sans-serif',
};

export const GLOBAL_KEY = 'global';
export const siteKey = (host: string) => `site:${host}`;

export async function getGlobal(): Promise<Settings> {
  const r = await browser.storage.sync.get(GLOBAL_KEY);
  return { ...defaultSettings, ...(r[GLOBAL_KEY] ?? {}) };
}

export function saveGlobal(s: Settings) {
  return browser.storage.sync.set({ [GLOBAL_KEY]: s });
}

// null means "this site has no custom settings"
export async function getSite(host: string): Promise<Settings | null> {
  const key = siteKey(host);
  const r = await browser.storage.sync.get(key);
  return r[key] ? { ...defaultSettings, ...r[key] } : null;
}

export function saveSite(host: string, s: Settings) {
  return browser.storage.sync.set({ [siteKey(host)]: s });
}

export function removeSite(host: string) {
  return browser.storage.sync.remove(siteKey(host));
}

// What a page should actually use: its own settings if it has them, else global
export async function getEffective(host: string): Promise<Settings> {
  return (await getSite(host)) ?? (await getGlobal());
}

// Save a change where it belongs: the site's own settings if it has any, else global
export async function updateForHost(host: string, patch: Partial<Settings>) {
  const site = await getSite(host);
  if (site) {
    await saveSite(host, { ...site, ...patch });
  } else {
    await saveGlobal({ ...(await getGlobal()), ...patch });
  }
}