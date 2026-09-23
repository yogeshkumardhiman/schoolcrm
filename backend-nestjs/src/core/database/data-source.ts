import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [join(__dirname, '/../../modules/**/*.entity.{js,ts}')],
  migrations: [join(__dirname, '/../../migrations/*.{js,ts}')],
  synchronize: false,
  logging: true,
});
