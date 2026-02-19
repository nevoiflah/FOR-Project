import express from 'express';
import VitalsLog from '../models/VitalsLog.js';
import SleepLog from '../models/SleepLog.js';
import ReadinessLog from '../models/ReadinessLog.js';
import WorkoutLog from '../models/WorkoutLog.js';
import { checkAuth, AuthenticatedRequest } from '../middleware/auth.js';

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

// SLEEP ROUTES
router.post('/sleep', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { date, data } = req.body;
        const uid = req.user?.uid;

        if (!uid) return res.status(401).json({ error: 'User not authenticated' });

        const log = await SleepLog.findOneAndUpdate(
            { userId: uid, date },
            { ...data, userId: uid, date, timestamp: new Date(data.timestamp) },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error('Sleep Save Error:', error);
        return res.status(500).json({ error: 'Failed to save sleep log' });
    }
});

router.get('/sleep/history', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { start, end } = req.query;
        const uid = req.user?.uid;

        if (!start || !end) return res.status(400).json({ error: 'Missing start/end dates' });

        const logs = await SleepLog.find({
            userId: uid,
            date: { $gte: start as string, $lte: end as string } // String comparison for YYYY-MM-DD works
        }).sort({ date: 1 }).lean();

        return res.status(200).json({ data: logs });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch sleep history' });
    }
});

// READINESS ROUTES
router.post('/readiness', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { date, data } = req.body;
        const uid = req.user?.uid;

        if (!uid) return res.status(401).json({ error: 'User not authenticated' });

        const log = await ReadinessLog.findOneAndUpdate(
            { userId: uid, date },
            { ...data, userId: uid, date },
            { upsert: true, new: true }
        );

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error('Readiness Save Error:', error);
        return res.status(500).json({ error: 'Failed to save readiness log' });
    }
});

router.get('/readiness/history', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { start, end } = req.query;
        const uid = req.user?.uid;

        if (!start || !end) return res.status(400).json({ error: 'Missing start/end dates' });

        const logs = await ReadinessLog.find({
            userId: uid,
            date: { $gte: start as string, $lte: end as string }
        }).sort({ date: 1 }).lean();

        return res.status(200).json({ data: logs });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch readiness history' });
    }
});
    }
});

// WORKOUT ROUTES
router.post('/workouts', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { workout } = req.body;
        const uid = req.user?.uid;

        if (!uid) return res.status(401).json({ error: 'User not authenticated' });

        const log = new WorkoutLog({
            ...workout,
            userId: uid,
            date: new Date(workout.date) // Ensure date is Date object
        });

        await log.save();

        return res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error('Workout Save Error:', error);
        return res.status(500).json({ error: 'Failed to save workout' });
    }
});

router.get('/workouts/history', checkAuth, async (req: AuthenticatedRequest, res: any) => {
    try {
        const { start, end } = req.query;
        const uid = req.user?.uid;

        if (!start || !end) return res.status(400).json({ error: 'Missing start/end dates' });

        const logs = await WorkoutLog.find({
            userId: uid,
            date: { $gte: new Date(start as string), $lte: new Date(end as string) }
        }).sort({ date: -1 }).lean();

        return res.status(200).json({ data: logs });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch workout history' });
    }
});

export default router;
