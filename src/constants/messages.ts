export const FUNNY_TEXTS = [
  'Ik heb net een eenhoorn gezien op de fiets 🦄🚲',
  'Mijn kat heeft mijn huiswerk opgegeten... ik heb geen kat 🐱',
  'ALARM! Er zit een banaan in mijn oor! 🍌👂',
  'Ik ben vergeten hoe je knippert 👀',
  'Er staat een pinguïn voor de deur. Wat moet ik doen? 🐧',
  'Help! Mijn schoenen zijn te blij! 👟😊',
  'De koelkast praat weer tegen me 🗣️❄️',
  'Ik heb per ongeluk de maan gebeld 🌙📞',
  'Mijn brood is op vakantie 🍞🏖️',
  'SOS! De soep is ontsnapt! 🍜🏃',
  'Waarom is de lucht niet groen? 🤔💚',
  'Mijn sokken zijn het niet eens met elkaar 🧦😤',
  'Er zit een wolk in mijn rugzak ☁️🎒',
  'De tafel heeft weer hoofdpijn 🤕',
  'Ik heb het internet kapot gemaakt 💻💥',
  'Hoeveel pannenkoeken passen in een vliegtuig? 🥞✈️',
  'Mijn haar heeft vakantie nodig 💇',
  'De deur wil niet meer meedoen 🚪😤',
  'Ik spreek vloeiend wafel 🧇',
  'Er zit een regenboog in mijn zak 🌈👖',
];

export const EMOJI_COMBOS = [
  '🐔💨🌈',
  '🦊🎸🔥',
  '🐙🎩✨',
  '🦀💃🌮',
  '🐸🎺🌙',
  '🦄🍕🚀',
  '🐧❄️🎪',
  '🦊🧁🎭',
  '🐻🎨🌪️',
  '🐝🎹🌸',
  '🦁👑🎯',
  '🐨🍩🎠',
  '🦋🎪🌊',
  '🐢🏎️💨',
  '🦊🧲⚡',
];

export const SOUND_MESSAGES = [
  'BOEM! 💥',
  'TOET TOET! 📯',
  'SPLASHHH! 🌊',
  'WHOOOOSH! 💨',
  'BOING BOING! 🏀',
  'KABLAMMO! 🎆',
  'PRRRRT! 💨',
  'KLING KLANG! 🔔',
  'ZOOOOOM! 🚀',
  'PLOP! 🫧',
];

export const STICKERS = [
  '🦄', '👻', '🤡', '🐸', '🦊',
  '🐙', '🦀', '🐧', '🦋', '🐝',
  '🍕', '🌮', '🍩', '🧁', '🍦',
  '🚀', '🎸', '🎪', '🎠', '🌈',
];

export const BIG_STICKERS = [
  '🐱😴💤',
  '🐶❤️🦴',
  '🐧🎶💃',
  '🦊🌟✨',
  '🐸☕😌',
  '🐹🎉🥳',
  '🦁👑💪',
  '🐰🥕😋',
  '🐻🍯🤤',
  '🦄🌈💖',
];

export interface RandomMessage {
  type: 'text' | 'emoji' | 'sound' | 'sticker' | 'gif';
  content: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchGifUrl(): Promise<string | null> {
  try {
    const res = await fetch('https://api.thecatapi.com/v1/images/search?mime_types=gif&limit=1');
    const data = await res.json();
    if (data?.[0]?.url) return data[0].url;
  } catch { /* ignore */ }

  return null;
}

export async function getRandomMessageAsync(): Promise<RandomMessage> {
  const roll = Math.random();

  if (roll < 0.25) {
    return { type: 'text', content: pickRandom(FUNNY_TEXTS) };
  } else if (roll < 0.40) {
    return { type: 'emoji', content: pickRandom(EMOJI_COMBOS) };
  } else if (roll < 0.55) {
    return { type: 'sound', content: pickRandom(SOUND_MESSAGES) };
  } else if (roll < 0.70) {
    return { type: 'sticker', content: pickRandom(STICKERS) };
  } else if (roll < 0.80) {
    return { type: 'sticker', content: pickRandom(BIG_STICKERS) };
  } else {
    // GIF - fetch a real one
    const url = await fetchGifUrl();
    if (url) return { type: 'gif', content: url };
    // Fallback to sticker
    return { type: 'sticker', content: pickRandom(BIG_STICKERS) };
  }
}

// Sync version for tests (no gif)
export function getRandomMessage(): RandomMessage {
  const roll = Math.random();
  if (roll < 0.3) return { type: 'text', content: pickRandom(FUNNY_TEXTS) };
  if (roll < 0.5) return { type: 'emoji', content: pickRandom(EMOJI_COMBOS) };
  if (roll < 0.7) return { type: 'sound', content: pickRandom(SOUND_MESSAGES) };
  if (roll < 0.85) return { type: 'sticker', content: pickRandom(STICKERS) };
  return { type: 'sticker', content: pickRandom(BIG_STICKERS) };
}
