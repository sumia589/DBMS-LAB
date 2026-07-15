const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { isAuthenticated, isAdmin, isPatient } = require('../middleware/auth');
const authController = require('../controllers/authController');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const adminController = require('../controllers/adminController');

// Multer setup
const uploadDir = path.join(__dirname, '../../frontend/images/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== AUTH ROUTES =====
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.getMe);
router.put('/auth/profile', isAuthenticated, upload.single('profile_image'), authController.updateProfile);
router.put('/auth/change-password', isAuthenticated, authController.changePassword);

// ===== PUBLIC ROUTES =====
router.get('/doctors', doctorController.getAllDoctors);
router.get('/doctors/:id', doctorController.getDoctorById);
router.get('/departments', adminController.getDepartments);
router.get('/services', adminController.getServices);
router.get('/news', adminController.getNews);
router.get('/testimonials', adminController.getTestimonials);
router.get('/hospital-info', adminController.getHospitalInfo);
router.post('/contact', adminController.submitContact);
router.get('/appointments/slots', appointmentController.getAvailableSlots);

// ===== PATIENT ROUTES =====
router.post('/appointments', isAuthenticated, appointmentController.bookAppointment);
router.get('/my-appointments', isAuthenticated, appointmentController.getMyAppointments);
router.put('/appointments/:id/cancel', isAuthenticated, appointmentController.cancelAppointment);
router.get('/my-records', isAuthenticated, adminController.getMedicalRecords);
router.post('/testimonials', isAuthenticated, adminController.submitTestimonial);

// ===== ADMIN ROUTES =====
router.get('/admin/dashboard', isAdmin, adminController.getDashboardStats);

// Doctors management
router.post('/admin/doctors', isAdmin, upload.single('profile_image'), doctorController.createDoctor);
router.put('/admin/doctors/:id', isAdmin, upload.single('profile_image'), doctorController.updateDoctor);
router.delete('/admin/doctors/:id', isAdmin, doctorController.deleteDoctor);

// Patients management
router.get('/admin/patients', isAdmin, adminController.getAllPatients);
router.put('/admin/patients/:id/toggle', isAdmin, adminController.togglePatientStatus);

// Appointments management
router.get('/admin/appointments', isAdmin, appointmentController.getAllAppointments);
router.put('/admin/appointments/:id', isAdmin, appointmentController.updateAppointmentStatus);

// Departments management
router.post('/admin/departments', isAdmin, adminController.createDepartment);
router.put('/admin/departments/:id', isAdmin, adminController.updateDepartment);
router.delete('/admin/departments/:id', isAdmin, adminController.deleteDepartment);

// Services management
router.post('/admin/services', isAdmin, adminController.createService);
router.put('/admin/services/:id', isAdmin, adminController.updateService);
router.delete('/admin/services/:id', isAdmin, adminController.deleteService);

// News management
router.post('/admin/news', isAdmin, upload.single('image'), adminController.createNews);
router.put('/admin/news/:id', isAdmin, upload.single('image'), adminController.updateNews);
router.delete('/admin/news/:id', isAdmin, adminController.deleteNews);

// Hospital info
router.put('/admin/hospital-info', isAdmin, adminController.updateHospitalInfo);

// Testimonials
router.put('/admin/testimonials/:id/approve', isAdmin, adminController.approveTestimonial);
router.delete('/admin/testimonials/:id', isAdmin, adminController.deleteTestimonial);

// Contact messages
router.get('/admin/messages', isAdmin, adminController.getContactMessages);
router.put('/admin/messages/:id/read', isAdmin, adminController.markMessageRead);

// Medical records
router.get('/admin/records/:patient_id', isAdmin, adminController.getMedicalRecords);
router.post('/admin/records', isAdmin, adminController.createMedicalRecord);

module.exports = router;
