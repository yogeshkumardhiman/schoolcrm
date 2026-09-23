import { Student, Staff, Homework, HomeworkSubmission } from '../models/index.js';
import homeworkController from '../modules/teacher/homework.controller.js';

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

async function testTeacherHomeworkRules() {
    console.log("=========================================");
    console.log("🔍 RUNNING DB & RULE INTEGRITY TEST FOR SUBJECT TEACHERS");
    console.log("=========================================\n");

    try {
        // 1. Fetch a real student & staff
        const student = await Student.findOne({ where: { class: '10TH' } });
        if (!student) {
            console.log("❌ No student found in Class 10TH.");
            return;
        }
        console.log(`👤 Found Student: Name=[${student.name}], Class=[${student.class}], Section=[${student.section}], ID=[${student.id}]`);

        // Find or create a teacher who teaches Mathematics
        let mathTeacher = await Staff.findOne({ where: { role: 'TEACHER', subject: 'Mathematics' } });
        if (!mathTeacher) {
            mathTeacher = await Staff.create({
                name: 'Math Teacher Spec',
                role: 'TEACHER',
                subject: 'Mathematics',
                class: '10TH',
                section: 'A',
                email: 'mathtest@sdm.com'
            });
        }
        console.log(`🍎 Found/Created Math Teacher: Name=[${mathTeacher.name}], Subject=[${mathTeacher.subject}], ID=[${mathTeacher.id}]`);

        // Find or create a teacher who teaches Science
        let scienceTeacher = await Staff.findOne({ where: { role: 'TEACHER', subject: 'Science' } });
        if (!scienceTeacher) {
            scienceTeacher = await Staff.create({
                name: 'Science Teacher Spec',
                role: 'TEACHER',
                subject: 'Science',
                class: '10TH',
                section: 'A',
                email: 'sciencetest@sdm.com'
            });
        }
        console.log(`🍎 Found/Created Science Teacher: Name=[${scienceTeacher.name}], Subject=[${scienceTeacher.subject}], ID=[${scienceTeacher.id}]`);

        // 2. Create homework for Mathematics
        const mathHW = await Homework.create({
            title: 'Linear Equations Test Spec',
            subject: 'Mathematics',
            content: 'Solve exercises 3.1',
            class: student.class,
            section: student.section,
            teacherId: mathTeacher.id,
            teacherName: mathTeacher.name,
            dueDate: '2026-06-01',
            status: 'ACTIVE'
        });
        console.log(`✅ Created Mathematics Homework: ID=[${mathHW.id}], Subject=[${mathHW.subject}]`);

        // 3. Test Check Access rules
        // Test A: Math Teacher tries to update Math Homework (Should succeed)
        console.log("\n🧪 Test A: Math Teacher updates Math Homework...");
        const resA = mockRes();
        await homeworkController.updateHomework({
            user: mathTeacher,
            params: { id: mathHW.id },
            body: { title: 'Linear Equations Test Spec - Updated' }
        }, resA);
        if (resA.statusCode === 403) {
            console.log("❌ Test A Failed: Access Denied");
        } else {
            console.log("✅ Test A Passed: Math Teacher successfully updated their own subject homework.");
        }

        // Test B: Science Teacher tries to update Math Homework (Should fail 403)
        console.log("\n🧪 Test B: Science Teacher tries to update Math Homework...");
        const resB = mockRes();
        await homeworkController.updateHomework({
            user: scienceTeacher,
            params: { id: mathHW.id },
            body: { title: 'Illegal Update' }
        }, resB);
        if (resB.statusCode === 403) {
            console.log("✅ Test B Passed: Science Teacher was correctly BLOCKED from updating Mathematics homework.");
        } else {
            console.log("❌ Test B Failed: Science Teacher was allowed to modify Mathematics homework!", resB.statusCode);
        }

        // Test C: Math Teacher updates student submission status (Should succeed)
        console.log("\n🧪 Test C: Math Teacher marks Math Homework submission as COMPLETED for Student...");
        const resC = mockRes();
        await homeworkController.updateStudentSubmissionStatus({
            user: mathTeacher,
            body: {
                studentId: student.id,
                homeworkId: mathHW.id,
                status: 'COMPLETED',
                feedback: 'Excellent work!',
                grade: 'A+'
            }
        }, resC);

        if (resC.statusCode === 403) {
            console.log("❌ Test C Failed: Access Denied", resC.body);
        } else {
            console.log("✅ Test C Passed: Math Teacher successfully checked/verified the student submission!");
            const verifySubmission = await HomeworkSubmission.findOne({ where: { studentId: student.id, homeworkId: mathHW.id } });
            console.log(`   Verification details: Status=[${verifySubmission.status}], Grade=[${verifySubmission.grade}], Feedback=[${verifySubmission.feedback}]`);
        }

        // Test D: Science Teacher tries to update Math Homework submission (Should fail 403)
        console.log("\n🧪 Test D: Science Teacher tries to mark Math Homework submission as COMPLETED...");
        const resD = mockRes();
        await homeworkController.updateStudentSubmissionStatus({
            user: scienceTeacher,
            body: {
                studentId: student.id,
                homeworkId: mathHW.id,
                status: 'COMPLETED'
            }
        }, resD);
        if (resD.statusCode === 403) {
            console.log("✅ Test D Passed: Science Teacher was correctly BLOCKED from verifying Mathematics homework.");
        } else {
            console.log("❌ Test D Failed: Science Teacher was allowed to verify Mathematics homework status!");
        }

        // Clean up
        console.log("\n🧹 Cleaning up test database entries...");
        await HomeworkSubmission.destroy({ where: { homeworkId: mathHW.id } });
        await Homework.destroy({ where: { id: mathHW.id } });
        console.log("✅ Database cleaned successfully!");

    } catch (e) {
        console.error("💥 Integration test failed:", e);
    } finally {
        process.exit(0);
    }
}

testTeacherHomeworkRules();
