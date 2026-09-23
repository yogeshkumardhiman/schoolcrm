import { Staff } from './src/models/index.js';
import bcrypt from 'bcryptjs';
import schoolConfig from '../common/utils/schoolConfig.js';

async function run() {
  try {
    const clerkEmail = `clerk@${schoolConfig.institution.emailDomain || 'sdm.com'}`;
    const existing = await Staff.findOne({ where: { email: clerkEmail } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Staff.create({
        name: 'Accounts Department',
        email: clerkEmail,
        phone: '9876543210',
        role: 'ACCOUNTANT',
        password: hashedPassword,
        designation: 'Head Clerk',
        gender: 'MALE',
        department: 'Administration',
        permissions: ['read', 'manage']
      });
      console.log(`Clerk (${clerkEmail}) created successfully`);
    } else {
      console.log(`Clerk (${clerkEmail}) already exists`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
