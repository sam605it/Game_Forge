export class JsonParseError extends Error {
  rawSnippet: string;

  constructor(message: string, rawSnippet: string) {
    super(message);
    this.name = "JsonParseError";
    this.rawSnippet = rawSnippet;
  }
}

export const parseStrictJSONObject = (text: string): unknown => {
  const trimmed = text.trim();
  const cleaned = trimmed.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    const snippet = cleaned.slice(0, 200);
    throw new JsonParseError("No JSON object found in response.", snippet);
  }
  const extracted = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(extracted);
  } catch (error) {
    const snippet = extracted.slice(0, 400);
    const message = error instanceof Error ? error.message : "Unknown JSON parse error.";
    throw new JsonParseError(message, snippet);
  }
};
