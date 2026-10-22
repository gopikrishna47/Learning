import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'jwt',
    tag: 'JWT',
    title: 'JWT Fundamentals',
    level: 'Beginner',
    description: 'Understand how JWTs are issued, signed, decoded, and validated in Node and React apps.',
    lessons: [
      {
        title: 'What is a JWT?',
        body:
          'A JWT is a compact token that carries claims in a self-contained way. It is commonly used for authentication and authorization without storing session data on the server.',
        code: `const payload = { sub: 'user_42', role: 'admin' };
const token = jwt.sign(payload, secretKey);`,
      },
      {
        title: 'Token structure',
        body:
          'A JWT has three parts: header, payload, and signature. The payload usually contains identity and expiration information.',
        code: `Header: { alg: 'HS256', typ: 'JWT' }
Payload: { sub: 'user_42', exp: 1716000000 }
Signature: HMAC(secret, base64(header) + '.' + base64(payload))`,
      },
      {
        title: 'Server verification',
        body:
          'During verification, the server checks the signature and expiration before trusting the token. This prevents tampered or outdated credentials from being accepted.',
        code: `jwt.verify(token, secretKey, (err, decoded) => {
  if (err) return res.status(401).json({ message: 'Invalid token' });
  req.user = decoded;
});`,
      },
      {
        title: 'JWT in Node login flow',
        body:
          'A login route can hash the password, validate it, and issue a signed token that the client stores and sends later.',
        code: `app.post('/auth/login', async (req, res) => {
  const user = await findUser(req.body.email);
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Wrong password' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  res.json({ token });
});`,
      },
      {
        title: 'JWT with RSA signing',
        body:
          'Asymmetric signing uses a private key to sign tokens and a public key to verify them, which is common in distributed systems.',
        code: `const token = jwt.sign({ userId: 'user_42' }, privateKey, { algorithm: 'RS256', expiresIn: '15m' });
const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });`,
      },
    ],
  },
  {
    id: 'oauth',
    tag: 'OAuth',
    title: 'OAuth Basics',
    level: 'Intermediate',
    description: 'Learn how OAuth lets users sign in through trusted providers such as Google or GitHub.',
    lessons: [
      {
        title: 'Why OAuth is used',
        body:
          'OAuth lets a user authorize one app to access resources on another service without sharing the password. It is widely used for third-party login.',
        code: `// User clicks "Continue with Google"
// Google authenticates the user and sends an authorization code`,
      },
      {
        title: 'Google strategy',
        body:
          'Passport.js makes integrating Google auth simple by handling the redirect flow and user profile exchange.',
        code: `passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}));`,
      },
      {
        title: 'GitHub strategy',
        body:
          'GitHub OAuth follows the same pattern, but with GitHub-specific scopes and callback routes.',
        code: `router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));`,
      },
      {
        title: 'Callback route flow',
        body:
          'After the provider returns, the app exchanges the code or profile and creates a local session or token.',
        code: `router.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  res.json({ user: req.user });
});`,
      },
    ],
  },
  {
    id: 'node',
    tag: 'Node.js',
    title: 'Node Auth Server',
    level: 'Intermediate',
    description: 'See a practical Express server that handles register, login, protected routes, and middleware.',
    lessons: [
      {
        title: 'Register and login flow',
        body:
          'A basic auth server hashes passwords, issues access tokens, and protects private endpoints using middleware.',
        code: `app.post('/auth/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  users.push({ email: req.body.email, password: hash });
  res.status(201).json({ message: 'Account created' });
});`,
      },
      {
        title: 'Protected route middleware',
        body:
          'Middleware checks the JWT before allowing access to sensitive routes. This is the core of route-level protection.',
        code: `function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}`,
      },
      {
        title: 'Role-based access',
        body:
          'You can extend the middleware to allow only admins or moderators to hit specific routes.',
        code: `app.delete('/api/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'User deleted' });
});`,
      },
      {
        title: 'Refresh token flow',
        body:
          'Short-lived access tokens paired with refresh tokens keep the session secure without forcing the user to log in constantly.',
        code: `app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const newAccessToken = generateAccessToken(req.user.id);
  res.json({ accessToken: newAccessToken });
});`,
      },
    ],
  },
  {
    id: 'react',
    tag: 'React',
    title: 'React Auth Patterns',
    level: 'Intermediate',
    description: 'Apply auth state in React using context, interceptors, and guarded routes.',
    lessons: [
      {
        title: 'Auth context',
        body:
          'Use React context to expose login, logout, and user state to the rest of the app without prop drilling.',
        code: `const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}`,
      },
      {
        title: 'Protected routes',
        body:
          'Route wrappers make it easy to redirect unauthenticated users away from private pages.',
        code: `function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <Navigate to="/login" />;
}`,
      },
      {
        title: 'Axios interceptors',
        body:
          'Interceptors let your app attach access tokens automatically to every request and refresh them when needed.',
        code: `api.interceptors.request.use((config) => {
  config.headers.Authorization = \`Bearer \${accessToken}\`;
  return config;
});`,
      },
      {
        title: 'Token storage',
        body:
          'Access tokens are often kept in memory or secure storage, while long-lived refresh tokens may be stored in cookies.',
        code: `localStorage.setItem('token', accessToken);
document.cookie = 'refreshToken=abc123; path=/; HttpOnly';`,
      },
    ],
  },
  {
    id: 'security',
    tag: 'Security',
    title: 'Security Best Practices',
    level: 'Advanced',
    description: 'Protect your app with secure headers, rate limiting, cookies, and refresh token handling.',
    lessons: [
      {
        title: 'HTTP security headers',
        body:
          'Helmet adds a solid layer of default protection by setting important security headers for your Express app.',
        code: `app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));`,
      },
      {
        title: 'Rate limiting',
        body:
          'Protect login and registration endpoints from brute-force attacks by limiting repeated requests from the same IP.',
        code: `const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/auth/login', loginLimiter);`,
      },
      {
        title: 'Cookie security',
        body:
          'Cookies used for refresh tokens should be HttpOnly, Secure, and SameSite-aware to reduce theft and CSRF risks.',
        code: `res.cookie('refreshToken', token, { httpOnly: true, secure: true, sameSite: 'lax' });`,
      },
      {
        title: 'Refresh tokens',
        body:
          'Refresh tokens help keep access tokens short-lived while allowing the user to stay signed in safely.',
        code: `// Access token: short-lived
// Refresh token: longer-lived and stored securely
// Use rotation and revocation in production`,
      },
    ],
  },
];

