/**
 * Pilar 1: AI Indonesian Address Semantic Parser & Tokenizer
 * 
 * Specialized NLP tokenizer & entity extractor tailored for Indonesian address writing conventions.
 * Handles:
 * 1. Indonesian informal slang & abbreviations ("jl ry", "dkt jembatan", "sblh bkl", "dpn gapura", "rt2 rw3").
 * 2. Multi-Entity Named Entity Recognition (NER):
 *    - ROAD_NAME: Main street or thoroughfare
 *    - HOUSE_NUMBER: House, building, ruko, or block number
 *    - COMMUNITY_UNIT: RT & RW
 *    - PRIMARY_LANDMARK: Macro geographic marker (jembatan, rel KA, pasar, alun-alun)
 *    - MICRO_LANDMARK: Commercial/residential POI (warung, apotek, pagar warna, gang)
 *    - ADMIN_TOKENS: Village, District, Regency, Province
 * 3. Confidence scoring & canonical reconstruction.
 */

export interface ParsedAddressEntities {
  raw: string;
  normalized: string;
  roadName?: string;
  houseNumber?: string;
  rt?: string;
  rw?: string;
  rtRwFormatted?: string;
  primaryLandmark?: string;
  microLandmark?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  extractedTokens: {
    type: 'ROAD' | 'NUMBER' | 'RTRW' | 'LANDMARK_PRIMARY' | 'LANDMARK_MICRO' | 'ADMIN' | 'UNKNOWN';
    token: string;
    normalized: string;
  }[];
  confidenceScore: number; // 0.0 to 1.0
  standardFormatted: string;
}

// 1. Indonesian Slang & Abbreviation Lexicon
const INDO_SLANG_DICTIONARY: Record<string, string> = {
  'jl': 'jalan',
  'jln': 'jalan',
  'jln.': 'jalan',
  'jl.': 'jalan',
  'jlnr': 'jalan raya',
  'jlry': 'jalan raya',
  'ry': 'raya',
  'raya': 'raya',
  'gg': 'gang',
  'gg.': 'gang',
  'gng': 'gang',
  'lr': 'lorong',
  'kmpr': 'komplek',
  'kmp': 'komplek',
  'komp': 'komplek',
  'komp.': 'komplek',
  'perum': 'perumahan',
  'prm': 'perumahan',
  'dkt': 'dekat',
  'sblh': 'sebelah',
  'smpng': 'samping',
  'smpg': 'samping',
  'dpn': 'depan',
  'blkng': 'belakang',
  'blkg': 'belakang',
  'bwh': 'bawah',
  'ats': 'atas',
  'bkl': 'warung',
  'wrg': 'warung',
  'wr': 'warung',
  'tko': 'toko',
  'tk': 'toko',
  'aptek': 'apotek',
  'apt': 'apotek',
  'gpr': 'gapura',
  'jmbtn': 'jembatan',
  'jbtn': 'jembatan',
  'lpg': 'lapangan',
  'lpng': 'lapangan',
  'msjd': 'masjid',
  'msj': 'masjid',
  'mshla': 'musholla',
  'sklh': 'sekolah',
  'skul': 'sekolah',
  'sd': 'SD',
  'smp': 'SMP',
  'sma': 'SMA',
  'pt': 'PT',
  'cv': 'CV',
  'ds': 'desa',
  'ds.': 'desa',
  'kel': 'kelurahan',
  'kel.': 'kelurahan',
  'dsk': 'dusun',
  'dsn': 'dusun',
  'kcmtn': 'kecamatan',
  'kec': 'kecamatan',
  'kec.': 'kecamatan',
  'kab': 'kabupaten',
  'kab.': 'kabupaten',
  'kodya': 'kota',
  'prov': 'provinsi',
  'prov.': 'provinsi',
  'pos': 'pos',
  'no': 'nomor',
  'no.': 'nomor',
  'nmr': 'nomor',
  'blk': 'blok',
};

