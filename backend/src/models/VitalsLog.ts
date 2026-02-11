import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalsLog extends Document {
    userId: string;
    timestamp: Date;
    data: {
        heartRate?: number;
        hrv?: number;
        spo2?: number;
        stress?: number;
        skinTemp?: number;
        steps?: number;
        calories?: number;
    };
    deviceInfo?: {
        batteryLevel?: number;
        charging?: boolean;
    };
}

const VitalsLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true, index: true },
    data: {
        heartRate: Number,
        hrv: Number,
        spo2: Number,
        stress: Number,
        skinTemp: Number,
        steps: Number,
        calories: Number
    },
    deviceInfo: {
        batteryLevel: Number,
        charging: Boolean
    }
}, {
    timestamps: true // adds createdAt, updatedAt
});

// Compound index for efficient querying of user history
VitalsLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IVitalsLog>('VitalsLog', VitalsLogSchema);
