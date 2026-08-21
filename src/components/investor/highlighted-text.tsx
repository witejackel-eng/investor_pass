"use client";

/**
 * Highlights matched search tokens in a text string by wrapping them in <mark>.
 * Tokens are case-insensitive, whole-word-partial matches.
 */
export function HighlightedText({
  text,
  tokens,
}: {
  text: string;
  tokens: string[];
}) {
  if (!tokens.length || !text) return <>{text}</>;

  // Build a single regex from all tokens (escaped, case-insensitive)
  const escaped = tokens
    .filter((t) => t.length > 1)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) return <>{text}</>;

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = escaped.some((t) => new RegExp(`^${t}$`, "i").test(part));
        return isMatch ? (
          <mark key={i} className="bg-signal/20 text-ink px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
