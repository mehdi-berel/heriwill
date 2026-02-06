import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.heriwill.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/signup', '/upgrade'],
        disallow: [
          '/api/',
          '/vaults/',
          '/heirs/',
          '/settings/',
          '/assets/',
          '/Legal/',
          '/notary/',
          '/inheritance/',
          '/will/',
          '/help/',
          '/sign-off/',
          '/invite/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
