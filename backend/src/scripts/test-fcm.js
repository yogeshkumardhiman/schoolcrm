import { broadcastFCM } from '../modules/notifications/notificationEngine.js';
import { Student } from './src/models/index.js';
import { Op } from 'sequelize';

async function test() {
  const s = await Student.findOne({ where: { deviceToken: { [Op.not]: null } } });
  if (s) {
    console.log('Found student with token:', s.deviceToken.substring(0, 15) + '...');
    const result = await broadcastFCM({
      tokens: [s.deviceToken],
      title: 'Test App Closed',
      body: 'This is a test message to see if FCM works when closed.',
      noticeId: 999
    });
    console.log('FCM Result:', result);
  } else {
    console.log('No student with device token found. Please log in on the mobile app first to sync token.');
  }
  process.exit(0);
}
test();
