module.exports = {
    modelName: 'User',
    getSchema: function (mongoose) {
        const userSchema = {
            fullname: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            mobile: { type: String },
            typeofuser: { type: String, enum: ['normal_user', 'lynker'], required: true },
            dateOfBirth: { type: Date },
            address: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            postalCode: { type: String },
            // OAuth and authentication fields
            oauth: {
                google: { type: String, sparse: true },
                apple: { type: String, sparse: true }
            },
            emailVerified: { type: Boolean, default: false },
            lastLoginAt: { type: Date },
            profilePicture: { type: String },
            status: { type: String, enum: ['active', 'disabled', 'deleted'], default: 'active' },
            // Profile stats and interests
            totalBookings: { type: Number, default: 0 },
            favoriteLynkers: { type: Number, default: 0 },
            reviews: { type: Number, default: 0 },
            interests: { type: [String], default: [] }
        }
        return new mongoose.Schema(userSchema, { timestamps: true });
    }
};
