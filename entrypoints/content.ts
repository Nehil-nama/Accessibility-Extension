export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    const STYLE_ID = 'a11y-helper-style';

    const apply = (enabled: boolean) => {
      document.getElementById(STYLE_ID)?.remove();
      if (!enabled) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        body, body * {
          font-family: Verdana, Arial, sans-serif !important;
          line-height: 1.8 !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.15em !important;
        }`;
      document.head.appendChild(style);
    };

    browser.storage.sync.get('dyslexia').then((r) => apply(!!r.dyslexia));
    browser.storage.onChanged.addListener((changes) => {
      if (changes.dyslexia) apply(!!changes.dyslexia.newValue);
    });
  },
});