const db = require('../config/database');

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const { department, search } = req.query;
        let query = `SELECT d.*, dept.name as department_name 
                     FROM doctors d 
                     LEFT JOIN departments dept ON d.department_id = dept.id 
                     WHERE d.is_active = 1`;
        const params = [];

        if (department) {
            query += ' AND d.department_id = ?';
            params.push(department);
        }
        if (search) {
            query += ' AND (d.full_name LIKE ? OR d.specialization LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY d.full_name';

        const [doctors] = await db.execute(query, params);
        res.json({ success: true, data: doctors });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const [doctors] = await db.execute(
            `SELECT d.*, dept.name as department_name 
             FROM doctors d 
             LEFT JOIN departments dept ON d.department_id = dept.id 
             WHERE d.id = ?`,
            [req.params.id]
        );
        if (doctors.length === 0) return res.json({ success: false, message: 'Doctor not found' });
        res.json({ success: true, data: doctors[0] });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Create doctor (admin)
const createDoctor = async (req, res) => {
    try {
        const { full_name, email, phone, department_id, specialization, qualification,
            experience_years, consultation_fee, bio, available_days, available_time_start, available_time_end } = req.body;
        
        let profile_image = null;
        if (req.file) profile_image = '/images/uploads/' + req.file.filename;

        const [result] = await db.execute(
            `INSERT INTO doctors (full_name, email, phone, department_id, specialization, qualification, 
             experience_years, consultation_fee, bio, profile_image, available_days, available_time_start, available_time_end) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, phone, department_id || null, specialization, qualification,
             experience_years || 0, consultation_fee || 0, bio, profile_image,
             available_days || 'Mon,Tue,Wed,Thu,Fri',
             available_time_start || '09:00:00', available_time_end || '17:00:00']
        );
        res.json({ success: true, message: 'Doctor added successfully', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Update doctor (admin)
const updateDoctor = async (req, res) => {
    try {
        const { full_name, email, phone, department_id, specialization, qualification,
            experience_years, consultation_fee, bio, available_days, available_time_start, available_time_end, is_active } = req.body;
        
        let setClause = `full_name=?, email=?, phone=?, department_id=?, specialization=?, qualification=?, 
                         experience_years=?, consultation_fee=?, bio=?, available_days=?, 
                         available_time_start=?, available_time_end=?, is_active=?`;
        let params = [full_name, email, phone, department_id || null, specialization, qualification,
                      experience_years || 0, consultation_fee || 0, bio,
                      available_days || 'Mon,Tue,Wed,Thu,Fri',
                      available_time_start || '09:00:00', available_time_end || '17:00:00',
                      is_active !== undefined ? is_active : 1];

        if (req.file) {
            setClause += ', profile_image=?';
            params.push('/images/uploads/' + req.file.filename);
        }

        params.push(req.params.id);
        await db.execute(`UPDATE doctors SET ${setClause} WHERE id=?`, params);
        res.json({ success: true, message: 'Doctor updated successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Delete doctor (admin)
const deleteDoctor = async (req, res) => {
    try {
        await db.execute('UPDATE doctors SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Doctor removed successfully' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
