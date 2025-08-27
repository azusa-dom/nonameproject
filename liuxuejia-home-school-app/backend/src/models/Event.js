import mongoose from 'mongoose';

const visibilitySchema = new mongoose.Schema(
  {
    parent: { type: String, enum: ['hidden', 'summary_only', 'full'], default: 'summary_only' }
  },
  { _id: false }
);

const sourceSchema = new mongoose.Schema(
  {
    provider: String,
    message_id: String,
    subject: String
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['class_event', 'assignment_due', 'system_notice', 'activity', 'recruitment'], required: true },
    title: { type: String, required: true },
    course: { type: String },
    start_at: { type: Date },
    end_at: { type: Date },
    due_at: { type: Date },
    location: { type: String },
    link: { type: String },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    visibility: { type: visibilitySchema, default: () => ({}) },
    status: { type: String, enum: ['new', 'confirmed', 'completed', 'dismissed'], default: 'new' },
    source: { type: sourceSchema }
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);


