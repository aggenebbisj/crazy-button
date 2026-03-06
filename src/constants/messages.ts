// === Random word pools ===

const DIEREN = [
  'eenhoorn', 'pinguïn', 'flamingo', 'octopus', 'luiaard',
  'capybara', 'axolotl', 'narwal', 'quokka', 'kameleon',
  'papegaai', 'zeehond', 'koala', 'wasbeer', 'alpaca',
  'hamster', 'stinkdier', 'kwal', 'otter', 'vleermuis',
];

const VOORWERPEN = [
  'pannenkoek', 'raket', 'banaan', 'paraplu', 'skateboard',
  'tuba', 'discoballen', 'lava-lamp', 'trampoline', 'sombrero',
  'boterham', 'rugzak', 'telescoop', 'sneeuwbal', 'ballon',
  'donut', 'piñata', 'vliegtuig', 'gieter', 'kaasblok',
];

const PLEKKEN = [
  'op het dak', 'in de koelkast', 'op de maan', 'in de wasmachine',
  'achter de bank', 'in een vulkaan', 'op een wolk', 'in de jungle',
  'onder water', 'op Mars', 'in een lift', 'op een regenboog',
  'in de magnetron', 'op een skatebaan', 'in een iglo', 'op een berg',
];

const ACTIES = [
  'danst de macarena', 'zingt opera', 'eet spaghetti', 'speelt gitaar',
  'doet een handstand', 'bouwt een fort', 'leert vliegen', 'bakt taarten',
  'breakdanced', 'jongleert', 'doet yoga', 'speelt verstoppertje',
  'maakt selfies', 'surft', 'racet', 'beatboxt',
  'doet alsof ie een robot is', 'springt op een trampoline',
];

const BIJVOEGLIJK = [
  'onzichtbare', 'dansende', 'vliegende', 'glitterende', 'exploderende',
  'gigantische', 'piepkleine', 'boze', 'slapende', 'zingende',
  'turbo', 'magische', 'radioactieve', 'knuffelige', 'verdachte',
  'geheime', 'neon', 'draaiende', 'brullende', 'misselijke',
];

const EMOJI_POOL = [
  '🦄', '🐧', '🦊', '🐙', '🐸', '🦁', '🐻', '🐨', '🦋', '🐝',
  '🍕', '🌮', '🍩', '🧁', '🍦', '🍌', '🥕', '🍫', '🎂', '🥞',
  '🚀', '🎸', '🎪', '🎠', '🌈', '💎', '🔮', '⚡', '🌊', '🔥',
  '👻', '🤖', '👽', '💀', '🤡', '🎭', '👑', '🧲', '🎯', '🎨',
  '💥', '✨', '🌟', '💫', '🫧', '🎆', '🎇', '💖', '🦴', '🧊',
  '🛸', '🏝️', '🌋', '🎩', '🪄', '🧸', '🎪', '🎵', '🎺', '🥁',
];

const GELUIDEN = [
  'BOEM', 'KABLAM', 'WHOOSH', 'SPLASH', 'BOING',
  'KABLAMMO', 'PRRRRT', 'ZOOOM', 'PLOP', 'KRAKK',
  'WAPPERDEFLAP', 'SWOOSH', 'PLING', 'BONK', 'FLOEP',
  'RATATATAT', 'TJINGELING', 'KADOINK', 'PATS', 'WHAM',
];

const GELUID_EMOJI = [
  '💥', '🌊', '💨', '🏀', '🎆', '🔔', '🚀', '🫧', '⚡', '🌪️',
  '💣', '🎵', '🔊', '🎺', '🥁', '🎸', '📯', '🎉', '🧨', '💫',
];

// === Random helpers ===

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// === Generators ===

