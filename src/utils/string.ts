/**
 * Converts a snake_case or constant-case string to Title Case.
 * Example: "generate_financial_os" -> "Generate Financial Os"
 */
export function snakeToTitle(str: string): string {
    return str
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}
