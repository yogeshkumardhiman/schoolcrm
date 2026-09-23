import { Notice, Staff, Student } from '../../models/index.js';
import { ApiError } from '../../common/utils/logger.js';
import { broadcastFCM } from '../notifications/service.js';
import { Op } from 'sequelize';

/**
 * Role-based visibility matrix for CRM notices.
 * Each role sees notices intended for them + school-wide notices.
 */
const ROLE_NOTICE_VISIBILITY = {
    SUPER_ADMIN:   null,                    // Sees ALL notices
    ADMIN:         null,                    // Sees ALL notices
    PRINCIPAL:     ['PRINCIPAL', 'ALL', 'TEACHER', 'STAFF'],
    VICE_PRINCIPAL:['VICE_PRINCIPAL', 'PRINCIPAL', 'ALL', 'TEACHER', 'STAFF'],
    ACCOUNTANT:    ['ACCOUNTANT', 'ALL', 'STAFF'],
    TEACHER:       ['TEACHER', 'ALL', 'STAFF', 'CLASS_TEACHER'],
    CLASS_TEACHER: ['CLASS_TEACHER', 'TEACHER', 'ALL', 'STAFF'],
};

/**
 * Smart target audience options per role (what they can broadcast to)
 */
const ROLE_TARGET_OPTIONS = {
    SUPER_ADMIN:    ['ALL', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'STAFF', 'PARENTS'],
    ADMIN:          ['ALL', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'STAFF', 'PARENTS'],
    PRINCIPAL:      ['ALL', 'TEACHER', 'STAFF', 'PARENTS'],
    VICE_PRINCIPAL: ['TEACHER', 'STAFF'],
    ACCOUNTANT:     ['TEACHER', 'PRINCIPAL', 'STAFF'],
    TEACHER:        ['CLASS_TEACHER', 'PARENTS'],
    CLASS_TEACHER:  ['PARENTS', 'TEACHER'],
};

export const createNotice = async (req, res, next) => {
    try {
        const { title, content, tag, color, class: className, section, message, studentId, targetRole } = req.body;
        const { role, id } = req.user;

        let targetClass = className;
        let targetSection = section;
        let noticeTargetRole = targetRole || null; // null means ALL

        // Teachers can only broadcast to their class
        if (role === 'TEACHER' || role === 'CLASS_TEACHER') {
            const teacher = await Staff.findByPk(id);
            if (!teacher || !teacher.class) {
                throw new ApiError(403, 'Class assignment required to broadcast notices. Please contact your administrator.');
            }
            targetClass = teacher.class;
            targetSection = teacher.section || null;
            if (!['PARENTS', 'CLASS_TEACHER'].includes(noticeTargetRole)) {
                noticeTargetRole = 'PARENTS'; // default for teachers
            }
        }

        // Accountants can only broadcast to staff/admin channels
        if (role === 'ACCOUNTANT') {
            if (!['TEACHER', 'PRINCIPAL', 'STAFF', 'ALL'].includes(noticeTargetRole)) {
                noticeTargetRole = 'STAFF';
            }
        }

        const notice = await Notice.create({
            title,
            content: content || message || '',
            tag: tag || (targetClass ? `CLASS ${targetClass}` : (noticeTargetRole || 'SCHOOL')),
            color: color || '#2563eb',
            date: new Date().toLocaleDateString('en-GB'),
            class: targetClass || null,
            section: targetSection || null,
            studentId: studentId || null,
            targetRole: noticeTargetRole,
            createdByRole: role,
            createdById: id,
            session: '2026-27'
        });

        // Send Push Notifications
        try {
            let tokens = [];

            if (studentId) {
                const student = await Student.findByPk(studentId, { attributes: ['deviceToken'] });
                if (student?.deviceToken) tokens.push(student.deviceToken);
            } else if (targetClass) {
                const whereClause = { class: targetClass };
                if (targetSection) whereClause.section = targetSection;
                const students = await Student.findAll({ where: whereClause, attributes: ['deviceToken'] });
                tokens = students.map(s => s.deviceToken).filter(Boolean);
            } else if (noticeTargetRole && noticeTargetRole !== 'ALL' && noticeTargetRole !== 'PARENTS') {
                const staffMembers = await Staff.findAll({ attributes: ['deviceToken'] });
                tokens = staffMembers.map(s => s.deviceToken).filter(Boolean);
            } else {
                const students = await Student.findAll({ attributes: ['deviceToken'] });
                tokens = students.map(s => s.deviceToken).filter(Boolean);
            }

            if (tokens.length > 0) {
                await broadcastFCM({
                    tokens,
                    title,
                    body: content || message || '',
                    noticeId: notice.id,
                    type: 'GENERAL'
                });
            }
        } catch (fcmErr) {
            console.error('[Notice Controller FCM Error]', fcmErr.message);
        }

        res.status(201).json(notice);
    } catch (err) {
        next(new ApiError(500, 'Notice creation failed', err.message));
    }
};

export const listNotices = async (req, res, next) => {
    try {
        const { role } = req.user;
        let where = {};
        
        const allowedRoles = ROLE_NOTICE_VISIBILITY[role];
        if (allowedRoles) {
            where[Op.or] = [
                { targetRole: { [Op.in]: allowedRoles } },
                { targetRole: null }
            ];
        }

        const data = await Notice.findAll({ where, order: [['createdAt', 'DESC']] });
        res.json(data);
    } catch (err) {
        next(new ApiError(500, 'Failed to fetch notices', err.message));
    }
};

export const updateNotice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);
        if (!notice) throw new ApiError(404, 'Notice not found');
        await notice.update(req.body);
        res.json(notice);
    } catch (err) {
        next(new ApiError(500, 'Failed to update notice', err.message));
    }
};

export const deleteNotice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id);
        if (!notice) throw new ApiError(404, 'Notice not found');
        await notice.destroy();
        res.json({ success: true, message: 'Notice deleted' });
    } catch (err) {
        next(new ApiError(500, 'Failed to delete notice', err.message));
    }
};

export const getTargetOptions = (req, res) => {
    const { role } = req.user;
    const options = ROLE_TARGET_OPTIONS[role] || ['ALL'];
    res.json(options);
};

export default {
    createNotice,
    listNotices,
    updateNotice,
    deleteNotice,
    getTargetOptions
};