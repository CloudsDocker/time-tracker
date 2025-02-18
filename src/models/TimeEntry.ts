// models/TimeEntry.ts
import mongoose from 'mongoose';

const TimeEntrySchema = new mongoose.Schema({
    id: String,
    category: String,
    description: String,
    startTime: Date,
    endTime: Date,
    duration: Number
}, {
    timestamps: true
});

export default mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);