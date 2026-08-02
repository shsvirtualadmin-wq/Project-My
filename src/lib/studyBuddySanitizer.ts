/**
 * Decodes literal unicode escapes like \u0627 or \u001f into actual UTF-8 characters.
 */
export function decodeUnicodeEscapes(str: string): string {
  if (!str || typeof str !== 'string') return '';
  // Check if string contains literal \uXXXX sequences
  if (/\\u[0-9a-fA-F]{4}/.test(str)) {
    try {
      return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        const codePoint = parseInt(hex, 16);
        // Avoid replacing control characters like \u000a (\n) or \u0009 (\t) incorrectly if needed
        if (codePoint < 32 && codePoint !== 10 && codePoint !== 13 && codePoint !== 9) {
          return '';
        }
        return String.fromCharCode(codePoint);
      });
    } catch {
      return str;
    }
  }
  return str;
}

/**
 * Sanitizes and extracts clean readable text from AI model responses,
 * stripping away raw JSON wrappers, SSE artifacts, raw code blocks, and unparsed Unicode.
 */
export function sanitizeStudyBuddyText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText.trim();

  // 1. Decode literal \uXXXX unicode escapes
  text = decodeUnicodeEscapes(text);

  // 2. Remove raw JSON block wrappers like ```json { "explanation": "..." } ```
  const jsonCodeBlockMatch = text.match(/^```(?:json|markdown|text)?\s*([\s\S]*?)\s*```$/i);
  if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
    const inner = jsonCodeBlockMatch[1].trim();
    if (inner.startsWith('{') && inner.endsWith('}')) {
      try {
        const parsed = JSON.parse(inner);
        if (parsed.explanation && typeof parsed.explanation === 'string') {
          text = parsed.explanation;
        } else if (parsed.text && typeof parsed.text === 'string') {
          text = parsed.text;
        } else if (parsed.response && typeof parsed.response === 'string') {
          text = parsed.response;
        } else if (parsed.answer && typeof parsed.answer === 'string') {
          text = parsed.answer;
        } else {
          text = inner;
        }
      } catch {
        text = inner;
      }
    } else {
      text = inner;
    }
  }

  // 3. If raw text starts with { and ends with } (unwrapped JSON object)
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.explanation && typeof parsed.explanation === 'string') {
        text = parsed.explanation;
      } else if (parsed.text && typeof parsed.text === 'string') {
        text = parsed.text;
      } else if (parsed.response && typeof parsed.response === 'string') {
        text = parsed.response;
      } else if (parsed.answer && typeof parsed.answer === 'string') {
        text = parsed.answer;
      }
    } catch {}
  }

  // 4. Strip stray SSE prefix/suffix artifacts if leaked
  text = text.replace(/^data:\s*/gm, '');
  text = text.replace(/\[DONE\]$/g, '').trim();

  // 5. Clean up duplicate literal \n escaping if left behind
  if (text.includes('\\n') && !text.includes('\n')) {
    text = text.replace(/\\n/g, '\n');
  }

  // 6. Normalize LaTeX block delimiters \[ ... \] to $$ ... $$ and \( ... \) to $ ... $
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '\n\n$$$$\n$1\n$$$$\n\n');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  return text.trim();
}

/**
 * Safety check to detect if text is unparsed JSON, garbled control chars, or broken artifacts.
 */
export function isGarbledResponse(text: string): boolean {
  if (!text) return false;

  const cleaned = sanitizeStudyBuddyText(text);

  // Check 1: Looks like unparsed raw JSON object/array
  if (/^\s*[\{\[]\s*"(candidates|contents|parts|error|status|statusCode|response|explanation)"/i.test(cleaned)) {
    return true;
  }

  // Check 2: Contains literal unparsed unicode escape chains like \u0627\u0644\u0633
  if (/(\\u[0-9a-fA-F]{4}){3,}/.test(text)) {
    return true;
  }

  // Check 3: High ratio of raw escape backslashes or broken tokens
  const backslashMatches = text.match(/\\/g) || [];
  if (text.length > 30 && backslashMatches.length / text.length > 0.3) {
    return true;
  }

  return false;
}
