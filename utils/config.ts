import type { Station, Service, Project, Testimonial } from './types';

export const WORLD = {
  /** Soft boundary radius — car gets gently pushed back inside */
  boundary: 240,
  groundY: 0,
};

export const CAR_CONFIG = {
  maxSpeed: 42, // units/sec forward
  maxReverseSpeed: 16,
  accel: 26, // acceleration force
  brakeForce: 48,
  drag: 1.2, // passive deceleration coefficient
  turnSpeed: 2.4, // rad/sec at full lock
  gripRecovery: 3.2, // how fast sideways velocity is killed (higher = more grip)
  handbrakeGrip: 0.6, // reduced grip while drifting
};

export const STATIONS: Station[] = [
  {
    id: 'hero',
    label: 'Start',
    title: 'Pixel Web Developers',
    subtitle: 'We Build Digital Experiences That Move',
    position: [0, 0, 0],
    radius: 14,
    color: '#22d3ee',
  },
  {
    id: 'services',
    label: 'Services Hub',
    title: 'What We Build',
    subtitle: 'Seven disciplines, one team.',
    position: [70, 0, -55],
    radius: 16,
    color: '#a855f7',
  },
  {
    id: 'portfolio',
    label: 'Portfolio District',
    title: 'Selected Work',
    subtitle: 'Drive into a showroom pod to open a case study.',
    position: [-80, 0, -70],
    radius: 18,
    color: '#ff2d95',
  },
  {
    id: 'about',
    label: 'About Tower',
    title: 'Inside Pixel HQ',
    subtitle: 'The people, the numbers, the journey.',
    position: [95, 0, 65],
    radius: 16,
    color: '#34d399',
  },
  {
    id: 'process',
    label: 'Process Road',
    title: 'How We Work',
    subtitle: 'Five checkpoints from idea to launch.',
    position: [0, 0, -120],
    radius: 16,
    color: '#f59e0b',
  },
  {
    id: 'testimonials',
    label: 'Testimonial Park',
    title: 'Client Voices',
    subtitle: 'What it feels like to ship with us.',
    position: [-95, 0, 70],
    radius: 16,
    color: '#60a5fa',
  },
  {
    id: 'contact',
    label: 'Contact Portal',
    title: 'Start Your Project',
    subtitle: 'Drive into the ring to open the comms channel.',
    position: [0, 0, 130],
    radius: 15,
    color: '#22d3ee',
  },
];

export const SERVICES: Service[] = [
  {
    id: 'web',
    title: 'Web Development',
    short: 'Fast, scalable, custom web apps',
    description:
      'Production-grade web applications built with Next.js, React and modern tooling. From marketing sites to complex dashboards, engineered for speed, SEO and maintainability.',
    features: ['Next.js & React', 'Headless CMS', 'Core Web Vitals', 'API & backend'],
    position: [50, 6, -40],
    color: '#22d3ee',
    icon: '</>',
  },
  {
    id: 'shopify',
    title: 'Shopify Stores',
    short: 'High-converting commerce',
    description:
      'Custom Shopify themes, headless storefronts and conversion-focused UX that turns visitors into buyers and scales with your catalog.',
    features: ['Custom themes', 'Headless Hydrogen', 'Checkout UX', 'App integrations'],
    position: [64, 6, -48],
    color: '#34d399',
    icon: '🛒',
  },
  {
    id: 'wordpress',
    title: 'WordPress',
    short: 'Flexible content platforms',
    description:
      'Bespoke WordPress builds and Gutenberg blocks your marketing team will actually enjoy using — fast, secure, and easy to edit.',
    features: ['Custom themes', 'ACF & blocks', 'WooCommerce', 'Performance tuning'],
    position: [78, 6, -42],
    color: '#60a5fa',
    icon: 'W',
  },
  {
    id: 'mobile',
    title: 'Mobile Apps',
    short: 'Cross-platform with Flutter',
    description:
      'Beautiful, native-feeling iOS and Android apps from a single Flutter codebase — shipped faster without compromising on polish.',
    features: ['Flutter / Dart', 'iOS & Android', 'Offline-first', 'App Store launch'],
    position: [56, 6, -64],
    color: '#a855f7',
    icon: '📱',
  },
  {
    id: 'design',
    title: 'UI/UX Design',
    short: 'Interfaces that feel inevitable',
    description:
      'Research-driven product design, design systems and prototyping that align user needs with business goals — handed off pixel-perfect.',
    features: ['User research', 'Design systems', 'Prototyping', 'Motion design'],
    position: [72, 6, -66],
    color: '#ff2d95',
    icon: '✦',
  },
  {
    id: 'ai',
    title: 'AI Integration',
    short: 'LLMs that do real work',
    description:
      'Practical AI features — chat, search, generation and agents — wired into your product with the right model, guardrails and cost controls.',
    features: ['LLM apps', 'RAG & search', 'Agents', 'Prompt engineering'],
    position: [44, 6, -54],
    color: '#f59e0b',
    icon: '✷',
  },
  {
    id: 'automation',
    title: 'Automation Systems',
    short: 'Workflows that run themselves',
    description:
      'Custom automation and integrations that remove manual busywork — connecting your tools, data and teams into reliable pipelines.',
    features: ['Workflow automation', 'API integrations', 'Webhooks', 'Internal tools'],
    position: [86, 6, -58],
    color: '#22d3ee',
    icon: '⚙',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'nova-commerce',
    title: 'Nova Commerce',
    client: 'Nova Retail Group',
    category: 'ecommerce',
    position: [-70, 0, -58],
    problem:
      'A legacy storefront with a 6s load time and a 1.1% conversion rate was bleeding revenue on mobile.',
    solution:
      'Rebuilt as a headless Shopify Hydrogen storefront with edge rendering, a redesigned checkout, and a custom product configurator.',
    tech: ['Hydrogen', 'Shopify', 'Remix', 'Tailwind', 'Vercel'],
    results: [
      { label: 'Load time', value: '6s → 0.9s' },
      { label: 'Conversion', value: '+118%' },
      { label: 'Mobile revenue', value: '+74%' },
    ],
    color: '#34d399',
  },
  {
    id: 'lumen-dashboard',
    title: 'Lumen Analytics',
    client: 'Lumen SaaS',
    category: 'web',
    position: [-86, 0, -64],
    problem:
      'Their analytics dashboard couldn’t handle real-time data and crashed above 50k rows.',
    solution:
      'Engineered a virtualized, streaming dashboard with a WebSocket data layer and incremental rendering.',
    tech: ['Next.js', 'TypeScript', 'WebSockets', 'D3', 'Postgres'],
    results: [
      { label: 'Rows handled', value: '50k → 5M' },
      { label: 'Render time', value: '-92%' },
      { label: 'Churn', value: '-31%' },
    ],
    color: '#22d3ee',
  },
  {
    id: 'orbit-app',
    title: 'Orbit Fitness',
    client: 'Orbit Health',
    category: 'mobile',
    position: [-94, 0, -54],
    problem:
      'Two separate native codebases were doubling cost and slowing feature releases.',
    solution:
      'Unified into a single Flutter app with offline sync, wearables integration and a custom motion-rich UI.',
    tech: ['Flutter', 'Dart', 'Firebase', 'HealthKit', 'Riverpod'],
    results: [
      { label: 'Release cadence', value: '2x faster' },
      { label: 'App rating', value: '4.8★' },
      { label: 'Dev cost', value: '-45%' },
    ],
    color: '#a855f7',
  },
  {
    id: 'aria-design',
    title: 'Aria Design System',
    client: 'Aria Fintech',
    category: 'design',
    position: [-62, 0, -78],
    problem:
      'Inconsistent UI across 9 products slowed every team and confused users.',
    solution:
      'Built a token-based design system with a documented component library and Figma-to-code pipeline.',
    tech: ['Figma', 'Storybook', 'React', 'Style Dictionary'],
    results: [
      { label: 'Design debt', value: '-80%' },
      { label: 'Ship speed', value: '+60%' },
      { label: 'Components', value: '120+' },
    ],
    color: '#ff2d95',
  },
  {
    id: 'sage-ai',
    title: 'Sage Support AI',
    client: 'Sage Logistics',
    category: 'web',
    position: [-78, 0, -84],
    problem:
      'Support agents spent hours searching scattered docs to answer customer tickets.',
    solution:
      'Deployed a RAG-powered assistant over their knowledge base with citations and human handoff.',
    tech: ['Next.js', 'Claude API', 'pgvector', 'LangChain'],
    results: [
      { label: 'First-response', value: '-67%' },
      { label: 'Tickets deflected', value: '41%' },
      { label: 'CSAT', value: '+22pts' },
    ],
    color: '#f59e0b',
  },
];

