import { Student, ActivityLog, sequelize } from '../../models/index.js';

export const promoteStudents = async (sourceClass, targetClass, studentIds, newSession, staffId) => {
    try {
        return await sequelize.transaction(async (t) => {
            // 1. Fetch Students
            const students = await Student.findAll({
                where: { id: studentIds, class: sourceClass },
                transaction: t
            });

            if (students.length === 0) {
                throw new Error("No valid scholars found for promotion");
            }

            // 2. Iterate and Promote
            for (const student of students) {
                // Update Student Record
                await student.update({
                    class: targetClass,
                    session: newSession,
                    feesStatus: 'PENDING'
                }, { transaction: t });
            }

            // 3. Activity Log
            await ActivityLog.create({
                userId: staffId || null,
                action: 'UPDATE',
                subject: 'Student',
                details: `BULK_PROMOTION: Promoted ${students.length} scholars from ${sourceClass} to ${targetClass} for session ${newSession}`
            }, { transaction: t });

            return {
                success: true,
                message: `Successfully promoted ${students.length} scholars.`,
                count: students.length
            };
        });
    } catch (error) {
        throw error;
    }
};
