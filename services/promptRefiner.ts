import { PromptRefinerMode } from '../types';

export const REFINER_DIRECTIVES: Record<PromptRefinerMode, string> = {
  concise: `[SMART PROMPT REFINER: CONCISE MODE]
- Keep all responses short, direct, crisp, and to the point.
- Avoid unnecessary introductory filler or repetitive small talk.
- Answer in 2 to 4 concise sentences or punchy bullet points unless asked for more.
- Retain soft, polite feminine warmth ("karti hoon", "bataungi") while maximizing brevity and directness.`,

  detailed: `[SMART PROMPT REFINER: DETAILED MODE]
- Provide comprehensive, in-depth, and well-elaborated responses with rich background context.
- Structure explanations with clear logical sections, practical examples, and step-by-step guidance.
- Explore nuances and anticipate helpful follow-ups while maintaining soft, natural feminine warmth ("karti hoon", "samajhti hoon").`
};

export const REFINER_BLOCK_HEADER = '[SMART PROMPT REFINER:';

/**
 * Returns the exact refiner directive string for a given mode.
 */
export function getRefinerDirective(mode: PromptRefinerMode): string {
  return REFINER_DIRECTIVES[mode];
}

/**
 * Detects whether a system prompt string contains an active refiner directive
 * and returns the mode ('concise' | 'detailed' | null).
 */
export function detectPromptRefinerMode(promptText: string): PromptRefinerMode | null {
  if (!promptText) return null;
  if (/\[SMART PROMPT REFINER:\s*DETAILED\s*MODE\]/i.test(promptText)) {
    return 'detailed';
  }
  if (/\[SMART PROMPT REFINER:\s*CONCISE\s*MODE\]/i.test(promptText)) {
    return 'concise';
  }
  return null;
}

/**
 * Removes any existing refiner block from a systemPrompt string.
 */
export function removePromptRefiner(promptText: string): string {
  if (!promptText) return '';
  return promptText
    .replace(/\n*\[SMART PROMPT REFINER:[\s\S]*?(?=\n\n(?:[A-Z0-9_ -]+:|\bThe user's name\b)|$)/gi, '')
    .trim();
}

/**
 * Dynamically modifies a systemPrompt string by updating or appending
 * the Smart Prompt Refiner instruction for the specified mode.
 */
export function applyPromptRefiner(promptText: string, mode: PromptRefinerMode): string {
  const directive = getRefinerDirective(mode);
  const cleanPrompt = removePromptRefiner(promptText);
  if (!cleanPrompt) {
    return directive;
  }
  return `${cleanPrompt}\n\n${directive}`;
}
