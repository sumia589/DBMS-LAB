# 🏥 MediCare Hospital Management System

A full-stack Hospital Management System with separate Admin and Patient portals, built with **Node.js, Express, MySQL, and Vanilla JavaScript**.

## ✨ Features

### Public Website
- Beautiful, responsive homepage with hero section, departments, doctors, services, news, testimonials
- Doctor directory with search & department filter
- Services listing with pricing
- About Us page with hospital history
- Contact page with working contact form
- News & Events page

### Patient Portal
- Register / Login
- Book appointments (select doctor → date → time slot → confirm)
- View & cancel my appointments
- View medical records (diagnosis, prescription, test results)
- Edit profile & change password

### Admin Portal
- Dashboard with stats (patients, doctors, appointments, revenue trends)
- Manage Doctors (add/edit/remove, photo upload, schedule, fees)
- Manage Patients (view, activate/deactivate)
- Manage Appointments (confirm/cancel/complete, add notes)
- Manage Departments
- Manage Services & pricing
- Manage Medical Records
- Manage News/Events (with images)
- Manage Testimonials (approve/delete)
- View Contact Messages
- Update Hospital Settings (name, contact info, social links)

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (no framework needed)
- **Auth:** Sessions with bcrypt password hashing
- **File uploads:** Multer

---

## 📋 Prerequisites (যা যা ইনস্টল থাকতে হবে)

আপনার ল্যাপটপে এই জিনিসগুলো ইনস্টল থাকতে হবে:

1. **Node.js** (v16 অথবা তার বেশি ভার্সন)
   - ডাউনলোড করুন: https://nodejs.org (LTS version নিন)
   - ইনস্টল করার পর চেক করুন টার্মিনালে: `node -v` এবং `npm -v`

2. **MySQL** (v8.0 অথবা তার বেশি)
   - ডাউনলোড করুন: https://dev.mysql.com/downloads/installer/
   - অথবা **XAMPP** ইনস্টল করতে পারেন (সহজ): https://www.apachefriends.org/ — এতে MySQL + phpMyAdmin দুটোই থাকে
   - ইনস্টলের সময় root password সেট করুন (মনে রাখবেন!)

3. **VS Code** (আপনার যেটা আছে)
   - Extension: "Live Server" লাগবে না, কারণ আমরা Node.js সার্ভার রান করব
   - ভালো extension: "MySQL" বা "Database Client" (ডাটাবেস দেখার জন্য, optional)

---

## 🚀 Setup Steps (ধাপে ধাপে সেটআপ)

### Step 1: Project Extract করুন
ZIP ফাইলটি extract করে VS Code এ ফোল্ডারটি ওপেন করুন:
```
File > Open Folder > hospital-management
```

### Step 2: Database তৈরি করুন

**Option A: MySQL Command Line / Workbench দিয়ে**
1. MySQL সার্ভার চালু করুন
2. Terminal/Command Prompt খুলে লগইন করুন:
   ```bash
   mysql -u root -p
   ```
3. পাসওয়ার্ড দিন, তারপর schema ফাইলটি import করুন:
   ```bash
   source path/to/hospital-management/database/schema.sql
   ```
   অথবা সরাসরি:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

**Option B: phpMyAdmin (XAMPP) দিয়ে**
1. XAMPP Control Panel থেকে Apache ও MySQL স্টার্ট করুন
2. ব্রাউজারে যান: `http://localhost/phpmyadmin`
3. "Import" ট্যাবে ক্লিক করুন
4. `database/schema.sql` ফাইলটি সিলেক্ট করে "Go" চাপুন

এতে `hospital_db` নামে ডাটাবেস তৈরি হবে এবং সব টেবিল + ডেমো ডেটা (ডাক্তার, ডিপার্টমেন্ট, সার্ভিস) যুক্ত হয়ে যাবে।

### Step 3: Backend Configure করুন

