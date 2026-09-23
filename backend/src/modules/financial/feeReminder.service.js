import { FeeDue, Student } from '../../models/index.js';
import { sendNotification } from '../notifications/service.js';
import { Op } from 'sequelize';

/**
 * Service to scan outstanding fee dues and trigger reminders via the Central Notification Engine
 * @param {string} [cls] - Optional class filter for targeted class-wise reminder dispatches
 */
export const sendFeeReminders = async (cls = null) => {
    try {
        console.log(`\n🚀 [Fee Reminder Service] INITIALIZING SCANNING CYCLE`);
        let whereClause = { status: { [Op.in]: ['PENDING', 'PARTIAL'] } };
        
        let studentWhere = {};
        if (cls) studentWhere.class = cls;

        const dues = await FeeDue.findAll({
            where: whereClause,
            include: [{
                model: Student,
                as: 'student',
                where: studentWhere,
                attributes: ['id', 'name', 'phone', 'deviceToken']
            }]
        });

        console.log(`   📂 Scanning complete. Found ${dues.length} defaulters.`);

        let successCount = 0;
        for (const due of dues) {
            const student = due.student;
            if (!student) continue;

            const remaining = parseFloat(due.totalAmount) - parseFloat(due.paidAmount || 0);
            if (remaining <= 0) continue;

            const msg = `Outstanding dues of Rs. ${remaining.toFixed(2)} detected for month of ${due.month}. Please pay promptly.`;

            await sendNotification({
                title: 'Fee Dues Reminder',
                content: msg,
                type: 'FEE_DUE',
                studentId: student.id,
                studentName: student.name,
                phone: student.phone,
                deviceToken: student.deviceToken
            });
            successCount++;
        }

        return { success: true, processed: successCount };
    } catch (e) {
        console.error("Error sending fee reminders:", e.message);
        throw e;
    }
};
export default { sendFeeReminders };
