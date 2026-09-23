import feeService from './fee.service.js';
import { sendFeeReminders } from './feeReminder.service.js';
import { Student, FeeDue, FeePayment, ClassFeeStructure, FeeHead, Fee, sequelize } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';
import { Op } from 'sequelize';

export const getFeeSummary = async (req, res, next) => {
  try {
    const { class: cls, section } = req.query;
    const stats = await feeService.getFeeSummary(cls, section);
    res.json(stats);
  } catch (err) {
    next(new ApiError(500, 'Failed to get fee summary', err.message));
  }
};

export const getFeesList = async (req, res, next) => {
  try {
    const { class: cls, section, query } = req.query;
    const list = await feeService.getFeesList(cls, section, query);
    res.json(list);
  } catch (err) {
    next(new ApiError(500, 'Failed to get fees list', err.message));
  }
};

export const payment = async (req, res, next) => {
  try {
    const { studentId, amountPaid, month, mode, remark } = req.body;
    const result = await feeService.payment(studentId, amountPaid, month, mode, remark);
    res.json(result);
  } catch (err) {
    next(new ApiError(500, 'Payment logging failed', err.message));
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const paymentRecord = await feeService.getPaymentById(id);
    if (!paymentRecord) {
      throw new ApiError(404, 'Payment record not found');
    }
    res.json(paymentRecord);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve payment', err.message));
  }
};

export const sendFeeNotice = async (req, res, next) => {
  try {
    const { class: cls } = req.body;
    const result = await sendFeeReminders(cls);
    res.json(result);
  } catch (err) {
    next(new ApiError(500, 'Failed to dispatch notices', err.message));
  }
};

export const getFeeStructures = async (req, res, next) => {
  try {
    const structures = await ClassFeeStructure.findAll({
      include: [{ model: FeeHead, as: 'feeHead' }]
    });
    res.json(structures);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve structures', err.message));
  }
};

export const getFeeStructureByClass = async (req, res, next) => {
  try {
    const { class: cls } = req.params;
    const structures = await ClassFeeStructure.findAll({
      where: { class: cls },
      include: [{ model: FeeHead, as: 'feeHead' }]
    });
    res.json(structures);
  } catch (err) {
    next(new ApiError(500, 'Failed to retrieve class structure', err.message));
  }
};

export const updateFeeStructure = async (req, res, next) => {
  try {
    const { class: cls, feeHeadId, amount } = req.body;
    const [structure, created] = await ClassFeeStructure.findOrCreate({
      where: { class: cls, feeHeadId },
      defaults: { amount }
    });
    if (!created) {
      await structure.update({ amount });
    }
    res.json({ success: true, structure });
  } catch (err) {
    next(new ApiError(500, 'Failed to update structure', err.message));
  }
};

export const getCalculatedFee = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new ApiError(404, 'Student not found');
    }
    const structures = await ClassFeeStructure.findAll({
      where: { class: student.class },
      include: [{ model: FeeHead, as: 'feeHead' }]
    });
    const total = structures.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    res.json({ total, breakdown: structures });
  } catch (err) {
    next(new ApiError(500, 'Failed to calculate fee', err.message));
  }
};

export const generateDue = async (req, res, next) => {
  try {
    const { class: cls, month, year } = req.body;
    const students = await Student.findAll({ where: { class: cls } });
    const structures = await ClassFeeStructure.findAll({
      where: { class: cls },
      include: [{ model: FeeHead, as: 'feeHead' }]
    });

    const totalAmount = structures.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const breakdown = {};
    structures.forEach(s => {
      breakdown[s.feeHead ? s.feeHead.name : 'Fee'] = s.amount;
    });

    await sequelize.transaction(async (t) => {
      for (const student of students) {
        await FeeDue.findOrCreate({
          where: { studentId: student.id, month, year },
          defaults: { totalAmount, breakdown, status: 'PENDING' },
          transaction: t
        });
      }
    });

    res.json({ success: true, message: `Dues generated for ${students.length} students` });
  } catch (err) {
    next(new ApiError(500, 'Failed to generate dues', err.message));
  }
};

export const getMonthlyDefaulters = async (req, res, next) => {
  try {
    const { class: cls, month } = req.query;
    let whereClause = { status: { [Op.in]: ['PENDING', 'PARTIAL'] } };
    if (month) whereClause.month = month;
    
    let studentWhere = {};
    if (cls) studentWhere.class = cls;

    const defaulters = await FeeDue.findAll({
      where: whereClause,
      include: [{
        model: Student,
        as: 'student',
        where: studentWhere,
        attributes: ['id', 'name', 'admissionNo', 'class', 'section']
      }]
    });

    res.json(defaulters);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch defaulters', err.message));
  }
};

// --- Fee Heads master crud ---
export const getFeeHeads = async (req, res, next) => {
  try {
    const heads = await FeeHead.findAll();
    res.json(heads);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch fee heads', err.message));
  }
};

export const createFeeHead = async (req, res, next) => {
  try {
    const head = await FeeHead.create(req.body);
    res.status(201).json(head);
  } catch (err) {
    next(new ApiError(500, 'Failed to create fee head', err.message));
  }
};

export const updateFeeHead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const head = await FeeHead.findByPk(id);
    if (!head) throw new ApiError(404, 'Fee head not found');
    await head.update(req.body);
    res.json(head);
  } catch (err) {
    next(new ApiError(500, 'Failed to update fee head', err.message));
  }
};

export const deleteFeeHead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const head = await FeeHead.findByPk(id);
    if (!head) throw new ApiError(404, 'Fee head not found');
    await head.destroy();
    res.json({ success: true, message: 'Fee head deleted' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete fee head', err.message));
  }
};

// --- Fee Config (CRUD on Fee model) ---
export const getFeeConfigs = async (req, res, next) => {
  try {
    const configs = await Fee.findAll();
    res.json(configs);
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch configs', err.message));
  }
};

export const createFeeConfig = async (req, res, next) => {
  try {
    const config = await Fee.create(req.body);
    res.status(201).json(config);
  } catch (err) {
    next(new ApiError(500, 'Failed to create config', err.message));
  }
};

export const updateFeeConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await Fee.findByPk(id);
    if (!config) throw new ApiError(404, 'Config not found');
    await config.update(req.body);
    res.json(config);
  } catch (err) {
    next(new ApiError(500, 'Failed to update config', err.message));
  }
};

export const deleteFeeConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const config = await Fee.findByPk(id);
    if (!config) throw new ApiError(404, 'Config not found');
    await config.destroy();
    res.json({ success: true, message: 'Config deleted' });
  } catch (err) {
    next(new ApiError(500, 'Failed to delete config', err.message));
  }
};

// --- razorpay mock payments ---
export const processPayment = async (req, res, next) => {
  try {
    res.json({ success: True, orderId: `order_mock_${Date.now()}` });
  } catch (err) {
    next(new ApiError(500, 'Online payment registration failed', err.message));
  }
};

export const verifySignature = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'Signature verified (Mock)' });
  } catch (err) {
    next(new ApiError(500, 'Verification failed', err.message));
  }
};

export default {
  getFeeSummary,
  getFeesList,
  payment,
  getPaymentById,
  sendFeeNotice,
  getFeeStructures,
  getFeeStructureByClass,
  updateFeeStructure,
  getCalculatedFee,
  generateDue,
  getMonthlyDefaulters,
  getFeeHeads,
  createFeeHead,
  updateFeeHead,
  deleteFeeHead,
  getFeeConfigs,
  createFeeConfig,
  updateFeeConfig,
  deleteFeeConfig,
  processPayment,
  verifySignature
};