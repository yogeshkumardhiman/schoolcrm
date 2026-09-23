import 'dotenv/config';
import sequelize from '../config/database.js';
import { sendFeeReminders } from '../modules/financial/feeReminder.service.js';

const testRun = async () => {
    try {
        console.log('====================================================');
        console.log('🧪 RUNNING FEE DUE REMINDER TESTING INTEGRATION');
        console.log('====================================================');
        
        console.log('🔌 Authenticating PostgreSQL connection...');
        await sequelize.authenticate();
        console.log('✅ Connection verified.');

        console.log('\n📣 Executing sendFeeReminders()...');
        const result = await sendFeeReminders();
        
        console.log('====================================================');
        console.log('🎉 RESULT SUMMARY:');
        console.log(JSON.stringify(result, null, 2));
        console.log('====================================================');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Testing execution failed:', error);
        process.exit(1);
    }
};

testRun();
