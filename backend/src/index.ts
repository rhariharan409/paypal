import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import agentsRouter from './routes/agents';
import tasksRouter from './routes/tasks';
import securityRouter from './routes/security';
import trustRouter from './routes/trust';
import governanceRouter from './routes/governance';
import paymentsRouter from './routes/payments';
import businessRouter from './routes/business';
import auditRouter from './routes/audit';
import settingsRouter from './routes/settings';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Request logging in development
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[AEGIS API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get(['/api', '/api/health'], (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    product: 'AEGIS PAY',
    version: '1.0.0',
    tagline: 'Your AI agents can make decisions. Only you control the money.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/security', securityRouter);
app.use('/api/trust', trustRouter);
app.use('/api/governance', governanceRouter);
app.use('/api/policies', governanceRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/paypal', paymentsRouter);
app.use('/api/business', businessRouter);
app.use('/api/audit', auditRouter);
app.use('/api/settings', settingsRouter);

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[AEGIS SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    reference: `ERR-${Date.now().toString().slice(-6)}`
  });
});

// Export app for serverless environments (Vercel)
export default app;
export { app };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}

if (!process.env.VERCEL && typeof require !== 'undefined' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🛡️  AEGIS PAY BACKEND RUNNING ON http://localhost:${PORT}`);
    console.log(`   "Your AI agents can make decisions. Only you control the money."`);
    console.log(`================================================================`);
  });
}
