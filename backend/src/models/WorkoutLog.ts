import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkoutLog extends Document {
    userId: string;
    type: 'run' | 'walk' | 'cycle' | 'yoga' | 'hiit' | 'mindfulness';
    duration: number; // in seconds
    calories: number;
    heartRateAvg?: number;
    distance?: number; // in meters
    date: Date; // ISO timestamp
}

const WorkoutLogSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    calories: { type: Number, required: true },
    heartRateAvg: { type: Number },
    distance: { type: Number },
    date: { type: Date, required: true, index: true }
}, {
    timestamps: true
});

// Compound index to help with history queries for a user
WorkoutLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
