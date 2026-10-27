const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    department: { type: String, default: 'Unassigned' },
    designation: { type: String, default: 'Staff' },
    phone: { type: String, default: '' },

    // Access-control flag: an admin must explicitly flip this to true
    // before an employee can see the shared employee directory at all.
    directoryAccess: { type: Boolean, default: false },

    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  },
  { timestamps: true }
);

// Hash the password whenever it's set or changed
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Shape returned to an employee looking at a colleague in the directory —
// deliberately thin, never includes admin accounts or contact-level detail
// beyond what the org chart needs.
userSchema.methods.toDirectoryView = function toDirectoryView() {
  return {
    id: this._id,
    name: this.name,
    department: this.department,
    designation: this.designation,
  };
};

// Full shape an admin sees, or a user sees of themselves.
userSchema.methods.toFullView = function toFullView() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    designation: this.designation,
    phone: this.phone,
    directoryAccess: this.directoryAccess,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
