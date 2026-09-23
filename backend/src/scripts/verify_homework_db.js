import { Student, Staff, Homework, HomeworkSubmission } from '../models/index.js';

async function testHomeworkDB() {
    console.log("=========================================");
    console.log("🔍 RUNNING DB INTEGRITY TEST FOR HOMEWORK");
    console.log("=========================================\n");

    try {
        // 1. Fetch a real student & staff
        const student = await Student.findOne({ where: { class: '10TH' } });
        if (!student) {
            console.log("❌ No student found in Class 10TH.");
            return;
        }
        console.log(`👤 Found Student: Name=[${student.name}], Class=[${student.class}], Section=[${student.section}], ID=[${student.id}]`);

        const teacher = await Staff.findOne({ where: { role: 'TEACHER' } });
        if (!teacher) {
            console.log("❌ No teacher found in database.");
            return;
        }
        console.log(`🍎 Found Teacher: Name=[${teacher.name}], ID=[${teacher.id}]`);

        // 2. Create a dummy homework assignment
        console.log("\n📝 Creating dynamic homework assignment in database...");
        const homework = await Homework.create({
            title: 'Algebra Quadratic Equations',
            subject: 'Mathematics',
            description: 'Solve exercises 4.1 to 4.3 and submit',
            class: student.class,
            section: student.section,
            teacherId: teacher.id,
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
            status: 'ACTIVE'
        });
        console.log(`   ✅ Homework created! ID=[${homework.id}], Title=[${homework.title}]`);

        // 3. Mark the homework complete for the student
        console.log(`\n📡 Marking Homework ID [${homework.id}] as COMPLETED for Student ID [${student.id}]...`);
        const [submission, created] = await HomeworkSubmission.findOrCreate({
            where: { studentId: student.id, homeworkId: homework.id },
            defaults: { status: 'COMPLETED', studentName: student.name, submittedAt: new Date().toISOString() }
        });
        if (!created) {
            await submission.update({ status: 'COMPLETED', submittedAt: new Date().toISOString() });
        }
        console.log(`   ✅ HomeworkSubmission marked COMPLETED! ID=[${submission.id}], Status=[${submission.status}]`);

        // 4. Fetch the statuses to verify everything is linked correctly in database
        const allStatuses = await HomeworkSubmission.findAll({ where: { studentId: student.id } });
        console.log(`\n📋 Verified Homework Submission Database Records (Total: ${allStatuses.length}):`);
        allStatuses.forEach(s => {
            console.log(`   - Submission ID: [${s.id}] | Homework ID: [${s.homeworkId}] | Student: [${s.studentName}] | Status: [${s.status}]`);
        });

        // 5. Clean up testing homework and submissions so we don't dirty the database
        console.log("\n🧹 Cleaning up test database entries...");
        await HomeworkSubmission.destroy({ where: { homeworkId: homework.id } });
        await Homework.destroy({ where: { id: homework.id } });
        console.log("   ✅ Database cleaned successfully!");

    } catch (e) {
        console.error("💥 Database verification failed:", e);
    } finally {
        process.exit(0);
    }
}

testHomeworkDB();
