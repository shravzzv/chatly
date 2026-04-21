import { generateText } from 'ai'

/**
 * Enhances a chat message using AI while enforcing usage limits.
 *
 * This is a **paid feature boundary**:
 * - AI usage is incremented before generation
 * - Limits are enforced server-side
 * - Errors are thrown and must be handled by the caller
 *
 * The enhancement is conservative:
 * - Preserves meaning, intent, and tone
 * - Makes minimal changes
 * - May return the original text if no improvement is needed
 *
 * @param text - Original message text
 * @returns Enhanced (or unchanged) message text
 *
 * @throws Error if:
 * - AI service fails (`AI_SERVICE_ERROR`)
 */
export async function enhanceText(text: string): Promise<string> {
  if (!text || !text.trim()) return text

  const systemPrompt = `
    You improve chat messages.

    Rules:
    - Preserve the original meaning, intent, and tone.
    - Do NOT add new information, emotion, or politeness.
    - Keep the message natural for casual chat.
    - Make minimal changes unless the message is clearly unclear.
    - Do not over-formalize.
    - If the message is already good, return it unchanged.
    - Return ONLY the improved message, with no quotes or explanations.
  `.trim()

  try {
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: text,
    })

    return result.text.trim()
  } catch (error) {
    throw Error('AI_SERVICE_ERROR', { cause: error })
  }
}
