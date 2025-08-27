import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    userType: { type: String, enum: ['student', 'parent'], required: true },
    emailProvider: { type: String, enum: ['gmail', 'outlook'], required: false },
    timezone: { type: String, default: 'UTC' },
    parentBindingCode: { type: String },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    passwordHash: { type: String },
    lastSyncAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);