// 2. Landmark Keyword Categorization
const PRIMARY_LANDMARKS = [
  'jembatan', 'rel kereta', 'stasiun', 'terminal', 'alun-alun', 'pasar',
  'lapangan', 'simpang', 'perempatan', 'pertigaan', 'bundaran', 'tugu',
  'pelabuhan', 'bandara', 'kantor bupati', 'balai kota', 'masjid agung',
];

const MICRO_LANDMARK_PREFIXES = [
  'sebelah', 'samping', 'depan', 'belakang', 'dekat', 'seberang', 'arah',
  'masuk', 'ujung', 'pojok', 'pagar', 'gerbang', 'warung', 'toko', 'apotek',
];

/**
 * Normalizes informal slang, typos, and abbreviation tokens.
 */
export function normalizeIndonesianText(rawInput: string): string {
  if (!rawInput) return '';
  let text = rawInput.toLowerCase();

  // Normalize delimiters & repeated punctuation
  text = text.replace(/[/\\-]+/g, ' / ');
  text = text.replace(/[,;]+/g, ' , ');
  text = text.replace(/[()]/g, ' ');

  // Tokenize by whitespace
  const tokens = text.split(/\s+/).filter(Boolean);
  const normalizedTokens: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // Compound match: e.g. "jl" + "ry" -> "jalan raya"
    if ((t === 'jl' || t === 'jln') && tokens[i + 1] === 'ry') {
      normalizedTokens.push('jalan raya');
      i++;
      continue;
    }

    // RT/RW without space: e.g. "rt2" -> "rt 02", "rw3" -> "rw 03"
    const rtNoSpace = t.match(/^rt\.?(\d{1,4})$/i);
    if (rtNoSpace) {
      normalizedTokens.push(`rt ${rtNoSpace[1].padStart(2, '0')}`);
      continue;
    }
    const rwNoSpace = t.match(/^rw\.?(\d{1,4})$/i);
    if (rwNoSpace) {
      normalizedTokens.push(`rw ${rwNoSpace[1].padStart(2, '0')}`);
      continue;
    }

    // Number without space: e.g. "no45" -> "nomor 45"
    const noNoSpace = t.match(/^no\.?(\d+[a-z]?)$/i);
    if (noNoSpace) {
      normalizedTokens.push(`no. ${noNoSpace[1]}`);
      continue;
    }

    if (INDO_SLANG_DICTIONARY[t]) {
      normalizedTokens.push(INDO_SLANG_DICTIONARY[t]);
    } else {
      normalizedTokens.push(t);
    }
  }

  return normalizedTokens.join(' ').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Core AI Semantic Parser for Indonesian Addresses.
 */
