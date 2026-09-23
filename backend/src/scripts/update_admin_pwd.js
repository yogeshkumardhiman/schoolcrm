import 'dotenv/config';
import { Admin } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function update() {
  try {
    const admin = await Admin.findByPk(1);
    if (admin) {
      const hashed = await bcrypt.hash('admin', 10);
      await admin.update({ password: hashed });
      console.log("✅ Admin password updated to 'admin' in database!");
    } else {
      console.log("❌ Admin not found");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
update();
