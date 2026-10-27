// Run once with: npm run seed
// Creates the first admin account from the SEED_ADMIN_* values in .env.
// Public registration can never create an admin, so this script (or an
// existing admin promoting someone by hand in the DB) is the only way
// an admin account comes into being.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.SEED_ADMIN_EMAIL || '').toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`An account with ${email} already exists — nothing to do.`);
  } else {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Admin',
      email,
      password: process.env.SEED_ADMIN_PASSWORD,
      role: 'admin',
      department: 'Administration',
      designation: 'Administrator',
      directoryAccess: true,
    });
    console.log(`Admin account created for ${email}.`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
