const express = require('express');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every route below requires a valid token AND role === 'admin'
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/employees — full detail on every account, admin included
router.get('/employees', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map((u) => u.toFullView()) });
});

// PATCH /api/admin/employees/:id/access
// Toggles whether one specific employee can see the shared directory.
// This is the "admin gives access" switch the brief asks for.
router.patch('/employees/:id/access', async (req, res) => {
  const { directoryAccess } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: 'Employee not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ message: "Access grants don't apply to admin accounts." });
  }

  user.directoryAccess = Boolean(directoryAccess);
  await user.save();
  res.json({ user: user.toFullView() });
});

// PATCH /api/admin/employees/:id/status — suspend or reactivate an account
router.patch('/employees/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Status must be active or suspended.' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Employee not found.' });
  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You can't suspend your own account." });
  }

  user.status = status;
  await user.save();
  res.json({ user: user.toFullView() });
});

// DELETE /api/admin/employees/:id
router.delete('/employees/:id', async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    return res.status(400).json({ message: "You can't delete your own account." });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Employee not found.' });
  res.json({ message: 'Employee removed.' });
});

module.exports = router;
