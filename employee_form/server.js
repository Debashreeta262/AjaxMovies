const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'employee_db';
const COLLECTION_NAME = 'employees';

let collection;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

MongoClient.connect(MONGO_URI)
    .then(client => {
        console.log('Connected to MongoDB');
        collection = client.db(DB_NAME).collection(COLLECTION_NAME);
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1);
    });

function sanitize(data) {
    return String(data).trim().replace(/[<>]/g, '');
}

app.post('/api/submit', async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, dob, gender,
            address, city, state, zipCode, country,
            employeeId, department, designation, salary,
            joinDate, employmentType, password
        } = req.body;

        const fields = {
            firstName, lastName, email, phone, dob, gender,
            address, city, state, zipCode, country,
            employeeId, department, designation, salary,
            joinDate, employmentType, password
        };

        for (const [key, val] of Object.entries(fields)) {
            if (!val || String(val).trim() === '') {
                return res.json({ success: false, message: `Field '${key}' is required.` });
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: 'Invalid email format.' });
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.json({ success: false, message: 'Phone must be 10 digits.' });
        }

        if (String(password).length < 6) {
            return res.json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const existingId = await collection.findOne({ employeeId: sanitize(employeeId) });
        if (existingId) {
            return res.json({ success: false, message: `Employee ID '${employeeId}' already exists.` });
        }

        const existingEmail = await collection.findOne({ email: sanitize(email) });
        if (existingEmail) {
            return res.json({ success: false, message: `Email '${email}' is already registered.` });
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);

        const employeeData = {
            firstName: sanitize(firstName),
            lastName: sanitize(lastName),
            email: sanitize(email),
            phone: sanitize(phone),
            dob: sanitize(dob),
            gender: sanitize(gender),
            address: sanitize(address),
            city: sanitize(city),
            state: sanitize(state),
            zipCode: sanitize(zipCode),
            country: sanitize(country),
            employeeId: sanitize(employeeId),
            department: sanitize(department),
            designation: sanitize(designation),
            salary: parseFloat(salary),
            joinDate: sanitize(joinDate),
            employmentType: sanitize(employmentType),
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await collection.insertOne(employeeData);
        if (result.acknowledged) {
            res.json({ success: true, message: 'Employee registered successfully.' });
        } else {
            res.json({ success: false, message: 'Failed to insert employee data.' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Database error: ' + err.message });
    }
});

app.get('/api/employees', async (req, res) => {
    try {
        const employees = await collection.find().sort({ created_at: -1 }).toArray();
        res.json({ success: true, employees });
    } catch (err) {
        res.json({ success: false, message: 'Database error: ' + err.message });
    }
});

app.post('/api/delete', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.json({ success: false, message: 'Employee ID is required.' });
        }

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.json({ success: true, message: 'Employee deleted successfully.' });
        } else {
            res.json({ success: false, message: 'Employee not found.' });
        }
    } catch (err) {
        res.json({ success: false, message: 'Database error: ' + err.message });
    }
});

app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
