/* ==========================================
   MACHINE SEARCH — Browser Excel Parser
   Uses SheetJS (window.XLSX) to read .xlsx/.xls
   ========================================== */

const ExcelParser = (() => {

  // ---------- MachineCodeParser ----------
  function parseMachineCode(code) {
    if (!code) return '';
    let s = String(code).trim();
    s = s.replace(/^[A-Za-z]_/, '');       // strip "R_", "A_", ...
    s = s.replace(/_\d+$/, '');             // strip trailing "_002"
    s = s.replace(/_/g, ' ');               // underscores → spaces
    s = s.replace(/\s+/g, ' ').trim();      // collapse whitespace
    return s;
  }

  // Preserve original location — only trim whitespace
  function normalizeLocation(loc) {
    if (!loc) return '';
    return String(loc).trim();
  }

  // ---------- SheetDetector ----------
  const TECH_SPEC = ['voltage','power','weight','specification','serial','warranty','supplier','cost','price'];

  function normalizeHeader(s) {
    if (s == null) return '';
    return String(s).toLowerCase().replace(/\s+/g, ' ').trim().replace(/[:.]+$/, '');
  }

  function scoreSheet(name, headers) {
    const norm = headers.map(normalizeHeader);
    if (!norm.includes('machine code')) return -1;

    let score = 50;
    if (norm.includes('no')) score += 10;
    if (norm.includes('arrival date')) score += 10;
    if (norm.includes('location')) score += 10;
    for (const kw of TECH_SPEC) if (norm.includes(kw)) score -= 5;

    const nm = name.toLowerCase().trim();
    if (nm === 'machine') score += 100;
    else if (nm.includes('machine')) score += 60;
    if (nm.includes('bincard')) score -= 80;
    if (['chair','handtools','server'].includes(nm) || nm.startsWith('key ')) score -= 50;

    return score;
  }

  function findHeaderRow(rows) {
    for (let r = 0; r < Math.min(rows.length, 30); r++) {
      const row = rows[r] || [];
      const norm = row.map(normalizeHeader);
      if (norm.includes('machine code')) {
        return { rowIndex: r, headers: row };
      }
    }
    return null;
  }

  function detectMachineSheet(workbook) {
    const candidates = [];
    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const found = findHeaderRow(rows);
      if (!found) continue;
      const score = scoreSheet(sheetName, found.headers);
      if (score > 0) {
        candidates.push({
          name: sheetName,
          rows,
          headerRow: found.rowIndex,
          headers: found.headers,
          score
        });
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  // ---------- Main ----------
  async function parseFile(file, onProgress) {
    if (!window.XLSX) {
      throw new Error('SheetJS not loaded. Check lib/xlsx.full.min.js');
    }

    if (onProgress) onProgress(10, 'Reading file...');
    const buf = await file.arrayBuffer();
    const workbook = window.XLSX.read(buf, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Workbook has no worksheets');
    }

    if (onProgress) onProgress(40, 'Detecting machine sheet...');
    const chosen = detectMachineSheet(workbook);
    if (!chosen) {
      throw new Error('No worksheet with a valid "Machine Code" column found');
    }

    if (onProgress) onProgress(70, 'Parsing rows from "' + chosen.name + '"...');

    const norm = chosen.headers.map(normalizeHeader);
    const codeIdx = norm.indexOf('machine code');
    const noIdx   = norm.indexOf('no');
    const arrIdx  = norm.indexOf('arrival date');
    const locIdx  = norm.indexOf('location');
    const nameIdx = norm.indexOf('name');

    const machines = [];
    const locations = {};
    const seenCodes = new Set();
    let duplicates = 0;
    let invalid = 0;

    for (let r = chosen.headerRow + 1; r < chosen.rows.length; r++) {
      const row = chosen.rows[r] || [];
      const code = String(row[codeIdx] ?? '').trim();
      if (!code) continue;

      // Skip duplicates
      if (seenCodes.has(code)) {
        duplicates++;
        continue;
      }
      seenCodes.add(code);

      const locRaw = locIdx >= 0 ? String(row[locIdx] ?? '').trim() : '';
      const loc = normalizeLocation(locRaw);

      let num = null;
      if (noIdx >= 0) {
        const v = row[noIdx];
        const n = parseInt(v, 10);
        if (!isNaN(n)) num = n;
      }

      let arrival = null;
      if (arrIdx >= 0) {
        const v = row[arrIdx];
        if (v != null && v !== '') arrival = String(v).trim();
      }

      machines.push({
        no: num ?? machines.length + 1,
        code: code,
        name: parseMachineCode(code),
        location: loc || '—',
        number: num,
        arrival: arrival
      });

      if (loc) locations[loc] = (locations[loc] || 0) + 1;
    }

    if (machines.length === 0) {
      throw new Error('Sheet "' + chosen.name + '" has no machine records');
    }

    const commonLoc = Object.entries(locations)
      .sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0]?.[0] || '—';

    if (onProgress) onProgress(100, 'Done');

    return {
      meta: {
        filename: file.name,
        sheet: chosen.name,
        location: commonLoc,
        importedAt: new Date().toISOString().slice(0, 19),
        totalRecords: machines.length
      },
      machines,
      stats: {
        total: machines.length,
        duplicates,
        invalid
      }
    };
  }

  return {
    parseFile,
    parseMachineCode,
    normalizeLocation,
    detectMachineSheet
  };
})();
