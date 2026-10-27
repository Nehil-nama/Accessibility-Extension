import { getEffective, getGlobal } from './settings';
import { getActiveHost } from './tabs';

async function getSelectedText(tabId: number): Promise<string> {
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId },
      func: () => window.getSelection()?.toString() ?? '',
    });
    return ((result?.result as string | undefined) ?? '').trim();
  } catch {
    return ''; // pages like chrome:// can't be read
  }
}

export function stopSpeech() {
  browser.tts.stop();
}

export async function speakSelection() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const text = await getSelectedText(tab.id);
  if (!text) return;

  const host = await getActiveHost();
  const s = host ? await getEffective(host) : await getGlobal();

  browser.tts.speak(text.slice(0, 30000), {
    voiceName: s.voiceName || undefined,
    rate: s.speechRate,
    enqueue: false,
  });
}

// Used by the keyboard shortcut: start if silent, stop if speaking
export async function toggleSpeech() {
  if (await browser.tts.isSpeaking()) {
    stopSpeech();
  } else {
    await speakSelection();
  }
}