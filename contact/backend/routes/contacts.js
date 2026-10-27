const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// GET /api/contacts?search=&category=&sort=name
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ name: re }, { email: re }, { phone: re }, { company: re }];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const sortMap = {
      name: { name: 1 },
      recent: { createdAt: -1 },
      company: { company: 1 },
    };
    const sortBy = sortMap[sort] || sortMap.name;

    const contacts = await Contact.find(query).sort(sortBy);
    res.json({ contacts, count: contacts.length });
  } catch (err) {
    res.status(500).json({ message: 'Could not load contacts.', error: err.message });
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    res.json({ contact });
  } catch (err) {
    res.status(400).json({ message: 'Invalid contact id.' });
  }
});

// POST /api/contacts
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, category, address, notes, favorite } = req.body;
    const contact = await Contact.create({ name, email, phone, company, category, address, notes, favorite });
    res.status(201).json({ contact });
  } catch (err) {
    res.status(400).json({ message: firstValidationMessage(err) });
  }
});

// PUT /api/contacts/:id — full update
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, company, category, address, notes, favorite } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, company, category, address, notes, favorite },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    res.json({ contact });
  } catch (err) {
    res.status(400).json({ message: firstValidationMessage(err) });
  }
});

// PATCH /api/contacts/:id/favorite — quick star toggle
router.patch('/:id/favorite', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    contact.favorite = !contact.favorite;
    await contact.save();
    res.json({ contact });
  } catch (err) {
    res.status(400).json({ message: 'Invalid contact id.' });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found.' });
    res.json({ message: 'Contact deleted.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid contact id.' });
  }
});

function firstValidationMessage(err) {
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return first ? first.message : 'Invalid contact data.';
  }
  return err.message || 'Something went wrong.';
}

module.exports = router;
