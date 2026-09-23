import { broadcastFCM } from '../modules/notifications/notificationEngine.js';
import { Student } from './src/models/index.js';
import { Op } from 'sequelize';

async function debugFCM() {
  console.log("🔍 Starting FCM Debug Process...");
  
  // 1. Fetch tokens
  const students = await Student.findAll({ 
      where: { deviceToken: { [Op.not]: null } },
      attributes: ['id', 'name', 'class', 'section', 'deviceToken'] 
  });
  
  if (students.length === 0) {
      console.log("❌ ERROR: No students have a device token in the database.");
      console.log("    => If you logged into the app, the token sync failed.");
      process.exit(1);
  }

  console.log(`✅ Found ${students.length} students with device tokens.`);
  
  // Take the first student
  const student = students[0];
  console.log(`📱 Target Student: ${student.name} (Class ${student.class})`);
  console.log(`🔑 Token (first 20 chars): ${student.deviceToken.substring(0, 20)}...`);

  // 2. Send test push notification
  console.log("\n🚀 Dispatching test notification to Firebase...");
  const result = await broadcastFCM({
      tokens: [student.deviceToken],
      title: "Test from Server",
      body: "This is a test to verify FCM delivery when the app is closed.",
      noticeId: "debug-999"
  });
  
  console.log("\n📊 FIREBASE SERVER RESPONSE:");
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.response.failureCount > 0) {
      console.log("\n❌ FIREBASE ERROR DETAILS:");
      result.response.responses.forEach((res, idx) => {
          if (!res.success) {
              console.log(`   Error for token ${idx}:`, res.error.message);
              console.log(`   Code:`, res.error.code);
          }
      });
  }

  process.exit(0);
}

debugFCM();
