import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';
import { runMigrations } from './config/migrate.js';
import { initFeeReminderScheduler } from './modules/financial/feeReminderScheduler.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 💎 EMERGENCY OVERRIDE: Start listening IMMEDIATELY
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server IMMUTABLE on port ${PORT}\n`);
      console.log(`🔗 API BASE: http://127.0.0.1:${PORT}/api`);
    });

    console.log('\n📦 Running database migrations and initialization...');
    
    // Initialize migrations on startup
    sequelize.authenticate()
        .then(async () => {
            console.log('✅ Database connected');
            
            // 1. Run migrations first
            await runMigrations();
            
            // 2. Development-only safety fallback: sync schemas if not in production
            if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_DB_SYNC !== 'true') {
                console.log('⚙️ [Dev] Syncing additional dynamic schemas...');
                await sequelize.sync({ alter: true });
            } else {
                console.log('🔒 [Prod] Schema dynamic sync bypassed.');
            }
        })
        .then(async () => {
            console.log('✅ Database initialization completed successfully\n');
            
            try {
                const { Role } = await import('./models/index.js');
                const rolesToEnsure = [
                    { name: 'SUPER_ADMIN', description: 'Super Administrator' },
                    { name: 'ADMIN', description: 'Administrator' },
                    { name: 'MANAGEMENT', description: 'School Management' },
                    { name: 'TEACHER', description: 'Faculty Teacher' },
                    { name: 'ACCOUNTANT', description: 'School Accountant' },
                    { name: 'CLERK', description: 'Administrative Clerk' },
                    { name: 'PRINCIPAL', description: 'School Principal' },
                    { name: 'VICE_PRINCIPAL', description: 'School Vice Principal' }
                ];
                for (const r of rolesToEnsure) {
                    await Role.findOrCreate({
                        where: { name: r.name },
                        defaults: { description: r.description }
                    });
                }
                console.log('✅ All system roles verified in master table');
            } catch (roleErr) {
                console.error('⚠️ Warning: Failed to auto-sync system roles:', roleErr.message);
            }

            initFeeReminderScheduler();
        })
        .catch(dbErr => console.error('⚠️ Database Initialization failed:', dbErr.message));

  } catch (err) {
    console.error('\n❌ Critical Infrastructure Failure:', err);
  }
};

startServer();
// Trigger reload after enabling DB Sync in .env (Reloaded)