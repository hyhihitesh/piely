import { UIMessage } from "ai";

/**
 * Extracts all text content from an AI SDK UI message's parts.
 */
export function getTextFromMessageParts(message: UIMessage): string {
    if (!message.parts) return "";

    return message.parts
        .filter((part): part is { type: "text"; text: string } => part.type === "text")
        .map(part => part.text)
        .join("");
}
