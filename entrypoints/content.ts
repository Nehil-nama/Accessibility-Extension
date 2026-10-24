import { defaultSettings, FONT_STACKS, getSettings, type Settings } from '../utils/settings';
import { buildMatrixValues } from '../utils/colorblind';

const STYLE_ID = 'a11y-helper-style';
const CB_SVG_ID = 'a11y-helper-cb-svg';
const CB_FILTER_ID = 'a11y-helper-cb-filter';
const SVG_NS = 'http://www.w3.org/2000/svg';

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

function applyTypography(s: Settings) {
  document.getElementById(STYLE_ID)?.remove();
  if (!s.enabled) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildCss(s);
  document.head.appendChild(style);
}

function applyColorBlind(s: Settings) {
  document.getElementById(CB_SVG_ID)?.remove();
  document.documentElement.style.removeProperty('filter');
  if (s.colorBlind === 'none') return;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('id', CB_SVG_ID);
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';

  const filter = document.createElementNS(SVG_NS, 'filter');
  filter.setAttribute('id', CB_FILTER_ID);

  const matrix = document.createElementNS(SVG_NS, 'feColorMatrix');
  matrix.setAttribute('type', 'matrix');
  matrix.setAttribute('values', buildMatrixValues(s.colorBlind, s.colorBlindMode));

  filter.append(matrix);
  svg.append(filter);
  (document.body ?? document.documentElement).append(svg);
  document.documentElement.style.filter = `url(#${CB_FILTER_ID})`;
}

function applyAll(s: Settings) {
  applyTypography(s);
  applyColorBlind(s);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    getSettings().then(applyAll);
    browser.storage.onChanged.addListener((changes) => {
      const change = changes.settings;
      if (change) {
        applyAll({ ...defaultSettings, ...(change.newValue as Partial<Settings>) });
      }
    });
  },
});