-- =============================================
-- HOSPITAL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =============================================

CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Users table (both admin and patients)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'patient') DEFAULT 'patient',
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    profile_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    head_doctor_id INT,
    icon VARCHAR(50) DEFAULT 'fa-hospital',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT,
    specialization VARCHAR(150),
    qualification VARCHAR(200),
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    bio TEXT,
    profile_image VARCHAR(255),
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    available_time_start TIME DEFAULT '09:00:00',
    available_time_end TIME DEFAULT '17:00:00',
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    type ENUM('consultation', 'follow-up', 'emergency') DEFAULT 'consultation',
    symptoms TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_id INT,
    diagnosis TEXT,
    prescription TEXT,
    test_results TEXT,
    notes TEXT,
    record_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration_minutes INT,
    department_id INT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- News/Blog table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    excerpt TEXT,
    image VARCHAR(255),
    category VARCHAR(100),
    author_id INT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    patient_name VARCHAR(100),
    content TEXT NOT NULL,
    rating INT DEFAULT 5,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospital Info table
CREATE TABLE IF NOT EXISTS hospital_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- SEED DATA
-- =============================================

-- Default Admin User (password: Admin@123)
INSERT INTO users (full_name, email, password, role, phone) VALUES
('Hospital Admin', 'admin@hospital.com', '$2a$10$MQ4WW8oPSXI.6Hiz7moaSe/Tjz3TrVdrbmlptE/2xZPTR3PbZLRdC', 'admin', '01700000000');

-- Departments
INSERT INTO departments (name, description, icon) VALUES
('Cardiology', 'Expert care for heart and cardiovascular conditions', 'fa-heart'),
('Neurology', 'Advanced treatment for brain and nervous system disorders', 'fa-brain'),
('Orthopedics', 'Comprehensive bone, joint, and muscle care', 'fa-bone'),
('Pediatrics', 'Specialized healthcare for infants and children', 'fa-child'),
('Oncology', 'Cutting-edge cancer diagnosis and treatment', 'fa-ribbon'),
('Gynecology', 'Complete women\'s health and reproductive care', 'fa-venus'),
('Dermatology', 'Expert skin, hair, and nail treatments', 'fa-hand-sparkles'),
('Emergency', '24/7 emergency medical services', 'fa-ambulance');

-- Doctors
INSERT INTO doctors (full_name, email, phone, department_id, specialization, qualification, experience_years, consultation_fee, bio, available_days) VALUES
('Dr. Rahman Ahmed', 'rahman@hospital.com', '01711111111', 1, 'Interventional Cardiologist', 'MBBS, MD (Cardiology), FACC', 15, 1500, 'Dr. Rahman is a renowned cardiologist with 15 years of experience in interventional cardiology.', 'Mon,Tue,Wed,Thu,Fri'),
('Dr. Fatima Khan', 'fatima@hospital.com', '01722222222', 2, 'Senior Neurologist', 'MBBS, MD (Neurology), DM', 12, 1200, 'Dr. Fatima specializes in epilepsy, stroke management, and neurodegenerative diseases.', 'Sun,Mon,Tue,Wed,Thu'),
('Dr. Karim Hossain', 'karim@hospital.com', '01733333333', 3, 'Orthopedic Surgeon', 'MBBS, MS (Orthopedics)', 10, 1000, 'Dr. Karim is an expert in joint replacement surgeries and sports injuries.', 'Mon,Wed,Thu,Sat'),
('Dr. Nusrat Jahan', 'nusrat@hospital.com', '01744444444', 4, 'Pediatric Specialist', 'MBBS, DCH, MD (Pediatrics)', 8, 800, 'Dr. Nusrat provides comprehensive care for newborns to adolescents.', 'Sun,Mon,Tue,Wed,Thu,Fri'),
('Dr. Tanvir Islam', 'tanvir@hospital.com', '01755555555', 5, 'Oncologist', 'MBBS, MD (Oncology), MRCP', 14, 1800, 'Dr. Tanvir specializes in medical oncology with expertise in chemotherapy protocols.', 'Mon,Tue,Wed,Thu,Fri'),
('Dr. Sadia Akter', 'sadia@hospital.com', '01766666666', 6, 'Gynecologist & Obstetrician', 'MBBS, FCPS (Gynae)', 11, 1000, 'Dr. Sadia offers expert care in obstetrics, gynecology, and infertility treatment.', 'Sun,Mon,Tue,Wed,Thu');