export const PORTFOLIO_FILTERS: { id: Project['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'web', label: 'Web' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'design', label: 'Design' },
];

export const ABOUT_STATS = [
  { label: 'Projects Delivered', value: 180, suffix: '+' },
  { label: 'Clients Served', value: 95, suffix: '+' },
  { label: 'Years Experience', value: 9, suffix: '' },
  { label: 'Team Members', value: 24, suffix: '' },
];

export const TIMELINE = [
  { year: '2017', title: 'Founded', text: 'Pixel Web Developers starts as a two-person studio.' },
  { year: '2019', title: 'First 50 clients', text: 'Expanded into e-commerce and mobile.' },
  { year: '2021', title: 'Design systems', text: 'Launched a dedicated product design practice.' },
  { year: '2023', title: 'AI division', text: 'Began shipping LLM-powered product features.' },
  { year: '2025', title: 'Global team', text: '24 specialists across web, mobile, design & AI.' },
];

export const PROCESS_STEPS = [
  { n: '01', title: 'Discover', text: 'We dig into goals, users and constraints before a single pixel.' },
  { n: '02', title: 'Design', text: 'Wireframes, prototypes and a design system you can sign off on.' },
  { n: '03', title: 'Build', text: 'Iterative, tested development with weekly demos.' },
  { n: '04', title: 'Launch', text: 'Performance-tuned, SEO-ready deployment with monitoring.' },
  { n: '05', title: 'Grow', text: 'Data-driven iteration and ongoing partnership.' },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Maya Chen',
    role: 'CEO, Nova Retail Group',
    quote:
      'They more than doubled our conversion rate. The new storefront feels like a different company.',
  },
  {
    id: 't2',
    name: 'David Okafor',
    role: 'CTO, Lumen SaaS',
    quote:
      'Our dashboard went from crashing to handling millions of rows. Genuinely world-class engineering.',
  },
  {
    id: 't3',
    name: 'Sofia Rossi',
    role: 'Head of Product, Orbit Health',
    quote:
      'One Flutter codebase, half the cost, and a 4.8-star app. Exactly what we hoped for.',
  },
  {
    id: 't4',
    name: 'James Patel',
    role: 'VP Design, Aria Fintech',
    quote:
      'The design system transformed how nine teams ship. We move so much faster now.',
  },
];

export const CONTACT_BUDGETS = [
  'Under $5k',
  '$5k – $15k',
  '$15k – $50k',
  '$50k+',
];
