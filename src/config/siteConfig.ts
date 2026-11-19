/**
 * Site & Social Sharing Configuration for The Dharma Watch.
 * Controls the metadata and preview card displayed when https://thedharmawatch.in/
 * is shared across Telegram, WhatsApp, Facebook, X (Twitter), and LinkedIn.
 */
export const SITE_CONFIG = {
  name: 'The Dharma Watch',
  legalName: 'The Dharma Watch',
  domain: process.env.PUBLIC_DOMAIN || 'https://thedharmawatch.in',
  siteUrl: process.env.SITE_URL || 'https://thedharmawatch.in',

  // Social Share & Open Graph Card Metadata
  social: {
    title: 'The Dharma Watch | Journalism of Courage · The National Journal of Record',
    description: 'An independent national broadsheet news publication and investigative journal of record. Dedicated to fearless reporting, constitutional accountability, and primary evidence verification.',
    // Path to the rectangular 1200x630 social preview card
    ogImage: '/dharmawatch-social-preview.png',
    ogImageAlt: 'The Dharma Watch | Journalism of Courage · The National Journal of Record',
    ogImageType: 'image/png',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    // Increment this version whenever you update the preview card to instantly bust Telegram, WhatsApp, and Facebook link preview caches
    version: '2.2',
    twitterCard: 'summary_large_image',
    twitterHandle: '@thedharmawatch',
  },
};
