import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { Student, sequelize } from './src/models/index.js';

async function check() {
  try {
    await sequelize.authenticate();
    
    const students = await Student.findAll({
      limit: 5,
      order: [['admissionNo', 'ASC']]
    });
    
    console.log('\n======================================================');
    console.log('🎓 SAMPLE STUDENT LOGIN CREDENTIALS FOR TESTING');
    console.log('======================================================');
    students.forEach((s, idx) => {
      // Clean DOB to DDMMYYYY format
      const dobParts = s.dob.split('-');
      const dobPassword = `${dobParts[2]}${dobParts[1]}${dobParts[0]}`;
      
      console.log(`\nStudent #${idx + 1}:`);
      console.log(` - Name: ${s.name}`);
      console.log(` - Class: ${s.class}`);
      console.log(` - Section: ${s.section}`);
      console.log(` - Admission ID (Login ID): ${s.admissionNo}`);
      console.log(` - Date of Birth (DOB): ${s.dob}`);
      console.log(` - DOB Password (Password): ${dobPassword}`);
    });
    console.log('======================================================\n');

  } catch (e) {
    console.error('Error fetching sample students:', e);
  } finally {
    await sequelize.close();
  }
}

check();
