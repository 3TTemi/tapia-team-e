/** Keep existing saved conversations compatible with the voice cast names. */
export function currentCharacterNames(text: string): string {
  return text
    .replace(/\bMilo\b/g, "Alex")
    .replace(/\bBoone\b/g, "Jordan")
    .replace(/\bEllis\b/g, "Sam");
}
