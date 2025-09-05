import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VeriAI Backend API',
      version: '1.0.0',
      description: 'AI Content Verification with Flare Data Connector',
      contact: {
        name: 'VeriAI Team',
        email: 'team@veriai.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.veriai.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid input provided',
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        VerificationRequest: {
          type: 'object',
          required: ['prompt', 'output', 'model', 'userAddress'],
          properties: {
            prompt: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example: 'Write a poem about blockchain technology',
            },
            output: {
              type: 'string',
              minLength: 1,
              maxLength: 10000,
              example: 'Blockchain, a chain of trust...',
            },
            model: {
              type: 'string',
              enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-3-haiku'],
              example: 'gpt-4',
            },
            userAddress: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            outputHash: {
              type: 'string',
              example: 'abc123def456...',
            },
            signature: {
              type: 'string',
              example: '0x123abc...',
            },
          },
        },
        Verification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'ver_1234567890_abc123',
            },
            prompt: {
              type: 'string',
              example: 'Write a poem about blockchain technology',
            },
            output: {
              type: 'string',
              example: 'Blockchain, a chain of trust...',
            },
            model: {
              type: 'string',
              example: 'gpt-4',
            },
            outputHash: {
              type: 'string',
              example: 'abc123def456...',
            },
            userAddress: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'challenged', 'rejected'],
              example: 'verified',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00Z',
            },
            verifiedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:35:00Z',
            },
            attestationId: {
              type: 'string',
              example: 'att_987654321_def456',
            },
            metadata: {
              type: 'object',
              properties: {
                nftTokenId: {
                  type: 'string',
                  example: '123',
                },
                nftTransactionHash: {
                  type: 'string',
                  example: '0xabc123...',
                },
              },
            },
          },
        },
        AIGeneration: {
          type: 'object',
          required: ['prompt', 'model', 'userAddress'],
          properties: {
            prompt: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example: 'Write a short story about AI',
            },
            model: {
              type: 'string',
              enum: ['gpt-4', 'gpt-3.5-turbo', 'gemini-pro'],
              example: 'gpt-4',
            },
            userAddress: {
              type: 'string',
              pattern: '^0x[a-fA-F0-9]{40}$',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            temperature: {
              type: 'number',
              minimum: 0,
              maximum: 2,
              example: 0.7,
            },
            maxTokens: {
              type: 'integer',
              minimum: 1,
              maximum: 4000,
              example: 1000,
            },
          },
        },
        GenerationResult: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            prompt: {
              type: 'string',
              example: 'Write a short story about AI',
            },
            output: {
              type: 'string',
              example: 'Once upon a time, in a world where AI...',
            },
            model: {
              type: 'string',
              example: 'gpt-4',
            },
            outputHash: {
              type: 'string',
              example: 'abc123def456789...',
            },
            userAddress: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              example: 'completed',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00Z',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:31:00Z',
            },
            metadata: {
              type: 'object',
              properties: {
                temperature: {
                  type: 'number',
                  example: 0.7,
                },
                maxTokens: {
                  type: 'integer',
                  example: 1000,
                },
                usage: {
                  type: 'object',
                  properties: {
                    promptTokens: {
                      type: 'integer',
                      example: 50,
                    },
                    completionTokens: {
                      type: 'integer',
                      example: 200,
                    },
                    totalTokens: {
                      type: 'integer',
                      example: 250,
                    },
                  },
                },
              },
            },
          },
        },
        Challenge: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'chg_1234567890_abc123',
            },
            verificationId: {
              type: 'string',
              example: 'ver_1234567890_def456',
            },
            challengerAddress: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            reason: {
              type: 'string',
              example: 'Incorrect AI output verification',
            },
            evidence: {
              type: 'object',
              example: { files: [], description: 'Technical analysis attached' },
            },
            status: {
              type: 'string',
              enum: ['pending', 'under_review', 'upheld', 'rejected'],
              example: 'pending',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00Z',
            },
          },
        },
        NFT: {
          type: 'object',
          properties: {
            tokenId: {
              type: 'string',
              example: '123',
            },
            owner: {
              type: 'string',
              example: '0x742d35Cc6634C0532925a3b8D5c226dEB6323BCC',
            },
            prompt: {
              type: 'string',
              example: 'Write a poem about blockchain',
            },
            output: {
              type: 'string',
              example: 'Blockchain, a chain of trust...',
            },
            model: {
              type: 'string',
              example: 'gpt-4',
            },
            verificationId: {
              type: 'string',
              example: 'ver_1234567890_abc123',
            },
            metadataURI: {
              type: 'string',
              example: 'data:application/json;base64,eyJ0aXRsZSI6Li4u',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-01-15T10:30:00Z',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication and user management endpoints',
      },
      {
        name: 'User',
        description: 'User data and statistics endpoints',
      },
      {
        name: 'AI',
        description: 'AI content generation endpoints',
      },
      {
        name: 'Verification',
        description: 'Content verification and attestation endpoints',
      },
      {
        name: 'NFT',
        description: 'NFT minting and collection management endpoints',
      },
      {
        name: 'FDC',
        description: 'Flare Data Connector attestation endpoints',
      },
      {
        name: 'Health',
        description: 'System health and monitoring endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

export function setupSwagger(app: Express): void {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'VeriAI API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));

  // Serve raw swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs };