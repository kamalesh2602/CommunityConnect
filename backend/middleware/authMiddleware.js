const jwt = require('jsonwebtoken');
const Volunteer = require('../models/Volunteer');
const NGO = require('../models/NGO');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.role === 'admin') {
                req.user = { role: 'admin' };
                return next();
            } else if (decoded.role === 'volunteer') {
                req.user = await Volunteer.findById(decoded.id).select('-password');
                if (!req.user) throw new Error('Not found');
                req.user.role = 'volunteer';
                return next();
            } else if (decoded.role === 'ngo') {
                req.user = await NGO.findById(decoded.id).select('-password');
                if (!req.user) throw new Error('Not found');
                req.user.role = 'ngo';
                return next();
            }
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authVolunteer = (req, res, next) => {
    if (req.user && req.user.role === 'volunteer') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as Volunteer' });
    }
};

const authNGO = (req, res, next) => {
    if (req.user && req.user.role === 'ngo') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as NGO' });
    }
};

const authAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as Admin' });
    }
};

module.exports = { protect, authVolunteer, authNGO, authAdmin };
