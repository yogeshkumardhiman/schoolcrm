import { Student } from './src/models/index.js';
import { Op } from 'sequelize';

async function check() {
  const students = await Student.findAll({ attributes: ['id', 'name', 'class', 'section', 'deviceToken'] });
  const withToken = students.filter(s => s.deviceToken);
  console.log("Students with tokens:", withToken.length);
  if (withToken.length > 0) {
    withToken.forEach(s => console.log(`- ${s.name}: ${s.deviceToken.substring(0, 15)}...`));
  }
  process.exit(0);
}
check();
