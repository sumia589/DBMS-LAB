const db = require('../config/database');

// Dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const [[{ total_patients }]] = await db.execute('SELECT COUNT(*) as total_patients FROM users WHERE role="patient"');
        const [[{ total_doctors }]] = await db.execute('SELECT COUNT(*) as total_doctors FROM doctors WHERE is_active=1');
        const [[{ total_appointments }]] = await db.execute('SELECT COUNT(*) as total_appointments FROM appointments');
        const [[{ today_appointments }]] = await db.execute('SELECT COUNT(*) as today_appointments FROM appointments WHERE appointment_date=CURDATE()');
        const [[{ pending_appointments }]] = await db.execute('SELECT COUNT(*) as pending_appointments FROM appointments WHERE status="pending"');
        const [[{ total_departments }]] = await db.execute('SELECT COUNT(*) as total_departments FROM departments WHERE is_active=1');

        // Recent appointments
        const [recent_appointments] = await db.execute(
            `SELECT a.*, u.full_name as patient_name, d.full_name as doctor_name 
             FROM appointments a 
             JOIN users u ON a.patient_id=u.id 
             JOIN doctors d ON a.doctor_id=d.id 
             ORDER BY a.created_at DESC LIMIT 5`
        );

        // Monthly appointment stats
        const [monthly_stats] = await db.execute(
            `SELECT DATE_FORMAT(appointment_date, '%b') as month, COUNT(*) as count 
             FROM appointments 
             WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
             GROUP BY DATE_FORMAT(appointment_date, '%Y-%m') 
             ORDER BY appointment_date`
        );

        res.json({
            success: true,
            data: {
                total_patients, total_doctors, total_appointments,
                today_appointments, pending_appointments, total_departments,
                recent_appointments, monthly_stats
            }
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== PATIENTS =====
const getAllPatients = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT id, full_name, email, phone, gender, date_of_birth, address, created_at, is_active FROM users WHERE role="patient"';
        const params = [];
        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY created_at DESC';
        const [patients] = await db.execute(query, params);
        res.json({ success: true, data: patients });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const togglePatientStatus = async (req, res) => {
    try {
        const [user] = await db.execute('SELECT is_active FROM users WHERE id=?', [req.params.id]);
        const newStatus = user[0].is_active ? 0 : 1;
        await db.execute('UPDATE users SET is_active=? WHERE id=?', [newStatus, req.params.id]);
        res.json({ success: true, message: `Patient ${newStatus ? 'activated' : 'deactivated'}` });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== DEPARTMENTS =====
const getDepartments = async (req, res) => {
    try {
        const [depts] = await db.execute(`
            SELECT d.*, COUNT(doc.id) as doctor_count 
            FROM departments d 
            LEFT JOIN doctors doc ON d.id=doc.department_id AND doc.is_active=1 
            GROUP BY d.id ORDER BY d.name`);
        res.json({ success: true, data: depts });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        const [result] = await db.execute(
            'INSERT INTO departments (name, description, icon) VALUES (?, ?, ?)',
            [name, description, icon || 'fa-hospital']
        );
        res.json({ success: true, message: 'Department created', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { name, description, icon, is_active } = req.body;
        await db.execute(
            'UPDATE departments SET name=?, description=?, icon=?, is_active=? WHERE id=?',
            [name, description, icon, is_active !== undefined ? is_active : 1, req.params.id]
        );
        res.json({ success: true, message: 'Department updated' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        await db.execute('UPDATE departments SET is_active=0 WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Department removed' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== SERVICES =====
const getServices = async (req, res) => {
    try {
        const [services] = await db.execute(
            `SELECT s.*, d.name as department_name FROM services s 
             LEFT JOIN departments d ON s.department_id=d.id ORDER BY s.name`
        );
        res.json({ success: true, data: services });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const createService = async (req, res) => {
    try {
        const { name, description, price, duration_minutes, department_id, icon } = req.body;
        const [result] = await db.execute(
            'INSERT INTO services (name, description, price, duration_minutes, department_id, icon) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price || 0, duration_minutes || null, department_id || null, icon || 'fa-stethoscope']
        );
        res.json({ success: true, message: 'Service created', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { name, description, price, duration_minutes, department_id, icon, is_active } = req.body;
        await db.execute(
            'UPDATE services SET name=?, description=?, price=?, duration_minutes=?, department_id=?, icon=?, is_active=? WHERE id=?',
            [name, description, price || 0, duration_minutes || null, department_id || null, icon, is_active !== undefined ? is_active : 1, req.params.id]
        );
        res.json({ success: true, message: 'Service updated' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const deleteService = async (req, res) => {
    try {
        await db.execute('DELETE FROM services WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== NEWS =====
const getNews = async (req, res) => {
    try {
        const [news] = await db.execute(
            `SELECT n.*, u.full_name as author_name FROM news n 
             LEFT JOIN users u ON n.author_id=u.id ORDER BY n.created_at DESC`
        );
        res.json({ success: true, data: news });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const createNews = async (req, res) => {
    try {
        const { title, content, excerpt, category } = req.body;
        let image = null;
        if (req.file) image = '/images/uploads/' + req.file.filename;
        const [result] = await db.execute(
            'INSERT INTO news (title, content, excerpt, category, image, author_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, content, excerpt, category, image, req.session.user.id]
        );
        res.json({ success: true, message: 'News published', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const updateNews = async (req, res) => {
    try {
        const { title, content, excerpt, category, is_published } = req.body;
        let setClause = 'title=?, content=?, excerpt=?, category=?, is_published=?';
        let params = [title, content, excerpt, category, is_published !== undefined ? is_published : 1];
        if (req.file) { setClause += ', image=?'; params.push('/images/uploads/' + req.file.filename); }
        params.push(req.params.id);
        await db.execute(`UPDATE news SET ${setClause} WHERE id=?`, params);
        res.json({ success: true, message: 'News updated' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        await db.execute('DELETE FROM news WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'News deleted' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== HOSPITAL INFO =====
const getHospitalInfo = async (req, res) => {
    try {
        const [info] = await db.execute('SELECT * FROM hospital_info');
        const result = {};
        info.forEach(row => result[row.key] = row.value);
        res.json({ success: true, data: result });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const updateHospitalInfo = async (req, res) => {
    try {
        const updates = req.body;
        for (const [key, value] of Object.entries(updates)) {
            await db.execute(
                'INSERT INTO hospital_info (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value=?',
                [key, value, value]
            );
        }
        res.json({ success: true, message: 'Hospital information updated' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== TESTIMONIALS =====
const getTestimonials = async (req, res) => {
    try {
        const { approved } = req.query;
        let query = 'SELECT * FROM testimonials';
        if (approved !== undefined) query += ` WHERE is_approved=${approved}`;
        query += ' ORDER BY created_at DESC';
        const [testimonials] = await db.execute(query);
        res.json({ success: true, data: testimonials });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const approveTestimonial = async (req, res) => {
    try {
        await db.execute('UPDATE testimonials SET is_approved=1 WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Testimonial approved' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const deleteTestimonial = async (req, res) => {
    try {
        await db.execute('DELETE FROM testimonials WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Testimonial deleted' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== CONTACT MESSAGES =====
const getContactMessages = async (req, res) => {
    try {
        const [messages] = await db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json({ success: true, data: messages });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const markMessageRead = async (req, res) => {
    try {
        await db.execute('UPDATE contact_messages SET is_read=1 WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Message marked as read' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// ===== MEDICAL RECORDS =====
const getMedicalRecords = async (req, res) => {
    try {
        const patient_id = req.params.patient_id || req.session.user.id;
        const [records] = await db.execute(
            `SELECT mr.*, d.full_name as doctor_name, d.specialization 
             FROM medical_records mr 
             JOIN doctors d ON mr.doctor_id=d.id 
             WHERE mr.patient_id=? ORDER BY mr.record_date DESC`,
            [patient_id]
        );
        res.json({ success: true, data: records });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

const createMedicalRecord = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_id, diagnosis, prescription, test_results, notes, record_date } = req.body;
        const [result] = await db.execute(
            'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, test_results, notes, record_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_id || null, diagnosis, prescription, test_results, notes, record_date]
        );
        res.json({ success: true, message: 'Medical record added', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Contact form submission (public)
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        await db.execute(
            'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, subject, message]
        );
        res.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Submit testimonial (patient)
const submitTestimonial = async (req, res) => {
    try {
        const { content, rating } = req.body;
        const patient_name = req.session.user.full_name;
        await db.execute(
            'INSERT INTO testimonials (patient_id, patient_name, content, rating) VALUES (?, ?, ?, ?)',
            [req.session.user.id, patient_name, content, rating || 5]
        );
        res.json({ success: true, message: 'Thank you for your feedback! It will be reviewed and published soon.' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

module.exports = {
    getDashboardStats, getAllPatients, togglePatientStatus,
    getDepartments, createDepartment, updateDepartment, deleteDepartment,
    getServices, createService, updateService, deleteService,
    getNews, createNews, updateNews, deleteNews,
    getHospitalInfo, updateHospitalInfo,
    getTestimonials, approveTestimonial, deleteTestimonial,
    getContactMessages, markMessageRead,
    getMedicalRecords, createMedicalRecord,
    submitContact, submitTestimonial
};
