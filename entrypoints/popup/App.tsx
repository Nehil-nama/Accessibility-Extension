import { useEffect, useState, type ReactNode } from 'react';
import type { ColorBlindMode, ColorBlindType } from '../../utils/colorblind';
import {
  defaultSettings,
  getGlobal,
  getSite,
  removeSite,
  saveGlobal,
  saveSite,
  type FontChoice,
  type Settings,
} from '../../utils/settings';

const FONT_OPTIONS: { value: FontChoice; label: string }[] = [
  { value: 'verdana', label: 'Verdana' },
  { value: 'arial', label: 'Arial' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'trebuchet', label: 'Trebuchet MS' },
];

const COLOR_OPTIONS: { value: ColorBlindType; label: string }[] = [
  { value: 'none', label: 'Off' },
  { value: 'protanopia', label: 'Protanopia (red-weak)' },
  { value: 'deuteranopia', label: 'Deuteranopia (green-weak)' },
  { value: 'tritanopia', label: 'Tritanopia (blue-weak)' },
];

const MODE_OPTIONS: { value: ColorBlindMode; label: string }[] = [
  { value: 'correct', label: 'Help me see differences' },
  { value: 'simulate', label: 'Simulate (for testing)' },
];

function Switch(props: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      disabled={props.disabled}
      onClick={() => props.onChange(!props.checked)}
      className="group flex w-full items-center justify-between gap-3 rounded-md py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
    >
      <span className="break-all">{props.label}</span>
      <span className="relative h-6 w-11 shrink-0 rounded-full border-2 border-ink bg-white group-aria-checked:bg-ink">
        <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-ink transition-transform group-aria-checked:translate-x-5 group-aria-checked:bg-white" />
      </span>
    </button>
  );
}

function Select<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="font-bold">{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
        className="h-9 rounded-md border-2 border-line bg-white px-2 focus-visible:border-ink focus-visible:outline-none"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="flex justify-between">
        <span>{props.label}</span>
        <span className="tabular-nums text-muted">{props.value}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      />
    </label>
  );
}

function Section(props: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t-2 border-line pt-3">
      <h2 className="font-bold">{props.title}</h2>
      {props.children}
    </section>
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
      setSiteSettings(globalSettings);
      await saveSite(host, globalSettings);
    } else {
      setSiteSettings(null);
      await removeSite(host);
    }
  };

  return (
    <div className="grid w-80 gap-3 p-4 text-base">
      <header className="-mx-4 -mt-4 bg-band px-4 py-3">
        <h1 className="text-lg font-bold">A11y Helper</h1>
      </header>

      <div className="grid gap-1">
        <Switch
          label={host ? `Custom settings for ${host}` : 'Custom settings for this site'}
          checked={useCustom}
          disabled={!host}
          onChange={toggleCustom}
        />
        <p className="text-sm text-muted">
          {!host
            ? 'Open a website to set options for just that site.'
            : useCustom
              ? `Changes apply only to ${host}.`
              : 'Changes apply to all sites.'}
        </p>
      </div>

      <Section title="Text">
        <Switch
          label="Dyslexia-friendly text"
          checked={settings.enabled}
          onChange={(v) => update({ enabled: v })}
        />
        <Select
          label="Font"
          value={settings.font}
          options={FONT_OPTIONS}
          onChange={(v) => update({ font: v })}
        />
        <Slider label="Line height" value={settings.lineHeight} min={1.2} max={2.4} step={0.1}
          onChange={(v) => update({ lineHeight: v })} />
        <Slider label="Letter spacing (em)" value={settings.letterSpacing} min={0} max={0.2} step={0.01}
          onChange={(v) => update({ letterSpacing: v })} />
        <Slider label="Word spacing (em)" value={settings.wordSpacing} min={0} max={0.5} step={0.05}
          onChange={(v) => update({ wordSpacing: v })} />
      </Section>

      <Section title="Color vision">
        <Select
          label="Type"
          value={settings.colorBlind}
          options={COLOR_OPTIONS}
          onChange={(v) => update({ colorBlind: v })}
        />
        <Select
          label="Mode"
          value={settings.colorBlindMode}
          options={MODE_OPTIONS}
          onChange={(v) => update({ colorBlindMode: v })}
        />
      </Section>

      <Section title="Reading ruler">
        <Switch
          label="Show ruler"
          checked={settings.ruler}
          onChange={(v) => update({ ruler: v })}
        />
        {settings.ruler && (
          <>
            <Slider label="Height (px)" value={settings.rulerHeight} min={24} max={120} step={4}
              onChange={(v) => update({ rulerHeight: v })} />
            <Slider label="Dimming" value={settings.rulerDim} min={0.1} max={0.9} step={0.05}
              onChange={(v) => update({ rulerDim: v })} />
          </>
        )}
      </Section>
    </div>
  );
}

export default App;