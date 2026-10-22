// Sections migrated from the former standalone topic pages (TypeScript, GraphQL, Microservices, Next.js, Testing, RAG & AI).
// IDs 124-141. Code is pre-escaped for dangerouslySetInnerHTML.
export const LEGACY_SECTIONS = [
  {
    "id": 124,
    "title": "Type System Basics",
    "sub": "interface vs type, Generics",
    "color": "#3178c6",
    "level": "mid",
    "concepts": [
      {
        "title": "interface vs type",
        "list": [
          "interface: Best for object shapes and class contracts. Supports declaration merging and class implementation.",
          "type: More flexible. Supports unions, intersections, tuples, conditional types, and mapped types.",
          "interface extends; type uses & (intersection)",
          "Use interface for objects and APIs; use type for unions or transformations"
        ],
        "code": "interface User {\n  id: string;\n  name: string;\n}\n\ntype Status = 'active' | 'inactive' | 'pending';\n\n// Intersection\ntype AdminUser = User &amp; { role: 'admin' };\n\n// Declaration merging (interface only)\ninterface User {\n  email: string;  // extends the first User\n}"
      },
      {
        "title": "Generics",
        "list": [
          "Generics let a function or component work with multiple types while keeping type safety",
          "Placeholder type parameter: <T>",
          "Generic constraints: <T extends { id: string }>",
          "Common in React components and API wrappers"
        ],
        "code": "function getFirst&lt;T&gt;(arr: T[]): T {\n  return arr[0];\n}\n\ninterface ApiResponse&lt;T&gt; {\n  data: T;\n  status: number;\n}\n\nfunction fetchData&lt;T&gt;(url: string): Promise&lt;T&gt; {\n  return fetch(url).then(r =&gt; r.json());\n}\n\n// Usage\nconst users = await fetchData&lt;User[]&gt;('/api/users');"
      }
    ]
  },
  {
    "id": 125,
    "title": "Utility Types & Advanced Patterns",
    "sub": "Common Utility Types, unknown vs any",
    "color": "#3178c6",
    "level": "mid",
    "concepts": [
      {
        "title": "Common Utility Types",
        "list": [
          "Partial<T>: make all properties optional",
          "Required<T>: make all properties required",
          "Pick<T, K>: choose only selected keys",
          "Omit<T, K>: exclude selected keys",
          "Record<K, V>: create mappings between keys and values",
          "NonNullable<T>: removes null and undefined"
        ],
        "code": "interface User {\n  id: string;\n  name: string;\n  email?: string;\n}\n\ntype UserPreview = Pick&lt;User, 'id' | 'name'&gt;;\ntype UserWithoutId = Omit&lt;User, 'id'&gt;;\ntype PartialUser = Partial&lt;User&gt;;\ntype UserUpdate = Required&lt;Omit&lt;User, 'id'&gt;&gt;;\n\ntype FeatureFlags = Record&lt;'darkMode' | 'beta' | 'analytics', boolean&gt;;"
      },
      {
        "title": "unknown vs any",
        "list": [
          "any: disables type checking entirely. Use only as last resort.",
          "unknown: more type-safe. Requires type narrowing before use.",
          "Best practice: default to unknown, narrow with typeof/instanceof checks"
        ],
        "code": "function process(value: unknown) {\n  if (typeof value === 'string') {\n    console.log(value.toUpperCase());\n  } else if (typeof value === 'number') {\n    console.log(value.toFixed(2));\n  }\n}\n\nfunction isUser(value: unknown): value is User {\n  return typeof value === 'object' &amp;&amp; value !== null &amp;&amp; 'id' in value;\n}"
      }
    ]
  },
  {
    "id": 126,
    "title": "GraphQL Fundamentals",
    "sub": "Query vs Mutation vs Subscription, Schema & Resolvers",
    "color": "#e535ab",
    "level": "mid",
    "concepts": [
      {
        "title": "Query vs Mutation vs Subscription",
        "list": [
          "Query: Read data from the server. Like HTTP GET, but client specifies exact fields needed.",
          "Mutation: Modify server-side data. Like HTTP POST/PUT/PATCH.",
          "Subscription: Real-time updates pushed over WebSocket. Useful for live notifications.",
          "GraphQL solves REST over-fetching (getting too much data) and under-fetching (needing multiple requests)."
        ],
        "code": "# Query — read data\nquery GetUser($id: ID!) {\n  user(id: $id) {\n    id\n    name\n    email\n    posts {\n      id\n      title\n    }\n  }\n}\n\n# Mutation — write data\nmutation CreatePost($title: String!) {\n  createPost(title: $title) {\n    id\n    title\n    createdAt\n  }\n}\n\n# Subscription — real-time updates\nsubscription OnNewMessage($userId: ID!) {\n  messageAdded(userId: $userId) {\n    id\n    text\n    sender\n  }\n}"
      },
      {
        "title": "Schema & Resolvers",
        "list": [
          "Schema: Defines the shape of data and available queries/mutations. Like an API contract.",
          "Resolver: A function that returns or computes data for a schema field.",
          "Type system: Every field has a type (String, Int, Boolean, custom types, lists, etc.)"
        ],
        "code": "type User {\n  id: ID!\n  name: String!\n  email: String\n  posts: [Post!]!\n}\n\ntype Post {\n  id: ID!\n  title: String!\n  content: String\n  author: User!\n}\n\ntype Query {\n  user(id: ID!): User\n  posts: [Post!]!\n}\n\n# Resolver example (Node.js)\nconst resolvers = {\n  Query: {\n    user: (_, { id }) =&gt; users.find(u =&gt; u.id === id),\n    posts: () =&gt; posts,\n  },\n  User: {\n    posts: (user) =&gt; posts.filter(p =&gt; p.authorId === user.id),\n  },\n};"
      }
    ]
  },
  {
    "id": 127,
    "title": "Apollo Client & Caching",
    "sub": "Apollo Cache Strategies, Mutations & Cache Invalidation",
    "color": "#e535ab",
    "level": "mid",
    "concepts": [
      {
        "title": "Apollo Cache Strategies",
        "list": [
          "cache-first: Check cache first, use network only when data missing.",
          "network-only: Always fetch from network, skip cache.",
          "cache-and-network: Return cached data immediately, fetch fresh data in background.",
          "Apollo normalizes objects by __typename:id so multiple queries share one object."
        ],
        "code": "import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';\n\nconst client = new ApolloClient({\n  uri: 'https://api.example.com/graphql',\n  cache: new InMemoryCache(),\n});\n\nfunction UserProfile({ userId }) {\n  const { data, loading, error } = useQuery(GET_USER, {\n    variables: { id: userId },\n    fetchPolicy: 'cache-and-network',\n  });\n\n  if (loading) return &lt;div&gt;Loading...&lt;/div&gt;;\n  if (error) return &lt;div&gt;Error: {error.message}&lt;/div&gt;;\n\n  return &lt;div&gt;{data.user.name}&lt;/div&gt;;\n}"
      },
      {
        "title": "Mutations & Cache Invalidation",
        "list": [
          "After a mutation, use refetchQueries to reload affected data.",
          "Or manually update the cache with cache.modify() or refetchQueries.",
          "Prevent N+1 problem with batching tools like DataLoader."
        ],
        "code": "const { mutate: createPost } = useMutation(CREATE_POST, {\n  refetchQueries: [{ query: GET_POSTS }],\n});\n\n// Or manual cache update\nconst { mutate: deletePost } = useMutation(DELETE_POST, {\n  update(cache, { data: { deletePost } }) {\n    const { posts } = cache.readQuery({ query: GET_POSTS });\n    cache.writeQuery({\n      query: GET_POSTS,\n      data: {\n        posts: posts.filter(p =&gt; p.id !== deletePost.id),\n      },\n    });\n  },\n});"
      }
    ]
  },
  {
    "id": 128,
    "title": "REST vs GraphQL",
    "sub": "REST Principles, GraphQL Advantages",
    "color": "#e535ab",
    "level": "mid",
    "concepts": [
      {
        "title": "REST Principles",
        "list": [
          "Resource-oriented endpoints: /merchants/:id/transactions",
          "Use HTTP verbs: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)",
          "Stateless: server doesn't store client context",
          "Add pagination for large lists",
          "Use versioning for long-lived APIs (/v1/users)"
        ]
      },
      {
        "title": "GraphQL Advantages",
        "list": [
          "Client specifies exact fields needed — no over-fetching",
          "Single endpoint, multiple queries — no under-fetching",
          "Strongly typed schema — excellent DX",
          "Challenges: query complexity, caching on CDN, monitoring per-field performance"
        ]
      }
    ]
  },
  {
    "id": 129,
    "title": "Core Concepts",
    "sub": "Monolith vs Microservices, Communication Patterns",
    "color": "#FF6B35",
    "level": "mid",
    "concepts": [
      {
        "title": "Monolith vs Microservices",
        "list": [
          "Monolith: Single codebase, one deployment unit. Simple but hard to scale specific parts.",
          "Microservices: Multiple independent services, own databases, separate deployments. More complex but fine-grained scaling.",
          "Bounded Context: Each service owns its data and domain logic. Clear ownership boundaries.",
          "API Gateway: Single entry point for all client requests. Handles routing, auth, rate limiting."
        ]
      },
      {
        "title": "Communication Patterns",
        "list": [
          "Synchronous: REST, gRPC. Request waits for response. Simpler but tightly coupled.",
          "Asynchronous: Events, Kafka, SQS. Fire and forget. Loose coupling, eventual consistency.",
          "Saga Pattern: For distributed transactions. Use local transactions + compensating actions (rollback on failure).",
          "Idempotency Keys: For payment operations. Retries can't create duplicate charges."
        ],
        "code": "// Saga Pattern Example\nasync function transferMoney(fromAccountId, toAccountId, amount) {\n  // Step 1: Debit from account (local transaction)\n  try {\n    await debitAccount(fromAccountId, amount);\n  } catch (e) {\n    throw new Error('Debit failed');\n  }\n\n  // Step 2: Credit to account\n  try {\n    await creditAccount(toAccountId, amount);\n  } catch (e) {\n    // Compensating action: refund the debit\n    await creditAccount(fromAccountId, amount);\n    throw new Error('Credit failed, refunded');\n  }\n}\n\n// Idempotency key prevents duplicate charges\nconst payment = await stripe.charges.create({\n  amount: 1000,\n  currency: 'usd',\n  idempotency_key: 'unique-transaction-id',\n});"
      }
    ]
  },
  {
    "id": 130,
    "title": "Resilience & Scale Patterns",
    "sub": "Circuit Breaker Pattern, Data Model for Scale, API Gateway Responsibilities",
    "color": "#FF6B35",
    "level": "mid",
    "concepts": [
      {
        "title": "Circuit Breaker Pattern",
        "list": [
          "CLOSED: requests flow normally, failures counted",
          "OPEN: requests fail fast without calling the unhealthy dependency",
          "HALF_OPEN: one test request checks if recovery happened",
          "Prevents cascading failures when a service is slow or down"
        ],
        "code": "class CircuitBreaker {\n  constructor(threshold = 5, timeout = 30000) {\n    this.state = 'CLOSED';\n    this.failureCount = 0;\n    this.threshold = threshold;\n    this.timeout = timeout;\n  }\n\n  async execute(operation) {\n    if (this.state === 'OPEN') {\n      throw new Error('Circuit breaker is OPEN');\n    }\n\n    try {\n      const result = await operation();\n      if (this.state === 'HALF_OPEN') {\n        this.state = 'CLOSED';\n        this.failureCount = 0;\n      }\n      return result;\n    } catch (err) {\n      this.failureCount++;\n      if (this.failureCount &gt;= this.threshold) {\n        this.state = 'OPEN';\n        setTimeout(() =&gt; (this.state = 'HALF_OPEN'), this.timeout);\n      }\n      throw err;\n    }\n  }\n}"
      },
      {
        "title": "Data Model for Scale",
        "list": [
          "Database-per-service: Each service owns its data. Independent scaling.",
          "Event Streaming: Use Kafka or SQS for eventual consistency instead of sync calls.",
          "CQRS: Separate read and write models when they scale differently.",
          "Caching: Use Redis for hot data. Set TTLs to avoid stale data."
        ]
      },
      {
        "title": "API Gateway Responsibilities",
        "list": [
          "Routing: Direct requests to correct microservice",
          "Authentication: Validate tokens, attach user context",
          "Rate Limiting: Prevent abuse per client",
          "Response Aggregation: Combine data from multiple services",
          "Request/Response logging: Audit trail"
        ]
      }
    ]
  },
  {
    "id": 131,
    "title": "Design Considerations",
    "sub": "Service Discovery & Load Balancing, Monitoring & Observability",
    "color": "#FF6B35",
    "level": "mid",
    "concepts": [
      {
        "title": "Service Discovery & Load Balancing",
        "list": [
          "Service Discovery: Register/deregister service instances dynamically (Consul, Eureka)",
          "Load Balancing: Distribute traffic across instances (round-robin, least-connections)",
          "Health Checks: Periodic health endpoints, remove unhealthy instances"
        ]
      },
      {
        "title": "Monitoring & Observability",
        "list": [
          "Logging: Centralized logs (ELK, Datadog) with correlation IDs across services",
          "Metrics: Response time, error rate, throughput per service",
          "Distributed Tracing: Follow a request through all services (Jaeger, Zipkin)"
        ]
      }
    ]
  },
  {
    "id": 132,
    "title": "Rendering Strategies",
    "sub": "SSR vs SSG vs ISR, App Router & Server Components",
    "color": "#e5e5e5",
    "level": "mid",
    "concepts": [
      {
        "title": "SSR vs SSG vs ISR",
        "list": [
          "SSR (Server-Side Rendering): Render on every request. Fresh data always, no caching. Slower but SEO-friendly.",
          "SSG (Static Site Generation): Render at build time. Ultra-fast, cacheable on CDN. Data doesn't change often.",
          "ISR (Incremental Static Regeneration): Serve cached page, regenerate in background after timeout. Best of both.",
          "CSR (Client-Side Rendering): Traditional React. Fast interactivity, but poor SEO, no initial HTML."
        ],
        "code": "// SSR — render per request\nexport async function getServerSideProps() {\n  const data = await fetch('...');\n  return { props: { data }, revalidate: 10 };\n}\n\n// SSG — render at build time\nexport async function getStaticProps() {\n  const data = await fetch('...');\n  return { props: { data }, revalidate: 3600 };  // ISR: refresh after 1hr\n}\n\nexport async function getStaticPaths() {\n  const ids = await fetchIds();\n  return {\n    paths: ids.map(id =&gt; ({ params: { id } })),\n    fallback: 'blocking',  // 404 if not in list\n  };\n}"
      },
      {
        "title": "App Router & Server Components",
        "list": [
          "Server Components: Run only on server. No hooks, events, or browser APIs. Smaller bundle.",
          "Client Components: Marked with \"use client\". Full interactivity, hooks, events.",
          "Streaming: Send HTML chunks as they render. Users see content sooner.",
          "Suspense: Pause rendering for async data. Show fallback UI while loading."
        ],
        "code": "// app/page.tsx (Server Component by default)\nasync function HomePage() {\n  const data = await fetch('...', { cache: 'no-store' });\n  return &lt;div&gt;{data.title}&lt;/div&gt;;\n}\n\n// app/components/Counter.tsx (Client Component)\n'use client';\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return &lt;button onClick={() =&gt; setCount(c =&gt; c + 1)}&gt;{count}&lt;/button&gt;;\n}\n\n// Combine them\nimport { Counter } from './Counter';\nexport default function App() {\n  return (\n    &lt;div&gt;\n      &lt;HomePage /&gt;\n      &lt;Counter /&gt;\n    &lt;/div&gt;\n  );\n}"
      }
    ]
  },
  {
    "id": 133,
    "title": "Data Fetching & Caching",
    "sub": "Next.js Caching Layers, Suspense & Streaming",
    "color": "#e5e5e5",
    "level": "mid",
    "concepts": [
      {
        "title": "Next.js Caching Layers",
        "list": [
          "cache: \"no-store\" — fetch fresh data every request",
          "cache: \"force-cache\" — cache indefinitely",
          "revalidate: 3600 — cache for 1 hour, then regenerate",
          "revalidatePath(\"/page\") — manually invalidate a route",
          "revalidateTag(\"tag-name\") — invalidate by tag"
        ],
        "code": "// Fresh data every request\nconst data = await fetch('...', { cache: 'no-store' });\n\n// Cached for 1 hour (ISR)\nconst data = await fetch('...', {\n  next: { revalidate: 3600 },\n});\n\n// Cached indefinitely\nconst data = await fetch('...', {\n  cache: 'force-cache',\n});\n\n// Dynamic route with ISR\nexport const revalidate = 3600;\n\nexport async function generateStaticParams() {\n  return [{ id: '1' }, { id: '2' }];\n}\n\nexport default async function PostPage({ params }) {\n  const post = await fetch(`/api/posts/${params.id}`);\n  return &lt;div&gt;{post.title}&lt;/div&gt;;\n}"
      },
      {
        "title": "Suspense & Streaming",
        "list": [
          "Suspense: Show fallback while data loads",
          "Streaming: Send HTML in chunks as it renders",
          "loading.tsx: Automatic loading UI for a route",
          "error.tsx: Error boundary for a route"
        ],
        "code": "// app/posts/page.tsx\nimport { Suspense } from 'react';\n\nfunction PostSkeleton() {\n  return &lt;div className=\"skeleton\"&gt;Loading...&lt;/div&gt;;\n}\n\nasync function PostList() {\n  const posts = await fetch('...');\n  return posts.map(p =&gt; &lt;div key={p.id}&gt;{p.title}&lt;/div&gt;);\n}\n\nexport default function PostsPage() {\n  return (\n    &lt;div&gt;\n      &lt;h1&gt;Posts&lt;/h1&gt;\n      &lt;Suspense fallback={&lt;PostSkeleton /&gt;}&gt;\n        &lt;PostList /&gt;\n      &lt;/Suspense&gt;\n    &lt;/div&gt;\n  );\n}"
      }
    ]
  },
  {
    "id": 134,
    "title": "API Routes & Dynamic Routes",
    "sub": "API Route Handling",
    "color": "#e5e5e5",
    "level": "mid",
    "concepts": [
      {
        "title": "API Route Handling",
        "code": "// app/api/posts/[id]/route.ts\nimport { NextRequest, NextResponse } from 'next/server';\n\nexport async function GET(\n  request: NextRequest,\n  { params }: { params: { id: string } },\n) {\n  const post = await db.posts.find(params.id);\n  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });\n  return NextResponse.json(post);\n}\n\nexport async function PUT(\n  request: NextRequest,\n  { params }: { params: { id: string } },\n) {\n  const body = await request.json();\n  const updated = await db.posts.update(params.id, body);\n  return NextResponse.json(updated);\n}"
      }
    ]
  },
  {
    "id": 135,
    "title": "Unit & Component Testing",
    "sub": "React Testing Library Philosophy, Mocking with MSW",
    "color": "#28a745",
    "level": "mid",
    "concepts": [
      {
        "title": "React Testing Library Philosophy",
        "list": [
          "Test behavior as users experience it, not implementation details",
          "Find elements by what users see: labels, roles, text content",
          "Avoid testing internal state or component internals",
          "getBy*: Expects an immediate match, throws if not found",
          "queryBy*: Allows no match, returns null if not found",
          "findBy*: Waits asynchronously for element to appear"
        ],
        "code": "import { render, screen, waitFor } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\n\ntest('uploads a document', async () =&gt; {\n  const user = userEvent.setup();\n  render(&lt;DocumentUpload /&gt;);\n\n  // getByLabelText finds by label text\n  const input = screen.getByLabelText(/upload/i);\n  await user.upload(input, new File(['content'], 'doc.pdf'));\n\n  // getByRole finds by accessibility role\n  const button = screen.getByRole('button', { name: /submit/i });\n  await user.click(button);\n\n  // findBy waits for async result\n  const success = await screen.findByText(/uploaded successfully/i);\n  expect(success).toBeInTheDocument();\n});"
      },
      {
        "title": "Mocking with MSW",
        "list": [
          "MSW (Mock Service Worker): Intercepts network requests at the handler level",
          "Works for fetch and axios",
          "Perfect for testing without hitting real APIs",
          "Set up once in test setup file, works for all tests"
        ],
        "code": "import { setupServer } from 'msw/node';\nimport { http, HttpResponse } from 'msw';\n\nconst handlers = [\n  http.post('/api/documents', () =&gt; {\n    return HttpResponse.json({ id: '123', status: 'uploaded' });\n  }),\n  http.get('/api/documents', () =&gt; {\n    return HttpResponse.json([\n      { id: '1', title: 'Doc 1' },\n      { id: '2', title: 'Doc 2' },\n    ]);\n  }),\n];\n\nconst server = setupServer(...handlers);\n\nbeforeAll(() =&gt; server.listen());\nafterEach(() =&gt; server.resetHandlers());\nafterAll(() =&gt; server.close());"
      }
    ]
  },
  {
    "id": 136,
    "title": "End-to-End Testing",
    "sub": "Playwright Fundamentals",
    "color": "#28a745",
    "level": "mid",
    "concepts": [
      {
        "title": "Playwright Fundamentals",
        "list": [
          "Playwright: E2E testing framework. Tests real browser, real network.",
          "page.goto(url): Navigate to URL",
          "page.getByRole(role, name): Find element by role and name",
          "page.waitForSelector(): Wait for element",
          "page.fill(): Type text into input"
        ],
        "code": "import { test, expect } from '@playwright/test';\n\ntest('complete upload workflow', async ({ page }) =&gt; {\n  await page.goto('http://localhost:3000/upload');\n\n  // Find input and upload file\n  const input = await page.locator('input[type=\"file\"]');\n  await input.setInputFiles('test-doc.pdf');\n\n  // Click submit\n  await page.getByRole('button', { name: /submit/i }).click();\n\n  // Wait for success message\n  await expect(page.locator('text=uploaded')).toBeVisible();\n\n  // Verify it appears in document list\n  await page.goto('http://localhost:3000/documents');\n  await expect(page.locator('text=test-doc.pdf')).toBeVisible();\n});"
      }
    ]
  },
  {
    "id": 137,
    "title": "Jest & Unit Testing",
    "sub": "Jest Mocking",
    "color": "#28a745",
    "level": "mid",
    "concepts": [
      {
        "title": "Jest Mocking",
        "list": [
          "jest.mock(module): Replace a module with a mock",
          "jest.spyOn(): Spy on a function without replacing it",
          "jest.fn(): Create a mock function",
          "Mock API responses to test error paths"
        ],
        "code": "import { fetchUser } from './api';\n\njest.mock('./api');\n\ntest('handles API error', async () =&gt; {\n  const mockError = new Error('API failed');\n  (fetchUser as jest.Mock).mockRejectedValueOnce(mockError);\n\n  const result = await getUserData('123');\n\n  expect(result).toEqual({ error: 'API failed' });\n  expect(fetchUser).toHaveBeenCalledWith('123');\n});\n\ntest('success path', async () =&gt; {\n  (fetchUser as jest.Mock).mockResolvedValueOnce({\n    id: '123',\n    name: 'John',\n  });\n\n  const result = await getUserData('123');\n  expect(result.name).toBe('John');\n});"
      }
    ]
  },
  {
    "id": 138,
    "title": "Testing Best Practices",
    "sub": "Testing Pyramid, CI/CD Test Automation",
    "color": "#28a745",
    "level": "mid",
    "concepts": [
      {
        "title": "Testing Pyramid",
        "list": [
          "Unit Tests: Fast, many. Test functions and utils in isolation.",
          "Integration Tests: Moderate, fewer. Test feature flows.",
          "E2E Tests: Slow, few. Critical user journeys only.",
          "Keep unit tests at 60-70%, integration at 20-30%, E2E at 10%."
        ]
      },
      {
        "title": "CI/CD Test Automation",
        "list": [
          "Run linting on every PR (ESLint, Prettier)",
          "Run TypeScript check to catch type errors",
          "Run unit and integration tests (Jest, RTL)",
          "Run E2E tests on staging before deployment",
          "Add performance budget checks: fail if bundle grows >10%",
          "Accessibility checks (axe DevTools in CI)"
        ]
      }
    ]
  },
  {
    "id": 139,
    "title": "RAG Fundamentals",
    "sub": "Retrieval-Augmented Generation (RAG), Embeddings & Vector Similarity",
    "color": "#9c27b0",
    "level": "mid",
    "concepts": [
      {
        "title": "Retrieval-Augmented Generation (RAG)",
        "list": [
          "RAG: Retrieval-Augmented Generation. Grounds LLM answers in retrieved external documents.",
          "Problem it solves: LLMs hallucinate when they don't know something. RAG provides sources.",
          "Use case: Q&A over internal docs, compliance/policy engines, customer support.",
          "Flow: (1) Ingest documents, (2) Chunk and embed, (3) Store in vector DB, (4) Retrieve similar chunks, (5) Generate answer from chunks + LLM"
        ]
      },
      {
        "title": "Embeddings & Vector Similarity",
        "list": [
          "Embedding: Numerical representation of text that captures semantic meaning (e.g., 1536-dim vector)",
          "Cosine Similarity: Measure how similar two embeddings are. 1.0 = identical, 0.0 = orthogonal",
          "Vector Store: Database optimized for similarity search (Pinecone, Weaviate, pgvector)",
          "Chunking: Split documents into overlapping pieces (500 tokens with 50-token overlap is common)"
        ],
        "code": "// LangChain.js RAG pipeline\nimport { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';\nimport { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';\nimport { MemoryVectorStore } from 'langchain/vectorstores/memory';\nimport { RetrievalQAChain } from 'langchain/chains';\n\n// 1. Load documents\nconst docs = [{ pageContent: 'Policy text...', metadata: { source: 'policy.pdf', page: 1 } }];\n\n// 2. Split into chunks\nconst splitter = new RecursiveCharacterTextSplitter({\n  chunkSize: 500,\n  chunkOverlap: 50,\n});\nconst chunks = await splitter.splitDocuments(docs);\n\n// 3. Create embeddings &amp; vector store\nconst embeddings = new OpenAIEmbeddings();\nconst vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);\n\n// 4. Create retrieval chain\nconst llm = new ChatOpenAI({ temperature: 0 });\nconst chain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever({ k: 3 }), {\n  returnSourceDocuments: true,\n});\n\n// 5. Answer question\nconst result = await chain.call({\n  query: 'What is the coverage for dental?',\n});\nconsole.log('Answer:', result.text);\nconsole.log('Sources:', result.sourceDocuments);"
      }
    ]
  },
  {
    "id": 140,
    "title": "LLM Integration & Prompting",
    "sub": "Prompt Engineering Techniques, MCP (Model Context Protocol)",
    "color": "#9c27b0",
    "level": "mid",
    "concepts": [
      {
        "title": "Prompt Engineering Techniques",
        "list": [
          "Few-shot prompting: Provide 2-5 examples of desired input/output format",
          "Chain-of-thought: Ask LLM to explain reasoning step by step",
          "System prompt: Set the \"role\" for the LLM (e.g., \"You are a helpful legal advisor\")",
          "Temperature: 0 = deterministic, 1 = creative. Use 0 for Q&A, higher for creative tasks"
        ],
        "code": "// Few-shot prompting\nconst prompt = `Answer questions about insurance policies based on the provided context.\n\nExample:\nQ: Is preventive care covered?\nContext: \"Our plan covers preventive care at 100% with no copay.\"\nA: Yes, preventive care is covered at 100% with no copay.\n\nNow answer:\nQ: ${question}\nContext: ${retrievedDocs}\nA:`;\n\n// System prompt for RAG\nconst systemPrompt = `You are a helpful insurance policy assistant. Answer questions accurately using only the provided context. If the context doesn't contain the answer, say \"I don't have that information in the available documents.\"\n\nAlways cite the source document and page number.;`;"
      },
      {
        "title": "MCP (Model Context Protocol)",
        "list": [
          "MCP: Standardized way for AI systems to connect to tools, APIs, and resources",
          "Enables Claude to use your tools: Slack, GitHub, Google Drive, databases, etc.",
          "Server-client model: Your service is an MCP server, Claude is the client",
          "Use case: Agents that can take real actions (create tickets, fetch data, etc.)"
        ]
      }
    ]
  },
  {
    "id": 141,
    "title": "Production Deployment",
    "sub": "Scalable RAG Architecture, Monitoring & Evaluation",
    "color": "#9c27b0",
    "level": "mid",
    "concepts": [
      {
        "title": "Scalable RAG Architecture",
        "list": [
          "Move from MemoryVectorStore to persistent DB: Pinecone, Weaviate, pgvector",
          "Add caching layer for frequently asked questions",
          "Implement rate limiting on API endpoints",
          "Monitor response latency: retrieval time + LLM generation time",
          "Set up feedback loop: track if answers were helpful, retrain embeddings"
        ],
        "code": "// Production-ready RAG with Pinecone\nimport { PineconeStore } from '@langchain/pinecone';\nimport { Pinecone } from '@pinecone-database/pinecone';\n\nconst pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });\nconst index = pinecone.Index('insurance-docs');\n\nconst vectorStore = await PineconeStore.fromDocuments(chunks, embeddings, {\n  pineconeIndex: index,\n  namespace: 'policies-v1',\n});\n\n// With caching\nimport NodeCache from 'node-cache';\nconst cache = new NodeCache({ stdTTL: 3600 });  // 1 hour TTL\n\nasync function answerQuestion(query) {\n  const cacheKey = query.toLowerCase();\n  if (cache.has(cacheKey)) {\n    return cache.get(cacheKey);\n  }\n\n  const result = await chain.call({ query });\n  cache.set(cacheKey, result);\n  return result;\n}"
      },
      {
        "title": "Monitoring & Evaluation",
        "list": [
          "Latency: Track p50/p95/p99 response times",
          "Accuracy: Use gold-standard Q&A pairs to measure performance",
          "Hallucinations: Detect answers not grounded in retrieved docs",
          "Cost: Monitor token usage and API calls"
        ]
      }
    ]
  }
];
