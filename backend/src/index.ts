import dotenv from 'dotenv';
dotenv.config();

import { createApp } from "./app.js";
import { config } from "./config.js";

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});


const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Auth API running on http://0.0.0.0:${config.port}`);
});
