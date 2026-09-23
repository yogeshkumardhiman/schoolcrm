import ActivityLog from './src/models/ActivityLog.js';

async function check() {
  const logs = await ActivityLog.findAll({
    limit: 10,
    order: [['createdAt', 'DESC']],
    attributes: ['userName', 'userRole', 'action', 'details', 'createdAt']
  });
  logs.forEach(l => console.log(`[${l.createdAt.toISOString()}] ${l.userRole} (${l.userName}): ${l.action} - ${l.details}`));
  process.exit(0);
}
check();
