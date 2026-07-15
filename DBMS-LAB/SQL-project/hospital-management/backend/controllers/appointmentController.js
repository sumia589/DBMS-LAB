const db = require('../config/database');

// Book appointment (patient)
const bookAppointment = async (req, res) => {
    try {
        const patient_id = req.session.user.id;
        const { doctor_id, appointment_date, appointment_time, type, symptoms } = req.body;

        // Check slot availability
        const [existing] = await db.execute(
            'SELECT id FROM appointments WHERE doctor_id=? AND appointment_date=? AND appointment_time=? AND status != "cancelled"',
            [doctor_id, appointment_date, appointment_time]
        );
        if (existing.length > 0) return res.json({ success: false, message: 'This time slot is already booked' });

        const [result] = await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, type, symptoms) VALUES (?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, type || 'consultation', symptoms || null]
        );
        res.json({ success: true, message: 'Appointment booked successfully!', id: result.insertId });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Get patient's appointments
const getMyAppointments = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            `SELECT a.*, d.full_name as doctor_name, d.specialization, d.profile_image as doctor_image,
             dept.name as department_name
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             LEFT JOIN departments dept ON d.department_id = dept.id
             WHERE a.patient_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
            [req.session.user.id]
        );
        res.json({ success: true, data: appointments });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Get all appointments (admin)
const getAllAppointments = async (req, res) => {
    try {
        const { status, date, doctor_id } = req.query;
        let query = `SELECT a.*, u.full_name as patient_name, u.phone as patient_phone,
                     d.full_name as doctor_name, d.specialization
                     FROM appointments a
                     JOIN users u ON a.patient_id = u.id
                     JOIN doctors d ON a.doctor_id = d.id
                     WHERE 1=1`;
        const params = [];

        if (status) { query += ' AND a.status = ?'; params.push(status); }
        if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
        if (doctor_id) { query += ' AND a.doctor_id = ?'; params.push(doctor_id); }

        query += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

        const [appointments] = await db.execute(query, params);
        res.json({ success: true, data: appointments });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Update appointment status (admin)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        await db.execute('UPDATE appointments SET status=?, notes=? WHERE id=?',
            [status, notes || null, req.params.id]);
        res.json({ success: true, message: 'Appointment updated' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Cancel appointment (patient)
const cancelAppointment = async (req, res) => {
    try {
        const [appt] = await db.execute('SELECT * FROM appointments WHERE id=? AND patient_id=?',
            [req.params.id, req.session.user.id]);
        if (appt.length === 0) return res.json({ success: false, message: 'Appointment not found' });
        if (appt[0].status === 'completed') return res.json({ success: false, message: 'Cannot cancel completed appointment' });

        await db.execute('UPDATE appointments SET status="cancelled" WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

// Get available time slots
const getAvailableSlots = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;
        const [doctor] = await db.execute('SELECT * FROM doctors WHERE id=?', [doctor_id]);
        if (doctor.length === 0) return res.json({ success: false, message: 'Doctor not found' });

        const doc = doctor[0];
        const [bookedSlots] = await db.execute(
            'SELECT appointment_time FROM appointments WHERE doctor_id=? AND appointment_date=? AND status != "cancelled"',
            [doctor_id, date]
        );
        const booked = bookedSlots.map(s => s.appointment_time.substring(0, 5));

        // Generate 30-min slots
        const slots = [];
        let start = new Date(`2000-01-01 ${doc.available_time_start}`);
        const end = new Date(`2000-01-01 ${doc.available_time_end}`);

        while (start < end) {
            const timeStr = start.toTimeString().substring(0, 5);
            slots.push({ time: timeStr, available: !booked.includes(timeStr) });
            start.setMinutes(start.getMinutes() + 30);
        }

        res.json({ success: true, data: slots });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
};

module.exports = { bookAppointment, getMyAppointments, getAllAppointments, updateAppointmentStatus, cancelAppointment, getAvailableSlots };
