import type { OnboardingRole, OnboardingNeed } from '../context/OnboardingContext'

// ─── Screen copy ────────────────────────────────────────────────────────────

export const SCREEN1_COPY = {
  title: 'Get Started 🚀',
  subtitle: 'Create your account and get live in 2 mins',
  cta: 'Start My Free Trial',
  terms: 'By Signing Up, you agree to the',
  termsLinks: ['Terms of Service', 'Privacy Policy', 'Cookie Notice'] as const,
  alreadyCustomer: 'Already a customer?',
  loginLink: 'Login',
}

export const SCREEN2_COPY = {
  welcome: (name: string) => `Welcome to Exotel, ${name}`,
  title: 'What best describes your role 👤',
  cta: 'Next',
  skip: 'Skip for now',
}

export const SCREEN3_COPY = {
  welcome: (name: string) => `Welcome to Exotel, ${name}`,
  title: "What's your primary need? 🎯",
  cta: 'Next',
  skip: 'Skip for now',
  useCaseLabel: (product: string) => `What will you use ${product} for?`,
  useCaseSubLabel: 'Select all that apply',
}

export const SCREEN4_COPY = {
  welcome: (name: string) => `Welcome to Exotel, ${name}`,
  title: 'Personalize your workspace',
  teamSizeLabel: 'Team Size',
  industryLabel: 'Industry',
  cta: 'Next',
  skip: 'Skip for now',
}

// ─── Left panel (Screen 1) ───────────────────────────────────────────────────

export const LEFT_PANEL = {
  eyebrow: 'Enterprise Contact Center',
  headline: 'Launch a smarter contact center in minutes.',
  subhead:
    'Voice, AI, and omnichannel — all from one dashboard. Go live in 2 minutes, scale to thousands of agents.',
  trustedLabel: "Trusted by India's fastest-growing companies",
  trustedBrands: [
    { name: 'zomato', italic: false },
    { name: 'Swiggy', italic: false },
    { name: 'Uber', italic: false },
    { name: 'Flipkart', italic: false },
    { name: 'ixigo', italic: false },
    { name: 'ICICI', italic: true },
  ],
  stat: '7,000+ businesses handle 1B+ conversations on Exotel each year',
  statBold: ['7,000+ businesses', '1B+ conversations'],
}

export const FEATURE_CARDS = [
  { icon: 'phone', title: 'Voice & Calling', desc: 'Make and receive calls, build sophisticated call flows.' },
  { icon: 'microphone', title: 'AI Voice Workflows', desc: 'Automate sales, support, and service with AI agents.' },
  { icon: 'chats', title: 'Omnichannel Inbox', desc: 'SMS, chat, voice, and email in a single agent view.' },
  { icon: 'gear', title: 'Built for Admins', desc: 'Custom domains, webhooks, agent views — your way.' },
]

// ─── Role options (Screen 2) ─────────────────────────────────────────────────

export interface RoleOption {
  id: OnboardingRole & string
  title: string
  description: string
}

export const ROLES: RoleOption[] = [
  { id: 'admin', title: 'Admin', description: 'Full Access to all features' },
  { id: 'supervisor', title: 'Supervisor', description: 'Manage teams and operations' },
  { id: 'agent', title: 'Agent', description: 'Handle customer interactions' },
  {
    id: 'developer',
    title: 'Developer',
    description:
      "Integrate Exotel's API into your app. Build with SMS, Voice, WhatsApp, and Verify APIs.",
  },
]

// ─── Product options (Screen 3) ─────────────────────────────────────────────

export interface ProductOption {
  id: NonNullable<OnboardingNeed>
  title: string
  description: string
  icon: string
  displayName: string
  // gradient is an exception to the no-hardcode rule — Signal has no gradient tokens
  gradient: string
}

