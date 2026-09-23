import { Staff, SalaryStructure, SalaryPayment, sequelize } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';
import { Op } from 'sequelize';

export const getSalarySummary = async (req, res, next) => {
  try {
    const totalStaff = await Staff.count();
    const structureSummary = await SalaryStructure.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('baseSalary')), 'totalBase'],
        [sequelize.fn('SUM', sequelize.col('netSalary')), 'totalNet']
      ]
    });

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const paymentSummary = await SalaryPayment.findOne({
      where: { month: currentMonth, year: currentYear },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'totalPaid']]
    });
    const totalPaidThisMonth = parseFloat(paymentSummary?.get('totalPaid') || 0);

    const paidStaffIds = await SalaryPayment.findAll({
      where: { month: currentMonth, year: currentYear },
      attributes: ['staffId'],
      raw: true
    }).then(records => records.map(p => p.staffId));

    const pendingStaff = await Staff.count({
      where: {
        id: { [Op.notIn]: paidStaffIds.length > 0 ? paidStaffIds : [-1] }
      }
    });
    
    res.json({
      totalStaff,
      totalPaidThisMonth,
      pendingStaff,
      monthlyPayroll: parseFloat(structureSummary?.get('totalNet') || 0),
      baseSum: parseFloat(structureSummary?.get('totalBase') || 0)
    });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch salary summary', err.message));
  }
};

export const getStaffSalaryList = async (req, res, next) => {
  try {
    const list = await Staff.findAll({
      attributes: ['id', 'name', 'email', 'role', 'phone', 'designation'],
      include: [
        { model: SalaryStructure, as: 'salaryStructure' },
        { model: SalaryPayment, as: 'salaryPayments', limit: 5, order: [['createdAt', 'DESC']] }
      ]
    });
    res.json(list);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch staff list', err.message));
  }
};

export const updateSalaryStructure = async (req, res, next) => {
  try {
    const { staffId, baseSalary, allowances, deductions } = req.body;
    const base = parseFloat(baseSalary || 0);
    const allow = parseFloat(allowances || 0);
    const deduct = parseFloat(deductions || 0);
    const net = base + allow - deduct;

    const [structure, created] = await SalaryStructure.findOrCreate({
      where: { staffId },
      defaults: { baseSalary: base, allowances: allow, deductions: deduct, netSalary: net }
    });

    if (!created) {
      await structure.update({ baseSalary: base, allowances: allow, deductions: deduct, netSalary: net });
    }

    res.json({ success: true, structure });
  } catch (err) {
    next(new ApiError(500, 'Failed to update salary structure', err.message));
  }
};

export const processSalaryPayment = async (req, res, next) => {
  try {
    const { staffId, amount, month, year, remark } = req.body;
    const payment = await SalaryPayment.create({
      staffId,
      amount,
      month,
      year,
      status: 'PAID',
      paymentDate: new Date(),
      transactionId: `TXN-${Date.now()}`,
      remark
    });
    res.status(201).json(payment);
  } catch (err) {
    next(new ApiError(500, 'Failed to register salary payment', err.message));
  }
};

export const getSalaryPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await SalaryPayment.findByPk(id, {
      include: [{ model: Staff, as: 'staff', attributes: ['name', 'role', 'designation'] }]
    });
    if (!payment) throw new ApiError(404, 'Payment record not found');
    res.json(payment);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve payment info', err.message));
  }
};

export const getStaffSalaryHistory = async (req, res, next) => {
  try {
    const { staffId } = req.params;
    const history = await SalaryPayment.findAll({
      where: { staffId },
      order: [['createdAt', 'DESC']]
    });
    res.json(history);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch salary history', err.message));
  }
};

export default {
  getSalarySummary,
  getStaffSalaryList,
  updateSalaryStructure,
  processSalaryPayment,
  getSalaryPaymentById,
  getStaffSalaryHistory
};
