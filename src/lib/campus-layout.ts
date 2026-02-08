export const CAMPUS_LAYOUT = {
    HQ: {
        id: "zone-hq",
        x: 0,
        y: 0,
        label: "Headquarters",
        description: "Mission, Vision, Team",
        color: "bg-blue-500/10"
    },
    MARKET: {
        id: "zone-market",
        x: 0,
        y: -900, // Moved up
        label: "Market Intelligence",
        description: "Competitors, Trends, Personas",
        color: "bg-purple-500/10"
    },
    PRODUCT: {
        id: "zone-product",
        x: 1400, // Moved right significantly
        y: 0,
        label: "Product Engine",
        description: "Roadmap, Specs, Tech Stack",
        color: "bg-orange-500/10"
    },
    GTM: {
        id: "zone-gtm",
        x: 2800, // Moved further right (Product -> GTM flow)
        y: 0,
        label: "GTM Command",
        description: "Pitch, Sales, Marketing",
        color: "bg-green-500/10"
    },
} as const;

export type CampusZone = keyof typeof CAMPUS_LAYOUT;
