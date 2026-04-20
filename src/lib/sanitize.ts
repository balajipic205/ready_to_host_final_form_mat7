import DOMPurify from "dompurify";

export function clean(input: string | undefined | null): string {
  if (!input) return "";
  return DOMPurify.sanitize(String(input), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
