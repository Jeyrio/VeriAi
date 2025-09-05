import { Router } from 'express';
import aiRoutes from './ai';
import verificationRoutes from './verification';
import nftRoutes from './nft';
import fdcRoutes from './fdc';
import authRoutes from './auth';
import userRoutes from './user';

const router = Router();

// API versioning
const v1Router = Router();

// Mount route modules
v1Router.use('/ai', aiRoutes);
v1Router.use('/verification', verificationRoutes);
v1Router.use('/nft', nftRoutes);
v1Router.use('/fdc', fdcRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/user', userRoutes);

// Mount versioned router
router.use('/v1', v1Router);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'VeriAI API',
    version: '1.0.0',
    description: 'AI Content Verification with Flare FDC',
    endpoints: {
      ai: '/api/v1/ai',
      verification: '/api/v1/verification',
      nft: '/api/v1/nft',
      fdc: '/api/v1/fdc',
      auth: '/api/v1/auth',
      user: '/api/v1/user',
    },
    documentation: 'https://docs.veriai.app',
    status: 'operational',
  });
});

export default router;
