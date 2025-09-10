module.exports = {
  modelName: 'Session',
  getSchema: function (mongoose) {
    const SessionSchema = {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      LynkerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lynker',
        required: true
      },
      ipAddress: { type: String, required: true },
      satisfactionRating: { type: Number, min: 1, max: 5, required: true },
      feedback: { type: String, required: true },
      sessionDateTime: { type: Date, required: true },
      location: { type: String, required: true },
      status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
    return new mongoose.Schema(SessionSchema, { timestamps: true })
  }
}
