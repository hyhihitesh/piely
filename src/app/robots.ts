import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://piely.app";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/auth", "/about", "/pricing", "/terms", "/privacy"],
                disallow: [
                    "/api/",
                    "/dashboard/",
                    "/project/",
                    "/onboarding/",
                    "/_next/",
                    "/admin/",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
