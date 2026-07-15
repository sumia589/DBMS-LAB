const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'hospital_secret_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', require('./routes/index'));

// Page Routes - Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/doctors', (req, res) => res.sendFile(path.join(__dirname, '../frontend/doctors.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, '../frontend/services.html')));
app.get('/news', (req, res) => res.sendFile(path.join(__dirname, '../frontend/news.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../frontend/contact.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../frontend/about.html')));
app.get('/appointments', (req, res) => res.sendFile(path.join(__dirname, '../frontend/appointments.html')));

app.get('/admin/*', (req, res) => {
    const page = req.path.replace('/admin/', '') || 'dashboard.html';
    res.sendFile(path.join(__dirname, `../frontend/admin/${page}`));
});

app.get('/patient/*', (req, res) => {
    const page = req.path.replace('/patient/', '') || 'dashboard.html';
    res.sendFile(path.join(__dirname, `../frontend/patient/${page}`));
});

// Start server
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🏥 HOSPITAL MANAGEMENT SYSTEM        ║');
    console.log('║   Server running successfully!          ║');
    console.log(`║   URL: http://localhost:${PORT}           ║`);
    console.log('║   Admin: admin@hospital.com             ║');
    console.log('║   Pass:  Admin@123                      ║');
    console.log('╚════════════════════════════════════════╝');
});
