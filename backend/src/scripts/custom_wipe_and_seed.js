import 'dotenv/config';
import { 
    Student, Staff, FeePayment, Attendance, Result, 
    Homework, HomeworkSubmission, StaffAttendance, StaffTimetable, 
    SubstitutionAssignment, Topper, Notice, Event, Testimonial, 
    ComplianceDoc, SchoolInfo, Gallery, FeeHead, ClassFeeStructure,
    StudentFeeAssignment, FeeDue, Grievance, Exam, Role, Admin, sequelize 
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const classes = ['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];
const subjects = ['MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL SCIENCE', 'HINDI'];
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Rohan', 'Pranav',
    'Kyra', 'Ananya', 'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Ira', 'Avni', 'Mishka', 'Diya',
    'Kabir', 'Dev', 'Karan', 'Rahul', 'Sneha', 'Neha', 'Riya', 'Pooja', 'Amit', 'Sanjay'
];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Patel', 'Choudhary', 'Mishra', 'Jain'];
const residentialAreas = ['Basai', 'Gadhi', 'Nawada', 'Sikanderpur', 'Bhola', 'Kheri', 'Nagla', 'Ait', 'Urai', 'Mau'];
const villages = residentialAreas;

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generatedNames = new Set();
let nameSuffixCounter = 1;
function generateUniqueName() {
    let first = getRandom(firstNames);
    let last = getRandom(lastNames);
    let name = `${first} ${last}`;
    while (generatedNames.has(name)) {
        name = `${first} ${last} ${nameSuffixCounter++}`;
    }
    generatedNames.add(name);
    return name;
}

const generateDOB = (minAge, maxAge, cls) => {
    let age = 5;
    if (cls === 'NURSERY') age = 3;
    else if (cls === 'LKG') age = 4;
    else if (cls === 'UKG') age = 5;
    else {
        const gradeNum = parseInt(cls);
        if (!isNaN(gradeNum)) {
            age = 5 + gradeNum;
        } else {
            age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
        }
    }
    const year = new Date().getFullYear() - age;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const generateStaffDOB = (minAge, maxAge) => {
    const year = new Date().getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getFutureDateStr = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
};

const getPastDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
};

const getDDMMYYYY = (dobStr) => {
    if (!dobStr) return '123456';
    const parts = dobStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}${parts[1]}${parts[0]}`;
    }
    return '123456';
};

const run = async () => {
    try {
        console.log("\n====================================================");
        console.log("🚀 STARTING CUSTOM PROGRAMMATIC DATABASE REGISTRY RESET");
        console.log("====================================================");

        await sequelize.authenticate();
        console.log("\n✅ Database connected successfully.");

        // 1. Disable constraints in session, truncate all operational tables cleanly (including Roles to rebuild them)
        console.log("\n🧹 Truncating operational tables cleanly...");
        await sequelize.query("SET session_replication_role = 'replica';");
        try {
            await sequelize.query('TRUNCATE TABLE "HomeworkSubmissions" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Homework" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Grievances" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Results" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Exams" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Attendances" CASCADE');
            await sequelize.query('TRUNCATE TABLE "FeePayments" CASCADE');
            await sequelize.query('TRUNCATE TABLE "FeeDues" CASCADE');
            await sequelize.query('TRUNCATE TABLE "StudentFeeAssignments" CASCADE');
            await sequelize.query('TRUNCATE TABLE "ClassFeeStructures" CASCADE');
            await sequelize.query('TRUNCATE TABLE "FeeHeads" CASCADE');
            await sequelize.query('TRUNCATE TABLE "StaffTimetables" CASCADE');
            await sequelize.query('TRUNCATE TABLE "StaffAttendances" CASCADE');
            await sequelize.query('TRUNCATE TABLE "SubstitutionAssignments" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Students" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Staffs" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Toppers" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Notices" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Events" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Testimonials" CASCADE');
            await sequelize.query('TRUNCATE TABLE "ComplianceDocs" CASCADE');
            await sequelize.query('TRUNCATE TABLE "SchoolInfos" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Galleries" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Roles" CASCADE');
            await sequelize.query('TRUNCATE TABLE "Admins" CASCADE');
        } catch (truncErr) {
            console.log("ℹ️ Wiping warning (some tables may not exist yet):", truncErr.message);
        }
        await sequelize.query("SET session_replication_role = 'origin';");
        console.log("✅ Wiping complete. Syncing latest structures...");

        // 2. Sync dynamic schemas after data wipe
        await sequelize.sync({ alter: true });
        console.log("⚙️ Syncing complete.");

        // 3. Seed Roles Master Table to prevent FK violations when seeding Staff/Admin
        console.log("\n🎭 Seeding Role structures...");
        const rolesToSeed = [
            { name: 'SUPER_ADMIN', description: 'Super Administrator' },
            { name: 'ADMIN', description: 'Administrator' },
            { name: 'MANAGEMENT', description: 'School Management' },
            { name: 'TEACHER', description: 'Faculty Teacher' },
            { name: 'ACCOUNTANT', description: 'School Accountant' },
            { name: 'CLERK', description: 'Administrative Clerk' },
            { name: 'PRINCIPAL', description: 'School Principal' },
            { name: 'VICE_PRINCIPAL', description: 'School Vice Principal' }
        ];
        await Role.bulkCreate(rolesToSeed, { ignoreDuplicates: true });
        console.log("✅ Roles master table seeded successfully.");
 
        // 3b. Seed Admin Master Account
        console.log("\n👤 Seeding Super Admin account...");
        const superAdminRole = await Role.findOne({ where: { name: 'SUPER_ADMIN' } });
        await Admin.create({
            name: 'Administrator',
            email: 'admin@sdm.com',
            password: 'admin',
            role: 'SUPER_ADMIN',
            roleId: superAdminRole ? superAdminRole.id : null,
            permissions: {
                canViewStudents: true,
                canEditStudents: true,
                canAddMarks: true,
                canMarkAttendance: true,
                canViewFees: true,
                isSuperAdmin: true
            }
        });
        console.log("✅ Super Admin account seeded successfully.");

        // Pre-compute bcrypt password hashes to optimize execution speed
        console.log("\n🔑 Generating secure password hashes...");
        const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
        const hashedStudentPassword = await bcrypt.hash('123456', 10);
        console.log("✅ Hashes generated successfully.");

        // 3. GENERATE EXACTLY 35 TEACHERS
        console.log("\n🍎 Generating 35 Teachers with valid accounts & class assignments...");
        const staffData = [];
        for (let i = 1; i <= 35; i++) {
            const dob = generateStaffDOB(25, 45);
            const name = generateUniqueName();
            const email = `teacher${i}@sdm.com`;
            const phone = `9${Math.floor(Math.random() * 900000000 + 100000000)}`;
            const subject = subjects[(i - 1) % subjects.length];
            
            // Assign Teachers 1-30 as class teachers for all 15 classes across Section A & B
            const isClassTeacher = i <= 30;
            const assignedClass = isClassTeacher ? classes[Math.floor((i - 1) / 2)] : '';
            const assignedSection = isClassTeacher ? ((i - 1) % 2 === 0 ? 'A' : 'B') : '';

            staffData.push({
                name,
                role: 'TEACHER',
                email,
                phone,
                password: hashedTeacherPassword,
                dob,
                gender: i % 2 === 0 ? 'Female' : 'Male',
                designation: 'LECTURER',
                qualification: 'B.ED, MA',
                experience: `${Math.floor(Math.random() * 8) + 3} YRS`,
                joiningDate: '2023-04-01',
                address: getRandom(villages),
                class: assignedClass,
                section: assignedSection,
                subject,
                religion: 'HINDU'
            });
        }
        const createdTeachers = await Staff.bulkCreate(staffData);
        console.log(`✅ Successfully seeded ${createdTeachers.length} TEACHERS.`);

        // 4. RECREATE MANAGEMENT STAFF ONLY (No Principal, Vice Principal, or Accountant as requested)
        console.log("\n💼 Seeding administrative management nodes...");
        const adminStaffList = [
            { name: 'Dr. Somesh Pundir', role: 'MANAGEMENT', designation: 'DIRECTOR', email: 'director@sdm.com', phone: '9999988888', password: hashedTeacherPassword, gender: 'Male', dob: '1975-04-12', joiningDate: '2020-04-01', address: 'Mau' },
            { name: 'Mr. Vivek Yadav', role: 'MANAGEMENT', designation: 'MANAGER', email: 'manager@sdm.com', phone: '9999966666', password: hashedTeacherPassword, gender: 'Male', dob: '1978-11-15', joiningDate: '2021-04-01', address: 'Gadhi' },
            { name: 'Mr. Ramesh Singh', role: 'MANAGEMENT', designation: 'FOUNDER', email: 'founder@sdm.com', phone: '9999944444', password: hashedTeacherPassword, gender: 'Male', dob: '1970-05-10', joiningDate: '2019-04-01', address: 'Basai' },
            { name: 'Mr. Ajay Tomar', role: 'MANAGEMENT', designation: 'CHIEF OF HEAD', email: 'chiefofhead@sdm.com', phone: '9999933333', password: hashedTeacherPassword, gender: 'Male', dob: '1982-12-05', joiningDate: '2022-04-01', address: 'Nawada' }
        ];
        const createdAdmins = await Staff.bulkCreate(adminStaffList);
        const createdManagement = createdAdmins.filter(a => a.role === 'MANAGEMENT');
        console.log(`✅ Successfully seeded ${createdAdmins.length} Management accounts.`);

        // 5. GENERATE EXACTLY 450 STUDENTS (30 per class across all 15 classes: 15 in A, 15 in B)
        console.log("\n🎓 Generating exactly 450 Students (30 per class: 15 in A, 15 in B)...");
        const studentData = [];
        let studentCounter = 1;
        
        for (const cls of classes) {
            for (const section of ['A', 'B']) {
                for (let roll = 1; roll <= 15; roll++) {
                    const admissionNo = `2026${String(studentCounter).padStart(4, '0')}`;
                    const name = generateUniqueName();
                    const dob = generateDOB(4, 18, cls);

                    studentData.push({
                        name,
                        class: cls,
                        session: '2026 - 2027',
                        section,
                        admissionNo,
                        rollNo: String(roll),
                        fatherName: `${generateUniqueName()}`,
                        motherName: `${generateUniqueName()}`,
                        phone: `8${Math.floor(Math.random() * 900000000 + 100000000)}`,
                        dob,
                        gender: roll % 2 === 0 ? 'Female' : 'Male',
                        address: getRandom(villages),
                        aadharNo: `${Math.floor(Math.random() * 900000000000 + 100000000000)}`,
                        password: hashedStudentPassword,
                        email: `student${studentCounter}@sdm.com`,
                        religion: 'HINDU',
                        feesStatus: 'PENDING',
                        transportOpted: roll === 3 || roll === 7 || roll === 11 // Deterministic transport opting
                    });
                    studentCounter++;
                }
            }
        }
        const createdStudents = await Student.bulkCreate(studentData);
        console.log(`✅ Successfully seeded ${createdStudents.length} STUDENTS.`);

        // 6. GENERATE STAFF WEEKLY TIMETABLE MATRIX FOR BOTH SECTIONS
        console.log("\n📅 Provisioning weekly subject timetable allocations for Sections A & B...");
        
        // Group teachers by subject to assign them to classes evenly
        const teachersBySubject = {
            'MATHEMATICS': [],
            'SCIENCE': [],
            'ENGLISH': [],
            'SOCIAL SCIENCE': [],
            'HINDI': []
        };
        createdTeachers.forEach(t => {
            if (teachersBySubject[t.subject]) {
                teachersBySubject[t.subject].push(t);
            }
        });

        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const periods = ['1', '2', '3', '4', '5', '6'];
        const timetableRows = [];

        // Generate a flat list of all 30 class-sections
        const classSections = [];
        classes.forEach(cls => {
            ['A', 'B'].forEach(section => {
                classSections.push({ class: cls, section });
            });
        });

        // Loop over each day and period to assign a conflict-free teacher and subject
        days.forEach((day, dayIdx) => {
            periods.forEach((period, periodIdx) => {
                // Keep track of how many times each subject has been assigned in this day/period slot
                const subjectAssignmentsCount = {
                    'MATHEMATICS': 0,
                    'SCIENCE': 0,
                    'ENGLISH': 0,
                    'SOCIAL SCIENCE': 0,
                    'HINDI': 0
                };

                classSections.forEach((cs, csIdx) => {
                    // Assign subject based on round-robin rotation formula
                    const subjectIdx = (csIdx + periodIdx + dayIdx) % subjects.length;
                    const subject = subjects[subjectIdx];

                    // Get available teachers for this subject
                    const availableTeachers = teachersBySubject[subject];

                    // Select teacher based on assignments count to avoid double-booking in this slot
                    const teacherIndex = subjectAssignmentsCount[subject] % availableTeachers.length;
                    const teacher = availableTeachers[teacherIndex];

                    // Increment assignment count for this subject
                    subjectAssignmentsCount[subject]++;

                    timetableRows.push({
                        staffId: teacher.id,
                        day,
                        period,
                        class: cs.class,
                        section: cs.section,
                        subject
                    });
                });
            });
        });

        await StaffTimetable.bulkCreate(timetableRows);
        console.log(`✅ Rich conflict-free timetable generated successfully (${timetableRows.length} slots created).`);


        // 7. GENERATE DYNAMIC FEE heads AND BILLING (April & May 2026)
        console.log("\n💰 Building dynamic school billing structure...");
        const tuitionFeeHead = await FeeHead.create({
            name: 'Tuition Fee',
            frequency: 'MONTHLY',
            category: 'RECURRING',
            collectOnAdmission: false,
            isOptional: false,
            description: 'Monthly school tuition fee'
        });
        
        const admissionFeeHead = await FeeHead.create({
            name: 'Admission Fee',
            frequency: 'ONE_TIME',
            category: 'ADMISSION',
            collectOnAdmission: true,
            isOptional: false,
            description: 'One-time admission charge'
        });

        const transportFeeHead = await FeeHead.create({
            name: 'Transport Fee',
            frequency: 'MONTHLY',
            category: 'TRANSPORT',
            collectOnAdmission: false,
            isOptional: true,
            description: 'Monthly student bus transport fee'
        });

        // Fee structure per class grade
        const structures = [];
        for (const cls of classes) {
            let tuitionAmt = 2000;
            if (['NURSERY', 'LKG', 'UKG'].includes(cls)) tuitionAmt = 1500;
            else if (['1ST', '2ND', '3RD', '4TH', '5TH'].includes(cls)) tuitionAmt = 2000;
            else if (['6TH', '7TH', '8TH'].includes(cls)) tuitionAmt = 2500;
            else if (['9TH', '10TH'].includes(cls)) tuitionAmt = 3000;
            else tuitionAmt = 4000;

            structures.push({ class: cls, feeHeadId: tuitionFeeHead.id, amount: tuitionAmt });
            structures.push({ class: cls, feeHeadId: admissionFeeHead.id, amount: 5000 });
        }
        await ClassFeeStructure.bulkCreate(structures);

        // Assign fee schedules, generate dues & payments
        const studentAssignments = [];
        const feeDuesData = [];
        const feePaymentsData = [];

        for (const s of createdStudents) {
            let tuitionAmt = 2000;
            if (['NURSERY', 'LKG', 'UKG'].includes(s.class)) tuitionAmt = 1500;
            else if (['1ST', '2ND', '3RD', '4TH', '5TH'].includes(s.class)) tuitionAmt = 2000;
            else if (['6TH', '7TH', '8TH'].includes(s.class)) tuitionAmt = 2500;
            else if (['9TH', '10TH'].includes(s.class)) tuitionAmt = 3000;
            else tuitionAmt = 4000;

            studentAssignments.push({ studentId: s.id, feeHeadId: tuitionFeeHead.id, amount: tuitionAmt, frequency: 'MONTHLY' });
            studentAssignments.push({ studentId: s.id, feeHeadId: admissionFeeHead.id, amount: 5000, frequency: 'ONE_TIME' });

            if (s.transportOpted) {
                studentAssignments.push({ studentId: s.id, feeHeadId: transportFeeHead.id, amount: 1200, frequency: 'MONTHLY' });
            }

            // April billing (90% Paid)
            const aprilTotal = tuitionAmt + (s.transportOpted ? 1200 : 0);
            const aprilStatus = Math.random() > 0.1 ? 'PAID' : 'PENDING';
            const aprilPaid = aprilStatus === 'PAID' ? aprilTotal : 0;
            
            feeDuesData.push({
                studentId: s.id,
                month: 'April',
                year: 2026,
                totalAmount: aprilTotal,
                paidAmount: aprilPaid,
                status: aprilStatus,
                breakdown: { 'Tuition Fee': tuitionAmt, ...(s.transportOpted ? { 'Transport Fee': 1200 } : {}) }
            });

            if (aprilPaid > 0) {
                feePaymentsData.push({
                    studentId: s.id,
                    amountPaid: aprilPaid,
                    month: 'April 2026',
                    mode: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
                    remark: 'April tuition & bus fee cleared.'
                });
            }

            // May billing (60% Paid, 20% Partial, 20% Pending)
            const mayTotal = tuitionAmt + (s.transportOpted ? 1200 : 0);
            const r = Math.random();
            const mayStatus = r > 0.4 ? 'PAID' : (r > 0.2 ? 'PARTIAL' : 'PENDING');
            let mayPaid = 0;
            if (mayStatus === 'PAID') mayPaid = mayTotal;
            else if (mayStatus === 'PARTIAL') mayPaid = Math.floor(mayTotal / 2);

            feeDuesData.push({
                studentId: s.id,
                month: 'May',
                year: 2026,
                totalAmount: mayTotal,
                paidAmount: mayPaid,
                status: mayStatus,
                breakdown: { 'Tuition Fee': tuitionAmt, ...(s.transportOpted ? { 'Transport Fee': 1200 } : {}) }
            });

            if (mayPaid > 0) {
                feePaymentsData.push({
                    studentId: s.id,
                    amountPaid: mayPaid,
                    month: 'May 2026',
                    mode: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
                    remark: 'May monthly fee payment.'
                });
            }
        }
        await StudentFeeAssignment.bulkCreate(studentAssignments);
        await FeeDue.bulkCreate(feeDuesData);
        await FeePayment.bulkCreate(feePaymentsData);
        console.log(`✅ Seeding billing metrics complete. (${studentAssignments.length} schedules, ${feeDuesData.length} dues established).`);

        // 8. GENERATE REALISTIC EXAM RESULTS (3 per student)
        console.log("\n📊 Provisioning premium student result cards...");
        const resultData = [];
        createdStudents.forEach(student => {
            // Mathematics UT1 - Verified
            resultData.push({
                studentId: student.id,
                subject: 'MATHEMATICS',
                marks: Math.floor(Math.random() * 20) + 80, // 80 - 100
                total: 100,
                examType: 'UNIT TEST 1',
                session: '2026 - 2027',
                class: student.class,
                section: student.section,
                isVerified: true
            });

            // Science UT2 - Unverified (Verification workflow testing)
            resultData.push({
                studentId: student.id,
                subject: 'SCIENCE',
                marks: Math.floor(Math.random() * 25) + 70, // 70 - 95
                total: 100,
                examType: 'UNIT TEST 2',
                session: '2026 - 2027',
                class: student.class,
                section: student.section,
                isVerified: false
            });

            // English Half Yearly - Verified
            resultData.push({
                studentId: student.id,
                subject: 'ENGLISH',
                marks: Math.floor(Math.random() * 15) + 82, // 82 - 97
                total: 100,
                examType: 'HALF YEARLY',
                session: '2026 - 2027',
                class: student.class,
                section: student.section,
                isVerified: true
            });
        });
        await Result.bulkCreate(resultData);
        console.log(`✅ Result entries seeded successfully (${resultData.length} entries created).`);

        // 8.5. GENERATE EXAMS FOR EVERY CLASS
        console.log("\n📝 Provisioning exam registry modules for all classes...");
        const examData = [];
        classes.forEach(cls => {
            examData.push({
                title: 'UNIT TEST 1',
                subjects: [
                    { name: 'MATHEMATICS', maxMarks: '100' },
                    { name: 'SCIENCE', maxMarks: '100' },
                    { name: 'ENGLISH', maxMarks: '100' }
                ],
                date: '15 MAY 2026',
                class: cls,
                status: 'COMPLETED',
                session: '2026 - 2027'
            });

            examData.push({
                title: 'UNIT TEST 2',
                subjects: [
                    { name: 'MATHEMATICS', maxMarks: '100' },
                    { name: 'SCIENCE', maxMarks: '100' },
                    { name: 'ENGLISH', maxMarks: '100' }
                ],
                date: '28 MAY 2026',
                class: cls,
                status: 'MARKING',
                session: '2026 - 2027'
            });

            examData.push({
                title: 'HALF YEARLY',
                subjects: [
                    { name: 'MATHEMATICS', maxMarks: '100' },
                    { name: 'SCIENCE', maxMarks: '100' },
                    { name: 'ENGLISH', maxMarks: '100' }
                ],
                date: '12 SEP 2026',
                class: cls,
                status: 'COMPLETED',
                session: '2026 - 2027'
            });
        });
        await Exam.bulkCreate(examData);
        console.log(`✅ Exam registries seeded successfully (${examData.length} active modules created).`);

        // 9. GENERATE CHRONOLOGICAL ATTENDANCE HISTORY (30 Days)
        console.log("\n📅 Generating chronological attendance telemetry...");
        const studentAttendanceRows = [];
        const staffAttendanceRows = [];
        const today = new Date();
        const staffList = [...createdTeachers, ...createdManagement];

        for (let d = 0; d < 30; d++) {
            const currentDate = new Date();
            currentDate.setDate(today.getDate() - d);
            
            if (currentDate.getDay() === 0) continue; // Skip Sundays
            
            const dateString = currentDate.toLocaleDateString('en-CA');
            
            // Student attendance (93% Present)
            createdStudents.forEach(student => {
                const rand = Math.random();
                let status = 'PRESENT';
                if (rand < 0.05) status = 'ABSENT';
                else if (rand < 0.07) status = 'LEAVE';
                
                studentAttendanceRows.push({
                    studentId: student.id,
                    class: student.class,
                    section: student.section,
                    date: dateString,
                    status,
                    session: '2026 - 2027'
                });
            });

            // Staff attendance (95% Present, but force 3 specific teacher absences today to showcase substitution)
            staffList.forEach(staff => {
                const rand = Math.random();
                let status = 'PRESENT';
                let remark = '';
                
                if (dateString === '2026-05-29' && staff.role === 'TEACHER') {
                    if (staff.email === 'teacher1@sdm.com' || staff.email === 'teacher5@sdm.com' || staff.email === 'teacher10@sdm.com') {
                        status = 'ABSENT';
                        remark = 'Medical emergency';
                    }
                } else {
                    if (rand < 0.03) {
                        status = 'ABSENT';
                        remark = 'Personal leave';
                    } else if (rand < 0.05) {
                        status = 'LEAVE';
                        remark = 'Sick leave';
                    }
                }
                
                staffAttendanceRows.push({
                    staffId: staff.id,
                    date: dateString,
                    status,
                    markedBy: 'Dr. Somesh Pundir',
                    remark
                });
            });
        }
        await Attendance.bulkCreate(studentAttendanceRows);
        await StaffAttendance.bulkCreate(staffAttendanceRows);
        console.log(`✅ Attendance registry generated completely.`);

        // 10. GENERATE HOMEWORK & SUBMISSIONS (Grade 10TH Section A)
        console.log("\n📝 Seeding class homework & submission workflows...");
        const students10A = createdStudents.filter(s => s.class === '10TH' && s.section === 'A');
        const teacher10A_math = teachersBySubject['MATHEMATICS'][classes.indexOf('10TH') % teachersBySubject['MATHEMATICS'].length];
        
        const hwMath = await Homework.create({
            title: "Quadratic Equations Practice Sheet",
            subject: "MATHEMATICS",
            class: "10TH",
            section: "A",
            content: "Please solve exercises 3.1 to 3.4 in the textbook. Ensure that you show step-by-step working for quadratic formula derivations.",
            teacherId: teacher10A_math.id,
            teacherName: teacher10A_math.name,
            priority: "HIGH",
            isUrgent: true,
            status: "ACTIVE",
            date: getPastDateStr(1),
            dueDate: getFutureDateStr(3),
            session: "2026 - 2027",
            attachments: ["https://example.com/math_quadratics.pdf"]
        });

        const hwSubmissions = [];
        students10A.forEach((student, index) => {
            // Seed 4 submissions out of 5 students in 10TH
            if (index < 4) {
                hwSubmissions.push({
                    homeworkId: hwMath.id,
                    studentId: student.id,
                    studentName: student.name,
                    status: 'COMPLETED',
                    submittedAt: new Date().toISOString(),
                    content: `Here are my completed exercises for Chapter 3. All solutions worked out step-by-step.`,
                    feedback: `Fabulous work! Highly neat and accurate algebraic steps.`,
                    grade: `A+`
                });
            }
        });
        await HomeworkSubmission.bulkCreate(hwSubmissions);
        console.log(`✅ Homework and submissions seeded successfully.`);

        // 11. GENERATE GRIEVANCES
        console.log("\n🗣️ Provisioning user grievances...");
        await Grievance.bulkCreate([
            {
                studentId: createdStudents[0].id,
                studentName: createdStudents[0].name,
                class: createdStudents[0].class,
                section: createdStudents[0].section,
                subject: 'Transport Route Delay',
                message: 'Morning School Bus Route 3 is consistently late by 15-20 minutes, causing us to miss the morning assembly. Please review the route timings.',
                status: 'PENDING',
                date: new Date().toISOString()
            },
            {
                studentId: createdStudents[5].id,
                studentName: createdStudents[5].name,
                class: createdStudents[5].class,
                section: createdStudents[5].section,
                subject: 'Biology Lab Microscopes',
                message: 'Two microscopes on Table B in the main biology laboratory have damaged focus knobs.',
                teacherReply: 'Thank you for bringing this up. The lab assistant has logged these models for repair next Monday.',
                status: 'RESOLVED',
                date: new Date(Date.now() - 86400000).toISOString()
            }
        ]);
        console.log("✅ Grievances seeded successfully.");

        // 12. MARKETING & FRONTEND CONTENT ASSETS
        console.log("\n🎨 Seeding school public content & toppers...");
        await Topper.bulkCreate([
            { name: 'Aditya Jain', class: '12TH', percentage: '98.4%', session: '2024-25', rank: 1, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
            { name: 'Saanvi Sharma', class: '10TH', percentage: '97.8%', session: '2024-25', rank: 2, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi' },
            { name: 'Arjun Gupta', class: '12TH', percentage: '96.2%', session: '2024-25', rank: 3, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' }
        ]);

        await Notice.bulkCreate([
            { title: 'Summer Vacation Announcement', content: 'School campus will remain closed from 20th May to 30th June for the summer holiday. Regular academic operations resume on 1st July.', tag: 'HOLIDAY', color: 'bg-orange-100 text-orange-600', date: '2026-05-15', session: '2026-27' },
            { title: 'Academic Portal Open', content: 'School results and dashboard systems are now fully integrated and online for parent access.', tag: 'RESULT', color: 'bg-green-100 text-green-600', date: '2026-03-31', session: '2025-26' }
        ]);

        await Event.bulkCreate([
            { title: 'Science & Art Exhibition', date: '2026-05-24', time: '09:30 AM', location: 'Science Lab & Lobby', participants: 'All Classes', color: '#8B5CF6', icon: 'book', type: 'EVENT', description: 'A grand exhibition showcasing creative art installations and innovative science models built by senior classes.' },
            { title: 'Eid-ul-Zuha Holiday', date: '2026-05-27', time: 'ALL DAY', location: 'School Wide', participants: 'All Cohorts', color: '#F59E0B', icon: 'calendar', type: 'GOVT_HOLIDAY', description: 'Institutional closure in observance of gazetted Eid-ul-Zuha public holiday.' },
            { title: 'Summer Vacation Start', date: '2026-06-01', endDate: '2026-06-30', time: 'ALL DAY', location: 'School Wide', participants: 'All Classes', color: '#EF4444', icon: 'calendar', type: 'HOLIDAY', description: 'Official start of the summer vacation break. Enjoy your holidays and stay hydrated!' },
            { title: 'Annual Sports Meet', date: '2026-11-15', time: '09:00 AM', location: 'Main Athletic Ground', participants: 'All Classes', color: '#3B82F6', icon: 'trophy', type: 'EVENT', description: 'SDM annual track, field, and indoor sporting tournament featuring athletic meets across all grades.' }
        ]);

        await Testimonial.bulkCreate([
            { name: 'Mr. Rajesh Kumar', role: 'Parent (Grade 8)', text: 'The individual attention given to each student is remarkable. SDM Public School is truly a center for excellence.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh' },
            { name: 'Mrs. Anita Singh', role: 'Parent (Grade 3)', text: 'Great infrastructure and very supportive staff. My child has grown significantly in terms of confidence.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita' }
        ]);

        await ComplianceDoc.bulkCreate([
            { title: 'CBSE Affiliation Letter', category: 'Mandatory', url: 'https://example.com/cbse-affiliation.pdf', uploadDate: '2026-01-01' },
            { title: 'Safe Drinking Water Certificate', category: 'Health', url: 'https://example.com/water-certificate.pdf', uploadDate: '2026-02-15' }
        ]);

        await Gallery.bulkCreate([
            { title: 'School Building Exterior', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', category: 'Campus' },
            { title: 'Annual Cultural Festival', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', category: 'Events' },
            { title: 'Advanced Chemistry Laboratory', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', category: 'Labs' }
        ]);

        await SchoolInfo.create({
            aboutTitle: 'Welcome to SDM Public School',
            mission: 'To provide quality education that empowers students to reach their full potential.',
            vision: 'To be a leading institution of learning that fosters innovation and character development.',
            principalMessage: 'We are committed to nurturing the next generation of leaders with a holistic approach to education.',
            contactEmail: 'info@sdmpublicschool.com',
            contactPhone: '+91 98765 43210',
            address: 'SDM Campus, Sikanderpur Road, Near City Center, Uttar Pradesh'
        });
        console.log("✅ Marketing content initialized.");

        console.log("\n====================================================");
        console.log("🎉 SUCCESS: DATABASE RESEEDED WITH PREMIUM PROGRAM DATA");
        console.log("====================================================");
        process.exit(0);
    } catch (err) {
        console.error("\n💥 RESET SEED PROTOCOL FAILED:", err);
        process.exit(1);
    }
}

run();
