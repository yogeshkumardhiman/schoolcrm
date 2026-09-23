import 'dotenv/config';
import { sequelize } from '../models/index.js';

console.log("Starting manual database sync...");
try {
  await sequelize.authenticate();
  console.log("Database connected successfully.");
  await sequelize.sync({ alter: true });
  console.log("Database synced successfully!");
  process.exit(0);
} catch (error) {
  console.error("Database sync failed:", error);
  process.exit(1);
}
