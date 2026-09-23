import Razorpay from 'razorpay';
import crypto from 'crypto';
import { SchoolSettings, OnlineTransaction, FeeDue, FeePayment, Student } from '../../models/index.js';
import sequelize from '../../config/database.js';

// Setup Razorpay instance dynamically based on settings
const getRazorpayInstance = async () => {
  const settings = await SchoolSettings.findOne();
  if (!settings || !settings.enableOnlinePayments || !settings.razorpayKeyId || !settings.razorpayKeySecret) {
    throw new Error('Online payments are not enabled or configured for this institution.');
  }
  return new Razorpay({
    key_id: settings.razorpayKeyId,
    key_secret: settings.razorpayKeySecret
  });
};

export const createOrder = async (req, res) => {
  try {
    const { amount, feeDueIds } = req.body; // Amount should be in INR rupees (will convert to paise)
    const studentId = req.user.id; // Correctly get student's ID from user object

    if (!amount || !feeDueIds || !feeDueIds.length) {
      return res.status(400).json({ error: 'Amount and feeDueIds are required.' });
    }

    const instance = await getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `rcptid_${studentId}_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    // Log the intent in database
    const transaction = await OnlineTransaction.create({
      studentId,
      razorpayOrderId: order.id,
      amount,
      feeDueIds: feeDueIds,
      status: 'CREATED'
    });

    res.status(201).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      transaction_id: transaction.id
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment order.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification parameters.' });
    }

    const settings = await SchoolSettings.findOne();
    if (!settings || !settings.razorpayKeySecret) {
      return res.status(400).json({ error: 'Gateway configuration missing.' });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", settings.razorpayKeySecret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Log failed attempt
      await OnlineTransaction.update(
        { status: 'FAILED' },
        { where: { razorpayOrderId: razorpay_order_id } }
      );
      return res.status(400).json({ error: 'Invalid Payment Signature' });
    }

    // Success - Process the transaction
    const transaction = await OnlineTransaction.findOne({ where: { razorpayOrderId: razorpay_order_id } });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found in system.' });
    }

    if (transaction.status === 'SUCCESS') {
      return res.json({ success: true, message: 'Payment already processed.' });
    }

    // 1. Update Transaction
    await transaction.update({
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'SUCCESS'
    });

    // 2. Generate FeePayment record
    await FeePayment.create({
      studentId: transaction.studentId,
      amountPaid: transaction.amount,
      mode: 'ONLINE',
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      transactionId: razorpay_payment_id,
      onlineTransactionId: transaction.id,
      remark: 'Online Fee Payment via Razorpay'
    });

    // 3. Mark the individual FeeDues as PAID (Simplistic approach: marks all provided fee dues as PAID)
    // In a real robust system, you'd calculate partial payments, but we will mark them as paid for now.
    await FeeDue.update(
      { 
        status: 'PAID', 
        paidDate: new Date(),
        paidAmount: sequelize.col('totalAmount') 
      },
      { where: { id: transaction.feeDueIds, studentId: transaction.studentId } }
    );

    res.json({ success: true, message: 'Payment verified and updated successfully.' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message || 'Failed to verify payment.' });
  }
};