export const PRODUCTS: ProductOption[] = [
  {
    id: 'contact_center',
    title: 'Contact Center',
    description: 'Voice, SMS, Omnichannel support',
    icon: 'headset',
    displayName: 'Contact Centre',
    gradient: 'linear-gradient(135deg, #4F9EE8 0%, #5B6ED6 100%)',
  },
  {
    id: 'engage',
    title: 'Engage',
    description: 'Omnichannel channel management',
    icon: 'megaphone',
    displayName: 'Engage',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #4F9EE8 100%)',
  },
  {
    id: 'chatbot',
    title: 'Chatbot',
    description: 'AI Chatbot for customer engagement',
    icon: 'robot',
    displayName: 'Chatbot',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 100%)',
  },
  {
    id: 'voicebot',
    title: 'Voicebot',
    description: 'Automated voice integration',
    icon: 'speaker-high',
    displayName: 'Voicebot',
    gradient: 'linear-gradient(135deg, #2DD4BF 0%, #38BDF8 100%)',
  },
  {
    id: 'quality',
    title: 'Conversational Quality Analysis',
    description: 'Monitor conversational quality and performance',
    icon: 'chart-bar',
    displayName: 'Conversational Quality Analysis',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
  },
  {
    id: 'ai_assist',
    title: 'AI Assist',
    description: 'AI and human support platform',
    icon: 'sparkle',
    displayName: 'AI Assist',
    gradient: 'linear-gradient(135deg, #C084FC 0%, #818CF8 100%)',
  },
]

// ─── Use cases per product (Screen 3, inline) ────────────────────────────────

export const USE_CASES_BY_PRODUCT: Record<NonNullable<OnboardingNeed>, string[]> = {
  contact_center: [
    'Inbound Customer Support',
    'Outbound Sales Campaign',
    'IVR and Call Routing',
    'Agent Productivity tools',
    'Call Analytics and Reporting',
  ],
  engage: [
    'Outbound Campaigns',
    'SMS Marketing',
    'WhatsApp Broadcasts',
    'Email Campaigns',
    'Campaign Analytics',
  ],
  chatbot: [
    'Customer Support Automation',
    'Lead Generation',
    'FAQ Handling',
    'Appointment Booking',
    'E-commerce Support',
  ],
  voicebot: [
    'Automated Call Handling',
    'IVR Replacement',
    'Appointment Reminders',
    'Payment Collection',
    'Customer Surveys',
  ],
  quality: [
    'Call Quality Monitoring',
    'Agent Performance Analysis',
    'Conversation Scoring',
    'Compliance Checks',
    'Customer Sentiment Analysis',
  ],
  ai_assist: [
    'Agent Assistance',
    'Real-time Suggestions',
    'Knowledge Base Queries',
    'Customer Insights',
    'Sentiment Detection',
  ],
}

// ─── Team sizes (Screen 4) ────────────────────────────────────────────────────

export const TEAM_SIZES = [
  '1 - 10 agents',
  '11 - 50 agents',
  '51 - 200 agents',
  '500+ agents',
  'Enterprise (2000+)',
  '201 - 500 agents',
]

// ─── Industries (Screen 4) ────────────────────────────────────────────────────

export interface IndustryOption {
  label: string
  icon: string
}

export const INDUSTRIES: IndustryOption[] = [
  { label: 'E-commerce', icon: 'shopping-bag' },
  { label: 'Financial Services', icon: 'currency-dollar' },
  { label: 'Healthcare', icon: 'first-aid' },
  { label: 'Education', icon: 'graduation-cap' },
  { label: 'Travel and Hospitality', icon: 'airplane' },
  { label: 'Real Estate', icon: 'buildings' },
  { label: 'Retail', icon: 'storefront' },
  { label: 'Technology', icon: 'cpu' },
  { label: 'Others', icon: 'dots-three-circle' },
]

// ─── Shared form data ────────────────────────────────────────────────────────

export const COUNTRY_CODES = [
  { code: '+91' }, { code: '+1' }, { code: '+44' }, { code: '+65' },
  { code: '+971' }, { code: '+61' }, { code: '+49' }, { code: '+33' }, { code: '+81' },
]

export const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Singapore',
  'United Arab Emirates', 'Australia', 'Canada', 'Germany',
  'France', 'Japan', 'Brazil', 'South Africa', 'Indonesia',
  'Philippines', 'Malaysia', 'Thailand',
]
