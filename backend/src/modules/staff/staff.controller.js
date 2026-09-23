import { Staff, Admin, StaffLeaveRequest, SubstitutionAssignment, StaffAttendance, StaffTimetable } from '../../models/index.js';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';

let lastScannedStaff = null;

const getMyRequests = async (req, res) => {
  try {
    const data = await StaffLeaveRequest.findAll({
      where: { staffId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const applyLeave = async (req, res) => {
  try {
    console.log(`[Leave Request] Faculty ID: ${req.user.id}, Payload:`, JSON.stringify(req.body, null, 2));
    const request = await StaffLeaveRequest.create({
      staffId: req.user.id,
      ...req.body,
      status: 'PENDING'
    });
    console.log(`✅ Leave Request Created: ID ${request.id}`);

    // Create an internal notice for the Principal/Admin
    try {
      const { Notice } = await import('../../models/index.js');
      await Notice.create({
        title: `Leave Request: ${req.user.name || 'Staff Member'}`,
        content: `Applied for ${req.body.leaveType || 'Leave'} from ${req.body.startDate} to ${req.body.endDate}. Reason: ${req.body.reason || 'N/A'}.`,
        tag: 'LEAVE REQUEST',
        color: '#F59E0B',
        targetRole: 'PRINCIPAL',
        createdByRole: req.user.role,
        createdById: req.user.id,
        date: new Date().toLocaleDateString('en-GB')
      });
    } catch (noticeErr) {
      console.error("Failed to generate internal leave notice:", noticeErr.message);
    }

    res.json(request);
  } catch (e) { 
    console.error("❌ Leave Request Error:", e);
    res.status(500).json({ error: 'Institutional Registry Failure', detail: e.message }); 
  }
};

const getMySubstitutions = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const data = await SubstitutionAssignment.findAll({
      where: { substituteTeacherId: req.user.id, date: today },
      include: [{ model: Staff, as: 'absentTeacher', attributes: ['name'] }]
    });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getMyTimetable = async (req, res) => {
  try {
    const id = parseInt(req.user.id);
    const data = await StaffTimetable.findAll({ where: { staffId: id } });
    
    const dayMapping = {
      'MONDAY': 'MON',
      'TUESDAY': 'TUE',
      'WEDNESDAY': 'WED',
      'THURSDAY': 'THU',
      'FRIDAY': 'FRI',
      'SATURDAY': 'SAT'
    };

    const formatted = data.map(t => {
      const plain = t.get({ plain: true });
      const shortDay = dayMapping[plain.day] || plain.day;
      return { ...plain, day: shortDay };
    });

    res.json(formatted);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const selfAttendance = async (req, res) => {
  try {
    const { token, status, remark } = req.body;
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date();
    const checkTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'STAFF_ATTENDANCE') {
          return res.status(400).json({ error: 'Invalid QR Code purpose' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'QR Code expired or invalid. Please scan again.' });
      }

      let record = await StaffAttendance.findOne({
        where: { staffId: req.user.id, date: today }
      });

      if (!record) {
        record = await StaffAttendance.create({
          staffId: req.user.id,
          date: today,
          status: 'PRESENT',
          markedBy: 'SELF_QR',
          checkInTime: checkTime,
          remark: remark || 'Check-in via QR'
        });

        try {
          const staffObj = await Staff.findByPk(req.user.id);
          lastScannedStaff = {
            name: staffObj?.name || 'Staff Member',
            type: 'CHECK_IN',
            time: checkTime,
            timestamp: Date.now()
          };
        } catch (err) {
          console.error("Failed to set lastScannedStaff on check-in:", err);
        }

        return res.json({ success: true, message: 'Check-in recorded successfully', record });
      } else {
        if (!record.checkOutTime) {
          let workingHours = 'N/A';
          const inTimeStr = record.checkInTime || (record.createdAt ? new Date(record.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '09:00 AM');
          try {
            const parseTime = (timeStr) => {
              const [time, modifier] = timeStr.split(' ');
              let [hours, minutes] = time.split(':');
              if (hours === '12') hours = '00';
              if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
              if (modifier === 'AM' && hours === '12') hours = '0';
              return new Date(2020, 0, 1, hours, minutes);
            };
            const inDate = parseTime(inTimeStr);
            const outDate = parseTime(checkTime);
            const diffMs = outDate - inDate;
            if (diffMs > 0) {
              const diffHrs = diffMs / (1000 * 60 * 60);
              const hrs = Math.floor(diffHrs);
              const mins = Math.round((diffHrs - hrs) * 60);
              workingHours = `${hrs}h ${mins}m`;
            }
          } catch (calcErr) {
            console.log("Error calculating working hours:", calcErr);
          }

          await record.update({
            checkInTime: record.checkInTime || inTimeStr,
            checkOutTime: checkTime,
            workingHours: workingHours,
            remark: record.remark + ' & Check-out via QR'
          });

          try {
            const staffObj = await Staff.findByPk(req.user.id);
            lastScannedStaff = {
              name: staffObj?.name || 'Staff Member',
              type: 'CHECK_OUT',
              time: checkTime,
              workingHours: workingHours,
              timestamp: Date.now()
            };
          } catch (err) {
            console.error("Failed to set lastScannedStaff on check-out:", err);
          }

          return res.json({ success: true, message: 'Check-out recorded successfully', record });
        } else {
          return res.status(400).json({ error: 'Attendance already fully completed for today.' });
        }
      }
    } else {
      const [attendance, created] = await StaffAttendance.findOrCreate({
        where: { staffId: req.user.id, date: today },
        defaults: { status, markedBy: 'SELF', remark }
      });

      if (!created) {
        await attendance.update({ status, markedBy: 'SELF', remark });
      }
      return res.json(attendance);
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    // Authorization check
    if (parseInt(id) !== parseInt(req.user.id) && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    let user;
    // 1. Determine which table to update based on role
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'CLERK'];
    
    if (adminRoles.includes(role)) {
      user = await Admin.findByPk(id);
    }
    
    // 2. Fallback to Staff if not found or not in adminRoles
    if (!user) {
      user = await Staff.findByPk(id);
    }

    if (!user) return res.status(404).json({ error: 'Profile not found in any registry' });
    
    await user.update(req.body);
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getMyAttendance = async (req, res) => {
  try {
    const data = await StaffAttendance.findAll({
      where: { staffId: req.user.id },
      order: [['date', 'DESC']]
    });
    res.json(data);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const getAllStaff = async (req, res) => {
  try {
    const data = await Staff.findAll({ order: [['name', 'ASC']] });
    res.json(data);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const getStaffById = async (req, res) => {
  try {
    const data = await Staff.findByPk(req.params.id);
    if (!data) return res.status(404).json({ error: 'Staff not found' });
    res.json(data);
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
};

const getLastScan = async (req, res) => {
  try {
    res.json(lastScannedStaff);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export default {  
  getAllStaff, 
  getStaffById,
  getMyRequests, 
  applyLeave, 
  getMySubstitutions, 
  getMyTimetable, 
  selfAttendance, 
  updateProfile,
  getMyAttendance,
  getLastScan
 };
