import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Attach user payload to request
    next();
  });
};

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// Route: Auth Service (Public routes excluded from auth)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
  changeOrigin: true,
}));

// Protect all subsequent /api routes
app.use('/api', authenticateJWT);

// Route: Chat Service
app.use('/api/chat', createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL || 'http://localhost:8002',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Inject user ID into headers for downstream services
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-Workspace-Id', req.body.workspaceId || req.query.workspaceId);
    }
  },
}));

// Route: Knowledge Service
app.use('/api/knowledge', createProxyMiddleware({
  target: process.env.KNOWLEDGE_SERVICE_URL || 'http://localhost:8003',
  changeOrigin: true,
}));

// Route: Memory Service
app.use('/api/memory', createProxyMiddleware({
  target: process.env.MEMORY_SERVICE_URL || 'http://localhost:8004',
  changeOrigin: true,
}));

app.listen(PORT, () => {
  console.log(`Nexus API Gateway running on port ${PORT}`);
});