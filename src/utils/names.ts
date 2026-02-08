export const ADJECTIVES = [
    "Cosmic", "Neon", "Digital", "Silent", "Rapid", "Grand", "Future", "Hyper",
    "Solar", "Lunar", "Cyber", "Techno", "Stellar", "Astral", "Quantum", "Velvet",
    "Iron", "Golden", "Silver", "Electric", "Sonic", "Vivid", "Brave", "Calm"
];

export const NOUNS = [
    "Traveler", "Nomad", "Founder", "Builder", "Architect", "Pilot", "Surfer", "Ninja",
    "Wizard", "Maker", "Artist", "Coder", "Hacker", "Scout", "Ranger", "Voyager",
    "Pioneer", "Creator", "Solver", "Thinker", "Dreamer", "Legend", "Hero", "Star"
];

export function generatePseudonym(seed: string): string {
    // Simple hash function to get a number from a string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Ensure positive number
    const positiveHash = Math.abs(hash);

    const adjIndex = positiveHash % ADJECTIVES.length;
    const nounIndex = (positiveHash >> 3) % NOUNS.length;
    const suffix = (positiveHash % 999).toString().padStart(3, '0');

    return `${ADJECTIVES[adjIndex]}${NOUNS[nounIndex]}${suffix}`;
}
