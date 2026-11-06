/**
 * Font size for a condensed chapter title (text-chapter) that fills its column
 * without breaking a word: Big Shoulders sets about 0.45 em per letter. Words
 * break after a hyphen. The parent must be a size container, for the cqi unit.
 */
export function fitTitle(title: string, oneLine = false) {
  const longest = oneLine ? title.length : Math.max(...title.split(/\s|(?<=-)/).map((w) => w.length));
  return { fontSize: `min(clamp(4rem, 2rem + 8vw, 9rem), ${(100 / (longest * 0.45)).toFixed(1)}cqi)` };
}
