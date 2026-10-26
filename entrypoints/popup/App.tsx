import { useEffect, useState } from 'react';
import type { ColorBlindMode, ColorBlindType } from '../../utils/colorblind';
import {
  defaultSettings,
  FONT_STACKS,
  getGlobal,
  getSite,
  removeSite,
  saveGlobal,
  saveSite,
  type FontChoice,
  type Settings,
} from '../../utils/settings';

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span>
        {props.label}: {props.value}
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  );
}

async function getActiveHost(): Promise<string | null> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return null;
  try {
    const url = new URL(tab.url);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.hostname : null;
  } catch {
    return null;
  }
}

function App() {
  const [host, setHost] = useState<string | null>(null);
  const [globalSettings, setGlobalSettings] = useState<Settings>(defaultSettings);
  const [siteSettings, setSiteSettings] = useState<Settings | null>(null);

  useEffect(() => {
    (async () => {
      const h = await getActiveHost();
      setHost(h);
      setGlobalSettings(await getGlobal());
      if (h) setSiteSettings(await getSite(h));
    })();
  }, []);

  const settings = siteSettings ?? globalSettings;
  const useCustom = siteSettings !== null;

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    if (host && siteSettings) {
      setSiteSettings(next);
      saveSite(host, next);
    } else {
      setGlobalSettings(next);
      saveGlobal(next);
    }
  };

  const toggleCustom = async (on: boolean) => {
    if (!host) return;
    if (on) {
      // start the site's settings as a copy of the global ones
      setSiteSettings(globalSettings);
      await saveSite(host, globalSettings);
    } else {
      setSiteSettings(null);
      await removeSite(host);
    }
  };

  return (
    <div style={{ width: 280, padding: 16, color: 'white', display: 'grid', gap: 12 }}>
      <h1 style={{ fontSize: 16, margin: 0 }}>A11y Helper</h1>

      <label>
        <input
          type="checkbox"
          disabled={!host}
          checked={useCustom}
          onChange={(e) => toggleCustom(e.target.checked)}
        />{' '}
        Custom settings for {host ?? 'this page (unavailable)'}
      </label>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        Editing: {useCustom ? host : 'all sites'}
      </div>

      <label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />{' '}
        Dyslexia-friendly text
      </label>

      <label style={{ display: 'grid', gap: 4 }}>
        Font
        <select
          value={settings.font}
          onChange={(e) => update({ font: e.target.value as FontChoice })}
        >
          {Object.keys(FONT_STACKS).map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: 4 }}>
        Color vision
        <select
          value={settings.colorBlind}
          onChange={(e) => update({ colorBlind: e.target.value as ColorBlindType })}
        >
          <option value="none">Off</option>
          <option value="protanopia">Protanopia (red-weak)</option>
          <option value="deuteranopia">Deuteranopia (green-weak)</option>
          <option value="tritanopia">Tritanopia (blue-weak)</option>
        </select>
      </label>

      <label style={{ display: 'grid', gap: 4 }}>
        Mode
        <select
          value={settings.colorBlindMode}
          onChange={(e) => update({ colorBlindMode: e.target.value as ColorBlindMode })}
        >
          <option value="correct">Help me see differences</option>
          <option value="simulate">Simulate (for testing)</option>
        </select>
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.ruler}
          onChange={(e) => update({ ruler: e.target.checked })}
        />{' '}
        Reading ruler
      </label>

      {settings.ruler && (
        <>
          <Slider label="Ruler height (px)" value={settings.rulerHeight} min={24} max={120} step={4}
            onChange={(v) => update({ rulerHeight: v })} />
          <Slider label="Dimming" value={settings.rulerDim} min={0.1} max={0.9} step={0.05}
            onChange={(v) => update({ rulerDim: v })} />
        </>
      )}

      <Slider label="Line height" value={settings.lineHeight} min={1.2} max={2.4} step={0.1}
        onChange={(v) => update({ lineHeight: v })} />
      <Slider label="Letter spacing (em)" value={settings.letterSpacing} min={0} max={0.2} step={0.01}
        onChange={(v) => update({ letterSpacing: v })} />
      <Slider label="Word spacing (em)" value={settings.wordSpacing} min={0} max={0.5} step={0.05}
        onChange={(v) => update({ wordSpacing: v })} />
    </div>
  );
}

export default App;