export type SupportedLocale = 'en' | 'es' | 'de' | 'ja';

export interface Product {
  id: string;
  nameKey: string;
  descKey: string;
  status: 'live' | 'beta' | 'soon' | 'labs';
  category: 'ai' | 'cloud' | 'tools' | 'docs' | 'education' | 'api' | 'json' | 'encoders' | 'auth' | 'crypto' | 'utilities' | string;
  icon: string;
  badge?: string;
  techStack: string[];
  metrics?: { label: string; value: string };
  demoCode?: string;
}

export interface ServiceItem {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  deliverables: string[];
  startingPrice?: string;
  estimatedWeeks?: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  featured?: boolean;
  tags: string[];
  codeSnippet?: string;
}

export interface CommunityCrashStory {
  id: string;
  author: string;
  role: string;
  company: string;
  title: string;
  story: string;
  lesson: string;
  upvotes: number;
  tags: string[];
}

export interface RoadmapItem {
  id: string;
  quarter: string;
  titleKey: string;
  descKey: string;
  status: 'planned' | 'in-progress' | 'completed';
  upvotes: number;
  category: 'AI Platform' | 'Cloud Infra' | 'Education' | 'Developer Tools' | 'Browser Utilities' | 'Media & Web Tools' | 'Workflows & Content' | string;
}

export interface Testimonial {
  id: string;
  quoteKey: string;
  nameKey: string;
  roleKey: string;
  avatar: string;
  companyLogo?: string;
  metric?: string;
}

export interface CareerRole {
  id: string;
  title: string;
  department: 'Engineering' | 'Product Design' | 'AI Research' | 'Developer Relations';
  type: 'Full-time' | 'Contract';
  location: string;
  salary?: string;
  description: string;
  requirements: string[];
}

export interface ProjectEstimateConfig {
  projectType: 'web' | 'backend' | 'saas' | 'ai' | 'api' | 'fullstack';
  scopeLevel: 'mvp' | 'growth' | 'enterprise';
  aiIntegration: boolean;
  multiTenantAuth: boolean;
  customCloudInfra: boolean;
  priorityDelivery: boolean;
}
