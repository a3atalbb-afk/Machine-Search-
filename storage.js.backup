/* ==========================================
   MACHINE SEARCH — Data Storage
   Uses localStorage so imported data survives page reloads
   Falls back to data/machines.json on first run
   ========================================== */

const Storage = (() => {
  const KEY = 'ms_data_v1';

  async function load() {
    // 1. Try localStorage first
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('localStorage parse failed', e);
      }
    }

    // 2. Fallback to JSON file
    try {
      const res = await fetch('data/machines.json');
      if (res.ok) {
        const data = await res.json();
        save(data);
        return data;
      }
    } catch (e) {
      console.warn('fetch data/machines.json failed', e);
    }

    // 3. Empty
    return {
      meta: { filename: '—', sheet: '—', location: '—', importedAt: '—', totalRecords: 0 },
      machines: []
    };
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('localStorage save failed', e);
      return false;
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  return { load, save, clear };
})();