-- Services
INSERT INTO services (name, description, price, duration_minutes, department_id, icon) VALUES
('ECG', 'Electrocardiogram for heart rhythm analysis', 500, 30, 1, 'fa-heartbeat'),
('MRI Scan', 'Magnetic Resonance Imaging for detailed body scans', 5000, 60, 2, 'fa-x-ray'),
('X-Ray', 'Digital X-Ray imaging services', 800, 20, 3, 'fa-film'),
('Blood Test', 'Complete blood count and analysis', 600, 15, NULL, 'fa-vial'),
('Ultrasound', 'Diagnostic ultrasound imaging', 2000, 45, 6, 'fa-wave-square'),
('CT Scan', 'Computed Tomography for cross-sectional imaging', 8000, 45, 2, 'fa-layer-group'),
('Physiotherapy', 'Physical rehabilitation and therapy sessions', 1000, 60, 3, 'fa-person-walking'),
('Emergency Care', '24/7 emergency medical treatment', 5000, NULL, 8, 'fa-truck-medical');

-- Hospital Info
INSERT INTO hospital_info (`key`, value) VALUES
('hospital_name', 'MediCare General Hospital'),
('hospital_tagline', 'Your Health, Our Priority'),
('address', '123 Medical Road, Dhaka-1205, Bangladesh'),
('phone', '+880 1700-000000'),
('emergency_phone', '+880 1700-999999'),
('email', 'info@medicare-hospital.com'),
('working_hours', 'Mon-Sat: 8:00 AM - 8:00 PM'),
('emergency_hours', '24/7 Emergency Services Available'),
('established_year', '1985'),
('beds_count', '500'),
('doctors_count', '150'),
('patients_served', '100000'),
('facebook', 'https://facebook.com'),
('twitter', 'https://twitter.com'),
('instagram', 'https://instagram.com');

-- News
INSERT INTO news (title, content, excerpt, category, author_id, is_published) VALUES
('New Advanced Cardiac Care Unit Inaugurated', 'We are proud to announce the opening of our state-of-the-art Cardiac Care Unit equipped with the latest technology to provide the best heart care services to our patients.', 'MediCare Hospital opens new Cardiac Care Unit with advanced equipment.', 'Hospital News', 1, TRUE),
('Free Health Camp This Weekend', 'Join us for a free health checkup camp this Saturday. Services include blood pressure monitoring, blood sugar testing, BMI calculation, and general physician consultation.', 'Free health checkup camp with multiple services available this weekend.', 'Events', 1, TRUE),
('COVID-19 Vaccination Drive Continues', 'Our hospital continues to provide COVID-19 vaccinations to all eligible individuals. Please bring your NID card and registration slip. No appointment needed.', 'Ongoing COVID-19 vaccination drive at our hospital premises.', 'Health Tips', 1, TRUE);

-- Testimonials
INSERT INTO testimonials (patient_name, content, rating, is_approved) VALUES
('Rahela Begum', 'The doctors and nurses here are incredibly caring. I received excellent treatment for my heart condition. Highly recommended!', 5, TRUE),
('Mohammad Ali', 'Very professional staff and modern facilities. My surgery went perfectly and the recovery support was outstanding.', 5, TRUE),
('Nasrin Akter', 'I bring my children here for all their healthcare needs. Dr. Nusrat is wonderful with kids. The hospital is clean and well-organized.', 5, TRUE);
