import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mapping from Microsoft Speech API phoneme codes to IPA symbols
const phonemeToIPA: Record<string, string> = {
  // Vowels
  aa: "ɑ", // father
  ae: "æ", // cat
  ah: "ʌ", // but
  ao: "ɔ", // law
  aw: "aʊ", // how
  ax: "ə", // about
  ay: "aɪ", // my
  eh: "ɛ", // red
  er: "ɝ", // bird
  ey: "eɪ", // day
  ih: "ɪ", // bit
  iy: "i", // beat
  ow: "oʊ", // go
  oy: "ɔɪ", // boy
  uh: "ʊ", // book
  uw: "u", // boot

  // Consonants
  b: "b", // bee
  ch: "tʃ", // cheese
  d: "d", // dog
  dh: "ð", // then
  f: "f", // fee
  g: "g", // go
  h: "h", // he
  jh: "dʒ", // jump
  k: "k", // key
  l: "l", // love
  m: "m", // man
  n: "n", // no
  ng: "ŋ", // sing
  p: "p", // pen
  r: "r", // red
  s: "s", // see
  sh: "ʃ", // she
  t: "t", // tea
  th: "θ", // think
  v: "v", // vine
  w: "w", // we
  y: "j", // yes
  z: "z", // zoo
  zh: "ʒ", // pleasure

  // Additional common phonemes
  dx: "ɾ", // butter (tap)
  nx: "ɾ̃", // button (nasal tap)
  q: "ʔ", // glottal stop
};

/**
 * Convert Microsoft Speech API phoneme codes to IPA symbols
 * @param phoneme - The phoneme code from Microsoft Speech API
 * @returns The corresponding IPA symbol or the original phoneme if not found
 */
export function convertPhonemeToIPA(phoneme: string): string {
  const normalizedPhoneme = phoneme.toLowerCase().trim();
  return phonemeToIPA[normalizedPhoneme] || phoneme; // Return original if not found
}
