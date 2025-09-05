// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { logger } from '@/utils/logger';
import { ContractService } from '@/services/ContractService';
import { DatabaseService } from '@/services/DatabaseService';
import { setupSwagger } from '@/config/swagger';
import apiRoutes from '@/routes';

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'https://veri-ai.vercel.app'
    ],
    credentials: true,
  },
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  socket.on('subscribe-verification', (verificationId: string) => {
    socket.join(`verification-${verificationId}`);
    logger.info('Client subscribed to verification updates', { 
      socketId: socket.id, 
      verificationId 
    });
  });

  socket.on('unsubscribe-verification', (verificationId: string) => {
    socket.leave(`verification-${verificationId}`);
    logger.info('Client unsubscribed from verification updates', { 
      socketId: socket.id, 
      verificationId 
    });
  });

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });
});

// Make io available globally for services
declare global {
  var io: SocketIOServer;
}
global.io = io;

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'https://veri-ai.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: 'healthy'
 *                 timestamp:
 *                   type: string
 *                   format: 'date-time'
 *                   example: '2025-01-15T10:30:00Z'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 *                 environment:
 *                   type: string
 *                   example: 'development'
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Swagger documentation
setupSwagger(app);

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize services
async function initializeServices() {
  try {
    // Initialize database connection
    const db = new DatabaseService();
    await db.connect();
    logger.info('✅ Database connected successfully');

    // Initialize contract service and event listeners
    if (process.env.PRIVATE_KEY && process.env.VERI_AI_CONTRACT_ADDRESS) {
      const contractService = new ContractService();
      contractService.setupEventListeners();
      logger.info('✅ Contract service initialized and event listeners set up');
    } else {
      logger.warn('⚠️ Contract service not initialized - missing environment variables');
    }
  } catch (error) {
    logger.error('❌ Failed to initialize services', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, async () => {
  logger.info(`🚀 VeriAI Backend Server started on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS Origins: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
  
  // Initialize services after server starts
  await initializeServices();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
