/**
 * Bulk Data Seeder: 50 Students per class + 20 Teachers
 * Run: npx ts-node -r tsconfig-paths/register src/seed-bulk-data.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { StudentEntity } from './modules/students/entities/student.entity';
import { StaffEntity } from './modules/staff/entities/staff.entity';
import { UserEntity, UserType } from './modules/auth/entities/user.entity';
import { SchoolInfoEntity } from './modules/settings/entities/school-info.entity';
import { RoleEntity } from './modules/rbac/entities/role.entity';
import { PermissionEntity } from './modules/rbac/entities/permission.entity';
import { AttendanceEntity } from './modules/attendance/entities/attendance.entity';
import { StaffTimetableEntity } from './modules/staff/entities/staff-timetable.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'root',
  database: 'postgres',
  entities: [StudentEntity, StaffEntity, UserEntity, SchoolInfoEntity, RoleEntity, PermissionEntity, AttendanceEntity, StaffTimetableEntity],
  synchronize: false,
  logging: false,
  ssl: false,
});


// --- REALISTIC INDIAN NAMES ---

const FIRST_NAMES_MALE = [
  'Aarav', 'Aakash', 'Abhinav', 'Aditya', 'Ajay', 'Akash', 'Amit', 'Amrit', 'Anand', 'Ankit',
  'Ankur', 'Anuj', 'Arjun', 'Arnav', 'Aryan', 'Ashish', 'Ayush', 'Bhavesh', 'Chirag', 'Deepak',
  'Devendra', 'Dhruv', 'Dinesh', 'Gaurav', 'Harsh', 'Himanshu', 'Ishan', 'Jai', 'Karan', 'Kartik',
  'Kunal', 'Lakshay', 'Manav', 'Mayank', 'Mohit', 'Mukesh', 'Neeraj', 'Nikhil', 'Nilesh', 'Om',
  'Piyush', 'Pratik', 'Priyank', 'Rahul', 'Rajat', 'Rakesh', 'Ravi', 'Rishabh', 'Rohit', 'Sachin',
  'Sahil', 'Sanjay', 'Shivam', 'Siddharth', 'Suraj', 'Tarun', 'Udit', 'Vaibhav', 'Vikram', 'Vishal',
  'Vivek', 'Yash', 'Yogesh', 'Yuvraj', 'Zaid'
];

const FIRST_NAMES_FEMALE = [
  'Aanya', 'Aastha', 'Aditya', 'Aisha', 'Akansha', 'Akshita', 'Anjali', 'Ankita', 'Anushka', 'Asha',
  'Diya', 'Divya', 'Garima', 'Harsha', 'Ishika', 'Janhvi', 'Kavita', 'Khushi', 'Kratika', 'Kumkum',
  'Lata', 'Lavanya', 'Mansi', 'Meera', 'Nandini', 'Neha', 'Nidhi', 'Nikita', 'Nisha', 'Pallavi',
  'Pooja', 'Prachi', 'Pragya', 'Priya', 'Radha', 'Ritu', 'Ruhi', 'Sakshi', 'Sandhya', 'Sanika',
  'Sapna', 'Seema', 'Shilpi', 'Shreya', 'Simran', 'Sneha', 'Sonali', 'Sonu', 'Swati', 'Tanvi',
  'Tanya', 'Trisha', 'Usha', 'Varsha', 'Vidya', 'Vimla', 'Yashika', 'Zara'
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

const DESIGNATIONS = [
  'Senior Mathematics Lecturer', 'Science Faculty', 'English Language Teacher',
  'Hindi Literature Teacher', 'Social Studies Educator', 'Computer Science Faculty',
  'Physical Education Coach', 'Art & Craft Teacher', 'Sanskrit Teacher',
  'Biology Lab Incharge', 'Chemistry Faculty', 'Physics Teacher',
  'Geography & History Educator', 'Economics Faculty', 'Commerce Teacher',
  'Primary Class Incharge', 'Special Education Teacher', 'Drawing Teacher',
  'Music Faculty', 'Vice Principal'
];

const SUBJECTS_BY_DESIGNATION: Record<string, string> = {
  'Senior Mathematics Lecturer': 'Mathematics',
  'Science Faculty': 'General Science',
  'English Language Teacher': 'English',
  'Hindi Literature Teacher': 'Hindi',
  'Social Studies Educator': 'Social Studies',
  'Computer Science Faculty': 'Computer Science',
  'Physical Education Coach': 'Physical Education',
  'Art & Craft Teacher': 'Art & Craft',
  'Sanskrit Teacher': 'Sanskrit',
  'Biology Lab Incharge': 'Biology',
  'Chemistry Faculty': 'Chemistry',
  'Physics Teacher': 'Physics',
  'Geography & History Educator': 'Social Science',
  'Economics Faculty': 'Economics',
  'Commerce Teacher': 'Commerce',
  'Primary Class Incharge': 'EVS',
  'Special Education Teacher': 'Special Education',
  'Drawing Teacher': 'Fine Arts',
  'Music Faculty': 'Music',
  'Vice Principal': 'Administration',
};

const CLASSES = [
  'NURSERY', 'LKG', 'UKG',
  '1ST', '2ND', '3RD', '4TH', '5TH',
  '6TH', '7TH', '8TH', '9TH', '10TH'
];

const SECTIONS = ['A', 'B'];

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDOB(minAge: number, maxAge: number): string {
  const now = new Date();
  const year = now.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function phoneNo(): string {
  const prefixes = ['98', '97', '96', '95', '94', '93', '92', '91', '90', '89', '88', '87', '86', '85', '70'];
  return `${randomChoice(prefixes)}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
}

function getAgeRange(cls: string): [number, number] {
  const ageMap: Record<string, [number, number]> = {
    'NURSERY': [3, 4], 'LKG': [4, 5], 'UKG': [5, 6],
    '1ST': [6, 7], '2ND': [7, 8], '3RD': [8, 9], '4TH': [9, 10], '5TH': [10, 11],
    '6TH': [11, 12], '7TH': [12, 13], '8TH': [13, 14], '9TH': [14, 15], '10TH': [15, 16],
  };
  return ageMap[cls] || [10, 14];
}

async function main() {
  console.log('\n🚀 Starting Bulk Data Seeder...\n');
  await AppDataSource.initialize();

  const studentRepo = AppDataSource.getRepository(StudentEntity);
  const staffRepo = AppDataSource.getRepository(StaffEntity);
  const userRepo = AppDataSource.getRepository(UserEntity);
  const schoolInfoRepo = AppDataSource.getRepository(SchoolInfoEntity);

  // Get school prefix for admission numbers
  const schoolInfoList = await schoolInfoRepo.find({ take: 1 });
  const schoolInfo = schoolInfoList[0] || null;
  const schoolPrefix = (
    schoolInfo?.domainPrefix ||
    schoolInfo?.schoolName?.replace(/[^a-zA-Z]/g, '').substring(0, 3) ||
    'RPS'
  ).toUpperCase();

  const year = new Date().getFullYear().toString().slice(2);
  const hashedDefaultPass = bcrypt.hashSync('student@123', 10);
  const hashedTeacherPass = bcrypt.hashSync('teacher123', 10);
  const SESSION = '2026-2027';

  // ==========================================
  // 👨‍🏫 STEP 1: SEED 20 TEACHERS
  // ==========================================
  console.log('👨‍🏫 Seeding 20 Teachers...\n');

  const teacherFirstNames = [
    'Rajendra', 'Sunita', 'Manoj', 'Priya', 'Vinod',
    'Kavita', 'Suresh', 'Anita', 'Ramesh', 'Deepa',
    'Harendra', 'Suman', 'Pramod', 'Ritu', 'Narendra',
    'Kiran', 'Mahesh', 'Pooja', 'Birendra', 'Meena'
  ];

  const teacherGenders = [
    'MALE', 'FEMALE', 'MALE', 'FEMALE', 'MALE',
    'FEMALE', 'MALE', 'FEMALE', 'MALE', 'FEMALE',
    'MALE', 'FEMALE', 'MALE', 'FEMALE', 'MALE',
    'FEMALE', 'MALE', 'FEMALE', 'MALE', 'FEMALE'
  ];

  let seededTeachers = 0;
  for (let i = 0; i < 20; i++) {
    const firstName = teacherFirstNames[i];
    const surname = pick(SURNAMES, i + 5);
    const fullName = `${firstName} ${surname}`;
    const gender = teacherGenders[i];
    const designation = DESIGNATIONS[i];
    const subject = SUBJECTS_BY_DESIGNATION[designation];
    const loginId = `TCH${year}${String(i + 1).padStart(3, '0')}`;
    const email = `${firstName.toLowerCase()}.${surname.toLowerCase()}@school.edu`;

    const existingStaff = await staffRepo.findOne({ where: { loginId } });
    if (existingStaff) {
      console.log(`  ⚠️  Teacher already exists: ${fullName} (${loginId}) — skipping`);
      continue;
    }

    // Create User
    const user = userRepo.create({
      loginId,
      email,
      password: hashedTeacherPass,
      userType: UserType.ADMIN,
      isActive: true,
    });
    const savedUser = await userRepo.save(user);

    // Create Staff
    const staff = staffRepo.create({
      userId: savedUser.id,
      loginId,
      name: fullName,
      firstName,
      lastName: surname,
      role: 'TEACHER',
      designation,
      subject,
      gender,
      email,
      phone: phoneNo(),
      dob: randomDOB(28, 50),
      religion: 'HINDU',
      password: hashedTeacherPass,
      session: SESSION,
      joiningDate: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
    } as any);

    await staffRepo.save(staff);
    seededTeachers++;
    console.log(`  ✅ Teacher ${seededTeachers}/20: ${fullName} | ${designation} | Login: ${loginId}`);
  }

  console.log(`\n✅ Teachers Seeded: ${seededTeachers}\n`);

  // ==========================================
  // 👨‍🎓 STEP 2: SEED 50 STUDENTS PER CLASS
  // ==========================================
  console.log('👨‍🎓 Seeding 50 Students per class...\n');

  const allClasses = CLASSES;
  const STUDENTS_PER_CLASS = 50;

  let totalStudentsSeeded = 0;

  for (const cls of allClasses) {
    console.log(`\n📚 Seeding Class ${cls}...`);

    // Count existing students to avoid duplicates and compute next sequence
    const existingCount = await studentRepo.count({ where: { class: cls } });

    const [minAge, maxAge] = getAgeRange(cls);

    const classCodeMap: Record<string, string> = {
      NURSERY: 'NUR', LKG: 'LKG', UKG: 'UKG',
      '1ST': '1ST', '2ND': '2ND', '3RD': '3RD', '4TH': '4TH', '5TH': '5TH',
      '6TH': '6TH', '7TH': '7TH', '8TH': '8TH', '9TH': '9TH', '10TH': '10TH',
    };
    const cleanClass = classCodeMap[cls] || cls.slice(0, 4);

    let classSeeded = 0;
    for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
      const gender = i % 2 === 0 ? 'MALE' : 'FEMALE';
      const firstName = gender === 'MALE' ? pick(FIRST_NAMES_MALE, i) : pick(FIRST_NAMES_FEMALE, i);
      const surname = pick(SURNAMES, i);
      const fullName = `${firstName} ${surname}`;
      const fatherName = pick(FATHER_NAMES, i);
      const section = i < 25 ? 'A' : 'B'; // First 25 in A, next 25 in B
      const rollNo = String(i < 25 ? i + 1 : i - 25 + 1).padStart(2, '0'); // Roll 01-25 per section

      const sequence = String(existingCount + i + 1).padStart(3, '0');
      const admissionNo = `${schoolPrefix}${year}${cleanClass}${sequence}`;

      // Skip if admission number already exists
      const existing = await studentRepo.findOne({ where: { admissionNo } });
      if (existing) {
        console.log(`    ⚠️  Skipping ${fullName} (${admissionNo}) — already exists`);
        continue;
      }

      const dob = randomDOB(minAge, maxAge);
      const plainPass = dob.replace(/-/g, '');
      const hashedPass = bcrypt.hashSync(plainPass, 10);
      const email = `${firstName.toLowerCase()}.${surname.toLowerCase()}${admissionNo.toLowerCase()}@student.school.edu`;

      // Create linked user
      const user = userRepo.create({
        loginId: admissionNo,
        email,
        password: hashedPass,
        userType: UserType.STUDENT,
        isActive: true,
      });
      const savedUser = await userRepo.save(user);

      const student = studentRepo.create({
        userId: savedUser.id,
        admissionNo,
        name: fullName,
        firstName,
        lastName: surname,
        class: cls,
        section,
        rollNo,
        gender,
        dob,
        fatherName,
        phone: phoneNo(),
        religion: 'HINDU',
        session: SESSION,
        password: hashedPass,
        feesStatus: 'PENDING',
        transportOpted: i % 5 === 0,
      } as any);

      await studentRepo.save(student);
      classSeeded++;
      totalStudentsSeeded++;

      if (classSeeded % 10 === 0) {
        console.log(`    ... ${classSeeded}/${STUDENTS_PER_CLASS} seeded for Class ${cls}`);
      }
    }

    console.log(`  ✅ Class ${cls}: ${classSeeded} students seeded (${SECTIONS[0]}: 25 | ${SECTIONS[1]}: 25)`);
  }

  // ==========================================
  // 📊 FINAL SUMMARY
  // ==========================================
  const totalStudents = await studentRepo.count();
  const totalStaff = await staffRepo.count();

  console.log('\n\n===========================================');
  console.log('🎉  BULK DATA SEEDING COMPLETE!');
  console.log('===========================================');
  console.log(`  👨‍🎓  Total Students in DB : ${totalStudents}`);
  console.log(`  👨‍🏫  Total Staff/Teachers  : ${totalStaff}`);
  console.log(`  📚  Classes Seeded       : ${allClasses.length} classes`);
  console.log(`  📋  Students per class   : 50 (Section A: 25 | Section B: 25)`);
  console.log(`  👔  Teachers Seeded      : ${seededTeachers}`);
  console.log('===========================================\n');

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error('\n❌ SEEDER FAILED:', err.message);
  process.exit(1);
});
