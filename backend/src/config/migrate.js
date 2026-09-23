import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
    try {
        console.log('📦 [Migration] Starting database migration checks...');

        // 1. Create _Migrations meta tracking table if not exists
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS "_Migrations" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                "executedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `, { type: QueryTypes.RAW });

        // 2. Locate migrations folder
        const migrationsDir = path.join(__dirname, '../migrations');
        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }

        // 3. Scan migrations files
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.js'))
            .sort(); // Lexicographical sorting ensures chronological order

        console.log(`📦 [Migration] Scanned ${files.length} migration file(s).`);

        // 4. Fetch already executed migrations
        const executed = await sequelize.query(`
            SELECT name FROM "_Migrations";
        `, { type: QueryTypes.SELECT });
        const executedSet = new Set(executed.map(r => r.name));

        // 5. Run pending migrations
        for (const file of files) {
            if (!executedSet.has(file)) {
                console.log(`⚙️ [Migration] Executing migration: ${file}...`);
                
                // Dynamically import the ESM migration module
                const filePath = path.join(migrationsDir, file);
                const fileUrl = `file://${filePath}`;
                const migration = await import(fileUrl);
                
                if (typeof migration.up !== 'function') {
                    throw new Error(`Migration ${file} must export an 'up' function!`);
                }

                // Run 'up' action passing queryInterface and Sequelize
                const queryInterface = sequelize.getQueryInterface();
                await migration.up(queryInterface, sequelize.Sequelize);

                // Record execution
                await sequelize.query(`
                    INSERT INTO "_Migrations" (name) VALUES (:name);
                `, {
                    replacements: { name: file },
                    type: QueryTypes.INSERT
                });

                console.log(`✅ [Migration] Migration ${file} executed successfully.`);
            }
        }

        console.log('✅ [Migration] All migrations checked & fully synchronized.');
    } catch (err) {
        console.error('❌ [Migration Error] Failed to complete database migrations:', err);
        throw err;
    }
}
