import { defaultSettings, FONT_STACKS, getSettings, type Settings } from '../utils/settings';

const STYLE_ID = 'a11y-helper-style';

// Everything in the body except icons, SVGs and code
const TEXT_TARGET =
  'body :not(i):not(svg):not(svg *):not(code):not(pre):not(kbd):not(samp)' +
  ':not([class*="icon" i]):not([class*="fa-"]):not([class*="material" i]):not([class*="glyph" i])';

function buildCss(s: Settings) {
  return `
    body, ${TEXT_TARGET} {
      font-family: ${FONT_STACKS[s.font]} !important;
      line-height: ${s.lineHeight} !important;
      letter-spacing: ${s.letterSpacing}em !important;
      word-spacing: ${s.wordSpacing}em !important;
    }`;
}

function apply(s: Settings) {
  document.getElementById(STYLE_ID)?.remove();
  if (!s.enabled) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildCss(s);
  document.head.appendChild(style);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    getSettings().then(apply);
    browser.storage.onChanged.addListener((changes) => {
  const change = changes.settings;
  if (change) {
    apply({ ...defaultSettings, ...(change.newValue as Partial<Settings>) });
  }
});
  },
});