export default function AuthMasterclass() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const activeSection = useMemo(() => sections.find((section) => section.id === activeId) ?? sections[0], [activeId]);

  return (
    <div className="auth-masterclass-page">
      <aside className="auth-masterclass-sidebar">
        <div className="auth-masterclass-brand">
          <div className="auth-masterclass-brand-badge">🔐</div>
          <div>
            <h2>Auth Masterclass</h2>
            <p>JWT • OAuth • Node/React security</p>
          </div>
        </div>

        <nav className="auth-masterclass-nav" aria-label="Auth topics">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`auth-masterclass-nav-item ${activeId === section.id ? 'active' : ''}`}
              onClick={() => setActiveId(section.id)}
              type="button"
            >
              <span className="auth-masterclass-nav-dot" />
              <span>{section.title}</span>
            </button>
          ))}
        </nav>

        <div className="auth-masterclass-sidebar-footer">
          <p>Includes practical snippets, secure flow patterns, and interview-ready explanations.</p>
          <Link to="/" className="auth-masterclass-back-link">
            Back to topics
          </Link>
        </div>
      </aside>

      <main className="auth-masterclass-main">
        <section className="auth-masterclass-hero">
          <div className="auth-masterclass-hero-badge">Fullstack Security Essentials</div>
          <h1>Build secure auth flows with JWT, OAuth, and React-friendly patterns.</h1>
          <p>
            This lesson page translates the attached auth guide into a clean, modern React experience with
            concise explanations and copy-ready code examples.
          </p>
          <div className="auth-masterclass-pills">
            <span>JWT</span>
            <span>OAuth</span>
            <span>Node.js</span>
            <span>React</span>
            <span>Security</span>
          </div>
        </section>

        <section className="auth-masterclass-section-card">
          <div className="auth-masterclass-section-head">
            <div>
              <p className="auth-masterclass-section-tag">{activeSection.tag}</p>
              <h2>{activeSection.title}</h2>
              <p>{activeSection.description}</p>
            </div>
            <div className="auth-masterclass-section-badge">{activeSection.level}</div>
          </div>

          <div className="auth-masterclass-grid">
            {activeSection.lessons.map((lesson) => (
              <article key={lesson.title} className="auth-masterclass-lesson-card">
                <h3>{lesson.title}</h3>
                <p>{lesson.body}</p>
                {lesson.code ? <pre className="auth-masterclass-code"><code>{lesson.code}</code></pre> : null}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
