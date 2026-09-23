import { promoteStudents } from './academic.service.js';

export const handlePromotion = async (req, res) => {
    try {
        const { sourceClass, targetClass, studentIds, newSession } = req.body;
        
        if (!sourceClass || !targetClass || !studentIds || !Array.isArray(studentIds) || !newSession) {
            return res.status(400).json({ error: 'Missing required parameters for promotion' });
        }

        const staffId = req.user?.id; // Assuming auth.middleware sets req.user

        const result = await promoteStudents(sourceClass, targetClass, studentIds, newSession, staffId);
        
        res.json(result);
    } catch (e) {
        console.error('[Bulk Promotion Error]', e);
        res.status(500).json({ error: e.message });
    }
};

export default {
    handlePromotion
};
