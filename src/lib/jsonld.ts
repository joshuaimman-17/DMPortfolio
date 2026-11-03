export function getPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Alex Rivera',
    jobTitle: 'Senior Growth & Performance Marketer',
    url: 'https://alexriveragrowth.com',
    sameAs: [
      'https://linkedin.com',
      'https://x.com',
      'https://github.com',
    ],
    knowsAbout: [
      'Search Engine Optimization',
      'Conversion Rate Optimization',
      'Performance Marketing',
      'Meta Ads',
      'Google Ads',
      'Server-Side Tracking',
    ],
  };
}

export function getServiceJsonLd(service: { title: string; summary: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: {
      '@type': 'Person',
      name: 'Alex Rivera',
    },
    url: `https://alexriveragrowth.com/services/${service.slug}`,
  };
}

export function getArticleJsonLd(article: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  coverImage?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: {
      '@type': 'Person',
      name: 'Alex Rivera',
    },
    url: `https://alexriveragrowth.com/blog/${article.slug}`,
    image: article.coverImage,
  };
}
