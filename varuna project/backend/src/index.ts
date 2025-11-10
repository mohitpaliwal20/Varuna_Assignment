import dotenv from 'dotenv';
import { createApp } from './infrastructure/server/app';
import { Container } from './infrastructure/server/container';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Initialize dependency injection container
const container = new Container();

// Create Express app with wired dependencies
const app = createApp(
  container.getRoutesController(),
  container.getComplianceController(),
  container.getBankingController(),
  container.getPoolsController()
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Fuel EU Maritime API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await container.cleanup();
      console.log('Cleanup completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during cleanup:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { app };
