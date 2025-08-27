import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['ddl', 'class', 'system', 'daily', 'weekly'], required: true },
    title: { type: String, required: true },
    body: { type: String },
    sentAt: { type: Date },
    meta: { type: Object }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);


