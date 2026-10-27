import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req: Request, _res: Response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api', apiRouter);

// Root health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Red Hill Infra • Real Estate Developer CRM API',
    version: '1.0.0',
    status: 'online',
    port: PORT,
    endpoints: [
      '/api/leads',
      '/api/calls',
      '/api/site-visits',
      '/api/documents',
      '/api/stats',
      '/api/connection',
    ],
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Red Hill Infra CRM Backend Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`⚡ API: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});

export default app;
