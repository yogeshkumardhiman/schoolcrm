// import { Student, Staff, FeeStructure, StudentFee, sequelize } from '../models/index.js';

// const seedPhase1 = async () => {
//     try {
//         await sequelize.sync(); // Don't wipe everything

//         // 1. Seed Fee Structure
//         const classes = ['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];
//         for (const cls of classes) {
//             await FeeStructure.findOrCreate({
//                 where: { class: cls },
//                 defaults: {
//                     tuitionFee: 25000,
//                     annualFee: 5000,
//                     examFee: 2000,
//                     transportFee: 12000
//                 }
//             });
//         }
//         console.log("✅ Fee Structures Seeded");

//         // 2. Create Sample Staff
//         await Staff.findOrCreate({
//             where: { email: 'admin@school.com' },
//             defaults: {
//                 name: 'Principal Sharma',
//                 role: 'ADMIN',
//                 password: 'password123',
//                 phone: '9876543210'
//             }
//         });

//         await Staff.findOrCreate({
//             where: { email: 'clerk@school.com' },
//             defaults: {
//                 name: 'Vikas Clerk',
//                 role: 'ACCOUNTANT',
//                 password: 'password123',
//                 phone: '9876543211'
//             }
//         });

//         console.log("✅ Staff Roles Seeded");

//         process.exit(0);
//     } catch (e) {
//         console.error("❌ Seeding Failed", e);
//         process.exit(1);
//     }
// };

// seedPhase1();


import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load .env from the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { Student, Staff, FeeHead, ClassFeeStructure, Admin, Role, sequelize } from '../models/index.js';

