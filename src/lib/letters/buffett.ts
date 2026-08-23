/** Berkshire shareholder letters — canonical index (facts only; see header). */
export const BUFFETT_LETTER_YEARS: number[] = Array.from({ length: 2024 - 1977 + 1 }, (_, i) => 1977 + i);

export function officialLetterUrl(year: number): string {
  return `https://www.berkshirehathaway.com/letters/${year}ltr.pdf`;
}

export const LETTERS_NOTE =
  "1977 is the first letter in Berkshire's official online archive; Buffett became controlling shareholder in 1965, but 1965–1976 letters are not published on berkshirehathaway.com. Every listed letter links to the official PDF — full letter text remains Berkshire's copyright; exports below contain Investor/Pass's own indexed research.";
