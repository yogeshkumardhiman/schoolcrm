/**
 * Bulk Data Seeder v2 — Direct SQL (no entity mismatch)
 * Run: node src/seed-bulk-direct.js
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Client({
  host: 'localhost',
  port: 5432,
  user: 'root',
  password: 'root',
  database: 'school_local',
});

// --- REALISTIC INDIAN NAMES ---
const MALE_NAMES = [
  'Aarav', 'Aakash', 'Abhinav', 'Aditya', 'Ajay', 'Akash', 'Amit', 'Amrit', 'Anand', 'Ankit',
  'Ankur', 'Anuj', 'Arjun', 'Arnav', 'Aryan', 'Ashish', 'Ayush', 'Bhavesh', 'Chirag', 'Deepak',
  'Devendra', 'Dhruv', 'Dinesh', 'Gaurav', 'Harsh'
];

const FEMALE_NAMES = [
  'Aanya', 'Aastha', 'Aisha', 'Akansha', 'Akshita', 'Anjali', 'Ankita', 'Anushka', 'Asha', 'Diya',
  'Divya', 'Garima', 'Harsha', 'Ishika', 'Janhvi', 'Kavita', 'Khushi', 'Kratika', 'Lata', 'Lavanya',
  'Mansi', 'Meera', 'Nandini', 'Neha', 'Nidhi'
];

const SURNAMES = [
  'Sharma', 'Gupta', 'Verma', 'Singh', 'Kumar', 'Yadav', 'Mishra', 'Pandey', 'Joshi', 'Chauhan',
  'Rao', 'Patel', 'Shah', 'Mehta', 'Jain', 'Agarwal', 'Srivastava', 'Tiwari', 'Tripathi', 'Dubey',
  'Saxena', 'Malhotra', 'Kapoor', 'Nair', 'Rathore', 'Bhatt', 'Kohli', 'Rastogi', 'Batra', 'Arora'
];

const FATHER_NAMES = [
  'Ramesh Sharma', 'Suresh Gupta', 'Mahesh Verma', 'Vijay Singh', 'Rajesh Kumar',
  'Dinesh Yadav', 'Naresh Mishra', 'Kishore Pandey', 'Ganesh Joshi', 'Mukesh Chauhan',
  'Devesh Rao', 'Hitesh Patel', 'Sanjay Shah', 'Vinay Mehta', 'Ajay Jain',
  'Ashok Agarwal', 'Rakesh Srivastava', 'Pravesh Tiwari', 'Balesh Tripathi', 'Umesh Dubey',
  'Pradeep Saxena', 'Kamlesh Malhotra', 'Brijesh Kapoor', 'Sunil Nair', 'Ramchandra Rathore',
  'Girish Bhatt', 'Harish Kohli', 'Prakash Rastogi', 'Satish Batra', 'Deepak Arora'
];

const TEACHER_DATA = [
  { name: 'Rajendra Sharma', designation: 'Senior Mathematics Lecturer', subject: 'Mathematics', gender: 'MALE' },
  { name: 'Sunita Gupta', designation: 'Science Faculty', subject: 'General Science', gender: 'FEMALE' },
  { name: 'Manoj Verma', designation: 'English Language Teacher', subject: 'English', gender: 'MALE' },
  { name: 'Priya Singh', designation: 'Hindi Literature Teacher', subject: 'Hindi', gender: 'FEMALE' },
  { name: 'Vinod Kumar', designation: 'Social Studies Educator', subject: 'Social Studies', gender: 'MALE' },
  { name: 'Kavita Yadav', designation: 'Computer Science Faculty', subject: 'Computer Science', gender: 'FEMALE' },
  { name: 'Suresh Mishra', designation: 'Physical Education Coach', subject: 'Physical Education', gender: 'MALE' },
  { name: 'Anita Pandey', designation: 'Art & Craft Teacher', subject: 'Art & Craft', gender: 'FEMALE' },
  { name: 'Ramesh Joshi', designation: 'Sanskrit Teacher', subject: 'Sanskrit', gender: 'MALE' },
  { name: 'Deepa Chauhan', designation: 'Biology Lab Incharge', subject: 'Biology', gender: 'FEMALE' },
  { name: 'Harendra Rao', designation: 'Chemistry Faculty', subject: 'Chemistry', gender: 'MALE' },
  { name: 'Suman Patel', designation: 'Physics Teacher', subject: 'Physics', gender: 'FEMALE' },
  { name: 'Pramod Shah', designation: 'Geography & History Educator', subject: 'Social Science', gender: 'MALE' },
  { name: 'Ritu Mehta', designation: 'Economics Faculty', subject: 'Economics', gender: 'FEMALE' },
  { name: 'Narendra Jain', designation: 'Commerce Teacher', subject: 'Commerce', gender: 'MALE' },
  { name: 'Kiran Agarwal', designation: 'Primary Class Incharge', subject: 'EVS', gender: 'FEMALE' },
  { name: 'Mahesh Srivastava', designation: 'Special Education Teacher', subject: 'Special Education', gender: 'MALE' },
  { name: 'Pooja Tiwari', designation: 'Drawing Teacher', subject: 'Fine Arts', gender: 'FEMALE' },
  { name: 'Birendra Tripathi', designation: 'Music Faculty', subject: 'Music', gender: 'MALE' },
  { name: 'Meena Dubey', designation: 'Vice Principal', subject: 'Administration', gender: 'FEMALE' },
];

const CLASSES = [
  'NURSERY', 'LKG', 'UKG',
  '1ST', '2ND', '3RD', '4TH', '5TH',
  '6TH', '7TH', '8TH', '9TH', '10TH'
];

const CLASS_CODE = {
  'NURSERY': 'NUR', 'LKG': 'LKG', 'UKG': 'UKG',
  '1ST': '1ST', '2ND': '2ND', '3RD': '3RD', '4TH': '4TH', '5TH': '5TH',
  '6TH': '6TH', '7TH': '7TH', '8TH': '8TH', '9TH': '9TH', '10TH': '10TH',
};

const AGE_MAP = {
  'NURSERY': [3, 4], 'LKG': [4, 5], 'UKG': [5, 6],
  '1ST': [6, 7], '2ND': [7, 8], '3RD': [8, 9], '4TH': [9, 10], '5TH': [10, 11],
  '6TH': [11, 12], '7TH': [12, 13], '8TH': [13, 14], '9TH': [14, 15], '10TH': [15, 16],
};

function pick(arr, idx) { return arr[idx % arr.length]; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function phone() {
  const px = ['98', '97', '96', '95', '94', '93', '90', '89', '88', '87'];
  return `${pick(px, rand(0,9))}${String(rand(10000000, 99999999))}`;
}
function dob(minAge, maxAge) {
  const yr = new Date().getFullYear() - rand(minAge, maxAge);
  const mo = String(rand(1,12)).padStart(2,'0');
  const dy = String(rand(1,28)).padStart(2,'0');
  return `${yr}-${mo}-${dy}`;
}

async function main() {
  await db.connect();
  console.log('\n🚀 Bulk Seeder v2 (Direct SQL) Starting...\n');
  console.log('📡 Connected to PostgreSQL\n');

  const year = new Date().getFullYear().toString().slice(2);

  // Get school prefix
  const siRes = await db.query(`SELECT "domainPrefix", "schoolName" FROM school_info LIMIT 1`).catch(() => ({ rows: [] }));
  const si = siRes.rows[0];
  const prefix = (si?.domainPrefix || si?.schoolName?.replace(/[^a-zA-Z]/g,'').slice(0,3) || 'RPS').toUpperCase();
  console.log(`🏫 School Prefix: ${prefix}\n`);

  // ========== 20 TEACHERS ==========
  console.log('👨‍🏫 Seeding 20 Teachers...');
  let teacherCount = 0;

  for (let i = 0; i < TEACHER_DATA.length; i++) {
    const t = TEACHER_DATA[i];
    const loginId = `TCH${year}${String(i+1).padStart(3,'0')}`;

    // Check if already exists
    const exists = await db.query(`SELECT id FROM "Staffs" WHERE "loginId" = $1`, [loginId]).catch(async () => {
      // loginId column might not exist
      return { rows: [] };
    });

    if (exists.rows.length > 0) {
      console.log(`  ⚠️  Already exists: ${t.name} (${loginId})`);
      continue;
    }

    const hashedPwd = bcrypt.hashSync('teacher123', 10);
    const teacherDob = dob(28, 50);
    const teacherPhone = phone();

    // Check available columns in Staffs
    const staffResult = await db.query(
      `INSERT INTO "Staffs" (name, role, designation, subject, gender, phone, email, password, dob)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [t.name, 'TEACHER', t.designation, t.subject, t.gender, teacherPhone,
       `${t.name.toLowerCase().replace(/\s+/g,'.')}@school.edu`, hashedPwd, teacherDob]
    );

    if (staffResult.rows.length > 0) {
      teacherCount++;
      console.log(`  ✅ ${teacherCount}/20: ${t.name} | ${t.designation}`);
    }
  }

  console.log(`\n✅ Teachers seeded: ${teacherCount}\n`);

  // ========== 50 STUDENTS PER CLASS ==========
  console.log('👨‍🎓 Seeding 50 Students per class (25 Section A + 25 Section B)...\n');
  let totalStudents = 0;

  for (const cls of CLASSES) {
    const code = CLASS_CODE[cls];
    const [minAge, maxAge] = AGE_MAP[cls];

    // Get current count for this class for admission number sequencing
    const countRes = await db.query(`SELECT COUNT(*) FROM "Students" WHERE class = $1`, [cls]);
    let baseCount = parseInt(countRes.rows[0].count, 10);

    let classSeeded = 0;
    const allNames = [];

    // Generate 25 male + 25 female names for this class
    for (let i = 0; i < 25; i++) {
      allNames.push({ firstName: pick(MALE_NAMES, i), gender: 'MALE' });
    }
    for (let i = 0; i < 25; i++) {
      allNames.push({ firstName: pick(FEMALE_NAMES, i), gender: 'FEMALE' });
    }

    // Sort alphabetically for proper roll numbers
    allNames.sort((a, b) => a.firstName.localeCompare(b.firstName));

    for (let i = 0; i < allNames.length; i++) {
      const { firstName, gender } = allNames[i];
      const surname = pick(SURNAMES, i);
      const fullName = `${firstName} ${surname}`;
      const fatherName = pick(FATHER_NAMES, i);
      const section = null;
      const rollNo = null;
      const studentDob = dob(minAge, maxAge);
      const admissionNo = `${prefix}${year}${code}${String(baseCount + i + 1).padStart(3, '0')}`;
      const hashedPwd = bcrypt.hashSync(studentDob.replace(/-/g,''), 10);
      const studentPhone = phone();

      const result = await db.query(
        `INSERT INTO "Students" (name, "firstName", "lastName", class, section, "rollNo", gender, dob, "fatherName", phone, "admissionNo", password, "feesStatus", religion, "transportOpted", session)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [fullName, firstName, surname, cls, section, rollNo, gender, studentDob, fatherName,
         studentPhone, admissionNo, hashedPwd, 'PENDING', 'HINDU',
         i % 5 === 0, '2026-2027']
      );

      if (result.rows.length > 0) {
        classSeeded++;
        totalStudents++;
      }
    }

    console.log(`  ✅ Class ${cls.padEnd(7)}: ${classSeeded} students added`);
  }

  // ========== SUMMARY ==========
  const totalStudentsInDb = await db.query(`SELECT COUNT(*) FROM "Students"`);
  const totalStaffInDb = await db.query(`SELECT COUNT(*) FROM "Staffs"`);

  console.log('\n\n===========================================');
  console.log('🎉  BULK SEEDING COMPLETE!');
  console.log('===========================================');
  console.log(`  👨‍🎓  Students in DB   : ${totalStudentsInDb.rows[0].count}`);
  console.log(`  👨‍🏫  Staff/Teachers   : ${totalStaffInDb.rows[0].count}`);
  console.log(`  📚  Classes Covered : ${CLASSES.length} (${CLASSES.join(', ')})`);
  console.log(`  🆕  Students Added  : ${totalStudents}`);
  console.log(`  👔  Teachers Added  : ${teacherCount}`);
  console.log('===========================================\n');

  await db.end();
}

main().catch(err => {
  console.error('\n❌ SEEDER FAILED:', err.message);
  console.error(err);
  process.exit(1);
});
