import 'dotenv/config';
import { Admin } from '../models/index.js';
import bcrypt from 'bcryptjs';

async function check() {
  try {
    const admin = await Admin.findByPk(1);
    if (admin) {
      console.log("Hash:", admin.password);
      console.log("Matches 'admin'?", bcrypt.compareSync('admin', admin.password));
      console.log("Matches '123456'?", bcrypt.compareSync('123456', admin.password));
      console.log("Matches 'admin123'?", bcrypt.compareSync('admin123', admin.password));
    } else {
      console.log("Admin not found");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