const createAdminAndFees = async () => {
  try {
    await sequelize.sync({ alter: true }); // Sync new tables dynamically without full drop
    console.log('📡 Connected to Database and schema synced...');

    // 1. Seed Fee Heads (Dynamic Categories)
    console.log('⏳ Seeding Fee Heads...');
    const feeHeadsData = [
      { name: 'Tuition Fee', frequency: 'MONTHLY', isOptional: false, description: 'Monthly class tuition' },
      { name: 'Annual Audit', frequency: 'YEARLY', isOptional: false, description: 'Yearly maintenance fee' },
      { name: 'Exam Fee', frequency: 'HALF_YEARLY', isOptional: false, description: 'Biannual examination fee' },
      { name: 'Admission Fee', frequency: 'ONE_TIME', isOptional: false, description: 'One-time enrollment charge' },
      { name: 'Transport Fee', frequency: 'MONTHLY', isOptional: true, description: 'Optional bus service charge' },
      { name: 'Smart Class Fee', frequency: 'MONTHLY', isOptional: false, description: 'Digital learning infrastructure fee' }
    ];

    const seededHeads = [];
    for (const head of feeHeadsData) {
      const [h] = await FeeHead.findOrCreate({ where: { name: head.name }, defaults: head });
      seededHeads.push(h);
    }
    console.log("✅ Fee Heads Master Seeded");

    // 2. Seed Class Fee Structures mapping
    const classes = ['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];
    
    // Map amounts dynamically based on type for testing
    const getAmount = (name) => {
      if (name === 'Tuition Fee') return 25000;
      if (name === 'Annual Audit') return 5000;
      if (name === 'Exam Fee') return 2000;
      if (name === 'Admission Fee') return 10000;
      if (name === 'Smart Class Fee') return 500;
      return 0; // Transport is student specific usually, but we can assign a base map if needed
    };

    for (const cls of classes) {
      for (const head of seededHeads) {
         if (head.name === 'Transport Fee') continue; // Transport usually mapped per route, not class base
         await ClassFeeStructure.findOrCreate({
            where: { class: cls, feeHeadId: head.id },
            defaults: { amount: getAmount(head.name) }
         });
      }
    }
    console.log("✅ Class Fee Structures Seeded (Nursery - 12th)");

    // 2. Create/Sync Admin
    const [user, created] = await Admin.findOrCreate({
      where: { email: 'admin@sdm.com' },
      defaults: {
        id: 1,
        password: 'admin',
        role: 'SUPER_ADMIN',
        permissions: {
          canViewStudents: true,
          canEditStudents: true,
          canAddMarks: true,
          canMarkAttendance: true,
          canViewFees: true,
          isSuperAdmin: false,
        },
        name: 'Administrator',
        image: 'http://localhost:5001/uploads/identity-1778134433961-profile.jpg',
        phone: '',
        about: '',
        address: '',
        dob: '',
      }
    });

    if (created) {
        console.log('✅ Admin created successfully');
    } else {
        console.log('ℹ️ Admin already exists, skipping creation');
    }

    // 3. Seed Students (40 per class) - WIPE FIRST for clean data
    console.log('⏳ Wiping existing students and seeding 600 Fresh Students (Section = NULL)...');
    await Student.destroy({ where: {}, truncate: true, cascade: true });
    
    const studentData = [];
    for (const cls of classes) {
        for (let i = 1; i <= 40; i++) {
            const padId = i.toString().padStart(2, '0');
            studentData.push({
                name: `Scholar ${cls} ${padId}`,
                admissionNo: `ADM-${cls}-${padId}`,
                fatherName: `Mr. Guardian ${cls} ${padId}`,
                motherName: `Mrs. Guardian ${cls} ${padId}`,
                class: cls,
                section: null, // Assigned by Principal later
                rollNo: i,
                password: 'password123',
                session: '2026 - 2027',
                gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                phone: `90000${classes.indexOf(cls).toString().padStart(2, '0')}${padId}`,
                feesStatus: 'PENDING'
            });
        }
    }

    await Student.bulkCreate(studentData);
    console.log(`✅ SUCCESS: 600 Fresh Students Seeded with NULL Sections.`);

    // 4. Seed Teachers (30 Professional Faculty members) - WIPE FIRST for clean data
    console.log('⏳ Wiping existing teachers and seeding 30 Unique Professional Faculty members...');
    await Staff.destroy({ where: { role: 'TEACHER' } });

    const teacherNames = [
        "Mr. Rajesh Kumar", "Ms. Sunita Sharma", "Mr. Amit Verma", "Ms. Anjali Gupta", 
        "Mr. Vikram Singh", "Ms. Meena Kumari", "Mr. Sanjay Yadav", "Ms. Pooja Rani", 
        "Mr. Deepak Mishra", "Ms. Kavita Reddy", "Mr. Manoj Tiwari", "Ms. Sneha Kapoor", 
        "Mr. Rahul Malhotra", "Ms. Divya Joshi", "Mr. Arun Chaudhary", "Ms. Shweta Singh",
        "Mr. Pankaj Pandey", "Ms. Rekha Sharma", "Mr. Vinay Gupta", "Ms. Neha Verma",
        "Mr. Sunil Dutt", "Ms. Aarti Saxena", "Mr. Kishore Kumar", "Ms. Lata Mangeshkar",
        "Mr. Vijay Chauhan", "Ms. Babita Phogat", "Mr. Sachin Tendulkar", "Ms. Mithali Raj",
        "Mr. Virat Kohli", "Ms. Saina Nehwal"
    ];

    const teacherData = [];
    teacherNames.forEach((name, index) => {
        teacherData.push({
            name: name,
            email: `faculty.${index + 1}@sdm.com`,
            password: 'password123',
            role: 'TEACHER',
            phone: `9812345${index.toString().padStart(3, '0')}`,
            designation: 'Senior Faculty',
            class: null, // NOT ASSIGNED (Principal task)
            section: null, // NOT ASSIGNED
            gender: index % 2 === 0 ? 'MALE' : 'FEMALE',
            address: 'Institutional Staff Housing, SDM School'
        });
    });

    await Staff.bulkCreate(teacherData);
    console.log(`✅ SUCCESS: 30 Unique Professional Teachers Seeded (Unassigned).`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
};

createAdminAndFees();