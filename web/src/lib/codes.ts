import { customAlphabet } from "nanoid";

// No 0/O/1/I — avoids characters that are easy to mistype or confuse when a
// human reads a login code out loud or copies it by hand.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomPart = customAlphabet(ALPHABET, 8);

/** Corporation login code, e.g. "ACME-7F3K9Q2H". Falls back to "CORP" when the
 * name has no usable Latin/digit characters (e.g. a fully Cyrillic name). */
export function generateCompanyCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  return `${prefix || "CORP"}-${randomPart()}`;
}
