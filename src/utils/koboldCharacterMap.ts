import { KoboldCharacter } from "../types";

export const KOBOLD_CHARACTER_TABLE: KoboldCharacter[] = [
  // 1-Symbol Glyphs
  { english: "A", code: ".", category: "letter" },
  { english: "I", code: "-", category: "letter" },
  { english: "U", code: ":", category: "letter" },

  // 2-Symbol Glyphs
  { english: "E", code: "..", category: "letter" },
  { english: "O", code: ".-", category: "letter" },
  { english: "K", code: ".:", category: "letter" },
  { english: "R", code: "-.", category: "letter" },
  { english: "S", code: "--", category: "letter" },
  { english: "T", code: "-:", category: "letter" },
  { english: "N", code: ":.", category: "letter" },
  { english: "L", code: ":-", category: "letter" },
  { english: "M", code: "::", category: "letter" },

  // 3-Symbol Letters
  { english: "B", code: "...", category: "letter" },
  { english: "C", code: "..-", category: "letter" },
  { english: "D", code: "..:", category: "letter" },
  { english: "F", code: ".-.", category: "letter" },
  { english: "G", code: ".--", category: "letter" },
  { english: "H", code: ".-:", category: "letter" },
  { english: "J", code: ".:.", category: "letter" },
  { english: "P", code: ".:-", category: "letter" },
  { english: "Q", code: ".::", category: "letter" },
  { english: "V", code: "-..", category: "letter" },
  { english: "W", code: "-.-", category: "letter" },
  { english: "X", code: "-.:", category: "letter" },
  { english: "Y", code: "--.", category: "letter" },
  { english: "Z", code: "---", category: "letter" },

  // Numbers
  { english: "0", code: "--:", category: "number" },
  { english: "1", code: "-:.", category: "number" },
  { english: "2", code: "-:-", category: "number" },
  { english: "3", code: "-::", category: "number" },
  { english: "4", code: ":..", category: "number" },
  { english: "5", code: ":.-", category: "number" },
  { english: "6", code: ":.:", category: "number" },
  { english: "7", code: ":-.", category: "number" },
  { english: "8", code: ":--", category: "number" },
  { english: "9", code: ":-:", category: "number" },

  // Special Phonemes
  { english: "CH", code: "::.", category: "phoneme", label: "Phoneme CH" },
  { english: "SH", code: "::-", category: "phoneme", label: "Phoneme SH" },
  { english: "NG", code: ":::", category: "phoneme", label: "Phoneme NG" },

  // 4-Symbol Punctuation
  { english: ".", code: "....", category: "punctuation", label: "Period" },
  { english: ",", code: "...-", category: "punctuation", label: "Comma" },
  { english: "?", code: "...:", category: "punctuation", label: "Question Mark" },
  { english: "!", code: "..-.", category: "punctuation", label: "Exclamation Mark" },
  { english: "'", code: "..--", category: "punctuation", label: "Apostrophe" },
  { english: '"', code: "..-:", category: "punctuation", label: "Quotation Mark" },
  { english: ":", code: "..:.", category: "punctuation", label: "Colon" },
  { english: ";", code: "..:-", category: "punctuation", label: "Semicolon" },
  { english: "-", code: "..::", category: "punctuation", label: "Hyphen" },
  { english: "(", code: ".-..", category: "punctuation", label: "Left Parenthesis" },
  { english: ")", code: ".-.-", category: "punctuation", label: "Right Parenthesis" },
  { english: "/", code: ".-.:", category: "punctuation", label: "Slash" },
];

// Forward Map: English char -> Kobold code
export const ENGLISH_TO_KOBOLD_MAP: Map<string, string> = new Map(
  KOBOLD_CHARACTER_TABLE.map((item) => [item.english, item.code])
);

// Reverse Map: Kobold code -> English char
export const KOBOLD_TO_ENGLISH_MAP: Map<string, string> = new Map(
  KOBOLD_CHARACTER_TABLE.map((item) => [item.code, item.english])
);

export const PUNCTUATION_CHARACTERS: Set<string> = new Set([
  ...KOBOLD_CHARACTER_TABLE.filter((item) => item.category === "punctuation").map((item) => item.english),
  ".", ",", "?", "!", "'", '"', ":", ";", "-", "(", ")", "/"
]);

export const KOBOLD_PUNCTUATION_CODES: Set<string> = new Set(
  KOBOLD_CHARACTER_TABLE.filter((item) => item.category === "punctuation").map((item) => item.code)
);

