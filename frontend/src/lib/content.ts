export function extractReasoning(text: string) {
  const match = text.match(/<think>\s*([\s\S]*?)\s*<\/think>/)

  if (match && match[1]) {
    const content = text.substring(match[0].length).trim()
    return { reasoning: match[1], content }
  }

  return {
    reasoning: null,
    content: text,
  }
}
