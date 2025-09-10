module.exports = {
    modelName: 'Lynker',
    getSchema: function (mongoose) {
        const lynkerSchema = {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            photo: {
                type: String,
                required: false
            },
            rating: {
                type: Number
            },
            reviewCount: {
                type: Number
            },
            rate: {
                type: Number,
                required: true
            },
            category: {
                type: String,
                required: true
            },
            tags: {
                type: [String],
                default: []
            },
            bio: {
                type: String
            }
        };
        return new mongoose.Schema(lynkerSchema, { timestamps: true });
    }
};
