// ==========================================
// HOSPITAL MANAGEMENT - MAIN JS UTILITIES
// ==========================================

const API = '/api';

// ===== HTTP HELPERS =====
async function apiGet(endpoint) {
    const res = await fetch(API + endpoint, { credentials: 'include' });
    return res.json();
}

async function apiPost(endpoint, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(API + endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data)
    });
    return res.json();
}

async function apiPut(endpoint, data) {
    const isFormData = data instanceof FormData;
    const res = await fetch(API + endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data)
    });
    return res.json();
}

async function apiDelete(endpoint) {
    const res = await fetch(API + endpoint, { method: 'DELETE', credentials: 'include' });
    return res.json();
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== AUTH CHECK =====
async function checkAuth(requiredRole = null) {
    const res = await apiGet('/auth/me');
    if (!res.success) {
        window.location.href = '/login.html';
        return null;
    }
    if (requiredRole && res.user.role !== requiredRole) {
        window.location.href = res.user.role === 'admin' ? '/admin/dashboard.html' : '/patient/dashboard.html';
        return null;
    }
    return res.user;
}

// ===== LOGOUT =====
async function logout() {
    await apiPost('/auth/logout', {});
    window.location.href = '/login.html';
}

// ===== FORMAT HELPERS =====
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatCurrency(amount) {
    return '৳' + parseFloat(amount || 0).toLocaleString();
}

function getStatusBadge(status) {
    const map = {
        pending: 'badge-warning',
        confirmed: 'badge-info',
        completed: 'badge-success',
        cancelled: 'badge-danger'
    };
    return `<span class="badge ${map[status] || 'badge-primary'}">${capitalize(status)}</span>`;
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function getInitials(name) {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
}

function getDoctorAvatar(doc) {
    if (doc.profile_image) return `<img src="${doc.profile_image}" alt="${doc.full_name}">`;
    return `<i class="fas fa-user-md placeholder-icon"></i>`;
}

// ===== NAVBAR =====
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    }

    // Active link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === path || link.getAttribute('href') === path.split('/').pop()) {
            link.classList.add('active');
        }
    });
}

// ===== USER MENU UPDATE =====
async function updateNavUser() {
    const res = await apiGet('/auth/me');
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (res.success) {
        const user = res.user;
        navActions.innerHTML = `
            <a href="${user.role === 'admin' ? '/admin/dashboard.html' : '/patient/dashboard.html'}" class="btn btn-primary btn-sm">
                <i class="fas fa-user"></i> ${user.full_name.split(' ')[0]}
            </a>
            <button onclick="logout()" class="btn btn-outline btn-sm">Logout</button>
        `;
    } else {
        navActions.innerHTML = `
            <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
            <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
        `;
    }
}

// ===== STAR RATING =====
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fa${i <= rating ? 's' : 'r'} fa-star"></i>`;
    }
    return stars;
}

// ===== MODAL HELPERS =====
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    updateNavUser();
});
