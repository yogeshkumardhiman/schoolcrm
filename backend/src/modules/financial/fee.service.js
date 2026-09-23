import { Student, StudentFee, FeePayment, FeeStructure, Transport, sequelize } from '../../models/index.js';
import { Op } from 'sequelize';

const getFeeSummary = async (cls, section) => {
    try {
        let studentWhere = {};
        if (cls && cls !== 'All Classes') studentWhere.class = cls;
        if (section && section !== 'All Sections') studentWhere.section = section;

        const students = await Student.findAll({ where: studentWhere, attributes: ['id'] });
        const studentIds = students.map(s => s.id);

        const [totalStudents, paidCount, collectionData, dueData] = await Promise.all([
            Student.count({ where: studentWhere }),
            StudentFee.count({ where: { studentId: { [Op.in]: studentIds }, dueAmount: 0 } }),
            FeePayment.findOne({ 
                where: { studentId: { [Op.in]: studentIds } },
                attributes: [[sequelize.fn('SUM', sequelize.col('amountPaid')), 'total']]
            }),
            StudentFee.findOne({ 
                where: { studentId: { [Op.in]: studentIds } },
                attributes: [[sequelize.fn('SUM', sequelize.col('dueAmount')), 'total']]
            })
        ]);

        return {
            totalStudents,
            paidStudents: paidCount,
            pendingStudents: totalStudents - paidCount,
            totalCollection: parseFloat(collectionData?.get('total') || 0),
            totalDue: parseFloat(dueData?.get('total') || 0)
        };
    } catch (e) {
        throw e;
    }
};

const getFeesList = async (cls, section, query) => {
    try {
        let where = {};
        if (cls && cls !== 'All Classes') where.class = cls;
        if (section && section !== 'All Sections') where.section = section;
        
        if (query) {
            where[Op.or] = [
                { admissionNo: { [Op.like]: `%${query}%` } },
                { name: { [Op.like]: `%${query}%` } }
            ];
        }

        const data = await Student.findAll({
            where,
            attributes: ['id', 'name', 'admissionNo', 'rollNo', 'fatherName', 'class', 'section', 'gender', 'dob', 'image'],
            include: [
                {
                    model: StudentFee,
                    as: 'feeDetails',
                    include: [
                        {
                            model: FeeStructure,
                            as: 'structure'
                        }
                    ]
                },
                {
                    model: FeePayment,
                    as: 'payments',
                    attributes: ['month', 'amountPaid', 'mode', 'createdAt']
                }
            ],
            order: [['admissionNo', 'ASC']]
        });

        // Map data to match the frontend expectations
        const formattedData = data.map(s => {
            const feeRecord = s.feeDetails && s.feeDetails.length > 0 ? s.feeDetails[0] : null;
            return {
                id: s.id,
                class: s.class,
                section: s.section,
                dueAmount: feeRecord ? feeRecord.dueAmount : 0,
                student: s
            };
        });

        return formattedData;
    } catch (e) {
        throw e;
    }
};

const markPayment = async (studentId, amountPaid, mode, month, remark) => {
    try {
        await sequelize.transaction(async (t) => {
            await FeePayment.create({ studentId, amountPaid, mode, month, remark }, { transaction: t });
            const studentFee = await StudentFee.findOne({ where: { studentId }, transaction: t });
            if (studentFee) {
                const newDue = Math.max(0, parseFloat(studentFee.dueAmount) - parseFloat(amountPaid));
                await studentFee.update({ dueAmount: newDue }, { transaction: t });
            }
        });
        return { success: true };
    } catch (e) {
        throw e;
    }
};

const payment = async (studentId, amountPaid, month, mode, remark) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const payment = await FeePayment.create({ studentId, amountPaid, month, mode: mode || 'CASH', remark }, { transaction: t });
            const studentFee = await StudentFee.findOne({ where: { studentId }, transaction: t });
            if (studentFee) {
                const newDue = Math.max(0, parseFloat(studentFee.dueAmount) - parseFloat(amountPaid));
                await studentFee.update({ dueAmount: newDue, status: newDue === 0 ? 'PAID' : 'PENDING' }, { transaction: t });
            }
            return payment;
        });
        return result;
    } catch (e) { throw e; }
};

const getPaymentById = async (id) => {
    try {
        return await FeePayment.findByPk(id, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['name', 'admissionNo', 'class', 'section', 'fatherName']
                }
            ]
        });
    } catch (e) { throw e; }
};

export default { getFeeSummary, getFeesList, markPayment, payment, getPaymentById };
