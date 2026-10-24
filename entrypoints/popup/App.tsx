import { useEffect, useState } from 'react';

function App() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    browser.storage.sync.get('dyslexia').then((r) => setOn(!!r.dyslexia));
  }, []);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    await browser.storage.sync.set({ dyslexia: next });
  };

  return (
    <div style={{ width: 240, padding: 16 }}>
      <h1 style={{ fontSize: 16, marginBottom: 8 }}>A11y Helper</h1>
      <label>
        <input type="checkbox" checked={on} onChange={toggle} /> Dyslexia-friendly text
      </label>
    </div>
  );
}

export default App;