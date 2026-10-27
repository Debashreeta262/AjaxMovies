const mongoose = require('mongoose');

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: (v) => !v || emailRegex.test(v),
        message: 'Enter a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (v) => !v || phoneRegex.test(v),
        message: 'Enter a valid phone number',
      },
    },
    company: { type: String, trim: true, default: '', maxlength: 100 },
    category: {
      type: String,
      enum: ['Personal', 'Work', 'Family', 'Other'],
      default: 'Other',
    },
    address: { type: String, trim: true, default: '', maxlength: 250 },
    notes: { type: String, trim: true, default: '', maxlength: 500 },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// At least one way to reach the person should be on file
contactSchema.pre('validate', function requireContactMethod(next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Provide at least an email or a phone number');
  }
  next();
});

module.exports = mongoose.model('Contact', contactSchema);
