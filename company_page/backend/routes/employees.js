const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/employees/me — any logged-in user, their own full record
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toFullView() });
});

// GET /api/employees/directory
// An employee only ever reaches this once an admin has flipped their
// personal directoryAccess flag to true. Admin accounts are excluded
// from the result no matter what, so employees never see admin details
// through this route.
router.get('/directory', requireAuth, async (req, res) => {
  if (req.user.role === 'admin') {
    const all = await User.find({ role: 'employee' });
    return res.json({ colleagues: all.map((u) => u.toDirectoryView()) });
  }

  if (!req.user.directoryAccess) {
    return res.status(403).json({
      message: 'Your admin hasn\u2019t granted you access to the employee directory yet.',
      locked: true,
    });
  }

  const colleagues = await User.find({
    role: 'employee',
    _id: { $ne: req.user._id },
  });
  res.json({ colleagues: colleagues.map((u) => u.toDirectoryView()) });
});

module.exports = router;
