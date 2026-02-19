import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessLog extends Document {
    userId: string;
    date: string; // YYYY-MM-DD
    score: number;
    contributors: {
        sleepBalance: number;
        previousDayActivity: number;
        activityBalance: number;
        restingHeartRate: number;
        hrvBalance: number;
        temperature: number;
    };
}

const ReadinessLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    contributors: {
        sleepBalance: { type: Number, default: 0 },
        previousDayActivity: { type: Number, default: 0 },
        activityBalance: { type: Number, default: 0 },
        restingHeartRate: { type: Number, default: 0 },
        hrvBalance: { type: Number, default: 0 },
        temperature: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate logs for the same day
ReadinessLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IReadinessLog>('ReadinessLog', ReadinessLogSchema);
