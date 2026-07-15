// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: 'Please login to continue' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Admin access required' });
};

const isPatient = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'patient') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Patient access required' });
};

module.exports = { isAuthenticated, isAdmin, isPatient };
