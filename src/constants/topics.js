// ─────────────────────────────────────────────────────────────────
//  TOPICS.JS — single registry for every subject in the portal.
//  The hub cards, header dropdown, routes, topic pages and search
//  deep-links are all generated from this list.
//
//  To add a new subject:
//    1. Add sections to sections.js (or a new data file) with unused ids
//    2. Add Q&As to interviewQA.js using a new `category`
//    3. Append an entry below — nothing else needs touching.
// ─────────────────────────────────────────────────────────────────

export const TOPICS = [
  {
    key: 'react', route: '/react', icon: '⚛️', label: 'React', navLabel: 'React',
    desc: 'Hooks, Redux Toolkit, performance, architecture, testing',
    subtitle: 'Hooks, TypeScript, Redux Toolkit, Next.js, Testing, Accessibility',
    color: '#00ffd1',
    ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    qaCategories: ['React', 'TypeScript', 'Redux Toolkit', 'Next.js', 'Testing', 'Accessibility'],
  },
  {
    key: 'javascript', route: '/javascript', icon: '🟨', label: 'JavaScript', navLabel: 'JavaScript',
    desc: 'Language fundamentals, data, async JavaScript, DOM, and browser APIs',
    subtitle: 'A guided path from language fundamentals through asynchronous code and browser APIs',
    color: '#f7df1e',
    ids: [95, 96, 97, 98, 99, 100, 101, 102, 18, 19, 20],
    qaCategories: ['JavaScript'],
  },
  {
    key: 'js-app', route: '/js-app', icon: '🧭', label: 'JS in a Real App (WayFar)', navLabel: 'JS Real-World App',
    desc: 'Events, DOM, async, storage, classes, modules, validation, security, clean code, and a full auth project',
    subtitle: 'Learn JavaScript through a real travel app: concepts, clean-code standards, Tamil & Indian-English video lessons',
    color: '#f2b45a', ids: [142, 143, 144, 145, 146, 147, 148, 149], qaCategories: ['JS App Concepts'],
  },
  {
    key: 'frontend', route: '/frontend', icon: '🎨', label: 'HTML, CSS & SCSS', navLabel: 'HTML/CSS & SCSS',
    desc: 'Semantic HTML, accessible forms, responsive layouts, and Sass architecture',
    subtitle: 'Semantic markup, accessible forms, responsive CSS, and maintainable Sass modules',
    color: '#f43f5e',
    ids: [103, 104, 105, 106, 107, 108, 109, 110, 111],
    qaCategories: ['HTML/CSS', 'SCSS'],
  },
  {
    key: 'typescript', route: '/typescript', icon: '🔷', label: 'TypeScript', navLabel: 'TypeScript',
    desc: 'Type system basics, utility types, and advanced patterns',
    subtitle: 'interface vs type, generics, utility types, narrowing and type guards',
    color: '#3178c6', ids: [124, 125], qaCategories: ['TypeScript'],
  },
  {
    key: 'nextjs', route: '/nextjs', icon: '▲', label: 'Next.js', navLabel: 'Next.js',
    desc: 'Rendering strategies, data fetching, caching and routing',
    subtitle: 'SSR, SSG, ISR, Server Components, data fetching and API routes',
    color: '#e5e5e5', ids: [132, 133, 134], qaCategories: ['Next.js'],
  },
  {
    key: 'nodejs', route: '/nodejs', icon: '🟩', label: 'Node.js', navLabel: 'Node.js',
    desc: 'Event Loop, Express, REST APIs, Auth, WebSockets',
    subtitle: 'Event Loop, Express, REST APIs, Auth, WebSockets',
    color: '#68a063', ids: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    qaCategories: ['Node.js', 'JWT', 'API Design'],
  },
  {
    key: 'graphql', route: '/graphql', icon: '🕸️', label: 'GraphQL', navLabel: 'GraphQL',
    desc: 'Queries, mutations, Apollo Client caching and REST comparison',
    subtitle: 'GraphQL fundamentals, Apollo Client & caching, REST vs GraphQL',
    color: '#e535ab', ids: [126, 127, 128], qaCategories: ['GraphQL'],
  },
  {
    key: 'java', route: '/java', icon: '☕', label: 'Java & Spring Boot', navLabel: 'Java',
    desc: 'Core Java, OOP, collections, concurrency, Spring Boot, JPA, and security',
    subtitle: 'Core Java · OOP · Collections · Java 8+ · Spring Boot · JPA · Security · Concurrency',
    color: '#f59e0b',
    ids: [112, 113, 114, 115, 116, 117, 118, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
    qaCategories: ['Java', 'Spring', 'Hibernate'],
  },
  {
    key: 'python', route: '/python', icon: '🐍', label: 'Python', navLabel: 'Python',
    desc: 'Core syntax, data structures, functions, files, regex, dates, and concurrency',
    subtitle: 'Syntax, OOP, Async, Decorators, Tooling & the Ecosystem',
    color: '#3776AB',
    ids: [63, 64, 65, 119, 66, 67, 68, 69, 70, 120, 71, 121, 72, 73, 74, 75, 76, 77, 122, 123, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    qaCategories: ['Python'],
  },
  {
    key: 'dsa', route: '/dsa', icon: '🧩', label: 'DSA', navLabel: 'DSA',
    title: 'Data Structures & Algorithms',
    desc: 'Arrays, Trees, Graphs, DP, Sorting, Searching',
    subtitle: 'Arrays, Trees, Graphs, DP, Sorting, Searching',
    color: '#a78bfa', ids: [45, 46, 47, 48, 49, 50, 51, 52, 53, 54], qaCategories: ['DSA'],
  },
  {
    key: 'system-design', route: '/system-design', icon: '🏗️', label: 'System Design', navLabel: 'System Design',
    desc: 'Scalability, Caching, Queues, Security, AWS, CI/CD',
    subtitle: 'Scalability, Databases, Caching, Queues, Security, AWS, DevOps',
    color: '#ff6b6b', ids: [55, 56, 57, 58, 59, 60, 61, 62],
    qaCategories: ['System Design', 'API Design', 'CI/CD', 'AWS'],
  },
  {
    key: 'databases', route: '/databases', icon: '🗄️', label: 'Databases (SQL & NoSQL)', navLabel: 'Databases',
    desc: 'Indexing, transactions, ACID, locking, normalization and MongoDB aggregation',
    subtitle: 'Indexing internals, query optimisation, transactions, locking, normalisation and aggregation pipelines',
    color: '#f472b6', ids: [], qaCategories: ['Database'], defaultTab: 'qa',
  },
  {
    key: 'production-scenarios', route: '/production-scenarios', icon: '🚨', label: 'Production Scenarios', navLabel: 'Production Scenarios',
    desc: 'Slow APIs, high CPU, monitoring, debugging frameworks and invoice-system design',
    subtitle: 'Real incidents and system scenarios: diagnose, fix, monitor and explain like a senior engineer',
    color: '#ef4444', ids: [], qaCategories: ['Production Scenarios'], defaultTab: 'qa',
  },
  {
    key: 'mobile-offline', route: '/mobile-offline', icon: '📱', label: 'React Native & Offline-First', navLabel: 'RN & Offline-First',
    desc: 'Re-renders, FlatList, JS-thread blocking, offline sync and conflict resolution',
    subtitle: 'React Native performance plus offline-first design: storage, sync, conflicts and retries',
    color: '#61dafb', ids: [], qaCategories: ['React Native', 'Offline-First'], defaultTab: 'qa',
  },
  {
    key: 'resume-projects', route: '/resume-projects', icon: '📄', label: 'Resume & Project Discussion', navLabel: 'Resume & Projects',
    desc: 'Tell me about yourself, project architecture, contributions and project-based follow-ups',
    subtitle: 'Structured answers for your resume, current project, features, trade-offs and production practices',
    color: '#fbbf24', ids: [], qaCategories: ['Resume & Projects'], defaultTab: 'qa',
  },
  {
    key: 'microservices', route: '/microservices', icon: '🧱', label: 'Microservices', navLabel: 'Microservices',
    desc: 'Core concepts, resilience & scale patterns, design considerations',
    subtitle: 'Service boundaries, resilience patterns, scaling and design trade-offs',
    color: '#FF6B35', ids: [129, 130, 131], qaCategories: ['Microservices'],
  },
  {
    key: 'testing', route: '/testing', icon: '🧪', label: 'Testing & QA', navLabel: 'Testing & QA',
    desc: 'Unit, component and end-to-end testing, Jest, best practices',
    subtitle: 'Unit & component testing, E2E, Jest and testing best practices',
    color: '#28a745', ids: [135, 136, 137, 138], qaCategories: ['Testing'],
  },
  {
    key: 'rag-ai', route: '/rag-ai', icon: '🤖', label: 'RAG & AI/LLM', navLabel: 'RAG & AI/LLM',
    desc: 'RAG fundamentals, LLM integration, prompting and production deployment',
    subtitle: 'RAG fundamentals, LLM integration & prompting, production deployment',
    color: '#9c27b0', ids: [139, 140, 141], qaCategories: ['AI Tooling'],
  },
  {
    key: 'career', route: '/career', icon: '🎯', label: 'Career & Leadership', navLabel: 'Career & Leadership',
    desc: 'Behavioral (STAR), Mentoring, Agile, Tech-Lead Scenarios',
    subtitle: 'Behavioral (STAR) Answers, Mentoring, Agile, Tech-Lead Scenarios',
    color: '#c792ea', ids: [], qaCategories: ['Behavioral', 'Managerial', 'Banking Scenarios'],
    defaultTab: 'qa',
  },
  {
    key: 'prep-roadmap', route: '/prep-roadmap', icon: '🗺️', label: 'Interview Prep Roadmap', navLabel: 'Prep Roadmap',
    desc: '30-day plan, pattern cheat sheet, story bank, daily drills',
    subtitle: '30-Day Plan, Pattern Cheat Sheet, Self-Assessment, Story Bank, Daily Drills, Resources',
    color: '#fbbf24', ids: [89, 90, 91, 92, 93, 94], qaCategories: [], hub: false,
  },
];

export const hexToRgb = (hex) =>
  hex.replace('#', '').match(/.{2}/g)?.map((x) => parseInt(x, 16)).join(',') || '0,0,0';

/** Topic that owns a given section id (first match wins). */
export const topicForSection = (id) => TOPICS.find((t) => t.ids.includes(id));
