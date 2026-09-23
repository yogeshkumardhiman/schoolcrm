import 'dotenv/config';
import { Student, Staff, Homework, HomeworkSubmission, sequelize } from '../models/index.js';

async function seedHomework() {
    console.log("=========================================");
    console.log("🚀 STARTING REALISTIC HOMEWORK & SUBMISSION SEEDING");
    console.log("=========================================\n");

    try {
        // 1. Authenticate / Sync database
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");

        // 2. Clean up existing Homework & Submissions to avoid duplicate noise
        console.log("\n🧹 Cleaning up existing Homework and Submission entries...");
        const deletedSubmissions = await HomeworkSubmission.destroy({ where: {} });
        const deletedHomeworks = await Homework.destroy({ where: {} });
        console.log(`   Cleaned up ${deletedSubmissions} old submissions and ${deletedHomeworks} old homework items.`);

        // 3. Find Class 10TH Section A students
        const students10A = await Student.findAll({
            where: { class: '10TH', section: 'A' },
            order: [['rollNo', 'ASC']]
        });

        if (students10A.length === 0) {
            console.log("❌ No students found in Class 10TH Section A. Please run global seed_data.js first.");
            process.exit(1);
        }
        console.log(`👤 Found ${students10A.length} students in Class 10TH Section A.`);

        // 4. Find teachers for subjects
        const mathTeacher = await Staff.findOne({ where: { subject: 'MATHEMATICS', role: 'TEACHER' } }) 
            || await Staff.findOne({ where: { role: 'TEACHER' } });
            
        const scienceTeacher = await Staff.findOne({ where: { subject: 'SCIENCE', role: 'TEACHER' } }) 
            || await Staff.findOne({ where: { role: 'TEACHER' } });

        const englishTeacher = await Staff.findOne({ where: { subject: 'ENGLISH', role: 'TEACHER' } }) 
            || await Staff.findOne({ where: { role: 'TEACHER' } });

        console.log(`🍎 Faculty assigned for seeding:`);
        console.log(`   - Math: ${mathTeacher?.name || 'N/A'} (ID: ${mathTeacher?.id})`);
        console.log(`   - Science: ${scienceTeacher?.name || 'N/A'} (ID: ${scienceTeacher?.id})`);
        console.log(`   - English: ${englishTeacher?.name || 'N/A'} (ID: ${englishTeacher?.id})`);

        // 5. Calculate due dates relative to today
        const today = new Date();
        
        const getFutureDateStr = (daysAhead) => {
            const d = new Date(today);
            d.setDate(today.getDate() + daysAhead);
            return d.toISOString().split('T')[0];
        };

        const getPastDateStr = (daysAgo) => {
            const d = new Date(today);
            d.setDate(today.getDate() - daysAgo);
            return d.toISOString().split('T')[0];
        };

        // 6. Create Homework Tasks
        console.log("\n📝 Provisioning premium homework assignments...");

        const hw1 = await Homework.create({
            title: "Calculus Fundamentals: Derivative Rules",
            subject: "MATHEMATICS",
            class: "10TH",
            section: "A",
            content: "Complete exercises 4.1 to 4.5 in your Mathematics textbooks. Focus on applying the chain rule, product rule, and quotient rule for polynomial functions. Show step-by-step working for all derivative proofs.",
            teacherId: mathTeacher?.id || 1,
            teacherName: mathTeacher?.name || "Mathematics Faculty",
            priority: "HIGH",
            isUrgent: true,
            status: "ACTIVE",
            date: getPastDateStr(1),
            dueDate: getFutureDateStr(2),
            session: "2026 - 2027",
            attachments: ["https://example.com/materials/calculus_derivs.pdf"]
        });
        console.log(`   ✅ Created Math Homework ID: ${hw1.id} (High Priority/Urgent)`);

        const hw2 = await Homework.create({
            title: "Chemical Bonding & Molecular Structures",
            subject: "SCIENCE",
            class: "10TH",
            section: "A",
            content: "Read Chapter 5 in the Chemistry module and construct Lewis dot structures for CO2, H2O, NH3, and CH4. Explain why water exhibits a bent geometry while carbon dioxide is linear.",
            teacherId: scienceTeacher?.id || 2,
            teacherName: scienceTeacher?.name || "Science Faculty",
            priority: "MEDIUM",
            isUrgent: false,
            status: "ACTIVE",
            date: getPastDateStr(1),
            dueDate: getFutureDateStr(4),
            session: "2026 - 2027",
            attachments: ["https://example.com/materials/chemical_bonding.pdf"]
        });
        console.log(`   ✅ Created Science Homework ID: ${hw2.id} (Medium Priority)`);

        const hw3 = await Homework.create({
            title: "English Literature: The Merchant of Venice Act III Analysis",
            subject: "ENGLISH",
            class: "10TH",
            section: "A",
            content: "Draft a 500-word critical analysis on Shylock's monologue 'Hath not a Jew eyes?'. Focus on how Shakespeare utilizes rhetorical devices to convey deep-seated resentment and human universalism.",
            teacherId: englishTeacher?.id || 3,
            teacherName: englishTeacher?.name || "English Literature Faculty",
            priority: "LOW",
            isUrgent: false,
            status: "ACTIVE",
            date: getPastDateStr(2),
            dueDate: getFutureDateStr(6),
            session: "2026 - 2027",
            attachments: ["https://example.com/materials/merchant_of_venice.pdf"]
        });
        console.log(`   ✅ Created English Homework ID: ${hw3.id} (Low Priority)`);

        // 7. Seed Student Submissions for Realistic Progress Indicators
        console.log("\n📡 Provisioning realistic homework submissions...");

        const submissionRecords = [];

        // Math: 85% completion (17 / 20 completed, 3 pending)
        // Science: 50% completion (10 / 20 completed, 10 pending)
        // English: 20% completion (4 / 20 completed, 16 pending)
        
        students10A.forEach((student, index) => {
            // Math Homework Submissions (17 / 29 completed)
            if (index < 17) {
                submissionRecords.push({
                    homeworkId: hw1.id,
                    studentId: student.id,
                    studentName: student.name,
                    status: 'COMPLETED',
                    submittedAt: new Date().toISOString(),
                    content: `Here are my completed solutions for exercises 4.1 to 4.5. All equations solved using differentiation rules.`,
                    feedback: `Excellent calculus derivations. The chain rule was applied flawlessly. Keep it up!`,
                    grade: `A+`
                });
            }

            // Science Homework Submissions (10 / 29 completed)
            if (index < 10) {
                submissionRecords.push({
                    homeworkId: hw2.id,
                    studentId: student.id,
                    studentName: student.name,
                    status: 'COMPLETED',
                    submittedAt: new Date().toISOString(),
                    content: `Lewis structures constructed. Attached molecular geometries explanations in detail.`,
                    feedback: `Good diagrams and explanation of bent shape of H2O vs linear CO2.`,
                    grade: `A`
                });
            }

            // English Homework Submissions (4 / 29 completed)
            if (index < 4) {
                submissionRecords.push({
                    homeworkId: hw3.id,
                    studentId: student.id,
                    studentName: student.name,
                    status: 'COMPLETED',
                    submittedAt: new Date().toISOString(),
                    content: `Merchant of Venice Shylock monologue essay attached. Analyzed Shakespeare's themes of resentment.`,
                    feedback: `Highly descriptive critical analysis. Good vocabulary.`,
                    grade: `B+`
                });
            }
        });

        const createdSubmissions = await HomeworkSubmission.bulkCreate(submissionRecords);
        console.log(`   ✅ Successfully seeded ${createdSubmissions.length} student submission records!`);

        console.log("\n=========================================");
        console.log("🎉 SEED PROTOCOL COMPLETED SUCCESSFULLY");
        console.log("=========================================");
        process.exit(0);

    } catch (error) {
        console.error("💥 SEED PROTOCOL FAILED:", error);
        process.exit(1);
    }
}

seedHomework();
