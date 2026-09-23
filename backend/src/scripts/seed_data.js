import 'dotenv/config';
import { 
    Student, Staff, FeePayment, Attendance, Result, 
    Homework, HomeworkSubmission, StaffAttendance, StaffTimetable, 
    SubstitutionAssignment, Topper, Notice, Event, Testimonial, 
    ComplianceDoc, SchoolInfo, Gallery, FeeHead, ClassFeeStructure,
    StudentFeeAssignment, FeeDue, sequelize 
} from '../models/index.js';
import bcrypt from 'bcryptjs';

const classes = ['NURSERY', 'LKG', 'UKG', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH'];
const sections = ['A', 'B', 'C', 'D'];
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Rohan', 'Kyra', 'Ananya', 'Saanvi', 'Aadhya', 'Pari', 'Anika', 'Ira', 'Avni', 'Mishka'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Yadav', 'Patel', 'Choudhary', 'Mishra', 'Jain'];
const villages = ['Basai', 'Gadhi', 'Nawada', 'Sikanderpur', 'Bhola', 'Kheri', 'Nagla', 'Ait', 'Urai', 'Mau'];
const subjects = ['MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL SCIENCE', 'HINDI'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDOB = (minAge, maxAge) => {
    const year = new Date().getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

async function seed() {
    try {
        console.log("--- STARTING INSTITUTIONAL REGISTRY RESET ---");
        
        // Synchronize schemas first to guarantee newly defined columns are created
        await sequelize.sync({ alter: true });
        
        // 1. DELETE ALL EXISTING DATA
        await sequelize.query('TRUNCATE TABLE "Students" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Staffs" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Toppers" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Notices" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Events" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Testimonials" CASCADE');
        await sequelize.query('TRUNCATE TABLE "ComplianceDocs" CASCADE');
        await sequelize.query('TRUNCATE TABLE "SchoolInfos" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Galleries" CASCADE');
        await sequelize.query('TRUNCATE TABLE "Results" CASCADE');
        await sequelize.query('TRUNCATE TABLE "StaffTimetables" CASCADE');
        await sequelize.query('TRUNCATE TABLE "StaffAttendances" CASCADE');
        await sequelize.query('TRUNCATE TABLE "SubstitutionAssignments" CASCADE');
        await sequelize.query('TRUNCATE TABLE "FeeHeads" CASCADE');
        await sequelize.query('TRUNCATE TABLE "ClassFeeStructures" CASCADE');
        await sequelize.query('TRUNCATE TABLE "StudentFeeAssignments" CASCADE');
        await sequelize.query('TRUNCATE TABLE "FeeDues" CASCADE');
        await sequelize.query('TRUNCATE TABLE "FeePayments" CASCADE');
        
        console.log("CLEANUP COMPLETE. PROVISIONING NEW DATA...");

        const hashedPassword = await bcrypt.hash('123456', 10);

        // 2. SEED 40 TEACHERS
        console.log("PROVISIONING 40 FACULTY NODES...");
        const staffData = [];
        for (let i = 1; i <= 40; i++) {
            const dob = generateDOB(25, 50);
            const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`;
            const email = `teacher${i}@sdm.com`;
            const phone = `9${Math.floor(Math.random() * 900000000 + 100000000)}`;
            const subject = subjects[(i - 1) % subjects.length];
            
            staffData.push({
                name,
                role: 'TEACHER',
                email,
                phone,
                password: hashedPassword,
                dob,
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                designation: 'LECTURER',
                qualification: 'B.ED, MA',
                experience: `${Math.floor(Math.random() * 15) + 1} YRS`,
                joiningDate: '2022-04-01',
                address: getRandom(villages),
                class: i <= 15 ? classes[i - 1] : '',
                section: i <= 15 ? 'A' : '',
                subject,
                religion: 'HINDU'
            });
        }
        const createdTeachers = await Staff.bulkCreate(staffData);
        console.log(`PROVISIONED ${createdTeachers.length} TEACHERS.`);

        // 2b. SEED 4 MANAGEMENT STAFF
        console.log("PROVISIONING 4 MANAGEMENT NODES...");
        const createdManagement = await Staff.bulkCreate([
            { name: 'Dr. Somesh Pundir', role: 'MANAGEMENT', designation: 'DIRECTOR', email: 'director@sdm.com', phone: '9999988888', password: hashedPassword, gender: 'Male' },
            { name: 'Mrs. Rekha Sharma', role: 'MANAGEMENT', designation: 'PRINCIPAL', email: 'principal@sdm.com', phone: '9999977777', password: hashedPassword, gender: 'Female' },
            { name: 'Mr. Vivek Yadav', role: 'MANAGEMENT', designation: 'MANAGER', email: 'manager@sdm.com', phone: '9999966666', password: hashedPassword, gender: 'Male' },
            { name: 'Mrs. Anjali Gupta', role: 'MANAGEMENT', designation: 'VICE PRINCIPAL', email: 'viceprincipal@sdm.com', phone: '9999955555', password: hashedPassword, gender: 'Female' }
        ]);

        // 3. SEED 300 STUDENTS
        console.log("PROVISIONING 300 SCHOLAR NODES...");
        const studentData = [];
        const year = new Date().getFullYear();
        
        for (let i = 1; i <= 300; i++) {
            // Guarantee at least 20 students in Class 10TH-A for testing
            const cls = i <= 20 ? '10TH' : getRandom(classes);
            const sec = i <= 20 ? 'A' : (Math.random() > 0.5 ? 'A' : 'B'); 
            const dob = i === 1 ? '2010-05-15' : (i === 2 ? '2010-08-20' : generateDOB(4, 18));
            const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`;
            
            studentData.push({
                name,
                class: cls,
                session: '2026 - 2027',
                section: sec,
                admissionNo: `${year}${String(i).padStart(4, '0')}`,
                rollNo: String(i <= 20 ? i : Math.floor(Math.random() * 50) + 1),
                fatherName: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
                motherName: `${getRandom(firstNames)} ${getRandom(lastNames)}`,
                phone: `8${Math.floor(Math.random() * 900000000 + 100000000)}`,
                dob,
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                address: getRandom(villages),
                aadharNo: `${Math.floor(Math.random() * 900000000000 + 100000000000)}`,
                password: hashedPassword,
                religion: 'HINDU',
                feesStatus: Math.random() > 0.3 ? 'PAID' : 'PENDING',
                usesTransport: Math.random() > 0.7
            });
        }
        const createdStudents = await Student.bulkCreate(studentData);
        console.log(`PROVISIONED ${createdStudents.length} STUDENTS.`);

        // --- NEW: SEED FEE MANAGEMENT SYSTEM DATA ---
        console.log("PROVISIONING DYNAMIC FEE MASTER HEADS & STRUCTURES...");
        
        // 1. Create Fee Heads
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

        // 2. Create Class Fee Structures for all 15 classes
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

        // 3. Seed student assignments, dues, and payments
        console.log("PROVISIONING STUDENT BILLING DATA (APRIL & MAY)...");
        const feeDuesData = [];
        const feePaymentsData = [];
        const studentAssignments = [];
        
        for (const s of createdStudents) {
            let tuitionAmt = 2000;
            if (['NURSERY', 'LKG', 'UKG'].includes(s.class)) tuitionAmt = 1500;
            else if (['1ST', '2ND', '3RD', '4TH', '5TH'].includes(s.class)) tuitionAmt = 2000;
            else if (['6TH', '7TH', '8TH'].includes(s.class)) tuitionAmt = 2500;
            else if (['9TH', '10TH'].includes(s.class)) tuitionAmt = 3000;
            else tuitionAmt = 4000;

            studentAssignments.push({ studentId: s.id, feeHeadId: tuitionFeeHead.id, amount: tuitionAmt, frequency: 'MONTHLY' });
            studentAssignments.push({ studentId: s.id, feeHeadId: admissionFeeHead.id, amount: 5000, frequency: 'ONE_TIME' });

            if (s.usesTransport) {
                studentAssignments.push({ studentId: s.id, feeHeadId: transportFeeHead.id, amount: 1200, frequency: 'MONTHLY' });
            }

            // April Bill
            const aprilTotal = tuitionAmt + (s.usesTransport ? 1200 : 0);
            const aprilStatus = Math.random() > 0.15 ? 'PAID' : 'PENDING';
            const aprilPaid = aprilStatus === 'PAID' ? aprilTotal : 0;
            
            feeDuesData.push({
                studentId: s.id,
                month: 'April',
                year: 2026,
                totalAmount: aprilTotal,
                paidAmount: aprilPaid,
                status: aprilStatus,
                breakdown: { 'Tuition Fee': tuitionAmt, ...(s.usesTransport ? { 'Transport Fee': 1200 } : {}) }
            });

            if (aprilPaid > 0) {
                feePaymentsData.push({
                    studentId: s.id,
                    amountPaid: aprilPaid,
                    month: 'April 2026',
                    mode: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
                    remark: 'April Tuition Fee paid successfully.'
                });
            }

            // May Bill
            const mayTotal = tuitionAmt + (s.usesTransport ? 1200 : 0);
            const mayStatus = Math.random() > 0.6 ? 'PAID' : (Math.random() > 0.5 ? 'PARTIAL' : 'PENDING');
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
                breakdown: { 'Tuition Fee': tuitionAmt, ...(s.usesTransport ? { 'Transport Fee': 1200 } : {}) }
            });

            if (mayPaid > 0) {
                feePaymentsData.push({
                    studentId: s.id,
                    amountPaid: mayPaid,
                    month: 'May 2026',
                    mode: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
                    remark: 'May Tuition Fee paid.'
                });
            }
        }

        await StudentFeeAssignment.bulkCreate(studentAssignments);
        await FeeDue.bulkCreate(feeDuesData);
        await FeePayment.bulkCreate(feePaymentsData);
        console.log(`SUCCESSFULLY SEEDED ${studentAssignments.length} ASSIGNMENTS, ${feeDuesData.length} DUES AND ${feePaymentsData.length} PAYMENTS.`);

        // 3b. SEED FULL TEACHER TIMETABLE + TODAY ABSENCE + PRINCIPAL ASSIGNMENT + NOTICE
        console.log("PROVISIONING 6-PERIOD FACULTY MATRIX WITH LIVE SUBSTITUTION DEMO...");
        const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const periods = ['1', '2', '3', '4', '5', '6'];
        const timetableRows = [];

        // Group teachers by subject to assign them to classes evenly
        const teachersBySubject = {
            'MATHEMATICS': [],
            'SCIENCE': [],
            'ENGLISH': [],
            'SOCIAL SCIENCE': [],
            'HINDI': []
        };
        createdTeachers.forEach(t => {
            const sub = (t.subject || '').toUpperCase();
            if (teachersBySubject[sub]) {
                teachersBySubject[sub].push(t);
            }
        });

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

        const todayDate = new Date().toLocaleDateString('en-CA');
        const allStaff = [...createdTeachers, ...createdManagement];
        const attendanceRows = [];
        const today = new Date();
        const remarksList = [
            'Medical leave', 
            'Urgent family matter', 
            'Out of station', 
            'Doctor appointment', 
            'Personal work'
        ];

        console.log(`PROVISIONING 30-DAY CHRONOLOGICAL ATTENDANCE HISTORY FOR ${allStaff.length} STAFF NODES...`);
        for (let d = 0; d < 30; d++) {
            const currentDate = new Date();
            currentDate.setDate(today.getDate() - d);
            
            // Skip Sunday
            if (currentDate.getDay() === 0) continue;
            
            const dateString = currentDate.toLocaleDateString('en-CA');
            
            allStaff.forEach(staff => {
                const rand = Math.random();
                let status = 'PRESENT';
                let remark = '';
                
                if (rand < 0.05) {
                    status = 'ABSENT';
                    remark = remarksList[Math.floor(Math.random() * remarksList.length)];
                } else if (rand < 0.08) {
                    status = 'LEAVE';
                    remark = remarksList[Math.floor(Math.random() * remarksList.length)];
                }
                
                const markedBy = staff.name === 'Mrs. Rekha Sharma' ? 'Dr. Somesh Pundir' : 'Mrs. Rekha Sharma';
                
                attendanceRows.push({
                    staffId: staff.id,
                    date: dateString,
                    status,
                    markedBy,
                    remark
                });
            });
        }

        const absentTeacher = createdTeachers[0];
        const substituteTeacher = createdTeachers[1];
        if (absentTeacher) {
            const absentEntry = attendanceRows.find(a => a.staffId === absentTeacher.id && a.date === todayDate);
            if (absentEntry) {
                absentEntry.status = 'ABSENT';
                absentEntry.remark = 'Medical leave (seeded)';
            }
        }
        await StaffAttendance.bulkCreate(attendanceRows);

        if (absentTeacher && substituteTeacher) {
            const absentDay = new Date(todayDate).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            const absentSlot = await StaffTimetable.findOne({
                where: { staffId: absentTeacher.id, day: absentDay, period: '3' }
            });

            if (absentSlot) {
                await SubstitutionAssignment.create({
                    absentTeacherId: absentTeacher.id,
                    substituteTeacherId: substituteTeacher.id,
                    date: todayDate,
                    period: absentSlot.period,
                    class: absentSlot.class,
                    section: absentSlot.section
                });

                await Notice.create({
                    title: `Substitution Assigned (${absentSlot.class}-${absentSlot.section})`,
                    content: `${substituteTeacher.name}, cover Period ${absentSlot.period} (${absentSlot.subject}) today for ${absentTeacher.name}.`,
                    tag: 'SUBSTITUTION',
                    color: 'bg-blue-100 text-blue-700',
                    date: todayDate,
                    class: absentSlot.class,
                    section: absentSlot.section,
                    session: '2026-27'
                });
            }
        }
        console.log("SUCCESSFULLY SEEDED TIMETABLE, ABSENCE, SUBSTITUTION AND NOTIFICATION.");

        // 3c. SEED STUDENT MARKS (RESULTS) WITH VERIFICATION LIFECYCLE
        console.log("PROVISIONING STUDENT RESULT REGISTRY WITH VERIFICATION LIFECYCLE...");
        const resultData = [];
        const studentsIn10A = createdStudents.filter(s => s.class === '10TH' && s.section === 'A');

        studentsIn10A.forEach(student => {
            // 1. Mathematics UT1 - Verified
            resultData.push({
                studentId: student.id,
                subject: 'MATHEMATICS',
                marks: Math.floor(Math.random() * 20) + 80, // 80 to 99
                total: 100,
                examType: 'UNIT TEST 1',
                session: '2026 - 2027',
                class: '10TH',
                section: 'A',
                isVerified: true
            });

            // 2. Science UT2 - Pending Approval (Unverified)
            resultData.push({
                studentId: student.id,
                subject: 'SCIENCE',
                marks: Math.floor(Math.random() * 25) + 70, // 70 to 94
                total: 100,
                examType: 'UNIT TEST 2',
                session: '2026 - 2027',
                class: '10TH',
                section: 'A',
                isVerified: false
            });

            // 3. English Half Yearly - Verified
            resultData.push({
                studentId: student.id,
                subject: 'ENGLISH',
                marks: Math.floor(Math.random() * 15) + 82, // 82 to 96
                total: 100,
                examType: 'HALF YEARLY',
                session: '2026 - 2027',
                class: '10TH',
                section: 'A',
                isVerified: true
            });

            // 4. Social Science Final - Pending Approval (Unverified)
            resultData.push({
                studentId: student.id,
                subject: 'SOCIAL SCIENCE',
                marks: Math.floor(Math.random() * 30) + 65, // 65 to 94
                total: 100,
                examType: 'FINAL',
                session: '2026 - 2027',
                class: '10TH',
                section: 'A',
                isVerified: false
            });
        });
        await Result.bulkCreate(resultData);
        console.log(`PROVISIONED ${resultData.length} SCHOLAR RESULT ENTRIES.`);

        // 4. SEED PUBLIC WEBSITE DATA
        console.log("PROVISIONING PUBLIC WEBSITE ASSETS...");
        
        // Toppers
        await Topper.bulkCreate([
            { name: 'Aditya Jain', class: '12TH', percentage: '98.4%', session: '2024-25', rank: 1, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya' },
            { name: 'Saanvi Sharma', class: '10TH', percentage: '97.8%', session: '2024-25', rank: 2, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Saanvi' },
            { name: 'Arjun Gupta', class: '12TH', percentage: '96.2%', session: '2024-25', rank: 3, image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' }
        ]);

        // Notices
        await Notice.bulkCreate([
            { title: 'Summer Vacation 2026', content: 'School will remain closed from 20th May to 30th June for summer break.', tag: 'HOLIDAY', color: 'bg-orange-100 text-orange-600', date: '2026-05-15', session: '2026-27' },
            { title: 'Final Result Declaration', content: 'Academic results for session 2025-26 will be available on the portal.', tag: 'RESULT', color: 'bg-green-100 text-green-600', date: '2026-03-31', session: '2025-26' }
        ]);

        // Events
        await Event.bulkCreate([
            { title: 'Science & Art Exhibition', date: '2026-05-24', time: '09:30 AM', location: 'Science Lab & Lobby', participants: 'All Classes', color: '#8B5CF6', icon: 'book', type: 'EVENT', description: 'A grand exhibition showcasing creative art installations and innovative science models built by senior classes.' },
            { title: 'Eid-ul-Zuha Holiday', date: '2026-05-27', time: 'ALL DAY', location: 'School Wide', participants: 'All Cohorts', color: '#F59E0B', icon: 'calendar', type: 'GOVT_HOLIDAY', description: 'Institutional closure in observance of gazetted Eid-ul-Zuha public holiday.' },
            { title: 'Summer Vacation Start', date: '2026-06-01', endDate: '2026-06-30', time: 'ALL DAY', location: 'School Wide', participants: 'All Classes', color: '#EF4444', icon: 'calendar', type: 'HOLIDAY', description: 'Official start of the summer vacation break. Enjoy your holidays and stay hydrated!' },
            { title: 'Annual Sports Meet', date: '2026-11-15', time: '09:00 AM', location: 'Main Athletic Ground', participants: 'All Classes', color: '#3B82F6', icon: 'trophy', type: 'EVENT', description: 'SDM annual track, field, and indoor sporting tournament featuring athletic meets across all grades.' },
            { title: 'Cultural Fest 2026', date: '2026-12-20', time: '10:30 AM', location: 'Auditorium', participants: 'Classes 6-12', color: '#8B5CF6', icon: 'music', type: 'EVENT', description: 'Annual cultural festival packed with dance dramas, inter-house musical relays, and theatrical plays.' }
        ]);

        // Testimonials
        await Testimonial.bulkCreate([
            { name: 'Mr. Rajesh Kumar', role: 'Parent (Grade 8)', text: 'The individual attention given to each student is remarkable. SDM Public School is truly a center for excellence.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh' },
            { name: 'Mrs. Anita Singh', role: 'Parent (Grade 3)', text: 'Great infrastructure and very supportive staff. My child has grown significantly in terms of confidence.', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita' }
        ]);

        // Compliance Docs
        console.log("PROVISIONING COMPLIANCE DOCS...");
        const docs = await ComplianceDoc.bulkCreate([
            { title: 'CBSE Affiliation Letter', category: 'Mandatory', url: 'https://example.com/cbse-affiliation.pdf', uploadDate: '2026-01-01' },
            { title: 'Safe Drinking Water Certificate', category: 'Health', url: 'https://example.com/water-certificate.pdf', uploadDate: '2026-02-15' }
        ]);
        console.log(`PROVISIONED ${docs.length} COMPLIANCE DOCS.`);

        // Gallery
        await Gallery.bulkCreate([
            { title: 'School Building', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800', category: 'Campus' },
            { title: 'Annual Function', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800', category: 'Events' },
            { title: 'Science Lab', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800', category: 'Labs' },
            { title: 'Sports Day', url: 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=800', category: 'Sports' }
        ]);

        // School Info
        await SchoolInfo.create({
            aboutTitle: 'Welcome to SDM Public School',
            mission: 'To provide quality education that empowers students to reach their full potential.',
            vision: 'To be a leading institution of learning that fosters innovation and character development.',
            principalMessage: 'We are committed to nurturing the next generation of leaders with a holistic approach to education.',
            contactEmail: 'info@sdmpublicschool.com',
            contactPhone: '+91 98765 43210',
            address: 'SDM Campus, Sikanderpur Road, Near City Center, Uttar Pradesh'
        });

        console.log("--- ALL INSTITUTIONAL SYSTEMS SEEDED SUCCESSFULLY ---");
        process.exit(0);
    } catch (err) {
        console.error("SEED PROTOCOL FAILED:", err);
        process.exit(1);
    }
}

seed();
