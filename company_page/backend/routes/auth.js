const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

// POST /api/auth/register
// Public registration always creates an "employee" account. Admin accounts
// are never created through this open endpoint — see config/seedAdmin.js
// and the admin-only "promote" route for how an admin account comes to exist.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, designation, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      designation,
      phone,
      role: 'employee',
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toFullView() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// POST /api/auth/login
// Same endpoint for everyone — the role stored on the account decides
// what the token can do, the client never gets to declare its own role.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toFullView() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed.', error: err.message });
  }
});

// GET /api/auth/me — used by the frontend on page load to restore a session
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toFullView() });
});

module.exports = router;
