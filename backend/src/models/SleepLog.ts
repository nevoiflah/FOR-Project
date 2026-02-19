import mongoose, { Schema, Document } from 'mongoose';

export interface ISleepLog extends Document {
    userId: string;
    date: string; // YYYY-MM-DD
    timestamp: Date; // Start time
    duration: number; // in hours
    score: number;
    efficiency: number;
    stages: {
        deep: number; // minutes
        rem: number; // minutes
        light: number; // minutes
        awake: number; // minutes
    };
    heartRateAvg: number;
    hrvAvg: number;
    temperatureDeviation?: number;
}

const SleepLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // For easy querying by day
    timestamp: { type: Date, required: true },
    duration: { type: Number, required: true },
    score: { type: Number, required: true },
    efficiency: { type: Number, required: true },
    stages: {
        deep: { type: Number, default: 0 },
        rem: { type: Number, default: 0 },
        light: { type: Number, default: 0 },
        awake: { type: Number, default: 0 }
    },
    heartRateAvg: { type: Number, default: 0 },
    hrvAvg: { type: Number, default: 0 },
    temperatureDeviation: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound index to prevent duplicate logs for the same day
SleepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<ISleepLog>('SleepLog', SleepLogSchema);
