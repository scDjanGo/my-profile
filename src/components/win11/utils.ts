/** Touch users get single-tap-to-open; mouse users select first and double-click */
export function isTouch(e: React.MouseEvent) {
  return (e.nativeEvent as PointerEvent).pointerType === "touch";
}

/** Accepts "site.kg", "https://site.kg" or a search phrase */
export function toUrl(input: string) {
  const text = input.trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(text)) return `https://${text}`;
  return `https://www.google.com/search?igu=1&q=${encodeURIComponent(text)}`;
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