function generateFunnyText(): string {
  const templates = [
    () => `Mijn ${pick(BIJVOEGLIJK)} ${pick(DIEREN)} ${pick(ACTIES)} ${pick(PLEKKEN)}`,
    () => `Er zit een ${pick(BIJVOEGLIJK)} ${pick(VOORWERPEN)} ${pick(PLEKKEN)}`,
    () => `HELP! Mijn ${pick(VOORWERPEN)} ${pick(ACTIES)}!`,
    () => `Ik heb per ongeluk een ${pick(BIJVOEGLIJK)} ${pick(DIEREN)} besteld`,
    () => `Wist je dat een ${pick(DIEREN)} kan ${pick(ACTIES).replace('doet ', '').replace('speelt ', '').replace('bakt ', 'bakken').replace('leert ', 'leren').replace('maakt ', 'maken')}?`,
    () => `De ${pick(DIEREN)} en de ${pick(DIEREN)} ${pick(ACTIES).replace('doet', 'doen').replace('speelt', 'spelen')} ${pick(PLEKKEN)}`,
    () => `Ik zoek mijn ${pick(BIJVOEGLIJK)} ${pick(VOORWERPEN)}. Heeft iemand die gezien?`,
    () => `Breaking news: ${pick(BIJVOEGLIJK)} ${pick(DIEREN)} gevonden ${pick(PLEKKEN)} met een ${pick(VOORWERPEN)}`,
    () => `Als je een ${pick(DIEREN)} was, zou je ook ${pick(ACTIES).replace('doet ', '').replace('speelt ', '')} ${pick(PLEKKEN)}`,
    () => `Mijn ${pick(VOORWERPEN)} is verliefd op een ${pick(VOORWERPEN)}`,
    () => `Vandaag leerde ik dat ${pick(DIEREN)}en ${pick(BIJVOEGLIJK)}e ${pick(VOORWERPEN)}en eten`,
    () => `Waarschuwing: ${pick(BIJVOEGLIJK)} ${pick(VOORWERPEN)} gespot ${pick(PLEKKEN)}!`,
  ];
  return pick(templates)();
}

function generateEmojiCombo(): string {
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 emojis
  return pickN(EMOJI_POOL, count).join('');
}

function generateSound(): string {
  const sound = pick(GELUIDEN);
  const emoji = pick(GELUID_EMOJI);
  const repeats = Math.random() > 0.5 ? '!!' : '!';
  const extra = Math.random() > 0.6 ? ' ' + pick(GELUID_EMOJI) : '';
  return `${sound}${repeats} ${emoji}${extra}`;
}

function generateSticker(): string {
  if (Math.random() > 0.5) {
    // Single big emoji
    return pick(EMOJI_POOL);
  }
  // Emoji combo sticker (2-3)
  return pickN(EMOJI_POOL, 2 + Math.floor(Math.random() * 2)).join('');
}

// === GIF fetcher ===

async function fetchGifUrl(): Promise<string | null> {
  try {
    const res = await fetch('https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=1');
    const data = await res.json();
    if (data?.[0]?.url) return data[0].url;
  } catch { /* ignore */ }
  return null;
}

// === Public API ===

import { generateAIMessage } from '../lib/ai-messages';

export interface RandomMessage {
  type: 'text' | 'emoji' | 'sound' | 'sticker' | 'gif';
  content: string;
}

export async function getRandomMessageAsync(): Promise<RandomMessage> {
  const roll = Math.random();

  if (roll < 0.40) {
    // 40% kans: AI-gegenereerd bericht (met fallback naar proceduraal)
    const aiMessage = await generateAIMessage();
    if (aiMessage) return { type: 'text', content: aiMessage };
    return { type: 'text', content: generateFunnyText() };
  } else if (roll < 0.55) {
    return { type: 'emoji', content: generateEmojiCombo() };
  } else if (roll < 0.65) {
    return { type: 'sound', content: generateSound() };
  } else if (roll < 0.85) {
    return { type: 'sticker', content: generateSticker() };
  } else {
    const url = await fetchGifUrl();
    if (url) return { type: 'gif', content: url };
    return { type: 'sticker', content: generateSticker() };
  }
}

// Sync version (no gif, for tests)
export function getRandomMessage(): RandomMessage {
  const roll = Math.random();
  if (roll < 0.3) return { type: 'text', content: generateFunnyText() };
  if (roll < 0.5) return { type: 'emoji', content: generateEmojiCombo() };
  if (roll < 0.7) return { type: 'sound', content: generateSound() };
  return { type: 'sticker', content: generateSticker() };
}

// Exports for tests
export const _testing = { DIEREN, VOORWERPEN, PLEKKEN, ACTIES, BIJVOEGLIJK, EMOJI_POOL, GELUIDEN };
