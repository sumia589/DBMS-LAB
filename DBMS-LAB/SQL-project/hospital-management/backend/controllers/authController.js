const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Register patient
const register = async (req, res) => {
    try {
        const { full_name, email, password, phone, date_of_birth, gender, address } = req.body;

        if (!full_name || !email || !password) {
            return res.json({ success: false, message: 'Name, email and password are required' });
        }

        // Check if email exists
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (full_name, email, password, phone, date_of_birth, gender, address, role) VALUES (?, ?, ?, ?, ?, ?, ?, "patient")',
            [full_name, email, hashedPassword, phone || null, date_of_birth || null, gender || null, address || null]
        );

        res.json({ success: true, message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error('Register error:', err);
        res.json({ success: false, message: 'Registration failed. Please try again.' });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const [users] = await db.execute('SELECT * FROM users WHERE email = ? AND role = ? AND is_active = 1', [email, role || 'patient']);

        if (users.length === 0) {
            return res.json({ success: false, message: 'Invalid credentials or account not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            profile_image: user.profile_image
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: req.session.user,
            redirect: user.role === 'admin' ? '/admin/dashboard.html' : '/patient/dashboard.html'
        });
    } catch (err) {
        console.error('Login error:', err);
        res.json({ success: false, message: 'Login failed. Please try again.' });
    }
};

// Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.json({ success: false, message: 'Logout failed' });
        res.json({ success: true, message: 'Logged out successfully' });
    });
};

// Get current user
const getMe = (req, res) => {
    if (req.session && req.session.user) {
        return res.json({ success: true, user: req.session.user });
    }
    res.json({ success: false, message: 'Not authenticated' });
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { full_name, phone, date_of_birth, gender, address } = req.body;
        let profileImage = req.session.user.profile_image;

        if (req.file) {
            profileImage = '/images/uploads/' + req.file.filename;
        }

        await db.execute(
            'UPDATE users SET full_name=?, phone=?, date_of_birth=?, gender=?, address=?, profile_image=? WHERE id=?',
            [full_name, phone, date_of_birth || null, gender, address, profileImage, userId]
        );

        req.session.user.full_name = full_name;
        req.session.user.profile_image = profileImage;

        res.json({ success: true, message: 'Profile updated successfully', user: req.session.user });
    } catch (err) {
        console.error('Update profile error:', err);
        res.json({ success: false, message: 'Update failed' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [req.session.user.id]);

        const isMatch = await bcrypt.compare(current_password, users[0].password);
        if (!isMatch) return res.json({ success: false, message: 'Current password is incorrect' });

        const hashed = await bcrypt.hash(new_password, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.session.user.id]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.json({ success: false, message: 'Password change failed' });
    }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
