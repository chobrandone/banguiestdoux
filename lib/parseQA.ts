/**
 * Parses raw text (e.g. extracted from a .docx interview transcript) into
 * question/answer pairs. Supports common formats:
 *   "Q: ..." / "A: ..."
 *   "Question: ..." / "Réponse: ..." / "Answer: ..."
 *   "1. ..." numbered questions followed by an answer line
 * Falls back to treating alternating non-empty lines as Q/A pairs.
 */
export function parseQAFromText(raw: string): { question: string; answer: string }[] {
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const qRe = /^(?:q(?:uestion)?\s*\d*\s*[:.)-]\s*)/i;
  const aRe = /^(?:a(?:nswer)?|r(?:é|e)ponse)\s*\d*\s*[:.)-]\s*/i;

  const pairs: { question: string; answer: string }[] = [];
  let pendingQuestion: string | null = null;

  for (const line of lines) {
    if (qRe.test(line)) {
      if (pendingQuestion) pairs.push({ question: pendingQuestion, answer: '' });
      pendingQuestion = line.replace(qRe, '').trim();
    } else if (aRe.test(line)) {
      const answer = line.replace(aRe, '').trim();
      if (pendingQuestion) {
        pairs.push({ question: pendingQuestion, answer });
        pendingQuestion = null;
      }
    } else if (pendingQuestion) {
      // continuation line — append to the most recent open question/answer
      pendingQuestion += ' ' + line;
    }
  }
  if (pendingQuestion) pairs.push({ question: pendingQuestion, answer: '' });

  if (pairs.length > 0) return pairs;

  // Fallback: alternate non-empty lines as Q/A
  const fallback: { question: string; answer: string }[] = [];
  for (let i = 0; i < lines.length - 1; i += 2) {
    fallback.push({ question: lines[i], answer: lines[i + 1] });
  }
  return fallback;
}