export function parseIndonesianAddressSemantic(rawInput: string): ParsedAddressEntities {
  const raw = (rawInput || '').trim();
  const normalized = normalizeIndonesianText(raw);

  let workingText = normalized;
  let confidenceScore = 0.5;

  const extractedTokens: ParsedAddressEntities['extractedTokens'] = [];

  // A. Extract RT & RW
  let rt: string | undefined;
  let rw: string | undefined;
  let rtRwFormatted: string | undefined;

  const rtRwRegex = /\brt\s*(\d{1,4})\s*(?:\/|\s+dan\s+|\s+)?\s*(?:rw\s*(\d{1,4}))?\b/i;
  const rwOnlyRegex = /\brw\s*(\d{1,4})\b/i;

  const rtRwMatch = workingText.match(rtRwRegex);
  if (rtRwMatch) {
    rt = rtRwMatch[1]?.padStart(2, '0');
    if (rtRwMatch[2]) {
      rw = rtRwMatch[2]?.padStart(2, '0');
    }
    workingText = workingText.replace(rtRwMatch[0], ' ');
  }

  if (!rw) {
    const rwMatch = workingText.match(rwOnlyRegex);
    if (rwMatch) {
      rw = rwMatch[1]?.padStart(2, '0');
      workingText = workingText.replace(rwMatch[0], ' ');
    }
  }

  if (rt && rw) {
    rtRwFormatted = `RT ${rt} / RW ${rw}`;
    extractedTokens.push({ type: 'RTRW', token: `${rt}/${rw}`, normalized: rtRwFormatted });
    confidenceScore += 0.15;
  } else if (rt) {
    rtRwFormatted = `RT ${rt}`;
    extractedTokens.push({ type: 'RTRW', token: rt, normalized: rtRwFormatted });
    confidenceScore += 0.08;
  } else if (rw) {
    rtRwFormatted = `RW ${rw}`;
    extractedTokens.push({ type: 'RTRW', token: rw, normalized: rtRwFormatted });
    confidenceScore += 0.08;
  }

  // B. Extract House / Building Number
  let houseNumber: string | undefined;
  const houseRegex = /\b(?:nomor|no\.?|blok|kav\.?)\s*([a-z0-9\/-]+)\b/i;
  const houseMatch = workingText.match(houseRegex);
  if (houseMatch) {
    const prefix = houseMatch[0].toLowerCase().startsWith('blok') ? 'Blok' : (houseMatch[0].toLowerCase().startsWith('kav') ? 'Kav.' : 'No.');
    houseNumber = `${prefix} ${houseMatch[1].toUpperCase()}`;
    extractedTokens.push({ type: 'NUMBER', token: houseMatch[0], normalized: houseNumber });
    workingText = workingText.replace(houseMatch[0], ' ');
    confidenceScore += 0.15;
  }

  // C. Extract Postal Code
  let postalCode: string | undefined;
  const postalRegex = /\b(\d{5})\b/;
  const postalMatch = workingText.match(postalRegex);
  if (postalMatch) {
    postalCode = postalMatch[1];
    extractedTokens.push({ type: 'ADMIN', token: postalCode, normalized: postalCode });
    workingText = workingText.replace(postalMatch[0], ' ');
    confidenceScore += 0.1;
  }

  // D. Extract Primary Landmarks (e.g. jembatan, rel kereta, pasar, stasiun)
  let primaryLandmark: string | undefined;
  for (const plm of PRIMARY_LANDMARKS) {
    const regex = new RegExp(`\\b(${plm}[a-z0-9\\s]{0,25})\\b`, 'i');
    const match = workingText.match(regex);
    if (match) {
      primaryLandmark = match[1].trim();
      extractedTokens.push({ type: 'LANDMARK_PRIMARY', token: match[0], normalized: primaryLandmark });
      workingText = workingText.replace(match[0], ' ');
      confidenceScore += 0.1;
      break;
    }
  }

  // E. Extract Micro Landmarks / POI (e.g. sebelah warung madura, depan gapura)
  let microLandmark: string | undefined;
  for (const pfx of MICRO_LANDMARK_PREFIXES) {
    const regex = new RegExp(`\\b(${pfx}\\s+[a-z0-9\\s]{2,30}?)(?=[,;]|$|\\b(jalan|desa|kecamatan|kota|kabupaten)\\b)`, 'i');
    const match = workingText.match(regex);
    if (match) {
      microLandmark = match[1].trim();
      extractedTokens.push({ type: 'LANDMARK_MICRO', token: match[0], normalized: microLandmark });
      workingText = workingText.replace(match[0], ' ');
      confidenceScore += 0.1;
      break;
    }
  }

  // F. Extract Road / Street Name
  let roadName: string | undefined;
  const roadRegex = /\b(?:jalan\s+raya|jalan|gang|lorong|komplek|perumahan)\s+([a-z0-9\s.-]+?)(?=[,;]|$|\b(desa|kelurahan|kecamatan|kota|kabupaten)\b)/i;
  const roadMatch = workingText.match(roadRegex);
  if (roadMatch) {
    const fullRoad = roadMatch[0].trim();
    // Capitalize each word nicely
    roadName = fullRoad
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/^Jalan\b/, 'Jl.')
      .replace(/^Gang\b/, 'Gg.');
    extractedTokens.push({ type: 'ROAD', token: roadMatch[0], normalized: roadName });
    workingText = workingText.replace(roadMatch[0], ' ');
    confidenceScore += 0.2;
  }

  // G. Extract Administrative Divisions (Village, District, City, Province)
  let village: string | undefined;
  let district: string | undefined;
  let city: string | undefined;
  let province: string | undefined;

  const villageMatch = workingText.match(/\b(?:desa|kelurahan|dsn)\s+([a-z0-9\s]+?)(?=[,;]|$|\b(kecamatan|kota|kabupaten)\b)/i);
  if (villageMatch) {
    village = villageMatch[1].trim();
    village = village.charAt(0).toUpperCase() + village.slice(1);
    extractedTokens.push({ type: 'ADMIN', token: villageMatch[0], normalized: `Desa/Kel. ${village}` });
    workingText = workingText.replace(villageMatch[0], ' ');
    confidenceScore += 0.1;
  }

  const districtMatch = workingText.match(/\b(?:kecamatan|kec)\s+([a-z0-9\s]+?)(?=[,;]|$|\b(kota|kabupaten|provinsi)\b)/i);
  if (districtMatch) {
    district = districtMatch[1].trim();
    district = district.charAt(0).toUpperCase() + district.slice(1);
    extractedTokens.push({ type: 'ADMIN', token: districtMatch[0], normalized: `Kec. ${district}` });
    workingText = workingText.replace(districtMatch[0], ' ');
    confidenceScore += 0.1;
  }

  const regencyMatch = workingText.match(/\b(?:kabupaten|kab|kota)\s+([a-z0-9\s]+?)(?=[,;]|$|\b(provinsi|jawa|bali|sumatera|kalimantan|sulawesi)\b)/i);
  if (regencyMatch) {
    const rawType = regencyMatch[0].toLowerCase().startsWith('kota') ? 'Kota' : 'Kabupaten';
    city = `${rawType} ${regencyMatch[1].trim().charAt(0).toUpperCase() + regencyMatch[1].trim().slice(1)}`;
    extractedTokens.push({ type: 'ADMIN', token: regencyMatch[0], normalized: city });
    workingText = workingText.replace(regencyMatch[0], ' ');
    confidenceScore += 0.1;
  }

  // Clean residual text
  const cleanResidual = workingText.replace(/[,;]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (cleanResidual.length > 2 && !roadName && !microLandmark) {
    // If no road was explicitly matched with "jalan", residual at the beginning might be the road
    roadName = cleanResidual.charAt(0).toUpperCase() + cleanResidual.slice(1);
    if (!roadName.toLowerCase().startsWith('jl') && !roadName.toLowerCase().startsWith('gang')) {
      roadName = `Jl. ${roadName}`;
    }
  }

  // Assemble canonical Indonesian standard address
  const parts: string[] = [];
  let thoroughfare = roadName || '';
  if (houseNumber) {
    thoroughfare = thoroughfare ? `${thoroughfare} ${houseNumber}` : houseNumber;
  }
  if (rtRwFormatted) {
    thoroughfare = thoroughfare ? `${thoroughfare}, ${rtRwFormatted}` : rtRwFormatted;
  }
  if (thoroughfare) parts.push(thoroughfare);

  if (village) parts.push(`Desa/Kel. ${village}`);
  if (district) parts.push(`Kec. ${district}`);
  if (city) parts.push(city);
  if (province) parts.push(province);
  if (postalCode) parts.push(postalCode);

  let standardFormatted = parts.length > 0 ? parts.join(', ') : raw;

  const combinedLandmark = [primaryLandmark, microLandmark].filter(Boolean).join(' - ');
  if (combinedLandmark) {
    standardFormatted = `${standardFormatted} (Patokan: ${combinedLandmark})`;
  }

  return {
    raw,
    normalized,
    roadName,
    houseNumber,
    rt,
    rw,
    rtRwFormatted,
    primaryLandmark,
    microLandmark,
    village,
    district,
    city,
    province,
    postalCode,
    extractedTokens,
    confidenceScore: Math.min(1.0, parseFloat(confidenceScore.toFixed(2))),
    standardFormatted,
  };
}
