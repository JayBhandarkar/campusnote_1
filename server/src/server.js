import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { ensureUploadDirExists } from './config/storage.js';

const startServer = async () => {
  try {
    // 1. Ensure upload storage directory is ready
    ensureUploadDirExists();

    // 2. Connect to Database
    await connectDB();

    // 3. Create HTTP server
    const server = http.createServer(app);

    server.listen(env.PORT, () => {
      console.log(`===============================================`);
      console.log(`  CampusNotes Server Running on Port: ${env.PORT}`);
      console.log(`  Environment: ${env.NODE_ENV}`);
      console.log(`  API Base URL: http://localhost:${env.PORT}/api/v1`);
      console.log(`  Client Origin: ${env.CLIENT_URL}`);
      console.log(`===============================================`);
    });

    // Handle termination gracefully
    const handleShutdown = () => {
      console.log('\n[Server] Graceful shutdown initiated...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
  } catch (error) {
    console.error(`[Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
