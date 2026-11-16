import { Article } from '../types';
import { AUTHORS } from './authors';

export const ARTICLES: Article[] = [
  {
    id: 'sample-welcome-article',
    title: 'Welcome to Your Newsroom: Platform Configuration and Editorial Workflow Guide',
    slug: 'welcome-to-your-newsroom-editorial-workflow-guide',
    deck: 'A quick-start introductory template demonstrating broadsheet article authoring, evidentiary citations, and case file integration.',
    category: 'National',
    categorySlug: 'national',
    subcategory: 'Newsroom Operations',
    author: AUTHORS['dharma-watch-staff'] || {
      id: 'dharma-watch-staff',
      name: 'Newsroom Staff',
      slug: 'newsroom-staff',
      role: 'Editorial Desk',
      bio: 'Institutional editorial and investigative reporting desk.',
      avatar: '',
      areasOfCoverage: ['National Affairs', 'Governance', 'Investigative Dossiers'],
      email: 'newsroom@thedharmawatch.in',
    },
    publishedAt: '2026-11-16T12:00:00Z',
    updatedAt: '2026-11-16T12:00:00Z',
    excerpt: 'Welcome to your open-source investigative newsroom. This initial template article demonstrates the broadsheet typography, verification badges, and citation structures.',
    heroImage: '',
    imageCaption: '',
    status: 'Published',
    isLead: true,
    isBreaking: false,
    isInvestigation: false,
    isOpinion: false,
    isFactCheck: false,
    readTimeMinutes: 3,
    location: { country: 'India', state: 'Delhi', city: 'New Delhi' },
    tags: ['Welcome', 'Documentation', 'Newsroom', 'Guide'],
    sources: [],
    content: [
      '## Getting Started with Your Newsroom',
      'This is a sample article demonstrating the publication architecture of the platform. You can log into your administrative CMS at `/admin` to compose, edit, or publish news investigations.',
      '### Core Editorial Features',
      '- **Evidentiary Documentation**: Link primary records, FIR dockets, RTI disclosures, and court petitions directly into article footnotes.',
      '- **Client-Side Cryptography**: Sources can submit whistleblowing leads encrypted in their browser before network transmission.',
      '- **Syndication Feeds**: Automated RSS 2.0, Atom 1.0, and JSON Feed 1.1 endpoints are instantly available for wire dispatch.',
      '### Customizing Content',
      'You can safely delete this sample article and begin publishing real stories through your admin panel or via the headless Telegram newsroom bot.'
    ],
    pullQuotes: [
      'Open journalism anchored in constitutional verification and primary public records.'
    ],
  },
];