`backend/.env` ফাইলটি ওপেন করুন এবং আপনার MySQL পাসওয়ার্ড দিয়ে আপডেট করুন:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=আপনার_মাইএসকিউএল_পাসওয়ার্ড_এখানে_দিন
DB_NAME=hospital_db
DB_PORT=3306
PORT=3000
SESSION_SECRET=hospital_secret_key_2024_secure
```

> ⚠️ যদি আপনার MySQL এর root password না থাকে (blank), তাহলে `DB_PASSWORD=` খালি রাখুন।

### Step 4: Dependencies Install করুন

VS Code এর Terminal খুলুন (`Ctrl + ~` অথবা Terminal > New Terminal), তারপর backend ফোল্ডারে যান:

```bash
cd backend
npm install
```

এটি `package.json` থেকে সব প্রয়োজনীয় প্যাকেজ (express, mysql2, bcryptjs, multer ইত্যাদি) ইনস্টল করবে।

### Step 5: সার্ভার চালু করুন

```bash
npm start
```

অথবা ডেভেলপমেন্ট মোডে (auto-restart on file changes):
```bash
npm run dev
```

সফল হলে দেখবেন:
```
✅ Database connected successfully
╔════════════════════════════════════════╗
║   🏥 HOSPITAL MANAGEMENT SYSTEM        ║
║   Server running successfully!          ║
║   URL: http://localhost:3000           ║
║   Admin: admin@hospital.com             ║
║   Pass:  Admin@123                      ║
╚════════════════════════════════════════╝
```

### Step 6: ব্রাউজারে ওপেন করুন

```
http://localhost:3000
```

---

## 🔑 Default Login Credentials

### Admin Login
- **URL:** http://localhost:3000/login.html (Admin ট্যাব সিলেক্ট করুন)
- **Email:** admin@hospital.com
- **Password:** Admin@123

### Patient Login
- নতুন patient account তৈরি করতে **Register** পেজ থেকে registration করুন
- তারপর সেই email/password দিয়ে login করুন

---

## 📁 Project Structure

```
hospital-management/
├── backend/
│   ├── config/database.js          # MySQL connection
│   ├── controllers/                # Business logic
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   └── adminController.js
│   ├── middleware/auth.js          # Session-based auth guards
│   ├── routes/index.js             # All API routes
│   ├── server.js                   # Main entry point
│   ├── package.json
│   └── .env                        # Database credentials (EDIT THIS)
├── frontend/
│   ├── index.html                  # Homepage
│   ├── login.html / register.html
│   ├── doctors.html / services.html / about.html / contact.html / news.html
│   ├── appointments.html           # Booking page
│   ├── admin/                      # Admin dashboard pages
│   ├── patient/                    # Patient dashboard pages
│   ├── css/style.css + admin.css
│   ├── js/main.js                  # Shared frontend logic
│   └── images/uploads/             # Uploaded photos (auto-created)
└── database/
    └── schema.sql                  # Full DB schema + seed data
```

---

## ❓ Common Problems & সমাধান

**Problem: "Database connection failed"**
→ `.env` ফাইলে DB_PASSWORD ঠিক আছে কিনা চেক করুন। MySQL সার্ভিস চালু আছে কিনা দেখুন (XAMPP হলে Control Panel থেকে MySQL Start করুন)।

**Problem: "Port 3000 already in use"**
→ `.env` ফাইলে `PORT=3000` কে `PORT=3001` বা অন্য কোনো নাম্বারে পরিবর্তন করুন।

**Problem: "npm install" এ error আসছে**
→ Node.js ভার্সন চেক করুন (`node -v`)। v16+ থাকা জরুরি। প্রয়োজনে Node.js পুনরায় ইনস্টল করুন।

**Problem: ছবি আপলোড হচ্ছে না**
→ `frontend/images/uploads` ফোল্ডার অটো তৈরি হয়ে যাবে প্রথম আপলোডের সময়, কিন্তু পারমিশন সমস্যা হলে ম্যানুয়ালি ফোল্ডারটি তৈরি করে দিন।

**Problem: Login করার পরও redirect হচ্ছে না**
→ ব্রাউজারে cookies enabled আছে কিনা চেক করুন; Incognito/Private mode কিছু ক্ষেত্রে session cookie ব্লক করতে পারে।

---

## 🎨 Customization Tips

- হাসপাতালের নাম, ঠিকানা, ফোন নাম্বার ইত্যাদি পরিবর্তন করতে: **Admin Panel → Hospital Settings**
- রঙ (theme color) পরিবর্তন করতে: `frontend/css/style.css` ফাইলের শুরুতে `:root { --primary: ... }` ভ্যারিয়েবলগুলো এডিট করুন
- নতুন ডিপার্টমেন্ট/ডাক্তার/সার্ভিস যুক্ত করতে Admin Panel ব্যবহার করুন — কোড এডিট করার দরকার নেই

---

## 📜 License

Free to use and modify for personal, academic, or commercial projects.

---

**তৈরি করেছেন Claude (Anthropic) — আপনার hospital management project এর জন্য। কোনো সমস্যা হলে error message সহ জিজ্ঞেস করুন!**
