const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
  questionId: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
}, { _id: false });

const responseSchema = new Schema({
  surveyId: {
    type: Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  answers: [answerSchema],
  metadata: {
    submittedAt: { type: Date, default: Date.now },
    completionTime: { type: Number },
    fingerprint: { type: String },
  },
});

responseSchema.index({ surveyId: 1, 'metadata.submittedAt': -1 });

module.exports = mongoose.model('Response', responseSchema);
