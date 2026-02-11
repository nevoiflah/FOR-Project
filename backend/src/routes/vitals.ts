import express from 'express';
import VitalsLog from '../models/VitalsLog';
import { checkAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

/**
 * POST /batch
 * Batch upload vital signs logs
 */
router.post('/batch', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { logs } = req.body;
        const uid = req.user?.uid;

        if (!uid) return res.status(401).json({ error: 'User not authenticated' });
        if (!Array.isArray(logs) || logs.length === 0) {
            return res.status(400).json({ error: 'No logs provided' });
        }

        const validLogs = logs.map(log => ({
            ...log,
            userId: uid, // Force userId from token (Security)
            timestamp: new Date(log.timestamp)
        }));

        await VitalsLog.insertMany(validLogs);

        console.log(`✅ Saved ${validLogs.length} logs for user ${uid}`);
        return res.status(200).json({ success: true, count: validLogs.length });

    } catch (error) {
        console.error('Batch Upload Error:', error);
        return res.status(500).json({ error: 'Failed to save logs' });
    }
});

/**
 * GET /history
 * Fetch history within a range
 */
router.get('/history', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { start, end, type } = req.query;
        const uid = req.user?.uid;

        if (!start || !end) return res.status(400).json({ error: 'Missing start/end dates' });

        const startDate = new Date(start as string);
        const endDate = new Date(end as string);

        const logs = await VitalsLog.find({
            userId: uid,
            timestamp: { $gte: startDate, $lte: endDate }
        }).sort({ timestamp: 1 }).lean();

        return res.status(200).json({ data: logs });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
